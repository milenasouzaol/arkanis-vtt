import type { ReactNode } from 'react'
import { ICONES } from './icones'

// Botão quadrado de ícone da mesa (12.2): esmaecido por padrão, acende no hover
// mostrando o rótulo, e fica com a borda de destaque quando está ativo.
export function BotaoIcone({ id, rotulo, ativo, pisca, lado, onClick, children }: {
  id: string
  rotulo: string
  ativo?: boolean
  // Tem novidade (ex.: mensagem nova no chat): o botão pisca até ser aberto.
  pisca?: boolean
  lado: 'esquerda' | 'direita'
  onClick?: () => void
  children?: ReactNode
}) {
  return (
    <button
      type="button"
      className={`mesa-icone mesa-icone-${lado}${ativo ? ' ativo' : ''}${pisca ? ' pisca' : ''}`}
      aria-label={rotulo}
      aria-pressed={ativo}
      onClick={onClick}
    >
      {children ?? ICONES[id]}
      <span className="mesa-icone-rotulo" role="tooltip">{rotulo}</span>
    </button>
  )
}

export default function BarraIcones<T extends string>({ lado, itens, ativo, piscando = [], onEscolher }: {
  lado: 'esquerda' | 'direita'
  itens: { id: T; rotulo: string }[]
  ativo: T | null
  piscando?: T[]
  onEscolher: (id: T) => void
}) {
  return (
    <>
      {itens.map((item) => (
        <BotaoIcone key={item.id} id={item.id} rotulo={item.rotulo} lado={lado} ativo={ativo === item.id} pisca={piscando.includes(item.id)} onClick={() => onEscolher(item.id)} />
      ))}
    </>
  )
}
