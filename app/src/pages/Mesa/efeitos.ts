// Efeitos animados na mesa (pedido da Millie, 06/10): fogo, fumaça, água, nuvem, veneno e
// faíscas saindo de um objeto, na direção e na cor escolhidas. Partículas simples: cada uma
// nasce perto do objeto, anda, muda de tamanho/transparência e some. Regras puras, testadas;
// o desenho (canvas) fica no EfeitosNoPalco.

export type TipoEfeito = 'fogo' | 'fumaca' | 'agua' | 'nuvem' | 'veneno' | 'faiscas'

export type Efeito = {
  tipo: TipoEfeito
  cor: string
  tamanho: number // quadrados: até onde o efeito vai
  quantidade: number // 0.2..2
  velocidade: number // 0.3..2
  direcao: number // graus, 0 = direita, -90 = pra cima (gira junto com o objeto)
  abertura: number // graus de espalhamento
}

export const TIPOS_EFEITO: { id: TipoEfeito; rotulo: string; padrao: Omit<Efeito, 'tipo'> }[] = [
  { id: 'fogo', rotulo: 'Fogo', padrao: { cor: '#ff5a14', tamanho: 1.5, quantidade: 1, velocidade: 1, direcao: -90, abertura: 25 } },
  { id: 'fumaca', rotulo: 'Fumaça', padrao: { cor: '#8c8c8c', tamanho: 3, quantidade: 1, velocidade: 1, direcao: -90, abertura: 30 } },
  { id: 'agua', rotulo: 'Água', padrao: { cor: '#3fa9ff', tamanho: 3, quantidade: 1, velocidade: 1, direcao: 0, abertura: 12 } },
  { id: 'nuvem', rotulo: 'Nuvem / Névoa', padrao: { cor: '#c9ced8', tamanho: 3, quantidade: 1, velocidade: 1, direcao: 0, abertura: 360 } },
  { id: 'veneno', rotulo: 'Veneno', padrao: { cor: '#62d34a', tamanho: 2, quantidade: 1, velocidade: 1, direcao: -90, abertura: 60 } },
  { id: 'faiscas', rotulo: 'Faíscas', padrao: { cor: '#ffd36b', tamanho: 2, quantidade: 1, velocidade: 1, direcao: -90, abertura: 70 } },
]

export function efeitoPadrao(tipo: TipoEfeito): Efeito {
  return { tipo, ...TIPOS_EFEITO.find((t) => t.id === tipo)!.padrao }
}

export function efeitoCompleto(e: Partial<Efeito> | null | undefined): Efeito | null {
  if (!e?.tipo || !TIPOS_EFEITO.some((t) => t.id === e.tipo)) return null
  return { ...efeitoPadrao(e.tipo), ...e } as Efeito
}

// Como cada tipo se comporta: quantas nascem por segundo, quanto vivem (s), tamanho (fração do
// alcance), gravidade (fração do alcance/s², pra baixo da tela) e o jeito de desenhar.
export type Comportamento = {
  porSegundo: number
  vida: number
  tamanho: [number, number] // ao nascer → ao morrer
  alfa: number
  gravidade: number
  desenho: 'brilho' | 'nevoa' | 'bolha' | 'ponto'
  nasceEspalhado?: number // nasce espalhado nesse raio (fração do alcance), em vez de no centro
  andaFracao: number // distância percorrida na vida, em fração do alcance
}

export const COMPORTAMENTO: Record<TipoEfeito, Comportamento> = {
  fogo: { porSegundo: 110, vida: 0.85, tamanho: [0.26, 0.04], alfa: 0.5, gravidade: 0, desenho: 'brilho', andaFracao: 1.35 },
  fumaca: { porSegundo: 18, vida: 3.2, tamanho: [0.18, 0.55], alfa: 0.28, gravidade: 0, desenho: 'nevoa', andaFracao: 1 },
  agua: { porSegundo: 110, vida: 1.1, tamanho: [0.07, 0.11], alfa: 0.75, gravidade: 0.9, desenho: 'ponto', andaFracao: 1.1 },
  nuvem: { porSegundo: 12, vida: 9, tamanho: [0.22, 0.42], alfa: 0.16, gravidade: 0, desenho: 'nevoa', nasceEspalhado: 0.85, andaFracao: 0.3 },
  veneno: { porSegundo: 26, vida: 2.4, tamanho: [0.05, 0.1], alfa: 0.8, gravidade: 0, desenho: 'bolha', nasceEspalhado: 0.25, andaFracao: 0.8 },
  faiscas: { porSegundo: 34, vida: 1, tamanho: [0.035, 0.015], alfa: 1, gravidade: 1.4, desenho: 'ponto', andaFracao: 1.2 },
}

export type Particula = { x: number; y: number; vx: number; vy: number; idade: number; vida: number; semente: number; nevoa?: boolean }

const RAD = Math.PI / 180

// Uma partícula nova, em coordenadas locais (0,0 = centro do objeto), com o alcance em px.
export function nascer(e: Efeito, alcance: number, giro: number, rnd: () => number = Math.random): Particula {
  const c = COMPORTAMENTO[e.tipo]
  const ang = (e.direcao + giro + (rnd() - 0.5) * Math.min(360, e.abertura)) * RAD
  const vida = c.vida * (0.7 + rnd() * 0.6) / Math.max(0.3, e.velocidade)
  const rapidez = (alcance * c.andaFracao) / (c.vida / Math.max(0.3, e.velocidade)) * (0.75 + rnd() * 0.5)
  let x = 0
  let y = 0
  if (c.nasceEspalhado) {
    const r = Math.sqrt(rnd()) * alcance * c.nasceEspalhado
    const a = rnd() * Math.PI * 2
    x = Math.cos(a) * r
    y = Math.sin(a) * r
  } else {
    // Base do fogo/água um pouco larga, não um ponto.
    x = (rnd() - 0.5) * alcance * 0.32
    y = (rnd() - 0.5) * alcance * 0.06
  }
  return { x, y, vx: Math.cos(ang) * rapidez, vy: Math.sin(ang) * rapidez, idade: 0, vida, semente: rnd(), nevoa: e.tipo === 'veneno' && rnd() < 0.35 }
}

// Avança dt segundos. Devolve false quando a partícula morreu.
export function andar(p: Particula, e: Efeito, alcance: number, dt: number): boolean {
  const c = COMPORTAMENTO[e.tipo]
  p.idade += dt
  if (p.idade >= p.vida) return false
  p.vy += c.gravidade * alcance * dt
  // Fogo e fumaça balançam de lado; o fogo também afunila.
  if (e.tipo === 'fogo' || e.tipo === 'fumaca' || e.tipo === 'veneno') {
    const balanco = Math.sin(p.idade * 7 + p.semente * 20) * alcance * (e.tipo === 'fogo' ? 0.35 : 0.12)
    p.x += balanco * dt
  }
  if (e.tipo === 'fogo') p.x *= 1 - 1.2 * dt
  p.x += p.vx * dt
  p.y += p.vy * dt
  return true
}

// Tamanho (raio, px) e transparência agora: nasce, cresce/encolhe, some no fim.
export function aparencia(p: Particula, e: Efeito, alcance: number): { raio: number; alfa: number; t: number } {
  const c = COMPORTAMENTO[e.tipo]
  const t = Math.min(1, p.idade / p.vida)
  const [t0, t1] = p.nevoa ? [0.25, 0.6] : c.tamanho
  const raio = alcance * (t0 + (t1 - t0) * t)
  const entrada = Math.min(1, t / 0.15)
  const saida = 1 - Math.max(0, (t - 0.6) / 0.4)
  let alfa = c.alfa * entrada * saida * (p.nevoa ? 0.3 : 1)
  if (e.tipo === 'faiscas') alfa *= 0.6 + 0.4 * Math.sin(p.idade * 40 + p.semente * 10)
  return { raio: Math.max(0.5, raio), alfa: Math.max(0, alfa), t }
}

// Quantas partículas nascem neste quadro (com o resto guardado pro próximo).
export function quantasNascem(e: Efeito, dt: number, sobra: number): { n: number; sobra: number } {
  const total = COMPORTAMENTO[e.tipo].porSegundo * Math.max(0.1, e.quantidade) * dt + sobra
  const n = Math.floor(total)
  return { n, sobra: total - n }
}

// Cor clara (brilha somando, como fogo) ou escura (pinta por cima, ex.: fogo preto).
export function corClara(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return true
  const n = parseInt(m[1], 16)
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return lum > 0.35
}

// Miolo do fogo: a cor puxada pro claro (amarelado/branco).
export function corDoMiolo(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return '#fff2c0'
  const n = parseInt(m[1], 16)
  const mistura = (v: number, alvo: number) => Math.round(v + (alvo - v) * 0.65)
  const r = mistura((n >> 16) & 255, 255)
  const g = mistura((n >> 8) & 255, 238)
  const b = mistura(n & 255, 180)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

// Lâmpada/chama que marca um efeito sem imagem (só o mestre vê).
export const IMAGEM_EFEITO = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#1c1d24" fill-opacity="0.85" stroke="#ff9a52" stroke-width="4"/><path d="M50 18c4 14 18 20 18 38a18 18 0 0 1-36 0c0-8 4-13 8-17 1 6 4 9 7 10-2-12 1-22 3-31z" fill="#ff9a52"/></svg>')
