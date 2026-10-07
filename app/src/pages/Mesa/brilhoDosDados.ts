// Animação dos dados 3D (pedido da Millie, 06/10): conforme o estilo de quem rolou, cada dado
// ganha um efeito em volta, na cor dele: fogo queimando, estrelas piscando ligadas como
// constelação, glitter, gelo, brilho de metal, gotas d'água, fumaça de caveira. Desenhado numa
// camada por cima, seguindo a posição de cada dado na tela.
import type { EstiloDados } from './estiloDados'

export type BrilhoDado = 'fogo' | 'constelacao' | 'glitter' | 'gelo' | 'metal' | 'agua' | 'fumaca'

// Qual efeito o estilo ganha (a textura manda; sem textura, o material metal brilha).
export function brilhoDoEstilo(e: Pick<EstiloDados, 'textura' | 'material'>): BrilhoDado | null {
  switch (e.textura) {
    case 'fire': return 'fogo'
    case 'stars':
    case 'astral': return 'constelacao'
    case 'glitter':
    case 'speckles': return 'glitter'
    case 'ice': return 'gelo'
    case 'water': return 'agua'
    case 'skulls': return 'fumaca'
    case 'metal': return 'metal'
  }
  return e.material === 'metal' || e.material === 'metal_polido' ? 'metal' : null
}

type Vetor = { x: number; y: number; z: number; clone(): Vetor; add(v: Vetor): Vetor; project(c: unknown): Vetor }
export type DadoNaCena = { shape: string; position: Vetor }
export type CaixaComCena = { diceList: DadoNaCena[]; camera: unknown; renderer: { domElement: HTMLCanvasElement }; DiceFactory: { baseScale: number } }

type Particula = { x: number; y: number; vx: number; vy: number; idade: number; vida: number; tam: number; semente: number }

const cache = new Map<string, HTMLCanvasElement>()
function bolinha(cor: string): HTMLCanvasElement {
  let s = cache.get(cor)
  if (s) return s
  s = document.createElement('canvas')
  s.width = s.height = 64
  const g = s.getContext('2d')!.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, cor)
  g.addColorStop(0.45, cor + 'aa')
  g.addColorStop(1, cor + '00')
  const ctx = s.getContext('2d')!
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  cache.set(cor, s)
  return s
}

// Mistura a cor com branco (miolo do fogo, estrelas).
export function clarear(hex: string, k: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  if (Number.isNaN(n)) return '#ffffff'
  const m = (v: number) => Math.round(v + (255 - v) * k)
  return `#${((m((n >> 16) & 255) << 16) | (m((n >> 8) & 255) << 8) | m(n & 255)).toString(16).padStart(6, '0')}`
}

// Estrela de 4 pontas (constelação, glitter, brilho do metal).
function estrela(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.quadraticCurveTo(x, y, x, y + r)
  ctx.quadraticCurveTo(x, y, x - r, y)
  ctx.quadraticCurveTo(x, y, x, y - r)
  ctx.fill()
}

// Começa a animação em volta dos dados; devolve a função que para.
export function iniciarBrilho(camada: HTMLCanvasElement, caixa: CaixaComCena, tipo: BrilhoDado, corDoDado: (lados: number) => string): () => void {
  const ctx = camada.getContext('2d')
  if (!ctx) return () => {}
  const porDado = new Map<DadoNaCena, Particula[]>()
  let quadro = 0
  let antes = performance.now()
  const dpr = Math.min(2, window.devicePixelRatio || 1)

  const passo = (agora: number) => {
    quadro = requestAnimationFrame(passo)
    const dt = Math.min(0.05, (agora - antes) / 1000)
    antes = agora
    const r = caixa.renderer.domElement.getBoundingClientRect()
    // A camada cobre a tela toda; o desenho segue a posição do canvas dos dados.
    const w = window.innerWidth
    const h = window.innerHeight
    if (camada.width !== Math.round(w * dpr) || camada.height !== Math.round(h * dpr)) {
      camada.width = Math.round(w * dpr)
      camada.height = Math.round(h * dpr)
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, camada.width, camada.height)
    ctx.setTransform(dpr, 0, 0, dpr, r.left * dpr, r.top * dpr)
    const t = agora / 1000

    for (const d of caixa.diceList) {
      const lados = Number(d.shape.replace('d', '')) || 20
      const cor = corDoDado(lados)
      // Centro do dado na tela e o tamanho dele (projeta um ponto meio dado pro lado).
      const c = d.position.clone().project(caixa.camera)
      const b = d.position.clone().add({ x: caixa.DiceFactory.baseScale * 0.5, y: 0, z: 0 } as Vetor).project(caixa.camera)
      const cx = ((c.x + 1) / 2) * r.width
      const cy = ((1 - c.y) / 2) * r.height
      const raio = Math.max(12, Math.abs(((b.x - c.x) / 2) * r.width) * 2.4)
      let ps = porDado.get(d)
      if (!ps) porDado.set(d, (ps = []))

      // Nasce
      const nascer = (n: number, f: (p: Particula) => void) => {
        for (let i = 0; i < n; i++) {
          const p: Particula = { x: 0, y: 0, vx: 0, vy: 0, idade: 0, vida: 1, tam: 1, semente: Math.random() }
          f(p)
          ps!.push(p)
        }
      }
      const chance = (porSeg: number) => Math.floor(porSeg * dt + Math.random())
      if (tipo === 'fogo') nascer(chance(90), (p) => { p.x = (Math.random() - 0.5) * raio * 1.5; p.y = -Math.random() * raio * 0.6; p.vy = -raio * (2.2 + Math.random() * 1.2); p.vida = 0.5 + Math.random() * 0.35; p.tam = raio * (0.3 + Math.random() * 0.25) })
      if (tipo === 'fumaca') nascer(chance(14), (p) => { p.x = (Math.random() - 0.5) * raio; p.y = -raio * 0.2; p.vy = -raio * 0.8; p.vx = (Math.random() - 0.5) * raio * 0.3; p.vida = 1.6 + Math.random(); p.tam = raio * 0.5 })
      if (tipo === 'constelacao' && ps.length < 9) nascer(chance(9), (p) => { const a = Math.random() * Math.PI * 2; const k = raio * (0.75 + Math.random() * 0.8); p.x = Math.cos(a) * k; p.y = Math.sin(a) * k; p.vida = 2.5 + Math.random() * 2; p.tam = raio * (0.18 + Math.random() * 0.14) })
      if (tipo === 'glitter') nascer(chance(18), (p) => { const a = Math.random() * Math.PI * 2; const k = raio * Math.random() * 1.4; p.x = Math.cos(a) * k; p.y = Math.sin(a) * k; p.vida = 0.5 + Math.random() * 0.5; p.tam = raio * (0.1 + Math.random() * 0.12) })
      if (tipo === 'gelo') nascer(chance(10), (p) => { const a = Math.random() * Math.PI * 2; const k = raio * (0.9 + Math.random() * 0.6); p.x = Math.cos(a) * k; p.y = Math.sin(a) * k; p.vy = raio * 0.15; p.vida = 1.4 + Math.random(); p.tam = raio * (0.1 + Math.random() * 0.08) })
      if (tipo === 'metal') nascer(chance(1.4), (p) => { p.x = (Math.random() - 0.5) * raio * 1.2; p.y = (Math.random() - 0.5) * raio * 1.2; p.vida = 0.45; p.tam = raio * 0.55 })
      if (tipo === 'agua') nascer(chance(10), (p) => { p.x = (Math.random() - 0.5) * raio * 1.4; p.y = raio * 0.3; p.vy = raio * (0.6 + Math.random() * 0.6); p.vida = 0.9; p.tam = raio * 0.12 })

      // Anda e desenha
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.idade += dt
        if (p.idade >= p.vida) {
          ps.splice(i, 1)
          continue
        }
        p.x += p.vx * dt
        p.y += p.vy * dt
        const k = p.idade / p.vida
        const x = cx + p.x
        const y = cy + p.y
        if (tipo === 'fogo') {
          p.x += Math.sin(t * 9 + p.semente * 20) * raio * 0.8 * dt
          const tam = p.tam * (1 - k * 0.85)
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = 0.6 * (1 - k)
          ctx.drawImage(bolinha(k < 0.25 ? clarear(cor, 0.45) : cor), x - tam, y - tam, tam * 2, tam * 2)
        } else if (tipo === 'fumaca') {
          const tam = p.tam * (1 + k)
          ctx.globalCompositeOperation = 'source-over'
          ctx.globalAlpha = 0.25 * Math.min(1, k * 4) * (1 - k)
          ctx.drawImage(bolinha(cor), x - tam, y - tam, tam * 2, tam * 2)
        } else if (tipo === 'agua') {
          ctx.globalCompositeOperation = 'source-over'
          ctx.globalAlpha = 0.7 * (1 - k)
          ctx.fillStyle = clarear(cor, 0.5)
          ctx.beginPath()
          ctx.ellipse(x, y, p.tam * 0.6, p.tam, 0, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Constelação, glitter, gelo e metal: estrelinhas que acendem e apagam.
          const pisca = tipo === 'constelacao' ? 0.55 + 0.45 * Math.sin(t * 4 + p.semente * 30) : 1
          const fade = Math.sin(Math.PI * k)
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = Math.max(0, fade * pisca)
          ctx.fillStyle = tipo === 'gelo' ? '#dff6ff' : clarear(cor, tipo === 'metal' ? 0.9 : 0.75)
          estrela(ctx, x, y, p.tam * (tipo === 'metal' ? fade : 1))
          ctx.globalAlpha = Math.max(0, fade * pisca * 0.5)
          ctx.drawImage(bolinha(clarear(cor, 0.4)), x - p.tam, y - p.tam, p.tam * 2, p.tam * 2)
        }
      }
      // Constelação: linhas finas ligando as estrelas do dado.
      if (tipo === 'constelacao' && ps.length > 1) {
        ctx.globalCompositeOperation = 'lighter'
        ctx.strokeStyle = clarear(cor, 0.6)
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ps.forEach((p, i) => {
          const a = Math.sin(Math.PI * (p.idade / p.vida))
          ctx.globalAlpha = 0.6 * a
          if (i === 0) ctx.moveTo(cx + p.x, cy + p.y)
          else ctx.lineTo(cx + p.x, cy + p.y)
        })
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }
  quadro = requestAnimationFrame(passo)
  return () => {
    cancelAnimationFrame(quadro)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, camada.width, camada.height)
  }
}
