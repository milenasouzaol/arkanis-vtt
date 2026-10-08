import type { ContextoDoTeste } from './condicoes'

// Efeitos escolhidos na mão (pedido da Millie, 08/10): ao criar uma condição, maldição ou
// modificação personalizada, a pessoa escolhe o que ela mexe (Defesa, uma perícia, testes de
// resistência…), se é em valor (+2) ou em dados (-1d20) e, no item, se só vale quando ligada.
// A ficha aplica sozinha; o texto livre continua só como descrição.

export type AlvoDoEfeito =
  | 'defesa' | 'todos_testes' | 'resistencias' | 'pericia' | 'atributo'
  | 'ataque' | 'dano' | 'margem' | 'pv' | 'pe' | 'custo_ritual'

export type EfeitoEscolhido = {
  alvo: AlvoDoEfeito
  qual?: string | null // nome da perícia, ou a chave do atributo
  modo: 'valor' | 'dados'
  valor: number
  ligavel?: boolean // item: só vale quando a pessoa liga
}

export type CondicaoPersonalizada = { nome: string; descricao?: string; icone?: string; efeitos: EfeitoEscolhido[] }

export type Contexto = 'condicao' | 'item'

type InfoDoAlvo = { id: AlvoDoEfeito; rotulo: string; modos: Record<Contexto, ('valor' | 'dados')[]>; qual?: 'pericia' | 'atributo'; ligavel?: boolean }

export const ALVOS: InfoDoAlvo[] = [
  { id: 'defesa', rotulo: 'Defesa', modos: { condicao: ['valor'], item: ['valor'] } },
  { id: 'todos_testes', rotulo: 'Todos os testes', modos: { condicao: ['dados', 'valor'], item: ['valor'] }, ligavel: true },
  { id: 'resistencias', rotulo: 'Testes de resistência', modos: { condicao: ['dados', 'valor'], item: ['valor'] }, ligavel: true },
  { id: 'pericia', rotulo: 'Uma perícia', modos: { condicao: ['dados', 'valor'], item: ['valor'] }, qual: 'pericia', ligavel: true },
  // Na condição: testes do atributo. No item: o valor do atributo.
  { id: 'atributo', rotulo: 'Atributo', modos: { condicao: ['dados', 'valor'], item: ['valor'] }, qual: 'atributo', ligavel: true },
  { id: 'ataque', rotulo: 'Testes de ataque', modos: { condicao: ['dados', 'valor'], item: ['valor'] } },
  { id: 'dano', rotulo: 'Dano', modos: { condicao: [], item: ['valor', 'dados'] } },
  { id: 'margem', rotulo: 'Margem de ameaça', modos: { condicao: [], item: ['valor'] } },
  { id: 'pv', rotulo: 'PV máximo', modos: { condicao: [], item: ['valor'] }, ligavel: true },
  { id: 'pe', rotulo: 'PE máximo', modos: { condicao: [], item: ['valor'] }, ligavel: true },
  { id: 'custo_ritual', rotulo: 'Custo de rituais (PE)', modos: { condicao: ['valor'], item: [] } },
]

export const ATRIBUTOS_DO_EFEITO = [
  { id: 'forca', rotulo: 'Força' },
  { id: 'agilidade', rotulo: 'Agilidade' },
  { id: 'intelecto', rotulo: 'Intelecto' },
  { id: 'vigor', rotulo: 'Vigor' },
  { id: 'presenca', rotulo: 'Presença' },
]

export const RESISTENCIAS = ['Fortitude', 'Reflexos', 'Vontade']

export const alvosDoContexto = (c: Contexto) => ALVOS.filter((a) => a.modos[c].length > 0)
export const infoDoAlvo = (id: AlvoDoEfeito) => ALVOS.find((a) => a.id === id)!

const sinal = (v: number) => `${v > 0 ? '+' : ''}${v}`

// "-1d20 em Furtividade", "+5 Defesa", "+1 dado de dano".
export function textoDoEfeito(e: EfeitoEscolhido): string {
  const n = e.modo === 'dados' ? (e.alvo === 'dano' ? `${sinal(e.valor)} dado${Math.abs(e.valor) === 1 ? '' : 's'}` : `${sinal(e.valor)}d20`) : sinal(e.valor)
  const atributo = ATRIBUTOS_DO_EFEITO.find((a) => a.id === e.qual)?.rotulo
  const onde: Record<AlvoDoEfeito, string> = {
    defesa: 'Defesa',
    todos_testes: 'em todos os testes',
    resistencias: 'em testes de resistência',
    pericia: `em ${e.qual || 'perícia'}`,
    atributo: e.modo === 'dados' ? `em testes de ${atributo ?? 'atributo'}` : atributo ?? 'atributo',
    ataque: 'em testes de ataque',
    dano: e.modo === 'dados' ? 'de dano' : 'em rolagens de dano',
    margem: 'em margem de ameaça',
    pv: 'PV máximo',
    pe: 'PE máximo',
    custo_ritual: 'PE no custo de rituais',
  }
  return `${n} ${onde[e.alvo]}${e.ligavel ? ' (quando ligado)' : ''}`
}

export const resumoDosEfeitos = (lista: EfeitoEscolhido[] | undefined) => (lista ?? []).filter((e) => e.valor).map(textoDoEfeito).join('; ')

const normalizar = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Perícias que o efeito atinge (no item, os bônus de perícia viram a lista delas).
export function periciasDoEfeito(e: EfeitoEscolhido, todas: string[]): string[] {
  if (e.alvo === 'pericia') return e.qual ? [e.qual] : []
  if (e.alvo === 'resistencias') return RESISTENCIAS
  if (e.alvo === 'todos_testes') return todas
  return []
}

// O efeito de uma condição vale neste teste?
export function valeNoTeste(e: EfeitoEscolhido, c: ContextoDoTeste): boolean {
  switch (e.alvo) {
    case 'todos_testes': return true
    case 'resistencias': return !!c.pericia && RESISTENCIAS.some((r) => normalizar(r) === normalizar(c.pericia!))
    case 'pericia': return !!c.pericia && !!e.qual && normalizar(e.qual) === normalizar(c.pericia)
    case 'atributo': return !!c.atributo && c.atributo === e.qual
    case 'ataque': return !!c.ataque
    default: return false
  }
}

// Lê a lista guardada no banco sem confiar no formato (coluna jsonb).
export function lerCondicoesPersonalizadas(v: unknown): CondicaoPersonalizada[] {
  if (!Array.isArray(v)) return []
  return v.filter((c) => c && typeof c.nome === 'string').map((c) => ({
    nome: c.nome,
    descricao: typeof c.descricao === 'string' ? c.descricao : undefined,
    icone: typeof c.icone === 'string' ? c.icone : undefined,
    efeitos: Array.isArray(c.efeitos) ? c.efeitos.filter((e: any) => e && ALVOS.some((a) => a.id === e.alvo) && Number.isFinite(Number(e.valor))).map((e: any) => ({ ...e, valor: Number(e.valor) })) : [],
  }))
}
