import { describe, expect, it } from 'vitest'
import { ABAS_DIREITA, calcularFps, conectados, linkDeConvite, primeiroNome, rotuloJogador, type Membro } from './mesa'

const membros: Membro[] = [
  { userId: 'j2', papel: 'jogador', nomeConta: 'Pedro Alves', personagem: 'Zeca' },
  { userId: 'm', papel: 'mestre', nomeConta: 'Millie', personagem: null },
  { userId: 'j1', papel: 'jogador', nomeConta: 'Maria Souza', personagem: 'Arthur' },
  { userId: 'j3', papel: 'jogador', nomeConta: 'Ana', personagem: null },
]

describe('rótulos do painel de sessão', () => {
  it('reduz a conta ao primeiro nome', () => {
    expect(primeiroNome('  Maria   Souza ')).toBe('Maria')
    expect(primeiroNome('')).toBe('Sem nome')
  })

  it('mostra "Personagem (PrimeiroNome)"', () => {
    expect(rotuloJogador({ nomeConta: 'Millie Lucas', personagem: 'Novo Agente' })).toBe('Novo Agente (Millie)')
  })

  it('sem personagem mostra só a conta', () => {
    expect(rotuloJogador({ nomeConta: 'Ana Lima', personagem: null })).toBe('Ana')
    expect(rotuloJogador({ nomeConta: 'Ana Lima', personagem: '  ' })).toBe('Ana')
  })
})

describe('conectados', () => {
  it('lista só quem está com a mesa aberta, mestre primeiro', () => {
    const lista = conectados(membros, [{ userId: 'j2' }, { userId: 'j1' }, { userId: 'm' }])
    expect(lista.map((m) => m.userId)).toEqual(['m', 'j1', 'j2'])
  })

  it('conta uma vez quem abriu em várias abas', () => {
    expect(conectados(membros, [{ userId: 'j1' }, { userId: 'j1' }])).toHaveLength(1)
  })

  it('ignora presença de quem não é membro', () => {
    expect(conectados(membros, [{ userId: 'intruso' }])).toEqual([])
  })
})

describe('calcularFps', () => {
  it('conta quadros por segundo', () => {
    const instantes = Array.from({ length: 61 }, (_, i) => i * (1000 / 60))
    expect(calcularFps(instantes)).toBe(60)
  })

  it('sem quadros suficientes dá zero', () => {
    expect(calcularFps([])).toBe(0)
    expect(calcularFps([5, 5])).toBe(0)
  })
})

describe('barra direita', () => {
  it('segue a ordem da spec, começando pelo chat', () => {
    expect(ABAS_DIREITA.map((a) => a.id)).toEqual(['chat', 'combate', 'cenas', 'posicionaveis', 'personagens', 'itens', 'diario', 'playlist', 'config'])
  })
})

it('monta o link de convite', () => {
  expect(linkDeConvite('https://arkanis.app', 'abc123')).toBe('https://arkanis.app/campanha/entrar/abc123')
})
