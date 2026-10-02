import { describe, expect, it } from 'vitest'
import { computeDerivedStats, nexAumentos, recuperarAteMaximo } from './rules'

const combatente = {
  pv_initial: 20, pv_initial_attr: 'vigor', pv_per_nex: 4, pv_per_nex_attr: 'vigor',
  pe_initial: 2, pe_initial_attr: 'presenca', pe_per_nex: 2, pe_per_nex_attr: 'presenca',
  sanity_initial: 12, sanity_per_nex: 3,
  pd_initial: null, pd_initial_attr: null, pd_per_nex: null, pd_per_nex_attr: null,
}
const atributos = { forca: 1, agilidade: 1, intelecto: 1, vigor: 2, presenca: 1 }

describe('máximos por NEX', () => {
  // Livro: no NEX 5% só os valores iniciais; cada NEX seguinte soma um aumento.
  it('NEX 5% tem só os valores iniciais da classe', () => {
    expect(computeDerivedStats(combatente, atributos, 5)).toMatchObject({ maxPv: 22, maxPe: 3, maxSanity: 12 })
  })

  it('cada NEX seguinte soma um aumento', () => {
    expect(computeDerivedStats(combatente, atributos, 10)).toMatchObject({ maxPv: 28, maxPe: 6, maxSanity: 15 })
    expect(computeDerivedStats(combatente, atributos, 35).maxPv).toBe(22 + 6 * 6)
  })

  it('NEX 99% tem 19 aumentos', () => {
    expect(nexAumentos(99)).toBe(19)
    expect(computeDerivedStats(combatente, atributos, 99).maxPv).toBe(22 + 19 * 6)
  })

  it('sem NEX não tem aumento nenhum', () => {
    expect(nexAumentos(0)).toBe(0)
    expect(nexAumentos(5)).toBe(0)
  })
})

describe('recuperarAteMaximo', () => {
  it('para no máximo', () => {
    expect(recuperarAteMaximo(20, 10, 25)).toBe(25)
    expect(recuperarAteMaximo(10, 5, 25)).toBe(15)
  })

  // Se já está acima (ajuste à mão, bônus), descansar não tira nada.
  it('não reduz quem já está acima do máximo', () => {
    expect(recuperarAteMaximo(30, 5, 25)).toBe(30)
  })

  it('sem máximo conhecido, só soma', () => {
    expect(recuperarAteMaximo(10, 5, null)).toBe(15)
  })
})
