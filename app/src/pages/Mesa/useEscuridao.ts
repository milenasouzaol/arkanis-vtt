import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export type AreaEscura = { id: string; scene_id: string; campaign_id: string; x: number; y: number; width: number; height: number; created_at: string }

const CAMPOS = 'id, scene_id, campaign_id, x, y, width, height, created_at'

const normal = (a: AreaEscura): AreaEscura => ({ ...a, x: Number(a.x), y: Number(a.y), width: Number(a.width), height: Number(a.height) })

function trocar(lista: AreaEscura[], a: AreaEscura): AreaEscura[] {
  return lista.some((x) => x.id === a.id) ? lista.map((x) => (x.id === a.id ? a : x)) : [...lista, a]
}

// Áreas de escuridão da cena (pedido da Millie, 05/10), em tempo real.
export function useEscuridao(cenaId: string | null) {
  const [areas, setAreas] = useState<AreaEscura[]>([])

  useEffect(() => {
    setAreas([])
    if (!cenaId) return
    let cancelado = false
    supabase.from('scene_darkness').select(CAMPOS).eq('scene_id', cenaId).then(({ data }) => {
      if (!cancelado) setAreas(((data ?? []) as AreaEscura[]).map(normal))
    })
    const filtro = `scene_id=eq.${cenaId}`
    const canal = supabase
      .channel(`escuridao:${cenaId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scene_darkness', filter: filtro }, (p) => setAreas((l) => trocar(l, normal(p.new as AreaEscura))))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'scene_darkness', filter: filtro }, (p) => setAreas((l) => trocar(l, normal(p.new as AreaEscura))))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'scene_darkness' }, (p) => {
        const id = (p.old as { id?: string }).id
        if (id) setAreas((l) => l.filter((a) => a.id !== id))
      })
      .subscribe()
    return () => {
      cancelado = true
      supabase.removeChannel(canal)
    }
  }, [cenaId])

  const criar = useCallback(async (a: Omit<AreaEscura, 'id' | 'created_at'>) => {
    const { data } = await supabase.from('scene_darkness').insert(a).select(CAMPOS).single()
    if (data) setAreas((l) => trocar(l, normal(data as AreaEscura)))
  }, [])

  const alterar = useCallback(async (id: string, campos: Partial<AreaEscura>, salvar = true) => {
    setAreas((l) => l.map((a) => (a.id === id ? { ...a, ...campos } : a)))
    if (salvar) await supabase.from('scene_darkness').update(campos).eq('id', id)
  }, [])

  const excluir = useCallback(async (ids: string[]) => {
    if (!ids.length) return
    setAreas((l) => l.filter((a) => !ids.includes(a.id)))
    await supabase.from('scene_darkness').delete().in('id', ids)
  }, [])

  return { areas, criar, alterar, excluir }
}
