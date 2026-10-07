// Diário (KAN-53, spec 12.11 + prints do Foundry da Millie, 06/10): registros com páginas de
// Texto, Imagem, PDF e Vídeo. Regras puras, testadas.
import type { NivelAcesso } from './atores'

export type TipoPagina = 'texto' | 'imagem' | 'pdf' | 'video'

export const TIPOS_PAGINA: { id: TipoPagina; rotulo: string }[] = [
  { id: 'texto', rotulo: 'Texto' },
  { id: 'imagem', rotulo: 'Imagem' },
  { id: 'pdf', rotulo: 'PDF' },
  { id: 'video', rotulo: 'Vídeo' },
]

export type OpcoesVideo = { controles: boolean; auto: boolean; loop: boolean; volume: number; inicio: number }

export type Pagina = {
  id: string
  nome: string
  tipo: TipoPagina
  mostrarTitulo: boolean
  texto?: string // texto rico (Texto)
  url?: string // arquivo ou link (Imagem, PDF, Vídeo)
  legenda?: string // Imagem
  video?: OpcoesVideo
}

export type EntradaDiario = {
  id: string
  campaign_id: string
  folder_id: string | null
  author_id: string
  name: string
  paginas: Pagina[]
  acesso_padrao: NivelAcesso
  acesso_jogadores: Record<string, NivelAcesso>
  mostrar_mestres: boolean
  sort: number
  created_at: string
}

export const VIDEO_PADRAO: OpcoesVideo = { controles: true, auto: false, loop: false, volume: 0.5, inicio: 0 }

export function novaPagina(nome: string, tipo: TipoPagina, id: string = crypto.randomUUID()): Pagina {
  return { id, nome: nome.trim() || TIPOS_PAGINA.find((t) => t.id === tipo)!.rotulo, tipo, mostrarTitulo: true, ...(tipo === 'video' ? { video: { ...VIDEO_PADRAO } } : {}) }
}

// Mestre e quem escreveu são donos; os outros, pelo Configurar Propriedade.
export function nivelNoDiario(e: Pick<EntradaDiario, 'author_id' | 'acesso_padrao' | 'acesso_jogadores'>, userId: string, souMestre: boolean): NivelAcesso {
  if (souMestre || e.author_id === userId) return 'dono'
  return e.acesso_jogadores[userId] ?? e.acesso_padrao
}

// Mover uma página de lugar (arrastar no índice).
export function moverPagina(paginas: Pagina[], de: number, para: number): Pagina[] {
  if (de === para || de < 0 || de >= paginas.length) return paginas
  const l = [...paginas]
  const [p] = l.splice(de, 1)
  l.splice(Math.max(0, Math.min(l.length, para)), 0, p)
  return l
}

// Procurar Páginas: pelo nome ou pelo que está escrito.
export function paginasQueBatem(paginas: Pagina[], busca: string): Set<string> {
  const t = semAcento(busca.trim())
  if (!t) return new Set(paginas.map((p) => p.id))
  return new Set(paginas.filter((p) => semAcento(p.nome).includes(t) || semAcento(textoDoHtml(p.texto ?? '')).includes(t) || semAcento(p.legenda ?? '').includes(t)).map((p) => p.id))
}

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const textoDoHtml = (h: string) => h.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')

// Link do YouTube (watch, youtu.be, shorts) → endereço de embutir, com as opções do vídeo.
// Outro link ou arquivo → null (toca no <video>).
export function embutirYoutube(url: string, o: OpcoesVideo = VIDEO_PADRAO): string | null {
  const m = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i.exec(url)
  if (!m) return null
  const id = m[1]
  const q = new URLSearchParams({ rel: '0', controls: o.controles ? '1' : '0', autoplay: o.auto ? '1' : '0' })
  if (o.auto) q.set('mute', '1') // o navegador só deixa tocar sozinho sem som
  if (o.loop) {
    q.set('loop', '1')
    q.set('playlist', id)
  }
  if (o.inicio > 0) q.set('start', String(Math.floor(o.inicio)))
  return `https://www.youtube-nocookie.com/embed/${id}?${q.toString()}`
}

// Duplicar: mesmo conteúdo, nome "(Cópia)", páginas com ids novos.
export function copiaDoDiario(e: EntradaDiario, autor: string): Omit<EntradaDiario, 'id' | 'created_at'> {
  const { id: _id, created_at: _c, ...resto } = e
  return { ...resto, author_id: autor, name: `${e.name} (Cópia)`, paginas: e.paginas.map((p) => ({ ...p, id: crypto.randomUUID() })) }
}

// Exportar / Importar Dados: o registro em JSON (nome e páginas).
export function exportarDiario(e: Pick<EntradaDiario, 'name' | 'paginas'>): string {
  return JSON.stringify({ tipo: 'arkanis-diario', versao: 1, name: e.name, paginas: e.paginas }, null, 2)
}

export function importarDiario(texto: string): { name: string; paginas: Pagina[] } | null {
  try {
    const d = JSON.parse(texto)
    if (!d || typeof d.name !== 'string' || !Array.isArray(d.paginas)) return null
    const paginas = (d.paginas as Partial<Pagina>[])
      .filter((p) => p && TIPOS_PAGINA.some((t) => t.id === p.tipo))
      .map((p) => ({ ...novaPagina(p.nome ?? '', p.tipo as TipoPagina), ...p, id: crypto.randomUUID() }) as Pagina)
    return { name: d.name, paginas }
  } catch {
    return null
  }
}
