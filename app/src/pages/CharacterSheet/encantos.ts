// Rituais que encantam uma arma (pedido da Millie em 05/10). Quem conjura escolhe a arma (a
// própria ou a de um aliado) e o efeito entra sozinho nos ataques com ela, até alguém encerrar.

export type Encanto = {
  id?: string
  ritual: string
  nome: string // "Amaldiçoar Arma (Discente)"
  por?: string // quem conjurou
  por_ficha?: string
  dano?: { formula: string; tipo: string }
  ataque?: number // +X no teste de ataque
  margem?: number // +X na margem de ameaça
  multiplicador?: number // +X no multiplicador de crítico
}

export type Modo = 'normal' | 'discente' | 'verdadeiro'

// Que arma cada ritual aceita.
export type AlvoDoEncanto = 'corpo_a_corpo' | 'corpo_a_corpo_ou_municao'

type Regra = { alvo: AlvoDoEncanto; escolheElemento: boolean; efeito: (modo: Modo, elemento: string) => Omit<Encanto, 'ritual' | 'nome'> | null }

const ELEMENTOS_AMALDICOAR = ['Conhecimento', 'Energia', 'Morte', 'Sangue']

const REGRAS: Record<string, Regra> = {
  // +1d6 do elemento escolhido; Discente +2d6; Verdadeiro +4d6.
  'amaldicoar arma': {
    alvo: 'corpo_a_corpo_ou_municao',
    escolheElemento: true,
    efeito: (modo, elemento) => ({ dano: { formula: modo === 'verdadeiro' ? '4d6' : modo === 'discente' ? '2d6' : '1d6', tipo: elemento } }),
  },
  // +2 no ataque e +1 na margem; Discente +5 no ataque; Verdadeiro +5, +2 na margem e no multiplicador.
  'arma atroz': {
    alvo: 'corpo_a_corpo',
    escolheElemento: false,
    efeito: (modo) =>
      modo === 'verdadeiro' ? { ataque: 5, margem: 2, multiplicador: 2 } : modo === 'discente' ? { ataque: 5, margem: 1 } : { ataque: 2, margem: 1 },
  },
  // Chamejar: a arma causa +1d6 de fogo (Discente e Verdadeiro trocam o efeito inteiro).
  'chamas do caos': {
    alvo: 'corpo_a_corpo',
    escolheElemento: false,
    efeito: (modo) => (modo === 'normal' ? { dano: { formula: '1d6', tipo: 'Fogo' } } : null),
  },
}

function chave(nome: string) {
  return nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function regraDoRitual(nome: string): (Regra & { elementos: string[] }) | null {
  const r = REGRAS[chave(nome)]
  return r ? { ...r, elementos: r.escolheElemento ? ELEMENTOS_AMALDICOAR : [] } : null
}

const ROTULO_MODO: Record<Modo, string> = { normal: '', discente: ' (Discente)', verdadeiro: ' (Verdadeiro)' }

export function encantoDoRitual(nome: string, modo: Modo, elemento = ''): Encanto | null {
  const r = REGRAS[chave(nome)]
  const efeito = r?.efeito(modo, elemento)
  if (!r || !efeito) return null
  return { ritual: nome, nome: `${nome}${ROTULO_MODO[modo]}${elemento ? ` — ${elemento}` : ''}`, ...efeito }
}

// "+2d6 Morte", "+5 no ataque, +1 na margem".
export function textoDoEncanto(e: Encanto): string {
  const partes = [
    e.dano ? `+${e.dano.formula} ${e.dano.tipo}` : '',
    e.ataque ? `+${e.ataque} no ataque` : '',
    e.margem ? `+${e.margem} na margem de ameaça` : '',
    e.multiplicador ? `+${e.multiplicador} no multiplicador` : '',
  ].filter(Boolean)
  return partes.join(', ')
}

export function armaServe(alvo: AlvoDoEncanto, item: { tipo: string | null; natureza: string | null }): boolean {
  if (item.tipo === 'municao') return alvo === 'corpo_a_corpo_ou_municao'
  return item.tipo === 'arma' && item.natureza === 'corpo_a_corpo'
}

// Os números do ataque com os encantos da arma (e da munição) somados.
export function numerosComEncantos<T extends { d20_bonus: number; threat_margin: number; multiplier: number; damage: { formula: string; tipo: string }[] }>(
  ataque: T,
  encantos: Encanto[],
): T {
  if (!encantos.length) return ataque
  return {
    ...ataque,
    d20_bonus: ataque.d20_bonus + encantos.reduce((s, e) => s + (e.ataque ?? 0), 0),
    // Margem de ameaça maior = o crítico começa num número menor do d20 (nunca abaixo de 1).
    threat_margin: Math.max(1, ataque.threat_margin - encantos.reduce((s, e) => s + (e.margem ?? 0), 0)),
    multiplier: ataque.multiplier + encantos.reduce((s, e) => s + (e.multiplicador ?? 0), 0),
    damage: [...ataque.damage, ...encantos.flatMap((e) => (e.dano ? [{ formula: e.dano.formula, tipo: e.dano.tipo }] : []))],
  }
}
