import { describe, expect, it } from 'vitest'
import { ALTURA_CENA, LARGURA_CENA, OBJETOS } from './interludioCena'

describe('cena do interlúdio', () => {
  it('cada ação da cena tem um objeto, sem repetir', () => {
    expect(OBJETOS.map((o) => o.acao).sort()).toEqual(['alimentar', 'dormir', 'exercitar', 'ler', 'manutencao', 'relaxar', 'revisar_caso'])
  })

  // Contorno fora da arte não acende nada e não dá pra clicar.
  it('contornos e etiquetas ficam dentro da arte', () => {
    for (const o of OBJETOS) {
      const pontos = o.contornos.flatMap((c) => c.split(' ').map((p) => p.split(',').map(Number)))
      expect(pontos.length).toBeGreaterThanOrEqual(3)
      for (const [x, y] of [...pontos, o.etiqueta]) {
        expect(x).toBeGreaterThanOrEqual(0)
        expect(x).toBeLessThanOrEqual(LARGURA_CENA)
        expect(y).toBeGreaterThanOrEqual(0)
        expect(y).toBeLessThanOrEqual(ALTURA_CENA)
      }
    }
  })
})
