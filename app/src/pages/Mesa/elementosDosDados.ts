// Efeitos dos elementos de Ordem nos dados 3D (pedido da Millie, 06/10), desenhados em volta de
// cada dado (ver brilhoDosDados):
//   Sangue: gotas escorrendo e dentes/garras de osso saindo das bordas.
//   Morte: lodo preto espesso escorrendo e borbulhando embaixo, com ossos saindo dele.
//   Energia: raios roxos e azuis saindo do dado e correndo em volta.
//   Conhecimento: letras e sigilos dourados girando e brilhando, com fumaça dourada leve.

export type Elemento = 'sangue' | 'morte' | 'energia' | 'conhecimento'

export const ELEMENTOS: { id: Elemento; rotulo: string; cores: { cor: string; numero: string; contorno: string; material: 'plastico' | 'metal' | 'madeira' | 'vidro' } }[] = [
  { id: 'sangue', rotulo: 'Sangue', cores: { cor: '#6e0b0b', numero: '#f1e6cf', contorno: '#1a0000', material: 'vidro' } },
  { id: 'morte', rotulo: 'Morte (lodo)', cores: { cor: '#141414', numero: '#d8d0bb', contorno: '#000000', material: 'plastico' } },
  { id: 'energia', rotulo: 'Energia', cores: { cor: '#3a1d7a', numero: '#bfe9ff', contorno: '#120830', material: 'vidro' } },
  { id: 'conhecimento', rotulo: 'Conhecimento', cores: { cor: '#2b2010', numero: '#f2c45a', contorno: '#000000', material: 'metal' } },
]

// Letras e sigilos do Conhecimento.
const SIGILOS = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟΨΩΔΣΦΘΛ☉☿♄♃♂♀☽⊕⚶⚷'

type Peca = { x: number; y: number; vx: number; vy: number; idade: number; vida: number; tam: number; semente: number; ang: number; ch?: string; pts?: { x: number; y: number }[]; cor?: string }

export type EstadoDoDado = { pecas: Peca[] }

export function novoEstado(): EstadoDoDado {
  return { pecas: [] }
}

const nova = (c: Partial<Peca>): Peca => ({ x: 0, y: 0, vx: 0, vy: 0, idade: 0, vida: 1, tam: 1, semente: Math.random(), ang: 0, ...c })

// Garra/dente: curva fina e pontuda saindo da borda (ângulo a), crescendo e voltando.
function garra(ctx: CanvasRenderingContext2D, cx: number, cy: number, a: number, base: number, comp: number, larg: number) {
  const ux = Math.cos(a)
  const uy = Math.sin(a)
  const px = -uy
  const py = ux
  const bx = cx + ux * base
  const by = cy + uy * base
  const tx = bx + ux * comp + px * comp * 0.35 // ponta curvada pro lado
  const ty = by + uy * comp + py * comp * 0.35
  ctx.beginPath()
  ctx.moveTo(bx + px * larg, by + py * larg)
  ctx.quadraticCurveTo(bx + ux * comp * 0.6 + px * larg * 0.9, by + uy * comp * 0.6 + py * larg * 0.9, tx, ty)
  ctx.quadraticCurveTo(bx + ux * comp * 0.5 - px * larg * 0.2, by + uy * comp * 0.5 - py * larg * 0.2, bx - px * larg, by - py * larg)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

// Osso: um traço com as duas pontas redondinhas.
function osso(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, comp: number, larg: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(ang)
  ctx.lineCap = 'round'
  ctx.lineWidth = larg
  ctx.beginPath()
  ctx.moveTo(-comp / 2, 0)
  ctx.lineTo(comp / 2, 0)
  ctx.stroke()
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.arc((s * comp) / 2, -larg * 0.45, larg * 0.62, 0, Math.PI * 2)
    ctx.arc((s * comp) / 2, larg * 0.45, larg * 0.62, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

// Raio: zigue-zague entre dois pontos.
function zigue(x0: number, y0: number, x1: number, y1: number, passos: number, desvio: number): { x: number; y: number }[] {
  const pts = [{ x: x0, y: y0 }]
  const dx = x1 - x0
  const dy = y1 - y0
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  for (let i = 1; i < passos; i++) {
    const k = i / passos
    const d = (Math.random() - 0.5) * desvio * 2
    pts.push({ x: x0 + dx * k + nx * d, y: y0 + dy * k + ny * d })
  }
  pts.push({ x: x1, y: y1 })
  return pts
}

function linha(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[], ox: number, oy: number) {
  ctx.beginPath()
  pts.forEach((p, i) => (i ? ctx.lineTo(ox + p.x, oy + p.y) : ctx.moveTo(ox + p.x, oy + p.y)))
  ctx.stroke()
}

// Um quadro do efeito em volta de um dado (centro cx, cy; raio na tela).
export function passoDoElemento(ctx: CanvasRenderingContext2D, el: Elemento, est: EstadoDoDado, cx: number, cy: number, raio: number, t: number, dt: number, bolinha: (cor: string) => HTMLCanvasElement) {
  const ps = est.pecas
  const chance = (porSeg: number) => Math.floor(porSeg * dt + Math.random())

  if (el === 'sangue') {
    // Gotas escorrendo de baixo do dado.
    for (let i = chance(5); i > 0; i--) ps.push(nova({ ch: 'gota', x: (Math.random() - 0.5) * raio * 1.3, y: raio * (0.25 + Math.random() * 0.3), vida: 1.6 + Math.random(), tam: raio * (0.07 + Math.random() * 0.05) }))
    // Dentes e garras saindo das bordas.
    if (ps.filter((p) => p.ch === 'garra').length < 4) for (let i = chance(1.6); i > 0; i--) ps.push(nova({ ch: 'garra', ang: Math.random() * Math.PI * 2, vida: 1.4 + Math.random() * 0.8, tam: raio * (0.45 + Math.random() * 0.35) }))
  }
  if (el === 'morte') {
    for (let i = chance(4); i > 0; i--) ps.push(nova({ ch: 'gota', x: (Math.random() - 0.5) * raio * 1.2, y: raio * (0.3 + Math.random() * 0.25), vida: 2.4 + Math.random(), tam: raio * (0.1 + Math.random() * 0.08) }))
    for (let i = chance(3); i > 0; i--) ps.push(nova({ ch: 'bolha', x: (Math.random() - 0.5) * raio * 1.8, y: raio * (0.75 + Math.random() * 0.25), vida: 0.9 + Math.random() * 0.6, tam: raio * (0.08 + Math.random() * 0.08) }))
    if (ps.filter((p) => p.ch === 'osso').length < 3) for (let i = chance(0.9); i > 0; i--) ps.push(nova({ ch: 'osso', x: (Math.random() - 0.5) * raio * 1.4, y: raio * 0.8, vy: -raio * 0.35, vx: (Math.random() - 0.5) * raio * 0.3, ang: (Math.random() - 0.5) * 1.6, vida: 2.2 + Math.random(), tam: raio * (0.4 + Math.random() * 0.2) }))
  }
  if (el === 'energia') {
    // Raios saindo do dado e arcos correndo em volta, piscando rápido.
    for (let i = chance(9); i > 0; i--) {
      const a = Math.random() * Math.PI * 2
      const r0 = raio * 0.55
      const r1 = raio * (1.3 + Math.random() * 0.7)
      ps.push(nova({ ch: 'raio', vida: 0.12 + Math.random() * 0.14, cor: Math.random() < 0.5 ? '#a066ff' : '#52c8ff', pts: zigue(Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * r1, Math.sin(a) * r1, 6, raio * 0.18) }))
    }
    for (let i = chance(5); i > 0; i--) {
      const a = Math.random() * Math.PI * 2
      const arco = 0.6 + Math.random() * 0.9
      const rr = raio * (1 + Math.random() * 0.2)
      const pts: { x: number; y: number }[] = []
      for (let k = 0; k <= 10; k++) {
        const b = a + (arco * k) / 10
        const j = (Math.random() - 0.5) * raio * 0.16
        pts.push({ x: Math.cos(b) * (rr + j), y: Math.sin(b) * (rr + j) })
      }
      ps.push(nova({ ch: 'raio', vida: 0.15 + Math.random() * 0.15, cor: Math.random() < 0.5 ? '#7b3cff' : '#3fa8ff', pts }))
    }
  }
  if (el === 'conhecimento') {
    if (ps.filter((p) => p.ch === 'sigilo').length < 8) for (let i = chance(4); i > 0; i--) ps.push(nova({ ch: 'sigilo', ang: Math.random() * Math.PI * 2, x: raio * (1.15 + Math.random() * 0.45), vida: 2.5 + Math.random() * 2, tam: raio * (0.32 + Math.random() * 0.2), cor: SIGILOS[Math.floor(Math.random() * SIGILOS.length)] }))
    for (let i = chance(5); i > 0; i--) ps.push(nova({ ch: 'fumaca', x: (Math.random() - 0.5) * raio * 1.4, y: (Math.random() - 0.3) * raio, vy: -raio * 0.35, vida: 2 + Math.random(), tam: raio * 0.6 }))
  }

  // Morte: aura sombria e a poça de lodo embaixo do dado (pra aparecer até em mapa escuro).
  if (el === 'morte') {
    ctx.save()
    ctx.globalAlpha = 0.55 + 0.1 * Math.sin(t * 2)
    const aura = raio * 1.9
    ctx.drawImage(bolinha('#3b2450'), cx - aura, cy - aura * 0.8, aura * 2, aura * 2)
    ctx.globalAlpha = 0.95
    ctx.fillStyle = '#070708'
    ctx.strokeStyle = '#5b4772'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    const larg = raio * (1.15 + 0.05 * Math.sin(t * 1.7))
    ctx.ellipse(cx, cy + raio * 0.95, larg, raio * 0.28, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i]
    p.idade += dt
    if (p.idade >= p.vida) {
      ps.splice(i, 1)
      continue
    }
    const k = p.idade / p.vida
    const sobe = Math.sin(Math.PI * k) // aparece e some
    ctx.save()
    if (p.ch === 'gota') {
      // Escorre devagar e depois mais rápido, deixando o rastro.
      const y0 = p.y
      const desce = raio * (el === 'morte' ? 0.9 : 1.4) * k * k
      const espesso = el === 'morte' ? 1.5 : 1
      ctx.globalAlpha = Math.min(1, (1 - k) * 2.2)
      ctx.strokeStyle = el === 'morte' ? '#07070a' : '#7d0710'
      ctx.fillStyle = el === 'morte' ? '#0a0a0c' : '#9a0b14'
      ctx.lineCap = 'round'
      ctx.lineWidth = p.tam * 0.9 * espesso
      ctx.beginPath()
      ctx.moveTo(cx + p.x, cy + y0)
      ctx.lineTo(cx + p.x, cy + y0 + desce)
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(cx + p.x, cy + y0 + desce, p.tam * espesso, p.tam * 1.35 * espesso, 0, 0, Math.PI * 2)
      ctx.fill()
      if (el === 'morte') {
        ctx.strokeStyle = '#5b4772'
        ctx.lineWidth = 1.2
        ctx.stroke()
      }
      // Brilho de molhado.
      ctx.globalAlpha *= el === 'morte' ? 0.25 : 0.55
      ctx.fillStyle = el === 'morte' ? '#5a4f6a' : '#ff8a8a'
      ctx.beginPath()
      ctx.arc(cx + p.x - p.tam * 0.35, cy + y0 + desce - p.tam * 0.4, p.tam * 0.3, 0, Math.PI * 2)
      ctx.fill()
    } else if (p.ch === 'garra') {
      ctx.globalAlpha = 1
      ctx.fillStyle = '#efe4cc'
      ctx.strokeStyle = '#4a0606'
      ctx.lineWidth = 1.2
      garra(ctx, cx, cy, p.ang, raio * 0.55, p.tam * Math.min(1, sobe * 1.6), raio * 0.11)
    } else if (p.ch === 'bolha') {
      const tam = p.tam * (0.6 + k)
      ctx.globalAlpha = 0.9 * (1 - k)
      ctx.fillStyle = '#060607'
      ctx.beginPath()
      ctx.arc(cx + p.x, cy + p.y, tam, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#7a6694'
      ctx.lineWidth = 1.4
      ctx.stroke()
    } else if (p.ch === 'osso') {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.ang += dt * 0.6
      ctx.globalAlpha = Math.min(1, sobe * 1.8)
      ctx.strokeStyle = '#ddd3bd'
      ctx.fillStyle = '#ddd3bd'
      osso(ctx, cx + p.x, cy + p.y, p.ang, p.tam, p.tam * 0.18)
    } else if (p.ch === 'raio' && p.pts) {
      const pisca = Math.random() < 0.8 ? 1 : 0.3
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = pisca * (1 - k * 0.6)
      ctx.shadowColor = p.cor!
      ctx.shadowBlur = raio * 0.35
      ctx.strokeStyle = p.cor!
      ctx.lineWidth = Math.max(1.5, raio * 0.07)
      ctx.lineJoin = 'round'
      linha(ctx, p.pts, cx, cy)
      ctx.shadowBlur = 0
      ctx.strokeStyle = '#f2ecff'
      ctx.lineWidth = Math.max(0.8, raio * 0.025)
      linha(ctx, p.pts, cx, cy)
    } else if (p.ch === 'sigilo') {
      // Gira devagar em volta do dado, acendendo e apagando.
      p.ang += dt * 0.5
      const x = cx + Math.cos(p.ang) * p.x
      const y = cy + Math.sin(p.ang) * p.x * 0.75
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = sobe * (0.7 + 0.3 * Math.sin(t * 5 + p.semente * 20))
      ctx.shadowColor = '#f5c04a'
      ctx.shadowBlur = raio * 0.3
      ctx.fillStyle = '#ffd77a'
      ctx.font = `${Math.round(p.tam)}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(p.cor!, x, y)
    } else if (p.ch === 'fumaca') {
      p.y += p.vy * dt
      const tam = p.tam * (1 + k)
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = 0.05 * sobe
      ctx.drawImage(bolinha('#d9a93a'), cx + p.x - tam, cy + p.y - tam, tam * 2, tam * 2)
    }
    ctx.restore()
  }
}
