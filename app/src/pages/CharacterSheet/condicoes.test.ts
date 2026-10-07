import { describe, expect, it } from 'vitest'
import { custoExtraDeCondicoes, defesaDeCondicoes, penalidadeDeCondicoes, rotuloComCondicoes } from './condicoes'

describe('penalidade nos testes', () => {
  it('Frustrado: -1d20 em Intelecto e Presença, nada no resto', () => {
    expect(penalidadeDeCondicoes(['Frustrado'], { atributo: 'presenca', pericia: 'Diplomacia' })).toEqual({ dados: -1, motivos: ['Frustrado -1d20'] })
    expect(penalidadeDeCondicoes(['Frustrado'], { atributo: 'intelecto' }).dados).toBe(-1)
    expect(penalidadeDeCondicoes(['Frustrado'], { atributo: 'agilidade', pericia: 'Acrobacia' }).dados).toBe(0)
  })

  it('Debilitado: -2d20 em Agilidade, Força e Vigor (inclusive ataque com FOR)', () => {
    expect(penalidadeDeCondicoes(['Debilitado'], { atributo: 'forca', ataque: 'corpo' }).dados).toBe(-2)
    expect(penalidadeDeCondicoes(['Debilitado'], { atributo: 'vigor', pericia: 'Fortitude' }).dados).toBe(-2)
  })

  it('perícias específicas, sem ligar pra acento', () => {
    expect(penalidadeDeCondicoes(['Surdo'], { atributo: 'agilidade', pericia: 'Iniciativa' }).dados).toBe(-2)
    expect(penalidadeDeCondicoes(['Fascinado'], { atributo: 'presenca', pericia: 'Percepcao' }).dados).toBe(-2)
    expect(penalidadeDeCondicoes(['Desprevenido'], { atributo: 'agilidade', pericia: 'Reflexos' }).dados).toBe(-1)
  })

  it('ataque: Caído só no corpo a corpo; Ofuscado em qualquer ataque', () => {
    expect(penalidadeDeCondicoes(['Caído'], { atributo: 'forca', ataque: 'corpo' }).dados).toBe(-2)
    expect(penalidadeDeCondicoes(['Caído'], { atributo: 'agilidade', ataque: 'distancia' }).dados).toBe(0)
    expect(penalidadeDeCondicoes(['Ofuscado'], { atributo: 'agilidade', ataque: 'distancia' }).dados).toBe(-1)
  })

  it('condições diferentes somam; a mesma duas vezes conta uma', () => {
    const r = penalidadeDeCondicoes(['Cego', 'Fraco', 'Fraco'], { atributo: 'agilidade', pericia: 'Reflexos' })
    expect(r.dados).toBe(-4) // Cego -2 (Agi) -1 (Reflexos), Fraco -1
    expect(r.motivos).toEqual(['Cego -3d20', 'Fraco -1d20'])
  })

  it('as genéricas contam aqui (antes ficavam num Modificador que não pesava em toda rolagem)', () => {
    expect(penalidadeDeCondicoes(['Abalado', 'Apavorado'], { atributo: 'presenca', pericia: 'Diplomacia' }).dados).toBe(-3)
  })
})

describe('Defesa', () => {
  it('vulnerável -2, desprevenido -5, indefeso -10 no lugar do desprevenido', () => {
    expect(defesaDeCondicoes(['Vulnerável']).valor).toBe(-2)
    expect(defesaDeCondicoes(['Desprevenido']).valor).toBe(-5)
    expect(defesaDeCondicoes(['Exausto', 'Agarrado']).valor).toBe(-7)
    expect(defesaDeCondicoes(['Desprevenido', 'Inconsciente'])).toEqual({ valor: -10, motivos: ['Inconsciente -10'] })
    expect(defesaDeCondicoes([]).valor).toBe(0)
  })
})

it('Alquebrado deixa ritual 1 PE mais caro', () => {
  expect(custoExtraDeCondicoes(['Alquebrado'])).toBe(1)
  expect(custoExtraDeCondicoes(['Frustrado'])).toBe(0)
})

it('rótulo mostra o porquê', () => {
  expect(rotuloComCondicoes('Teste de Diplomacia', ['Frustrado -1d20'])).toBe('Teste de Diplomacia (Frustrado -1d20)')
  expect(rotuloComCondicoes('Teste de Luta', [])).toBe('Teste de Luta')
})

describe('Abalado, Apavorado, Agarrado e Enredado (07/10)', () => {
  it('Abalado tira 1d20 e Apavorado 2d20 de qualquer teste', () => {
    expect(penalidadeDeCondicoes(['Abalado'], { atributo: 'forca' }).dados).toBe(-1)
    expect(penalidadeDeCondicoes(['Apavorado'], { atributo: 'intelecto', pericia: 'Investigação' }).dados).toBe(-2)
    expect(penalidadeDeCondicoes(['Apavorado'], { atributo: 'agilidade', ataque: 'distancia' }).motivos).toEqual(['Apavorado -2d20'])
  })

  it('Agarrado e Enredado tiram 1d20 dos ataques', () => {
    expect(penalidadeDeCondicoes(['Enredado'], { atributo: 'forca', ataque: 'corpo' }).dados).toBe(-1)
    expect(penalidadeDeCondicoes(['Enredado'], { atributo: 'forca', pericia: 'Atletismo' }).dados).toBe(0)
    expect(penalidadeDeCondicoes(['Agarrado'], { atributo: 'agilidade', ataque: 'distancia' }).dados).toBe(-1)
  })
})
