// Recorte de imagem (pedido da Millie, 08/10): em todo lugar que aceita imagem, a pessoa enquadra
// a parte que quer (arrastar + zoom) ou usa a imagem inteira. Contas puras, testadas.

export type Proporcao = { id: string; rotulo: string; valor: number | null } // null = a da imagem

export const PROPORCOES: Proporcao[] = [
  { id: 'original', rotulo: 'Original', valor: null },
  { id: 'quadrado', rotulo: 'Quadrado', valor: 1 },
  { id: 'retrato', rotulo: 'Retrato 3:4', valor: 3 / 4 },
  { id: 'paisagem', rotulo: 'Paisagem 16:9', valor: 16 / 9 },
  { id: 'faixa', rotulo: 'Faixa 3:1', valor: 3 },
]

export type Enquadre = {
  cx: number // centro do recorte, em pixels da imagem
  cy: number
  zoom: number // 1 = o recorte cobre a imagem o máximo possível
}

// Tamanho do recorte (em pixels da imagem) pra proporção e o zoom.
export function tamanhoDoRecorte(largura: number, altura: number, proporcao: number, zoom: number): { w: number; h: number } {
  // Maior retângulo na proporção que cabe na imagem, dividido pelo zoom.
  const w0 = Math.min(largura, altura * proporcao)
  const h0 = w0 / proporcao
  const z = Math.max(1, zoom)
  return { w: w0 / z, h: h0 / z }
}

// Mantém o recorte dentro da imagem.
export function prender(largura: number, altura: number, proporcao: number, e: Enquadre): Enquadre {
  const { w, h } = tamanhoDoRecorte(largura, altura, proporcao, e.zoom)
  const meio = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
  return { zoom: Math.max(1, e.zoom), cx: meio(e.cx, w / 2, largura - w / 2), cy: meio(e.cy, h / 2, altura - h / 2) }
}

// Retângulo final (em pixels da imagem, inteiros).
export function retanguloDoRecorte(largura: number, altura: number, proporcao: number, e: Enquadre): { x: number; y: number; w: number; h: number } {
  const p = prender(largura, altura, proporcao, e)
  const { w, h } = tamanhoDoRecorte(largura, altura, proporcao, p.zoom)
  return { x: Math.round(p.cx - w / 2), y: Math.round(p.cy - h / 2), w: Math.round(w), h: Math.round(h) }
}

// Tamanho de saída: no máximo `maxLado` no lado maior (imagem gigante fica leve).
export function tamanhoDeSaida(w: number, h: number, maxLado: number): { w: number; h: number } {
  const k = Math.min(1, maxLado / Math.max(w, h))
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) }
}
