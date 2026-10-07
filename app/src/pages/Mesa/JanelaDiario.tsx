import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBookOpen, faCaretLeft, faCaretRight, faCheck, faChevronLeft, faChevronRight, faClone, faFeatherPointed, faFileCirclePlus, faLock, faLockOpen,
  faMagnifyingGlass, faNoteSticky, faTrash, faUpload,
} from '@fortawesome/free-solid-svg-icons'
import Janela, { Campo, Deslizante } from './Janela'
import { EditorTexto } from './PainelPlaylist'
import { sanitizarHtml } from './chat'
import { embutirYoutube, moverPagina, novaPagina, paginasQueBatem, TIPOS_PAGINA, VIDEO_PADRAO, type EntradaDiario, type Pagina, type TipoPagina } from './diario'

// Janela do Diário (prints do Foundry da Millie, 06/10): índice das páginas à esquerda (com
// cadeado, página única/múltiplas, busca e recolher) e a página à direita, com o nome do registro
// em cima. Dono edita (pena em cada página, Adicionar Página); os outros só leem.
export default function JanelaDiario({ entrada, podeEditar, onSalvar, onEnviarArquivo, onFechar }: {
  entrada: EntradaDiario
  podeEditar: boolean
  onSalvar: (campos: Partial<EntradaDiario>) => void
  onEnviarArquivo: (arquivo: File) => Promise<string | null>
  onFechar: () => void
}) {
  const paginas = entrada.paginas
  const [atual, setAtual] = useState<string | null>(paginas[0]?.id ?? null)
  const [multiplas, setMultiplas] = useState(false)
  const [travado, setTravado] = useState(true)
  const [recolhido, setRecolhido] = useState(false)
  const [busca, setBusca] = useState('')
  const [criando, setCriando] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [renomeando, setRenomeando] = useState(false)
  const arrastando = useRef<number | null>(null)
  const conteudo = useRef<HTMLDivElement>(null)

  const indice = Math.max(0, paginas.findIndex((p) => p.id === atual))
  const pagina = paginas[indice] ?? null
  const batem = paginasQueBatem(paginas, busca)
  const salvarPaginas = (l: Pagina[]) => onSalvar({ paginas: l })

  // Se a página aberta sumiu (excluída por alguém), volta pra primeira.
  useEffect(() => {
    if (atual && !paginas.some((p) => p.id === atual)) setAtual(paginas[0]?.id ?? null)
  }, [paginas, atual])

  function irPara(p: Pagina) {
    setAtual(p.id)
    if (multiplas) conteudo.current?.querySelector(`[data-pagina="${p.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function passo(d: number) {
    const p = paginas[indice + d]
    if (p) irPara(p)
  }

  const secao = (p: Pagina) => (
    <section key={p.id} className="diario-pagina" data-pagina={p.id}>
      {(p.mostrarTitulo || podeEditar) && (
        <header className={`diario-pagina-topo${p.tipo === 'texto' ? ' sublinhado' : ''}`}>
          {p.mostrarTitulo ? <h3>{p.nome}</h3> : <span />}
          {podeEditar && (
            <button type="button" className="diario-editar-pagina" title="Editar Página" aria-label={`Editar a página ${p.nome}`} onClick={() => setEditando(p.id)}>
              <FontAwesomeIcon icon={faFeatherPointed} />
            </button>
          )}
        </header>
      )}
      <ConteudoDaPagina pagina={p} />
    </section>
  )

  const paginaEditada = paginas.find((p) => p.id === editando) ?? null

  return (
    <>
    <Janela titulo={entrada.name} icone={faBookOpen} largura={980} altura={780} className="janela-diario" onFechar={onFechar}>
      <div className={`diario${recolhido ? ' recolhido' : ''}`}>
        <aside className="diario-indice">
          <div className="diario-ferramentas">
            {recolhido ? (
              <>
                <button type="button" title="Expandir Barra Lateral" aria-label="Expandir Barra Lateral" onClick={() => setRecolhido(false)}><FontAwesomeIcon icon={faCaretLeft} /></button>
                <button type="button" className={multiplas ? 'ligado' : undefined} title={multiplas ? 'Modo de Múltiplas Páginas' : 'Modo de Página Única'} onClick={() => setMultiplas((m) => !m)}><FontAwesomeIcon icon={multiplas ? faClone : faNoteSticky} /></button>
                <button type="button" title="Procurar Páginas" aria-label="Procurar Páginas" onClick={() => setRecolhido(false)}><FontAwesomeIcon icon={faMagnifyingGlass} /></button>
              </>
            ) : (
              <>
                {podeEditar && (
                  <button
                    type="button"
                    className={!travado ? 'ligado' : undefined}
                    title={travado ? 'Índice bloqueado. Clique para desbloquear (arrastar pra mudar a ordem).' : 'Índice desbloqueado. Clique para bloquear.'}
                    aria-label={travado ? 'Desbloquear índice' : 'Bloquear índice'}
                    onClick={() => setTravado((t) => !t)}
                  >
                    <FontAwesomeIcon icon={travado ? faLock : faLockOpen} />
                  </button>
                )}
                <button
                  type="button"
                  className={multiplas ? 'ligado' : undefined}
                  title={multiplas ? 'Modo de Múltiplas Páginas' : 'Modo de Página Única'}
                  aria-label={multiplas ? 'Mudar pra página única' : 'Mudar pra múltiplas páginas'}
                  onClick={() => setMultiplas((m) => !m)}
                >
                  <FontAwesomeIcon icon={multiplas ? faClone : faNoteSticky} />
                </button>
                <label className="diario-busca">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                  <input value={busca} placeholder="Procurar Páginas" aria-label="Procurar Páginas" onChange={(e) => setBusca(e.target.value)} />
                </label>
                <button type="button" title="Recolher Barra Lateral" aria-label="Recolher Barra Lateral" onClick={() => setRecolhido(true)}><FontAwesomeIcon icon={faCaretRight} /></button>
              </>
            )}
          </div>

          <ol className="diario-lista">
            {paginas.map((p, i) => (
              <li
                key={p.id}
                className={`${p.id === pagina?.id ? 'atual' : ''}${batem.has(p.id) ? '' : ' escondida'}`}
                draggable={podeEditar && !travado && !recolhido}
                onDragStart={() => (arrastando.current = i)}
                onDragOver={(e) => arrastando.current !== null && e.preventDefault()}
                onDrop={() => {
                  if (arrastando.current !== null) salvarPaginas(moverPagina(paginas, arrastando.current, i))
                  arrastando.current = null
                }}
              >
                <button type="button" title={p.nome} onClick={() => irPara(p)}>
                  <span className="diario-numero">{i}</span>
                  {!recolhido && <span className="diario-nome">{p.nome}</span>}
                </button>
              </li>
            ))}
          </ol>

          <div className="diario-rodape">
            <button type="button" className="diario-seta" aria-label="Página anterior" disabled={indice <= 0} onClick={() => passo(-1)}><FontAwesomeIcon icon={faChevronLeft} /></button>
            {podeEditar && !recolhido && (
              <button type="button" className="diario-adicionar" onClick={() => setCriando(true)}>
                <FontAwesomeIcon icon={faFileCirclePlus} /> Adicionar Página
              </button>
            )}
            <button type="button" className="diario-seta" aria-label="Próxima página" disabled={indice >= paginas.length - 1} onClick={() => passo(1)}><FontAwesomeIcon icon={faChevronRight} /></button>
          </div>
        </aside>

        <div className="diario-conteudo" ref={conteudo}>
          {renomeando ? (
            <input
              className="diario-titulo diario-titulo-campo"
              autoFocus
              defaultValue={entrada.name}
              aria-label="Nome do registro"
              onBlur={(e) => { const n = e.target.value.trim(); if (n && n !== entrada.name) onSalvar({ name: n }); setRenomeando(false) }}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setRenomeando(false) }}
            />
          ) : (
            <h2 className="diario-titulo" title={podeEditar ? 'Duplo clique pra renomear' : undefined} onDoubleClick={() => podeEditar && setRenomeando(true)}>{entrada.name}</h2>
          )}
          {!paginas.length ? (
            <p className="item-vazio">{podeEditar ? 'Nenhuma página ainda. Clique em Adicionar Página.' : 'Nenhuma página ainda.'}</p>
          ) : multiplas ? (
            paginas.filter((p) => batem.has(p.id)).map(secao)
          ) : (
            pagina && secao(pagina)
          )}
        </div>
      </div>
    </Janela>

      {criando && (
        <CriarPagina
          onCriar={(nome, tipo) => {
            const nova = novaPagina(nome, tipo)
            salvarPaginas([...paginas, nova])
            setAtual(nova.id)
            setCriando(false)
            setEditando(nova.id)
          }}
          onFechar={() => setCriando(false)}
        />
      )}

      {paginaEditada && (
        <EditarPagina
          key={paginaEditada.id}
          pagina={paginaEditada}
          onEnviarArquivo={onEnviarArquivo}
          onSalvar={(p) => {
            salvarPaginas(paginas.map((x) => (x.id === p.id ? p : x)))
            setEditando(null)
          }}
          onExcluir={() => {
            if (!window.confirm(`Excluir a página "${paginaEditada.nome}"?`)) return
            salvarPaginas(paginas.filter((x) => x.id !== paginaEditada.id))
            setEditando(null)
          }}
          onFechar={() => setEditando(null)}
        />
      )}
    </>
  )
}

function ConteudoDaPagina({ pagina: p }: { pagina: Pagina }) {
  const video = useRef<HTMLVideoElement>(null)
  const opcoes = p.video ?? VIDEO_PADRAO
  useEffect(() => {
    if (!video.current) return
    video.current.volume = opcoes.volume
    if (opcoes.inicio > 0) video.current.currentTime = opcoes.inicio
  }, [opcoes.volume, opcoes.inicio, p.url])

  if (p.tipo === 'texto') {
    return p.texto ? <div className="diario-texto" dangerouslySetInnerHTML={{ __html: sanitizarHtml(p.texto) }} /> : <p className="item-vazio">Página em branco.</p>
  }
  if (!p.url) return <p className="item-vazio">Nenhum arquivo ainda.</p>
  if (p.tipo === 'imagem') {
    return (
      <figure className="diario-imagem">
        <img src={p.url} alt={p.legenda || p.nome} />
        {p.legenda && <figcaption>{p.legenda}</figcaption>}
      </figure>
    )
  }
  if (p.tipo === 'pdf') return <iframe className="diario-pdf" src={p.url} title={p.nome} />
  const yt = embutirYoutube(p.url, opcoes)
  if (yt) return <iframe className="diario-video" src={yt} title={p.nome} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
  return <video ref={video} className="diario-video" src={p.url} controls={opcoes.controles} autoPlay={opcoes.auto} loop={opcoes.loop} muted={opcoes.auto} playsInline />
}

// Criar Página (print): Nome e Tipo.
function CriarPagina({ onCriar, onFechar }: { onCriar: (nome: string, tipo: TipoPagina) => void; onFechar: () => void }) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<TipoPagina>('texto')
  return (
    <div onPointerDown={(e) => e.stopPropagation()}>
      <Janela titulo="Criar Página" icone={faFileCirclePlus} largura={360} onFechar={onFechar}>
        <form className="janela-form" onSubmit={(e) => { e.preventDefault(); onCriar(nome, tipo) }}>
          <Campo rotulo="Nome">
            <input autoFocus value={nome} placeholder={TIPOS_PAGINA.find((t) => t.id === tipo)?.rotulo} aria-label="Nome" onChange={(e) => setNome(e.target.value)} />
          </Campo>
          <Campo rotulo="Tipo">
            <select value={tipo} aria-label="Tipo" onChange={(e) => setTipo(e.target.value as TipoPagina)}>
              {TIPOS_PAGINA.map((t) => <option key={t.id} value={t.id}>{t.rotulo}</option>)}
            </select>
          </Campo>
          <button type="submit" className="janela-botao janela-botao-destaque"><FontAwesomeIcon icon={faCheck} /> Criar Página</button>
        </form>
      </Janela>
    </div>
  )
}

// Editar Página: nome, mostrar o título e o que cada tipo pede.
function EditarPagina({ pagina, onEnviarArquivo, onSalvar, onExcluir, onFechar }: {
  pagina: Pagina
  onEnviarArquivo: (arquivo: File) => Promise<string | null>
  onSalvar: (p: Pagina) => void
  onExcluir: () => void
  onFechar: () => void
}) {
  const [p, setP] = useState<Pagina>(pagina)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const arquivo = useRef<HTMLInputElement>(null)
  const v = p.video ?? VIDEO_PADRAO
  const aceita = p.tipo === 'imagem' ? 'image/*' : p.tipo === 'pdf' ? 'application/pdf,.pdf' : 'video/*'

  async function enviar(f: File) {
    setEnviando(true)
    setErro(null)
    const url = await onEnviarArquivo(f)
    setEnviando(false)
    if (url) setP((x) => ({ ...x, url }))
    else setErro('Não deu pra enviar o arquivo.')
  }

  return (
    <div onPointerDown={(e) => e.stopPropagation()}>
      <Janela titulo={`Editar Página: ${pagina.nome}`} icone={faFeatherPointed} largura={p.tipo === 'texto' ? 640 : 480} onFechar={onFechar}>
        <form className="janela-form" onSubmit={(e) => { e.preventDefault(); onSalvar({ ...p, nome: p.nome.trim() || pagina.nome }) }}>
          <Campo rotulo="Nome">
            <input value={p.nome} aria-label="Nome da página" onChange={(e) => setP({ ...p, nome: e.target.value })} />
          </Campo>
          <label className="janela-check">
            <input type="checkbox" checked={p.mostrarTitulo} onChange={(e) => setP({ ...p, mostrarTitulo: e.target.checked })} />
            Exibir Título
          </label>

          {p.tipo === 'texto' && <EditorTexto valor={p.texto ?? ''} rotulo="Texto da página" onMudar={(h) => setP((x) => ({ ...x, texto: h }))} />}

          {p.tipo !== 'texto' && (
            <Campo rotulo={p.tipo === 'video' ? 'Caminho (arquivo ou link do YouTube)' : 'Arquivo'} dica={p.tipo === 'video' ? 'Cole o link do YouTube ou envie um vídeo.' : 'Envie o arquivo ou cole um link.'}>
              <div className="diario-arquivo">
                <input value={p.url ?? ''} placeholder="https://…" aria-label="Link do arquivo" onChange={(e) => setP({ ...p, url: e.target.value.trim() || undefined })} />
                <button type="button" className="janela-botao" disabled={enviando} title="Enviar arquivo" onClick={() => arquivo.current?.click()}>
                  <FontAwesomeIcon icon={faUpload} /> {enviando ? 'Enviando…' : 'Enviar'}
                </button>
                <input ref={arquivo} type="file" hidden accept={aceita} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) enviar(f) }} />
              </div>
            </Campo>
          )}
          {erro && <p className="janela-erro">{erro}</p>}

          {p.tipo === 'imagem' && (
            <Campo rotulo="Legenda">
              <input value={p.legenda ?? ''} aria-label="Legenda" onChange={(e) => setP({ ...p, legenda: e.target.value })} />
            </Campo>
          )}

          {p.tipo === 'video' && (
            <>
              <label className="janela-check"><input type="checkbox" checked={v.controles} onChange={(e) => setP({ ...p, video: { ...v, controles: e.target.checked } })} /> Mostrar Controles</label>
              <label className="janela-check"><input type="checkbox" checked={v.auto} onChange={(e) => setP({ ...p, video: { ...v, auto: e.target.checked } })} /> Auto-Reproduzir (começa sem som)</label>
              <label className="janela-check"><input type="checkbox" checked={v.loop} onChange={(e) => setP({ ...p, video: { ...v, loop: e.target.checked } })} /> Loop</label>
              <Campo rotulo="Volume">
                <Deslizante rotulo="Volume" valor={v.volume} min={0} max={1} onMudar={(x) => setP({ ...p, video: { ...v, volume: x } })} />
              </Campo>
              <Campo rotulo="Tempo de Início (segundos)">
                <input type="number" min={0} value={v.inicio} aria-label="Tempo de Início" onChange={(e) => setP({ ...p, video: { ...v, inicio: Math.max(0, Number(e.target.value) || 0) } })} />
              </Campo>
            </>
          )}

          <div className="diario-editar-acoes">
            <button type="button" className="janela-botao janela-botao-perigo" onClick={onExcluir}><FontAwesomeIcon icon={faTrash} /> Excluir Página</button>
            <button type="submit" className="janela-botao janela-botao-destaque"><FontAwesomeIcon icon={faCheck} /> Salvar Página</button>
          </div>
        </form>
      </Janela>
    </div>
  )
}
