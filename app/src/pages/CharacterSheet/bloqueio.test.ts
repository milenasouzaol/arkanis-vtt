import { describe, expect, it } from 'vitest'
import { rdDeBloqueio } from './itemMods'

describe('RD a mais no Bloqueio', () => {
  it('Braçadeira reforçada: +2', () => {
    expect(rdDeBloqueio('+2 na RD de bloqueio.')).toBe(2)
  })
  it('o que custa PE ou sacrifica o item fica na mão', () => {
    expect(rdDeBloqueio('Arma ágil; ação especial bloqueio, gasta 2 PE + sacrifica a faca pra +20 na RD do bloqueio.')).toBe(0)
  })
  it('outros textos não contam', () => {
    expect(rdDeBloqueio('+2 em testes de ataque')).toBe(0)
    expect(rdDeBloqueio(null)).toBe(0)
  })
})
