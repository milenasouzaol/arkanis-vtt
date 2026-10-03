import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import EfeitoClimatico from './EfeitoClimatico'
import { ajustarVista, filtroAmbiente, ladrilhoHex, tracoDaGrade, zoomEm, type Cena, type Vista } from './cenas'

// Tamanho do mapa quando a cena não tem imagem de fundo.
const MAPA_PADRAO = { w: 4000, h: 3000 }

// Centro da mesa: a cena com imagem, grade, escuridão, ambiente e clima.
// Arrastar move o mapa, a rodinha do mouse dá zoom. O mestre pode soltar uma imagem aqui.
export default function PalcoCena({ cena, souMestre, onSoltarImagem }: {
  cena: Cena | null
  souMestre: boolean
  onSoltarImagem: (origem: File | string) => void
}) {
  const palcoRef = useRef<HTMLDivElement>(null)
  const [mapa, setMapa] = useState(MAPA_PADRAO)
  const [vista, setVista] = useState<Vista>({ x: 0, y: 0, escala: 1 })
  const [soltando, setSoltando] = useState(false)
  const arrasto = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null)

  // Tamanho real da imagem de fundo.
  useEffect(() => {
    if (!cena?.background_url) {
      setMapa(MAPA_PADRAO)
      return
    }
    const img = new Image()
    img.onload = () => setMapa({ w: img.naturalWidth || MAPA_PADRAO.w, h: img.naturalHeight || MAPA_PADRAO.h })
    img.src = cena.background_url
  }, [cena?.background_url])

  // Trocou de cena ou de imagem: o mapa se ajusta à tela.
  useLayoutEffect(() => {
    const palco = palcoRef.current
    if (palco) setVista(ajustarVista(mapa.w, mapa.h, palco.clientWidth, palco.clientHeight))
  }, [cena?.id, mapa])

  // Rodinha do mouse = zoom no ponto do mouse (listener próprio pra poder impedir a rolagem).
  useEffect(() => {
    const palco = palcoRef.current
    if (!palco) return
    const roda = (e: WheelEvent) => {
      e.preventDefault()
      const r = palco.getBoundingClientRect()
      setVista((v) => zoomEm(v, e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top))
    }
    palco.addEventListener('wheel', roda, { passive: false })
    return () => palco.removeEventListener('wheel', roda)
  }, [])

  function comecar(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 && e.button !== 2) return
    arrasto.current = { x: e.clientX, y: e.clientY, vx: vista.x, vy: vista.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function mover(e: React.PointerEvent<HTMLDivElement>) {
    const a = arrasto.current
    if (a) setVista((v) => ({ ...v, x: a.vx + e.clientX - a.x, y: a.vy + e.clientY - a.y }))
  }

  function soltar(e: React.DragEvent<HTMLDivElement>) {
    setSoltando(false)
    if (!souMestre) return
    const arquivo = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'))
    const url = e.dataTransfer.getData('text/uri-list').split('\n').map((l) => l.trim()).find((l) => /^https?:\/\//.test(l))
    if (arquivo || url) {
      e.preventDefault()
      onSoltarImagem(arquivo ?? url!)
    }
  }

  const grade = cena && cena.grid_type !== 'sem' ? cena : null
  const hex = grade?.grid_type === 'hexagono' ? ladrilhoHex(grade.grid_size) : null
  const traco = grade ? tracoDaGrade(grade.grid_style, grade.grid_thickness) : undefined

  return (
    <div
      ref={palcoRef}
      className={`mesa-palco${soltando ? ' soltando' : ''}`}
      aria-label="Cena"
      style={{ background: cena?.background_color ?? undefined }}
      onPointerDown={comecar}
      onPointerMove={mover}
      onPointerUp={() => (arrasto.current = null)}
      onContextMenu={(e) => e.preventDefault()}
      onDragOver={(e) => {
        if (!souMestre) return
        e.preventDefault()
        setSoltando(true)
      }}
      onDragLeave={() => setSoltando(false)}
      onDrop={soltar}
    >
      {cena ? (
        <div
          className="mesa-mundo"
          style={{
            width: mapa.w,
            height: mapa.h,
            transform: `translate(${vista.x}px, ${vista.y}px) scale(${vista.escala})`,
            filter: filtroAmbiente(cena.luminosity, cena.saturation, cena.shadows),
          }}
        >
          {cena.background_url && <img className="mesa-mundo-fundo" src={cena.background_url} alt="" draggable={false} />}
          {grade && (
            <svg className="mesa-grade" width={mapa.w} height={mapa.h} aria-hidden>
              <defs>
                <pattern
                  id={`grade-${grade.id}`}
                  width={hex ? hex.largura : grade.grid_size}
                  height={hex ? hex.altura : grade.grid_size}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={hex ? hex.caminho : `M${grade.grid_size} 0H0V${grade.grid_size}`}
                    fill="none"
                    stroke={grade.grid_color}
                    strokeWidth={grade.grid_thickness}
                    strokeDasharray={traco}
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grade-${grade.id})`} opacity={grade.grid_opacity} />
            </svg>
          )}
        </div>
      ) : (
        <p className="mesa-palco-vazio">
          {souMestre ? 'Nenhuma cena ativa. Crie uma na aba Cenas ou arraste uma imagem pra cá.' : 'Nenhuma cena ativa'}
        </p>
      )}
      {cena && cena.darkness > 0 && <div className="mesa-escuridao" style={{ opacity: cena.darkness * 0.92 }} />}
      {cena?.weather && <EfeitoClimatico key={cena.weather} clima={cena.weather} />}
      {soltando && <div className="mesa-soltar">Solte pra usar como fundo da cena</div>}
    </div>
  )
}
