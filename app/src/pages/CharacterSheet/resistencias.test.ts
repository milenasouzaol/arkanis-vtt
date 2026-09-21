import { describe, expect, it } from 'vitest'
import { resistenciasDeModificadores, resistenciasDoEfeito, textoDasResistencias } from './itemMods'

const maldicao = (name: string, effect: string) => ({ kind: 'maldicao' as const, name, effect, elemento: null })

// Textos reais do catálogo, copiados do banco.
const BLINDADA = { kind: 'modificacao' as const, name: 'Blindada', effect: 'RD sobe pra 5; espaço +1 (só proteção pesada)', elemento: null }
const VOLTAICA = maldicao('Voltaica', 'Resistência a Energia 10; ação de movimento + 2 PE pra emitir arcos (2d6 dano de Energia em adjacentes no fim de cada turno) até o fim da cena.')
const PROFETICA = maldicao('Profética', 'Resistência a Conhecimento 10; 2 PE pra rerrolar um teste de resistência.')
const REPULSIVA = maldicao('Repulsiva', 'Resistência a Morte 10; ação de movimento + 2 PE pra cobrir de Lodo (quem atacar corpo a corpo sofre 2d8 dano de Morte) até o fim da cena.')
const REGENERATIVA = maldicao('Regenerativa', 'Resistência a Sangue 10; ação de movimento + 1 PE pra recuperar 1d12 PV.')
const ESCUDO_MENTAL = maldicao('Escudo Mental', 'Resistência mental 10.')
const CINETICA = maldicao('Cinética', '+2 Defesa + resistência a dano 2 (leve/escudo) ou 5 (pesada).')

describe('resistenciasDoEfeito', () => {
  it('le "RD sobe pra 5"', () => {
    expect(resistenciasDoEfeito(BLINDADA.effect)).toEqual([{ tipo: 'Dano', valor: 5 }])
  })

  it('le resistencia por elemento', () => {
    expect(resistenciasDoEfeito(VOLTAICA.effect)).toContainEqual({ tipo: 'Energia', valor: 10 })
    expect(resistenciasDoEfeito(PROFETICA.effect)).toContainEqual({ tipo: 'Conhecimento', valor: 10 })
    expect(resistenciasDoEfeito(REPULSIVA.effect)).toContainEqual({ tipo: 'Morte', valor: 10 })
    expect(resistenciasDoEfeito(REGENERATIVA.effect)).toContainEqual({ tipo: 'Sangue', valor: 10 })
  })

  it('le resistencia mental', () => {
    expect(resistenciasDoEfeito(ESCUDO_MENTAL.effect)).toEqual([{ tipo: 'Mental', valor: 10 }])
  })

  // "2 (leve/escudo) ou 5 (pesada)": não dá pra saber o tipo da proteção pelo texto, então
  // mostro o teto e a condição continua escrita no efeito, à vista.
  it('efeito com dois valores mostra o maior', () => {
    expect(resistenciasDoEfeito(CINETICA.effect)).toContainEqual({ tipo: 'Dano', valor: 5 })
  })

  it('o dano de um efeito nao vira resistencia por engano', () => {
    // A Voltaica cita "2d6 dano de Energia", que é dano causado, não resistência.
    const r = resistenciasDoEfeito(VOLTAICA.effect)
    expect(r.filter((x) => x.tipo === 'Dano')).toEqual([])
  })

  it('efeito sem resistencia nenhuma devolve vazio', () => {
    expect(resistenciasDoEfeito('+2 em testes de ataque')).toEqual([])
    expect(resistenciasDoEfeito('')).toEqual([])
  })
})

describe('resistenciasDeModificadores', () => {
  it('junta as resistencias de itens diferentes', () => {
    const r = resistenciasDeModificadores([BLINDADA, VOLTAICA])
    expect(r).toContainEqual({ tipo: 'Dano', valor: 5 })
    expect(r).toContainEqual({ tipo: 'Energia', valor: 10 })
  })

  it('repetindo o mesmo tipo, vale a maior', () => {
    const fraca = maldicao('x', 'Resistência a Energia 5')
    expect(resistenciasDeModificadores([fraca, VOLTAICA])).toEqual([{ tipo: 'Energia', valor: 10 }])
  })

  it('sem modificacao, sem resistencia', () => {
    expect(resistenciasDeModificadores([])).toEqual([])
    expect(resistenciasDeModificadores(undefined)).toEqual([])
  })
})

describe('textoDasResistencias', () => {
  it('lista separando por ponto', () => {
    expect(textoDasResistencias([{ tipo: 'Dano', valor: 5 }, { tipo: 'Energia', valor: 10 }]))
      .toBe('Dano 5 · Energia 10')
  })

  it('vazio quando nao ha nenhuma, pra a tela mostrar "Nenhuma"', () => {
    expect(textoDasResistencias([])).toBe('')
  })
})
