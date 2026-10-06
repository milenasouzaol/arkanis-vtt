import { describe, expect, it } from 'vitest'
import { botoesDaInteracao, dentroDoAlcance, distanciaEmMetros, passouNoTeste, proximas, rotuloDoTeste, semUsos, testeDe } from './interacao'
import { novaAtividade } from './itens'

const celula = { w: 100, h: 100 }
const caixa = (x: number, y: number, w = 100, h = 100) => ({ x, y, width: w, height: h })

describe('interação', () => {
  it('distância: encostado é 1 quadrado; um vão é 2', () => {
    expect(distanciaEmMetros(caixa(0, 0), caixa(100, 0), celula, 1.5)).toBe(1.5)
    expect(distanciaEmMetros(caixa(0, 0), caixa(200, 0), celula, 1.5)).toBe(3)
    // baú grande (2x2) encostado na diagonal
    expect(distanciaEmMetros(caixa(0, 0), caixa(100, 100, 200, 200), celula, 1.5)).toBe(1.5)
  })
  it('alcance', () => {
    expect(dentroDoAlcance(1.5, 1.5)).toBe(true)
    expect(dentroDoAlcance(3, 1.5)).toBe(false)
    expect(dentroDoAlcance(null, null)).toBe(true)
    expect(dentroDoAlcance(null, 9)).toBe(false)
  })
  it('botões: só o que dispara ao clicar', () => {
    const a = novaAtividade('checar', 'a')
    const b = { ...novaAtividade('conteiner', 'b'), ativacao: { ...a.ativacao, quando: 'nenhuma' } }
    expect(botoesDaInteracao([a, b]).map((x) => x.id)).toEqual(['a'])
  })
  it('o teste que a atividade pede, e o nome dele', () => {
    const c = { ...novaAtividade('checar'), checar: { pericia: 'Crime', atributo: '', dt: 20 } }
    expect(testeDe(c)).toEqual({ pericia: 'Crime', atributo: '', dt: 20 })
    expect(testeDe(novaAtividade('checar'))).toBeNull()
    expect(testeDe(novaAtividade('conteiner'))).toBeNull()
    expect(rotuloDoTeste({ pericia: 'Crime', atributo: '', dt: 20 }, [])).toBe('Teste de Crime')
    expect(rotuloDoTeste({ pericia: '', atributo: 'agilidade', dt: null }, [{ id: 'agilidade', rotulo: 'Agilidade' }])).toBe('Teste de Agilidade')
  })
  it('usos e teste', () => {
    const a = novaAtividade('checar')
    expect(semUsos(a)).toBe(false)
    expect(semUsos({ ativacao: { ...a.ativacao, usos: { gastos: 1, max: 1 } } })).toBe(true)
    expect(passouNoTeste(20, 20)).toBe(true)
    expect(passouNoTeste(19, 20)).toBe(false)
    expect(passouNoTeste(3, null)).toBe(true)
  })
  it('encadeamento: passar, falhar, em seguida e sem laço', () => {
    const a = { ...novaAtividade('checar', 'a'), seSim: ['b'], seNao: ['c'] }
    const b = { ...novaAtividade('conteiner', 'b'), seSim: ['a'] }
    const c = novaAtividade('dano', 'c')
    const lista = [a, b, c]
    expect(proximas(a, true, lista, new Set(['a'])).map((x) => x.id)).toEqual(['b'])
    expect(proximas(a, false, lista, new Set(['a'])).map((x) => x.id)).toEqual(['c'])
    expect(proximas(b, null, lista, new Set(['a', 'b']))).toEqual([])
  })
})
