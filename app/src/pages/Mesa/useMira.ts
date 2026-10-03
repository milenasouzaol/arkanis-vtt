import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

// Alvos marcados com a mira (12.9 e 12.13): cada pessoa tem os seus, e todo mundo vê a mira
// em cima dos tokens marcados (ao vivo, sem gravar no banco).
export type MiraDeAlguem = { nome: string; alvos: string[] }

export function useMira(campanhaId: string | undefined, userId: string | undefined, nome: string) {
  const [meus, setMeus] = useState<string[]>([])
  const [outros, setOutros] = useState<Record<string, MiraDeAlguem>>({})
  const canalRef = useRef<RealtimeChannel | null>(null)
  const atual = useRef({ meus, nome })
  atual.current = { meus, nome }

  useEffect(() => {
    if (!campanhaId || !userId) return
    const anunciar = () => canalRef.current?.send({ type: 'broadcast', event: 'mira', payload: { userId, nome: atual.current.nome, alvos: atual.current.meus } })
    const canal = supabase
      .channel(`mira:${campanhaId}`, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'mira' }, ({ payload }) => {
        const p = payload as { userId: string; nome: string; alvos: string[] }
        setOutros((m) => ({ ...m, [p.userId]: { nome: p.nome, alvos: p.alvos } }))
      })
      // Quem acabou de entrar pede as miras de quem já estava.
      .on('broadcast', { event: 'pedir' }, anunciar)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') canal.send({ type: 'broadcast', event: 'pedir', payload: {} })
      })
    canalRef.current = canal
    return () => {
      canalRef.current = null
      supabase.removeChannel(canal)
    }
  }, [campanhaId, userId])

  useEffect(() => {
    if (userId) canalRef.current?.send({ type: 'broadcast', event: 'mira', payload: { userId, nome, alvos: meus } })
  }, [meus, nome, userId])

  // M em cima de um token: marca; de novo, desmarca. Vários alvos ao mesmo tempo.
  const alternar = useCallback((ids: string[]) => {
    setMeus((l) => {
      const todos = ids.every((id) => l.includes(id))
      return todos ? l.filter((id) => !ids.includes(id)) : [...new Set([...l, ...ids])]
    })
  }, [])

  const limpar = useCallback(() => setMeus([]), [])

  return { meus, outros, alternar, limpar, setMeus }
}
