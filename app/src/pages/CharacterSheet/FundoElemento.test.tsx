import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import FundoElemento from './FundoElemento'

describe('FundoElemento', () => {
  // Conhecimento é o único com o ouro derretido; os outros seguem com o fundo borrado.
  it('Conhecimento usa o ouro derretido, em duas camadas', () => {
    const { container } = render(<FundoElemento elemento="conhecimento" />)
    expect(container.querySelector('.afin-fundo-ouro')).toBeTruthy()
    expect(container.querySelectorAll('.afin-ouro-camada')).toHaveLength(2)
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

  // Sem isso o filtro calcula as cores em espaço linear e o ouro vira areia clara.
  it('o filtro do ouro calcula as cores em sRGB', () => {
    const { container } = render(<FundoElemento elemento="conhecimento" />)
    for (const f of container.querySelectorAll('filter')) expect(f.getAttribute('color-interpolation-filters')).toBe('sRGB')
  })
})
