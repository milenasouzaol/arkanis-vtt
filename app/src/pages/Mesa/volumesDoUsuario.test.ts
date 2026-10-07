import { describe, expect, it } from 'vitest'
import { efeitosMudos, lerVolumes, salvarEfeitosMudos, salvarVolume } from './volumesDoUsuario'

describe('volume da ficha = Efeitos Sonoros da mesa', () => {
  it('o controle da ficha muda o volume que os sons usam', () => {
    salvarVolume('efeitos', 0.3)
    expect(lerVolumes().efeitos).toBe(0.3)
  })

  it('Desligar sons cala sem perder o volume', () => {
    salvarEfeitosMudos(true)
    expect(efeitosMudos()).toBe(true)
    expect(lerVolumes().efeitos).toBe(0.3)
    salvarEfeitosMudos(false)
    expect(efeitosMudos()).toBe(false)
  })
})
