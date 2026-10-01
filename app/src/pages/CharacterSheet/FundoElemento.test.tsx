import { describe, expect, it } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import FundoElemento from './FundoElemento'
import OuroLiquido, { FAIXAS } from './OuroLiquido'

describe('FundoElemento', () => {
  it('Conhecimento usa o ouro derretido', () => {
    const { container } = render(<FundoElemento elemento="conhecimento" />)
    expect(container.querySelector('.afin-fundo-ouro')).toBeTruthy()
    expect(container.querySelector('.afin-final-fundo')).toBeNull()
  })

  it('os outros elementos usam o fundo borrado com a correnteza', () => {
    for (const e of ['sangue', 'morte', 'energia'] as const) {
      const { container, unmount } = render(<FundoElemento elemento={e} />)
      expect(container.querySelector('.afin-final-fundo')).toBeTruthy()
      expect(container.querySelector('.afin-final-correnteza')).toBeTruthy()
      expect(container.querySelector('.afin-fundo-ouro')).toBeNull()
      unmount()
    }
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
