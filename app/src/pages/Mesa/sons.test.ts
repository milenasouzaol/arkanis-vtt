import { describe, expect, it } from 'vitest'
import { volumeNoPonto, volumeParaOuvintes, type SomAmbiente } from './sons'

const som = (p: Partial<SomAmbiente> = {}): SomAmbiente => ({
  id: 's', scene_id: 'c', campaign_id: 'x', name: null, url: 'u', x: 0, y: 0, width: 200, height: 100,
  volume: 0.8, suavizar: true, escondido: false, ligado: true, created_at: '', ...p,
})

describe('som ambiente', () => {
  it('fora da área não toca', () => {
    expect(volumeNoPonto(som(), { x: 250, y: 50 })).toBe(0)
  })
  it('com suavização: máximo no centro, baixando até a borda', () => {
    expect(volumeNoPonto(som(), { x: 100, y: 50 })).toBe(0.8)
    expect(volumeNoPonto(som(), { x: 150, y: 50 })).toBe(0.4)
    expect(volumeNoPonto(som(), { x: 200, y: 50 })).toBe(0)
  })
  it('sem suavização: igual em toda a área', () => {
    expect(volumeNoPonto(som({ suavizar: false }), { x: 190, y: 90 })).toBe(0.8)
  })
  it('vale o token mais perto; desligado não toca; escondido só o mestre ouve', () => {
    const ouvintes = [{ x: 190, y: 50 }, { x: 110, y: 50 }]
    expect(volumeParaOuvintes(som(), ouvintes, false)).toBe(0.72)
    expect(volumeParaOuvintes(som({ ligado: false }), ouvintes, true)).toBe(0)
    expect(volumeParaOuvintes(som({ escondido: true }), ouvintes, false)).toBe(0)
    expect(volumeParaOuvintes(som({ escondido: true }), ouvintes, true)).toBe(0.72)
  })
})
