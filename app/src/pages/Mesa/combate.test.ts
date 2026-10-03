import { describe, expect, it } from 'vitest'
import { elementoDaCriatura, lerPericias, filtrarAmeacas, lerTeste, ordemDeIniciativa, rolarDano, rolarTeste, testeDeIniciativa, vdTotal, type CriaturaLista } from './combate'

const c = (p: Partial<CriaturaLista>): CriaturaLista => ({
  id: 'x', name: 'X', vd: 10, image_url: null, tipo_criatura: null, tamanho: null, descritores: [], categoria: 'mundana', source_id: 'base', iniciativa: null, pv_maximo: null, ...p,
})

describe('elemento da criatura', () => {
  it('vem do descritor; mundana é Realidade', () => {
    expect(elementoDaCriatura(c({ descritores: ['Sangue'], categoria: 'paranormal' }))).toBe('sangue')
    expect(elementoDaCriatura(c({ descritores: ['Pessoa'] }))).toBe('realidade')
    expect(elementoDaCriatura(c({ descritores: [], categoria: 'paranormal' }))).toBe('medo')
  })
})

describe('lista de ameaças', () => {
  const lista = [
    c({ id: '1', name: 'Diabo', vd: 400, descritores: ['Sangue'], categoria: 'paranormal' }),
    c({ id: '2', name: 'Anfitrião', vd: 413, descritores: ['Energia'], categoria: 'paranormal', source_id: 'as' }),
    c({ id: '3', name: 'Policial', vd: 20 }),
  ]

  it('filtra por nome sem acento, elemento e livro', () => {
    expect(filtrarAmeacas(lista, { busca: 'anfitriao', elemento: 'todos', fonte: null }).map((x) => x.id)).toEqual(['2'])
    expect(filtrarAmeacas(lista, { busca: '', elemento: 'realidade', fonte: null }).map((x) => x.id)).toEqual(['3'])
    expect(filtrarAmeacas(lista, { busca: '', elemento: 'todos', fonte: 'as' }).map((x) => x.id)).toEqual(['2'])
    const dupla = [c({ id: '9', descritores: ['Morte', 'Sangue'], categoria: 'paranormal' })]
    expect(filtrarAmeacas(dupla, { busca: '', elemento: 'sangue', fonte: null })).toHaveLength(1)
    expect(filtrarAmeacas(dupla, { busca: '', elemento: 'morte', fonte: null })).toHaveLength(1)
  })

  it('VD Total soma tudo, contando repetidas (testado na spec: 400 + 413 = 813)', () => {
    expect(vdTotal(['1', '2'], lista)).toBe(813)
    expect(vdTotal(['3', '3'], lista)).toBe(40)
  })
})

describe('testes da ameaça', () => {
  it('lê "+5 (2d20)"', () => {
    expect(lerTeste('+5 (2d20)')).toEqual({ dados: 2, bonus: 5 })
    expect(lerTeste('+15 (4d20)')).toEqual({ dados: 4, bonus: 15 })
    expect(lerTeste('+0')).toEqual({ dados: 1, bonus: 0 })
    expect(lerTeste('-2 (1d20)')).toEqual({ dados: 1, bonus: -2 })
    expect(lerTeste(null)).toEqual({ dados: 1, bonus: 0 })
  })

  it('rola como a ficha: fica com o maior d20', () => {
    const r = rolarTeste({ dados: 3, bonus: 5 })
    expect(r.rolls).toHaveLength(3)
    expect(r.kept).toBe(Math.max(...r.rolls))
    expect(r.total).toBe(r.kept + 5)
  })

  it('iniciativa do jogador: Agilidade em dados + treino', () => {
    expect(testeDeIniciativa(3, 'treinado', 2)).toEqual({ dados: 3, bonus: 7 })
  })

  it('rola o dano com o tipo', () => {
    const d = rolarDano('1d4+2 perfuração')!
    expect(d.tipo).toBe('perfuração')
    expect(d.total).toBeGreaterThanOrEqual(3)
    expect(d.total).toBeLessThanOrEqual(6)
    expect(rolarDano('texto livre')).toBeNull()
  })
})

it('ordem de iniciativa: maior primeiro, empate pelo bônus', () => {
  const o = ordemDeIniciativa([
    { id: 'a', iniciativa: 10, desempate: 0, created_at: '1' },
    { id: 'b', iniciativa: 18, desempate: 0, created_at: '2' },
    { id: 'c', iniciativa: 10, desempate: 5, created_at: '3' },
  ])
  expect(o.map((x) => x.id)).toEqual(['b', 'c', 'a'])
})

it('lê a lista de perícias da ameaça', () => {
  expect(lerPericias('Crime +5 (2d20), Furtividade +5 (2d20)')).toEqual([
    { nome: 'Crime', teste: '+5 (2d20)' },
    { nome: 'Furtividade', teste: '+5 (2d20)' },
  ])
  expect(lerPericias(null)).toEqual([])
})
