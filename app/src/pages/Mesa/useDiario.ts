import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Pasta } from './cenas'
import { copiaDoDiario, type EntradaDiario } from './diario'

const CAMPOS_PASTA = 'id, campaign_id, parent_id, name, color, sort_mode, sort, created_at'
const CAMPOS = 'id, campaign_id, folder_id, author_id, name, paginas, acesso_padrao, acesso_jogadores, mostrar_mestres, sort, created_at'

function trocar<T extends { id: string }>(lista: T[], item: T): T[] {
  return lista.some((x) => x.id === item.id) ? lista.map((x) => (x.id === item.id ? item : x)) : [...lista, item]
}

const normal = (e: EntradaDiario): EntradaDiario => ({ ...e, paginas: e.paginas ?? [], acesso_jogadores: e.acesso_jogadores ?? {} })

export async function enviarArquivoDoDiario(userId: string, arquivo: File): Promise<string | null> {
  const caminho = `${userId}/${Date.now()}-${arquivo.name.replace(/[^\w.-]/g, '_') || 'arquivo'}`
  const { error } = await supabase.storage.from('diario').upload(caminho, arquivo)
  if (error) return null
  return supabase.storage.from('diario').getPublicUrl(caminho).data.publicUrl
}

// Diário da campanha (KAN-53, spec 12.11), em tempo real. O banco só manda o que a pessoa pode ver.
export function useDiario(campanhaId: string | undefined) {
  const [entradas, setEntradas] = useState<EntradaDiario[]>([])
  const [pastas, setPastas] = useState<Pasta[]>([])

  useEffect(() => {
    if (!campanhaId) return
    let cancelado = false
    supabase.from('journal_entries').select(CAMPOS).eq('campaign_id', campanhaId).then(({ data }) => !cancelado && setEntradas(((data ?? []) as EntradaDiario[]).map(normal)))
    supabase.from('journal_folders').select(CAMPOS_PASTA).eq('campaign_id', campanhaId).then(({ data }) => !cancelado && setPastas((data ?? []) as Pasta[]))
    const filtro = `campaign_id=eq.${campanhaId}`
    const canal = supabase
      .channel(`diario:${campanhaId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'journal_entries', filter: filtro }, (p) => setEntradas((l) => trocar(l, normal(p.new as EntradaDiario))))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'journal_entries', filter: filtro }, (p) => setEntradas((l) => trocar(l, normal(p.new as EntradaDiario))))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'journal_entries' }, (p) => {
        const id = (p.old as { id?: string }).id
        if (id) setEntradas((l) => l.filter((x) => x.id !== id))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'journal_folders', filter: filtro }, (p) => setPastas((l) => trocar(l, p.new as Pasta)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'journal_folders', filter: filtro }, (p) => setPastas((l) => trocar(l, p.new as Pasta)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'journal_folders' }, (p) => {
        const id = (p.old as { id?: string }).id
        if (id) setPastas((l) => l.filter((x) => x.id !== id))
      })
      .subscribe()
    return () => {
      cancelado = true
      supabase.removeChannel(canal)
    }
  }, [campanhaId])

  const criar = useCallback(async (name: string, folderId: string | null) => {
    if (!campanhaId) return null
    const { data } = await supabase.from('journal_entries').insert({ campaign_id: campanhaId, name, folder_id: folderId }).select(CAMPOS).single()
    const nova = data ? normal(data as EntradaDiario) : null
    if (nova) setEntradas((l) => trocar(l, nova))
    return nova
  }, [campanhaId])

  const salvar = useCallback(async (id: string, campos: Partial<EntradaDiario>) => {
    setEntradas((l) => l.map((x) => (x.id === id ? { ...x, ...campos } : x)))
    const { error } = await supabase.from('journal_entries').update(campos).eq('id', id)
    return error?.message ?? null
  }, [])

  const duplicar = useCallback(async (e: EntradaDiario, autor: string) => {
    const { data } = await supabase.from('journal_entries').insert(copiaDoDiario(e, autor)).select(CAMPOS).single()
    if (data) setEntradas((l) => trocar(l, normal(data as EntradaDiario)))
  }, [])

  const excluir = useCallback(async (id: string) => {
    setEntradas((l) => l.filter((x) => x.id !== id))
    await supabase.from('journal_entries').delete().eq('id', id)
  }, [])

  const criarPasta = useCallback(async (campos: Pick<Pasta, 'name' | 'color' | 'sort_mode'> & { parent_id: string | null }) => {
    if (!campanhaId) return
    const { data } = await supabase.from('journal_folders').insert({ ...campos, campaign_id: campanhaId }).select(CAMPOS_PASTA).single()
    if (data) setPastas((l) => trocar(l, data as Pasta))
  }, [campanhaId])

  const salvarPasta = useCallback(async (id: string, campos: Partial<Pasta>) => {
    setPastas((l) => l.map((p) => (p.id === id ? { ...p, ...campos } : p)))
    await supabase.from('journal_folders').update(campos).eq('id', id)
  }, [])

  const excluirPasta = useCallback(async (id: string) => {
    setPastas((l) => l.filter((p) => p.id !== id))
    setEntradas((l) => l.map((x) => (x.folder_id === id ? { ...x, folder_id: null } : x)))
    await supabase.from('journal_folders').delete().eq('id', id)
  }, [])

  return { entradas, pastas, criar, salvar, duplicar, excluir, criarPasta, salvarPasta, excluirPasta }
}
