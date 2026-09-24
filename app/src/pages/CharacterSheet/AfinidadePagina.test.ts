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
