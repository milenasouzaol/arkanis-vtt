import { describe, expect, it } from 'vitest'
import { caminhoDaLuzUv, coneDaLanterna, conesDosTokens } from './luz'

const token = { id: 't', x: 0, y: 0, width: 100, height: 100, rotation: 0, layer: 'token' as const }
const celula = { w: 100, h: 100 }

describe('lanterna', () => {
  it('sai do centro do token, virado pra baixo no giro 0', () => {
    const c = coneDaLanterna(token, 'comum', celula, 2)
    expect(c.pontos[0]).toEqual({ x: 50, y: 50 })
    expect(c.raio).toBe(500)
    // ponto do meio do arco: reto pra baixo
    expect(c.pontos[2]).toEqual({ x: 50, y: 550 })
  })
  it('gira junto com o token', () => {
    const c = coneDaLanterna({ ...token, rotation: 90 }, 'comum', celula, 2)
    // 90° no sentido horário a partir de "baixo" = esquerda
    expect(c.pontos[2]).toEqual({ x: -450, y: 50 })
  })
  it('a UV alcança menos', () => {
    expect(coneDaLanterna(token, 'uv', celula).raio).toBeLessThan(coneDaLanterna(token, 'comum', celula).raio)
  })
  it('só tokens com lanterna; token escondido não ilumina pros jogadores', () => {
    const lista = [
      { ...token, id: 'a', lanterna: 'comum' as const },
      { ...token, id: 'b', lanterna: null },
      { ...token, id: 'c', lanterna: 'uv' as const, layer: 'mestre' as const },
      { ...token, id: 'd', lanterna: 'uv' as const, layer: 'mapa' as const },
    ]
    expect(conesDosTokens(lista, celula, false).map((c) => c.id)).toEqual(['a'])
    expect(conesDosTokens(lista, celula, true).map((c) => c.id)).toEqual(['a', 'c'])
  })
  it('revelação só com luz UV', () => {
    const comum = conesDosTokens([{ ...token, lanterna: 'comum' as const }], celula, false)
    expect(caminhoDaLuzUv(comum)).toBeNull()
    const uv = conesDosTokens([{ ...token, lanterna: 'uv' as const }], celula, false)
    expect(caminhoDaLuzUv(uv)).toMatch(/^M50 50L/)
  })
})
