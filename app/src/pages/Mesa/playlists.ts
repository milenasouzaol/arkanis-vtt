// Lista de Reprodução (KAN-53, spec 12.12): regras puras, testadas.

export type Canal = 'musica' | 'ambiente' | 'efeitos'
export type ModoPlayback = 'sequencial' | 'embaralhar' | 'repetir'

export type Playlist = {
  id: string
  campaign_id: string
  folder_id: string | null
  name: string
  modo: ModoPlayback
  canal: Canal
  descricao: string | null
  sort: number
  created_at: string
}

export type SomPlaylist = {
  id: string
  playlist_id: string
  campaign_id: string
  name: string
  url: string
  canal: Canal | null // vazio = o canal da playlist
  volume: number
  repetir: boolean
  descricao: string | null
  sort: number
  tocando: boolean
  iniciado_em: string | null
  created_at: string
}

export const CANAIS: { id: Canal; rotulo: string }[] = [
  { id: 'musica', rotulo: 'Música' },
  { id: 'ambiente', rotulo: 'Ambiente' },
  { id: 'efeitos', rotulo: 'Efeitos Sonoros' },
]

export const MODOS: { id: ModoPlayback; rotulo: string }[] = [
  { id: 'sequencial', rotulo: 'Reprodução Sequencial' },
  { id: 'embaralhar', rotulo: 'Embaralhar' },
  { id: 'repetir', rotulo: 'Tocar Repetitivamente' },
]

// Clicar no ícone do modo passa pro próximo (como no Foundry).
export function proximoModo(m: ModoPlayback): ModoPlayback {
  const i = MODOS.findIndex((x) => x.id === m)
  return MODOS[(i + 1) % MODOS.length].id
}

export function ordemDosSons<T extends Pick<SomPlaylist, 'sort' | 'created_at' | 'name'>>(sons: T[]): T[] {
  return [...sons].sort((a, b) => a.sort - b.sort || a.created_at.localeCompare(b.created_at) || a.name.localeCompare(b.name, 'pt-BR'))
}

export function canalDoSom(s: Pick<SomPlaylist, 'canal'>, p: Pick<Playlist, 'canal'> | undefined): Canal {
  return s.canal ?? p?.canal ?? 'musica'
}

// Qual som toca quando o atual acaba (null = a playlist para).
//   sequencial: o próximo da lista; no fim, para.
//   repetir: o próximo; no fim, volta pro primeiro.
//   embaralhar: um outro qualquer, sem parar.
export function proximoSom(modo: ModoPlayback, sons: Pick<SomPlaylist, 'id'>[], atualId: string | null, sorteio: () => number = Math.random): string | null {
  if (!sons.length) return null
  if (modo === 'embaralhar') {
    const outros = sons.filter((s) => s.id !== atualId)
    const lista = outros.length ? outros : sons
    return lista[Math.floor(sorteio() * lista.length) % lista.length].id
  }
  const i = atualId ? sons.findIndex((s) => s.id === atualId) : -1
  if (i + 1 < sons.length) return sons[i + 1].id
  return modo === 'repetir' ? sons[0].id : null
}

// O primeiro som ao clicar em Tocar Playlist.
export function primeiroSom(modo: ModoPlayback, sons: Pick<SomPlaylist, 'id'>[], sorteio: () => number = Math.random): string | null {
  return proximoSom(modo, sons, null, sorteio)
}

// Volume que toca: o do som × o controle da pessoa pro canal dele. O controle passa por uma
// curva de audição (metade do slider soa como metade do volume).
export function volumeFinal(volumeDoSom: number, controleDoCanal: number): number {
  return Math.round(volumeDoSom * controleDoCanal ** 2 * 1000) / 1000
}

// Em que segundo o som está (quem entra na mesa no meio da música ouve do mesmo ponto).
export function segundosTocados(iniciadoEm: string | null, agora: number = Date.now()): number {
  if (!iniciadoEm) return 0
  return Math.max(0, (agora - new Date(iniciadoEm).getTime()) / 1000)
}
