/*
 * Regras da aba de Progressao que nao dependem de tela: os niveis de NEX, o que cada
 * texto de ganho da tabela da classe significa e o estado de cada nivel.
 */

/** 5%, 10%, ..., 95% e 99%. */
export const NIVEIS_NEX = [...Array.from({ length: 19 }, (_, i) => (i + 1) * 5), 99]

export type TipoGanho = 'poder' | 'trilha' | 'atributo' | 'grau' | 'versatilidade' | 'melhoria'

export type Ganho = { tipo: TipoGanho; texto: string }

/** Nome curto de cada tipo, pra linha do NEX. */
export const ROTULO_TIPO: Record<TipoGanho, string> = {
  poder: 'Poder',
  trilha: 'Trilha',
  atributo: 'Atributo',
  grau: 'Grau',
  versatilidade: 'Versátil',
  melhoria: 'Classe',
}

/** Separa por virgula, menos as que estao dentro de parenteses: "Eclético, perito (2 PE, +1d6)". */
function separar(texto: string): string[] {
  const partes: string[] = []
  let atual = ''
  let fundo = 0
  for (const ch of texto) {
    if (ch === '(') fundo++
    if (ch === ')') fundo = Math.max(0, fundo - 1)
    if (ch === ',' && fundo === 0) {
      partes.push(atual)
      atual = ''
    } else {
      atual += ch
    }
  }
  partes.push(atual)
  return partes.map((p) => p.trim()).filter(Boolean)
}

function tipoDe(parte: string): TipoGanho {
  const p = parte.toLowerCase()
  if (p.startsWith('poder de')) return 'poder'
  if (p.includes('habilidade de trilha')) return 'trilha'
  if (p.includes('aumento de atributo')) return 'atributo'
  if (p.includes('grau de treinamento')) return 'grau'
  if (p.includes('versatilidade')) return 'versatilidade'
  return 'melhoria'
}

/** "Aumento de atributo, versatilidade" vira dois ganhos, cada um com seu tipo. */
export function lerGanhos(texto: string | null | undefined): Ganho[] {
  if (!texto) return []
  return separar(texto).map((parte) => ({
    tipo: tipoDe(parte),
    texto: parte.charAt(0).toUpperCase() + parte.slice(1),
  }))
}

export type EstadoNivel = 'alcancado' | 'atual' | 'futuro'

export function estadoDoNivel(nex: number, atual: number): EstadoNivel {
  if (nex === atual) return 'atual'
  return nex < atual ? 'alcancado' : 'futuro'
}

/** Quantos niveis faltam do NEX atual ate este (0 se ja passou). */
export function niveisAte(nex: number, atual: number): number {
  return NIVEIS_NEX.filter((n) => n > atual && n <= nex).length
}

/** Proximo e anterior na escada de NEX; 0 e "sem NEX". */
export function proximoNex(atual: number): number {
  return NIVEIS_NEX.find((n) => n > atual) ?? atual
}

export function anteriorNex(atual: number): number {
  const antes = NIVEIS_NEX.filter((n) => n < atual)
  return antes.length ? antes[antes.length - 1] : 0
}

/**
 * Quantas pericias sobem no grau de treinamento, por classe (livro de regras):
 * Combatente 2 + Int, Especialista 5 + Int, Ocultista 3 + Int.
 */
const PERICIAS_POR_GRAU: Record<string, number> = { combatente: 2, especialista: 5, ocultista: 3 }

export function periciasNoGrau(nomeClasse: string | null | undefined, intelecto: number): number | null {
  const base = PERICIAS_POR_GRAU[(nomeClasse ?? '').toLowerCase()]
  return base == null ? null : Math.max(1, base + intelecto)
}

/**
 * A habilidade base da classe que uma melhoria automatica sobe: "Ataque especial (3 PE, +10)"
 * e o Ataque Especial; "Escolhido pelo Outro Lado (2º círculo)" e o Escolhido pelo Outro Lado.
 */
export function habilidadeDaMelhoria<T extends { name: string }>(texto: string, base: T[]): T | undefined {
  const nome = texto.replace(/\s*\(.*$/, '').trim().toLowerCase()
  return base.find((b) => b.name.toLowerCase() === nome) ?? base.find((b) => nome.startsWith(b.name.toLowerCase()))
}
