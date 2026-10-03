import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFloppyDisk, faTrash } from '@fortawesome/free-solid-svg-icons'
import ChatMensagem from './ChatMensagem'
import ChatEntrada from './ChatEntrada'
import ModosEnvio from './ModosEnvio'
import { exportarRegistro, type Mensagem, type ModoEnvio } from './chat'

// Aba Mensagens de Chat (12.3): histórico em cima, modos de envio e caixa de mensagem embaixo.
export default function PainelChat({ mensagens, souMestre, nomeMestre, nomeCampanha, modo, onMudarModo, onEnviar, onImagem, onAlterar, onExcluir, onLimpar }: {
  mensagens: Mensagem[] | null
  souMestre: boolean
  nomeMestre: string
  nomeCampanha: string
  modo: ModoEnvio
  onMudarModo: (m: ModoEnvio) => void
  onEnviar: (html: string) => Promise<boolean>
  onImagem: (arquivo: File) => Promise<string | null>
  onAlterar: (id: string, campos: Partial<Pick<Mensagem, 'destacada' | 'revelada'>>) => void
  onExcluir: (id: string) => void
  onLimpar: () => void
}) {
  const listaRef = useRef<HTMLDivElement>(null)
  const noFimRef = useRef(true)
  const [agora, setAgora] = useState(() => new Date())

  // O "há quanto tempo" anda sozinho.
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  // Mensagem nova rola a lista pro fim, a não ser que a pessoa esteja lendo lá em cima.
  useLayoutEffect(() => {
    const lista = listaRef.current
    if (lista && noFimRef.current) lista.scrollTop = lista.scrollHeight
  }, [mensagens])

  function exportar() {
    const blob = new Blob([exportarRegistro(mensagens ?? [], nomeCampanha)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-${nomeCampanha.replace(/[^\w-]+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function limpar() {
    if (window.confirm('Apagar todo o registro de chat da mesa? Isso não pode ser desfeito.')) onLimpar()
  }

  return (
    <div className="chat-painel">
      <div
        ref={listaRef}
        className="chat-lista"
        onScroll={(e) => {
          const el = e.currentTarget
          noFimRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
        }}
      >
        {mensagens === null && <p className="chat-vazio">Carregando…</p>}
        {mensagens?.length === 0 && <p className="chat-vazio">Nenhuma mensagem ainda.</p>}
        {mensagens?.map((m) => (
          <ChatMensagem
            key={m.id}
            mensagem={m}
            souMestre={souMestre}
            nomeMestre={nomeMestre}
            agora={agora}
            onDestacar={() => onAlterar(m.id, { destacada: !m.destacada })}
            onRevelar={() => onAlterar(m.id, { revelada: true })}
            onExcluir={() => onExcluir(m.id)}
          />
        ))}
      </div>

      <div className="chat-controles">
        <ModosEnvio modo={modo} onMudar={onMudarModo} />
        <div className="chat-registro">
          <button type="button" className="mesa-icone" aria-label="Exportar Registro de Chat" title="Exportar Registro de Chat" onClick={exportar}>
            <FontAwesomeIcon icon={faFloppyDisk} />
          </button>
          {souMestre && (
            <button type="button" className="mesa-icone" aria-label="Limpar Registro de Chat" title="Limpar Registro de Chat" onClick={limpar}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
      </div>
      <ChatEntrada onEnviar={onEnviar} onImagem={onImagem} />
    </div>
  )
}
