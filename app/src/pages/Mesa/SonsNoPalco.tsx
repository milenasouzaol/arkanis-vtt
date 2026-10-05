import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faCaretRight, faCheck, faFileAudio, faFloppyDisk, faPalette, faRotateLeft, faTrash, faVolumeHigh, faXmark } from '@fortawesome/free-solid-svg-icons'
import Janela, { Campo, Deslizante } from './Janela'
import type { Cena } from './cenas'
import { caixaDoArrasto } from './desenhos'
import { PADRAO_SOM, porcentagemNoPonto, volumeParaOuvintes, type SomAmbiente } from './sons'
import { enviarSom, useTocarSons, type useSons } from './useSons'
import { useVolumesDoUsuario } from './volumesDoUsuario'
import { soltouNosPosicionaveis } from './PainelPosicionaveis'
import { volumeFinal } from './playlists'

type Ponto = { x: number; y: number }
type Sons = ReturnType<typeof useSons>

// Controles de Som Ambiente da barra esquerda (KAN-52, spec 12.13 + prints do Foundry da Millie).
export const FERRAMENTAS_SOM = ['som-selecionar', 'som-desenhar', 'som-previsualizar'] as const

type Gesto =
  | { tipo: 'area'; inicio: Ponto }
  | { tipo: 'mover'; inicio: Ponto; origem: Record<string, Ponto>; dx: number; dy: number }
  | { tipo: 'caixa'; inicio: Ponto; somar: boolean }

type Formulario = { editando?: SomAmbiente; caixa: { x: number; y: number; width: number; height: number }; name: string; url: string; volume: number; suavizar: boolean; escondido: boolean }

export function useSomNoPalco({ cena, ferramenta, userId, souMestre, sons, pontoNoMapa, escala, ouvintes, pedidoPaleta, pedidoLimpar, onGuardar }: {
  cena: Cena | null
  ferramenta: string
  userId: string
  souMestre: boolean
  sons: Sons
  pontoNoMapa: (x: number, y: number) => Ponto
  escala: number
  ouvintes: Ponto[] // centro dos tokens de quem está olhando (os seus, ou os selecionados, no mestre)
  pedidoPaleta: number
  pedidoLimpar: number
  onGuardar?: (sons: SomAmbiente[]) => void // soltou em cima dos Posicionáveis (12.6)
}) {
  const [padrao, setPadrao] = useState(PADRAO_SOM)
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [previa, setPrevia] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [caixa, setCaixa] = useState<{ a: Ponto; b: Ponto } | null>(null)
  const [ouvindoEm, setOuvindoEm] = useState<Ponto | null>(null)
  const [paleta, setPaleta] = useState(false)
  const [limpando, setLimpando] = useState(false)
  const [form, setForm] = useState<Formulario | null>(null)
  const gesto = useRef<Gesto | null>(null)

  const ativo = souMestre && (FERRAMENTAS_SOM as readonly string[]).includes(ferramenta)

  useEffect(() => { if (pedidoPaleta && souMestre) setPaleta(true) }, [pedidoPaleta, souMestre])
  useEffect(() => { if (pedidoLimpar && souMestre) setLimpando(true) }, [pedidoLimpar, souMestre])
  useEffect(() => {
    setSelecionados([])
    setOuvindoEm(null)
  }, [cena?.id, ferramenta])

  // Pré-visualizar: o mestre ouve como se o token estivesse onde está o mouse.
  const pontos = ferramenta === 'som-previsualizar' && ouvindoEm ? [ouvindoEm] : ouvintes
  // Som que não pôde tocar (vídeo do YouTube bloqueado…): o mestre vê o motivo na área.
  // O controle "Ambiente" de cada pessoa (Lista de Reprodução) também vale pro Som Ambiente.
  const meusVolumes = useVolumesDoUsuario()
  const erros = useTocarSons(sons.sons.map((s) => ({ id: s.id, url: s.url, volume: volumeFinal(volumeParaOuvintes(s, pontos, souMestre), meusVolumes.ambiente) })))

  function abrirFormulario(s: SomAmbiente | null, c?: Formulario['caixa']) {
    setForm(s
      ? { editando: s, caixa: s, name: s.name ?? '', url: s.url, volume: s.volume, suavizar: s.suavizar, escondido: s.escondido }
      : { caixa: c!, name: `Som Ambiente (${sons.sons.length + 1})`, url: '', ...padrao })
  }

  function aoApertar(e: React.PointerEvent<HTMLDivElement>): boolean {
    if (!ativo || e.button !== 0 || !cena) return false
    const p = pontoNoMapa(e.clientX, e.clientY)
    if (ferramenta === 'som-desenhar') gesto.current = { tipo: 'area', inicio: p }
    else if (ferramenta === 'som-selecionar') {
      if (!e.shiftKey) setSelecionados([])
      gesto.current = { tipo: 'caixa', inicio: p, somar: e.shiftKey }
    } else return true
    e.currentTarget.setPointerCapture(e.pointerId)
    return true
  }

  function aoMover(e: React.PointerEvent): void {
    if (!ativo) return
    const p = pontoNoMapa(e.clientX, e.clientY)
    if (ferramenta === 'som-previsualizar') setOuvindoEm(p)
    const g = gesto.current
    if (!g) return
    if (g.tipo === 'area') setPrevia(caixaDoArrasto(g.inicio, p))
    else if (g.tipo === 'caixa') setCaixa({ a: g.inicio, b: p })
    else {
      g.dx = p.x - g.inicio.x
      g.dy = p.y - g.inicio.y
      for (const [id, o] of Object.entries(g.origem)) sons.alterar(id, { x: o.x + g.dx, y: o.y + g.dy }, false)
    }
  }

  function aoSoltar(e?: React.PointerEvent): boolean {
    const g = gesto.current
    gesto.current = null
    // Sem gesto meu (ex.: arrastar o mapa com o botão direito): deixa o palco terminar o dele.
    if (!g) return false
    const p = e ? pontoNoMapa(e.clientX, e.clientY) : null
    setPrevia(null)
    if (g.tipo === 'area' && p) {
      const c = caixaDoArrasto(g.inicio, p)
      if (c.width > 10 && c.height > 10) abrirFormulario(null, c)
    } else if (g.tipo === 'mover') {
      // Arrastou pra aba Posicionáveis: guarda uma cópia lá e o som volta pro lugar.
      if (onGuardar && soltouNosPosicionaveis(e)) {
        for (const [id, o] of Object.entries(g.origem)) sons.alterar(id, { x: o.x, y: o.y }, false)
        onGuardar(sons.sons.filter((x) => x.id in g.origem))
      } else if (g.dx || g.dy) for (const [id, o] of Object.entries(g.origem)) sons.alterar(id, { x: o.x + g.dx, y: o.y + g.dy })
    } else if (g.tipo === 'caixa') {
      const c = caixa
      setCaixa(null)
      if (c) {
        const x1 = Math.min(c.a.x, c.b.x), x2 = Math.max(c.a.x, c.b.x), y1 = Math.min(c.a.y, c.b.y), y2 = Math.max(c.a.y, c.b.y)
        const pegos = sons.sons.filter((s) => s.x < x2 && s.x + s.width > x1 && s.y < y2 && s.y + s.height > y1).map((s) => s.id)
        setSelecionados((atual) => (g.somar ? [...new Set([...atual, ...pegos])] : pegos))
      }
    }
    return true
  }

  function pegarSom(e: React.PointerEvent, s: SomAmbiente) {
    if (ferramenta !== 'som-selecionar' || e.button !== 0) return
    e.stopPropagation()
    let sel = selecionados
    if (e.shiftKey) sel = sel.includes(s.id) ? sel.filter((x) => x !== s.id) : [...sel, s.id]
    else if (!sel.includes(s.id)) sel = [s.id]
    setSelecionados(sel)
    gesto.current = {
      tipo: 'mover', inicio: pontoNoMapa(e.clientX, e.clientY), dx: 0, dy: 0,
      origem: Object.fromEntries(sons.sons.filter((x) => sel.includes(x.id)).map((x) => [x.id, { x: x.x, y: x.y }])),
    }
    ;(e.currentTarget as Element).closest('.mesa-palco')?.setPointerCapture(e.pointerId)
  }

  // Clique direito num som: liga/desliga (spec 12.13).
  function aoMenu(e: React.MouseEvent): boolean {
    if (!ativo) return false
    e.preventDefault()
    const p = pontoNoMapa(e.clientX, e.clientY)
    const s = [...sons.sons].reverse().find((x) => p.x >= x.x && p.x <= x.x + x.width && p.y >= x.y && p.y <= x.y + x.height)
    if (s) sons.alterar(s.id, { ligado: !s.ligado })
    return true
  }

  function aoDuploClique(): boolean {
    if (!ativo) return false
    const s = selecionados.length === 1 ? sons.sons.find((x) => x.id === selecionados[0]) : null
    if (s) abrirFormulario(s)
    return true
  }

  function aoTeclar(e: KeyboardEvent): boolean {
    if (!ativo) return false
    if ((e.key === 'Delete' || e.key === 'Backspace') && selecionados.length) {
      sons.excluir(selecionados)
      setSelecionados([])
      return true
    }
    if (e.key === 'Escape' && selecionados.length) {
      setSelecionados([])
      return true
    }
    return false
  }

  // Mudar a paleta com sons selecionados muda eles também.
  function mudarPadrao(c: Partial<typeof PADRAO_SOM>) {
    const novo = { ...padrao, ...c }
    setPadrao(novo)
    for (const id of selecionados) sons.alterar(id, c)
  }

  const px = 1 / escala
  const camada = souMestre && cena && (ativo || ferramenta.startsWith('som')) ? (
    <svg className={`mesa-sons${ferramenta === 'som-selecionar' ? ' selecionando' : ''}`} aria-hidden>
      {sons.sons.map((s) => {
        const sel = selecionados.includes(s.id)
        return (
          <g key={s.id} className={`mesa-som${s.ligado ? '' : ' desligado'}${s.escondido ? ' escondido' : ''}`} onPointerDown={(e) => pegarSom(e, s)}>
            <rect x={s.x} y={s.y} width={s.width} height={s.height} strokeWidth={(sel ? 2.5 : 1.5) * px} strokeDasharray={s.ligado ? undefined : `${8 * px} ${6 * px}`} />
            <circle cx={s.x + s.width / 2} cy={s.y + s.height / 2} r={5 * px} />
            <text x={s.x + s.width / 2} y={s.y + s.height / 2 - 12 * px} fontSize={14 * px}>
              {s.name || 'Som Ambiente'}{s.ligado ? '' : ' (desligado)'}{erros[s.id] ? ` — não toca: ${erros[s.id]}` : ''}
            </text>
          </g>
        )
      })}
      {/* Pré-visualizar: quanto do som chega onde está o mouse (100 no centro … 1 na borda). */}
      {ferramenta === 'som-previsualizar' && ouvindoEm && (() => {
        const pct = sons.sons.filter((x) => x.ligado).reduce((m, x) => Math.max(m, porcentagemNoPonto(x, ouvindoEm)), 0)
        return (
          <text className="mesa-som-porcentagem" x={ouvindoEm.x + 14 * px} y={ouvindoEm.y - 14 * px} fontSize={15 * px}>
            {pct ? `Volume aqui: ${pct}%` : 'Fora das áreas de som'}
          </text>
        )
      })()}
      {previa && <rect className="mesa-som-previa" x={previa.x} y={previa.y} width={previa.width} height={previa.height} strokeWidth={1.5 * px} />}
      {caixa && (
        <rect
          x={Math.min(caixa.a.x, caixa.b.x)} y={Math.min(caixa.a.y, caixa.b.y)} width={Math.abs(caixa.b.x - caixa.a.x)} height={Math.abs(caixa.b.y - caixa.a.y)}
          fill="rgba(240,240,242,0.06)" stroke="rgba(240,240,242,0.5)" strokeWidth={1.5 * px} strokeDasharray={`${6 * px} ${4 * px}`}
        />
      )}
    </svg>
  ) : null

  const janelas = (
    <>
      {form && cena && (
        <FormularioSom
          form={form}
          userId={userId}
          onMudar={setForm}
          onSalvar={async () => {
            const campos = { name: form.name.trim() || null, url: form.url.trim(), volume: form.volume, suavizar: form.suavizar, escondido: form.escondido }
            if (form.editando) {
              await sons.alterar(form.editando.id, campos)
              setForm(null)
              return null
            }
            const erro = await sons.criar({ scene_id: cena.id, campaign_id: cena.campaign_id, ...form.caixa, ...campos, ligado: true })
            if (!erro) setForm(null)
            return erro
          }}
          onFechar={() => setForm(null)}
        />
      )}

      {paleta && (
        <Janela titulo="Paleta Som Ambiente" icone={faPalette} largura={330} inicial={{ x: 110, y: 120 }} onFechar={() => setPaleta(false)}>
          <div className="janela-form paleta-desenho">
            <SecaoPaleta titulo="Volume">
              <Campo rotulo="Volume Máximo"><Deslizante rotulo="Volume Máximo" min={0} max={1} valor={padrao.volume} onMudar={(v) => mudarPadrao({ volume: v })} /></Campo>
              <Campo rotulo="Suavização de Volume"><input type="checkbox" checked={padrao.suavizar} aria-label="Suavização de Volume" onChange={(e) => mudarPadrao({ suavizar: e.target.checked })} /></Campo>
            </SecaoPaleta>
            <SecaoPaleta titulo="Ativação">
              <Campo rotulo="Escondido" dica="Escondido: os jogadores não ouvem (só o mestre).">
                <input type="checkbox" checked={padrao.escondido} aria-label="Escondido" onChange={(e) => mudarPadrao({ escondido: e.target.checked })} />
              </Campo>
            </SecaoPaleta>
            <button type="button" className="janela-botao" onClick={() => mudarPadrao(PADRAO_SOM)}><FontAwesomeIcon icon={faRotateLeft} /> Redefinir</button>
          </div>
        </Janela>
      )}

      {limpando && (
        <Janela titulo="Limpar todos os Objetos" icone={faTrash} largura={400} onFechar={() => setLimpando(false)}>
          <p className="janela-pergunta">Excluir permanentemente todos os objetos de Som Ambiente visualizados?</p>
          <div className="janela-sim-nao">
            <button type="button" className="janela-botao" onClick={() => { sons.excluir(sons.sons.map((s) => s.id)); setSelecionados([]); setLimpando(false) }}>
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

  return { ativo, camada, janelas, aoApertar, aoMover, aoSoltar, aoDuploClique, aoTeclar, aoMenu }
}

function SecaoPaleta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const [aberto, setAberto] = useState(true)
  return (
    <fieldset className="janela-grupo paleta-secao">
      <legend>
        <button type="button" className="paleta-secao-titulo" aria-expanded={aberto} onClick={() => setAberto((a) => !a)}>
          <FontAwesomeIcon icon={aberto ? faCaretDown : faCaretRight} /> {titulo}
        </button>
      </legend>
      {aberto && children}
    </fieldset>
  )
}

// Criar / Editar Som Ambiente (print da Millie): Nome, Fonte e Volume.
function FormularioSom({ form, userId, onMudar, onSalvar, onFechar }: {
  form: Formulario
  userId: string
  onMudar: (f: Formulario) => void
  onSalvar: () => Promise<string | null>
  onFechar: () => void
}) {
  const [aviso, setAviso] = useState<string | null>(null)
  const arquivo = useRef<HTMLInputElement>(null)
  return (
    <Janela titulo={form.editando ? 'Editar Som Ambiente' : 'Criar Som Ambiente'} icone={faVolumeHigh} largura={520} inicial={{ x: Math.max(16, window.innerWidth - 600), y: 50 }} onFechar={onFechar}>
      <form
        className="janela-form"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!form.url.trim()) {
            setAviso('Escolha o arquivo de áudio ou cole o link dele.')
            return
          }
          const erro = await onSalvar()
          if (erro) setAviso(erro)
        }}
      >
        <Campo rotulo="Nome" dica="Um nome opcional para ajudar a identificar o som.">
          <input value={form.name} aria-label="Nome" onChange={(e) => onMudar({ ...form, name: e.target.value })} />
        </Campo>
        <fieldset className="janela-grupo">
          <legend>Fonte</legend>
          <Campo rotulo="Caminho do Arquivo de Origem" dica="Um arquivo de áudio (mp3, ogg, wav…), o link direto dele ou um link do YouTube. Toca pra quem tiver token dentro da área.">
            <div className="janela-cor">
              <input value={form.url} placeholder="Link do YouTube ou do áudio, ou escolha o arquivo" aria-label="Caminho do Arquivo de Origem" onChange={(e) => onMudar({ ...form, url: e.target.value })} />
              <button type="button" className="combate-icone" aria-label="Escolher arquivo de áudio" title="Escolher arquivo" onClick={() => arquivo.current?.click()}>
                <FontAwesomeIcon icon={faFileAudio} />
              </button>
              <input
                ref={arquivo}
                type="file"
                accept="audio/*"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  setAviso('Enviando áudio…')
                  const url = await enviarSom(userId, f)
                  setAviso(url ? null : 'Não deu pra enviar o áudio.')
                  if (url) onMudar({ ...form, url, name: form.name || f.name.replace(/\.[^.]+$/, '') })
                }}
              />
            </div>
          </Campo>
        </fieldset>
        <fieldset className="janela-grupo">
          <legend>Volume</legend>
          <Campo rotulo="Volume Máximo" dica="O volume do som no centro da área (ou em toda ela, sem suavização).">
            <Deslizante rotulo="Volume Máximo" min={0} max={1} valor={form.volume} onMudar={(v) => onMudar({ ...form, volume: v })} />
          </Campo>
          <Campo rotulo="Suavização de Volume" dica="O volume vai baixando conforme o token se afasta do centro.">
            <input type="checkbox" checked={form.suavizar} aria-label="Suavização de Volume" onChange={(e) => onMudar({ ...form, suavizar: e.target.checked })} />
          </Campo>
          <Campo rotulo="Escondido" dica="Os jogadores não ouvem; só o mestre.">
            <input type="checkbox" checked={form.escondido} aria-label="Escondido" onChange={(e) => onMudar({ ...form, escondido: e.target.checked })} />
          </Campo>
        </fieldset>
        {aviso && <p className="janela-aviso">{aviso}</p>}
        <button type="submit" className="janela-botao"><FontAwesomeIcon icon={faFloppyDisk} /> {form.editando ? 'Atualizar Som Ambiente' : 'Criar Som Ambiente'}</button>
      </form>
    </Janela>
  )
}
