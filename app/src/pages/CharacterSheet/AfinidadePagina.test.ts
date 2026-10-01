import { describe, expect, it } from 'vitest'
import { ARTES, CIRCULOS, ROMANO, filtrarPorCirculo, porCirculo, type RitualDaAfinidade } from './AfinidadePagina'

const ritual = (name: string, circle: number): RitualDaAfinidade => ({
  id: name, name, circle, execution: 'padrão', range: 'curto', duration: 'cena', resistance: null,
})

describe('porCirculo', () => {
  it('agrupa por círculo, do 1º ao 4º', () => {
    const grupos = porCirculo([ritual('Fim Inevitável', 4), ritual('Decadência', 1), ritual('Paradoxo', 2)])
    expect(grupos.map(([c]) => c)).toEqual([1, 2, 4])
  })

  it('mantém a ordem que veio do banco dentro de cada círculo', () => {
    const grupos = porCirculo([ritual('Cicatrização', 1), ritual('Decadência', 1), ritual('Definhar', 1)])
    expect(grupos[0][1].map((r) => r.name)).toEqual(['Cicatrização', 'Decadência', 'Definhar'])
  })

  // Círculo sem ritual nenhum não vira um título vazio na tela.
  it('não inventa círculo que não tem ritual', () => {
    const grupos = porCirculo([ritual('Decadência', 1), ritual('Fim Inevitável', 4)])
    expect(grupos).toHaveLength(2)
  })

  it('lista vazia devolve vazio', () => {
    expect(porCirculo([])).toEqual([])
  })
})

describe('filtro de círculo', () => {
  const todos = [ritual('Decadência', 1), ritual('Paradoxo', 2), ritual('Zerar Entropia', 3), ritual('Fim Inevitável', 4)]

  // Igual à aba de adicionar rituais: sem nada marcado, mostra tudo.
  it('nenhum círculo marcado mostra todos', () => {
    expect(filtrarPorCirculo(todos, [])).toHaveLength(4)
  })

  it('um círculo marcado mostra só ele', () => {
    expect(filtrarPorCirculo(todos, [3]).map((r) => r.name)).toEqual(['Zerar Entropia'])
  })

  it('dá pra marcar mais de um', () => {
    expect(filtrarPorCirculo(todos, [1, 4]).map((r) => r.circle)).toEqual([1, 4])
  })

  it('os botões são I a IV, como na aba de rituais', () => {
    expect(CIRCULOS.map((c) => ROMANO[c])).toEqual(['I', 'II', 'III', 'IV'])
  })
})

describe('artes por elemento', () => {
  it('os cinco elementos têm título e símbolo', () => {
    expect(Object.keys(ARTES).sort()).toEqual(['conhecimento', 'energia', 'medo', 'morte', 'sangue'])
    for (const arte of Object.values(ARTES)) {
      expect(arte.titulo).toBeTruthy()
      expect(arte.simbolo).toBeTruthy()
    }
  })

  // Conhecimento, Morte e Energia não têm fundo próprio: deixam aparecer o fundo animado da ficha.
  it('Conhecimento, Morte e Energia usam o fundo da ficha', () => {
    expect(Object.keys(ARTES).filter((e) => !ARTES[e].fundo).sort()).toEqual(['conhecimento', 'energia', 'morte'])
  })
})
