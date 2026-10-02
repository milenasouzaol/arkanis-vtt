import { useEffect, useState } from 'react'
import { EVENTO_ERRO_BANCO, type ErroBanco } from '../lib/avisoErro'

type Aviso = ErroBanco & { id: number }

const TEXTO: Record<ErroBanco['acao'], string> = {
  salvar: 'Não consegui salvar no banco.',
  carregar: 'Não consegui carregar dados do banco.',
}

/** Avisos de erro do banco no canto da tela; somem sozinhos em 7s. */
export default function AvisoErroBanco() {
  const [avisos, setAvisos] = useState<Aviso[]>([])

  useEffect(() => {
    let proximo = 0
    const aoErrar = (e: Event) => {
      const erro = (e as CustomEvent<ErroBanco>).detail
      const id = ++proximo
      setAvisos((lista) => {
        // O mesmo erro repetido (varias leituras da mesma tabela) aparece uma vez so.
        if (lista.some((a) => a.acao === erro.acao && a.detalhe === erro.detalhe)) return lista
        return [...lista.slice(-2), { ...erro, id }]
      })
      setTimeout(() => setAvisos((lista) => lista.filter((a) => a.id !== id)), 7000)
    }
    window.addEventListener(EVENTO_ERRO_BANCO, aoErrar)
    return () => window.removeEventListener(EVENTO_ERRO_BANCO, aoErrar)
  }, [])

  if (avisos.length === 0) return null
  return (
    <div className="aviso-erro-pilha" role="alert">
      {avisos.map((a) => (
        <div key={a.id} className="aviso-erro">
          <strong>{TEXTO[a.acao]}</strong>
          <span>{a.detalhe}</span>
          <button type="button" aria-label="Fechar aviso" onClick={() => setAvisos((l) => l.filter((x) => x.id !== a.id))}>
            <svg viewBox="0 0 12 12" aria-hidden><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>
      ))}
    </div>
  )
}
