import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Campo, FichaAgente, TITULO_PADRAO } from './InvestigacaoTab'
import type { CharacterRecord } from './index'

const agente = {
  id: '11111111-2222-3333-4444-555555555555',
  name: 'Ana Ferraz',
  doc_number: '004-7721',
  avatar_url: null,
} as unknown as CharacterRecord

describe('Campo', () => {
  it('mostra o titulo e o placeholder da referencia', () => {
    render(<Campo titulo="Aparência" valor="" onChange={() => {}} />)
    expect(screen.getByText('Aparência')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Escreva aqui...')).toBeInTheDocument()
  })

  it('avisa a cada tecla, pra salvar enquanto a pessoa escreve', async () => {
    const onChange = vi.fn()
    render(<Campo titulo="Objetivo" valor="" onChange={onChange} />)
    await userEvent.type(screen.getByPlaceholderText('Escreva aqui...'), 'oi')
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('so o Titulo/Identificador vem invertido', () => {
    const { container, rerender } = render(<Campo titulo="Resumo" valor="" onChange={() => {}} />)
    expect(container.querySelector('.inv-campo')).not.toHaveClass('destaque')
    rerender(<Campo titulo="Título/Identificador" valor="" onChange={() => {}} destaque />)
    expect(container.querySelector('.inv-campo')).toHaveClass('destaque')
  })
})

describe('FichaAgente', () => {
  it('traz nome, documento, origem e classe', () => {
    render(<FichaAgente character={agente} originName="Militar" className="Combatente" />)
    expect(screen.getByText('Ana Ferraz')).toBeInTheDocument()
    expect(screen.getByText('Agente Nº 004-7721')).toBeInTheDocument()
    expect(screen.getByText('Militar')).toBeInTheDocument()
    expect(screen.getByText('Combatente')).toBeInTheDocument()
  })

  // Personagem recem-criado ainda nao escolheu origem nem classe.
  it('sem origem ou classe, mostra um traco em vez de vazio', () => {
    render(<FichaAgente character={agente} originName={null} className={null} />)
    expect(screen.getAllByText('—')).toHaveLength(2)
  })

  // Sem foto o app inteiro usa a cor sorteada do personagem com a logo por cima.
  it('sem foto, cai na cor do personagem com a logo do Arkanis', () => {
    const { container } = render(<FichaAgente character={agente} originName={null} className={null} />)
    const foto = container.querySelector('.inv-ficha-foto') as HTMLElement
    expect(foto.style.background).not.toBe('')
    expect(foto.querySelector('.sem-foto')).toBeTruthy()
  })

  it('com foto, nao pinta o fundo nem usa a logo', () => {
    const comFoto = { ...agente, avatar_url: 'https://exemplo/ana.png' } as CharacterRecord
    const { container } = render(<FichaAgente character={comFoto} originName={null} className={null} />)
    const foto = container.querySelector('.inv-ficha-foto') as HTMLElement
    expect(foto.style.background).toBe('')
    expect(foto.querySelector('.sem-foto')).toBeNull()
  })
})

describe('titulo padrao da pagina', () => {
  it('e o nome que a aba mostra antes de a pessoa renomear', () => {
    expect(TITULO_PADRAO).toBe('Investigação')
  })
})
