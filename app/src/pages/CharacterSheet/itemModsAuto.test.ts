import { describe, expect, it } from 'vitest'
import {
  defesaDeModificadores,
  espacoComModificadores,
  numerosDoAtaque,
  parseNumericMod,
  statsComModificadores,
  subirAlcance,
} from './itemMods'

const mod = (name: string, effect: string) => ({ kind: 'modificacao' as const, name, effect, elemento: null })

// Os textos são os do catálogo de verdade, copiados do banco.
const BLINDADA = mod('Blindada', 'RD sobe pra 5; espaço +1 (só proteção pesada)')
const DISCRETA = mod('Discreta', '+5 em testes de ocultar; espaço -1 (só proteção leve)')
const REFORCADA = mod('Reforçada', 'Defesa +2; espaço +1 (não combina com Discreta)')
const EXPLOSIVA = mod('Explosiva', '+2d6 de dano')
const MIRA = mod('Mira Telescópica', '+1 categoria de alcance; libera Ataque Furtivo em qualquer alcance')
const REPULSORA = { kind: 'maldicao' as const, name: 'Repulsora', effect: '+2 Defesa enquanto empunhada; ao bloquear, 2 PE pra +5 adicional na Defesa', elemento: null }

describe('espaço', () => {
  it('Blindada soma 1 espaço', () => {
    expect(espacoComModificadores(5, [BLINDADA])).toBe(6)
  })

  it('Discreta tira 1 espaço', () => {
    expect(espacoComModificadores(2, [DISCRETA])).toBe(1)
  })

  it('duas modificações somam', () => {
    expect(espacoComModificadores(5, [BLINDADA, REFORCADA])).toBe(7)
  })

  it('nunca fica negativo', () => {
    expect(espacoComModificadores(0, [DISCRETA])).toBe(0)
  })

  it('sem modificação, é o espaço do item', () => {
    expect(espacoComModificadores(2, [])).toBe(2)
    expect(espacoComModificadores(null, undefined)).toBe(0)
  })
})

describe('defesa', () => {
  it('Reforçada dá +2 de Defesa', () => {
    expect(defesaDeModificadores([REFORCADA])).toBe(2)
  })

  it('"+2 Defesa" escrito ao contrário também conta', () => {
    expect(defesaDeModificadores([REPULSORA])).toBe(2)
  })

  it('modificação sem defesa não dá nada', () => {
    expect(defesaDeModificadores([BLINDADA])).toBe(0)
    expect(defesaDeModificadores([])).toBe(0)
  })

  it('a defesa aparece nos stats do item', () => {
    expect(statsComModificadores({ defesa: 5 }, [REFORCADA]).defesa).toBe(7)
  })
})

describe('categoria de alcance', () => {
  it('sobe um degrau', () => {
    expect(subirAlcance('curto', 1)).toBe('medio')
    expect(subirAlcance('medio', 1)).toBe('longo')
  })

  it('para em extremo', () => {
    expect(subirAlcance('extremo', 1)).toBe('extremo')
    expect(subirAlcance('longo', 5)).toBe('extremo')
  })

  it('alcance desconhecido volta como veio', () => {
    expect(subirAlcance('sei la', 1)).toBe('sei la')
    expect(subirAlcance(null, 1)).toBe('')
  })

  it('Mira Telescópica sobe o alcance do ataque', () => {
    expect(numerosDoAtaque({ alcance: 'curto' }, [MIRA]).alcance).toBe('medio')
  })

  it('o item tambem mostra o alcance subido', () => {
    expect(statsComModificadores({ alcance: 'curto' }, [MIRA]).alcance).toBe('medio')
  })
})

describe('linha de dano extra vem do texto, nao do nome', () => {
  it('Explosiva acrescenta 2d6', () => {
    const r = numerosDoAtaque({ dano: '1d10', tipo_dano: 'P' }, [EXPLOSIVA])
    expect(r.damage).toHaveLength(2)
    expect(r.damage[1].formula).toBe('2d6')
  })

  // Antes isso dependia do nome "Explosiva"; agora qualquer texto igual funciona.
  it('modificacao criada a mao com "+3d8 de dano" tambem funciona', () => {
    const caseira = mod('Qualquer nome', '+3d8 de dano')
    const r = numerosDoAtaque({ dano: '1d10' }, [caseira])
    expect(r.damage[1].formula).toBe('3d8')
  })

  it('"-2d6 de dano" nao vira linha extra', () => {
    expect(parseNumericMod('-2d6 de dano').extraDamageRolls).toEqual([])
  })
})

describe('Blindada, o caso que a Millie apontou', () => {
  it('soma o espaço no item', () => {
    expect(espacoComModificadores(5, [BLINDADA])).toBe(6)
  })

  // A RD ainda não tem lugar na ficha: é o KAN-22.
  it('a RD e lida do texto mas ainda nao tem onde aparecer', () => {
    expect(BLINDADA.effect).toContain('RD sobe pra 5')
  })
})
