import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AfinidadeEscolha, { CAMINHOS } from './AfinidadeEscolha'

describe('os três caminhos', () => {
  it('são liberdade, destino e premonição, nessa ordem', () => {
    expect(CAMINHOS.map((c) => c.key)).toEqual(['escolher', 'teste', 'aleatorio'])
    expect(CAMINHOS.map((c) => c.rotulo)).toEqual(['Liberdade', 'Destino', 'Premonição'])
  })

  it('cada um tem símbolo e as duas linhas do título', () => {
    for (const c of CAMINHOS) {
      expect(c.simbolo).toBeTruthy()
      expect(c.titulo).toHaveLength(2)
      expect(c.detalhe).toContain('|')
    }
  })
})

describe('AfinidadeEscolha', () => {
  it('mostra os três cartões', () => {
    render(<AfinidadeEscolha onEscolher={() => {}} />)
    // "Escolha" aparece em dois cartões, então a segunda linha é o que distingue.
    expect(screen.getByText('seu Elemento')).toBeInTheDocument()
    expect(screen.getByText('Personalidade')).toBeInTheDocument()
    expect(screen.getByText('por Mim')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('avisa qual caminho foi clicado', async () => {
    const onEscolher = vi.fn()
    render(<AfinidadeEscolha onEscolher={onEscolher} />)
    await userEvent.click(screen.getAllByRole('button')[1])
    expect(onEscolher).toHaveBeenCalledWith('teste')
  })

  // O texto do rodapé é o que diferencia os cartões na leitura rápida.
  it('traz o detalhe de cada caminho', () => {
    render(<AfinidadeEscolha onEscolher={() => {}} />)
    expect(screen.getByText('Seleção direta | Sem julgamento')).toBeInTheDocument()
    expect(screen.getByText('30 perguntas | Revelação completa')).toBeInTheDocument()
    expect(screen.getByText('Caos | Aleatoriedade completa')).toBeInTheDocument()
  })
})
