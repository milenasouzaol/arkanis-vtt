import { describe, expect, it } from 'vitest'
import { porCirculo, type RitualDaAfinidade } from './AfinidadePagina'

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

describe('artes por elemento', () => {
  it('Morte, Sangue, Conhecimento e Medo têm título em arte', async () => {
    const { ARTES } = await import('./AfinidadePagina')
    expect(Object.keys(ARTES).sort()).toEqual(['conhecimento', 'medo', 'morte', 'sangue'])
  })

  // Só Morte tem uma figura de corpo inteiro; os outros usam o símbolo no lugar.
  it('só Morte tem figura própria, os outros usam o símbolo', async () => {
    const { ARTES } = await import('./AfinidadePagina')
    expect(ARTES.morte.figuraEhSimbolo).toBeFalsy()
    for (const e of ['sangue', 'conhecimento', 'medo']) expect(ARTES[e].figuraEhSimbolo).toBe(true)
  })

  it('Energia ainda não tem arte e cai no título em texto', async () => {
    const { ARTES } = await import('./AfinidadePagina')
    expect(ARTES.energia).toBeUndefined()
  })
})
