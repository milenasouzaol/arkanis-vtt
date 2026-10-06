import { describe, expect, it } from 'vitest'
import { reforcoDoPico, somDoRitual } from './sons'

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
})
