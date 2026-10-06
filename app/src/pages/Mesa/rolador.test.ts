import { describe, expect, it } from 'vitest'
import { comandoDeRolagem, escreverFormula, formulaDaBandeja, lerFormula, rolarFormula, BANDEJA_VAZIA } from './rolador'

// Sorteio previsível: devolve os valores pedidos (1..lados) em ordem.
const dados = (lados: number[], valores: number[]) => {
  let i = 0
  return () => (valores[i] - 1 + 0.5) / lados[i++]
}

describe('rolador', () => {
  it('lê fórmulas', () => {
    expect(escreverFormula(lerFormula('1D20 + 5')!)).toBe('1d20 + 5')
    expect(escreverFormula(lerFormula('d20')!)).toBe('1d20')
    expect(escreverFormula(lerFormula('d%')!)).toBe('1d100')
    expect(escreverFormula(lerFormula('3d20kh')!)).toBe('3d20kh1')
    expect(escreverFormula(lerFormula('2d6-1d4-2')!)).toBe('2d6 - 1d4 - 2')
    expect(lerFormula('')).toBeNull()
    expect(lerFormula('abc')).toBeNull()
    expect(lerFormula('1d20 5')).toBeNull()
    expect(lerFormula('2d20kh3')).toBeNull()
    expect(lerFormula('1000d6')).toBeNull()
  })
  it('rola somando, com kh/kl e subtração', () => {
    const r = rolarFormula('1d6+2', undefined, dados([6], [4]))!
    expect(r.total).toBe(6)
    expect(r.dice).toEqual([{ sides: 6, value: 4, discarded: false }])
    expect(r.bonus).toBe(2)
    expect(r.label).toBe('Rolagem')
    expect(r.formula).toBeUndefined()
    const v = rolarFormula('2d20kh1', 'Ataque', dados([20, 20], [7, 15]))!
    expect(v.total).toBe(15)
    expect(v.label).toBe('Ataque')
    expect(v.dice?.map((d) => d.discarded)).toEqual([true, false])
    const d = rolarFormula('2d20kl1', undefined, dados([20, 20], [7, 15]))!
    expect(d.total).toBe(7)
    expect(d.label).toBe('Rolagem com Desvantagem')
    const m = rolarFormula('1d8-1d4', undefined, dados([8, 4], [5, 3]))!
    expect(m.total).toBe(2)
    expect(m.formula).toBe('1d8 - 1d4')
    expect(rolarFormula('5')).toBeNull()
  })
  it('comando /r', () => {
    expect(comandoDeRolagem('/r 1d20+5')).toEqual({ formula: '1d20+5', rotulo: undefined })
    expect(comandoDeRolagem('/roll 2d6 # Dano')).toEqual({ formula: '2d6', rotulo: 'Dano' })
    expect(comandoDeRolagem('/r banana')).toBe('invalida')
    expect(comandoDeRolagem('/r')).toBe('invalida')
    expect(comandoDeRolagem('oi /r 1d20')).toBeNull()
    expect(comandoDeRolagem('/rua')).toBeNull()
  })
  it('bandeja vira fórmula', () => {
    expect(formulaDaBandeja({ ...BANDEJA_VAZIA, dados: { 6: 1 }, modificador: 2 })).toBe('1d6+2')
    expect(formulaDaBandeja({ ...BANDEJA_VAZIA, dados: { 20: 1, 6: 2 }, modificador: -1 })).toBe('1d20+2d6-1')
    expect(formulaDaBandeja({ dados: { 20: 2 }, modificador: 0, vantagem: 'vantagem' })).toBe('3d20kh1')
    expect(formulaDaBandeja({ dados: { 20: 1 }, modificador: 3, vantagem: 'desvantagem' })).toBe('2d20kl1+3')
    expect(formulaDaBandeja({ dados: { 6: 2 }, modificador: 0, vantagem: 'vantagem' })).toBe('3d6kh2')
    expect(formulaDaBandeja(BANDEJA_VAZIA)).toBe('')
  })
})
