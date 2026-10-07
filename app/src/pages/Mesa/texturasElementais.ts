// Texturas especiais dos dados de elemento (pedido da Millie, 06/10), desenhadas na hora num
// canvas e entregues pra biblioteca dos dados no lugar das texturas de arquivo:
//   Sangue: vermelho-sangue molhado, com veias escuras e reflexos.
//   Morte: lodo preto líquido, espesso e brilhante.
//   Energia: roxo escuro com raios azuis e roxos brilhando por cima.
//   Conhecimento: escuro com sigilos dourados (a fonte Sigilos De Conhecimento da ficha).
import type { Elemento } from './elementosDosDados'

export type TexturaDaBiblioteca = { name: string; composite: string; texture: HTMLCanvasElement; material: string }

const LADO = 512
const prontas = new Map<Elemento, Promise<TexturaDaBiblioteca>>()

// Número aleatório repetível (a textura sai igual sempre).
function semente(s: number) {
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function mancha(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, cor: string, alfa: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, cor)
  g.addColorStop(1, cor + '00')
  ctx.globalAlpha = alfa
  ctx.fillStyle = g
  ctx.fillRect(x - r, y - r, r * 2, r * 2)
  ctx.globalAlpha = 1
}

// Reflexo de molhado: traços curvos claros e finos.
function reflexos(ctx: CanvasRenderingContext2D, rnd: () => number, n: number, cor: string, alfa: number) {
  ctx.strokeStyle = cor
  ctx.lineCap = 'round'
  for (let i = 0; i < n; i++) {
    const x = rnd() * LADO
    const y = rnd() * LADO
    const r = 20 + rnd() * 60
    const a = rnd() * Math.PI * 2
    ctx.globalAlpha = alfa * (0.4 + rnd() * 0.6)
    ctx.lineWidth = 2 + rnd() * 5
    ctx.beginPath()
    ctx.arc(x, y, r, a, a + 0.6 + rnd() * 0.9)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function raio(ctx: CanvasRenderingContext2D, rnd: () => number, cor: string) {
  let x = rnd() * LADO
  let y = rnd() * LADO
  const ang = rnd() * Math.PI * 2
  const pts = [{ x, y }]
  for (let i = 0; i < 9; i++) {
    x += Math.cos(ang + (rnd() - 0.5) * 1.6) * (25 + rnd() * 30)
    y += Math.sin(ang + (rnd() - 0.5) * 1.6) * (25 + rnd() * 30)
    pts.push({ x, y })
  }
  const caminho = () => {
    ctx.beginPath()
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
    ctx.stroke()
  }
  ctx.lineJoin = 'round'
  ctx.shadowColor = cor
  ctx.shadowBlur = 18
  ctx.strokeStyle = cor
  ctx.lineWidth = 10
  caminho()
  ctx.shadowBlur = 10
  ctx.strokeStyle = '#eef6ff'
  ctx.lineWidth = 3.5
  caminho()
  ctx.shadowBlur = 0
}

async function desenhar(el: Elemento): Promise<TexturaDaBiblioteca> {
  const c = document.createElement('canvas')
  c.width = c.height = LADO
  const ctx = c.getContext('2d')!
  const rnd = semente({ sangue: 11, morte: 23, energia: 37, conhecimento: 51 }[el])

  if (el === 'sangue') {
    ctx.fillStyle = '#4e0306'
    ctx.fillRect(0, 0, LADO, LADO)
    for (let i = 0; i < 40; i++) mancha(ctx, rnd() * LADO, rnd() * LADO, 40 + rnd() * 120, rnd() < 0.5 ? '#8a0a12' : '#2a0003', 0.6)
    // Veias escuras.
    ctx.strokeStyle = '#1e0002'
    for (let i = 0; i < 14; i++) {
      ctx.globalAlpha = 0.5
      ctx.lineWidth = 1 + rnd() * 3
      ctx.beginPath()
      let x = rnd() * LADO
      let y = rnd() * LADO
      ctx.moveTo(x, y)
      for (let k = 0; k < 6; k++) {
        x += (rnd() - 0.5) * 90
        y += (rnd() - 0.5) * 90
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    reflexos(ctx, rnd, 26, '#ff9a9a', 0.35)
    return { name: 'sangue', composite: 'source-over', texture: c, material: 'glass' }
  }

  if (el === 'morte') {
    ctx.fillStyle = '#060607'
    ctx.fillRect(0, 0, LADO, LADO)
    // Lodo: manchas fundas e redemoinhos, preto e cinza, com reflexo branco de molhado.
    for (let i = 0; i < 50; i++) mancha(ctx, rnd() * LADO, rnd() * LADO, 30 + rnd() * 110, rnd() < 0.6 ? '#141018' : '#000000', 0.8)
    for (let i = 0; i < 18; i++) mancha(ctx, rnd() * LADO, rnd() * LADO, 20 + rnd() * 50, rnd() < 0.5 ? '#2e2e2e' : '#1a1a1a', 0.45)
    ctx.strokeStyle = '#3c3c3c'
    for (let i = 0; i < 22; i++) {
      const x = rnd() * LADO
      const y = rnd() * LADO
      ctx.globalAlpha = 0.35
      ctx.lineWidth = 2 + rnd() * 4
      ctx.beginPath()
      for (let k = 0; k < 40; k++) {
        const a = k * 0.35
        const r = 4 + k * 1.6
        const px = x + Math.cos(a) * r
        const py = y + Math.sin(a) * r
        if (k) ctx.lineTo(px, py)
        else ctx.moveTo(px, py)
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    reflexos(ctx, rnd, 34, '#e6e6e6', 0.4)
    return { name: 'morte', composite: 'source-over', texture: c, material: 'glass' }
  }

  if (el === 'energia') {
    // Dentro do dado: fundo azul-arroxeado fundo e muitos raios azuis e roxos (quase nada de rosa).
    const g = ctx.createLinearGradient(0, 0, LADO, LADO)
    g.addColorStop(0, '#16148a')
    g.addColorStop(0.5, '#2a1c9a')
    g.addColorStop(1, '#0d3a9a')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, LADO, LADO)
    for (let i = 0; i < 18; i++) mancha(ctx, rnd() * LADO, rnd() * LADO, 40 + rnd() * 90, rnd() < 0.5 ? '#4b2cff' : '#1f6bff', 0.4)
    for (let i = 0; i < 18; i++) raio(ctx, rnd, rnd() < 0.45 ? '#6f4dff' : rnd() < 0.5 ? '#3a8dff' : '#52d6ff')
    return { name: 'energia', composite: 'source-over', texture: c, material: 'glass' }
  }

  // Conhecimento: ouro (dourado e ouro branco), escovado, com sigilos gravados.
  const g = ctx.createLinearGradient(0, 0, LADO, LADO)
  g.addColorStop(0, '#f7e7a8')
  g.addColorStop(0.3, '#d9a83a')
  g.addColorStop(0.55, '#f3efe2')
  g.addColorStop(0.8, '#c99428')
  g.addColorStop(1, '#f0d27a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, LADO, LADO)
  // Faixas de ouro branco e dourado.
  for (let i = 0; i < 22; i++) mancha(ctx, rnd() * LADO, rnd() * LADO, 50 + rnd() * 110, rnd() < 0.45 ? '#fbf6e8' : rnd() < 0.5 ? '#e5b84e' : '#b9862a', 0.45)
  // Escovado: riscos finos na diagonal.
  ctx.strokeStyle = '#fff6d6'
  for (let i = 0; i < 160; i++) {
    const x = rnd() * LADO
    const y = rnd() * LADO
    ctx.globalAlpha = 0.08 + rnd() * 0.12
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + 60 + rnd() * 80, y + 20 + rnd() * 30)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  try {
    await document.fonts.load('40px "Sigilos De Conhecimento"')
  } catch {
    // sem a fonte: sai com a fonte padrão
  }
  const letras = 'abcdefghijklmnopqrstuvwxyz'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < 60; i++) {
    const tam = 22 + rnd() * 34
    ctx.font = `${Math.round(tam)}px "Sigilos De Conhecimento"`
    ctx.save()
    ctx.translate(rnd() * LADO, rnd() * LADO)
    ctx.rotate((rnd() - 0.5) * 1.2)
    const l = letras[Math.floor(rnd() * letras.length)]
    // Gravado: a sombra escura embaixo e o brilho claro em cima.
    ctx.globalAlpha = 0.35 + rnd() * 0.3
    ctx.fillStyle = '#8a5e14'
    ctx.fillText(l, 1.5, 1.5)
    ctx.fillStyle = '#fff4cf'
    ctx.globalAlpha *= 0.8
    ctx.fillText(l, 0, 0)
    ctx.restore()
  }
  ctx.globalAlpha = 1
  // Plástico: o metal da biblioteca escurece sem reflexo de ambiente e o ouro ficava marrom.
  return { name: 'conhecimento', composite: 'source-over', texture: c, material: 'plastic' }
}

export function texturaDoElemento(el: Elemento): Promise<TexturaDaBiblioteca> {
  let p = prontas.get(el)
  if (!p) prontas.set(el, (p = desenhar(el)))
  return p
}
