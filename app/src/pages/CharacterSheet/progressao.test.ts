import { describe, expect, it } from 'vitest'
import {
  NIVEIS_NEX, anteriorNex, estadoDoNivel, habilidadeDaMelhoria, lerGanhos, niveisAte, periciasNoGrau, proximoNex,
} from './progressao'

describe('lerGanhos', () => {
  it('separa os ganhos e dá o tipo de cada um', () => {
    expect(lerGanhos('Aumento de atributo, versatilidade')).toEqual([
      { tipo: 'atributo', texto: 'Aumento de atributo' },
      { tipo: 'versatilidade', texto: 'Versatilidade' },
    ])
  })

  // A vírgula dentro do parêntese faz parte do ganho, não separa.
  it('não quebra a vírgula de dentro do parêntese', () => {
    expect(lerGanhos('Eclético, perito (2 PE, +1d6)')).toEqual([
      { tipo: 'melhoria', texto: 'Eclético' },
      { tipo: 'melhoria', texto: 'Perito (2 PE, +1d6)' },
    ])
  })

  it('reconhece os tipos da tabela das classes', () => {
    expect(lerGanhos('Poder de combatente')[0].tipo).toBe('poder')
    expect(lerGanhos('Habilidade de trilha')[0].tipo).toBe('trilha')
    expect(lerGanhos('Grau de treinamento')[0].tipo).toBe('grau')
    expect(lerGanhos('Engenhosidade (expert), poder de especialista').map((g) => g.tipo)).toEqual(['melhoria', 'poder'])
    expect(lerGanhos('Escolhido pelo Outro Lado (2º círculo)')[0].tipo).toBe('melhoria')
  })

  it('texto vazio não tem ganho', () => {
    expect(lerGanhos('')).toEqual([])
    expect(lerGanhos(null)).toEqual([])
  })
})

describe('escada de NEX', () => {
  it('vai de 5% a 95% de 5 em 5 e termina em 99%', () => {
    expect(NIVEIS_NEX).toHaveLength(20)
    expect(NIVEIS_NEX[0]).toBe(5)
    expect(NIVEIS_NEX.at(-2)).toBe(95)
    expect(NIVEIS_NEX.at(-1)).toBe(99)
  })

  it('sobe e desce um nível', () => {
    expect(proximoNex(0)).toBe(5)
    expect(proximoNex(35)).toBe(40)
    expect(proximoNex(95)).toBe(99)
    expect(proximoNex(99)).toBe(99)
    expect(anteriorNex(99)).toBe(95)
    expect(anteriorNex(5)).toBe(0)
    expect(anteriorNex(0)).toBe(0)
  })

  it('estado e distância de cada nível', () => {
    expect(estadoDoNivel(20, 35)).toBe('alcancado')
    expect(estadoDoNivel(35, 35)).toBe('atual')
    expect(estadoDoNivel(40, 35)).toBe('futuro')
    expect(niveisAte(50, 35)).toBe(3)
    expect(niveisAte(99, 95)).toBe(1)
    expect(niveisAte(20, 35)).toBe(0)
  })
})

describe('perícias no grau de treinamento', () => {
  it('soma o Intelecto à base da classe', () => {
    expect(periciasNoGrau('Combatente', 1)).toBe(3)
    expect(periciasNoGrau('Especialista', 2)).toBe(7)
    expect(periciasNoGrau('Ocultista', 0)).toBe(3)
  })

  it('classe sem a regra não tem número', () => {
    expect(periciasNoGrau('Mundano', 3)).toBeNull()
    expect(periciasNoGrau(null, 3)).toBeNull()
  })
})

describe('habilidade da melhoria', () => {
  const base = [{ name: 'Ataque Especial' }, { name: 'Escolhido pelo Outro Lado' }, { name: 'Perito' }]

  it('acha a habilidade base pelo nome, sem o parêntese', () => {
    expect(habilidadeDaMelhoria('Ataque especial (3 PE, +10)', base)?.name).toBe('Ataque Especial')
    expect(habilidadeDaMelhoria('Escolhido pelo Outro Lado (2º círculo)', base)?.name).toBe('Escolhido pelo Outro Lado')
    expect(habilidadeDaMelhoria('Perito (4 PE, +1d10)', base)?.name).toBe('Perito')
  })

  it('sem habilidade com esse nome, não inventa', () => {
    expect(habilidadeDaMelhoria('Engenhosidade (veterano)', base)).toBeUndefined()
  })
})
