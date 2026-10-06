import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Pasta } from './cenas'
import type { CategoriaPosicionavel, Posicionavel } from './posicionaveis'
import { tocarSom } from '../../lib/sons'

const CAMPOS_PASTA = 'id, campaign_id, categoria, parent_id, name, color, sort_mode, sort, created_at'
const CAMPOS = 'id, campaign_id, categoria, folder_id, name, url, dados, sort, created_at'

export type PastaPosicionavel = Pasta & { categoria: CategoriaPosicionavel }

function trocar<T extends { id: string }>(lista: T[], item: T): T[] {
  return lista.some((x) => x.id === item.id) ? lista.map((x) => (x.id === item.id ? item : x)) : [...lista, item]
}

export async function enviarArquivoPosicionavel(userId: string, arquivo: File): Promise<string | null> {
  const caminho = `${userId}/${Date.now()}-${arquivo.name.replace(/[^\w.-]/g, '_') || 'arquivo'}`
  const { error } = await supabase.storage.from('posicionaveis').upload(caminho, arquivo, { contentType: arquivo.type || undefined })
  if (error) return null
  return supabase.storage.from('posicionaveis').getPublicUrl(caminho).data.publicUrl
}

// Armazém de Posicionáveis da campanha (KAN-53, spec 12.6), em tempo real. Só o mestre carrega.
export function usePosicionaveis(campanhaId: string | undefined, souMestre: boolean) {
  const [itens, setItens] = useState<Posicionavel[]>([])
  const [pastas, setPastas] = useState<PastaPosicionavel[]>([])

  useEffect(() => {
    if (!campanhaId || !souMestre) return
    let cancelado = false
    supabase.from('posicionaveis').select(CAMPOS).eq('campaign_id', campanhaId).then(({ data }) => !cancelado && setItens((data ?? []) as Posicionavel[]))
    supabase.from('posicionavel_folders').select(CAMPOS_PASTA).eq('campaign_id', campanhaId).then(({ data }) => !cancelado && setPastas((data ?? []) as PastaPosicionavel[]))
    const filtro = `campaign_id=eq.${campanhaId}`
    const tabela = <T extends { id: string }>(nome: string, set: React.Dispatch<React.SetStateAction<T[]>>) => (c: ReturnType<typeof supabase.channel>) =>
      c
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: nome, filter: filtro }, (p) => set((l) => trocar(l, p.new as T)))
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: nome, filter: filtro }, (p) => set((l) => trocar(l, p.new as T)))
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: nome }, (p) => {
          const id = (p.old as { id?: string }).id
          if (id) set((l) => l.filter((x) => x.id !== id))
        })
    let canal = supabase.channel(`posicionaveis:${campanhaId}`)
    canal = tabela<Posicionavel>('posicionaveis', setItens)(canal)
    canal = tabela<PastaPosicionavel>('posicionavel_folders', setPastas)(canal)
    canal.subscribe()
    return () => {
      cancelado = true
      supabase.removeChannel(canal)
    }
  }, [campanhaId, souMestre])

  const criar = useCallback(async (item: Pick<Posicionavel, 'categoria' | 'name' | 'url' | 'dados'> & { folder_id?: string | null }) => {
    if (!campanhaId) return null
    const { data } = await supabase.from('posicionaveis').insert({ ...item, campaign_id: campanhaId }).select(CAMPOS).single()
    if (data) setItens((l) => trocar(l, data as Posicionavel))
    return (data as Posicionavel | null) ?? null
  }, [campanhaId])

  const salvar = useCallback(async (id: string, campos: Partial<Posicionavel>) => {
    setItens((l) => l.map((x) => (x.id === id ? { ...x, ...campos } : x)))
    await supabase.from('posicionaveis').update(campos).eq('id', id)
  }, [])

  const excluir = useCallback(async (id: string) => {
    tocarSom('deletar')
    setItens((l) => l.filter((x) => x.id !== id))
    await supabase.from('posicionaveis').delete().eq('id', id)
  }, [])

  const criarPasta = useCallback(async (campos: Pick<Pasta, 'name' | 'color' | 'sort_mode'> & { parent_id: string | null; categoria: CategoriaPosicionavel }) => {
    if (!campanhaId) return
    const { data } = await supabase.from('posicionavel_folders').insert({ ...campos, campaign_id: campanhaId }).select(CAMPOS_PASTA).single()
    if (data) setPastas((l) => trocar(l, data as PastaPosicionavel))
  }, [campanhaId])

  const salvarPasta = useCallback(async (id: string, campos: Partial<Pasta>) => {
    setPastas((l) => l.map((p) => (p.id === id ? { ...p, ...campos } : p)))
    await supabase.from('posicionavel_folders').update(campos).eq('id', id)
  }, [])

  const excluirPasta = useCallback(async (id: string) => {
    setPastas((l) => l.filter((p) => p.id !== id))
    setItens((l) => l.map((x) => (x.folder_id === id ? { ...x, folder_id: null } : x)))
    await supabase.from('posicionavel_folders').delete().eq('id', id)
  }, [])

  return { itens, pastas, criar, salvar, excluir, criarPasta, salvarPasta, excluirPasta }
}
