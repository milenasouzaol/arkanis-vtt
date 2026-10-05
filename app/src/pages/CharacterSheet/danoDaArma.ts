// Partes do dano de um ataque (pedido da Millie em 05/10): o dano da arma e os extras (Amaldiçoar
// Arma…) rolam cada um com o seu tipo, e a rolagem mostra de onde veio cada parte.

export type ParteDeDano = { formula: string; tipo: string; origem?: string; elemento?: string }

// Parte já rolada, do jeito que vai pro chat.
export type ParteRolada = { formula: string; tipo: string; origem?: string; elemento?: string; lados: number; total: number }

// "1d6/1d8" = uma mão / duas mãos (armas versáteis, como o Bastão). Rola a da empunhadura.
export function formulaDaEmpunhadura(formula: string, empunhadura?: string | null): string {
  const opcoes = formula.split('/').map((f) => f.trim()).filter(Boolean)
  if (opcoes.length < 2) return formula.trim()
  const duas = /duas|2/i.test(empunhadura ?? '')
  return duas ? opcoes[1] : opcoes[0]
}

// Cores dos elementos (as mesmas da ficha e do combate).
const COR: Record<string, string> = {
  sangue: '#c8202b',
  morte: '#e8e8e8',
  energia: '#7b2fd6',
  conhecimento: '#e0b13a',
  medo: '#8a8a90',
}

export function corDoElemento(elemento: string | null | undefined): string | null {
  if (!elemento) return null
  return COR[elemento.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()] ?? null
}
