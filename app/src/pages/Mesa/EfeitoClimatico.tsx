import { useEffect, useRef } from 'react'
import { COR_PADRAO_CLIMA, rgbDe, type Clima } from './cenas'

// Efeito Climático da cena (12.5), desenhado com partículas num canvas por cima do mapa.
// Leve e sem arquivo de vídeo; cada efeito é uma receita de partículas.

type Particula = { x: number; y: number; vx: number; vy: number; tam: number; giro: number; vgiro: number; alfa: number; cor: string }

type Receita = {
  quantas: (area: number) => number
  nova: (w: number, h: number, inicio: boolean) => Particula
  desenhar: (ctx: CanvasRenderingContext2D, p: Particula) => void
  vento?: number
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

function chuva(forte: boolean, cor: string): Receita {
  return {
    quantas: (area) => Math.round((area / 1e6) * (forte ? 900 : 450)),
    nova: (w, h, inicio) => ({
      x: rnd(-w * 0.2, w), y: inicio ? rnd(0, h) : rnd(-h * 0.2, 0),
      vx: forte ? rnd(5, 7) : rnd(2, 3), vy: forte ? rnd(26, 34) : rnd(18, 24),
      tam: forte ? rnd(18, 28) : rnd(12, 20), giro: 0, vgiro: 0, alfa: rnd(0.25, forte ? 0.6 : 0.5), cor,
    }),
    desenhar: (ctx, p) => {
      const k = p.tam / Math.hypot(p.vx, p.vy)
      ctx.strokeStyle = `rgba(${p.cor}, ${p.alfa})`
      ctx.lineWidth = forte ? 1.6 : 1.3
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x - p.vx * k, p.y - p.vy * k)
      ctx.stroke()
    },
  }
}

function neve(rapida: boolean, cor: string): Receita {
  return {
    quantas: (area) => Math.round((area / 1e6) * (rapida ? 320 : 220)),
    nova: (w, h, inicio) => ({
      x: rnd(-w * 0.3, w), y: inicio ? rnd(0, h) : rnd(-40, 0),
      vx: rapida ? rnd(3, 6) : rnd(-0.4, 0.4), vy: rapida ? rnd(3, 5) : rnd(0.6, 1.6),
      tam: rnd(1, 3.2), giro: rnd(0, Math.PI * 2), vgiro: rnd(0.01, 0.03), alfa: rnd(0.5, 0.95), cor,
    }),
    desenhar: (ctx, p) => {
      ctx.fillStyle = `rgba(${p.cor}, ${p.alfa})`
      ctx.beginPath()
      ctx.arc(p.x + Math.sin(p.giro) * 1.5, p.y, p.tam, 0, Math.PI * 2)
      ctx.fill()
    },
  }
}

const CORES_FOLHAS = ['176, 92, 32', '201, 128, 43', '139, 58, 26', '214, 162, 63', '120, 72, 30']

const folhas: Receita = {
  quantas: (area) => Math.round((area / 1e6) * 40),
  nova: (w, h, inicio) => ({
    x: rnd(-w * 0.3, w), y: inicio ? rnd(0, h) : rnd(-60, -10),
    vx: rnd(0.8, 2.2), vy: rnd(0.9, 2), tam: rnd(5, 9), giro: rnd(0, Math.PI * 2), vgiro: rnd(-0.05, 0.05),
    alfa: rnd(0.75, 1), cor: CORES_FOLHAS[Math.floor(Math.random() * CORES_FOLHAS.length)],
  }),
  desenhar: (ctx, p) => {
    ctx.save()
    ctx.translate(p.x + Math.sin(p.giro * 2) * 6, p.y)
    ctx.rotate(p.giro)
    ctx.scale(1, Math.abs(Math.cos(p.giro * 1.5)) * 0.7 + 0.3)
    ctx.fillStyle = `rgba(${p.cor}, ${p.alfa})`
    ctx.beginPath()
    ctx.ellipse(0, 0, p.tam, p.tam * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  },
}

function nevoa(vento: number, cor: string, densa = false): Receita {
  return {
    quantas: (area) => Math.max(densa ? 18 : 10, Math.round((area / 1e6) * (densa ? 24 : 14))),
    nova: (w, h, inicio) => ({
      x: inicio ? rnd(-w * 0.2, w) : rnd(-w * 0.5, -w * 0.2), y: rnd(-h * 0.1, h * 1.1),
      vx: rnd(0.25, 0.6) * vento, vy: rnd(-0.05, 0.05), tam: rnd(Math.min(w, h) * 0.25, Math.min(w, h) * 0.55),
      giro: 0, vgiro: 0, alfa: densa ? rnd(0.1, 0.22) : rnd(0.06, 0.16), cor,
    }),
    desenhar: (ctx, p) => {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.tam)
      g.addColorStop(0, `rgba(${p.cor}, ${p.alfa})`)
      g.addColorStop(1, `rgba(${p.cor}, 0)`)
      ctx.fillStyle = g
      ctx.fillRect(p.x - p.tam, p.y - p.tam, p.tam * 2, p.tam * 2)
    },
  }
}

function receitas(clima: Clima, cor: string): Receita[] {
  switch (clima) {
    case 'chuva': return [chuva(false, cor)]
    case 'tempestade': return [chuva(true, cor)]
    case 'neve': return [neve(false, cor)]
    case 'folhas': return [folhas]
    case 'nevoa': return [nevoa(1, cor)]
    // Nebulosa: vento + névoa + neve caindo mais rápido.
    case 'nebulosa': return [nevoa(4, cor), neve(true, '255, 255, 255')]
    // Fumaça (lua de sangue): nuvens da cor escolhida passando devagar, sobre um véu leve.
    case 'fumaca': return [nevoa(0.6, cor, true)]
  }
}

// cor: a cor que o mestre escolheu (#rrggbb); vazio = a de sempre do efeito.
export default function EfeitoClimatico({ clima, cor }: { clima: Clima; cor?: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const rgb = rgbDe(cor) ?? rgbDe(COR_PADRAO_CLIMA[clima]) ?? '215, 218, 225'
    const lista = receitas(clima, rgb)
    let grupos: Particula[][] = []
    let w = 0
    let h = 0
    let raf = 0
    let relampago = 0
    let raio: { x: number; y: number }[] | null = null

    const redimensionar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      grupos = lista.map((r) => Array.from({ length: r.quantas(w * h) }, () => r.nova(w, h, true)))
    }
    redimensionar()
    const observador = new ResizeObserver(redimensionar)
    observador.observe(canvas)

    const quadro = () => {
      ctx.clearRect(0, 0, w, h)
      // Fumaça: o mapa todo levemente na cor, sem esconder nada.
      if (clima === 'fumaca') {
        ctx.fillStyle = `rgba(${rgb}, 0.12)`
        ctx.fillRect(0, 0, w, h)
      }
      lista.forEach((r, i) => {
        for (const p of grupos[i]) {
          p.x += p.vx
          p.y += p.vy
          p.giro += p.vgiro
          if (p.y > h + 60 || p.x > w + p.tam + 60) Object.assign(p, r.nova(w, h, false))
          r.desenhar(ctx, p)
        }
      })
      // Tempestade: de vez em quando um raio clareia a tela.
      if (clima === 'tempestade') {
        if (relampago <= 0 && Math.random() < 0.004) {
          relampago = 1
          let x = rnd(w * 0.15, w * 0.85)
          raio = [{ x, y: 0 }]
          for (let y = 0; y < h * rnd(0.4, 0.8); y += rnd(20, 45)) raio.push({ x: (x += rnd(-30, 30)), y })
        }
        if (relampago > 0) {
          ctx.fillStyle = `rgba(230, 235, 255, ${relampago * 0.35})`
          ctx.fillRect(0, 0, w, h)
          if (raio && relampago > 0.6) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${relampago})`
            ctx.lineWidth = 2
            ctx.beginPath()
            raio.forEach((pt, j) => (j ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)))
            ctx.stroke()
          }
          relampago -= 0.05
        }
      }
      raf = requestAnimationFrame(quadro)
    }
    raf = requestAnimationFrame(quadro)

    return () => {
      cancelAnimationFrame(raf)
      observador.disconnect()
    }
  }, [clima, cor])

  return <canvas ref={canvasRef} className="mesa-clima" aria-hidden />
}
