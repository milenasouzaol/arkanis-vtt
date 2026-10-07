// Condições que mexem na ficha automaticamente (pedido da Millie, 05/10). Abalado, Apavorado,
// Agarrado e Enredado também entram aqui (07/10: antes ficavam numa tabela que a ficha não lia).
//
// O que dá pra automatizar: dados a menos em testes de certos atributos/perícias/ataques, a
// Defesa e o custo de rituais. O que depende de turno (dano no início do turno, rolar 1d6 no
// Confuso…) ou do mestre decidir (fugir, não poder agir) fica manual.

export type ContextoDoTeste = {
  // atributo do teste: 'forca' | 'agilidade' | 'intelecto' | 'vigor' | 'presenca'
  atributo: string | null
  pericia?: string | null
  ataque?: 'corpo' | 'distancia' | null
}

type Regra = {
  dados: number
  todos?: boolean // qualquer teste (perícia, atributo, ataque, ritual)
  atributos?: string[]
  pericias?: string[]
  ataque?: 'qualquer' | 'corpo'
}

const FISICOS = ['agilidade', 'forca', 'vigor']
const MENTAIS = ['intelecto', 'presenca']

const REGRAS: Record<string, Regra[]> = {
  Abalado: [{ dados: -1, todos: true }],
  Apavorado: [{ dados: -2, todos: true }],
  Enredado: [{ dados: -1, ataque: 'qualquer' }],
  Frustrado: [{ dados: -1, atributos: MENTAIS }],
  Esmorecido: [{ dados: -2, atributos: MENTAIS }],
  Fraco: [{ dados: -1, atributos: FISICOS }],
  Debilitado: [{ dados: -2, atributos: FISICOS }],
  // Fatigado = fraco + vulnerável; Exausto = debilitado + lento + vulnerável
  Fatigado: [{ dados: -1, atributos: FISICOS }],
  Exausto: [{ dados: -2, atributos: FISICOS }],
  // Cego: -2d20 nas perícias de Agilidade e Força, e fica desprevenido (-1d20 Reflexos)
  Cego: [{ dados: -2, atributos: ['agilidade', 'forca'] }, { dados: -1, pericias: ['Reflexos'] }],
  Desprevenido: [{ dados: -1, pericias: ['Reflexos'] }],
  Agarrado: [{ dados: -1, pericias: ['Reflexos'] }, { dados: -1, ataque: 'qualquer' }],
  Atordoado: [{ dados: -1, pericias: ['Reflexos'] }],
  Surpreendido: [{ dados: -1, pericias: ['Reflexos'] }],
  Fascinado: [{ dados: -2, pericias: ['Percepção'] }],
  Ofuscado: [{ dados: -1, pericias: ['Percepção'] }, { dados: -1, ataque: 'qualquer' }],
  Surdo: [{ dados: -2, pericias: ['Iniciativa'] }],
  Caído: [{ dados: -2, ataque: 'corpo' }],
  // Efeitos (inimigos, extras) que mexem em dado; o resto é dano/ação que o mestre aplica.
  'Fortalecimento Paranormal': [{ dados: 1, atributos: FISICOS }],
  Guerrilheiro: [{ dados: 1, ataque: 'qualquer' }],
  'Sugada Mortal': [{ dados: -2, atributos: FISICOS }], // debilitado
}

function normalizar(t: string) {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function vale(r: Regra, c: ContextoDoTeste): boolean {
  if (r.todos) return true
  if (r.ataque) return !!c.ataque && (r.ataque === 'qualquer' || r.ataque === c.ataque)
  if (r.pericias) return !!c.pericia && r.pericias.some((p) => normalizar(p) === normalizar(c.pericia!))
  if (r.atributos) return !!c.atributo && r.atributos.includes(c.atributo)
  return false
}

// Dados a menos (ou a mais) num teste por causa das condições, e o porquê, pra mostrar na rolagem.
export function penalidadeDeCondicoes(condicoes: string[] | null | undefined, c: ContextoDoTeste): { dados: number; motivos: string[] } {
  let dados = 0
  const motivos: string[] = []
  for (const nome of new Set(condicoes ?? [])) {
    const soma = (REGRAS[nome] ?? []).filter((r) => vale(r, c)).reduce((s, r) => s + r.dados, 0)
    if (soma) {
      dados += soma
      motivos.push(`${nome} ${soma > 0 ? '+' : ''}${soma}d20`)
    }
  }
  return { dados, motivos }
}

// Defesa (12/livro): vulnerável -2; desprevenido -5; indefeso -10 (no lugar do desprevenido).
const VULNERAVEL = ['Vulnerável', 'Fatigado', 'Exausto', 'Enredado']
const DESPREVENIDO = ['Desprevenido', 'Agarrado', 'Cego', 'Atordoado', 'Surpreendido']
const INDEFESO = ['Indefeso', 'Inconsciente', 'Paralisado', 'Petrificado']

export function defesaDeCondicoes(condicoes: string[] | null | undefined): { valor: number; motivos: string[] } {
  const tem = new Set(condicoes ?? [])
  const motivos: string[] = []
  let valor = 0
  const vulneravel = VULNERAVEL.find((n) => tem.has(n))
  if (vulneravel) {
    valor -= 2
    motivos.push(`${vulneravel} -2`)
  }
  const indefeso = INDEFESO.find((n) => tem.has(n))
  const desprevenido = DESPREVENIDO.find((n) => tem.has(n))
  if (indefeso) {
    valor -= 10
    motivos.push(`${indefeso} -10`)
  } else if (desprevenido) {
    valor -= 5
    motivos.push(`${desprevenido} -5`)
  }
  return { valor, motivos }
}

// Alquebrado: habilidades e rituais custam +1 PE.
export function custoExtraDeCondicoes(condicoes: string[] | null | undefined): number {
  return (condicoes ?? []).includes('Alquebrado') ? 1 : 0
}

// "Teste de Diplomacia" → "Teste de Diplomacia (Frustrado -1d20)".
export function rotuloComCondicoes(rotulo: string, motivos: string[]): string {
  return motivos.length ? `${rotulo} (${motivos.join(', ')})` : rotulo
}
