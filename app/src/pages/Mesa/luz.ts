// Lanterna e escuridão (pedido da Millie, 05/10): regras puras, testadas.
import type { ObjetoCena } from './cenas'

export type Lanterna = 'comum' | 'uv'

export const LANTERNAS: { id: Lanterna; rotulo: string }[] = [
  { id: 'comum', rotulo: 'Lanterna Comum' },
  { id: 'uv', rotulo: 'Lanterna UV' },
]

// Alcance (em quadrados da grade) e abertura (graus) do cone. Não precisa ser grande.
// força = quanto ela clareia a escuridão (a UV, luz negra, clareia menos).
export const FORMA_DA_LANTERNA: Record<Lanterna, { alcance: number; abertura: number; forca: number }> = {
  comum: { alcance: 5, abertura: 60, forca: 1 },
  uv: { alcance: 4, abertura: 50, forca: 0.6 },
}

export type Cone = { id: string; tipo: Lanterna; cx: number; cy: number; raio: number; pontos: { x: number; y: number }[] }

// Onde a lanterna está no desenho do token e pra onde aponta (Configurar Lanterna: a pessoa
// desenha uma seta). Guardado no desenho, antes de virar e girar, então acompanha o token.
//   ox/oy: fração da largura/altura a partir do canto de cima à esquerda
//   angulo: graus, 0 = pra direita da imagem, sentido horário
//   alcance: comprimento da seta = até onde a luz vai, em alturas do token (acompanha se o token
//   for redimensionado; cada mapa tem uma escala, então quem decide o tamanho é a pessoa)
export type AjusteLanterna = { ox: number; oy: number; angulo: number; alcance?: number }

// A UV vai um pouco menos longe que a comum, com a mesma seta.
const ALCANCE_RELATIVO: Record<Lanterna, number> = { comum: 1, uv: 0.8 }

// Sem configurar: os tokens são de corpo inteiro, de lado, olhando pra direita; a luz sai da
// altura do peito/mão, pra frente.
export const AJUSTE_PADRAO: AjusteLanterna = { ox: 0.5, oy: 0.35, angulo: 0 }

type TokenDaLanterna = Pick<ObjetoCena, 'id' | 'x' | 'y' | 'width' | 'height' | 'rotation'> & {
  flip_h?: boolean
  flip_v?: boolean
  lanterna_ajuste?: AjusteLanterna | null
}

const RAD = Math.PI / 180

// Ajuste (no desenho do token) → ponto e ângulo no mapa.
export function lanternaNoMapa(o: TokenDaLanterna): { x: number; y: number; angulo: number } {
  const a = o.lanterna_ajuste ?? AJUSTE_PADRAO
  const giro = o.rotation * RAD
  let lx = (a.ox - 0.5) * o.width
  let ly = (a.oy - 0.5) * o.height
  let ang = a.angulo * RAD
  if (o.flip_h) { lx = -lx; ang = Math.PI - ang }
  if (o.flip_v) { ly = -ly; ang = -ang }
  return {
    x: o.x + o.width / 2 + lx * Math.cos(giro) - ly * Math.sin(giro),
    y: o.y + o.height / 2 + lx * Math.sin(giro) + ly * Math.cos(giro),
    angulo: ang + giro,
  }
}

// Seta desenhada no mapa (de → para) → ajuste no desenho do token.
export function ajusteDaSeta(o: TokenDaLanterna, de: { x: number; y: number }, para: { x: number; y: number }): AjusteLanterna {
  const giro = o.rotation * RAD
  const vx = de.x - (o.x + o.width / 2)
  const vy = de.y - (o.y + o.height / 2)
  let lx = vx * Math.cos(giro) + vy * Math.sin(giro)
  let ly = -vx * Math.sin(giro) + vy * Math.cos(giro)
  let ang = Math.atan2(para.y - de.y, para.x - de.x) - giro
  if (o.flip_h) { lx = -lx; ang = Math.PI - ang }
  if (o.flip_v) { ly = -ly; ang = -ang }
  const graus = ((((ang / RAD) % 360) + 360) % 360)
  const r3 = (n: number) => Math.round(n * 1000) / 1000
  const comprimento = Math.hypot(para.x - de.x, para.y - de.y)
  return { ox: r3(lx / o.width + 0.5), oy: r3(ly / o.height + 0.5), angulo: Math.round(graus * 10) / 10, alcance: r3(comprimento / o.height) }
}

export function coneDaLanterna(o: TokenDaLanterna, tipo: Lanterna, celula: { w: number; h: number }, passos = 16): Cone {
  const { alcance, abertura } = FORMA_DA_LANTERNA[tipo]
  const l = lanternaNoMapa(o)
  const cx = arred(l.x)
  const cy = arred(l.y)
  const ajustado = o.lanterna_ajuste?.alcance
  const raio = ajustado ? ajustado * o.height * ALCANCE_RELATIVO[tipo] : alcance * Math.max(celula.w, celula.h)
  const meia = (abertura / 2) * RAD
  const pontos = [{ x: cx, y: cy }]
  for (let i = 0; i <= passos; i++) {
    const a = l.angulo - meia + (2 * meia * i) / passos
    pontos.push({ x: arred(cx + Math.cos(a) * raio), y: arred(cy + Math.sin(a) * raio) })
  }
  return { id: o.id, tipo, cx, cy, raio, pontos }
}

const arred = (n: number) => Math.round(n * 10) / 10

export function caminhoDoCone(c: Pick<Cone, 'pontos'>): string {
  return `M${c.pontos.map((p) => `${p.x} ${p.y}`).join('L')}Z`
}

// Os cones que valem: dos tokens com lanterna ligada que essa pessoa vê.
export function conesDosTokens(
  objetos: (TokenDaLanterna & Pick<ObjetoCena, 'layer'> & { lanterna?: Lanterna | null })[],
  celula: { w: number; h: number },
  souMestre: boolean,
): Cone[] {
  return objetos
    .filter((o) => o.lanterna && o.layer !== 'mapa' && (souMestre || o.layer !== 'mestre'))
    .map((o) => coneDaLanterna(o, o.lanterna as Lanterna, celula))
}

// O que o jogador vê de um objeto "só na luz UV": nada fora da luz UV.
export function caminhoDaLuzUv(cones: Cone[]): string | null {
  const uv = cones.filter((c) => c.tipo === 'uv')
  return uv.length ? uv.map(caminhoDoCone).join(' ') : null
}
