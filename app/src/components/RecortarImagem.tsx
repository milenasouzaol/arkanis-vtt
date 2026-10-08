import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { PROPORCOES, prender, retanguloDoRecorte, tamanhoDeSaida, tamanhoDoRecorte, type Enquadre } from '../lib/recorte'

// Recorte de imagem (pedido da Millie, 08/10). Qualquer envio de imagem chama
// `recortarImagem(arquivo, { proporcao })` antes de subir: a pessoa arrasta pra enquadrar, dá zoom,
// troca a proporção, ou usa a imagem inteira. Devolve o arquivo pronto (ou null se cancelou).

export type OpcoesRecorte = {
  // Proporção sugerida pro lugar: 'quadrado' (avatar, ícone), 'retrato', 'paisagem', 'faixa' (banner)
  // ou 'original' (mapa, token: começa com a imagem inteira).
  proporcao?: 'original' | 'quadrado' | 'retrato' | 'paisagem' | 'faixa'
  titulo?: string
  maxLado?: number // lado maior da imagem final (padrão 2048)
}

// Lado maior do quadro na tela (menor no celular).
const ladoDoQuadro = () => Math.max(200, Math.min(420, window.innerWidth - 80, window.innerHeight - 320))

function carregar(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

function tipoDeSaida(arquivo: File): string {
  // PNG e WebP podem ter transparência (tokens): continuam assim; o resto vira JPEG.
  return arquivo.type === 'image/png' || arquivo.type === 'image/webp' ? arquivo.type : 'image/jpeg'
}

async function gerar(arquivo: File, img: HTMLImageElement, r: { x: number; y: number; w: number; h: number }, maxLado: number): Promise<File> {
  const saida = tamanhoDeSaida(r.w, r.h, maxLado)
  const canvas = document.createElement('canvas')
  canvas.width = saida.w
  canvas.height = saida.h
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, saida.w, saida.h)
  const tipo = tipoDeSaida(arquivo)
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, tipo, 0.9))
  if (!blob) return arquivo
  const base = arquivo.name.replace(/\.[^.]+$/, '') || 'imagem'
  const ext = tipo === 'image/png' ? 'png' : tipo === 'image/webp' ? 'webp' : 'jpg'
  return new File([blob], `${base}.${ext}`, { type: tipo })
}

function Recortador({ arquivo, opcoes, onFim }: { arquivo: File; opcoes: OpcoesRecorte; onFim: (f: File | null) => void }) {
  const [url] = useState(() => URL.createObjectURL(arquivo))
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [proporcaoId, setProporcaoId] = useState(opcoes.proporcao ?? 'original')
  const [enq, setEnq] = useState<Enquadre>({ cx: 0, cy: 0, zoom: 1 })
  const [ocupado, setOcupado] = useState(false)
  const arrasto = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null)
  const maxLado = opcoes.maxLado ?? 2048

  useEffect(() => {
    carregar(url).then((i) => {
      setImg(i)
      setEnq({ cx: i.naturalWidth / 2, cy: i.naturalHeight / 2, zoom: 1 })
    }).catch(() => onFim(arquivo))
    return () => URL.revokeObjectURL(url)
  }, [url, arquivo, onFim])

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onFim(null)
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onFim])

  if (!img) return <div className="recorte-fundo"><div className="recorte">Abrindo a imagem…</div></div>

  const W = img.naturalWidth
  const H = img.naturalHeight
  const proporcao = PROPORCOES.find((p) => p.id === proporcaoId)?.valor ?? W / H
  const atual = prender(W, H, proporcao, enq)
  const rec = tamanhoDoRecorte(W, H, proporcao, atual.zoom)
  // Quadro na tela com a proporção do recorte.
  const lado = ladoDoQuadro()
  const quadroW = proporcao >= 1 ? lado : lado * proporcao
  const quadroH = quadroW / proporcao
  const escala = quadroW / rec.w // pixels de tela por pixel da imagem

  async function pronto(inteira: boolean) {
    if (!img) return
    setOcupado(true)
    const r = inteira ? { x: 0, y: 0, w: W, h: H } : retanguloDoRecorte(W, H, proporcao, atual)
    // Inteira e já pequena: sobe o arquivo como veio (sem perder nada).
    if (inteira && Math.max(W, H) <= maxLado) onFim(arquivo)
    else onFim(await gerar(arquivo, img, r, maxLado))
  }

  return (
    <div className="recorte-fundo" onPointerDown={(e) => e.target === e.currentTarget && onFim(null)}>
      <div className="recorte" role="dialog" aria-label={opcoes.titulo ?? 'Ajustar imagem'}>
        <h2>{opcoes.titulo ?? 'Ajustar imagem'}</h2>
        <p className="recorte-dica">Arraste a imagem pra escolher a parte que aparece; a rodinha do mouse ou a barra dão zoom.</p>

        <div className="recorte-proporcoes" role="radiogroup" aria-label="Formato">
          {PROPORCOES.map((p) => (
            <button key={p.id} type="button" role="radio" aria-checked={p.id === proporcaoId} className={p.id === proporcaoId ? 'ativo' : undefined}
              onClick={() => { setProporcaoId(p.id as typeof proporcaoId); setEnq((e) => ({ ...e, zoom: 1 })) }}>
              {p.rotulo}
            </button>
          ))}
        </div>

        <div
          className="recorte-quadro"
          style={{ width: quadroW, height: quadroH }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            arrasto.current = { x: e.clientX, y: e.clientY, cx: atual.cx, cy: atual.cy }
          }}
          onPointerMove={(e) => {
            const a = arrasto.current
            if (!a) return
            setEnq(prender(W, H, proporcao, { ...atual, cx: a.cx - (e.clientX - a.x) / escala, cy: a.cy - (e.clientY - a.y) / escala }))
          }}
          onPointerUp={() => (arrasto.current = null)}
          onWheel={(e) => setEnq(prender(W, H, proporcao, { ...atual, zoom: Math.min(6, Math.max(1, atual.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1))) }))}
        >
          <img
            src={url}
            alt=""
            draggable={false}
            style={{ width: W * escala, height: H * escala, transform: `translate(${-(atual.cx - rec.w / 2) * escala}px, ${-(atual.cy - rec.h / 2) * escala}px)` }}
          />
        </div>

        <label className="recorte-zoom">
          <span>Zoom</span>
          <input type="range" min={1} max={6} step={0.01} value={atual.zoom} aria-label="Zoom" onChange={(e) => setEnq(prender(W, H, proporcao, { ...atual, zoom: Number(e.target.value) }))} />
        </label>

        <div className="recorte-botoes">
          <button type="button" className="recorte-secundario" disabled={ocupado} onClick={() => onFim(null)}>Cancelar</button>
          <button type="button" className="recorte-secundario" disabled={ocupado} onClick={() => pronto(true)}>Usar a imagem inteira</button>
          <button type="button" className="recorte-principal" disabled={ocupado} onClick={() => pronto(false)}>{ocupado ? 'Preparando…' : 'Usar este recorte'}</button>
        </div>
      </div>
    </div>
  )
}

// Abre o recorte e espera a pessoa escolher. GIF animado passa direto (recortar tiraria a animação).
export function recortarImagem(arquivo: File, opcoes: OpcoesRecorte = {}): Promise<File | null> {
  if (!arquivo.type.startsWith('image/') || arquivo.type === 'image/gif' || arquivo.type === 'image/svg+xml') return Promise.resolve(arquivo)
  return new Promise((resolve) => {
    const caixa = document.createElement('div')
    document.body.appendChild(caixa)
    const raiz = createRoot(caixa)
    const fim = (f: File | null) => {
      raiz.unmount()
      caixa.remove()
      resolve(f)
    }
    raiz.render(<Recortador arquivo={arquivo} opcoes={opcoes} onFim={fim} />)
  })
}
