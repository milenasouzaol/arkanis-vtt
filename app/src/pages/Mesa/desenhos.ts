// Ferramentas de Desenho (KAN-52, spec 12.13): regras puras dos desenhos em cima do mapa.

export type TipoDesenho = 'retangulo' | 'elipse' | 'poligono' | 'livre' | 'texto'

export type EstiloDesenho = {
  linha: { largura: number; cor: string; opacidade: number }
  preenchimento: { tipo: 'nenhum' | 'solido'; cor: string; opacidade: number }
  texto: { fonte: string; tamanho: number; cor: string; opacidade: number }
}

export type Desenho = {
  id: string
  scene_id: string
  campaign_id: string
  author_id: string
  tipo: TipoDesenho
  x: number
  y: number
  width: number
  height: number
  rotation: number
  pontos: [number, number][] // relativos à caixa (polígono e mão livre)
  texto: string | null
  estilo: EstiloDesenho
  sort: number
  created_at: string
}

export const ESTILO_PADRAO: EstiloDesenho = {
  linha: { largura: 4, cor: '#e8e8ec', opacidade: 1 },
  preenchimento: { tipo: 'nenhum', cor: '#e8e8ec', opacidade: 0.3 },
  texto: { fonte: 'Signika', tamanho: 48, cor: '#e8e8ec', opacidade: 1 },
}

// Junta o estilo salvo com o padrão (desenho antigo sem algum campo não quebra).
export function estiloCompleto(e: Partial<EstiloDesenho> | null | undefined): EstiloDesenho {
  return {
    linha: { ...ESTILO_PADRAO.linha, ...(e?.linha ?? {}) },
    preenchimento: { ...ESTILO_PADRAO.preenchimento, ...(e?.preenchimento ?? {}) },
    texto: { ...ESTILO_PADRAO.texto, ...(e?.texto ?? {}) },
  }
}

type Ponto = { x: number; y: number }

// Retângulo/elipse arrastado de a até b. Com "proporcional" (Alt na elipse), vira círculo/quadrado.
export function caixaDoArrasto(a: Ponto, b: Ponto, proporcional = false): { x: number; y: number; width: number; height: number } {
  let w = b.x - a.x
  let h = b.y - a.y
  if (proporcional) {
    const lado = Math.max(Math.abs(w), Math.abs(h))
    w = Math.sign(w || 1) * lado
    h = Math.sign(h || 1) * lado
  }
  return { x: Math.min(a.x, a.x + w), y: Math.min(a.y, a.y + h), width: Math.abs(w), height: Math.abs(h) }
}

// Polígono / mão livre: a caixa em volta dos pontos e os pontos relativos a ela.
export function caixaDosPontos(pontos: Ponto[]): { x: number; y: number; width: number; height: number; pontos: [number, number][] } {
  if (!pontos.length) return { x: 0, y: 0, width: 0, height: 0, pontos: [] }
  const xs = pontos.map((p) => p.x)
  const ys = pontos.map((p) => p.y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return {
    x, y,
    width: Math.max(...xs) - x,
    height: Math.max(...ys) - y,
    pontos: pontos.map((p) => [Math.round((p.x - x) * 10) / 10, Math.round((p.y - y) * 10) / 10]),
  }
}

// Mão livre: tira pontos colados demais (o traço fica leve sem perder a forma).
export function simplificar(pontos: Ponto[], distanciaMinima = 4): Ponto[] {
  if (pontos.length < 3) return pontos
  const saida = [pontos[0]]
  for (let i = 1; i < pontos.length - 1; i++) {
    const u = saida[saida.length - 1]
    if (Math.hypot(pontos[i].x - u.x, pontos[i].y - u.y) >= distanciaMinima) saida.push(pontos[i])
  }
  saida.push(pontos[pontos.length - 1])
  return saida
}

// Caminho SVG da forma, em coordenadas da caixa.
export function caminhoDoDesenho(d: Pick<Desenho, 'tipo' | 'width' | 'height' | 'pontos'>): string {
  if (d.tipo === 'retangulo') return `M0 0H${d.width}V${d.height}H0Z`
  if (d.tipo === 'elipse') {
    const rx = d.width / 2
    const ry = d.height / 2
    return `M0 ${ry}A${rx} ${ry} 0 1 0 ${d.width} ${ry}A${rx} ${ry} 0 1 0 0 ${ry}Z`
  }
  if ((d.tipo === 'poligono' || d.tipo === 'livre') && d.pontos.length) {
    const [p0, ...resto] = d.pontos
    return `M${p0[0]} ${p0[1]}${resto.map((p) => `L${p[0]} ${p[1]}`).join('')}${d.tipo === 'poligono' ? 'Z' : ''}`
  }
  return ''
}

// Um desenho pequeno demais (um clique sem arrastar) não vale a pena guardar.
export function grandeOSuficiente(c: { width: number; height: number }, minimo = 4): boolean {
  return c.width >= minimo || c.height >= minimo
}
