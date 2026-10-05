import { describe, expect, it } from 'vitest'
import { armaServe, encantoDoRitual, numerosComEncantos, regraDoRitual, textoDoEncanto } from './encantos'

describe('rituais de arma', () => {
  it('Amaldiçoar Arma: dado do elemento escolhido muda com o modo', () => {
    expect(encantoDoRitual('Amaldiçoar Arma', 'normal', 'Morte')?.dano).toEqual({ formula: '1d6', tipo: 'Morte' })
    expect(encantoDoRitual('Amaldiçoar Arma', 'discente', 'Sangue')).toMatchObject({ nome: 'Amaldiçoar Arma (Discente) — Sangue', dano: { formula: '2d6' } })
    expect(encantoDoRitual('Amaldiçoar Arma', 'verdadeiro', 'Energia')?.dano?.formula).toBe('4d6')
    expect(regraDoRitual('amaldicoar arma')?.elementos).toEqual(['Conhecimento', 'Energia', 'Morte', 'Sangue'])
  })

  it('Arma Atroz e Chamas do Caos', () => {
    expect(encantoDoRitual('Arma Atroz', 'normal')).toMatchObject({ ataque: 2, margem: 1 })
    expect(encantoDoRitual('Arma Atroz', 'verdadeiro')).toMatchObject({ ataque: 5, margem: 2, multiplicador: 2 })
    expect(encantoDoRitual('Chamas do Caos', 'normal')?.dano).toEqual({ formula: '1d6', tipo: 'Fogo' })
    expect(encantoDoRitual('Chamas do Caos', 'discente')).toBeNull()
    expect(encantoDoRitual('Cicatrização', 'normal')).toBeNull()
  })

  it('que arma serve', () => {
    expect(armaServe('corpo_a_corpo', { tipo: 'arma', natureza: 'corpo_a_corpo' })).toBe(true)
    expect(armaServe('corpo_a_corpo', { tipo: 'arma', natureza: 'fogo' })).toBe(false)
    expect(armaServe('corpo_a_corpo_ou_municao', { tipo: 'municao', natureza: null })).toBe(true)
    expect(armaServe('corpo_a_corpo', { tipo: 'municao', natureza: null })).toBe(false)
  })
})

it('ataque com os encantos somados', () => {
  const base = { d20_bonus: 3, threat_margin: 19, multiplier: 2, damage: [{ formula: '1d4', tipo: 'C' }] }
  const r = numerosComEncantos(base, [encantoDoRitual('Arma Atroz', 'verdadeiro')!, encantoDoRitual('Amaldiçoar Arma', 'normal', 'Morte')!])
  expect(r).toEqual({ d20_bonus: 8, threat_margin: 17, multiplier: 4, damage: [{ formula: '1d4', tipo: 'C' }, { formula: '1d6', tipo: 'Morte', origem: 'Amaldiçoar Arma', elemento: 'Morte' }] })
  expect(numerosComEncantos(base, [])).toBe(base)
  expect(textoDoEncanto(encantoDoRitual('Arma Atroz', 'normal')!)).toBe('+2 no ataque, +1 na margem de ameaça')
})
