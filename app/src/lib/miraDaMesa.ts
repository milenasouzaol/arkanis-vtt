import { useEffect, useState } from 'react'

// Ponte entre a mesa e a ficha (KAN-51): a ficha do jogador abre num iframe (ou noutra aba),
// então os alvos marcados na mesa chegam nela por um BroadcastChannel do navegador.
export type AlvoDaMesa = { token_id: string; nome: string }

type Mensagem = { tipo: 'alvos'; campanhaId: string; alvos: AlvoDaMesa[] } | { tipo: 'pedir'; campanhaId: string }

const NOME = 'arkanis-mira'

function abrir(): BroadcastChannel | null {
  return typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(NOME)
}

// Lado da mesa: avisa os alvos atuais e responde a quem pedir (ficha que acabou de abrir).
export function useAnunciarAlvos(campanhaId: string | undefined, alvos: AlvoDaMesa[]) {
  const chave = JSON.stringify(alvos)
  useEffect(() => {
    if (!campanhaId) return
    const canal = abrir()
    if (!canal) return
    const lista = JSON.parse(chave) as AlvoDaMesa[]
    canal.postMessage({ tipo: 'alvos', campanhaId, alvos: lista } satisfies Mensagem)
    canal.onmessage = (e: MessageEvent<Mensagem>) => {
      if (e.data?.tipo === 'pedir' && e.data.campanhaId === campanhaId) canal.postMessage({ tipo: 'alvos', campanhaId, alvos: lista } satisfies Mensagem)
    }
    return () => {
      canal.postMessage({ tipo: 'alvos', campanhaId, alvos: [] } satisfies Mensagem)
      canal.close()
    }
  }, [campanhaId, chave])
}

// Lado da ficha: os alvos que esta pessoa marcou na mesa da campanha do personagem.
export function useAlvosDaMesa(campanhaId: string | null | undefined): AlvoDaMesa[] {
  const [alvos, setAlvos] = useState<AlvoDaMesa[]>([])
  useEffect(() => {
    setAlvos([])
    if (!campanhaId) return
    const canal = abrir()
    if (!canal) return
    canal.onmessage = (e: MessageEvent<Mensagem>) => {
      if (e.data?.tipo === 'alvos' && e.data.campanhaId === campanhaId) setAlvos(e.data.alvos)
    }
    canal.postMessage({ tipo: 'pedir', campanhaId } satisfies Mensagem)
    return () => canal.close()
  }, [campanhaId])
  return alvos
}
