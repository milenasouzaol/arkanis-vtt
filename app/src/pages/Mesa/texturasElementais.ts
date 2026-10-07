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

// Veia de energia: um caminho que desce ondulando, feito de vários fios finos lado a lado (como
// na referência), que às vezes se divide.
function veia(ctx: CanvasRenderingContext2D, rnd: () => number, cor: string, x0?: number, y0?: number, prof = 0) {
  let x = x0 ?? rnd() * LADO
  let y = y0 ?? -20
  let ang = Math.PI / 2 + (rnd() - 0.5) * 0.8
  const pts: { x: number; y: number }[] = [{ x, y }]
  const passos = prof ? 10 : 22
  for (let i = 0; i < passos; i++) {
    ang += (rnd() - 0.5) * 0.7
    x += Math.cos(ang) * 26
    y += Math.sin(ang) * 26
    pts.push({ x, y })
    if (prof < 2 && rnd() < 0.12) veia(ctx, rnd, cor, x, y, prof + 1)
  }
  const fios = prof ? 3 : 6
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let f = 0; f < fios; f++) {
    const off = (f - fios / 2) * 2.2
    ctx.shadowColor = cor
    ctx.shadowBlur = 12
    ctx.strokeStyle = f % 3 === 0 ? '#ffe6fb' : cor
    ctx.globalAlpha = f % 3 === 0 ? 0.55 : 0.75
    ctx.lineWidth = (prof ? 1.2 : 2.4) * (f % 3 === 0 ? 0.6 : 1)
    ctx.beginPath()
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x + off, p.y + off * 0.3) : ctx.moveTo(p.x + off, p.y)))
    ctx.stroke()
  }
  ctx.shadowBlur = 0
  ctx.globalAlpha = 1
}

// Espiral da Morte gravada na textura.
function espiral(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, giro: number, voltas: number) {
  const caminho = (dx: number, dy: number) => {
    ctx.beginPath()
    const n = 60
    for (let k = 0; k <= n; k++) {
      const a = giro + (k / n) * voltas * Math.PI * 2
      const rr = (k / n) * r
      const px = x + dx + Math.cos(a) * rr
      const py = y + dy + Math.sin(a) * rr
      if (k) ctx.lineTo(px, py)
      else ctx.moveTo(px, py)
    }
    ctx.stroke()
  }
  ctx.lineCap = 'round'
  ctx.lineWidth = 4
  ctx.globalAlpha = 0.7
  ctx.strokeStyle = '#0e0e0e'
  caminho(1.5, 1.5)
  ctx.strokeStyle = '#a3a39c'
  caminho(0, 0)
  ctx.globalAlpha = 1
}

// Lodo preto escorrendo, com o reflexo cinza de um lado (como o monstro da referência).
function lodo(ctx: CanvasRenderingContext2D, rnd: () => number) {
  const x = rnd() * LADO
  const larg = 10 + rnd() * 22
  const comp = 80 + rnd() * 260
  const y0 = rnd() < 0.5 ? -10 : rnd() * LADO * 0.6
  ctx.fillStyle = '#080808'
  ctx.beginPath()
  ctx.moveTo(x - larg, y0)
  ctx.lineTo(x + larg, y0)
  ctx.quadraticCurveTo(x + larg * 0.8, y0 + comp * 0.7, x + larg * 0.45, y0 + comp)
  ctx.arc(x, y0 + comp, larg * 0.5, 0, Math.PI)
  ctx.quadraticCurveTo(x - larg * 0.8, y0 + comp * 0.7, x - larg, y0)
  ctx.fill()
  // Reflexo de molhado.
  ctx.strokeStyle = '#8c8c86'
  ctx.lineCap = 'round'
  ctx.globalAlpha = 0.6
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(x - larg * 0.55, y0 + comp * 0.1)
  ctx.quadraticCurveTo(x - larg * 0.5, y0 + comp * 0.6, x - larg * 0.25, y0 + comp * 0.92)
  ctx.stroke()
  ctx.globalAlpha = 1
}

async function desenhar(el: Elemento): Promise<TexturaDaBiblioteca> {
  const c = document.createElement('canvas')
  c.width = c.height = LADO
  const ctx = c.getContext('2d')!
  const rnd = semente({ sangue: 11, morte: 23, energia: 37, conhecimento: 51 }[el])

  if (el === 'sangue') {
    // Mais escuro e macabro (pedido da Millie): sangue quase coagulado, preto-avermelhado.
    ctx.fillStyle = '#240103'
    ctx.fillRect(0, 0, LADO, LADO)
    for (let i = 0; i < 40; i++) mancha(ctx, rnd() * LADO, rnd() * LADO, 40 + rnd() * 120, rnd() < 0.45 ? '#5c040b' : '#0c0001', 0.65)
    // Veias escuras.
    ctx.strokeStyle = '#070000'
    for (let i = 0; i < 14; i++) {
      ctx.globalAlpha = 0.65
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
    reflexos(ctx, rnd, 22, '#c25a5a', 0.28)
    return { name: 'sangue', composite: 'source-over', texture: c, material: 'glass' }
  }

  if (el === 'morte') {
    // Referências da Millie: tons de cinza, lodo preto brilhante escorrendo (com o reflexo cinza)
    // e a espiral da Morte gravada.
    const g = ctx.createLinearGradient(0, 0, 0, LADO)
    g.addColorStop(0, '#3e3e3b')
    g.addColorStop(1, '#232322')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, LADO, LADO)
    for (let i = 0; i < 30; i++) mancha(ctx, rnd() * LADO, rnd() * LADO, 40 + rnd() * 100, rnd() < 0.5 ? '#55554f' : '#161616', 0.4)
    // Espirais gravadas (cinza claro com a sombra escura).
    for (let i = 0; i < 9; i++) espiral(ctx, rnd() * LADO, rnd() * LADO, 18 + rnd() * 26, rnd() * Math.PI * 2, 2.2 + rnd())
    // Lodo escorrendo de cima: faixas pretas que descem e terminam em gota.
    for (let i = 0; i < 16; i++) lodo(ctx, rnd)
    return { name: 'morte', composite: 'source-over', texture: c, material: 'plastic' }
  }

  if (el === 'energia') {
    // Referência da Millie: roxo profundo e granulado, com veias finas e ramificadas fluindo
    // (rosa-magenta, roxo e um pouco de azul), brilhando.
    const g = ctx.createLinearGradient(0, 0, LADO, LADO)
    g.addColorStop(0, '#4a1690')
    g.addColorStop(0.5, '#6a22c0')
    g.addColorStop(1, '#4e1a9a')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, LADO, LADO)
    for (let i = 0; i < 26; i++) mancha(ctx, rnd() * LADO, rnd() * LADO, 40 + rnd() * 120, rnd() < 0.5 ? '#6a22b8' : '#1e0646', 0.4)
    // Grão.
    for (let i = 0; i < 2600; i++) {
      ctx.globalAlpha = 0.05 + rnd() * 0.12
      ctx.fillStyle = rnd() < 0.5 ? '#e8d4ff' : '#12032a'
      ctx.fillRect(rnd() * LADO, rnd() * LADO, 1 + rnd() * 1.5, 1 + rnd() * 1.5)
    }
    ctx.globalAlpha = 1
    for (let i = 0; i < 9; i++) veia(ctx, rnd, rnd() < 0.55 ? '#ff5fd6' : rnd() < 0.6 ? '#b06bff' : '#6f8dff')
    return { name: 'energia', composite: 'source-over', texture: c, material: 'metal' } // metalizado (pedido da Millie)
  }

  // Conhecimento: ouro (dourado e dourado escuro), escovado, com sigilos gravados.
  const g = ctx.createLinearGradient(0, 0, LADO, LADO)
  g.addColorStop(0, '#c99428')
  g.addColorStop(0.3, '#8f6416')
  g.addColorStop(0.55, '#d4a23a')
  g.addColorStop(0.8, '#7a5210')
  g.addColorStop(1, '#c08a26')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, LADO, LADO)
  // Faixas de dourado e dourado escuro.
  for (let i = 0; i < 22; i++) mancha(ctx, rnd() * LADO, rnd() * LADO, 50 + rnd() * 110, rnd() < 0.5 ? '#e0ad3e' : '#6e4a0e', 0.45)
  // Escovado: riscos finos na diagonal.
  ctx.strokeStyle = '#f0c860'
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
    ctx.fillStyle = '#4e3308'
    ctx.fillText(l, 1.5, 1.5)
    ctx.fillStyle = '#f2c75a'
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
