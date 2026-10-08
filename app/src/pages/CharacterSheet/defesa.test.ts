import { describe, expect, it } from 'vitest'
import { bonusDosPoderes, defesaTotal } from './defesa'

const coturnos = { tipo: 'geral', nome: 'Coturno + 2 Reflexos', stats: {}, mods: [{ kind: 'maldicao' as const, name: 'Defesa', effect: '+5 Defesa.', elemento: 'energia' }] }

describe('defesa da ficha', () => {
  it('maldição de Defesa num acessório soma (Coturnos da Renata)', () => {
    expect(defesaTotal({ agilidade: 3, outros: 0, condicoes: [], itens: [coturnos], poderes: [] }).total).toBe(18)
  })

  it('Reflexos Defensivos dá +2 Defesa e +2 nos testes de resistência', () => {
    const r = defesaTotal({ agilidade: 3, outros: 0, condicoes: [], itens: [coturnos], poderes: ['Reflexos Defensivos', 'Golpe Pesado'] })
    expect(r.total).toBe(20)
    expect(r.poderes.pericias).toEqual({ Fortitude: 2, Reflexos: 2, Vontade: 2 })
  })

  it('proteção soma a defesa dela e as modificações', () => {
    const leve = { tipo: 'protecao', nome: 'Proteção Leve', stats: { defesa: 5 }, mods: [{ kind: 'modificacao' as const, name: 'Reforçada', effect: 'Defesa +2; espaço +1', elemento: null }] }
    expect(defesaTotal({ agilidade: 2, outros: 1, condicoes: [], itens: [leve], poderes: [] }).total).toBe(20)
  })

  it('Especialista em Proteção Leve só vale com proteção leve equipada', () => {
    expect(bonusDosPoderes(['Especialista em Proteção Leve']).defesa).toBe(0)
    expect(bonusDosPoderes(['Especialista em Proteção Leve'], { protecaoLeve: true }).defesa).toBe(2)
  })

  it('poder repetido não soma duas vezes; poder situacional não entra', () => {
    expect(bonusDosPoderes(['Reflexos Defensivos', 'Reflexos Defensivos', 'Combate Defensivo']).defesa).toBe(2)
  })

  it('condições continuam entrando', () => {
    expect(defesaTotal({ agilidade: 0, outros: 0, condicoes: ['Desprevenido'], itens: [], poderes: [] }).total).toBe(5)
  })
})
