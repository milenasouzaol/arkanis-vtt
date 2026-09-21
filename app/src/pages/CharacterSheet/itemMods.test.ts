import { describe, expect, it } from 'vitest'
import { numerosDoAtaque, parseCritico, parseNumericMod, somaBonusNoDano, somaBonuses, statsComModificadores } from './itemMods'

const mod = (effect: string) => ({ kind: 'modificacao' as const, name: 'x', effect, elemento: null })

describe('parseNumericMod', () => {
  // Margem de ameaça conta ao contrário: +2 de margem abaixa o número.
  it('+2 em margem de ameaça baixa a margem em 2', () => {
    expect(parseNumericMod('+2 em margem de ameaça').threatMarginDelta).toBe(-2)
  })

  it('le bonus de dano, de ataque e de multiplicador', () => {
    expect(parseNumericMod('+2 em rolagens de dano').damageBonus).toBe(2)
    expect(parseNumericMod('+1 em testes de ataque').attackTestBonus).toBe(1)
    expect(parseNumericMod('+1 no multiplicador de crítico').multiplierDelta).toBe(1)
  })

  it('efeito sem numero nao vira bonus nenhum', () => {
    expect(parseNumericMod('O disparo não é ouvido além do alcance curto.')).toEqual({
      attackTestBonus: 0, threatMarginDelta: 0, damageBonus: 0, multiplierDelta: 0,
    })
  })
})

describe('somaBonuses', () => {
  it('acumula duas modificacoes', () => {
    expect(somaBonuses([mod('+2 em margem de ameaça'), mod('+1 em margem de ameaça')]).threatMarginDelta).toBe(-3)
  })
})

describe('parseCritico', () => {
  it('le margem e multiplicador', () => {
    expect(parseCritico('19/x3')).toEqual({ threatMargin: 19, multiplier: 3 })
  })

  it('assume 20/x2 quando o item nao diz', () => {
    expect(parseCritico(null)).toEqual({ threatMargin: 20, multiplier: 2 })
    expect(parseCritico('')).toEqual({ threatMargin: 20, multiplier: 2 })
  })

  it('aceita so a margem ou so o multiplicador', () => {
    expect(parseCritico('18')).toEqual({ threatMargin: 18, multiplier: 2 })
    expect(parseCritico('x4')).toEqual({ threatMargin: 20, multiplier: 4 })
  })
})

describe('somaBonusNoDano', () => {
  it('acrescenta o bonus quando nao havia nenhum', () => {
    expect(somaBonusNoDano('2d8', 2)).toBe('2d8+2')
  })

  it('junta com o bonus que ja existia em vez de empilhar', () => {
    expect(somaBonusNoDano('2d8+1', 2)).toBe('2d8+3')
  })

  it('bonus negativo pode zerar e sumir', () => {
    expect(somaBonusNoDano('2d8+2', -2)).toBe('2d8')
  })

  it('bonus zero nao mexe na formula', () => {
    expect(somaBonusNoDano('2d8', 0)).toBe('2d8')
  })
})

describe('statsComModificadores', () => {
  // O caso que a Millie apontou: crítico 19 com +2 de margem tem que virar 17.
  it('modificacao de margem muda o critico que aparece no card', () => {
    const r = statsComModificadores({ critico: '19/x3' }, [mod('+2 em margem de ameaça')])
    expect(r.critico).toBe('17/x3')
  })

  it('modificacao de dano soma no dano que aparece', () => {
    expect(statsComModificadores({ dano: '2d8' }, [mod('+2 em rolagens de dano')]).dano).toBe('2d8+2')
  })

  it('modificacao de multiplicador muda o multiplicador', () => {
    expect(statsComModificadores({ critico: '20/x2' }, [mod('+1 no multiplicador de crítico')]).critico).toBe('20/x3')
  })

  it('a margem nao passa de 20 - nao existe critico a partir de 21', () => {
    expect(statsComModificadores({ critico: '20/x2' }, [mod('-3 em margem de ameaça')]).critico).toBe('20/x2')
  })

  it('sem modificacao, devolve os stats como estavam', () => {
    const base = { critico: '19/x3', dano: '2d8' }
    expect(statsComModificadores(base, [])).toBe(base)
    expect(statsComModificadores(base, undefined)).toBe(base)
  })

  it('modificacao sem numero nao mexe em nada', () => {
    const base = { critico: '19/x3', dano: '2d8' }
    expect(statsComModificadores(base, [mod('Silencioso.')])).toBe(base)
  })

  it('nao altera o objeto original', () => {
    const base = { critico: '19/x3' }
    statsComModificadores(base, [mod('+2 em margem de ameaça')])
    expect(base.critico).toBe('19/x3')
  })
})

describe('numerosDoAtaque', () => {
  it('sem modificacao, usa os numeros do proprio item', () => {
    const r = numerosDoAtaque({ critico: '18/x3', dano: '1d10', tipo_dano: 'P' }, [])
    expect(r.threatMargin).toBe(18)
    expect(r.multiplier).toBe(3)
    expect(r.damage).toEqual([{ formula: '1d10', tipo: 'P' }])
    expect(r.d20Bonus).toBe(0)
  })

  // O caso da Millie: tirar a maldição tem que devolver o número original.
  it('tirar a modificacao devolve o numero de antes', () => {
    const mods = [mod('+2 em margem de ameaça')]
    expect(numerosDoAtaque({ critico: '18/x3' }, mods).threatMargin).toBe(16)
    expect(numerosDoAtaque({ critico: '18/x3' }, []).threatMargin).toBe(18)
  })

  it('maldicao com bonus numerico conta igual a modificacao', () => {
    const maldicao = { kind: 'maldicao' as const, name: 'x', effect: '+2 em margem de ameaça', elemento: null }
    expect(numerosDoAtaque({ critico: '19/x2' }, [maldicao]).threatMargin).toBe(17)
  })

  it('Dum Dum sobe o multiplicador, e so vale como modificacao', () => {
    const comoMod = { kind: 'modificacao' as const, name: 'Dum Dum', effect: '', elemento: null }
    const comoMaldicao = { kind: 'maldicao' as const, name: 'Dum Dum', effect: '', elemento: null }
    expect(numerosDoAtaque({ critico: '20/x2' }, [comoMod]).multiplier).toBe(3)
    expect(numerosDoAtaque({ critico: '20/x2' }, [comoMaldicao]).multiplier).toBe(2)
  })

  it('Explosiva acrescenta uma linha de dano', () => {
    const explosiva = { kind: 'modificacao' as const, name: 'Explosiva', effect: '', elemento: null }
    const r = numerosDoAtaque({ dano: '2d6', tipo_dano: 'B' }, [explosiva])
    expect(r.damage).toHaveLength(2)
    expect(r.damage[1]).toEqual({ formula: '2d6', tipo: 'explosão adicional' })
  })

  it('acumula modificacoes da arma e da municao', () => {
    const r = numerosDoAtaque({ critico: '20/x2' }, [mod('+1 em margem de ameaça'), mod('+1 em margem de ameaça')])
    expect(r.threatMargin).toBe(18)
  })

  it('margem nao passa de 20 e multiplicador nao desce de 1', () => {
    expect(numerosDoAtaque({ critico: '20/x2' }, [mod('-5 em margem de ameaça')]).threatMargin).toBe(20)
    expect(numerosDoAtaque({ critico: '20/x2' }, [mod('-5 no multiplicador de crítico')]).multiplier).toBe(1)
  })
})
