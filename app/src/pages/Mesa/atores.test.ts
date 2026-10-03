import { describe, expect, it } from 'vitest'
import { copiaDoAtor, imagemDoToken, nivelDoJogador, nivelNaFichaDoJogador, nomeDoArquivo, variacoesDoToken, type Ator } from './atores'

const base: Ator = {
  id: 'a', campaign_id: 'c', folder_id: null, tipo: 'npc', character_id: 'ch', creature_id: null, name: 'Velho',
  token_url: 'https://x/p.png', token_variacoes: [{ id: '1', nome: 'ferido', url: 'https://x/f.png' }],
  acesso_padrao: 'nenhum', acesso_jogadores: { j: 'observador' }, mostrar_mestres: true, pv_atual: null, sort: 0, created_at: '',
}

describe('acesso', () => {
  it('individual vale mais que o padrão', () => {
    expect(nivelDoJogador(base, 'j')).toBe('observador')
    expect(nivelDoJogador(base, 'outro')).toBe('nenhum')
  })

  it('ficha de jogador segue os toggles da ficha', () => {
    expect(nivelNaFichaDoJogador(true, { hidden_from_others: true, editable_by_others: false })).toBe('dono')
    expect(nivelNaFichaDoJogador(false, { hidden_from_others: true, editable_by_others: true })).toBe('limitado')
    expect(nivelNaFichaDoJogador(false, { hidden_from_others: false, editable_by_others: true })).toBe('dono')
    expect(nivelNaFichaDoJogador(false, { hidden_from_others: false, editable_by_others: false })).toBe('observador')
  })
})

describe('tokens', () => {
  it('sem token principal usa a foto', () => {
    expect(imagemDoToken({ token_url: null }, 'foto.png')).toBe('foto.png')
    expect(imagemDoToken({ token_url: 'tok.png' }, 'foto.png')).toBe('tok.png')
    expect(imagemDoToken({ token_url: null }, null)).toBeNull()
  })

  it('variações começam pelo principal, sem repetir', () => {
    expect(variacoesDoToken(base).map((v) => v.nome)).toEqual(['Token Principal', 'ferido'])
    expect(variacoesDoToken({ token_url: 'https://x/f.png', token_variacoes: base.token_variacoes }).map((v) => v.nome)).toEqual(['Token Principal'])
  })

  it('nome da variação vem do arquivo', () => {
    expect(nomeDoArquivo('arthur_empunhando-arma.png')).toBe('arthur empunhando arma')
    expect(nomeDoArquivo('.png')).toBe('Variação')
  })
})

it('duplicar copia sem levar a ficha nem o id', () => {
  const c = copiaDoAtor(base)
  expect(c.name).toBe('Velho (cópia)')
  expect('id' in c || 'character_id' in c).toBe(false)
  expect(c.token_variacoes).toEqual(base.token_variacoes)
})
