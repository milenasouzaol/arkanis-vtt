import { expect, it } from 'vitest'
import { corDoElemento, formulaDaEmpunhadura } from './danoDaArma'

it('arma versátil rola o dano da empunhadura', () => {
  expect(formulaDaEmpunhadura('1d6/1d8', 'Uma Mão')).toBe('1d6')
  expect(formulaDaEmpunhadura('1d6/1d8', 'uma_mao')).toBe('1d6')
  expect(formulaDaEmpunhadura('1d6/1d8', 'Duas Mãos')).toBe('1d8')
  expect(formulaDaEmpunhadura('1d6/1d8', 'duas_maos')).toBe('1d8')
  expect(formulaDaEmpunhadura('1d6/1d8', null)).toBe('1d6')
  expect(formulaDaEmpunhadura('2d6+3', 'Duas Mãos')).toBe('2d6+3')
})

it('cor do elemento', () => {
  expect(corDoElemento('Energia')).toBe('#7b2fd6')
  expect(corDoElemento('Conhecimento')).toBe('#e0b13a')
  expect(corDoElemento('Impacto')).toBeNull()
})
