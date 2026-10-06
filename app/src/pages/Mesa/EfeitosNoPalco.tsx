import { useEffect, useLayoutEffect, useRef } from 'react'
import type { ObjetoCena } from './cenas'
import { andar, aparencia, corClara, corDoMiolo, efeitoCompleto, nascer, quantasNascem, type Efeito, type Particula } from './efeitos'

// Efeitos animados na mesa (pedido da Millie, 06/10): cada objeto com efeito ganha um canvas
// em volta dele, por cima da escuridão, com as partículas andando.
export default function EfeitosNoPalco({ objetos, celula }: { objetos: ObjetoCena[]; celula: { w: number; h: number } }) {
  return (
    <>
      {objetos.map((o) => {
        const e = efeitoCompleto(o.efeito)
        return e ? <EfeitoAnimado key={o.id} objeto={o} efeito={e} celula={celula} /> : null
      })}
    </>
  )
}

const MAX_PARTICULAS = 500
const RESOLUCAO_MAX = 640

// Bolinha suave na cor (centro forte, borda transparente), desenhada uma vez e reaproveitada.
const sprites = new Map<string, HTMLCanvasElement>()
function sprite(cor: string): HTMLCanvasElement {
  let s = sprites.get(cor)
  if (s) return s
  s = document.createElement('canvas')
  s.width = s.height = 64
  const ctx = s.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, cor)
  g.addColorStop(0.45, cor + 'aa')
  g.addColorStop(1, cor + '00')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  sprites.set(cor, s)
  return s
}

function EfeitoAnimado({ objeto, efeito, celula }: { objeto: ObjetoCena; efeito: Efeito; celula: { w: number; h: number } }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  // A janela de configurar muda o efeito ao vivo: o laço lê sempre o mais novo.
  const atual = useRef({ efeito, giro: objeto.rotation, alcance: 0 })
  const alcance = Math.max(8, efeito.tamanho * Math.max(celula.w, celula.h))
  useLayoutEffect(() => {
    atual.current = { efeito, giro: objeto.rotation, alcance }
  })
  const lado = alcance * 2.8
  const resolucao = Math.round(Math.min(lado, RESOLUCAO_MAX))

  useEffect(() => {
    const c = canvas.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const particulas: Particula[] = []
    let sobra = 0
    let antes = performance.now()
    let quadro = 0
    const passo = (agora: number) => {
      quadro = requestAnimationFrame(passo)
      const dt = Math.min(0.05, (agora - antes) / 1000)
      antes = agora
      const { efeito: e, giro, alcance: r } = atual.current
      const q = quantasNascem(e, dt, sobra)
      sobra = q.sobra
      for (let i = 0; i < q.n && particulas.length < MAX_PARTICULAS; i++) particulas.push(nascer(e, r, giro))
      for (let i = particulas.length - 1; i >= 0; i--) if (!andar(particulas[i], e, r, dt)) particulas.splice(i, 1)

      const k = c.width / (r * 2.8)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.setTransform(k, 0, 0, k, c.width / 2, c.height / 2)
      const clara = corClara(e.cor)
      const corpo = sprite(e.cor)
      const miolo = sprite(clara ? corDoMiolo(e.cor) : e.cor)
      for (const p of particulas) {
        const { raio, alfa, t } = aparencia(p, e, r)
        if (alfa <= 0.01) continue
        if (e.tipo === 'fogo') {
          ctx.globalCompositeOperation = clara ? 'lighter' : 'source-over'
          ctx.globalAlpha = alfa * 0.55 * Math.max(0, 1 - t / 0.35)
          ctx.drawImage(miolo, p.x - raio, p.y - raio, raio * 2, raio * 2)
          ctx.globalAlpha = alfa * (clara ? 0.6 : 0.9)
          ctx.drawImage(corpo, p.x - raio, p.y - raio, raio * 2, raio * 2)
        } else if (e.tipo === 'veneno' && !p.nevoa) {
          ctx.globalCompositeOperation = 'source-over'
          ctx.globalAlpha = alfa
          ctx.strokeStyle = e.cor
          ctx.lineWidth = Math.max(0.8, raio * 0.28)
          ctx.beginPath()
          ctx.arc(p.x, p.y, raio, 0, Math.PI * 2)
          ctx.stroke()
          ctx.globalAlpha = alfa * 0.35
          ctx.drawImage(corpo, p.x - raio, p.y - raio, raio * 2, raio * 2)
        } else if (e.tipo === 'faiscas') {
          ctx.globalCompositeOperation = clara ? 'lighter' : 'source-over'
          ctx.globalAlpha = alfa
          ctx.drawImage(miolo, p.x - raio * 2, p.y - raio * 2, raio * 4, raio * 4)
        } else if (e.tipo === 'agua') {
          ctx.globalCompositeOperation = 'source-over'
          ctx.globalAlpha = alfa
          // Gota esticada na direção em que anda (jato).
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(Math.atan2(p.vy, p.vx))
          ctx.drawImage(corpo, -raio * 3, -raio * 1.3, raio * 6, raio * 2.6)
          ctx.restore()
          if (clara) {
            ctx.globalCompositeOperation = 'lighter'
            ctx.globalAlpha = alfa * 0.35
            ctx.drawImage(miolo, p.x - raio * 0.7, p.y - raio * 0.7, raio * 1.4, raio * 1.4)
          }
        } else {
          // Fumaça, nuvem e a névoa do veneno.
          ctx.globalCompositeOperation = 'source-over'
          ctx.globalAlpha = alfa
          ctx.drawImage(corpo, p.x - raio, p.y - raio, raio * 2, raio * 2)
        }
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [resolucao])

  const cx = objeto.x + objeto.width / 2
  const cy = objeto.y + objeto.height / 2
  return (
    <canvas
      ref={canvas}
      className="mesa-efeito"
      width={resolucao}
      height={resolucao}
      style={{ left: cx - lado / 2, top: cy - lado / 2, width: lado, height: lado }}
      aria-hidden
    />
  )
}
