import { describe, expect, it } from 'vitest'
import { naFicha, reforcoDoPico, somDoRitual } from './sons'

describe('sons', () => {
  it('normaliza: som baixinho ganha reforço, som alto fica como está', () => {
    expect(reforcoDoPico(0.02)).toBeCloseTo(45)
    expect(reforcoDoPico(0.9)).toBe(1)
    expect(reforcoDoPico(0.95)).toBe(1)
    expect(reforcoDoPico(0.001)).toBe(60)
    expect(reforcoDoPico(0)).toBe(1)
  })
  it('som do ritual pelo elemento', () => {
    expect(somDoRitual('Sangue')).toBe('ritual-sangue')
    expect(somDoRitual('Conhecimento')).toBe('ritual-conhecimento')
    expect(somDoRitual('MEDO')).toBe('ritual-medo')
    expect(somDoRitual('Varia')).toBeNull()
    expect(somDoRitual(null)).toBeNull()
  })
  it('sons de interface: só na ficha', () => {
    const em = (p: string) => { window.history.replaceState(null, '', p); return naFicha() }
    expect(em('/personagem/abc-123')).toBe(true)
    expect(em('/personagem/abc-123?mesa=x')).toBe(true)
    expect(em('/mesa/abc')).toBe(false)
    expect(em('/personagem/criar')).toBe(false)
    expect(em('/personagem/criar/ordem_paranormal')).toBe(false)
    expect(em('/')).toBe(false)
  })
})
