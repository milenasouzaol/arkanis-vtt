import { recortarImagem } from '../../components/RecortarImagem'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Pasta } from './cenas'
import { atividadeCompleta, copiaDoItem, type Atividade, type CategoriaItem, type ItemMesa } from './itens'

const CAMPOS_PASTA = 'id, campaign_id, parent_id, name, color, sort_mode, sort, created_at'
const CAMPOS = 'id, campaign_id, folder_id, name, categoria, image_url, raridade, quantidade, carga, descricao, detalhes, atividades, efeitos, conteudo, compendio_id, acesso_padrao, acesso_jogadores, mostrar_mestres, sort, created_at'

function trocar<T extends { id: string }>(lista: T[], item: T): T[] {
  return lista.some((x) => x.id === item.id) ? lista.map((x) => (x.id === item.id ? item : x)) : [...lista, item]
}

// numeric vem como string; atividades antigas ganham os campos novos.
function normal(i: ItemMesa): ItemMesa {
  return {
    ...i,
    carga: Number(i.carga),
    detalhes: i.detalhes ?? {},
    efeitos: i.efeitos ?? {},
    conteudo: i.conteudo ?? [],
    acesso_jogadores: i.acesso_jogadores ?? {},
    atividades: ((i.atividades ?? []) as Atividade[]).map(atividadeCompleta),
  }
}

export async function enviarImagemDoItem(userId: string, escolhido: File): Promise<string | null> {
  // Recorte (08/10): a pessoa enquadra a parte que quer ou usa a imagem inteira.
  const arquivo = await recortarImagem(escolhido, { proporcao: 'quadrado', titulo: 'Imagem do item' })
  if (!arquivo) return null
  const caminho = `${userId}/${Date.now()}-${arquivo.name.replace(/[^\w.-]/g, '_') || 'item.png'}`
  const { error } = await supabase.storage.from('item_images').upload(caminho, arquivo)
  if (error) return null
  return supabase.storage.from('item_images').getPublicUrl(caminho).data.publicUrl
}

// Itens da campanha (KAN-53, spec 12.10), em tempo real. O banco só manda o que a pessoa pode ver.
export function useItens(campanhaId: string | undefined) {
  const [itens, setItens] = useState<ItemMesa[]>([])
  const [pastas, setPastas] = useState<Pasta[]>([])

  useEffect(() => {
    if (!campanhaId) return
    let cancelado = false
    supabase.from('campaign_items').select(CAMPOS).eq('campaign_id', campanhaId).then(({ data }) => !cancelado && setItens(((data ?? []) as ItemMesa[]).map(normal)))
    supabase.from('item_folders').select(CAMPOS_PASTA).eq('campaign_id', campanhaId).then(({ data }) => !cancelado && setPastas((data ?? []) as Pasta[]))
    const filtro = `campaign_id=eq.${campanhaId}`
    const canal = supabase
      .channel(`itens:${campanhaId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'campaign_items', filter: filtro }, (p) => setItens((l) => trocar(l, normal(p.new as ItemMesa))))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'campaign_items', filter: filtro }, (p) => setItens((l) => trocar(l, normal(p.new as ItemMesa))))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'campaign_items' }, (p) => {
        const id = (p.old as { id?: string }).id
        if (id) setItens((l) => l.filter((x) => x.id !== id))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'item_folders', filter: filtro }, (p) => setPastas((l) => trocar(l, p.new as Pasta)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'item_folders', filter: filtro }, (p) => setPastas((l) => trocar(l, p.new as Pasta)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'item_folders' }, (p) => {
        const id = (p.old as { id?: string }).id
        if (id) setPastas((l) => l.filter((x) => x.id !== id))
      })
      .subscribe()
    return () => {
      cancelado = true
      supabase.removeChannel(canal)
    }
  }, [campanhaId])

  // extra: campos já preenchidos (ex.: item do compêndio).
  const criar = useCallback(async (name: string, categoria: CategoriaItem, folderId: string | null, extra: Partial<ItemMesa> = {}) => {
    if (!campanhaId) return null
    const { data } = await supabase.from('campaign_items').insert({ campaign_id: campanhaId, name, categoria, folder_id: folderId, ...extra }).select(CAMPOS).single()
    const novo = data ? normal(data as ItemMesa) : null
    if (novo) setItens((l) => trocar(l, novo))
    return novo
  }, [campanhaId])

  const salvar = useCallback(async (id: string, campos: Partial<ItemMesa>) => {
    setItens((l) => l.map((x) => (x.id === id ? { ...x, ...campos } : x)))
    const { error } = await supabase.from('campaign_items').update(campos).eq('id', id)
    return error?.message ?? null
  }, [])

  const duplicar = useCallback(async (i: ItemMesa) => {
    const { data } = await supabase.from('campaign_items').insert(copiaDoItem(i)).select(CAMPOS).single()
    if (data) setItens((l) => trocar(l, normal(data as ItemMesa)))
  }, [])

  const excluir = useCallback(async (id: string) => {
    setItens((l) => l.filter((x) => x.id !== id))
    await supabase.from('campaign_items').delete().eq('id', id)
  }, [])

  const criarPasta = useCallback(async (campos: Pick<Pasta, 'name' | 'color' | 'sort_mode'> & { parent_id: string | null }) => {
    if (!campanhaId) return
    const { data } = await supabase.from('item_folders').insert({ ...campos, campaign_id: campanhaId }).select(CAMPOS_PASTA).single()
    if (data) setPastas((l) => trocar(l, data as Pasta))
  }, [campanhaId])

  const salvarPasta = useCallback(async (id: string, campos: Partial<Pasta>) => {
    setPastas((l) => l.map((p) => (p.id === id ? { ...p, ...campos } : p)))
    await supabase.from('item_folders').update(campos).eq('id', id)
  }, [])

  const excluirPasta = useCallback(async (id: string) => {
    setPastas((l) => l.filter((p) => p.id !== id))
    setItens((l) => l.map((x) => (x.folder_id === id ? { ...x, folder_id: null } : x)))
    await supabase.from('item_folders').delete().eq('id', id)
  }, [])

  return { itens, pastas, criar, salvar, duplicar, excluir, criarPasta, salvarPasta, excluirPasta }
}
