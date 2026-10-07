import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export type NotaCalendario = {
  id: string
  campaign_id: string
  author_id: string
  dia: number // dia da campanha (0 = o primeiro)
  titulo: string
  texto: string
  compartilhada: boolean
  created_at: string
}

const CAMPOS = 'id, campaign_id, author_id, dia, titulo, texto, compartilhada, created_at'

function trocar(lista: NotaCalendario[], n: NotaCalendario): NotaCalendario[] {
  return lista.some((x) => x.id === n.id) ? lista.map((x) => (x.id === n.id ? n : x)) : [...lista, n]
}

// Anotações do calendário (pedido da Millie, 07/10), em tempo real. O banco só manda as suas e
// as compartilhadas.
export function useCalendario(campanhaId: string | undefined, userId: string | null | undefined) {
  const [notas, setNotas] = useState<NotaCalendario[]>([])

  useEffect(() => {
    if (!campanhaId) return
    let cancelado = false
    supabase.from('calendario_notas').select(CAMPOS).eq('campaign_id', campanhaId).order('created_at').then(({ data }) => !cancelado && setNotas((data ?? []) as NotaCalendario[]))
    const filtro = `campaign_id=eq.${campanhaId}`
    const canal = supabase
      .channel(`calendario:${campanhaId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calendario_notas', filter: filtro }, (p) => setNotas((l) => trocar(l, p.new as NotaCalendario)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calendario_notas', filter: filtro }, (p) => {
        const n = p.new as NotaCalendario
        // Deixou de ser compartilhada (e não é minha): sai da minha lista.
        setNotas((l) => (n.compartilhada || n.author_id === userId ? trocar(l, n) : l.filter((x) => x.id !== n.id)))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'calendario_notas' }, (p) => {
        const id = (p.old as { id?: string }).id
        if (id) setNotas((l) => l.filter((x) => x.id !== id))
      })
      .subscribe()
    return () => {
      cancelado = true
      supabase.removeChannel(canal)
    }
  }, [campanhaId, userId])

  const criar = useCallback(async (dia: number, titulo: string, texto: string, compartilhada: boolean) => {
    if (!campanhaId || !(titulo.trim() || texto.trim())) return null
    const { data, error } = await supabase.from('calendario_notas').insert({ campaign_id: campanhaId, dia, titulo: titulo.trim() || 'Anotação', texto: texto.trim(), compartilhada }).select(CAMPOS).single()
    if (data) setNotas((l) => trocar(l, data as NotaCalendario))
    return error?.message ?? null
  }, [campanhaId])

  const salvar = useCallback(async (id: string, campos: Partial<Pick<NotaCalendario, 'titulo' | 'texto' | 'compartilhada'>>) => {
    setNotas((l) => l.map((x) => (x.id === id ? { ...x, ...campos } : x)))
    await supabase.from('calendario_notas').update(campos).eq('id', id)
  }, [])

  const excluir = useCallback(async (id: string) => {
    setNotas((l) => l.filter((x) => x.id !== id))
    await supabase.from('calendario_notas').delete().eq('id', id)
  }, [])

  return { notas, criar, salvar, excluir }
}
