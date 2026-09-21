import { describe, expect, it } from 'vitest'
import { penalidadeDeCarga, resistenciasDoItem, resistenciasDoItemEquipado } from './itemMods'

// Dados reais da Proteção Pesada, lidos do banco.
const PESADA_STATS = {
  defesa: 10,
  resistencia: { corte: 2, impacto: 2, balistico: 2, perfuracao: 2 },
}
const PESADA_DESC = 'Capacete + ombreiras + joelheiras + caneleiras + colete multicamada (forças especiais/exército); resistência a balístico/corte/impacto/perfuração 2; -5 em perícias com penalidade de carga.'

const BLINDADA = { kind: 'modificacao' as const, name: 'Blindada', effect: 'RD sobe pra 5; espaço +1 (só proteção pesada)', elemento: null }
const VOLTAICA = { kind: 'maldicao' as const, name: 'Voltaica', effect: 'Resistência a Energia 10; ação de movimento + 2 PE pra emitir arcos.', elemento: null }

describe('resistenciasDoItem', () => {
  // Isto já estava no banco e não era lido: só de equipar, a pessoa tem 2 nos quatro tipos.
  it('a Protecao Pesada ja traz os quatro tipos', () => {
    expect(resistenciasDoItem(PESADA_STATS)).toEqual([
      { tipo: 'Corte', valor: 2 },
      { tipo: 'Impacto', valor: 2 },
      { tipo: 'Balístico', valor: 2 },
      { tipo: 'Perfuração', valor: 2 },
    ])
  })

  it('item sem resistencia devolve vazio', () => {
    expect(resistenciasDoItem({ defesa: 5 })).toEqual([])
    expect(resistenciasDoItem(undefined)).toEqual([])
  })

  it('tipo com valor zero nao entra', () => {
    expect(resistenciasDoItem({ resistencia: { corte: 0, impacto: 3 } })).toEqual([{ tipo: 'Impacto', valor: 3 }])
  })
})

describe('resistenciasDoItemEquipado', () => {
  it('sem modificacao, vale o que o item ja tem', () => {
    expect(resistenciasDoItemEquipado(PESADA_STATS, [])).toHaveLength(4)
    expect(resistenciasDoItemEquipado(PESADA_STATS, [])[0]).toEqual({ tipo: 'Corte', valor: 2 })
  })

  // O ponto que a Millie levantou: Blindada não cria um "Dano 5" solto; ela eleva
  // os tipos que a proteção já resiste.
  it('Blindada sobe os quatro tipos de 2 para 5', () => {
    const r = resistenciasDoItemEquipado(PESADA_STATS, [BLINDADA])
    expect(r).toEqual([
      { tipo: 'Corte', valor: 5 },
      { tipo: 'Impacto', valor: 5 },
      { tipo: 'Balístico', valor: 5 },
      { tipo: 'Perfuração', valor: 5 },
    ])
    expect(r.some((x) => x.tipo === 'Dano')).toBe(false)
  })

  it('resistencia de elemento entra alem dos tipos do item', () => {
    const r = resistenciasDoItemEquipado(PESADA_STATS, [VOLTAICA])
    expect(r).toContainEqual({ tipo: 'Energia', valor: 10 })
    expect(r).toContainEqual({ tipo: 'Corte', valor: 2 })
  })

  it('num item que nao resiste a nada, "RD sobe pra 5" vira resistencia geral', () => {
    expect(resistenciasDoItemEquipado({ defesa: 5 }, [BLINDADA])).toEqual([{ tipo: 'Dano', valor: 5 }])
  })

  it('nao rebaixa: modificacao mais fraca que o item nao diminui a resistencia', () => {
    const fraca = { kind: 'modificacao' as const, name: 'x', effect: 'RD sobe pra 1', elemento: null }
    expect(resistenciasDoItemEquipado(PESADA_STATS, [fraca])[0]).toEqual({ tipo: 'Corte', valor: 2 })
  })
})

describe('penalidadeDeCarga', () => {
  it('le o -5 da Protecao Pesada', () => {
    expect(penalidadeDeCarga(PESADA_DESC)).toBe(-5)
  })

  it('protecao sem penalidade devolve zero', () => {
    expect(penalidadeDeCarga('Jaqueta de couro pesada ou colete de kevlar.')).toBe(0)
    expect(penalidadeDeCarga(null)).toBe(0)
  })
})
