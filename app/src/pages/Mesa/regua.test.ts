import { describe, expect, it } from 'vitest'
import { medir, noCentro, quadradosEntre } from './regua'

const c = { grid_type: 'quadrado' as const, grid_size: 100, grid_distance: 1.5, grid_units: 'm' }

describe('régua', () => {
  it('reto: cada quadrado vale 1,5 m', () => {
    expect(medir([{ x: 50, y: 50 }, { x: 450, y: 50 }], c)).toEqual({ trechos: [6], total: 6 })
  })
  it('diagonal alterna 1 e 2 quadrados', () => {
    expect(quadradosEntre({ x: 0, y: 0 }, { x: 100, y: 100 }, c).quadrados).toBe(1)
    expect(quadradosEntre({ x: 0, y: 0 }, { x: 200, y: 200 }, c).quadrados).toBe(3)
    expect(quadradosEntre({ x: 0, y: 0 }, { x: 300, y: 100 }, c).quadrados).toBe(3)
  })
  it('a alternância continua entre os trechos (ponto no meio)', () => {
    // 1 diagonal + 1 diagonal = 1 + 2 = 3 quadrados = 4,5 m
    expect(medir([{ x: 0, y: 0 }, { x: 100, y: 100 }, { x: 200, y: 200 }], c)).toEqual({ trechos: [1.5, 3], total: 4.5 })
  })
  it('sem grade: linha reta', () => {
    expect(medir([{ x: 0, y: 0 }, { x: 300, y: 400 }], { ...c, grid_type: 'sem' as never }).total).toBe(7.5)
  })
  it('gruda no centro do quadrado', () => {
    expect(noCentro({ x: 130, y: 260 }, c)).toEqual({ x: 150, y: 250 })
  })
})
