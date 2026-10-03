import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { copiaDaCena, type Cena, type CamposCena, type Pasta } from './cenas'

const CAMPOS_CENA =
  'id, campaign_id, folder_id, name, sort, show_in_nav, visibility, visible_to, background_url, background_color, grid_type, grid_size, grid_distance, grid_units, grid_style, grid_thickness, grid_color, grid_opacity, darkness, weather, luminosity, saturation, shadows, created_at'
const CAMPOS_PASTA = 'id, campaign_id, parent_id, name, color, sort_mode, sort, created_at'

function trocar<T extends { id: string }>(lista: T[], item: T): T[] {
  return lista.some((x) => x.id === item.id) ? lista.map((x) => (x.id === item.id ? item : x)) : [...lista, item]
}

// Cenas e pastas da campanha, a cena ativa e o que cada pessoa está olhando.
// O banco (RLS) já filtra o que o jogador pode ver.
export function useCenas(campanhaId: string | undefined, ativaInicial: string | null) {
  const [cenas, setCenas] = useState<Cena[]>([])
  const [pastas, setPastas] = useState<Pasta[]>([])
  const [ativa, setAtiva] = useState<string | null>(ativaInicial)
  // Cena que esta pessoa abriu pela navegação; null = segue a cena ativa do mestre.
  const [vendo, setVendo] = useState<string | null>(null)

  const recarregarCenas = useCallback(async () => {
    if (!campanhaId) return
    const { data } = await supabase.from('scenes').select(CAMPOS_CENA).eq('campaign_id', campanhaId)
    setCenas((data ?? []) as Cena[])
  }, [campanhaId])

  useEffect(() => {
    if (!campanhaId) return
    recarregarCenas()
    // A cena ativa vem do banco ao entrar na mesa: fica a mesma até o mestre ativar outra.
    supabase.from('campaigns').select('active_scene_id').eq('id', campanhaId).maybeSingle().then(({ data }) => {
      if (data) setAtiva(data.active_scene_id)
    })
    supabase.from('scene_folders').select(CAMPOS_PASTA).eq('campaign_id', campanhaId).then(({ data }) => setPastas((data ?? []) as Pasta[]))

    const filtro = `campaign_id=eq.${campanhaId}`
    const canal = supabase
      .channel(`cenas:${campanhaId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scenes', filter: filtro }, (p) => setCenas((l) => trocar(l, p.new as Cena)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'scenes', filter: filtro }, (p) => setCenas((l) => trocar(l, p.new as Cena)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'scenes' }, (p) => {
        const id = (p.old as { id?: string }).id
        if (id) setCenas((l) => l.filter((c) => c.id !== id))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scene_folders', filter: filtro }, (p) => setPastas((l) => trocar(l, p.new as Pasta)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'scene_folders', filter: filtro }, (p) => setPastas((l) => trocar(l, p.new as Pasta)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'scene_folders' }, (p) => {
        const id = (p.old as { id?: string }).id
        if (id) setPastas((l) => l.filter((x) => x.id !== id))
      })
      // Mestre trocou a cena ativa (ou "Trazer todos pra cá"): todo mundo pula pra ela.
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'campaigns', filter: `id=eq.${campanhaId}` }, (p) => {
        setAtiva((p.new as { active_scene_id: string | null }).active_scene_id)
        setVendo(null)
        // A cena ativa pode ter acabado de ficar visível pro jogador.
        recarregarCenas()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [campanhaId, recarregarCenas])

  const ativar = useCallback(
    async (id: string | null) => {
      if (!campanhaId) return
      setAtiva(id)
      setVendo(null)
      await supabase.from('campaigns').update({ active_scene_id: id }).eq('id', campanhaId)
    },
    [campanhaId],
  )

  const criarCena = useCallback(
    async (campos: Partial<CamposCena> & { name: string }) => {
      if (!campanhaId) return null
      const { data } = await supabase.from('scenes').insert({ ...campos, campaign_id: campanhaId }).select(CAMPOS_CENA).single()
      if (data) setCenas((l) => trocar(l, data as Cena))
      return (data as Cena | null) ?? null
    },
    [campanhaId],
  )

  const salvarCena = useCallback(async (id: string, campos: Partial<CamposCena>) => {
    const { data, error } = await supabase.from('scenes').update(campos).eq('id', id).select(CAMPOS_CENA).single()
    if (data) setCenas((l) => trocar(l, data as Cena))
    return !error
  }, [])

  const excluirCena = useCallback(async (id: string) => {
    const { error } = await supabase.from('scenes').delete().eq('id', id)
    if (!error) setCenas((l) => l.filter((c) => c.id !== id))
  }, [])

  const duplicarCena = useCallback(
    async (c: Cena) => {
      const { data } = await supabase.from('scenes').insert(copiaDaCena(c)).select(CAMPOS_CENA).single()
      if (data) setCenas((l) => trocar(l, data as Cena))
    },
    [],
  )

  const criarPasta = useCallback(
    async (campos: Pick<Pasta, 'name' | 'color' | 'sort_mode' | 'parent_id'>) => {
      if (!campanhaId) return
      const { data } = await supabase.from('scene_folders').insert({ ...campos, campaign_id: campanhaId }).select(CAMPOS_PASTA).single()
      if (data) setPastas((l) => trocar(l, data as Pasta))
    },
    [campanhaId],
  )

  const salvarPasta = useCallback(async (id: string, campos: Pick<Pasta, 'name' | 'color' | 'sort_mode'>) => {
    const { data } = await supabase.from('scene_folders').update(campos).eq('id', id).select(CAMPOS_PASTA).single()
    if (data) setPastas((l) => trocar(l, data as Pasta))
  }, [])

  // "Remover Pasta" deixa as cenas soltas; "Excluir Todas" apaga também as cenas de dentro
  // (e das subpastas, que o banco apaga junto com a pasta).
  const excluirPasta = useCallback(async (id: string, comCenas = false) => {
    if (comCenas) {
      const ids = new Set([id])
      let cresceu = true
      while (cresceu) {
        cresceu = false
        for (const p of pastas) if (p.parent_id && ids.has(p.parent_id) && !ids.has(p.id)) { ids.add(p.id); cresceu = true }
      }
      const { error: erroCenas } = await supabase.from('scenes').delete().in('folder_id', [...ids])
      if (!erroCenas) setCenas((l) => l.filter((c) => !c.folder_id || !ids.has(c.folder_id)))
    }
    const { error } = await supabase.from('scene_folders').delete().eq('id', id)
    if (!error) {
      setPastas((l) => l.filter((x) => x.id !== id && x.parent_id !== id))
      setCenas((l) => l.map((c) => (c.folder_id === id ? { ...c, folder_id: null } : c)))
    }
  }, [pastas])

  const atual = cenas.find((c) => c.id === (vendo ?? ativa)) ?? null

  return { cenas, pastas, ativa, vendo, setVendo, atual, ativar, criarCena, salvarCena, excluirCena, duplicarCena, criarPasta, salvarPasta, excluirPasta }
}

// Imagem de fundo de uma cena: vai pro bucket e volta como URL pública.
export async function enviarImagemDaCena(userId: string, arquivo: File): Promise<string | null> {
  const caminho = `${userId}/${Date.now()}-${arquivo.name.replace(/[^\w.-]/g, '_') || 'cena.png'}`
  const { error } = await supabase.storage.from('scene_images').upload(caminho, arquivo)
  if (error) return null
  return supabase.storage.from('scene_images').getPublicUrl(caminho).data.publicUrl
}
