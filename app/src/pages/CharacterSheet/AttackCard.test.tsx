import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AttackCard, { caracteristicas } from './AttackCard'

describe('caracteristicas', () => {
  it('traduz os codigos que a arma do inventario traz', () => {
    expect(caracteristicas({ tipo: 'corpo_a_corpo', alcance: 'curto', empunhadura: 'uma_mao' })).toEqual([
      { label: 'Tipo', value: 'Corpo a Corpo' },
      { label: 'Alcance', value: 'Curto' },
      { label: 'Empunhadura', value: 'Uma Mão' },
    ])
  })

  it('prefere a municao vinculada ao tipo de municao exigido', () => {
    expect(caracteristicas({ tipo_municao: 'Balas .40', municao: 'Balas da Sarah' }))
      .toContainEqual({ label: 'Munição', value: 'Balas da Sarah' })
  })

  it('cai no tipo de municao quando nao ha nenhuma vinculada', () => {
    expect(caracteristicas({ tipo_municao: 'Balas .40', municao: null }))
      .toContainEqual({ label: 'Munição', value: 'Balas .40' })
  })

  it('arma branca nao mostra campo de municao vazio', () => {
    expect(caracteristicas({ tipo: 'corpo_a_corpo' })).toEqual([{ label: 'Tipo', value: 'Corpo a Corpo' }])
  })

  it('ataque sem informacao nenhuma nao quebra', () => {
    expect(caracteristicas(null)).toEqual([])
  })
})

const base = {
  name: 'Faca',
  ataque: '3d20',
  dano: '1d4 C',
  critico: '19/x2',
  info: { tipo: 'corpo_a_corpo', alcance: 'curto' },
  descricao: 'Bem afiada.',
  onToggle: () => {},
  onRemove: () => {},
  onEdit: () => {},
  rollButtons: <button type="button">Ataque</button>,
}

describe('AttackCard', () => {
  it('fechado, mostra ataque, dano e critico e esconde o resto', () => {
    render(<AttackCard {...base} expanded={false} />)

    expect(screen.getByText('3d20')).toBeInTheDocument()
    expect(screen.getByText('1d4 C')).toBeInTheDocument()
    expect(screen.getByText('19/x2')).toBeInTheDocument()

    expect(screen.queryByText('Corpo a Corpo')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })

  it('o botao de rolar continua acessivel com o card fechado', () => {
    render(<AttackCard {...base} expanded={false} />)
    expect(screen.getByRole('button', { name: 'Ataque' })).toBeInTheDocument()
  })

  it('aberto, mostra as caracteristicas, a descricao e Remover/Editar', () => {
    render(<AttackCard {...base} expanded />)

    expect(screen.getByText('Corpo a Corpo')).toBeInTheDocument()
    expect(screen.getByText('Curto')).toBeInTheDocument()
    expect(screen.getByText('Bem afiada.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remover' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
  })

  it('mostra a municao restante quando a arma tem uma vinculada', () => {
    render(<AttackCard {...base} expanded={false} municaoRestante="12/15 Balas" />)
    expect(screen.getByText('12/15 Balas')).toBeInTheDocument()
  })

  it('Editar avisa quem abre o modal', async () => {
    const onEdit = vi.fn()
    render(<AttackCard {...base} expanded onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    expect(onEdit).toHaveBeenCalledOnce()
  })
})
