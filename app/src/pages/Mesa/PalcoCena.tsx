import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import EfeitoClimatico from './EfeitoClimatico'
import { ajustarVista, filtroAmbiente, imagemDoArrasto, ladrilhoHex, redimensionarProporcional, telaParaMapa, tracoDaGrade, zoomEm, type Cena, type ObjetoCena, type Vista } from './cenas'

const ORDEM_CAMADA = { mapa: 0, token: 1, mestre: 2 }

// Tamanho do mapa quando a cena não tem imagem de fundo.
const MAPA_PADRAO = { w: 4000, h: 3000 }

// Centro da mesa: a cena com imagem, grade, objetos, escuridão, ambiente e clima.
// Arrastar o fundo move o mapa, a rodinha do mouse dá zoom. O mestre solta imagens aqui:
// sem fundo, a imagem vira o fundo; com fundo, entra por cima onde foi solta.
export default function PalcoCena({ cena, souMestre, objetos, aviso, onSoltarImagem, onAlterarObjeto, onExcluirObjeto }: {
  cena: Cena | null
  souMestre: boolean
  objetos: ObjetoCena[]
  aviso: string | null
  onSoltarImagem: (origem: File | string, ponto: { x: number; y: number }, mapa: { w: number; h: number }) => void
  onAlterarObjeto: (id: string, campos: Partial<Pick<ObjetoCena, 'x' | 'y' | 'width' | 'height'>>, salvar: boolean) => void
  onExcluirObjeto: (id: string) => void
}) {
  const palcoRef = useRef<HTMLDivElement>(null)
  const [mapa, setMapa] = useState(MAPA_PADRAO)
  const [vista, setVista] = useState<Vista>({ x: 0, y: 0, escala: 1 })
  const [soltando, setSoltando] = useState(false)
  const arrasto = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null)
  const [selecionado, setSelecionado] = useState<string | null>(null)
  // Objeto sendo movido ou redimensionado pelo mestre.
  const mexendo = useRef<{ id: string; modo: 'mover' | 'tamanho'; x: number; y: number; o: ObjetoCena; ultimo?: Partial<ObjetoCena> } | null>(null)

  // Delete apaga o objeto selecionado (fora de campos de texto).
  useEffect(() => {
    if (!selecionado || !souMestre) return
    const tecla = (e: KeyboardEvent) => {
      if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"]')) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onExcluirObjeto(selecionado)
        setSelecionado(null)
      }
      if (e.key === 'Escape') setSelecionado(null)
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [selecionado, souMestre, onExcluirObjeto])

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
    setSelecionado(null)
    arrasto.current = { x: e.clientX, y: e.clientY, vx: vista.x, vy: vista.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function mover(e: React.PointerEvent<HTMLDivElement>) {
    const m = mexendo.current
    if (m) {
      const dx = (e.clientX - m.x) / vista.escala
      const dy = (e.clientY - m.y) / vista.escala
      const campos = m.modo === 'mover' ? { x: Math.round(m.o.x + dx), y: Math.round(m.o.y + dy) } : redimensionarProporcional(m.o, dx, dy)
      m.ultimo = campos
      onAlterarObjeto(m.id, campos, false)
      return
    }
    const a = arrasto.current
    if (a) setVista((v) => ({ ...v, x: a.vx + e.clientX - a.x, y: a.vy + e.clientY - a.y }))
  }

  function terminar() {
    const m = mexendo.current
    if (m?.ultimo) onAlterarObjeto(m.id, m.ultimo, true)
    mexendo.current = null
    arrasto.current = null
  }

  function pegarObjeto(e: React.PointerEvent, o: ObjetoCena, modo: 'mover' | 'tamanho') {
    if (!souMestre || e.button !== 0) return
    e.stopPropagation()
    setSelecionado(o.id)
    if (o.locked) return
    mexendo.current = { id: o.id, modo, x: e.clientX, y: e.clientY, o }
    palcoRef.current?.setPointerCapture(e.pointerId)
  }

  function soltar(e: React.DragEvent<HTMLDivElement>) {
    setSoltando(false)
    if (!souMestre) return
    e.preventDefault()
    const origem = imagemDoArrasto({
      arquivos: Array.from(e.dataTransfer.files),
      html: e.dataTransfer.getData('text/html'),
      uris: e.dataTransfer.getData('text/uri-list'),
    })
    const r = palcoRef.current?.getBoundingClientRect()
    const ponto = r ? telaParaMapa(e.clientX - r.left, e.clientY - r.top, vista) : { x: 0, y: 0 }
    onSoltarImagem(origem ?? '', ponto, mapa)
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
      onPointerUp={terminar}
      onPointerCancel={terminar}
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
          {[...objetos]
            .filter((o) => souMestre || o.layer !== 'mestre')
            .sort((a, b) => ORDEM_CAMADA[a.layer] - ORDEM_CAMADA[b.layer] || a.sort - b.sort)
            .map((o) => (
              <div
                key={o.id}
                className={`mesa-objeto${o.id === selecionado ? ' selecionado' : ''}${o.layer === 'mestre' ? ' camada-mestre' : ''}${souMestre ? ' mexivel' : ''}`}
                style={{
                  left: o.x,
                  top: o.y,
                  width: o.width,
                  height: o.height,
                  transform: `rotate(${o.rotation}deg) scale(${o.flip_h ? -1 : 1}, ${o.flip_v ? -1 : 1})`,
                }}
                onPointerDown={(e) => pegarObjeto(e, o, 'mover')}
              >
                <img src={o.image_url} alt={o.name ?? ''} draggable={false} />
                {o.id === selecionado && souMestre && !o.locked && (
                  <span className="mesa-objeto-alca" style={{ width: 14 / vista.escala, height: 14 / vista.escala }} onPointerDown={(e) => pegarObjeto(e, o, 'tamanho')} />
                )}
              </div>
            ))}
        </div>
      ) : (
        <p className="mesa-palco-vazio">
          {souMestre ? 'Nenhuma cena ativa. Crie uma na aba Cenas ou arraste uma imagem pra cá.' : 'Nenhuma cena ativa'}
        </p>
      )}
      {cena && cena.darkness > 0 && <div className="mesa-escuridao" style={{ opacity: cena.darkness * 0.92 }} />}
      {cena?.weather && <EfeitoClimatico key={cena.weather} clima={cena.weather} />}
      {soltando && <div className="mesa-soltar">{cena?.background_url ? 'Solte pra colocar a imagem na cena' : 'Solte pra usar como fundo da cena'}</div>}
      {aviso && !soltando && <div className="mesa-soltar" role="status">{aviso}</div>}
    </div>
  )
}
