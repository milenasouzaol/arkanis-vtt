import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Pasta } from './cenas'
import { canalDoSom, ordemDosSons, primeiroSom, proximoSom, segundosTocados, volumeFinal, type Playlist, type SomPlaylist } from './playlists'
import { useTocarSons } from './useSons'
import { useVolumesDoUsuario } from './volumesDoUsuario'

const CAMPOS_PASTA = 'id, campaign_id, parent_id, name, color, sort_mode, sort, created_at'
const CAMPOS_PLAYLIST = 'id, campaign_id, folder_id, name, modo, canal, descricao, sort, created_at'
const CAMPOS_SOM = 'id, playlist_id, campaign_id, name, url, canal, volume, repetir, descricao, sort, tocando, iniciado_em, created_at'

function trocar<T extends { id: string }>(lista: T[], item: T): T[] {
  return lista.some((x) => x.id === item.id) ? lista.map((x) => (x.id === item.id ? item : x)) : [...lista, item]
}

const numeroDoSom = (s: SomPlaylist): SomPlaylist => ({ ...s, volume: Number(s.volume) })

// Lista de Reprodução da campanha (KAN-53, spec 12.12), em tempo real, e o que está tocando.
// Todo mundo toca os sons marcados "tocando", do mesmo ponto; o navegador do mestre é quem
// passa pro próximo quando um acaba.
export function usePlaylists(campanhaId: string | undefined, souMestre: boolean) {
  const [pastas, setPastas] = useState<Pasta[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [sons, setSons] = useState<SomPlaylist[]>([])

  useEffect(() => {
    if (!campanhaId) return
    let cancelado = false
    if (souMestre) supabase.from('playlist_folders').select(CAMPOS_PASTA).eq('campaign_id', campanhaId).then(({ data }) => !cancelado && setPastas((data ?? []) as Pasta[]))
    supabase.from('playlists').select(CAMPOS_PLAYLIST).eq('campaign_id', campanhaId).then(({ data }) => !cancelado && setPlaylists((data ?? []) as Playlist[]))
    supabase.from('playlist_sounds').select(CAMPOS_SOM).eq('campaign_id', campanhaId).then(({ data }) => !cancelado && setSons(((data ?? []) as SomPlaylist[]).map(numeroDoSom)))
    const filtro = `campaign_id=eq.${campanhaId}`
    const tabela = <T extends { id: string }>(nome: string, set: React.Dispatch<React.SetStateAction<T[]>>, ajuste: (x: T) => T = (x) => x) => (c: ReturnType<typeof supabase.channel>) =>
      c
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: nome, filter: filtro }, (p) => set((l) => trocar(l, ajuste(p.new as T))))
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: nome, filter: filtro }, (p) => set((l) => trocar(l, ajuste(p.new as T))))
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: nome }, (p) => {
          const id = (p.old as { id?: string }).id
          if (id) set((l) => l.filter((x) => x.id !== id))
        })
    let canal = supabase.channel(`playlists:${campanhaId}`)
    canal = tabela<Playlist>('playlists', setPlaylists)(canal)
    canal = tabela<SomPlaylist>('playlist_sounds', setSons, numeroDoSom)(canal)
    if (souMestre) canal = tabela<Pasta>('playlist_folders', setPastas)(canal)
    canal.subscribe()
    return () => {
      cancelado = true
      supabase.removeChannel(canal)
    }
  }, [campanhaId, souMestre])

  // ---- editar (mestre)

  const criarPlaylist = useCallback(async (name: string, folderId: string | null) => {
    if (!campanhaId) return null
    const { data } = await supabase.from('playlists').insert({ campaign_id: campanhaId, name, folder_id: folderId }).select(CAMPOS_PLAYLIST).single()
    if (data) setPlaylists((l) => trocar(l, data as Playlist))
    return (data as Playlist | null) ?? null
  }, [campanhaId])

  const salvarPlaylist = useCallback(async (id: string, campos: Partial<Playlist>) => {
    setPlaylists((l) => l.map((p) => (p.id === id ? { ...p, ...campos } : p)))
    await supabase.from('playlists').update(campos).eq('id', id)
  }, [])

  const excluirPlaylist = useCallback(async (id: string) => {
    setPlaylists((l) => l.filter((p) => p.id !== id))
    setSons((l) => l.filter((s) => s.playlist_id !== id))
    await supabase.from('playlists').delete().eq('id', id)
  }, [])

  const salvarSom = useCallback(async (som: Partial<SomPlaylist> & { playlist_id: string }, id?: string) => {
    if (!campanhaId) return 'Sem campanha'
    if (id) {
      setSons((l) => l.map((s) => (s.id === id ? { ...s, ...som } : s)))
      const { error } = await supabase.from('playlist_sounds').update(som).eq('id', id)
      return error?.message ?? null
    }
    const { data, error } = await supabase.from('playlist_sounds').insert({ ...som, campaign_id: campanhaId, sort: Date.now() % 2147483647 }).select(CAMPOS_SOM).single()
    if (data) setSons((l) => trocar(l, numeroDoSom(data as SomPlaylist)))
    return error?.message ?? null
  }, [campanhaId])

  const excluirSom = useCallback(async (id: string) => {
    setSons((l) => l.filter((s) => s.id !== id))
    await supabase.from('playlist_sounds').delete().eq('id', id)
  }, [])

  const criarPasta = useCallback(async (campos: Pick<Pasta, 'name' | 'color' | 'sort_mode'> & { parent_id: string | null }) => {
    if (!campanhaId) return
    const { data } = await supabase.from('playlist_folders').insert({ ...campos, campaign_id: campanhaId }).select(CAMPOS_PASTA).single()
    if (data) setPastas((l) => trocar(l, data as Pasta))
  }, [campanhaId])

  const salvarPasta = useCallback(async (id: string, campos: Partial<Pasta>) => {
    setPastas((l) => l.map((p) => (p.id === id ? { ...p, ...campos } : p)))
    await supabase.from('playlist_folders').update(campos).eq('id', id)
  }, [])

  const excluirPasta = useCallback(async (id: string) => {
    setPastas((l) => l.filter((p) => p.id !== id))
    await supabase.from('playlist_folders').delete().eq('id', id)
  }, [])

  // ---- tocar (mestre manda; todo mundo ouve)

  const marcar = useCallback(async (ids: string[], tocando: boolean) => {
    if (!ids.length) return
    const iniciado_em = tocando ? new Date().toISOString() : null
    setSons((l) => l.map((s) => (ids.includes(s.id) ? { ...s, tocando, iniciado_em } : s)))
    await supabase.from('playlist_sounds').update({ tocando, iniciado_em }).in('id', ids)
  }, [])

  const sonsDa = useCallback((playlistId: string) => ordemDosSons(sons.filter((s) => s.playlist_id === playlistId)), [sons])

  // Dá pra tocar vários sons ao mesmo tempo, inclusive da mesma playlist (árvores + cachoeira).
  const tocarSom = useCallback((som: SomPlaylist) => marcar([som.id], true), [marcar])

  const pararSom = useCallback((som: SomPlaylist) => marcar([som.id], false), [marcar])

  const tocarPlaylist = useCallback(async (p: Playlist) => {
    const lista = sonsDa(p.id)
    const primeiro = primeiroSom(p.modo, lista)
    const som = lista.find((s) => s.id === primeiro)
    if (som) await tocarSom(som)
  }, [sonsDa, tocarSom])

  const pararPlaylist = useCallback((p: Playlist) => marcar(sons.filter((s) => s.playlist_id === p.id && s.tocando).map((s) => s.id), false), [sons, marcar])

  // Um som (sem Repetir) acabou: o mestre passa pro próximo, conforme o modo da playlist.
  const avancando = useRef(new Set<string>())
  const aoAcabar = useCallback(async (somId: string) => {
    if (!souMestre || avancando.current.has(somId)) return
    const som = sons.find((s) => s.id === somId)
    const p = som && playlists.find((x) => x.id === som.playlist_id)
    if (!som || !p) return
    avancando.current.add(somId)
    const proximo = proximoSom(p.modo, sonsDa(p.id), somId)
    // O que acabou para; o próximo da playlist começa (com um som só no Repetir, ele recomeça).
    await marcar([somId], false)
    if (proximo) await marcar([proximo], true)
    avancando.current.delete(somId)
  }, [souMestre, sons, playlists, sonsDa, marcar])

  // Toca o que está marcado, com o volume do som × o controle da pessoa pro canal.
  const meusVolumes = useVolumesDoUsuario()
  const tocando = sons.filter((s) => s.tocando)
  const erros = useTocarSons(
    tocando.map((s) => {
      const p = playlists.find((x) => x.id === s.playlist_id)
      return {
        id: `pl-${s.id}-${s.iniciado_em}`,
        url: s.url,
        volume: volumeFinal(s.volume, meusVolumes[canalDoSom(s, p)]),
        loop: s.repetir,
        inicio: segundosTocados(s.iniciado_em),
      }
    }),
    (id) => aoAcabar(id.slice(3, 39)),
  )

  return {
    pastas, playlists, sons, sonsDa, erros,
    criarPlaylist, salvarPlaylist, excluirPlaylist, salvarSom, excluirSom, criarPasta, salvarPasta, excluirPasta,
    tocarSom, pararSom, tocarPlaylist, pararPlaylist,
  }
}
