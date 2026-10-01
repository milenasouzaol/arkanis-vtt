import { describe, expect, it, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import FundoElemento from './FundoElemento'
import OuroLiquido, { FAIXAS } from './OuroLiquido'
import GotaMorte from './GotaMorte'

describe('FundoElemento', () => {
  it('Conhecimento usa o ouro derretido', () => {
    const { container } = render(<FundoElemento elemento="conhecimento" />)
    expect(container.querySelector('.afin-fundo-ouro')).toBeTruthy()
    expect(container.querySelector('.afin-final-fundo')).toBeNull()
  })

  it('Morte usa a gota caindo na água', () => {
    const { container } = render(<FundoElemento elemento="morte" />)
    expect(container.querySelector('.afin-fundo-morte')).toBeTruthy()
    expect(container.querySelector('.afin-final-fundo')).toBeNull()
  })

  it('Energia usa o mármore roxo sem rumo', () => {
    const { container } = render(<FundoElemento elemento="energia" />)
    expect(container.querySelector('.afin-fundo-energia')).toBeTruthy()
    expect(container.querySelector('.afin-final-fundo')).toBeNull()
  })

  it('Sangue usa o fundo borrado com a correnteza', () => {
    for (const e of ['sangue'] as const) {
      const { container, unmount } = render(<FundoElemento elemento={e} />)
      expect(container.querySelector('.afin-final-fundo')).toBeTruthy()
      expect(container.querySelector('.afin-final-correnteza')).toBeTruthy()
      expect(container.querySelector('.afin-fundo-ouro')).toBeNull()
      unmount()
    }
  })
})

describe('GotaMorte', () => {
  it('sem WebGL, mostra o cinza escuro de Morte', async () => {
    const { container } = render(<GotaMorte />)
    await waitFor(() => expect(container.querySelector('.afin-morte-liso')).toBeTruthy())
  })
})

describe('OuroLiquido', () => {
  // Sem placa de video (o jsdom dos testes nao tem WebGL), cai no dourado liso em vez
  // de deixar o fundo preto.
  it('sem WebGL, mostra o dourado liso', async () => {
    const { container } = render(<OuroLiquido />)
    await waitFor(() => expect(container.querySelector('.afin-ouro-liso')).toBeTruthy())
    expect(container.querySelector('canvas')).toBeNull()
  })

  // As faixas sao os tons medidos no print de Conhecimento; o shader precisa de 12.
  it('tem as 12 faixas de cor do marmore, todas em tons de ouro', () => {
    expect(FAIXAS).toHaveLength(12)
    for (const [r, g, b] of FAIXAS) {
      expect(r).toBeGreaterThan(g)
      expect(g).toBeGreaterThan(b)
    }
  })
})

describe('OuroLiquido no StrictMode', () => {
  // O bug: o React (StrictMode) desmonta e monta de novo o mesmo canvas. Se a desmontagem
  // derrubar o contexto WebGL, a segunda montagem pega ele derrubado e cai no dourado liso.
  it('a desmontagem não derruba o contexto', async () => {
    const { StrictMode } = await import('react')
    const perdeu = vi.fn()
    // Contexto falso que aceita qualquer chamada, pra o efeito ir ate o fim e registrar a
    // desmontagem; so a extensao de derrubar e espionada.
    const contexto: unknown = new Proxy({}, {
      get: (_, nome) => {
        if (nome === 'getExtension') return () => ({ loseContext: perdeu })
        if (nome === 'getShaderParameter' || nome === 'getProgramParameter') return () => true
        if (typeof nome === 'string' && /^[A-Z_]+$/.test(nome)) return 0
        return () => ({})
      },
    })
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = (() => contexto) as never
    const { unmount } = render(<StrictMode><OuroLiquido parado /></StrictMode>)
    HTMLCanvasElement.prototype.getContext = original
    // O StrictMode ja desmontou e montou uma vez; o contexto tem que continuar de pe.
    expect(perdeu).not.toHaveBeenCalled()
    unmount()
  })
})
