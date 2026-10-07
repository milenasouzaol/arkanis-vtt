// Efeitos dos elementos de Ordem nos dados 3D (pedido da Millie, 06/10), desenhados em volta de
// cada dado (ver brilhoDosDados):
//   Sangue: gotas escorrendo e dentes/garras de osso saindo das bordas.
//   Morte: buraco negro girando em volta (matéria escura caindo em espiral).
//   Energia: jogo de luzes (halo pulsando, feixes girando e pontos de luz com rastro).
//   Conhecimento: letras e sigilos dourados girando e brilhando, com fumaça dourada leve.

export type Elemento = 'sangue' | 'morte' | 'energia' | 'conhecimento'

export const ELEMENTOS: { id: Elemento; rotulo: string; cores: { cor: string; numero: string; contorno: string; material: 'plastico' | 'metal' | 'madeira' | 'vidro' } }[] = [
  { id: 'sangue', rotulo: 'Sangue', cores: { cor: '#6e0b0b', numero: '#f1e6cf', contorno: '#1a0000', material: 'vidro' } },
  { id: 'morte', rotulo: 'Morte (lodo)', cores: { cor: '#141414', numero: '#f0f0f0', contorno: '#000000', material: 'plastico' } },
  { id: 'energia', rotulo: 'Energia', cores: { cor: '#1a1466', numero: '#f1e8ff', contorno: '#9a4dff', material: 'vidro' } },
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
    // Buraco negro: matéria escura espiralando pra dentro do dado.
    for (let i = chance(38); i > 0; i--) ps.push(nova({ ch: 'espiral', ang: Math.random() * Math.PI * 2, x: raio * (1.6 + Math.random() * 0.9), vida: 1.6 + Math.random() * 0.8, tam: raio * (0.06 + Math.random() * 0.08), cor: Math.random() < 0.25 ? '#ffffff' : Math.random() < 0.5 ? '#5a5a5a' : '#080808' }))
  }
  if (el === 'energia') {
    // Jogo de luzes: pontos de luz rápidos girando em volta, com rastro.
    for (let i = chance(14); i > 0; i--) ps.push(nova({ ch: 'luz', ang: Math.random() * Math.PI * 2, x: raio * (0.9 + Math.random() * 0.6), vx: (Math.random() < 0.5 ? -1 : 1) * (2.5 + Math.random() * 2.5), vida: 0.7 + Math.random() * 0.6, tam: raio * (0.07 + Math.random() * 0.06), cor: Math.random() < 0.5 ? '#7a5cff' : '#4fb8ff' }))
  }
  if (el === 'conhecimento') {
    if (ps.filter((p) => p.ch === 'sigilo').length < 8) for (let i = chance(4); i > 0; i--) ps.push(nova({ ch: 'sigilo', ang: Math.random() * Math.PI * 2, x: raio * (1.15 + Math.random() * 0.45), vida: 2.5 + Math.random() * 2, tam: raio * (0.4 + Math.random() * 0.25), cor: LETRAS[Math.floor(Math.random() * LETRAS.length)] }))
    for (let i = chance(5); i > 0; i--) ps.push(nova({ ch: 'fumaca', x: (Math.random() - 0.5) * raio * 1.4, y: (Math.random() - 0.3) * raio, vy: -raio * 0.35, vida: 2 + Math.random(), tam: raio * 0.6 }))
  }

  // Morte: o disco do buraco negro girando atrás do dado, em preto e branco.
  if (el === 'morte') {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(t * 0.9)
    ctx.scale(1, 0.62)
    const r0 = raio * 0.75
    const r1 = raio * 2.1
    const g = ctx.createRadialGradient(0, 0, r0, 0, 0, r1)
    g.addColorStop(0, '#000000')
    g.addColorStop(0.25, '#141414')
    g.addColorStop(0.5, '#3a3a3aaa')
    g.addColorStop(1, '#00000000')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, 0, r1, 0, Math.PI * 2)
    ctx.fill()
    // Braços da espiral.
    ctx.strokeStyle = '#d6d6d6'
    ctx.lineCap = 'round'
    for (let b = 0; b < 3; b++) {
      ctx.globalAlpha = 0.35
      ctx.lineWidth = raio * 0.06
      ctx.beginPath()
      for (let k = 0; k <= 30; k++) {
        const a = (b * Math.PI * 2) / 3 + k * 0.16
        const r = r1 * 0.9 - k * ((r1 * 0.9 - r0) / 30)
        const x = Math.cos(a) * r
        const y = Math.sin(a) * r
        if (k) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      }
      ctx.stroke()
    }
    ctx.restore()
    // Horizonte de eventos: anel fino e brilhante logo em volta do dado.
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = 0.5 + 0.2 * Math.sin(t * 3)
    ctx.strokeStyle = '#f2f2f2'
    ctx.shadowColor = '#ffffff'
    ctx.shadowBlur = raio * 0.4
    ctx.lineWidth = raio * 0.05
    ctx.beginPath()
    ctx.ellipse(cx, cy, raio * 0.95, raio * 0.6, t * 0.9, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  // Energia: halo de luz pulsando e feixes girando atrás do dado.
  if (el === 'energia') {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const pulso = 0.75 + 0.25 * Math.sin(t * 6) + (Math.random() < 0.04 ? 0.5 : 0) // às vezes um clarão
    const halo = raio * 1.9 * pulso
    ctx.globalAlpha = 0.55
    ctx.drawImage(bolinha(Math.sin(t * 2.3) > 0 ? '#5a3cff' : '#2f7fff'), cx - halo, cy - halo, halo * 2, halo * 2)
    ctx.globalAlpha = 0.35
    ctx.drawImage(bolinha('#cfe2ff'), cx - halo * 0.55, cy - halo * 0.55, halo * 1.1, halo * 1.1)
    // Feixes de luz.
    for (let f = 0; f < 6; f++) {
      const a = t * (f % 2 ? 1.1 : -0.8) + (f * Math.PI) / 3
      const comp = raio * (2 + 0.6 * Math.sin(t * 3 + f))
      const g = ctx.createLinearGradient(cx, cy, cx + Math.cos(a) * comp, cy + Math.sin(a) * comp)
      const cor = f % 2 ? '#4fb8ff' : '#6f52ff'
      g.addColorStop(0, cor + 'cc')
      g.addColorStop(1, cor + '00')
      ctx.globalAlpha = 0.5
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(a - 0.09) * comp, cy + Math.sin(a - 0.09) * comp)
      ctx.lineTo(cx + Math.cos(a + 0.09) * comp, cy + Math.sin(a + 0.09) * comp)
      ctx.closePath()
      ctx.fill()
    }
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
      ctx.strokeStyle = '#7d0710'
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
    } else if (p.ch === 'espiral') {
      // Cai em espiral pro centro, cada vez mais rápido, e some no dado.
      p.ang += dt * (1.2 + (1 - k) * 0.4 + k * 3)
      const r = p.x * (1 - k * 0.85)
      const x = cx + Math.cos(p.ang) * r
      const y = cy + Math.sin(p.ang) * r * 0.62
      ctx.globalCompositeOperation = p.cor === '#ffffff' ? 'lighter' : 'source-over'
      ctx.globalAlpha = Math.min(1, k * 4) * (1 - k * 0.7)
      ctx.drawImage(bolinha(p.cor!), x - p.tam * 2, y - p.tam * 2, p.tam * 4, p.tam * 4)
    } else if (p.ch === 'luz') {
      // Ponto de luz girando rápido em volta, com rastro.
      ctx.globalCompositeOperation = 'lighter'
      const pts = 6
      for (let j = 0; j < pts; j++) {
        const a = p.ang - (j * p.vx * 0.012)
        const x = cx + Math.cos(a) * p.x
        const y = cy + Math.sin(a) * p.x * 0.8
        ctx.globalAlpha = sobe * (1 - j / pts) * 0.8
        const tam = p.tam * (1 - j / (pts * 1.3)) * 2
        ctx.drawImage(bolinha(j ? p.cor! : '#ffffff'), x - tam, y - tam, tam * 2, tam * 2)
      }
      p.ang += p.vx * dt
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
      const tam = p.tam * (1 + k)
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = 0.05 * sobe
      ctx.drawImage(bolinha('#d9a93a'), cx + p.x - tam, cy + p.y - tam, tam * 2, tam * 2)
    }
    ctx.restore()
  }
}
