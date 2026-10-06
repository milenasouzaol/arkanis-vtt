// Rolagem digitada no chat (/r 1d20+5) e a bandeja de dados embaixo do campo (pedido da
// Millie, 06/10). Regras puras, testadas.
import type { Rolagem } from './chat'

// Um pedaço da fórmula: dados (2d20kh1) ou um número; sinal = soma ou subtrai.
export type Termo =
  | { tipo: 'dados'; sinal: 1 | -1; quantidade: number; lados: number; manter?: { como: 'maior' | 'menor'; quantos: number } }
  | { tipo: 'numero'; sinal: 1 | -1; valor: number }

const MAX_DADOS = 100
const MAX_LADOS = 1000

// "2d20kh1 + 1d6 - 3" → termos. Aceita d20 (= 1d20), d% (= d100), kh/kl (manter maiores/menores;
// sem número = 1), espaços e maiúsculas. Fórmula estranha → null.
export function lerFormula(texto: string): Termo[] | null {
  // Número separado por espaço ("1d20 5") não vira 1d205.
  if (/[\d%]\s+\d/.test(texto)) return null
  const limpo = texto.replace(/\s+/g, '').toLowerCase()
  if (!limpo) return null
  const termos: Termo[] = []
  const re = /([+-]?)(?:(\d*)d(\d+|%)(?:(kh|kl)(\d*))?|(\d+))/y
  let i = 0
  while (i < limpo.length) {
    re.lastIndex = i
    const m = re.exec(limpo)
    if (!m || m[0] === '' || (i > 0 && !m[1])) return null
    const sinal = m[1] === '-' ? -1 : 1
    if (m[6] !== undefined) termos.push({ tipo: 'numero', sinal, valor: Number(m[6]) })
    else {
      const quantidade = m[2] === '' ? 1 : Number(m[2])
      const lados = m[3] === '%' ? 100 : Number(m[3])
      if (quantidade < 1 || quantidade > MAX_DADOS || lados < 2 || lados > MAX_LADOS) return null
      const termo: Termo = { tipo: 'dados', sinal, quantidade, lados }
      if (m[4]) {
        const quantos = m[5] === '' ? 1 : Number(m[5])
        if (quantos < 1 || quantos > quantidade) return null
        termo.manter = { como: m[4] === 'kh' ? 'maior' : 'menor', quantos }
      }
      termos.push(termo)
    }
    i = re.lastIndex
  }
  return termos.length ? termos : null
}

// Termos → texto da fórmula, arrumado ("2d20kh1 + 1d6 − 3").
export function escreverFormula(termos: Termo[]): string {
  return termos
    .map((t, i) => {
      const corpo = t.tipo === 'numero' ? String(t.valor) : `${t.quantidade}d${t.lados}${t.manter ? `${t.manter.como === 'maior' ? 'kh' : 'kl'}${t.manter.quantos}` : ''}`
      if (i === 0) return t.sinal < 0 ? `-${corpo}` : corpo
      return `${t.sinal < 0 ? ' - ' : ' + '}${corpo}`
    })
    .join('')
}

// Rola a fórmula: cada dado vai pro chat (e pros dados 3D); os que não contam ficam riscados.
export function rolarFormula(texto: string, rotulo?: string, aleatorio: () => number = Math.random): Rolagem | null {
  const termos = lerFormula(texto)
  if (!termos) return null
  const dice: NonNullable<Rolagem['dice']> = []
  const pedacos: string[] = []
  let total = 0
  let bonus = 0
  let soNumeros = true
  for (const t of termos) {
    if (t.tipo === 'numero') {
      bonus += t.sinal * t.valor
      total += t.sinal * t.valor
      continue
    }
    soNumeros = false
    const valores = Array.from({ length: t.quantidade }, () => 1 + Math.floor(aleatorio() * t.lados))
    // Quais contam: com kh/kl, os maiores/menores; sem, todos.
    const ordem = valores.map((v, i) => ({ v, i })).sort((a, b) => (t.manter?.como === 'menor' ? a.v - b.v : b.v - a.v))
    const contam = new Set(t.manter ? ordem.slice(0, t.manter.quantos).map((x) => x.i) : valores.map((_, i) => i))
    const soma = valores.reduce((s, v, i) => s + (contam.has(i) ? v : 0), 0)
    total += t.sinal * soma
    valores.forEach((v, i) => dice.push({ sides: t.lados, value: v, discarded: !contam.has(i) }))
    pedacos.push(`${t.sinal < 0 ? '−' : ''}[${valores.map((v, i) => (contam.has(i) ? String(v) : `~${v}~`)).join(', ')}]`)
  }
  if (soNumeros) return null
  const formula = escreverFormula(termos)
  return {
    label: rotulo?.trim() || formula,
    total,
    detail: `${pedacos.join(' ')}${bonus ? ` ${bonus > 0 ? '+' : '−'} ${Math.abs(bonus)}` : ''}`,
    dice,
    bonus,
    formula,
  }
}

// "/r 1d20+5 # Ataque" (ou /roll) → fórmula e rótulo. Não é comando → null; comando com
// fórmula que não dá pra ler → 'invalida'.
export function comandoDeRolagem(texto: string): { formula: string; rotulo?: string } | 'invalida' | null {
  const m = /^\/(?:r|roll)(?:\s+([\s\S]*))?$/i.exec(texto.trim())
  if (!m) return null
  const [formula, ...resto] = (m[1] ?? '').split('#')
  const rotulo = resto.join('#').trim() || undefined
  if (!lerFormula(formula)) return 'invalida'
  return { formula: formula.trim(), rotulo }
}

// ---- Bandeja de dados ----

export const DADOS_DA_BANDEJA = [4, 6, 8, 10, 12, 20, 100] as const
export type Vantagem = 'normal' | 'vantagem' | 'desvantagem'
export type Bandeja = { dados: Partial<Record<number, number>>; modificador: number; vantagem: Vantagem }

export const BANDEJA_VAZIA: Bandeja = { dados: {}, modificador: 0, vantagem: 'normal' }

export function bandejaVazia(b: Bandeja): boolean {
  return !Object.values(b.dados).some((n) => (n ?? 0) > 0)
}

// Bandeja → fórmula. Vantagem/desvantagem: mais um dado no grupo maior e fica com os
// maiores/menores (no d20 como em Ordem: rola mais um e fica com 1; nos outros, tira o pior/melhor).
export function formulaDaBandeja(b: Bandeja): string {
  const grupos = DADOS_DA_BANDEJA.filter((l) => (b.dados[l] ?? 0) > 0).sort((a, c) => c - a)
  if (!grupos.length) return b.modificador ? String(b.modificador) : ''
  const partes = grupos.map((l, i) => {
    const n = b.dados[l]!
    if (i > 0 || b.vantagem === 'normal') return `${n}d${l}`
    const fica = l === 20 ? 1 : n
    return `${n + 1}d${l}${b.vantagem === 'vantagem' ? 'kh' : 'kl'}${fica}`
  })
  let f = partes.join('+')
  if (b.modificador) f += b.modificador > 0 ? `+${b.modificador}` : `${b.modificador}`
  return f
}
