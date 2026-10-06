// Posicionáveis (KAN-53, spec 12.6 + prints do Foundry da Millie): armazém do mestre, em abas.
// Regras puras, testadas.
import type { ObjetoCena } from './cenas'
import type { Desenho } from './desenhos'
import { IMAGEM_LUZ, type LuzAmbiente } from './luz'

export type CategoriaPosicionavel = 'token' | 'objeto' | 'desenho' | 'luz' | 'som' | 'nota'

// Ordem e nomes das abas (no print, Tiles vira "Objetos"; Paredes e Regiões ficam de fora).
export const CATEGORIAS_POSICIONAVEIS: { id: CategoriaPosicionavel; rotulo: string; filtro: string }[] = [
  { id: 'token', rotulo: 'Tokens', filtro: 'Filtrar Tokens' },
  { id: 'objeto', rotulo: 'Objetos', filtro: 'Filtrar Objetos' },
  { id: 'desenho', rotulo: 'Desenhos', filtro: 'Filtrar Desenhos' },
  { id: 'luz', rotulo: 'Luzes Ambientes', filtro: 'Filtrar Luzes Ambientes' },
  { id: 'som', rotulo: 'Sons Ambientes', filtro: 'Filtrar Sons Ambientes' },
  { id: 'nota', rotulo: 'Notas', filtro: 'Filtrar Notas' },
]

// O que vai guardado em `dados`, conforme a aba.
export type DadosPosicionavel = {
  largura?: number // tamanho da área (sons); imagem entra sempre no tamanho dela
  altura?: number
  desenho?: Pick<Desenho, 'tipo' | 'width' | 'height' | 'rotation' | 'pontos' | 'texto' | 'estilo'> // feito com as Ferramentas de Desenho
  volume?: number // sons
  suavizar?: boolean
  texto?: string // notas
  luz?: Partial<LuzAmbiente> | null // Luz Ambiente: raio, cor, intensidade, animação
}

export type Posicionavel = {
  id: string
  campaign_id: string
  categoria: CategoriaPosicionavel
  folder_id: string | null
  name: string
  url: string | null
  dados: DadosPosicionavel
  sort: number
  created_at: string
}

const IMAGEM = /\.(png|jpe?g|gif|webp|avif|svg|bmp)$/i
const AUDIO = /\.(mp3|ogg|wav|m4a|aac|flac|webm|opus)$/i
const DOCUMENTO = /\.(pdf|docx?|odt|txt|rtf|md)$/i

export function ehImagem(nomeOuUrl: string, tipo = ''): boolean {
  return tipo.startsWith('image/') || IMAGEM.test(nomeOuUrl.split(/[?#]/)[0])
}

// Que arquivo cada aba aceita (spec 12.6): Tokens e Objetos, imagens; Desenhos, imagem, PDF ou
// documento; Luzes, imagem (GIF também); Sons, áudio; Notas não importa arquivo.
export function aceitaArquivo(c: CategoriaPosicionavel, arquivo: { name: string; type: string }): boolean {
  const n = arquivo.name
  if (c === 'token' || c === 'objeto' || c === 'luz') return ehImagem(n, arquivo.type)
  if (c === 'desenho') return ehImagem(n, arquivo.type) || arquivo.type === 'application/pdf' || DOCUMENTO.test(n)
  if (c === 'som') return arquivo.type.startsWith('audio/') || AUDIO.test(n)
  return false
}

// Nome padrão = nome do arquivo, sem a extensão (como no Foundry).
export function nomeDoArquivo(nome: string): string {
  return nome.replace(/\.[^.]+$/, '').trim() || 'Sem nome'
}

// Arquivo de desenho que não é imagem (PDF, documento) não vai pro mapa: abre numa aba.
export function vaiProMapa(p: Pick<Posicionavel, 'categoria' | 'url' | 'dados'>): boolean {
  if (p.categoria === 'nota') return false
  if (p.categoria === 'desenho') return !!p.dados.desenho || (!!p.url && ehImagem(p.url))
  if (p.categoria === 'luz') return true // sem imagem entra só a luz
  return !!p.url
}

// O que veio da mesa arrastado pra aba vai pra qual aba.
export function categoriaDoObjeto(o: Pick<ObjetoCena, 'layer' | 'luz'> & { image_url?: string }): CategoriaPosicionavel {
  if (o.luz || o.image_url === IMAGEM_LUZ) return 'luz'
  return o.layer === 'mapa' ? 'objeto' : 'token'
}

// Guarda só a imagem: ao voltar pra mesa, entra no tamanho original dela (pedido da Millie).
export function guardarObjeto(o: ObjetoCena): Pick<Posicionavel, 'categoria' | 'name' | 'url' | 'dados'> {
  const categoria = categoriaDoObjeto(o)
  const padrao = categoria === 'luz' ? 'Luz Ambiente' : categoria === 'objeto' ? 'Objeto' : 'Token'
  // Luz guarda também a configuração dela (raio, cor…); a lâmpada sem imagem volta sem imagem.
  if (categoria === 'luz') return { categoria, name: o.name?.trim() || padrao, url: o.image_url === IMAGEM_LUZ ? null : o.image_url, dados: o.luz_ajuste ? { luz: o.luz_ajuste } : {} }
  return { categoria, name: o.name?.trim() || padrao, url: o.image_url, dados: {} }
}


// Caixa centrada no ponto onde soltou.
export function caixaNoPonto(ponto: { x: number; y: number }, largura: number, altura: number) {
  return { x: Math.round(ponto.x - largura / 2), y: Math.round(ponto.y - altura / 2), width: Math.round(largura), height: Math.round(altura) }
}
