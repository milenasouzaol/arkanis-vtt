import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { SomAmbiente } from './sons'

const CAMPOS = 'id, scene_id, campaign_id, name, url, x, y, width, height, volume, suavizar, escondido, ligado, created_at'

function normal(s: SomAmbiente): SomAmbiente {
  return { ...s, x: Number(s.x), y: Number(s.y), width: Number(s.width), height: Number(s.height), volume: Number(s.volume) }
}

function trocar(lista: SomAmbiente[], s: SomAmbiente): SomAmbiente[] {
  return lista.some((x) => x.id === s.id) ? lista.map((x) => (x.id === s.id ? s : x)) : [...lista, s]
}

// Sons Ambiente da cena que a pessoa está vendo (KAN-52), em tempo real.
export function useSons(cenaId: string | null) {
  const [sons, setSons] = useState<SomAmbiente[]>([])

  useEffect(() => {
    setSons([])
    if (!cenaId) return
    let cancelado = false
    supabase.from('scene_sounds').select(CAMPOS).eq('scene_id', cenaId).then(({ data }) => {
      if (!cancelado) setSons(((data ?? []) as SomAmbiente[]).map(normal))
    })
    const filtro = `scene_id=eq.${cenaId}`
    const canal = supabase
      .channel(`sons:${cenaId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scene_sounds', filter: filtro }, (p) => setSons((l) => trocar(l, normal(p.new as SomAmbiente))))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'scene_sounds', filter: filtro }, (p) => setSons((l) => trocar(l, normal(p.new as SomAmbiente))))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'scene_sounds' }, (p) => {
        const id = (p.old as { id?: string }).id
        if (id) setSons((l) => l.filter((s) => s.id !== id))
      })
      .subscribe()
    return () => {
      cancelado = true
      supabase.removeChannel(canal)
    }
  }, [cenaId])

  const criar = useCallback(async (s: Omit<SomAmbiente, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('scene_sounds').insert(s).select(CAMPOS).single()
    if (data) setSons((l) => trocar(l, normal(data as SomAmbiente)))
    return error ? error.message : null
  }, [])

  const alterar = useCallback(async (id: string, campos: Partial<SomAmbiente>, salvar = true) => {
    setSons((l) => l.map((s) => (s.id === id ? { ...s, ...campos } : s)))
    if (salvar) await supabase.from('scene_sounds').update(campos).eq('id', id)
  }, [])

  const excluir = useCallback(async (ids: string[]) => {
    if (!ids.length) return
    setSons((l) => l.filter((s) => !ids.includes(s.id)))
    await supabase.from('scene_sounds').delete().in('id', ids)
  }, [])

  return { sons, criar, alterar, excluir }
}

// Arquivo de áudio do mestre vai pro bucket e volta como endereço público.
export async function enviarSom(userId: string, arquivo: File): Promise<string | null> {
  const caminho = `${userId}/${Date.now()}-${arquivo.name.replace(/[^\w.-]/g, '_') || 'som.mp3'}`
  const { error } = await supabase.storage.from('sons_ambiente').upload(caminho, arquivo)
  if (error) return null
  return supabase.storage.from('sons_ambiente').getPublicUrl(caminho).data.publicUrl
}

// Toca os sons: um <audio> em loop por som, com o volume de cada um (0 = pausado).
// O navegador só deixa tocar depois que a pessoa clicou em algo na página (a mesa já tem cliques).
export function useTocarSons(volumes: { id: string; url: string; volume: number }[]) {
  const audios = useRef(new Map<string, HTMLAudioElement>())
  const chave = JSON.stringify(volumes)

  useEffect(() => {
    const lista = JSON.parse(chave) as typeof volumes
    const vivos = new Set(lista.map((v) => v.id))
    for (const [id, a] of audios.current) {
      if (!vivos.has(id)) {
        a.pause()
        audios.current.delete(id)
      }
    }
    for (const v of lista) {
      let a = audios.current.get(v.id)
      if (!a || a.src !== v.url) {
        a?.pause()
        a = new Audio(v.url)
        a.loop = true
        audios.current.set(v.id, a)
      }
      a.volume = Math.min(1, Math.max(0, v.volume))
      if (v.volume > 0) {
        if (a.paused) a.play().catch(() => {})
      } else if (!a.paused) a.pause()
    }
  }, [chave])

  // Saiu da mesa / trocou de cena: para tudo.
  useEffect(() => {
    const mapa = audios.current
    return () => {
      for (const a of mapa.values()) a.pause()
      mapa.clear()
    }
  }, [])
}
