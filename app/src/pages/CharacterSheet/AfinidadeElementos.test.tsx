import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AfinidadeElementos from './AfinidadeElementos'
import AfinidadeFinal from './AfinidadeFinal'
import { ELEMENTOS, elementoPorChave } from './elementosParanormais'

describe('os quatro elementos', () => {
  it('são sangue, morte, energia e conhecimento', () => {
    expect(ELEMENTOS.map((e) => e.key).sort()).toEqual(['conhecimento', 'energia', 'morte', 'sangue'])
  })

  // As frases vêm dos prints da referência, uma por elemento.
  it('cada um tem a frase da tela final', () => {
    expect(elementoPorChave('sangue')?.frase).toBe('O fluxo que banha o Outro Lado')
    expect(elementoPorChave('morte')?.frase).toBe('Todas as coisas precisam de um fim.')
    expect(elementoPorChave('energia')?.frase).toBe('O caos é inevitável.')
    expect(elementoPorChave('conhecimento')?.frase).toBe('Saber tudo é perder tudo.')
  })

  it('as posições caem dentro da arte', () => {
    for (const e of ELEMENTOS) {
      expect(e.x).toBeGreaterThan(0)
      expect(e.x).toBeLessThan(100)
      expect(e.y).toBeGreaterThan(0)
      expect(e.y).toBeLessThan(100)
    }
  })

  // Sangue e energia ficam à esquerda do selo; morte e conhecimento à direita.
  it('ficam dois de cada lado do triângulo', () => {
    const esquerda = ELEMENTOS.filter((e) => e.x < 50).map((e) => e.key).sort()
    expect(esquerda).toEqual(['energia', 'sangue'])
  })

  it('chave desconhecida não quebra', () => {
    expect(elementoPorChave('medo')).toBeNull()
    expect(elementoPorChave(null)).toBeNull()
  })
})

describe('AfinidadeElementos', () => {
  it('sem escolha, mostra os quatro orbes e nenhum botão de aceitar', () => {
    render(<AfinidadeElementos onAceitar={() => {}} onVoltar={() => {}} />)
    for (const e of ELEMENTOS) expect(screen.getByRole('button', { name: e.nome })).toBeInTheDocument()
    expect(screen.queryByText('Aceitar o meu destino')).toBeNull()
  })

  it('escolher um elemento mostra o nome, a descrição e o botão de aceitar', async () => {
    render(<AfinidadeElementos onAceitar={() => {}} onVoltar={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Sangue' }))
    expect(screen.getByText('Vitalidade, fúria, o corpo levado ao extremo.')).toBeInTheDocument()
    expect(screen.getByText('Aceitar o meu destino')).toBeInTheDocument()
  })

  // O símbolo do escolhido passa pro meio do selo; o orbe dele some.
  it('o orbe escolhido some', async () => {
    render(<AfinidadeElementos onAceitar={() => {}} onVoltar={() => {}} />)
    const orbe = screen.getByRole('button', { name: 'Energia' })
    await userEvent.click(orbe)
    expect(orbe).toHaveClass('escondido')
  })

  it('aceitar avisa qual elemento foi escolhido', async () => {
    const onAceitar = vi.fn()
    render(<AfinidadeElementos onAceitar={onAceitar} onVoltar={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Morte' }))
    await userEvent.click(screen.getByText('Aceitar o meu destino'))
    expect(onAceitar).toHaveBeenCalledWith('morte')
  })

  it('trocar de ideia antes de aceitar vale o último', async () => {
    const onAceitar = vi.fn()
    render(<AfinidadeElementos onAceitar={onAceitar} onVoltar={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Sangue' }))
    await userEvent.click(screen.getByRole('button', { name: 'Conhecimento' }))
    await userEvent.click(screen.getByText('Aceitar o meu destino'))
    expect(onAceitar).toHaveBeenCalledWith('conhecimento')
  })
})

describe('AfinidadeFinal', () => {
  it('mostra a frase do elemento e finaliza', async () => {
    const onFinalizar = vi.fn()
    render(<AfinidadeFinal elemento="energia" onFinalizar={onFinalizar} onVoltar={() => {}} />)
    expect(screen.getByText('O caos é inevitável.')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Finalizar'))
    expect(onFinalizar).toHaveBeenCalledOnce()
  })

  it('voltar não finaliza', async () => {
    const onFinalizar = vi.fn()
    const onVoltar = vi.fn()
    render(<AfinidadeFinal elemento="sangue" onFinalizar={onFinalizar} onVoltar={onVoltar} />)
    await userEvent.click(screen.getByText('Voltar'))
    expect(onVoltar).toHaveBeenCalledOnce()
    expect(onFinalizar).not.toHaveBeenCalled()
  })
})
