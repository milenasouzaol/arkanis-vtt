// Medir Distância (KAN-52, spec 12.13): régua em metros, com pontos no meio do caminho
// (Ctrl+clique). Regras puras, testadas.
import type { Cena } from './cenas'

export type Ponto = { x: number; y: number }

// grid_altura: altura do quadrado quando a grade cobre a imagem (pode diferir um pouco da largura).
type Grade = Pick<Cena, 'grid_type' | 'grid_size' | 'grid_distance' | 'grid_units'> & { grid_altura?: number }

// Com grade quadrada, a régua anda de centro em centro de quadrado.
export function noCentro(p: Ponto, c: Grade): Ponto {
  if (c.grid_type !== 'quadrado') return p
  const g = c.grid_size
  const h = c.grid_altura ?? g
  return { x: Math.floor(p.x / g) * g + g / 2, y: Math.floor(p.y / h) * h + h / 2 }
}

// Quantos quadrados entre dois pontos. Na grade quadrada a diagonal alterna 1 e 2 (a primeira
// conta 1, a segunda 2…), como no livro; sem grade (ou hexágono) é a distância em linha reta.
export function quadradosEntre(a: Ponto, b: Ponto, c: Grade, diagonaisAntes = 0): { quadrados: number; diagonais: number } {
  const g = c.grid_size
  const h = c.grid_altura ?? g
  const dx = Math.abs(Math.round((b.x - a.x) / g))
  const dy = Math.abs(Math.round((b.y - a.y) / h))
  if (c.grid_type !== 'quadrado') {
    return { quadrados: Math.round((Math.hypot(b.x - a.x, b.y - a.y) / g) * 10) / 10, diagonais: 0 }
  }
  const diag = Math.min(dx, dy)
  const reto = Math.max(dx, dy) - diag
  // Diagonais que custam 2: a cada par, contando as que já vieram nos trechos anteriores.
  const caras = Math.floor((diagonaisAntes + diag) / 2) - Math.floor(diagonaisAntes / 2)
  return { quadrados: reto + diag + caras, diagonais: diag }
}

// A régua inteira: cada trecho e o total, já em metros (unidades da cena).
export function medir(pontos: Ponto[], c: Grade): { trechos: number[]; total: number } {
  const trechos: number[] = []
  let diagonais = 0
  for (let i = 1; i < pontos.length; i++) {
    const t = quadradosEntre(pontos[i - 1], pontos[i], c, diagonais)
    diagonais += t.diagonais
    trechos.push(Math.round(t.quadrados * c.grid_distance * 10) / 10)
  }
  return { trechos, total: Math.round(trechos.reduce((s, t) => s + t, 0) * 10) / 10 }
}

export function textoDaDistancia(valor: number, c: Pick<Cena, 'grid_units'>): string {
  return `${valor.toLocaleString('pt-BR')} ${c.grid_units || 'm'}`
}
