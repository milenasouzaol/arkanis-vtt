// Custo de conjurar um ritual (livro base): 1º círculo 1 PE, 2º 3 PE, 3º 6 PE, 4º 10 PE.
// Discente e Verdadeiro somam o "+X PE" da variação ao custo do círculo.
// Na regra opcional "Jogando sem Sanidade" o gasto sai da Determinação (PD), não do PE.

export const CUSTO_POR_CIRCULO = [1, 3, 6, 10]

export type ModoRitual = 'normal' | 'discente' | 'verdadeiro'

export function custoDoRitual(circulo: number, modo: ModoRitual, extraDiscente: number | null, extraVerdadeiro: number | null): number {
  const base = CUSTO_POR_CIRCULO[Math.min(4, Math.max(1, circulo)) - 1]
  if (modo === 'discente') return base + (extraDiscente ?? 0)
  if (modo === 'verdadeiro') return base + (extraVerdadeiro ?? 0)
  return base
}

export function recursoDoRitual(regras: Record<string, boolean> | null | undefined): { campo: 'current_pe' | 'current_pd'; sigla: 'PE' | 'PD' } {
  return regras?.sem_sanidade ? { campo: 'current_pd', sigla: 'PD' } : { campo: 'current_pe', sigla: 'PE' }
}

// Texto que vai embaixo da rolagem no chat e no histórico.
export function notaDoGasto(custo: number, sigla: string, antes: number, depois: number): string {
  return `Gastou ${custo} ${sigla} (${antes} → ${depois})`
}
