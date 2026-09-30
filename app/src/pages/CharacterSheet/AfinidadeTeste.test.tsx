import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AfinidadeTeste from './AfinidadeTeste'
import { PERGUNTAS } from './testeAfinidade'

async function comecar() {
  const onResultado = vi.fn()
  const onDesistir = vi.fn()
  render(<AfinidadeTeste onResultado={onResultado} onDesistir={onDesistir} />)
  return { onResultado, onDesistir }
}

describe('AfinidadeTeste', () => {
  it('começa na tela de Atenção', async () => {
    await comecar()
    expect(screen.getByText('Atenção!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Transcender/ })).toBeInTheDocument()
  })

  it('Voltar da introdução desiste', async () => {
    const { onDesistir } = await comecar()
    await userEvent.click(screen.getByRole('button', { name: /Voltar/ }))
    expect(onDesistir).toHaveBeenCalledOnce()
  })

  it('Transcender abre a primeira pergunta', async () => {
    await comecar()
    await userEvent.click(screen.getByRole('button', { name: /Transcender/ }))
    expect(screen.getByText(`1/${PERGUNTAS.length}`)).toBeInTheDocument()
    expect(screen.getByText(PERGUNTAS[0].texto)).toBeInTheDocument()
  })

  it('Continuar só libera depois de escolher', async () => {
    await comecar()
    await userEvent.click(screen.getByRole('button', { name: /Transcender/ }))
    const continuar = screen.getByRole('button', { name: /Continuar/ })
    expect(continuar).toBeDisabled()
    await userEvent.click(screen.getByText(PERGUNTAS[0].opcoes[0].texto))
    expect(continuar).toBeEnabled()
  })

  it('a primeira pergunta não tem Voltar', async () => {
    await comecar()
    await userEvent.click(screen.getByRole('button', { name: /Transcender/ }))
    expect(screen.queryByRole('button', { name: /Voltar/ })).toBeNull()
  })

  it('as bolinhas marcam respondida, atual e futura', async () => {
    const { container } = render(<AfinidadeTeste onResultado={() => {}} onDesistir={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /Transcender/ }))
    await userEvent.click(screen.getByText(PERGUNTAS[0].opcoes[0].texto))
    await userEvent.click(screen.getByRole('button', { name: /Continuar/ }))
    const marcadores = [...container.querySelectorAll('.afin-teste-marcador')]
    expect(marcadores).toHaveLength(PERGUNTAS.length)
    expect(marcadores[0]).toHaveClass('respondida')
    expect(marcadores[1]).toHaveClass('atual')
    expect(marcadores[2]).toHaveClass('futura')
  })

  it('voltar mantém a resposta que já tinha sido escolhida', async () => {
    await comecar()
    await userEvent.click(screen.getByRole('button', { name: /Transcender/ }))
    await userEvent.click(screen.getByText(PERGUNTAS[0].opcoes[3].texto))
    await userEvent.click(screen.getByRole('button', { name: /Continuar/ }))
    await userEvent.click(screen.getByRole('button', { name: /Voltar/ }))
    expect(screen.getByText(PERGUNTAS[0].opcoes[3].texto)).toHaveClass('escolhida')
  })

  it('Desistir no meio do teste volta pros três cartões', async () => {
    const { onDesistir } = await comecar()
    await userEvent.click(screen.getByRole('button', { name: /Transcender/ }))
    await userEvent.click(screen.getByText('Desistir'))
    expect(onDesistir).toHaveBeenCalledOnce()
  })

  it('depois da última vem a Extra, e Terminar entrega o elemento', async () => {
    const { onResultado } = await comecar()
    await userEvent.click(screen.getByRole('button', { name: /Transcender/ }))
    for (let i = 0; i < PERGUNTAS.length; i++) {
      // sempre a primeira opcao; o texto pode repetir entre perguntas, entao pega pelo papel
      const opcoes = document.querySelectorAll('.afin-teste-opcao')
      await userEvent.click(opcoes[0] as HTMLElement)
      await userEvent.click(screen.getByRole('button', { name: /Continuar/ }))
    }
    expect(screen.getByText('Extra')).toBeInTheDocument()
    await userEvent.click(document.querySelectorAll('.afin-teste-opcao')[0] as HTMLElement)
    await userEvent.click(screen.getByRole('button', { name: /Terminar/ }))
    // Pode cair no "Decida seu Destino" antes do resultado; se cair, escolhe o aceso.
    const escolher = screen.queryByRole('button', { name: 'Escolher' })
    if (escolher) await userEvent.click(escolher)
    expect(onResultado).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Aceitar' }))
    expect(onResultado).toHaveBeenCalledOnce()
    expect(['sangue', 'morte', 'conhecimento', 'energia']).toContain(onResultado.mock.calls[0][0])
  })
})
