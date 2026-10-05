import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faFont, faPalette, faRotateLeft, faTrash, faXmark, faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons'
import Janela, { Campo, CampoCor, CampoNumero, Deslizante } from './Janela'
import type { Cena } from './cenas'
import {
  caixaDoArrasto, caixaDosPontos, caminhoDoDesenho, ESTILO_PADRAO, estiloCompleto, grandeOSuficiente, simplificar,
  type Desenho, type EstiloDesenho, type TipoDesenho,
} from './desenhos'
import type { useDesenhos } from './useDesenhos'

type Ponto = { x: number; y: number }
type Desenhos = ReturnType<typeof useDesenhos>

// Ferramentas de Desenho da barra esquerda (KAN-52, spec 12.13 + prints do Foundry da Millie).
export const FERRAMENTAS_DESENHO = ['desenho-selecionar', 'retangulo', 'elipse', 'poligono', 'livre', 'texto'] as const
const FORMAS: Record<string, TipoDesenho> = { retangulo: 'retangulo', elipse: 'elipse', poligono: 'poligono', livre: 'livre', texto: 'texto' }

const CHAVE_ESTILO = 'arkanis-estilo-desenho'

function estiloSalvo(): EstiloDesenho {
  try {
    return estiloCompleto(JSON.parse(localStorage.getItem(CHAVE_ESTILO) ?? 'null'))
  } catch {
    return ESTILO_PADRAO
  }
}

type Gesto =
  | { tipo: 'forma'; forma: TipoDesenho; inicio: Ponto }
  | { tipo: 'livre'; pontos: Ponto[] }
  | { tipo: 'mover'; inicio: Ponto; origem: Record<string, Ponto>; dx: number; dy: number }
  | { tipo: 'caixa'; inicio: Ponto; somar: boolean }

// Toda a parte de desenhar fica aqui; o palco só repassa os eventos do mouse e do teclado.
export function useDesenhoNoPalco({ cena, ferramenta, userId, souMestre, des, pontoNoMapa, escala, pedidoPaleta, pedidoLimpar }: {
  cena: Cena | null
  ferramenta: string
  userId: string
  souMestre: boolean
  des: Desenhos
  pontoNoMapa: (x: number, y: number) => Ponto
  escala: number
  pedidoPaleta: number // muda quando clicam em Paleta na barra
  pedidoLimpar: number // muda quando clicam em Limpar Desenhos
}) {
  const [estilo, setEstilo] = useState<EstiloDesenho>(estiloSalvo)
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [previa, setPrevia] = useState<Partial<Desenho> | null>(null)
  const [poligono, setPoligono] = useState<{ pontos: Ponto[]; atual: Ponto } | null>(null)
  const [caixa, setCaixa] = useState<{ a: Ponto; b: Ponto } | null>(null)
  const [paleta, setPaleta] = useState(false)
  const [limpando, setLimpando] = useState(false)
  const [texto, setTexto] = useState<{ caixa: { x: number; y: number; width: number; height: number }; editando?: Desenho; valor: string } | null>(null)
  const gesto = useRef<Gesto | null>(null)

  const ativo = (FERRAMENTAS_DESENHO as readonly string[]).includes(ferramenta)
  const podeMexer = (d: Desenho) => souMestre || d.author_id === userId

  useEffect(() => { if (pedidoPaleta) setPaleta(true) }, [pedidoPaleta])
  useEffect(() => { if (pedidoLimpar) setLimpando(true) }, [pedidoLimpar])
  useEffect(() => {
    setSelecionados([])
    setPoligono(null)
    setPrevia(null)
  }, [cena?.id, ferramenta])
  // Desenhando polígono: Esc cancela de qualquer lugar (até com o cursor no chat).
  useEffect(() => {
    if (!poligono) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setPoligono(null)
    window.addEventListener('keydown', esc, true)
    return () => window.removeEventListener('keydown', esc, true)
  }, [poligono])
  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_ESTILO, JSON.stringify(estilo))
    } catch {
      // sem armazenamento: o estilo vale só nesta aba
    }
  }, [estilo])

  function novo(campos: Pick<Desenho, 'tipo' | 'x' | 'y' | 'width' | 'height'> & Partial<Desenho>) {
    if (!cena) return
    des.criar({ scene_id: cena.id, campaign_id: cena.campaign_id, author_id: userId, rotation: 0, pontos: [], texto: null, estilo, ...campos })
  }

  // Mudar a paleta com desenhos selecionados muda eles também.
  function mudarEstilo(e: EstiloDesenho) {
    setEstilo(e)
    for (const id of selecionados) {
      const d = des.desenhos.find((x) => x.id === id)
      if (d && podeMexer(d)) des.alterar(id, { estilo: e })
    }
  }

  function terminarPoligono() {
    if (!poligono || poligono.pontos.length < 2) {
      setPoligono(null)
      return
    }
    const c = caixaDosPontos(poligono.pontos)
    if (grandeOSuficiente(c)) novo({ tipo: 'poligono', x: c.x, y: c.y, width: c.width, height: c.height, pontos: c.pontos })
    setPoligono(null)
  }

  // ---- eventos repassados pelo palco (true = já cuidei)

  function aoApertar(e: React.PointerEvent<HTMLDivElement>): boolean {
    if (!ativo || e.button !== 0 || !cena) return false
    const p = pontoNoMapa(e.clientX, e.clientY)
    if (ferramenta === 'desenho-selecionar') {
      if (!e.shiftKey) setSelecionados([])
      gesto.current = { tipo: 'caixa', inicio: p, somar: e.shiftKey }
    } else if (ferramenta === 'poligono') {
      // Clique + arraste começa; cada clique depois adiciona um ponto; clicar no primeiro ponto fecha.
      const primeiro = poligono?.pontos[0]
      if (poligono && primeiro && poligono.pontos.length >= 3 && Math.hypot(p.x - primeiro.x, p.y - primeiro.y) < 14 / Math.max(escala, 0.1)) terminarPoligono()
      else if (poligono) setPoligono({ pontos: [...poligono.pontos, p], atual: p })
      else {
        setPoligono({ pontos: [p], atual: p })
        gesto.current = { tipo: 'forma', forma: 'poligono', inicio: p }
      }
    } else if (ferramenta === 'livre') {
      gesto.current = { tipo: 'livre', pontos: [p] }
    } else {
      gesto.current = { tipo: 'forma', forma: FORMAS[ferramenta], inicio: p }
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    return true
  }

  function aoMover(e: React.PointerEvent): void {
    if (!ativo) return
    const p = pontoNoMapa(e.clientX, e.clientY)
    if (poligono) setPoligono({ ...poligono, atual: p })
    const g = gesto.current
    if (!g) return
    if (g.tipo === 'forma' && g.forma !== 'poligono') {
      setPrevia({ tipo: g.forma, ...caixaDoArrasto(g.inicio, p, e.altKey), estilo, pontos: [] })
    } else if (g.tipo === 'livre') {
      g.pontos.push(p)
      const c = caixaDosPontos(g.pontos)
      setPrevia({ tipo: 'livre', x: c.x, y: c.y, width: c.width, height: c.height, pontos: c.pontos, estilo })
    } else if (g.tipo === 'mover') {
      g.dx = p.x - g.inicio.x
      g.dy = p.y - g.inicio.y
      for (const [id, o] of Object.entries(g.origem)) des.alterar(id, { x: o.x + g.dx, y: o.y + g.dy }, false)
    } else if (g.tipo === 'caixa') {
      setCaixa({ a: g.inicio, b: p })
    }
  }

  function aoSoltar(e?: React.PointerEvent): boolean {
    const g = gesto.current
    gesto.current = null
    if (!g) return ativo
    const p = e ? pontoNoMapa(e.clientX, e.clientY) : null
    setPrevia(null)
    if (g.tipo === 'forma') {
      if (g.forma === 'poligono') {
        // O arraste inicial vira o primeiro lado.
        if (p && poligono && Math.hypot(p.x - g.inicio.x, p.y - g.inicio.y) > 4) setPoligono({ pontos: [...poligono.pontos, p], atual: p })
        return true
      }
      if (!p) return true
      const c = caixaDoArrasto(g.inicio, p, !!e?.altKey)
      if (g.forma === 'texto') {
        setTexto({ caixa: grandeOSuficiente(c, 20) ? c : { ...c, width: 300, height: estilo.texto.tamanho * 1.4 }, valor: '' })
        return true
      }
      if (grandeOSuficiente(c)) novo({ tipo: g.forma, ...c })
    } else if (g.tipo === 'livre') {
      const c = caixaDosPontos(simplificar(g.pontos, 3 / Math.max(escala, 0.1)))
      if (grandeOSuficiente(c)) novo({ tipo: 'livre', x: c.x, y: c.y, width: c.width, height: c.height, pontos: c.pontos })
    } else if (g.tipo === 'mover') {
      if (g.dx || g.dy) for (const [id, o] of Object.entries(g.origem)) des.alterar(id, { x: o.x + g.dx, y: o.y + g.dy })
    } else if (g.tipo === 'caixa') {
      const c = caixa
      setCaixa(null)
      if (c) {
        const x1 = Math.min(c.a.x, c.b.x), x2 = Math.max(c.a.x, c.b.x), y1 = Math.min(c.a.y, c.b.y), y2 = Math.max(c.a.y, c.b.y)
        const pegos = des.desenhos.filter((d) => d.x < x2 && d.x + d.width > x1 && d.y < y2 && d.y + d.height > y1).map((d) => d.id)
        setSelecionados((atual) => (g.somar ? [...new Set([...atual, ...pegos])] : pegos))
      }
    }
    return true
  }

  // Clique num desenho (ferramenta Selecionar Desenhos): seleciona e começa a mover.
  function pegarDesenho(e: React.PointerEvent, d: Desenho) {
    if (ferramenta !== 'desenho-selecionar' || e.button !== 0) return
    e.stopPropagation()
    let sel = selecionados
    if (e.shiftKey) sel = sel.includes(d.id) ? sel.filter((x) => x !== d.id) : [...sel, d.id]
    else if (!sel.includes(d.id)) sel = [d.id]
    setSelecionados(sel)
    const movidos = des.desenhos.filter((x) => sel.includes(x.id) && podeMexer(x))
    if (!movidos.length) return
    gesto.current = { tipo: 'mover', inicio: pontoNoMapa(e.clientX, e.clientY), origem: Object.fromEntries(movidos.map((x) => [x.id, { x: x.x, y: x.y }])), dx: 0, dy: 0 }
    ;(e.currentTarget as Element).closest('.mesa-palco')?.setPointerCapture(e.pointerId)
  }

  // Botão direito enquanto desenha o polígono: termina (e não abre o menu).
  function aoMenu(e: React.MouseEvent): boolean {
    if (!poligono) return false
    e.preventDefault()
    terminarPoligono()
    return true
  }

  function aoDuploClique(): boolean {
    if (!ativo) return false
    if (poligono) {
      terminarPoligono()
      return true
    }
    // Editar: texto abre o texto; o resto abre a paleta (que muda o selecionado).
    const d = selecionados.length === 1 ? des.desenhos.find((x) => x.id === selecionados[0]) : null
    if (d && podeMexer(d)) {
      if (d.tipo === 'texto') setTexto({ caixa: d, editando: d, valor: d.texto ?? '' })
      else {
        setEstilo(d.estilo)
        setPaleta(true)
      }
    }
    return true
  }

  function aoTeclar(e: KeyboardEvent): boolean {
    if (!ativo) return false
    if (e.key === 'Escape' && (poligono || selecionados.length)) {
      setPoligono(null)
      setSelecionados([])
      return true
    }
    if (e.key === 'Enter' && poligono) {
      terminarPoligono()
      return true
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && selecionados.length) {
      des.excluir(des.desenhos.filter((d) => selecionados.includes(d.id) && podeMexer(d)).map((d) => d.id))
      setSelecionados([])
      return true
    }
    return false
  }

  // Shift ou Ctrl + rodinha gira os desenhos selecionados.
  function aoRodar(e: WheelEvent): boolean {
    if (!ativo || !(e.shiftKey || e.ctrlKey) || !selecionados.length) return false
    const passo = e.deltaY < 0 ? -15 : 15
    for (const id of selecionados) {
      const d = des.desenhos.find((x) => x.id === id)
      if (d && podeMexer(d)) des.alterar(id, { rotation: (((d.rotation + passo) % 360) + 360) % 360 })
    }
    return true
  }

  // ---- desenho na tela

  const px = 1 / escala
  const forma = (d: Partial<Desenho> & Pick<Desenho, 'tipo'>, chave: string, extra?: { selecionado?: boolean; onPointerDown?: (e: React.PointerEvent) => void }) => {
    const s = estiloCompleto(d.estilo)
    const w = d.width ?? 0
    const h = d.height ?? 0
    const giro = d.rotation ? `rotate(${d.rotation} ${w / 2} ${h / 2})` : ''
    return (
      <g key={chave} transform={`translate(${d.x ?? 0} ${d.y ?? 0}) ${giro}`} onPointerDown={extra?.onPointerDown} className={extra?.onPointerDown ? 'mesa-desenho-clicavel' : undefined}>
        {d.tipo === 'texto' ? (
          <foreignObject width={Math.max(w, 1)} height={Math.max(h, 1)}>
            <div className="mesa-desenho-texto" style={{ fontFamily: s.texto.fonte, fontSize: s.texto.tamanho, color: s.texto.cor, opacity: s.texto.opacidade }}>{d.texto}</div>
          </foreignObject>
        ) : (
          <path
            d={caminhoDoDesenho({ tipo: d.tipo, width: w, height: h, pontos: d.pontos ?? [] })}
            fill={s.preenchimento.tipo === 'solido' && d.tipo !== 'livre' ? s.preenchimento.cor : 'none'}
            fillOpacity={s.preenchimento.opacidade}
            stroke={s.linha.largura > 0 ? s.linha.cor : 'none'}
            strokeOpacity={s.linha.opacidade}
            strokeWidth={s.linha.largura}
            strokeLinejoin="round"
            strokeLinecap="round"
            pointerEvents={ferramenta === 'desenho-selecionar' ? 'visiblePainted' : 'none'}
          />
        )}
        {/* área clicável invisível pra pegar o desenho pela caixa (texto e formas vazadas) */}
        {ferramenta === 'desenho-selecionar' && <rect width={Math.max(w, 1)} height={Math.max(h, 1)} fill="transparent" />}
        {extra?.selecionado && (
          <rect x={-4 * px} y={-4 * px} width={w + 8 * px} height={h + 8 * px} fill="none" stroke="rgba(240,240,242,0.6)" strokeWidth={1.5 * px} strokeDasharray={`${6 * px} ${4 * px}`} />
        )}
      </g>
    )
  }

  const camada = cena ? (
    <svg className={`mesa-desenhos${ferramenta === 'desenho-selecionar' ? ' selecionando' : ''}`} aria-hidden>
      {[...des.desenhos].sort((a, b) => a.sort - b.sort).map((d) => forma(d, d.id, { selecionado: selecionados.includes(d.id), onPointerDown: (e) => pegarDesenho(e, d) }))}
      {previa && forma(previa as Desenho, 'previa')}
      {poligono && (
        <polyline
          points={[...poligono.pontos, poligono.atual].map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none" stroke={estilo.linha.cor} strokeOpacity={estilo.linha.opacidade} strokeWidth={estilo.linha.largura} strokeLinejoin="round"
        />
      )}
      {caixa && (
        <rect
          x={Math.min(caixa.a.x, caixa.b.x)} y={Math.min(caixa.a.y, caixa.b.y)} width={Math.abs(caixa.b.x - caixa.a.x)} height={Math.abs(caixa.b.y - caixa.a.y)}
          fill="rgba(240,240,242,0.06)" stroke="rgba(240,240,242,0.5)" strokeWidth={1.5 * px} strokeDasharray={`${6 * px} ${4 * px}`}
        />
      )}
    </svg>
  ) : null

  const meus = des.desenhos.filter(podeMexer)

  const janelas = (
    <>
      {poligono && (
        <p className="mesa-desenho-aviso" role="status">
          <kbd>Clique</kbd> adiciona ponto · <kbd>Clique Duplo</kbd>, <kbd>Enter</kbd> ou <kbd>Botão Direito</kbd> termina · <kbd>Esc</kbd> cancela
        </p>
      )}
      {paleta && <PaletaDesenho estilo={estilo} onMudar={mudarEstilo} onFechar={() => setPaleta(false)} />}

      {texto && (
        <Janela titulo={texto.editando ? 'Editar Texto' : 'Desenhar Texto'} icone={faFont} largura={380} onFechar={() => setTexto(null)}>
          <form
            className="janela-form"
            onSubmit={(e) => {
              e.preventDefault()
              const v = texto.valor.trim()
              if (texto.editando) {
                if (v) des.alterar(texto.editando.id, { texto: v })
              } else if (v) novo({ tipo: 'texto', ...texto.caixa, texto: v })
              setTexto(null)
            }}
          >
            <textarea autoFocus rows={3} className="janela-texto" value={texto.valor} aria-label="Texto" onChange={(e) => setTexto({ ...texto, valor: e.target.value })} />
            <button type="submit" className="janela-botao"><FontAwesomeIcon icon={faCheck} /> Salvar</button>
          </form>
        </Janela>
      )}

      {limpando && (
        <Janela titulo="Limpar todos os Objetos" icone={faTrash} largura={400} onFechar={() => setLimpando(false)}>
          <p className="janela-pergunta">Excluir permanentemente todos os objetos de Desenho visualizados?</p>
          <div className="janela-sim-nao">
            <button type="button" className="janela-botao" onClick={() => { des.excluir(meus.map((d) => d.id)); setSelecionados([]); setLimpando(false) }}>
              <FontAwesomeIcon icon={faCheck} /> Sim
            </button>
            <button type="button" className="janela-botao janela-botao-destaque" onClick={() => setLimpando(false)}>
              <FontAwesomeIcon icon={faXmark} /> Não
            </button>
          </div>
        </Janela>
      )}
    </>
  )

  return { ativo, camada, janelas, aoApertar, aoMover, aoSoltar, aoDuploClique, aoTeclar, aoRodar, aoMenu }
}

const FONTES = ['Signika', 'Roboto', 'Roboto Slab', 'Amiri', 'Bruno Ace', 'Freehand', 'Barlow']

// Paleta Desenho (print da Millie): Linhas, Preencher e Texto, cada um abre e fecha, e Redefinir.
function PaletaDesenho({ estilo, onMudar, onFechar }: { estilo: EstiloDesenho; onMudar: (e: EstiloDesenho) => void; onFechar: () => void }) {
  const [aberto, setAberto] = useState<Record<string, boolean>>({ linha: true, preenchimento: false, texto: false })
  const secao = (id: string, titulo: string, conteudo: React.ReactNode) => (
    <fieldset className="janela-grupo paleta-secao">
      <legend>
        <button type="button" className="paleta-secao-titulo" aria-expanded={aberto[id]} onClick={() => setAberto((a) => ({ ...a, [id]: !a[id] }))}>
          <FontAwesomeIcon icon={aberto[id] ? faCaretDown : faCaretRight} /> {titulo}
        </button>
      </legend>
      {aberto[id] && conteudo}
    </fieldset>
  )
  const linha = (c: Partial<EstiloDesenho['linha']>) => onMudar({ ...estilo, linha: { ...estilo.linha, ...c } })
  const fundo = (c: Partial<EstiloDesenho['preenchimento']>) => onMudar({ ...estilo, preenchimento: { ...estilo.preenchimento, ...c } })
  const letra = (c: Partial<EstiloDesenho['texto']>) => onMudar({ ...estilo, texto: { ...estilo.texto, ...c } })
  return (
    <Janela titulo="Paleta Desenho" icone={faPalette} largura={340} inicial={{ x: 110, y: 120 }} onFechar={onFechar}>
      <div className="janela-form paleta-desenho">
        {secao('linha', 'Linhas', (
          <>
            <Campo rotulo="Largura da Linha (Pixels)"><CampoNumero className="janela-curto" rotulo="Largura da Linha" min={0} max={100} valor={estilo.linha.largura} onMudar={(v) => linha({ largura: v })} /></Campo>
            <Campo rotulo="Cor da Linha"><CampoCor rotulo="Cor da Linha" valor={estilo.linha.cor} onMudar={(v) => linha({ cor: v })} /></Campo>
            <Campo rotulo="Opacidade da Linha"><Deslizante rotulo="Opacidade da Linha" min={0} max={1} valor={estilo.linha.opacidade} onMudar={(v) => linha({ opacidade: v })} /></Campo>
          </>
        ))}
        {secao('preenchimento', 'Preencher', (
          <>
            <Campo rotulo="Tipo de Preenchimento">
              <select value={estilo.preenchimento.tipo} aria-label="Tipo de Preenchimento" onChange={(e) => fundo({ tipo: e.target.value as 'nenhum' | 'solido' })}>
                <option value="nenhum">Nenhum</option>
                <option value="solido">Sólido</option>
              </select>
            </Campo>
            <Campo rotulo="Cor do Preenchimento"><CampoCor rotulo="Cor do Preenchimento" valor={estilo.preenchimento.cor} onMudar={(v) => fundo({ cor: v })} /></Campo>
            <Campo rotulo="Opacidade do Preenchimento"><Deslizante rotulo="Opacidade do Preenchimento" min={0} max={1} valor={estilo.preenchimento.opacidade} onMudar={(v) => fundo({ opacidade: v })} /></Campo>
          </>
        ))}
        {secao('texto', 'Texto', (
          <>
            <Campo rotulo="Fonte">
              <select value={estilo.texto.fonte} aria-label="Fonte" onChange={(e) => letra({ fonte: e.target.value })}>
                {FONTES.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
              </select>
            </Campo>
            {/* Prévia: como a letra fica, na cor e opacidade escolhidas */}
            <p className="paleta-previa-fonte" style={{ fontFamily: estilo.texto.fonte, color: estilo.texto.cor, opacity: estilo.texto.opacidade }}>
              Aa Bb Cc 123
            </p>
            <Campo rotulo="Tamanho da Fonte"><CampoNumero className="janela-curto" rotulo="Tamanho da Fonte" min={6} max={400} valor={estilo.texto.tamanho} onMudar={(v) => letra({ tamanho: v })} /></Campo>
            <Campo rotulo="Cor do Texto"><CampoCor rotulo="Cor do Texto" valor={estilo.texto.cor} onMudar={(v) => letra({ cor: v })} /></Campo>
            <Campo rotulo="Opacidade do Texto"><Deslizante rotulo="Opacidade do Texto" min={0} max={1} valor={estilo.texto.opacidade} onMudar={(v) => letra({ opacidade: v })} /></Campo>
          </>
        ))}
        <button type="button" className="janela-botao" onClick={() => onMudar(ESTILO_PADRAO)}><FontAwesomeIcon icon={faRotateLeft} /> Redefinir</button>
      </div>
    </Janela>
  )
}
