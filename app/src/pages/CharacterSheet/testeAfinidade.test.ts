import { describe, expect, it } from 'vitest'
import { PERGUNTAS, PERGUNTA_EXTRA, esperadoAoAcaso, maximoPossivel, pontuar, resultado, type Pergunta } from './testeAfinidade'

const ELEMENTOS = ['sangue', 'morte', 'conhecimento', 'energia'] as const

/** Sempre a opcao que mais da pro elemento escolhido. */
function responderComo(alvo: (typeof ELEMENTOS)[number]) {
  return PERGUNTAS.map((p) => {
    let melhor = 0
    let pontos = -1
    p.opcoes.forEach((o, i) => { if ((o.pontos[alvo] ?? 0) > pontos) { pontos = o.pontos[alvo] ?? 0; melhor = i } })
    return melhor
  })
}

describe('as perguntas', () => {
  it('estão em ordem e sem número repetido', () => {
    const numeros = PERGUNTAS.map((p) => p.numero)
    expect(numeros).toEqual([...numeros].sort((a, b) => a - b))
    expect(new Set(numeros).size).toBe(numeros.length)
  })

  it('toda opção dá ponto pra algum elemento', () => {
    for (const p of PERGUNTAS) for (const o of p.opcoes) expect(Object.keys(o.pontos).length).toBeGreaterThan(0)
  })

  it('toda opção vale 2 pontos no total, pra nenhuma pesar mais que outra', () => {
    for (const p of PERGUNTAS) {
      for (const o of p.opcoes) expect(Object.values(o.pontos).reduce((a, b) => a + (b ?? 0), 0)).toBe(2)
    }
  })

  it('a pergunta extra não conta ponto', () => {
    for (const o of PERGUNTA_EXTRA.opcoes) expect(o.pontos).toEqual({})
  })
})

describe('equilíbrio entre os elementos', () => {
  it('cada elemento consegue um máximo parecido', () => {
    const max = Object.values(maximoPossivel())
    expect(Math.max(...max) - Math.min(...max)).toBeLessThanOrEqual(6)
  })

  it('responder no estilo de um elemento dá esse elemento', () => {
    for (const e of ELEMENTOS) expect(resultado(responderComo(e), 0.5)).toBe(e)
  })

  // O motivo de dividir pela media: sem isso, Energia saia em ~16% e Morte em ~32%.
  it('respondendo ao acaso, os quatro saem mais ou menos por igual', () => {
    const conta: Record<string, number> = {}
    const n = 20000
    for (let i = 0; i < n; i++) {
      const r = resultado(PERGUNTAS.map((p) => Math.floor(Math.random() * p.opcoes.length)))
      conta[r] = (conta[r] ?? 0) + 1
    }
    for (const e of ELEMENTOS) expect(Math.abs((conta[e] ?? 0) / n - 0.25)).toBeLessThan(0.04)
  })

  it('o esperado ao acaso é positivo pra todos', () => {
    for (const v of Object.values(esperadoAoAcaso())) expect(v).toBeGreaterThan(0)
  })
})

describe('pontuar e resultado', () => {
  const duas: Pergunta[] = [
    { numero: 1, texto: '', opcoes: [{ texto: 'a', pontos: { sangue: 2 } }, { texto: 'b', pontos: { morte: 2 } }] },
    { numero: 2, texto: '', opcoes: [{ texto: 'a', pontos: { sangue: 2 } }, { texto: 'b', pontos: { morte: 2 } }] },
  ]

  it('soma os pontos das escolhas', () => {
    expect(pontuar([0, 0], duas).brutos.sangue).toBe(4)
    expect(pontuar([0, 1], duas).brutos).toMatchObject({ sangue: 2, morte: 2 })
  })

  it('pergunta sem resposta não conta', () => {
    expect(pontuar([0, undefined], duas).brutos.sangue).toBe(2)
  })

  // Empate: decide na sorte, e a sorte escolhe entre os empatados, nunca fora deles.
  it('empate é decidido na sorte entre os empatados', () => {
    expect(resultado([0, 1], 0.1, duas)).toBe('sangue')
    expect(resultado([0, 1], 0.9, duas)).toBe('morte')
  })
})
