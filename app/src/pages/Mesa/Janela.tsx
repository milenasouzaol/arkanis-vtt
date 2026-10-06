import { useRef, useState, type ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, type IconDefinition } from '@fortawesome/free-solid-svg-icons'

// Janela flutuante da mesa, como as do Foundry: barra de título arrastável e X pra fechar.
// Com `altura`, a janela abre nesse tamanho e dá pra redimensionar pelo canto (ficha portátil).
export default function Janela({ titulo, icone, largura = 420, altura, inicial, onFechar, children, topo, semTitulo, className }: {
  titulo: string
  // Botões/controles extras na barra de cima (ex.: o modo de edição da ficha do item).
  topo?: ReactNode
  // Título só pra leitores de tela (a ficha do item mostra o nome grande no corpo).
  semTitulo?: boolean
  className?: string
  icone?: IconDefinition
  largura?: number
  altura?: number
  inicial?: { x: number; y: number }
  onFechar: () => void
  children: ReactNode
}) {
  const [pos, setPos] = useState(() => inicial ?? { x: Math.max(16, (window.innerWidth - largura) / 2 - 160), y: 80 })
  const arrasto = useRef<{ dx: number; dy: number } | null>(null)

  function comecar(e: React.PointerEvent<HTMLElement>) {
    if ((e.target as HTMLElement).closest('button')) return
    arrasto.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function mover(e: React.PointerEvent<HTMLElement>) {
    if (!arrasto.current) return
    const x = Math.min(window.innerWidth - 80, Math.max(-largura + 80, e.clientX - arrasto.current.dx))
    const y = Math.min(window.innerHeight - 40, Math.max(0, e.clientY - arrasto.current.dy))
    setPos({ x, y })
  }

  return (
    <section
      className={`janela${altura ? ' redimensionavel' : ''}${className ? ` ${className}` : ''}`}
      role="dialog"
      aria-label={titulo}
      style={{ left: pos.x, top: pos.y, width: `min(${largura}px, calc(100vw - 32px))`, height: altura ? `min(${altura}px, calc(100vh - ${pos.y + 16}px))` : undefined, maxHeight: `calc(100vh - ${pos.y + 16}px)` }}
    >
      <header className="janela-topo" onPointerDown={comecar} onPointerMove={mover} onPointerUp={() => (arrasto.current = null)}>
        {icone && <FontAwesomeIcon icon={icone} />}
        {topo}
        <h2 className={semTitulo ? 'janela-titulo-oculto' : undefined}>{titulo}</h2>
        <button type="button" className="janela-fechar" aria-label="Fechar" onClick={onFechar}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </header>
      <div className="janela-corpo">{children}</div>
    </section>
  )
}

// Linha de formulário das janelas: rótulo à esquerda, campo à direita, dica embaixo.
export function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: ReactNode }) {
  return (
    <div className="janela-campo">
      <span className="janela-rotulo">{rotulo}</span>
      <div className="janela-controle">{children}</div>
      {dica && <p className="janela-dica">{dica}</p>}
    </div>
  )
}

// Número que deixa digitar à vontade (apagar, escrever outro) e só corrige pro mínimo/máximo
// quando sai do campo ou aperta Enter.
export function CampoNumero({ valor, min, max, passo = 1, rotulo, className, onMudar }: {
  valor: number
  min: number
  max: number
  passo?: number
  rotulo: string
  className?: string
  onMudar: (v: number) => void
}) {
  const [texto, setTexto] = useState(String(valor))
  const [ultimo, setUltimo] = useState(valor)
  if (valor !== ultimo) {
    setUltimo(valor)
    setTexto(String(valor))
  }
  function confirmar() {
    const n = Number(texto.replace(',', '.'))
    const v = Number.isFinite(n) && texto.trim() !== '' ? Math.min(max, Math.max(min, passo >= 1 ? Math.round(n) : n)) : valor
    setTexto(String(v))
    if (v !== valor) onMudar(v)
  }
  return (
    <input
      type="text"
      inputMode={passo >= 1 ? 'numeric' : 'decimal'}
      className={className}
      aria-label={rotulo}
      value={texto}
      onChange={(e) => {
        setTexto(e.target.value)
        const n = Number(e.target.value.replace(',', '.'))
        if (e.target.value.trim() !== '' && Number.isFinite(n) && n >= min && n <= max) onMudar(passo >= 1 ? Math.round(n) : n)
      }}
      onBlur={confirmar}
      onKeyDown={(e) => e.key === 'Enter' && confirmar()}
    />
  )
}

// Slider com o número ao lado, como os do Foundry.
export function Deslizante({ valor, min, max, passo = 0.05, onMudar, rotulo }: {
  valor: number
  min: number
  max: number
  passo?: number
  rotulo: string
  onMudar: (v: number) => void
}) {
  return (
    <div className="janela-deslizante">
      <input type="range" aria-label={rotulo} min={min} max={max} step={passo} value={valor} onChange={(e) => onMudar(Number(e.target.value))} />
      <output>{Number(valor.toFixed(2)).toLocaleString('pt-BR')}</output>
    </div>
  )
}

// Cor em texto (#hex) com o quadradinho que abre o seletor RGB.
export function CampoCor({ valor, onMudar, rotulo }: { valor: string; onMudar: (v: string) => void; rotulo: string }) {
  const [texto, setTexto] = useState(valor)
  const [ultimo, setUltimo] = useState(valor)
  if (valor !== ultimo) {
    setUltimo(valor)
    setTexto(valor)
  }
  return (
    <div className="janela-cor">
      <input
        aria-label={rotulo}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          if (/^#[0-9a-f]{6}$/i.test(e.target.value)) onMudar(e.target.value)
        }}
      />
      <input type="color" aria-label={`${rotulo} (seletor)`} value={/^#[0-9a-f]{6}$/i.test(valor) ? valor : '#000000'} onChange={(e) => onMudar(e.target.value)} />
    </div>
  )
}
