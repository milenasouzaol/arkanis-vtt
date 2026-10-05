import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { SomAmbiente } from './sons'
import { criarTocadorYoutube, idDoYoutube, rampaDeVolume, type OpcoesDoTocador } from './youtube'

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

// Toca os sons: um <audio> em loop por som (ou um player escondido do YouTube), com o volume de
// cada um (0 = pausado). O navegador só deixa tocar depois que a pessoa clicou em algo na página.
// Devolve os sons que não puderam tocar e o porquê (vídeo do YouTube bloqueado, por exemplo).
type Tocador = { url: string; definirVolume(v: number): void; parar(): void }

function tocadorDeAudio(url: string, opcoes: OpcoesDoTocador = {}): Tocador {
  const a = new Audio(url)
  a.loop = opcoes.loop ?? true
  a.volume = 0
  // Entrou no meio: começa do mesmo ponto que os outros (no loop, dá a volta).
  if (opcoes.inicio) {
    a.addEventListener('loadedmetadata', () => {
      const d = a.duration
      a.currentTime = a.loop && Number.isFinite(d) && d > 0 ? opcoes.inicio! % d : opcoes.inicio!
    }, { once: true })
  }
  if (opcoes.onFim) a.addEventListener('ended', opcoes.onFim)
  let cancelar = () => {}
  return {
    url,
    definirVolume(v) {
      const alvo = Math.min(1, Math.max(0, v))
      if (alvo > 0 && a.paused) a.play().catch(() => {})
      cancelar()
      // Desliza até o volume novo e só pausa depois de chegar a zero (some suave).
      cancelar = rampaDeVolume(a.volume, alvo, (x) => {
        a.volume = Math.min(1, Math.max(0, x))
        if (x === 0 && alvo === 0 && !a.paused) a.pause()
      })
    },
    parar() {
      cancelar()
      a.pause()
    },
  }
}

// loop: repete (padrão); inicio: segundo de onde começa; onFim: avisa quando um som sem loop acaba.
export function useTocarSons(volumes: { id: string; url: string; volume: number; loop?: boolean; inicio?: number }[], onFim?: (id: string) => void): Record<string, string> {
  const tocadores = useRef(new Map<string, Tocador & { loop: boolean }>())
  const fim = useRef(onFim)
  fim.current = onFim
  const [erros, setErros] = useState<Record<string, string>>({})
  const chave = JSON.stringify(volumes)

  useEffect(() => {
    const lista = JSON.parse(chave) as typeof volumes
    const vivos = new Set(lista.map((v) => v.id))
    for (const [id, t] of tocadores.current) {
      if (!vivos.has(id)) {
        t.parar()
        tocadores.current.delete(id)
      }
    }
    for (const v of lista) {
      let t = tocadores.current.get(v.id)
      const loop = v.loop ?? true
      if (!t || t.url !== v.url || t.loop !== loop) {
        t?.parar()
        const yt = idDoYoutube(v.url)
        const opcoes: OpcoesDoTocador = { loop, inicio: v.inicio, onFim: () => fim.current?.(v.id) }
        t = {
          loop,
          ...(yt
            ? { url: v.url, ...criarTocadorYoutube(yt, (motivo) => setErros((e) => ({ ...e, [v.id]: motivo })), opcoes) }
            : tocadorDeAudio(v.url, opcoes)),
        }
        setErros((e) => {
          if (!(v.id in e)) return e
          const { [v.id]: _, ...resto } = e
          return resto
        })
        tocadores.current.set(v.id, t)
      }
      t.definirVolume(v.volume)
    }
  }, [chave])

  // Saiu da mesa / trocou de cena: para tudo.
  useEffect(() => {
    const mapa = tocadores.current
    return () => {
      for (const t of mapa.values()) t.parar()
      mapa.clear()
    }
  }, [])

  return erros
}
