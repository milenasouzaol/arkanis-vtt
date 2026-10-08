import { describe, expect, it } from 'vitest'
import { prender, retanguloDoRecorte, tamanhoDeSaida, tamanhoDoRecorte } from './recorte'

describe('recorte de imagem', () => {
  it('o quadrado numa imagem larga usa a altura toda', () => {
    expect(tamanhoDoRecorte(2000, 1000, 1, 1)).toEqual({ w: 1000, h: 1000 })
  })

  it('zoom diminui o recorte', () => {
    expect(tamanhoDoRecorte(2000, 1000, 1, 2)).toEqual({ w: 500, h: 500 })
  })

  it('não deixa o recorte sair da imagem', () => {
    expect(prender(2000, 1000, 1, { cx: 0, cy: 0, zoom: 1 })).toEqual({ cx: 500, cy: 500, zoom: 1 })
    expect(prender(2000, 1000, 1, { cx: 5000, cy: 500, zoom: 1 })).toEqual({ cx: 1500, cy: 500, zoom: 1 })
  })

  it('retângulo final no canto que a pessoa arrastou', () => {
    expect(retanguloDoRecorte(2000, 1000, 1, { cx: 1500, cy: 500, zoom: 1 })).toEqual({ x: 1000, y: 0, w: 1000, h: 1000 })
  })

  it('imagem gigante sai menor, na mesma proporção', () => {
    expect(tamanhoDeSaida(6000, 3000, 2048)).toEqual({ w: 2048, h: 1024 })
    expect(tamanhoDeSaida(500, 300, 2048)).toEqual({ w: 500, h: 300 })
  })
})
