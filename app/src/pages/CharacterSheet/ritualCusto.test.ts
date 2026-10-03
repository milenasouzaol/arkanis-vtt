import { describe, expect, it } from 'vitest'
import { custoDoRitual, notaDoGasto, recursoDoRitual } from './ritualCusto'

describe('custo do ritual', () => {
  it('custo base por círculo', () => {
    expect([1, 2, 3, 4].map((c) => custoDoRitual(c, 'normal', null, null))).toEqual([1, 3, 6, 10])
  })

  it('Discente e Verdadeiro somam o extra da variação', () => {
    // Amaldiçoar Arma (1º círculo): Discente +2 PE, Verdadeiro +5 PE
    expect(custoDoRitual(1, 'discente', 2, 5)).toBe(3)
    expect(custoDoRitual(1, 'verdadeiro', 2, 5)).toBe(6)
  })

  it('sem Sanidade o gasto sai da Determinação', () => {
    expect(recursoDoRitual({ sem_sanidade: true })).toEqual({ campo: 'current_pd', sigla: 'PD' })
    expect(recursoDoRitual({})).toEqual({ campo: 'current_pe', sigla: 'PE' })
    expect(recursoDoRitual(null)).toEqual({ campo: 'current_pe', sigla: 'PE' })
  })

  it('texto do gasto', () => {
    expect(notaDoGasto(3, 'PE', 12, 9)).toBe('Gastou 3 PE (12 → 9)')
  })
})
