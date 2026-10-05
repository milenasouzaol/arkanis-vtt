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

// O cone sai do centro do token pra onde ele está virado. Como no Foundry, giro 0 = virado pra
// baixo; girar o token (Shift+rolagem) gira a lanterna junto.
export function coneDaLanterna(
  o: Pick<ObjetoCena, 'id' | 'x' | 'y' | 'width' | 'height' | 'rotation'>,
  tipo: Lanterna,
  celula: { w: number; h: number },
  passos = 16,
): Cone {
  const { alcance, abertura } = FORMA_DA_LANTERNA[tipo]
  const cx = o.x + o.width / 2
  const cy = o.y + o.height / 2
  const raio = alcance * Math.max(celula.w, celula.h)
  const giro = (o.rotation * Math.PI) / 180
  const meia = ((abertura / 2) * Math.PI) / 180
  const pontos = [{ x: cx, y: cy }]
  for (let i = 0; i <= passos; i++) {
    const a = giro - meia + (2 * meia * i) / passos
    // (0, 1) girado no sentido horário pelo ângulo a (o mesmo giro que o CSS faz no token)
    pontos.push({ x: arred(cx - Math.sin(a) * raio), y: arred(cy + Math.cos(a) * raio) })
  }
  return { id: o.id, tipo, cx, cy, raio, pontos }
}

const arred = (n: number) => Math.round(n * 10) / 10

export function caminhoDoCone(c: Pick<Cone, 'pontos'>): string {
  return `M${c.pontos.map((p) => `${p.x} ${p.y}`).join('L')}Z`
}

// Os cones que valem: dos tokens com lanterna ligada que essa pessoa vê.
export function conesDosTokens(
  objetos: (Pick<ObjetoCena, 'id' | 'x' | 'y' | 'width' | 'height' | 'rotation' | 'layer'> & { lanterna?: Lanterna | null })[],
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
