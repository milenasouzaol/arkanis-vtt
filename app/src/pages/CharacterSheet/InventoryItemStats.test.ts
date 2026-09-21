import { describe, expect, it } from 'vitest'
import { detalhes, resumo } from './InventoryItemCard'

// Estes dois formatadores sao usados em dois lugares: no card da ficha e no painel de
// detalhe do modal de adicionar. Entao o que a pessoa le antes de adicionar o item e
// exatamente o que ela vai ver depois.

const faca = {
  type: 'arma',
  name: 'Faca',
  category: 'II',
  spaces: 2,
  stats: {
    dano: '1d4', critico: '19/x2', alcance: 'curto',
    natureza: 'corpo_a_corpo', empunhadura: 'uma_mao', proficiencia: 'simples',
  },
}

describe('resumo', () => {
  it('arma mostra dano, critico e alcance antes de categoria e espaco', () => {
    expect(resumo(faca)).toEqual([
      { label: 'Dano', value: '1d4' },
      { label: 'Crítico', value: '19/x2' },
      { label: 'Alcance', value: 'Curto' },
      { label: 'Categoria', value: 'II' },
      { label: 'Espaço', value: '2' },
    ])
  })

  it('protecao mostra defesa no lugar de dano', () => {
    const r = resumo({ type: 'protecao', name: 'Colete', category: 'I', spaces: 2, stats: { defesa: 5 } })
    expect(r).toContainEqual({ label: 'Defesa', value: '+5' })
    expect(r.some((e) => e.label === 'Dano')).toBe(false)
  })

  it('item geral mostra so categoria e espaco', () => {
    expect(resumo({ type: 'geral', name: 'Corda', category: 'I', spaces: 1 }))
      .toEqual([{ label: 'Categoria', value: 'I' }, { label: 'Espaço', value: '1' }])
  })

  it('arma sem stats nao quebra, mostra travessao', () => {
    const r = resumo({ type: 'arma', name: 'Improvisada', category: '0', spaces: null })
    expect(r).toContainEqual({ label: 'Dano', value: '—' })
    expect(r).toContainEqual({ label: 'Espaço', value: '0' })
  })
})

describe('detalhes', () => {
  it('traduz os codigos do banco para o texto que a pessoa le', () => {
    expect(detalhes(faca)).toEqual([
      { label: 'Tipo', value: 'Corpo a Corpo' },
      { label: 'Alcance', value: 'Curto' },
      { label: 'Empunhadura', value: 'Uma Mão' },
      { label: 'Proficiência', value: 'simples' },
    ])
  })

  it('traz a municao quando a arma pede uma', () => {
    expect(detalhes({ type: 'arma', name: 'Pistola', stats: { tipo_municao: 'Balas .40' } }))
      .toContainEqual({ label: 'Munição', value: 'Balas .40' })
  })

  it('omite o campo que o item nao tem, em vez de mostrar vazio', () => {
    expect(detalhes({ type: 'geral', name: 'Corda', stats: {} })).toEqual([])
  })

  it('codigo desconhecido aparece como veio, sem sumir da lista', () => {
    expect(detalhes({ type: 'arma', name: 'Estranha', stats: { natureza: 'sonica' } }))
      .toEqual([{ label: 'Tipo', value: 'sonica' }])
  })
})
