import { describe, expect, it } from 'vitest'
import { bonusDeNexDosPoderes, computeDerivedStats, limiteDePE } from './rules'
import { bonusDosPoderes } from '../pages/CharacterSheet/defesa'

const combatente = { pv_initial: 20, pv_initial_attr: 'vigor', pv_per_nex: 4, pv_per_nex_attr: 'vigor', pe_initial: 2, pe_initial_attr: 'presenca', pe_per_nex: 2, pe_per_nex_attr: 'presenca', sanity_initial: 12, sanity_per_nex: 3, pd_initial: 0, pd_initial_attr: null, pd_per_nex: 0, pd_per_nex_attr: null } as any
const attrs = { forca: 1, agilidade: 1, intelecto: 1, vigor: 2, presenca: 1 } as any

describe('limite de PE por turno', () => {
  it('1 por degrau de NEX', () => {
    expect(limiteDePE(5)).toBe(1)
    expect(limiteDePE(40)).toBe(8)
    expect(limiteDePE(99)).toBe(20)
  })
  it('Dedicação +1', () => {
    expect(limiteDePE(5, ['Dedicação'])).toBe(2)
  })
})

describe('poderes que crescem com o NEX', () => {
  it('Casca Grossa (Tropa de Choque): +1 PV a cada 5% de NEX', () => {
    const sem = computeDerivedStats(combatente, attrs, 40).maxPv
    expect(computeDerivedStats(combatente, attrs, 40, ['Casca Grossa']).maxPv).toBe(sem + 8)
  })
  it('PE sobe com o NEX e com os poderes', () => {
    expect(computeDerivedStats(combatente, attrs, 10).maxPe).toBeGreaterThan(computeDerivedStats(combatente, attrs, 5).maxPe)
    expect(bonusDeNexDosPoderes(['Vontade Inabalável'], 40).pe).toBe(4)
    expect(bonusDeNexDosPoderes(['Potencial Aprimorado'], 25).pe).toBe(5)
  })
  it('Dedicação: +1 PE e +1 a cada NEX ímpar a partir de 15%', () => {
    expect(bonusDeNexDosPoderes(['Dedicação'], 10).pe).toBe(1)
    expect(bonusDeNexDosPoderes(['Dedicação'], 15).pe).toBe(2)
    expect(bonusDeNexDosPoderes(['Dedicação'], 99).pe).toBe(10)
  })
  it('sem o poder, nada muda', () => {
    expect(bonusDeNexDosPoderes(['Golpe Pesado'], 50)).toEqual({ pv: 0, pe: 0, limitePE: 0, motivos: [] })
  })
})

describe('Inquebrável', () => {
  it('+5 Defesa só machucado', () => {
    expect(bonusDosPoderes(['Inquebrável']).defesa).toBe(0)
    expect(bonusDosPoderes(['Inquebrável'], { machucado: true }).defesa).toBe(5)
  })
})
