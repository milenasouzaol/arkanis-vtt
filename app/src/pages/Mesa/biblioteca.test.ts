import { describe, expect, it } from 'vitest'
import { buscaInicialDoItem, colecoesDa, filtrarBiblioteca, imagemDaBiblioteca, type TokenBiblioteca } from './biblioteca'

const t = (id: string, nome: string, tags: string[], colecao = 'JipeX Tokens', grupo: string | null = null): TokenBiblioteca => ({ id, nome, colecao, grupo, tags, w: 100, h: 200 })

const LISTA = [
  t('001', 'Fernanda', ['humano', 'feminino'], 'JipeX Tokens', 'Humanos / Feminino'),
  t('002', 'Henrique', ['humano', 'masculino'], 'JipeX Tokens', 'Humanos / Masculino'),
  t('042', 'A Enfermeira', ['humano', 'feminino'], 'O Speedrun na Floresta', 'Santo Berço'),
  t('300', 'Mulher afogada', ['criatura', 'sangue'], 'Ameaças do Outro Lado', 'Sangue'),
  t('301', 'Zumbi de sangue', ['criatura', 'sangue'], 'Ameaças do Outro Lado', 'Sangue'),
]

describe('filtrarBiblioteca', () => {
  it('sem busca mostra tudo', () => {
    expect(filtrarBiblioteca(LISTA, '  ')).toHaveLength(5)
  })

  it('procura pelo código, com ou sem # e zeros', () => {
    expect(filtrarBiblioteca(LISTA, '#042').map((x) => x.id)).toEqual(['042'])
    expect(filtrarBiblioteca(LISTA, '42').map((x) => x.id)).toEqual(['042'])
    expect(filtrarBiblioteca(LISTA, '1').map((x) => x.id)).toEqual(['001'])
  })

  it('"mulher" acha as personagens femininas e o que tem mulher no nome', () => {
    expect(filtrarBiblioteca(LISTA, 'mulher').map((x) => x.id)).toEqual(['001', '042', '300'])
  })

  it('"homem" e "monstro" viram as etiquetas', () => {
    expect(filtrarBiblioteca(LISTA, 'homem').map((x) => x.id)).toEqual(['002'])
    expect(filtrarBiblioteca(LISTA, 'monstro').map((x) => x.id)).toEqual(['300', '301'])
  })

  it('ignora acento e maiúscula, e todas as palavras têm que bater', () => {
    expect(filtrarBiblioteca(LISTA, 'santo berco').map((x) => x.id)).toEqual(['042'])
    expect(filtrarBiblioteca(LISTA, 'ZUMBI sangue').map((x) => x.id)).toEqual(['301'])
    expect(filtrarBiblioteca(LISTA, 'zumbi feminino')).toEqual([])
  })

  it('filtra pela coleção', () => {
    expect(filtrarBiblioteca(LISTA, '', 'Ameaças do Outro Lado').map((x) => x.id)).toEqual(['300', '301'])
    expect(filtrarBiblioteca(LISTA, 'mulher', 'JipeX Tokens').map((x) => x.id)).toEqual(['001'])
  })
})

describe('biblioteca', () => {
  it('lista as coleções na ordem em que aparecem', () => {
    expect(colecoesDa(LISTA)).toEqual(['JipeX Tokens', 'O Speedrun na Floresta', 'Ameaças do Outro Lado'])
  })

  it('a imagem fica na pasta pública da biblioteca', () => {
    expect(imagemDaBiblioteca({ id: '042' })).toBe('/biblioteca/img/042.webp')
  })
})

describe('itens na biblioteca', () => {
  it('"item" e "equipamento" acham os itens', () => {
    const lista = [t('400', 'Katana', ['item'], 'Itens e Equipamentos', 'Armas Brancas'), t('001', 'Fernanda', ['humano', 'feminino'])]
    expect(filtrarBiblioteca(lista, 'equipamento').map((x) => x.id)).toEqual(['400'])
    expect(filtrarBiblioteca(lista, 'armas').map((x) => x.id)).toEqual(['400'])
  })
})

describe('famílias de itens', () => {
  const lista = [
    t('401', 'Katana', ['item'], 'Itens e Equipamentos', 'Armas Brancas'),
    t('402', 'Espada', ['item'], 'Itens e Equipamentos', 'Armas Brancas'),
    t('403', 'Machado', ['item'], 'Itens e Equipamentos', 'Armas Brancas'),
    t('404', 'Revólver', ['item'], 'Itens e Equipamentos', 'Armas de Fogo'),
    t('405', 'Capacete 1', ['item'], 'Itens e Equipamentos', 'Capacetes'),
    t('406', 'Capa de Monstros', ['documento'], 'Atlas', 'Documentos'),
  ]

  it('"espada" acha as katanas também, e "katana" acha as espadas', () => {
    expect(filtrarBiblioteca(lista, 'espada').map((x) => x.id)).toEqual(['401', '402'])
    expect(filtrarBiblioteca(lista, 'katana').map((x) => x.id)).toEqual(['401', '402'])
  })

  it('"pistola" acha as armas de fogo', () => {
    expect(filtrarBiblioteca(lista, 'pistola').map((x) => x.id)).toEqual(['404'])
  })

  it('só os itens, quando pedido', () => {
    expect(filtrarBiblioteca(lista, 'capa', null, ['item']).map((x) => x.id)).toEqual(['405'])
  })

  it('a busca inicial é a palavra que diz o que o item é', () => {
    expect(buscaInicialDoItem('Pistola pesada')).toBe('pistola')
    expect(buscaInicialDoItem('Pé de Cabra')).toBe('cabra')
  })
})
