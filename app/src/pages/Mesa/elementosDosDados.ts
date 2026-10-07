// Efeitos dos elementos de Ordem nos dados 3D (pedido da Millie, 06/10), desenhados em volta de
// cada dado (ver brilhoDosDados):
//   Sangue: gotas escorrendo e dentes/garras de osso saindo das bordas.
//   Morte: gavinhas de lodo preto enrolando em espiral e fumaça preta subindo.
//   Energia: chamas espectrais magenta, roxas e ciano subindo em volta, e estalinhos elétricos rosa.
//   Conhecimento: letras e sigilos dourados girando e brilhando, com fumaça dourada leve.

export type Elemento = 'sangue' | 'morte' | 'energia' | 'conhecimento'

export const ELEMENTOS: { id: Elemento; rotulo: string; cores: { cor: string; numero: string; contorno: string; material: 'plastico' | 'metal' | 'madeira' | 'vidro' } }[] = [
  { id: 'sangue', rotulo: 'Sangue', cores: { cor: '#3a0306', numero: '#d9ccb0', contorno: '#0a0000', material: 'vidro' } },
  { id: 'morte', rotulo: 'Morte (lodo)', cores: { cor: '#2e2e2c', numero: '#ece8dc', contorno: '#050505', material: 'plastico' } },
  { id: 'energia', rotulo: 'Energia', cores: { cor: '#4a148a', numero: '#ffe9fb', contorno: '#ff3fd2', material: 'metal' } },
  { id: 'conhecimento', rotulo: 'Conhecimento', cores: { cor: '#b8862a', numero: '#fff7c8', contorno: '#ffb300', material: 'plastico' } },
]

// Números neon (pedido da Millie): miolo claro com o contorno brilhando na cor do neon. Mais de um
// par = cada dado sai sorteado num (a Energia: rosa, roxo ou azul).
export const NEON: Partial<Record<Elemento, { numero: string; contorno: string }[]>> = {
  conhecimento: [{ numero: '#fff7c8', contorno: '#ffb300' }],
  energia: [
    { numero: '#ffe9fb', contorno: '#ff3fd2' },
    { numero: '#f1e8ff', contorno: '#9a4dff' },
    { numero: '#e8f6ff', contorno: '#2f9dff' },
  ],
}

// Sigilos do Conhecimento: letras na fonte Sigilos De Conhecimento (a mesma da ficha).
const LETRAS = 'abcdefghijklmnopqrstuvwxyz'

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
    // Gavinhas de lodo saindo do dado e enrolando na ponta (como na referência).
    if (ps.filter((p) => p.ch === 'gavinha').length < 5) for (let i = chance(2.2); i > 0; i--) ps.push(nova({ ch: 'gavinha', ang: Math.random() * Math.PI * 2, vida: 2 + Math.random() * 1.2, tam: raio * (0.8 + Math.random() * 0.6), semente: Math.random() < 0.5 ? 1 : -1 }))
    // Fumaça preta saindo do dado, subindo e se enrolando devagar.
    for (let i = chance(16); i > 0; i--) ps.push(nova({ ch: 'fumaca', cor: '#050505', x: (Math.random() - 0.5) * raio * 1.2, y: (Math.random() - 0.2) * raio * 0.8, vy: -raio * (0.35 + Math.random() * 0.3), vx: (Math.random() - 0.5) * raio * 0.25, vida: 2 + Math.random() * 1.2, tam: raio * (0.45 + Math.random() * 0.3) }))
  }
  if (el === 'energia') {
    // Chamas espectrais (magenta, roxo e ciano) subindo em volta do dado, como no personagem.
    for (let i = chance(48); i > 0; i--) ps.push(nova({ ch: 'chama', x: (Math.random() - 0.5) * raio * 1.8, y: raio * (0.1 + Math.random() * 0.6), vy: -raio * (1.3 + Math.random() * 1), vida: 0.9 + Math.random() * 0.7, tam: raio * (0.2 + Math.random() * 0.16), cor: Math.random() < 0.45 ? '#ff4fd8' : Math.random() < 0.6 ? '#a24dff' : '#4fe3ff' }))
    // Estalinhos elétricos rosa perto da borda.
    for (let i = chance(5); i > 0; i--) {
      const a0 = Math.random() * Math.PI * 2
      const r0 = raio * (0.85 + Math.random() * 0.4)
      const pts: { x: number; y: number }[] = []
      let x = Math.cos(a0) * r0
      let y = Math.sin(a0) * r0
      for (let k = 0; k < 5; k++) {
        pts.push({ x, y })
        x += (Math.random() - 0.5) * raio * 0.35
        y += (Math.random() - 0.7) * raio * 0.3
      }
      ps.push(nova({ ch: 'estalo', vida: 0.1 + Math.random() * 0.12, pts, cor: Math.random() < 0.7 ? '#ff7ae0' : '#8ff0ff' }))
    }
  }
  if (el === 'conhecimento') {
    if (ps.filter((p) => p.ch === 'sigilo').length < 8) for (let i = chance(4); i > 0; i--) ps.push(nova({ ch: 'sigilo', ang: Math.random() * Math.PI * 2, x: raio * (1.15 + Math.random() * 0.45), vida: 2.5 + Math.random() * 2, tam: raio * (0.4 + Math.random() * 0.25), cor: LETRAS[Math.floor(Math.random() * LETRAS.length)] }))
    for (let i = chance(5); i > 0; i--) ps.push(nova({ ch: 'fumaca', x: (Math.random() - 0.5) * raio * 1.4, y: (Math.random() - 0.3) * raio, vy: -raio * 0.35, vida: 2 + Math.random(), tam: raio * 0.6 }))
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
      ctx.strokeStyle = el === 'morte' ? '#07070a' : '#2a0105'
      ctx.fillStyle = el === 'morte' ? '#0a0a0c' : '#3d0207'
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
        ctx.strokeStyle = '#3a3a38'
        ctx.lineWidth = 1.2
        ctx.stroke()
      }
      // Brilho de molhado.
      ctx.globalAlpha *= el === 'morte' ? 0.25 : 0.55
      ctx.fillStyle = el === 'morte' ? '#8c8c86' : '#8a3a3a'
      ctx.beginPath()
      ctx.arc(cx + p.x - p.tam * 0.35, cy + y0 + desce - p.tam * 0.4, p.tam * 0.3, 0, Math.PI * 2)
      ctx.fill()
    } else if (p.ch === 'garra') {
      ctx.globalAlpha = 1
      ctx.fillStyle = '#cfc2a2' // osso velho
      ctx.strokeStyle = '#1e0103'
      ctx.lineWidth = 1.2
      garra(ctx, cx, cy, p.ang, raio * 0.55, p.tam * Math.min(1, sobe * 1.6), raio * 0.11)
    } else if (p.ch === 'gavinha') {
      // Sai da borda, curva pro lado e enrola numa espiral na ponta; cresce e volta.
      const cresce = Math.min(1, sobe * 1.5)
      const dir = p.semente // 1 ou -1: pra que lado enrola
      const pts: { x: number; y: number }[] = []
      let x = Math.cos(p.ang) * raio * 0.55
      let y = Math.sin(p.ang) * raio * 0.55
      let a = p.ang
      const passos = Math.max(2, Math.round(34 * cresce))
      for (let j = 0; j < passos; j++) {
        pts.push({ x, y })
        // Reto e curvando de leve; depois enrola cada vez mais apertado (espiral na ponta).
        const enrola = j > 12 ? 0.32 + (j - 12) * 0.03 : 0.05
        a += dir * enrola + Math.sin(t * 2 + j * 0.4) * 0.03
        const passo = (p.tam / 16) * (j > 12 ? Math.max(0.18, 0.75 - (j - 12) * 0.03) : 1)
        x += Math.cos(a) * passo
        y += Math.sin(a) * passo
      }
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      // Grossa na base e fina na ponta: desenha em pedaços afinando.
      for (let j = 1; j < pts.length; j++) {
        ctx.globalAlpha = 1
        ctx.strokeStyle = '#090909'
        ctx.lineWidth = Math.max(1, raio * 0.16 * (1 - j / pts.length))
        ctx.beginPath()
        ctx.moveTo(cx + pts[j - 1].x, cy + pts[j - 1].y)
        ctx.lineTo(cx + pts[j].x, cy + pts[j].y)
        ctx.stroke()
      }
      // Reflexo cinza de molhado.
      ctx.strokeStyle = '#8c8c86'
      ctx.globalAlpha = 0.55
      ctx.lineWidth = 1
      ctx.beginPath()
      pts.slice(0, Math.floor(pts.length * 0.7)).forEach((q, j) => (j ? ctx.lineTo(cx + q.x - 1, cy + q.y - 1) : ctx.moveTo(cx + q.x - 1, cy + q.y - 1)))
      ctx.stroke()
    } else if (p.ch === 'chama') {
      // Chama espectral: sobe balançando, alonga e some; brilho somado (neon).
      p.y += p.vy * dt
      p.x += Math.sin(t * 6 + p.semente * 30) * raio * 0.5 * dt
      const larg = p.tam * (1 - k * 0.6)
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = 0.8 * Math.min(1, k * 5) * (1 - k)
      ctx.translate(cx + p.x, cy + p.y)
      ctx.scale(1, 2.2)
      ctx.drawImage(bolinha(p.cor!), -larg, -larg, larg * 2, larg * 2)
    } else if (p.ch === 'estalo' && p.pts) {
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = Math.random() < 0.8 ? 1 : 0.4
      ctx.shadowColor = p.cor!
      ctx.shadowBlur = raio * 0.25
      ctx.strokeStyle = p.cor!
      ctx.lineWidth = Math.max(1, raio * 0.035)
      ctx.lineJoin = 'round'
      ctx.beginPath()
      p.pts.forEach((q, i) => (i ? ctx.lineTo(cx + q.x, cy + q.y) : ctx.moveTo(cx + q.x, cy + q.y)))
      ctx.stroke()
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
      ctx.font = `${Math.round(p.tam)}px "Sigilos De Conhecimento"`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(p.cor!, x, y)
    } else if (p.ch === 'fumaca') {
      p.y += p.vy * dt
      p.x += (p.vx + Math.sin(t * 1.5 + p.semente * 20) * p.tam * 0.6) * dt
      const tam = p.tam * (1 + k)
      if (p.cor) {
        // Fumaça preta da Morte: pinta por cima, densa e escura.
        ctx.globalAlpha = 0.38 * sobe
        ctx.drawImage(bolinha(p.cor), cx + p.x - tam, cy + p.y - tam, tam * 2, tam * 2)
      } else {
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = 0.05 * sobe
        ctx.drawImage(bolinha('#d9a93a'), cx + p.x - tam, cy + p.y - tam, tam * 2, tam * 2)
      }
    }
    ctx.restore()
  }
}
