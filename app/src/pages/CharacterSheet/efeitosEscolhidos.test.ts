import { describe, expect, it } from 'vitest'
import { custoExtraDeCondicoes, defesaDeCondicoes, penalidadeDeCondicoes } from './condicoes'
import { defesaDeModificadores, efeitosDoItem, efeitosValendo, somaBonuses, type AppliedModifier } from './itemMods'
import { lerCondicoesPersonalizadas, resumoDosEfeitos, type CondicaoPersonalizada } from './efeitosEscolhidos'

const amaldicoado: CondicaoPersonalizada = {
  nome: 'Marcado',
  efeitos: [
    { alvo: 'pericia', qual: 'Furtividade', modo: 'dados', valor: -1 },
    { alvo: 'resistencias', modo: 'valor', valor: -2 },
    { alvo: 'defesa', modo: 'valor', valor: -3 },
    { alvo: 'custo_ritual', modo: 'valor', valor: 1 },
  ],
}

describe('condição personalizada', () => {
  it('tira dado só na perícia escolhida', () => {
    expect(penalidadeDeCondicoes(['Marcado'], { atributo: 'agilidade', pericia: 'Furtividade' }, [amaldicoado]).dados).toBe(-1)
    expect(penalidadeDeCondicoes(['Marcado'], { atributo: 'agilidade', pericia: 'Acrobacia' }, [amaldicoado]).dados).toBe(0)
  })

  it('valor nos testes de resistência, com o motivo', () => {
    const r = penalidadeDeCondicoes(['Marcado'], { atributo: 'vigor', pericia: 'Fortitude' }, [amaldicoado])
    expect(r).toEqual({ dados: 0, valor: -2, motivos: ['Marcado -2'] })
  })

  it('Defesa e custo de ritual', () => {
    expect(defesaDeCondicoes(['Marcado'], [amaldicoado]).valor).toBe(-3)
    expect(custoExtraDeCondicoes(['Marcado'], [amaldicoado])).toBe(1)
  })

  it('sem a condição na ficha, não vale', () => {
    expect(defesaDeCondicoes([], [amaldicoado]).valor).toBe(0)
  })

  it('as do livro continuam iguais', () => {
    expect(penalidadeDeCondicoes(['Abalado'], { atributo: 'agilidade', pericia: 'Furtividade' })).toEqual({ dados: -1, valor: 0, motivos: ['Abalado -1d20'] })
  })

  it('lê do banco ignorando lixo', () => {
    expect(lerCondicoesPersonalizadas([{ nome: 'X', efeitos: [{ alvo: 'nada', valor: 1 }, { alvo: 'defesa', modo: 'valor', valor: '2' }] }, null, 3])).toEqual([
      { nome: 'X', descricao: undefined, icone: undefined, efeitos: [{ alvo: 'defesa', modo: 'valor', valor: 2 }] },
    ])
  })
})

describe('maldição/modificação personalizada', () => {
  const mod: AppliedModifier = {
    kind: 'maldicao', name: 'Sombria', effect: '+5 Defesa e +9 em testes de ataque (texto livre)', elemento: 'morte',
    efeitos: [
      { alvo: 'defesa', modo: 'valor', valor: 2 },
      { alvo: 'dano', modo: 'dados', valor: 1 },
      { alvo: 'pericia', qual: 'Furtividade', modo: 'valor', valor: 3, ligavel: true },
      { alvo: 'atributo', qual: 'agilidade', modo: 'valor', valor: 1 },
    ],
  }

  it('os efeitos escolhidos valem no lugar do texto', () => {
    expect(defesaDeModificadores([mod])).toBe(2)
    const b = somaBonuses([mod])
    expect(b.attackTestBonus).toBe(0)
    expect(b.extraDamageDice).toBe(1)
  })

  it('perícia "só quando ligado" vira liga/desliga', () => {
    const lista = efeitosDoItem('', [mod])
    expect(lista.find((e) => e.pericias?.includes('Furtividade'))?.condicao).toBe('Só quando ligado')
    expect(efeitosValendo('', [mod], []).some((e) => e.pericias)).toBe(false)
    const chave = lista.find((e) => e.pericias)!.chave
    expect(efeitosValendo('', [mod], [chave]).find((e) => e.pericias)?.valor).toBe(3)
    expect(efeitosValendo('', [mod], []).find((e) => e.alvo === 'agilidade')?.valor).toBe(1)
  })

  it('resumo legível', () => {
    expect(resumoDosEfeitos(mod.efeitos)).toBe('+2 Defesa; +1 dado de dano; +3 em Furtividade (quando ligado); +1 Agilidade')
  })
})
