import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { calcularFps, type Presenca } from './mesa'

// Canal em tempo real da mesa: presença (quem está com a mesa aberta) e latência
// medida pelo tempo que o servidor leva pra confirmar um broadcast.
export function useSessaoMesa(campanhaId: string | undefined, userId: string | undefined) {
  const [presencas, setPresencas] = useState<Presenca[]>([])
  const [latencia, setLatencia] = useState<number | null>(null)
  const canalRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!campanhaId || !userId) return
    const canal = supabase.channel(`mesa:${campanhaId}`, {
      config: { presence: { key: userId }, broadcast: { ack: true } },
    })
    canalRef.current = canal

    canal.on('presence', { event: 'sync' }, () => {
      const estado = canal.presenceState<Presenca>()
      setPresencas(Object.values(estado).flat().map((p) => ({ userId: p.userId })))
    })

    let timer: ReturnType<typeof setInterval> | undefined
    canal.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return
      await canal.track({ userId })
      const medir = async () => {
        const inicio = performance.now()
        const resposta = await canal.send({ type: 'broadcast', event: 'ping', payload: {} })
        if (resposta === 'ok') setLatencia(Math.round(performance.now() - inicio))
      }
      medir()
      timer = setInterval(medir, 5000)
    })

    return () => {
      if (timer) clearInterval(timer)
      canalRef.current = null
      supabase.removeChannel(canal)
    }
  }, [campanhaId, userId])

  return { presencas, latencia, canalRef }
}

// FPS do navegador, recalculado a cada meio segundo a partir do último segundo de quadros.
export function useFps() {
  const [fps, setFps] = useState(0)
  useEffect(() => {
    const instantes: number[] = []
    let raf = 0
    let ultimo = 0
    const quadro = (agora: number) => {
      instantes.push(agora)
      while (instantes.length && agora - instantes[0] > 1000) instantes.shift()
      if (agora - ultimo > 500) {
        ultimo = agora
        setFps(calcularFps(instantes))
      }
      raf = requestAnimationFrame(quadro)
    }
    raf = requestAnimationFrame(quadro)
    return () => cancelAnimationFrame(raf)
  }, [])
  return fps
}
