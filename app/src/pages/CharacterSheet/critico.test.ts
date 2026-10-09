import { describe, expect, it } from 'vitest'
import { numerosDoAtaque, parseCritico, partesDoCritico, statsComModificadores, type AppliedModifier } from './itemMods'

const perigosa: AppliedModifier = { kind: 'modificacao', name: 'Perigosa', effect: '+2 em margem de ameaça', elemento: null }

describe('crítico: margem e multiplicador separados', () => {
  it('lê pelo formato, em qualquer ordem', () => {
    expect(parseCritico('x3')).toEqual({ threatMargin: 20, multiplier: 3 })
    expect(parseCritico('19')).toEqual({ threatMargin: 19, multiplier: 2 })
    expect(parseCritico('19/x3')).toEqual({ threatMargin: 19, multiplier: 3 })
    expect(parseCritico('x3/19')).toEqual({ threatMargin: 19, multiplier: 3 })
    expect(parseCritico('19-20/x2')).toEqual({ threatMargin: 19, multiplier: 2 })
  })

  it('texto estragado pelo editor antigo ("x3/x2") continua x3', () => {
    expect(parseCritico('x3/x2').multiplier).toBe(3)
  })

  it('o editor abre "x3" como multiplicador, não como margem', () => {
    expect(partesDoCritico('x3')).toEqual({ margem: null, multiplicador: 3 })
  })

  it('Perigosa diminui a margem e mantém o x3 (Machadinha do amigo)', () => {
    expect(statsComModificadores({ critico: 'x3' }, [perigosa]).critico).toBe('18/x3')
    expect(statsComModificadores({ critico: '20/x3' }, [perigosa]).critico).toBe('18/x3')
    const n = numerosDoAtaque({ critico: 'x3', dano: '1d6' }, [perigosa])
    expect(n.threatMargin).toBe(18)
    expect(n.multiplier).toBe(3)
  })
})
