import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { ObjetoCena } from './cenas'

const CAMPOS = 'id, scene_id, campaign_id, name, image_url, x, y, width, height, rotation, layer, sort, locked, flip_h, flip_v, character_id, created_at'

function trocar(lista: ObjetoCena[], o: ObjetoCena): ObjetoCena[] {
  return lista.some((x) => x.id === o.id) ? lista.map((x) => (x.id === o.id ? o : x)) : [...lista, o]
}

// Objetos (imagens e, depois, tokens) da cena que esta pessoa está vendo, em tempo real.
export function useObjetos(cenaId: string | null) {
  const [objetos, setObjetos] = useState<ObjetoCena[]>([])

  useEffect(() => {
    setObjetos([])
    if (!cenaId) return
    let cancelado = false
    supabase
      .from('scene_tokens')
      .select(CAMPOS)
      .eq('scene_id', cenaId)
      .then(({ data }) => {
        if (!cancelado) setObjetos((data ?? []) as ObjetoCena[])
      })

    const filtro = `scene_id=eq.${cenaId}`
    const canal = supabase
      .channel(`objetos:${cenaId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scene_tokens', filter: filtro }, (p) => setObjetos((l) => trocar(l, p.new as ObjetoCena)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'scene_tokens', filter: filtro }, (p) => setObjetos((l) => trocar(l, p.new as ObjetoCena)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'scene_tokens' }, (p) => {
        const id = (p.old as { id?: string }).id
        if (id) setObjetos((l) => l.filter((o) => o.id !== id))
      })
      .subscribe()

    return () => {
      cancelado = true
      supabase.removeChannel(canal)
    }
  }, [cenaId])

  const criar = useCallback(async (dados: Omit<ObjetoCena, 'id' | 'created_at' | 'sort' | 'locked' | 'flip_h' | 'flip_v' | 'rotation' | 'character_id'>) => {
    const { data } = await supabase.from('scene_tokens').insert({ ...dados, sort: Date.now() % 2147483647 }).select(CAMPOS).single()
    if (data) setObjetos((l) => trocar(l, data as ObjetoCena))
  }, [])

  // Atualiza na tela na hora (arrastar fica liso) e salva no banco.
  const alterar = useCallback(async (id: string, campos: Partial<Pick<ObjetoCena, 'x' | 'y' | 'width' | 'height' | 'rotation' | 'layer' | 'locked'>>, salvar = true) => {
    setObjetos((l) => l.map((o) => (o.id === id ? { ...o, ...campos } : o)))
    if (salvar) await supabase.from('scene_tokens').update(campos).eq('id', id)
  }, [])

  const excluir = useCallback(async (id: string) => {
    setObjetos((l) => l.filter((o) => o.id !== id))
    await supabase.from('scene_tokens').delete().eq('id', id)
  }, [])

  return { objetos, criar, alterar, excluir }
}
