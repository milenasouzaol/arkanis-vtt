import { describe, expect, it } from 'vitest'
import { caixaDoArrasto, caixaDosPontos, caminhoDoDesenho, estiloCompleto, grandeOSuficiente, simplificar } from './desenhos'

describe('desenhos', () => {
  it('arrastar pra qualquer lado dá a caixa certa; Alt deixa proporcional', () => {
    expect(caixaDoArrasto({ x: 100, y: 100 }, { x: 40, y: 160 })).toEqual({ x: 40, y: 100, width: 60, height: 60 })
    expect(caixaDoArrasto({ x: 0, y: 0 }, { x: 50, y: 20 }, true)).toEqual({ x: 0, y: 0, width: 50, height: 50 })
    expect(caixaDoArrasto({ x: 100, y: 100 }, { x: 80, y: 40 }, true)).toEqual({ x: 40, y: 40, width: 60, height: 60 })
  })

  it('pontos viram caixa + pontos relativos', () => {
    expect(caixaDosPontos([{ x: 10, y: 20 }, { x: 30, y: 5 }, { x: 20, y: 40 }])).toEqual({
      x: 10, y: 5, width: 20, height: 35, pontos: [[0, 15], [20, 0], [10, 35]],
    })
  })

  it('mão livre tira pontos colados', () => {
    const r = simplificar([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 }])
    expect(r).toEqual([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 }])
  })

  it('caminho SVG de cada forma', () => {
    expect(caminhoDoDesenho({ tipo: 'retangulo', width: 10, height: 5, pontos: [] })).toBe('M0 0H10V5H0Z')
    expect(caminhoDoDesenho({ tipo: 'poligono', width: 0, height: 0, pontos: [[0, 0], [5, 0], [5, 5]] })).toBe('M0 0L5 0L5 5Z')
    expect(caminhoDoDesenho({ tipo: 'livre', width: 0, height: 0, pontos: [[0, 0], [5, 5]] })).toBe('M0 0L5 5')
    expect(caminhoDoDesenho({ tipo: 'elipse', width: 10, height: 6, pontos: [] })).toContain('A5 3')
  })

  it('estilo antigo incompleto não quebra; clique sem arrastar não vira desenho', () => {
    expect(estiloCompleto({ linha: { largura: 9 } } as never).linha).toEqual({ largura: 9, cor: '#e8e8ec', opacidade: 1 })
    expect(grandeOSuficiente({ width: 1, height: 2 })).toBe(false)
    expect(grandeOSuficiente({ width: 30, height: 0 })).toBe(true)
  })
})
