import { describe, expect, it } from 'vitest'
import { porcentagemNoPonto, volumeNoPonto, volumeParaOuvintes, type SomAmbiente } from './sons'

const som = (p: Partial<SomAmbiente> = {}): SomAmbiente => ({
  id: 's', scene_id: 'c', campaign_id: 'x', name: null, url: 'u', x: 0, y: 0, width: 200, height: 100,
  volume: 1, suavizar: true, escondido: false, ligado: true, created_at: '', ...p,
})

describe('som ambiente', () => {
  it('porcentagem: 100 no centro, diminuindo até 1 na borda, 0 fora', () => {
    expect(porcentagemNoPonto(som(), { x: 100, y: 50 })).toBe(100)
    expect(porcentagemNoPonto(som(), { x: 101, y: 50 })).toBe(99)
    expect(porcentagemNoPonto(som(), { x: 150, y: 50 })).toBe(50)
    expect(porcentagemNoPonto(som(), { x: 199, y: 50 })).toBe(1)
    expect(porcentagemNoPonto(som(), { x: 200, y: 50 })).toBe(1)
    expect(porcentagemNoPonto(som(), { x: 201, y: 50 })).toBe(0)
  })
  it('o áudio segue a curva de audição: a borda é um sussurro', () => {
    expect(volumeNoPonto(som(), { x: 100, y: 50 })).toBe(1)
    expect(volumeNoPonto(som(), { x: 150, y: 50 })).toBe(0.125)
    expect(volumeNoPonto(som(), { x: 190, y: 50 })).toBe(0.001)
    expect(volumeNoPonto(som({ volume: 0.5 }), { x: 100, y: 50 })).toBe(0.5)
  })
  it('sem suavização: igual em toda a área', () => {
    expect(volumeNoPonto(som({ suavizar: false, volume: 0.8 }), { x: 190, y: 90 })).toBe(0.8)
  })
  it('vale o token mais perto; desligado não toca; escondido só o mestre ouve', () => {
    const ouvintes = [{ x: 190, y: 50 }, { x: 150, y: 50 }]
    expect(volumeParaOuvintes(som(), ouvintes, false)).toBe(0.125)
    expect(volumeParaOuvintes(som({ ligado: false }), ouvintes, true)).toBe(0)
    expect(volumeParaOuvintes(som({ escondido: true }), ouvintes, false)).toBe(0)
    expect(volumeParaOuvintes(som({ escondido: true }), ouvintes, true)).toBe(0.125)
  })
})
