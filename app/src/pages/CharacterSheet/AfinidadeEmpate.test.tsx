import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AfinidadeEmpate from './AfinidadeEmpate'
import AfinidadeResultado from './AfinidadeResultado'
import { empatados, ranking, PERGUNTAS } from './testeAfinidade'

describe('Decida seu Destino', () => {
  it('mostra só os empatados, com o primeiro aceso', () => {
    render(<AfinidadeEmpate opcoes={['energia', 'morte']} onEscolher={() => {}} />)
    expect(screen.getByText('Decida seu Destino')).toBeInTheDocument()
    const opcoes = screen.getAllByRole('button', { pressed: undefined }).filter((b) => b.classList.contains('afin-empate-opcao'))
    expect(opcoes).toHaveLength(2)
    expect(opcoes[0]).toHaveClass('escolhido')
  })

  // Energia tem emblema de arquetipo; quem nao tem usa o nome do elemento.
  it('Energia aparece como Transformação; os outros pelo nome', () => {
    render(<AfinidadeEmpate opcoes={['energia', 'morte']} onEscolher={() => {}} />)
    expect(screen.getByText('Transformação')).toBeInTheDocument()
    expect(screen.getByText('Morte')).toBeInTheDocument()
  })

  it('clicar troca o aceso e Escolher entrega ele', async () => {
    const onEscolher = vi.fn()
    render(<AfinidadeEmpate opcoes={['energia', 'morte']} onEscolher={onEscolher} />)
    await userEvent.click(screen.getByText('Morte'))
    await userEvent.click(screen.getByRole('button', { name: 'Escolher' }))
    expect(onEscolher).toHaveBeenCalledWith('morte')
  })
})

describe('resultado do teste', () => {
  it('mostra a frase do elemento e os outros reconhecidos', () => {
    render(<AfinidadeResultado ranking={['energia', 'sangue', 'morte', 'conhecimento']} onAceitar={() => {}} onRecusar={() => {}} />)
    expect(screen.getByText('O caos é inevitável.')).toBeInTheDocument()
    expect(screen.getByText('O Outro Lado também reconheceu:')).toBeInTheDocument()
    expect(screen.getByText('Sangue')).toBeInTheDocument()
  })

  it('Aceitar entrega o elemento; Recusar desiste', async () => {
    const onAceitar = vi.fn()
    const onRecusar = vi.fn()
    render(<AfinidadeResultado ranking={['morte', 'sangue', 'energia', 'conhecimento']} onAceitar={onAceitar} onRecusar={onRecusar} />)
    await userEvent.click(screen.getByRole('button', { name: 'Aceitar' }))
    expect(onAceitar).toHaveBeenCalledWith('morte')
    await userEvent.click(screen.getByRole('button', { name: 'Recusar' }))
    expect(onRecusar).toHaveBeenCalledOnce()
  })
})

describe('empate no cálculo', () => {
  it('ranking devolve os quatro, do mais forte pro mais fraco', () => {
    const r = ranking(PERGUNTAS.map(() => 0))
    expect([...r].sort()).toEqual(['conhecimento', 'energia', 'morte', 'sangue'])
  })

  it('o primeiro de empatados é sempre o primeiro do ranking', () => {
    for (let n = 0; n < 200; n++) {
      const resp = PERGUNTAS.map((p) => Math.floor(Math.random() * p.opcoes.length))
      expect(empatados(resp)[0]).toBe(ranking(resp)[0])
    }
  })

  it('com margem zero, só entra quem empatou de verdade', () => {
    for (let n = 0; n < 200; n++) {
      const resp = PERGUNTAS.map((p) => Math.floor(Math.random() * p.opcoes.length))
      expect(empatados(resp, 0).length).toBeLessThanOrEqual(empatados(resp).length)
    }
  })
})
