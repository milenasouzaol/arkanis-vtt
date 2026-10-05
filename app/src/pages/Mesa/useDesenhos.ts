import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { estiloCompleto, type Desenho } from './desenhos'

const CAMPOS = 'id, scene_id, campaign_id, author_id, tipo, x, y, width, height, rotation, pontos, texto, estilo, sort, created_at'

function normal(d: Desenho): Desenho {
  // numeric vem como string do Postgres
  return { ...d, x: Number(d.x), y: Number(d.y), width: Number(d.width), height: Number(d.height), rotation: Number(d.rotation), sort: Number(d.sort), estilo: estiloCompleto(d.estilo) }
}

function trocar(lista: Desenho[], d: Desenho): Desenho[] {
  return lista.some((x) => x.id === d.id) ? lista.map((x) => (x.id === d.id ? d : x)) : [...lista, d]
}

// Desenhos da cena que a pessoa está vendo (KAN-52), em tempo real.
export function useDesenhos(cenaId: string | null) {
  const [desenhos, setDesenhos] = useState<Desenho[]>([])

  useEffect(() => {
    setDesenhos([])
    if (!cenaId) return
    let cancelado = false
    supabase.from('scene_drawings').select(CAMPOS).eq('scene_id', cenaId).then(({ data }) => {
      if (!cancelado) setDesenhos(((data ?? []) as Desenho[]).map(normal))
    })
    const filtro = `scene_id=eq.${cenaId}`
    const canal = supabase
      .channel(`desenhos:${cenaId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scene_drawings', filter: filtro }, (p) => setDesenhos((l) => trocar(l, normal(p.new as Desenho))))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'scene_drawings', filter: filtro }, (p) => setDesenhos((l) => trocar(l, normal(p.new as Desenho))))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'scene_drawings' }, (p) => {
        const id = (p.old as { id?: string }).id
        if (id) setDesenhos((l) => l.filter((d) => d.id !== id))
      })
      .subscribe()
    return () => {
      cancelado = true
      supabase.removeChannel(canal)
    }
  }, [cenaId])

  const criar = useCallback(async (d: Omit<Desenho, 'id' | 'created_at' | 'sort'>) => {
    const { data } = await supabase.from('scene_drawings').insert({ ...d, sort: Date.now() }).select(CAMPOS).single()
    if (data) setDesenhos((l) => trocar(l, normal(data as Desenho)))
    return data ? normal(data as Desenho) : null
  }, [])

  const alterar = useCallback(async (id: string, campos: Partial<Desenho>, salvar = true) => {
    setDesenhos((l) => l.map((d) => (d.id === id ? { ...d, ...campos } : d)))
    if (salvar) await supabase.from('scene_drawings').update(campos).eq('id', id)
  }, [])

  const excluir = useCallback(async (ids: string[]) => {
    if (!ids.length) return
    setDesenhos((l) => l.filter((d) => !ids.includes(d.id)))
    await supabase.from('scene_drawings').delete().in('id', ids)
  }, [])

  return { desenhos, criar, alterar, excluir }
}
