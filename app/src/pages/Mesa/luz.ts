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

// O cone sai do token pra frente dele (pedido da Millie, 05/10): os tokens são de corpo inteiro,
// de lado, olhando pra direita da imagem; a luz sai da altura do peito/mão. Virar o token na
// horizontal vira a lanterna; girar o token gira junto.
export const ALTURA_DA_LANTERNA = 0.15 // acima do centro, em fração da altura do token

export function coneDaLanterna(
  o: Pick<ObjetoCena, 'id' | 'x' | 'y' | 'width' | 'height' | 'rotation'> & { flip_h?: boolean; flip_v?: boolean },
  tipo: Lanterna,
  celula: { w: number; h: number },
  passos = 16,
): Cone {
  const { alcance, abertura } = FORMA_DA_LANTERNA[tipo]
  const giro = (o.rotation * Math.PI) / 180
  // Ponto de saída (antes do giro): no meio da largura, um pouco acima do centro.
  const oy = (o.flip_v ? 1 : -1) * ALTURA_DA_LANTERNA * o.height
  const cx = arred(o.x + o.width / 2 - Math.sin(giro) * oy)
  const cy = arred(o.y + o.height / 2 + Math.cos(giro) * oy)
  const raio = alcance * Math.max(celula.w, celula.h)
  // Frente = direita da imagem; virado na horizontal, esquerda. Depois, o giro do token.
  const frente = giro + (o.flip_h ? Math.PI : 0)
  const meia = ((abertura / 2) * Math.PI) / 180
  const pontos = [{ x: cx, y: cy }]
  for (let i = 0; i <= passos; i++) {
    const a = frente - meia + (2 * meia * i) / passos
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
  objetos: (Pick<ObjetoCena, 'id' | 'x' | 'y' | 'width' | 'height' | 'rotation' | 'layer'> & { lanterna?: Lanterna | null; flip_h?: boolean; flip_v?: boolean })[],
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
