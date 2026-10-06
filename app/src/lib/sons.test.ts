import { describe, expect, it } from 'vitest'
import { somDoRitual } from './sons'

describe('sons', () => {
  it('som do ritual pelo elemento', () => {
    expect(somDoRitual('Sangue')).toBe('ritual-sangue')
    expect(somDoRitual('Conhecimento')).toBe('ritual-conhecimento')
    expect(somDoRitual('MEDO')).toBe('ritual-medo')
    expect(somDoRitual('Varia')).toBeNull()
    expect(somDoRitual(null)).toBeNull()
  })
})
