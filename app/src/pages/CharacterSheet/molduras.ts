// Tamanho do "furo" de cada moldura de avatar, em fração da largura da imagem — medido nos
// PNGs (o raio que vale pra maior parte da volta; as pontas decorativas que entram, como
// chamas e galhos, ficam de fora). Com ele a foto cabe dentro da moldura sem ser coberta.
const FURO: Record<string, number> = {
  anarquico: 0.522, anfitriao: 0.561, anjo: 0.549, aracnasita: 0.545, 'bicho-papao': 0.549, ceifador: 0.435,
  conhecimento: 0.526, 'dama-de-sangue': 0.483, 'deus-da-morte': 0.463, diabo: 0.544, estrangeiro: 0.499,
  morte: 0.56, nidere: 0.255, ocioso: 0.62, sereia: 0.493, telopsia: 0.568,
}

export const TAMANHO_MOLDURA = 150
const PADRAO = 0.5

// Nome da moldura a partir do endereço da imagem (o Vite põe um código depois do nome).
export function nomeDaMoldura(url: string): string | null {
  const m = /frame-([a-z-]+?)(?:-[A-Za-z0-9_]{6,})?\.(?:png|webp)/.exec(url)
  return m ? m[1] : null
}

// Diâmetro da foto dentro da moldura: o furo dela, com uma folguinha, sem passar de 104 px
// (o tamanho da foto sem moldura) nem ficar menor que 40% da moldura.
export function fotoNaMoldura(url: string, moldura = TAMANHO_MOLDURA): number {
  const nome = nomeDaMoldura(url)
  const furo = Math.max(0.42, (nome && FURO[nome]) || PADRAO)
  return Math.round(Math.min(104, Math.max(moldura * 0.4, moldura * furo * 1.02)))
}
