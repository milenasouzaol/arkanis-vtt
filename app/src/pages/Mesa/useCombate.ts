import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { computeDerivedStats, type Training } from '../../lib/rules'
import { lerTeste, ordemDeIniciativa, rolarTeste, testeDeIniciativa, type Combatente } from './combate'

export type Combate = {
  id: string
  campaign_id: string
  name: string
  ameacas: string[]
  ativo: boolean
  rodada: number
  turno_atual: string | null
  created_at: string
}

export type Vida = { combatant_id: string; pv_atual: number; pv_max: number }

// Barrinhas do jogador (12.4): Vida, Esforço (PE) e Sanidade, atual e máximo.
export type Barras = { pv: [number, number | null]; pe: [number, number | null]; san: [number, number | null] }

type FichaBarras = {
  id: string
  name: string | null
  avatar_url: string | null
  attributes: Record<string, number>
  nex_percent: number
  class_id: string | null
  current_pv: number | null
  current_pe: number | null
  current_sanity: number | null
  max_pv_override: number | null
  max_sanity_override: number | null
}

const CAMPOS_FICHA = 'id, name, avatar_url, attributes, nex_percent, class_id, current_pv, current_pe, current_sanity, max_pv_override, max_sanity_override'

function trocar<T extends { id: string }>(lista: T[], item: T): T[] {
  return lista.some((x) => x.id === item.id) ? lista.map((x) => (x.id === item.id ? item : x)) : [...lista, item]
}

// Combates da campanha, a ordem de iniciativa do que está rodando e as barras de cada um.
export function useCombate(campanhaId: string | undefined, souMestre: boolean) {
  const [combates, setCombates] = useState<Combate[]>([])
  const [combatentes, setCombatentes] = useState<Combatente[]>([])
  const [vidas, setVidas] = useState<Record<string, Vida>>({})
  const [fichas, setFichas] = useState<Record<string, FichaBarras>>({})
  const [classes, setClasses] = useState<Record<string, Parameters<typeof computeDerivedStats>[0]>>({})

  const carregarFichas = useCallback(async () => {
    if (!campanhaId) return
    const { data } = await supabase.from('characters').select(CAMPOS_FICHA).eq('campaign_id', campanhaId).eq('npc', false)
    const lista = (data ?? []) as FichaBarras[]
    setFichas(Object.fromEntries(lista.map((f) => [f.id, f])))
    const ids = [...new Set(lista.map((f) => f.class_id).filter((x): x is string => !!x))]
    if (ids.length) {
      const { data: cls } = await supabase.from('classes').select('*').in('id', ids)
      setClasses(Object.fromEntries((cls ?? []).map((c) => [c.id, c])))
    }
  }, [campanhaId])

  useEffect(() => {
    if (!campanhaId) return
    supabase.from('combats').select('*').eq('campaign_id', campanhaId).order('created_at').then(({ data }) => setCombates((data ?? []) as Combate[]))
    supabase.from('combatants').select('*').eq('campaign_id', campanhaId).then(({ data }) => setCombatentes((data ?? []) as Combatente[]))
    if (souMestre) {
      supabase.from('combatant_vida').select('combatant_id, pv_atual, pv_max').eq('campaign_id', campanhaId)
        .then(({ data }) => setVidas(Object.fromEntries(((data ?? []) as Vida[]).map((v) => [v.combatant_id, v]))))
    }
    carregarFichas()

    const filtro = `campaign_id=eq.${campanhaId}`
    const canal = supabase
      .channel(`combate:${campanhaId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'combats', filter: filtro }, (p) => {
        if (p.eventType === 'DELETE') return
        setCombates((l) => trocar(l, p.new as Combate))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'combats' }, (p) => {
        const id = (p.old as { id?: string }).id
        if (id) setCombates((l) => l.filter((c) => c.id !== id))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'combatants', filter: filtro }, (p) => setCombatentes((l) => trocar(l, p.new as Combatente)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'combatants', filter: filtro }, (p) => setCombatentes((l) => trocar(l, p.new as Combatente)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'combatants' }, (p) => {
        const id = (p.old as { id?: string }).id
        if (id) setCombatentes((l) => l.filter((c) => c.id !== id))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'combatant_vida', filter: filtro }, (p) => {
        if (p.eventType === 'DELETE') return
        const v = p.new as Vida
        setVidas((m) => ({ ...m, [v.combatant_id]: v }))
      })
      // Vida/PE/Sanidade mudaram na ficha de alguém: a barra acompanha.
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'characters', filter: filtro }, (p) => {
        const f = p.new as FichaBarras
        setFichas((m) => (m[f.id] ? { ...m, [f.id]: { ...m[f.id], ...f } } : m))
      })
      .subscribe()
    return () => {
      supabase.removeChannel(canal)
    }
  }, [campanhaId, souMestre, carregarFichas])

  const ativo = combates.find((c) => c.ativo) ?? null
  const ordem = useMemo(() => (ativo ? ordemDeIniciativa(combatentes.filter((c) => c.combat_id === ativo.id)) : []), [ativo, combatentes])

  function barras(c: Combatente): Barras | null {
    if (c.tipo !== 'jogador' || !c.character_id) return null
    const f = fichas[c.character_id]
    if (!f) return null
    const cls = f.class_id ? classes[f.class_id] : undefined
    const max = cls ? computeDerivedStats(cls, f.attributes as Parameters<typeof computeDerivedStats>[1], f.nex_percent) : null
    const maxPv = f.max_pv_override ?? max?.maxPv ?? null
    const maxSan = f.max_sanity_override ?? max?.maxSanity ?? null
    return {
      pv: [f.current_pv ?? maxPv ?? 0, maxPv],
      pe: [f.current_pe ?? max?.maxPe ?? 0, max?.maxPe ?? null],
      san: [f.current_sanity ?? maxSan ?? 0, maxSan],
    }
  }

  const criar = useCallback(async (name: string, ameacas: string[]) => {
    if (!campanhaId) return
    const { data } = await supabase.from('combats').insert({ campaign_id: campanhaId, name, ameacas }).select('*').single()
    if (data) setCombates((l) => trocar(l, data as Combate))
  }, [campanhaId])

  const salvar = useCallback(async (id: string, campos: Partial<Pick<Combate, 'name' | 'ameacas'>>) => {
    const { data } = await supabase.from('combats').update(campos).eq('id', id).select('*').single()
    if (data) setCombates((l) => trocar(l, data as Combate))
  }, [])

  const excluir = useCallback(async (id: string) => {
    setCombates((l) => l.filter((c) => c.id !== id))
    await supabase.from('combats').delete().eq('id', id)
  }, [])

  // Ameaças entrando no combate: iniciativa rolada e a vida cheia (só o mestre vê).
  const entrarAmeacas = useCallback(async (combate: Combate, criaturaIds: string[]) => {
    if (!campanhaId || !criaturaIds.length) return []
    const { data: criaturas } = await supabase.from('creatures').select('id, name, image_url, iniciativa, pv_maximo').in('id', [...new Set(criaturaIds)])
    const porId = new Map((criaturas ?? []).map((c) => [c.id, c]))
    const contagem = new Map<string, number>()
    const linhas = criaturaIds.flatMap((id) => {
      const c = porId.get(id)
      if (!c) return []
      const n = (contagem.get(id) ?? 0) + 1
      contagem.set(id, n)
      const repetida = criaturaIds.filter((x) => x === id).length > 1
      const t = lerTeste(c.iniciativa)
      return [{
        id: crypto.randomUUID(),
        combat_id: combate.id, campaign_id: campanhaId, tipo: 'ameaca', creature_id: id,
        name: repetida ? `${c.name} ${n}` : c.name, image_url: c.image_url, iniciativa: rolarTeste(t).total, desempate: t.bonus,
        pv: c.pv_maximo ?? 0,
      }]
    })
    const { data } = await supabase.from('combatants').insert(linhas.map(({ pv: _pv, ...l }) => l)).select('*')
    const novos = (data ?? []) as Combatente[]
    if (novos.length) {
      // A vida vai pelo id gerado aqui, sem depender da ordem em que o banco devolve as linhas.
      await supabase.from('combatant_vida').insert(linhas.map((l) => ({ combatant_id: l.id, campaign_id: campanhaId, pv_atual: l.pv, pv_max: l.pv })))
      setCombatentes((l) => novos.reduce(trocar, l))
    }
    return novos
  }, [campanhaId])

  // Iniciar (12.4): rola a iniciativa de todos os personagens jogáveis e das ameaças.
  const iniciar = useCallback(async (combate: Combate) => {
    if (!campanhaId) return
    const { data: pericia } = await supabase.from('skills').select('id').eq('name', 'Iniciativa').maybeSingle()
    const { data: jogadores } = await supabase.from('characters').select('id, user_id, name, avatar_url, attributes').eq('campaign_id', campanhaId).eq('npc', false)
    const ids = (jogadores ?? []).map((j) => j.id)
    const { data: treinos } = pericia && ids.length
      ? await supabase.from('character_skills').select('character_id, training, extra_bonus').eq('skill_id', pericia.id).in('character_id', ids)
      : { data: [] }
    const treino = new Map((treinos ?? []).map((t) => [t.character_id, t]))
    const rolagens: Record<string, unknown>[] = []
    const linhas = (jogadores ?? []).map((j) => {
      const t = treino.get(j.id)
      const teste = testeDeIniciativa((j.attributes as Record<string, number>)?.agilidade ?? 1, (t?.training ?? 'nenhum') as Training, t?.extra_bonus ?? 0)
      const r = rolarTeste(teste)
      // O teste de cada jogador vai pro chat e pro Histórico de Rolagens, como se ele tivesse
      // rolado na ficha (no nome dele e no modo de envio dele).
      rolagens.push({
        character_id: j.id, user_id: j.user_id, campaign_id: campanhaId, character_name: j.name || 'Sem nome',
        label: 'Teste de Iniciativa', total: r.total, bonus: r.bonus,
        detail: `d20 mantido: ${r.kept} (rolados: ${r.rolls.join(', ')}) + bônus ${r.bonus}`,
        dice: r.rolls.map((v) => ({ sides: 20, value: v, discarded: v !== r.kept })),
      })
      return {
        combat_id: combate.id, campaign_id: campanhaId, tipo: 'jogador', character_id: j.id,
        name: j.name || 'Sem nome', image_url: j.avatar_url, iniciativa: r.total, desempate: teste.bonus,
      }
    })
    if (rolagens.length) await supabase.from('character_rolls').insert(rolagens)
    await supabase.from('combatants').delete().eq('combat_id', combate.id)
    const { data: novos } = linhas.length ? await supabase.from('combatants').insert(linhas).select('*') : { data: [] }
    const ameacas = await entrarAmeacas(combate, combate.ameacas)
    const todos = ordemDeIniciativa([...((novos ?? []) as Combatente[]), ...ameacas])
    setCombatentes((l) => [...l.filter((c) => c.combat_id !== combate.id), ...todos])
    await supabase.from('combats').update({ ativo: true, rodada: 1, turno_atual: todos[0]?.id ?? null }).eq('id', combate.id)
    setCombates((l) => l.map((c) => (c.id === combate.id ? { ...c, ativo: true, rodada: 1, turno_atual: todos[0]?.id ?? null } : c)))
  }, [campanhaId, entrarAmeacas])

  // Encerrar: o combate volta pra lista, pronto pra iniciar de novo.
  const encerrar = useCallback(async (combate: Combate) => {
    await supabase.from('combats').update({ ativo: false, turno_atual: null, rodada: 1 }).eq('id', combate.id)
    await supabase.from('combatants').delete().eq('combat_id', combate.id)
    setCombatentes((l) => l.filter((c) => c.combat_id !== combate.id))
    setCombates((l) => l.map((c) => (c.id === combate.id ? { ...c, ativo: false, turno_atual: null, rodada: 1 } : c)))
  }, [])

  const passar = useCallback(async (combate: Combate, voltar = false) => {
    const { error } = await supabase.rpc('passar_turno', { p_combat_id: combate.id, p_voltar: voltar })
    return !error
  }, [])

  // Tirar do combate (ameaça com 0 de vida, 12.4). Se era a vez dela, passa antes.
  const remover = useCallback(async (combate: Combate, combatenteId: string) => {
    if (combate.turno_atual === combatenteId) await supabase.rpc('passar_turno', { p_combat_id: combate.id, p_voltar: false })
    setCombatentes((l) => l.filter((c) => c.id !== combatenteId))
    await supabase.from('combatants').delete().eq('id', combatenteId)
  }, [])

  const mudarVida = useCallback(async (combatenteId: string, pv: number) => {
    setVidas((m) => (m[combatenteId] ? { ...m, [combatenteId]: { ...m[combatenteId], pv_atual: pv } } : m))
    await supabase.from('combatant_vida').update({ pv_atual: pv }).eq('combatant_id', combatenteId)
  }, [])

  return { combates, ativo, ordem, vidas, barras, criar, salvar, excluir, iniciar, entrarAmeacas, encerrar, passar, remover, mudarVida }
}
