import { useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faImage, faMinus, faTextSlash } from '@fortawesome/free-solid-svg-icons'
import { vazio } from './chat'

const TAMANHOS = [
  { rotulo: 'Pequeno', px: 12 },
  { rotulo: 'Normal', px: 15 },
  { rotulo: 'Grande', px: 20 },
  { rotulo: 'Enorme', px: 28 },
]

// Fontes do menu Parágrafo (12.3).
export const FONTES = [
  'Amiri', 'Arial', 'Bruno Ace', 'Courier', 'Courier New', 'Modesto Condensed', 'Roboto',
  'Roboto Condensed', 'Roboto Slab', 'Signika', 'Times', 'Times New Roman',
]

const EM_LINHA = [
  { rotulo: 'Negrito', comando: 'bold' },
  { rotulo: 'Itálico', comando: 'italic' },
  { rotulo: 'Código', comando: 'code' },
  { rotulo: 'Sublinhado', comando: 'underline' },
  { rotulo: 'Tachado', comando: 'strikeThrough' },
  { rotulo: 'Sobrescrito', comando: 'superscript' },
  { rotulo: 'Subscrito', comando: 'subscript' },
]

function ehImagem(f: File) {
  return f.type.startsWith('image/')
}

// Caixa de mensagem do chat: Enter envia, Shift+Enter quebra linha. Imagem entra pelo
// botão, colando ou arrastando pro campo. No modo compacto (chat fechado) fica só o campo.
export default function ChatEntrada({ compacto, onEnviar, onImagem }: {
  compacto?: boolean
  onEnviar: (html: string) => Promise<boolean>
  onImagem: (arquivo: File) => Promise<string | null>
}) {
  const campoRef = useRef<HTMLDivElement>(null)
  const arquivoRef = useRef<HTMLInputElement>(null)
  const selecaoRef = useRef<Range | null>(null)
  const [formato, setFormato] = useState(false)
  const [cor, setCor] = useState('#000000')
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  function guardarSelecao() {
    const sel = window.getSelection()
    if (sel?.rangeCount && campoRef.current?.contains(sel.anchorNode)) selecaoRef.current = sel.getRangeAt(0).cloneRange()
  }

  function voltarSelecao() {
    const campo = campoRef.current
    if (!campo) return
    campo.focus()
    const sel = window.getSelection()
    if (selecaoRef.current && sel) {
      sel.removeAllRanges()
      sel.addRange(selecaoRef.current)
    }
  }

  function comando(nome: string, valor?: string) {
    voltarSelecao()
    if (nome === 'code') {
      const sel = window.getSelection()
      if (!sel?.rangeCount || sel.isCollapsed) return
      const range = sel.getRangeAt(0)
      const code = document.createElement('code')
      code.appendChild(range.extractContents())
      range.insertNode(code)
    } else {
      document.execCommand(nome, false, valor)
    }
    guardarSelecao()
  }

  // execCommand só conhece tamanhos 1-7: marca com 7 e troca por px de verdade.
  function tamanho(px: number) {
    comando('fontSize', '7')
    campoRef.current?.querySelectorAll('font[size="7"]').forEach((f) => {
      const span = document.createElement('span')
      span.style.fontSize = `${px}px`
      span.append(...Array.from(f.childNodes))
      f.replaceWith(span)
    })
    setFormato(false)
  }

  function tamanhoPersonalizado() {
    const valor = window.prompt('Tamanho da fonte, em pixels:', '18')
    const px = Number(valor)
    if (px >= 6 && px <= 96) tamanho(Math.round(px))
    else setFormato(false)
  }

  async function inserirImagens(arquivos: File[]) {
    const imagens = arquivos.filter(ehImagem)
    if (!imagens.length) return
    setAviso('Enviando imagem…')
    for (const arquivo of imagens) {
      const url = await onImagem(arquivo)
      if (!url) {
        setAviso('Não deu pra enviar a imagem.')
        return
      }
      voltarSelecao()
      document.execCommand('insertImage', false, url)
      guardarSelecao()
    }
    setAviso(null)
  }

  async function enviar() {
    const campo = campoRef.current
    if (!campo || enviando || vazio(campo.innerHTML)) return
    setEnviando(true)
    const ok = await onEnviar(campo.innerHTML)
    setEnviando(false)
    if (ok) {
      campo.innerHTML = ''
      setAviso(null)
    } else setAviso('Não deu pra enviar a mensagem.')
  }

  function teclar(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      enviar()
    }
  }

  // Colar: imagem sobe; texto entra sem a formatação de fora.
  function colar(e: ClipboardEvent<HTMLDivElement>) {
    const arquivos = Array.from(e.clipboardData.files)
    e.preventDefault()
    if (arquivos.some(ehImagem)) {
      inserirImagens(arquivos)
      return
    }
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
  }

  // Arrastar: arquivo do computador sobe; imagem de outra aba do navegador entra pela URL.
  function soltar(e: DragEvent<HTMLDivElement>) {
    const arquivos = Array.from(e.dataTransfer.files)
    const url = e.dataTransfer.getData('text/uri-list').split('\n').find((l) => /^https?:\/\//.test(l.trim()))
    if (arquivos.some(ehImagem)) {
      e.preventDefault()
      inserirImagens(arquivos)
    } else if (url && /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(url)) {
      e.preventDefault()
      voltarSelecao()
      document.execCommand('insertImage', false, url.trim())
    }
  }

  // Botões da barra não podem tirar o foco do campo, senão a seleção se perde.
  const manterFoco = (e: React.MouseEvent) => e.preventDefault()

  return (
    <div className={`chat-entrada${compacto ? ' compacta' : ''}`}>
      {!compacto && (
        <div className="chat-barra-formato">
          <div className="chat-formato">
            <button type="button" className="chat-formato-botao" aria-expanded={formato} onMouseDown={manterFoco} onClick={() => setFormato((v) => !v)}>
              Formato <FontAwesomeIcon icon={faChevronDown} />
            </button>
            {formato && (
              <>
                <div className="dropdown-backdrop" onClick={() => setFormato(false)} />
                <div className="chat-formato-menu" onMouseDown={manterFoco}>
                  <p className="chat-formato-secao">Tamanho</p>
                  {TAMANHOS.map((t) => (
                    <button key={t.rotulo} type="button" onClick={() => tamanho(t.px)}>{t.rotulo}</button>
                  ))}
                  <button type="button" onClick={tamanhoPersonalizado}>Personalizado</button>

                  <p className="chat-formato-secao">Fonte</p>
                  {FONTES.map((f) => (
                    <button key={f} type="button" style={{ fontFamily: f }} onClick={() => { comando('fontName', f); setFormato(false) }}>{f}</button>
                  ))}

                  <p className="chat-formato-secao">Formato</p>
                  <label className="chat-formato-cor">
                    Cor
                    <input
                      type="color"
                      value={cor}
                      onMouseDown={(e) => e.stopPropagation()}
                      onChange={(e) => setCor(e.target.value)}
                    />
                    <button type="button" onClick={() => { comando('foreColor', cor); setFormato(false) }}>Aplicar</button>
                  </label>

                  <p className="chat-formato-secao">Em Linha</p>
                  {EM_LINHA.map((c) => (
                    <button key={c.comando} type="button" onClick={() => { comando(c.comando); setFormato(false) }}>{c.rotulo}</button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button type="button" className="chat-barra-icone" aria-label="Linha horizontal" title="Linha horizontal" onMouseDown={manterFoco} onClick={() => comando('insertHorizontalRule')}>
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <button type="button" className="chat-barra-icone" aria-label="Inserir imagem" title="Inserir imagem" onMouseDown={manterFoco} onClick={() => { guardarSelecao(); arquivoRef.current?.click() }}>
            <FontAwesomeIcon icon={faImage} />
          </button>
          <button type="button" className="chat-barra-icone" aria-label="Limpar Formatação" title="Limpar Formatação" onMouseDown={manterFoco} onClick={() => comando('removeFormat')}>
            <FontAwesomeIcon icon={faTextSlash} />
          </button>
          <input
            ref={arquivoRef}
            type="file"
            accept="image/*"
            hidden
            multiple
            onChange={(e) => {
              inserirImagens(Array.from(e.target.files ?? []))
              e.target.value = ''
            }}
          />
        </div>
      )}
      <div
        ref={campoRef}
        className="chat-campo"
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Digite uma mensagem"
        data-placeholder="Digite uma mensagem"
        suppressContentEditableWarning
        onKeyDown={teclar}
        onKeyUp={guardarSelecao}
        onMouseUp={guardarSelecao}
        onBlur={guardarSelecao}
        onPaste={colar}
        onDrop={soltar}
      />
      {aviso && <p className="chat-aviso">{aviso}</p>}
    </div>
  )
}
