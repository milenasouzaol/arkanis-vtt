import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InventoryItemCard from './InventoryItemCard'

const arma = {
  type: 'arma',
  name: 'Faca',
  category: 'II',
  spaces: 2,
  description: 'Uma faca bem afiada.',
  stats: { dano: '2d8', critico: '19/x3', alcance: 'curto', natureza: 'corpo_a_corpo', empunhadura: 'uma_mao' },
}

describe('InventoryItemCard', () => {
  it('fechado, mostra o resumo da arma e esconde o detalhe', () => {
    render(<InventoryItemCard item={arma} expanded={false} onToggle={() => {}} />)

    expect(screen.getByText('Faca')).toBeInTheDocument()
    expect(screen.getByText('2d8')).toBeInTheDocument()
    expect(screen.getByText('19/x3')).toBeInTheDocument()
    expect(screen.getByText('Curto')).toBeInTheDocument()
    expect(screen.getByText('II')).toBeInTheDocument()

    expect(screen.queryByText('Uma faca bem afiada.')).not.toBeInTheDocument()
    expect(screen.queryByText('Corpo a Corpo')).not.toBeInTheDocument()
  })

  it('aberto, mostra detalhe, descricao e as acoes', () => {
    render(
      <InventoryItemCard item={arma} expanded onToggle={() => {}} actions={<button type="button">Remover</button>} />,
    )

    expect(screen.getByText('Corpo a Corpo')).toBeInTheDocument()
    expect(screen.getByText('Uma Mão')).toBeInTheDocument()
    expect(screen.getByText('Uma faca bem afiada.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remover' })).toBeInTheDocument()
  })

  it('item sem stats de arma mostra so categoria e espaco', () => {
    render(<InventoryItemCard item={{ type: 'geral', name: 'Corda', category: 'I', spaces: 1 }} expanded={false} onToggle={() => {}} />)

    expect(screen.getByText('Categoria')).toBeInTheDocument()
    expect(screen.getByText('Espaço')).toBeInTheDocument()
    expect(screen.queryByText('Dano')).not.toBeInTheDocument()
  })

  // A linha de quantidade tem que aparecer com o card fechado, pra gastar uso sem abrir.
  it('mostra a quantidade mesmo fechado', () => {
    render(
      <InventoryItemCard item={arma} expanded={false} onToggle={() => {}} quantidade={<span>20/20</span>} />,
    )
    expect(screen.getByText('20/20')).toBeInTheDocument()
  })

  it('clicar no cabecalho avisa quem abre e fecha', async () => {
    const onToggle = vi.fn()
    render(<InventoryItemCard item={arma} expanded={false} onToggle={onToggle} />)

    await userEvent.click(screen.getByText('Faca'))
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
