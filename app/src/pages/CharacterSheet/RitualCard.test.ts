import { describe, expect, it } from 'vitest'
import { diceFromText } from './RitualCard'

// Os rituais do catalogo nao tem coluna de dados: a formula sai do texto do efeito.
describe('diceFromText', () => {
  it('acha a formula no meio do texto do efeito', () => {
    expect(diceFromText('O alvo sofre 8d6 pontos de dano de Energia.')).toBe('8d6')
  })

  it('leva o modificador junto e tira os espacos', () => {
    expect(diceFromText('cura 2d8 + 5 pontos de vida')).toBe('2d8+5')
  })

  it('pega a primeira formula quando o texto tem mais de uma', () => {
    expect(diceFromText('causa 3d6 de dano; com Verdadeiro, 8d6.')).toBe('3d6')
  })

  it('devolve null quando o ritual nao rola dado nenhum', () => {
    expect(diceFromText('O alvo fica paralisado até o fim da cena.')).toBeNull()
    expect(diceFromText('')).toBeNull()
    expect(diceFromText(null)).toBeNull()
    expect(diceFromText(undefined)).toBeNull()
  })
})
