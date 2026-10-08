import { recortarImagem } from '../../components/RecortarImagem'
import { useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faChevronDown, faChevronRight, faImage, faMinus, faPlus, faTextSlash } from '@fortawesome/free-solid-svg-icons'
import { aplicarFormato, alternarEmLinha, estiloDoCampo, FORMATO_PADRAO, formatoVazio, textoPuro, vazio, type EmLinha, type FormatoAtivo } from './chat'
import d4Icon from '../../assets/dice-picker/d4.svg'
import d6Icon from '../../assets/dice-picker/d6.svg'
import d8Icon from '../../assets/dice-picker/d8.svg'
import d10Icon from '../../assets/dice-picker/d10.svg'
import d12Icon from '../../assets/dice-picker/d12.svg'
import d20Icon from '../../assets/dice-picker/d20.svg'
import BotaoGif from './BotaoGif'
import { BANDEJA_VAZIA, bandejaVazia, comandoDeRolagem, DADOS_DA_BANDEJA, formulaDaBandeja, type Bandeja, type Vantagem } from './rolador'

const TAMANHOS = [
  { rotulo: 'Pequeno', px: 12 },
  { rotulo: 'Normal', px: null },
  { rotulo: 'Grande', px: 20 },
  { rotulo: 'Enorme', px: 28 },
]

// Fontes do menu Formato (12.3).
export const FONTES = [
  'Amiri', 'Arial', 'Bruno Ace', 'Courier', 'Courier New', 'Modesto Condensed', 'Roboto',
  'Roboto Condensed', 'Roboto Slab', 'Signika', 'Times', 'Times New Roman',
]

const EM_LINHA: { rotulo: string; chave: EmLinha }[] = [
  { rotulo: 'Negrito', chave: 'negrito' },
  { rotulo: 'Itálico', chave: 'italico' },
  { rotulo: 'Código', chave: 'codigo' },
  { rotulo: 'Sublinhado', chave: 'sublinhado' },
  { rotulo: 'Tachado', chave: 'tachado' },
  { rotulo: 'Sobrescrito', chave: 'sobrescrito' },
  { rotulo: 'Subscrito', chave: 'subscrito' },
]

type Submenu = 'emLinha' | 'fonte' | 'tamanho' | 'formato'

const SUBMENUS: { id: Submenu; rotulo: string }[] = [
  { id: 'emLinha', rotulo: 'Em Linha' },
  { id: 'fonte', rotulo: 'Fonte' },
  { id: 'tamanho', rotulo: 'Tamanho' },
  { id: 'formato', rotulo: 'Formato' },
]

const CHAVE_FORMATO = 'arkanis:chat-formato'

// O formato marcado é uma preferência de quem digita: fica no navegador.
function formatoSalvo(): FormatoAtivo {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_FORMATO) ?? 'null')
    return salvo && Array.isArray(salvo.emLinha) ? { ...FORMATO_PADRAO, ...salvo } : FORMATO_PADRAO
  } catch {
    return FORMATO_PADRAO
  }
}

function ehImagem(f: File) {
  return f.type.startsWith('image/')
}

// Ícones dos dados: os mesmos do rolador da ficha de Ordem Paranormal (o d100 usa o d10).
const ICONE_DO_DADO: Record<number, string> = { 4: d4Icon, 6: d6Icon, 8: d8Icon, 10: d10Icon, 12: d12Icon, 20: d20Icon, 100: d10Icon }

function Marca({ ligada }: { ligada: boolean }) {
  return <span className="chat-formato-marca">{ligada && <FontAwesomeIcon icon={faCheck} />}</span>
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
  const [menu, setMenu] = useState(false)
  const [submenu, setSubmenu] = useState<Submenu | null>(null)
  // Sem espaço à direita (o chat fica na borda da tela), o submenu abre pra esquerda.
  const [subAEsquerda, setSubAEsquerda] = useState(false)
  const [formato, setFormatoBruto] = useState<FormatoAtivo>(formatoSalvo)
  const [enviando, setEnviando] = useState(false)
  // Sublinhado/tachado do campo passariam pro texto de exemplo; o formato só entra com algo escrito.
  const [campoVazio, setCampoVazio] = useState(true)
  const [aviso, setAviso] = useState<string | null>(null)
  // Bandeja de dados (pedido da Millie, 06/10): clica nos dados, +/− no modificador,
  // vantagem/desvantagem; o código aparece no campo (/r 1d6+2) e Roll rola.
  const [bandeja, setBandejaBruta] = useState<Bandeja>(BANDEJA_VAZIA)

  function setBandeja(nova: Bandeja) {
    setBandejaBruta(nova)
    const campo = campoRef.current
    if (!campo) return
    // Só reescreve o campo se ele está vazio ou com uma rolagem (não apaga uma mensagem escrita).
    const atual = textoPuro(campo.innerHTML)
    if (atual && !atual.startsWith('/r')) return
    campo.textContent = bandejaVazia(nova) ? '' : `/r ${formulaDaBandeja(nova)}`
    setCampoVazio(!campo.textContent)
  }

  const mudarDado = (lados: number, delta: number) =>
    setBandeja({ ...bandeja, dados: { ...bandeja.dados, [lados]: Math.max(0, Math.min(99, (bandeja.dados[lados] ?? 0) + delta)) } })
  const mudarVantagem = (v: Vantagem) => setBandeja({ ...bandeja, vantagem: bandeja.vantagem === v ? 'normal' : v })

  function setFormato(novo: FormatoAtivo) {
    setFormatoBruto(novo)
    try {
      localStorage.setItem(CHAVE_FORMATO, JSON.stringify(novo))
    } catch {
      // sem armazenamento, o formato vale só até recarregar a página
    }
  }

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
    document.execCommand(nome, false, valor)
    guardarSelecao()
  }

  // Limpar Formatação tira o que está marcado no menu e o que veio colado no texto.
  function limparFormatacao() {
    setFormato(FORMATO_PADRAO)
    const campo = campoRef.current
    if (campo) {
      campo.querySelectorAll('b, i, u, s, strike, sup, sub, code, span, font, strong, em').forEach((el) => el.replaceWith(...Array.from(el.childNodes)))
    }
  }

  function tamanhoPersonalizado() {
    const px = Number(window.prompt('Tamanho da fonte, em pixels:', String(formato.tamanho ?? 18)))
    if (px >= 6 && px <= 96) setFormato({ ...formato, tamanho: Math.round(px) })
  }

  async function inserirImagens(arquivos: File[]) {
    let imagens = arquivos.filter(ehImagem)
    // Recorte (08/10): uma imagem por vez abre o recorte; várias de uma vez sobem direto.
    if (imagens.length === 1) {
      const r = await recortarImagem(imagens[0], { proporcao: 'original', titulo: 'Imagem no chat' })
      imagens = r ? [r] : []
    }
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
    // Rolagem vai sem formato (é um comando, não texto).
    const rolagem = comandoDeRolagem(textoPuro(campo.innerHTML))
    if (rolagem === 'invalida') {
      setEnviando(false)
      setAviso('Não entendi a rolagem. Ex.: /r 1d20+5, /r 2d6-1, /r 2d20kh1 # Ataque')
      return
    }
    const ok = await onEnviar(rolagem ? campo.textContent ?? '' : aplicarFormato(campo.innerHTML, formato))
    setEnviando(false)
    if (ok) {
      campo.innerHTML = ''
      setCampoVazio(true)
      setAviso(null)
      setBandejaBruta(BANDEJA_VAZIA)
    } else setAviso(rolagem ? 'Não deu pra rolar.' : 'Não deu pra enviar a mensagem.')
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

  function fecharMenu() {
    setMenu(false)
    setSubmenu(null)
  }

  return (
    <div className={`chat-entrada${compacto ? ' compacta' : ''}`}>
      {!compacto && (
        <div className="chat-barra-formato">
          <div className="chat-formato">
            <button
              type="button"
              className={`chat-formato-botao${formatoVazio(formato) ? '' : ' marcado'}`}
              aria-expanded={menu}
              onMouseDown={manterFoco}
              onClick={(e) => {
                if (menu) return fecharMenu()
                setSubAEsquerda(e.currentTarget.getBoundingClientRect().left + 150 + 180 > window.innerWidth)
                setMenu(true)
              }}
            >
              Formato <FontAwesomeIcon icon={faChevronDown} />
            </button>
            {menu && (
              <>
                <div className="dropdown-backdrop" onClick={fecharMenu} />
                <ul className={`chat-formato-menu${subAEsquerda ? ' sub-esquerda' : ''}`} role="menu" onMouseDown={manterFoco}>
                  {SUBMENUS.map((s) => (
                    <li key={s.id} className="chat-formato-item" onMouseEnter={() => setSubmenu(s.id)}>
                      <button type="button" role="menuitem" aria-haspopup="true" aria-expanded={submenu === s.id} onClick={() => setSubmenu(s.id)}>
                        {s.rotulo} <FontAwesomeIcon icon={faChevronRight} />
                      </button>

                      {submenu === s.id && (
                        <ul className="chat-formato-sub" role="menu">
                          {s.id === 'emLinha' &&
                            EM_LINHA.map((c) => (
                              <li key={c.chave}>
                                <button type="button" role="menuitemcheckbox" aria-checked={formato.emLinha.includes(c.chave)} onClick={() => setFormato(alternarEmLinha(formato, c.chave))}>
                                  <Marca ligada={formato.emLinha.includes(c.chave)} /> {c.rotulo}
                                </button>
                              </li>
                            ))}

                          {s.id === 'fonte' &&
                            FONTES.map((f) => (
                              <li key={f}>
                                <button type="button" role="menuitemradio" aria-checked={formato.fonte === f} style={{ fontFamily: `'${f}'` }} onClick={() => setFormato({ ...formato, fonte: formato.fonte === f ? null : f })}>
                                  <Marca ligada={formato.fonte === f} /> {f}
                                </button>
                              </li>
                            ))}

                          {s.id === 'tamanho' && (
                            <>
                              {TAMANHOS.map((t) => (
                                <li key={t.rotulo}>
                                  <button type="button" role="menuitemradio" aria-checked={formato.tamanho === t.px} onClick={() => setFormato({ ...formato, tamanho: t.px })}>
                                    <Marca ligada={formato.tamanho === t.px} /> {t.rotulo}
                                  </button>
                                </li>
                              ))}
                              <li>
                                <button
                                  type="button"
                                  role="menuitemradio"
                                  aria-checked={formato.tamanho !== null && !TAMANHOS.some((t) => t.px === formato.tamanho)}
                                  onClick={tamanhoPersonalizado}
                                >
                                  <Marca ligada={formato.tamanho !== null && !TAMANHOS.some((t) => t.px === formato.tamanho)} />
                                  Personalizado{formato.tamanho !== null && !TAMANHOS.some((t) => t.px === formato.tamanho) ? ` (${formato.tamanho}px)` : ''}
                                </button>
                              </li>
                            </>
                          )}

                          {s.id === 'formato' && (
                            <>
                              <li className="chat-formato-cor">
                                <Marca ligada={formato.cor !== null} /> Cor
                                <input
                                  type="color"
                                  aria-label="Cor da fonte"
                                  value={formato.cor ?? '#000000'}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onChange={(e) => setFormato({ ...formato, cor: e.target.value })}
                                />
                              </li>
                              {formato.cor && (
                                <li>
                                  <button type="button" onClick={() => setFormato({ ...formato, cor: null })}>
                                    <Marca ligada={false} /> Tirar cor
                                  </button>
                                </li>
                              )}
                            </>
                          )}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <button type="button" className="chat-barra-icone" aria-label="Linha horizontal" title="Linha horizontal" onMouseDown={manterFoco} onClick={() => comando('insertHorizontalRule')}>
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <button type="button" className="chat-barra-icone" aria-label="Inserir imagem" title="Inserir imagem" onMouseDown={manterFoco} onClick={() => { guardarSelecao(); arquivoRef.current?.click() }}>
            <FontAwesomeIcon icon={faImage} />
          </button>
          <BotaoGif onEnviar={onEnviar} onImagem={onImagem} />
          <button type="button" className="chat-barra-icone" aria-label="Limpar Formatação" title="Limpar Formatação" onMouseDown={manterFoco} onClick={limparFormatacao}>
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
        style={campoVazio ? undefined : estiloDoCampo(formato)}
        onInput={(e) => setCampoVazio(e.currentTarget.innerHTML === '' || e.currentTarget.innerHTML === '<br>')}
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
      {!compacto && (
        <div className="chat-bandeja" onMouseDown={manterFoco}>
          <div className="chat-bandeja-dados">
            {DADOS_DA_BANDEJA.map((l) => {
              const n = bandeja.dados[l] ?? 0
              return (
                <button
                  key={l}
                  type="button"
                  className={`chat-bandeja-dado${n ? ' marcado' : ''}`}
                  aria-label={`d${l}${n ? ` (${n})` : ''}`}
                  title={`d${l}: clique põe um, botão direito tira`}
                  onClick={() => mudarDado(l, 1)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    mudarDado(l, -1)
                  }}
                >
                  <img src={ICONE_DO_DADO[l]} alt="" draggable={false} />
                  <small>d{l}</small>
                  {n > 0 && <span className="chat-bandeja-conta">{n}</span>}
                </button>
              )
            })}
          </div>
          <div className="chat-bandeja-acoes">
            <button type="button" className="chat-bandeja-menos" aria-label="Modificador −1" title="Modificador −1" onClick={() => setBandeja({ ...bandeja, modificador: bandeja.modificador - 1 })}>
              <FontAwesomeIcon icon={faMinus} />
            </button>
            <span className="chat-bandeja-mod" aria-label="Modificador">{bandeja.modificador > 0 ? `+${bandeja.modificador}` : bandeja.modificador}</span>
            <button type="button" className="chat-bandeja-mais" aria-label="Modificador +1" title="Modificador +1" onClick={() => setBandeja({ ...bandeja, modificador: bandeja.modificador + 1 })}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <span className="chat-bandeja-vantagem">
              <button type="button" aria-pressed={bandeja.vantagem === 'vantagem'} className={bandeja.vantagem === 'vantagem' ? 'ligado' : undefined} title="Vantagem: rola mais um dado e fica com o maior" onClick={() => mudarVantagem('vantagem')}>ADV</button>
              <button type="button" aria-pressed={bandeja.vantagem === 'desvantagem'} className={bandeja.vantagem === 'desvantagem' ? 'ligado' : undefined} title="Desvantagem: rola mais um dado e fica com o menor" onClick={() => mudarVantagem('desvantagem')}>DIS</button>
            </span>
            <button type="button" className="chat-bandeja-rolar" disabled={enviando} onClick={() => enviar()}>Roll</button>
          </div>
        </div>
      )}
      {aviso && <p className="chat-aviso">{aviso}</p>}
    </div>
  )
}
