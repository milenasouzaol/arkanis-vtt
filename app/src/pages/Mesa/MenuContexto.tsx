import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, type IconDefinition } from '@fortawesome/free-solid-svg-icons'

export type ItemMenu =
  | { tipo?: 'acao'; rotulo: string; icone?: IconDefinition; desativado?: boolean; perigo?: boolean; onClick: () => void }
  | { tipo: 'sub'; rotulo: string; icone?: IconDefinition; itens: ItemMenu[] }
  | { tipo: 'linha' }

// Menu do botão direito da mesa (12.8), no visual do print que a Millie mandou (03/10):
// fundo claro, separadores, submenus com seta e "Eliminar" em vermelho.
export default function MenuContexto({ x, y, itens, onFechar }: { x: number; y: number; itens: ItemMenu[]; onFechar: () => void }) {
  // Abre pra cima/esquerda quando não cabe na tela.
  const altura = itens.reduce((a, i) => a + (i.tipo === 'linha' ? 9 : 35), 12)
  const topo = Math.max(8, Math.min(y, window.innerHeight - altura - 8))
  const esquerda = Math.max(8, Math.min(x, window.innerWidth - 230))
  const subAEsquerda = esquerda + 230 + 210 > window.innerWidth

  return (
    <>
      <div className="dropdown-backdrop menu-ctx-fundo" onPointerDown={onFechar} onContextMenu={(e) => { e.preventDefault(); onFechar() }} />
      <Lista itens={itens} onFechar={onFechar} subAEsquerda={subAEsquerda} style={{ left: esquerda, top: topo }} raiz />
    </>
  )
}

function Lista({ itens, onFechar, subAEsquerda, style, raiz }: {
  itens: ItemMenu[]
  onFechar: () => void
  subAEsquerda: boolean
  style?: React.CSSProperties
  raiz?: boolean
}) {
  const [aberto, setAberto] = useState<number | null>(null)
  return (
    <ul className={`menu-ctx${raiz ? ' raiz' : ` sub${subAEsquerda ? ' esquerda' : ''}`}`} role="menu" style={style} onContextMenu={(e) => e.preventDefault()}>
      {itens.map((item, i) => {
        if (item.tipo === 'linha') return <li key={i} className="menu-ctx-linha" role="separator" />
        if (item.tipo === 'sub') {
          return (
            <li key={i} className="menu-ctx-item" onMouseEnter={() => setAberto(i)} onMouseLeave={() => setAberto((a) => (a === i ? null : a))}>
              <button type="button" role="menuitem" aria-haspopup="true" aria-expanded={aberto === i} onClick={() => setAberto(i)}>
                {item.icone && <FontAwesomeIcon icon={item.icone} fixedWidth />} <span>{item.rotulo}</span>
                <FontAwesomeIcon icon={faChevronRight} className="menu-ctx-seta" />
              </button>
              {aberto === i && <Lista itens={item.itens} onFechar={onFechar} subAEsquerda={subAEsquerda} />}
            </li>
          )
        }
        return (
          <li key={i} className="menu-ctx-item" onMouseEnter={() => setAberto(null)}>
            <button
              type="button"
              role="menuitem"
              className={item.perigo ? 'perigo' : undefined}
              disabled={item.desativado}
              onClick={() => {
                onFechar()
                item.onClick()
              }}
            >
              {item.icone && <FontAwesomeIcon icon={item.icone} fixedWidth />} <span>{item.rotulo}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
