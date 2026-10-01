import { describe, expect, it } from 'vitest'
import { lerRegra, normalizar, separarTermo } from './regrasExtras'

describe('lerRegra', () => {
  it('separa parágrafos, subtítulos e listas', () => {
    const texto = 'Introdução da regra.\n\nDireção Combativa:\n- Direção: ação completa.\n- Colidir: alvo testa Reflexos.\n\nFim.'
    expect(lerRegra(texto)).toEqual([
      { tipo: 'paragrafo', texto: 'Introdução da regra.' },
      { tipo: 'titulo', texto: 'Direção Combativa' },
      { tipo: 'lista', itens: ['Direção: ação completa.', 'Colidir: alvo testa Reflexos.'] },
      { tipo: 'paragrafo', texto: 'Fim.' },
    ])
  })

  // As tabelas de DT do banco vêm como "a · b · c" no fim do parágrafo.
  it('transforma "a · b · c" em sequência, guardando a introdução', () => {
    const [bloco] = lerRegra('Deslocamento: teste no início da cena: DT5→15m/rodada · DT10→18m · DT15→21m')
    expect(bloco).toEqual({
      tipo: 'paragrafo',
      texto: 'Deslocamento: teste no início da cena:',
      sequencia: ['DT5→15m/rodada', 'DT10→18m', 'DT15→21m'],
    })
  })

  it('dois itens com "·" continuam sendo texto comum', () => {
    expect(lerRegra('Um · dois')).toEqual([{ tipo: 'paragrafo', texto: 'Um · dois' }])
  })

  it('lista fecha mesmo sem linha em branco antes do próximo parágrafo', () => {
    expect(lerRegra('- a\n- b\nDepois.').map((b) => b.tipo)).toEqual(['lista', 'paragrafo'])
  })
})

describe('separarTermo', () => {
  it('pega o termo antes dos dois-pontos', () => {
    expect(separarTermo('Colidir: alvo testa Reflexos.')).toEqual({ termo: 'Colidir', resto: 'alvo testa Reflexos.' })
  })

  // Frase comum com dois-pontos no meio não vira termo.
  it('não pega frase longa nem frase com ponto antes', () => {
    expect(separarTermo('Isso aqui é uma frase bem comprida que segue até: o fim').termo).toBeNull()
    expect(separarTermo('Fim da cena. Depois: nada').termo).toBeNull()
  })
})

it('normalizar ignora acento e maiúscula', () => {
  expect(normalizar('Conjuração')).toBe(normalizar('conjuracao'))
})
