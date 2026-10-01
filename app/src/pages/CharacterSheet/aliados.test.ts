import { describe, expect, it } from 'vitest'
import { textoDoAliado } from './AbilityPickerModal'

describe('textoDoAliado', () => {
  it('junta descrição, bônus e habilidade como no livro', () => {
    expect(textoDoAliado({ descricao: 'Jason é um protetor confiável.', bonus: 'Você recebe +1d20 em Fortitude.', habilidade_nome: 'Proteção de Jason', habilidade: 'Reduz o dano em 10.' }))
      .toBe('Jason é um protetor confiável.\n\nBônus. Você recebe +1d20 em Fortitude.\n\nProteção de Jason. Reduz o dano em 10.')
  })

  it('sem descrição, começa pelo bônus', () => {
    expect(textoDoAliado({ descricao: null, bonus: 'B.', habilidade_nome: 'H', habilidade: 'x' }).startsWith('Bônus.')).toBe(true)
  })
})
