import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAnglesLeft, faAnglesRight, faBackwardStep, faBook, faCalendarDays, faCalendarPlus, faCheck, faChevronLeft, faChevronRight, faCloud, faCloudBolt,
  faCloudRain, faEye, faEyeSlash, faForwardStep, faGear, faListUl, faMinus, faMoon, faPause, faPlay, faSmog, faSnowflake, faSun, faTemperatureHigh,
  faTrash, faWind, type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import Janela, { Campo } from './Janela'
import {
  alternarRodando, avancar, CLIMAS, climaDoDia, comAgora, dataDoDia, diaDaCampanha, diasDaSemana, estacaoDe, faseDaLua, gradeDoMes, gradienteDoDia,
  horaDaPosicao, irPara, irParaAmanhecer, irParaAnoitecer, medidas, mesVizinho, mexer, momento, nomeDaFase, nomeDoMes, periodo, posicaoNoDia,
  textoAno, textoData, textoHora, type Clima, type ConfigTempo, type Data,
} from './tempo'
import type { NotaCalendario, useCalendario } from './useCalendario'

export const ICONE_CLIMA: Record<Clima, IconDefinition> = {
  limpo: faSun, nublado: faCloud, chuva: faCloudRain, tempestade: faCloudBolt, neblina: faSmog, neve: faSnowflake, vento: faWind, calor: faTemperatureHigh,
}

const CHAVE_POSICAO = 'arkanis-calendario'

type Lembrado = { x: number; y: number; mes: boolean; minimizado: boolean }

function lerLembrado(): Lembrado {
  try {
    return { x: 72, y: 72, mes: false, minimizado: false, ...JSON.parse(localStorage.getItem(CHAVE_POSICAO) ?? '{}') }
  } catch {
    return { x: 72, y: 72, mes: false, minimizado: false }
  }
}

function lembrar(l: Lembrado) {
  try {
    localStorage.setItem(CHAVE_POSICAO, JSON.stringify(l))
  } catch {
    // sem armazenamento: vale até recarregar
  }
}

// Desenho da fase da lua (0 = nova, 0,5 = cheia).
export function Lua({ fase, tamanho = 14 }: { fase: number; tamanho?: number }) {
  const r = tamanho / 2 - 0.5
  const c = tamanho / 2
  const rx = Math.abs(r * Math.cos(2 * Math.PI * fase))
  const crescendo = fase < 0.5
  const borda = crescendo ? 1 : 0
  const curva = crescendo ? (fase < 0.25 ? 0 : 1) : fase < 0.75 ? 0 : 1
  const caminho = `M ${c} ${c - r} A ${r} ${r} 0 0 ${borda} ${c} ${c + r} A ${rx} ${r} 0 0 ${curva} ${c} ${c - r} Z`
  return (
    <svg className="cal-lua" width={tamanho} height={tamanho} viewBox={`0 0 ${tamanho} ${tamanho}`} role="img" aria-label={nomeDaFase(fase)}>
      <title>{nomeDaFase(fase)}</title>
      <circle cx={c} cy={c} r={r} className="cal-lua-sombra" />
      {Math.abs(fase - 0.5) < 0.02 ? <circle cx={c} cy={c} r={r} className="cal-lua-luz" /> : fase > 0.02 && fase < 0.98 && <path d={caminho} className="cal-lua-luz" />}
    </svg>
  )
}

const mesmaData = (a: Data, b: Data) => a.ano === b.ano && a.mes === b.mes && a.dia === b.dia

// Mini Calendar (referência da Millie, 07/10): janelinha arrastável com a data, a hora e a faixa do
// dia; um duplo clique na barra de cima abre o mês. Só o mestre mexe no tempo.
export default function Calendario({ tempo, souMestre, corDaMesa, userId, notas, onMudar, onConfigurar }: {
  tempo: ConfigTempo
  souMestre: boolean
  corDaMesa: string
  userId: string
  notas: ReturnType<typeof useCalendario>
  onMudar: (t: ConfigTempo) => void
  onConfigurar: () => void
}) {
  const [lembrado, setLembrado] = useState(lerLembrado)
  const [, setTique] = useState(0)
  // Faixa do dia sendo arrastada: mostra a hora nova antes de salvar.
  const [previa, setPrevia] = useState<number | null>(null)
  const [diaAberto, setDiaAberto] = useState<number | null>(null)
  const [acertarHora, setAcertarHora] = useState(false)
  const [vendo, setVendo] = useState<{ ano: number; mes: number } | null>(null)
  const arrasto = useRef<{ dx: number; dy: number } | null>(null)
  const faixa = useRef<HTMLDivElement>(null)

  // Com o relógio correndo, a tela anda de segundo em segundo.
  useEffect(() => {
    if (!tempo.rodando) return
    const t = window.setInterval(() => setTique((n) => n + 1), 1000)
    return () => window.clearInterval(t)
  }, [tempo.rodando])

  const agora = comAgora(tempo)
  const atual = previa === null ? agora : horaDaPosicao(agora, previa)
  const m = momento(atual)
  const est = tempo.calendario && tempo.mostrarEstacao ? estacaoDe(tempo, m.data) : null
  const fundoTopo = est ? `linear-gradient(90deg, ${est.cor}, ${est.cor2})` : corDaMesa
  const per = periodo(tempo, m)
  const mes = vendo ?? { ano: m.data.ano, mes: m.data.mes }

  function mudar(l: Partial<Lembrado>) {
    setLembrado((x) => {
      const n = { ...x, ...l }
      lembrar(n)
      return n
    })
  }

  const passo = (minutos: number) => onMudar(mexer(tempo, (x) => avancar(x, minutos)))
  const { minutosNaHora } = medidas(tempo)
  const notasDoDia = (dia: number) => notas.notas.filter((n) => n.dia === dia)
  const deHoje = notasDoDia(m.dia)

  function soltarFaixa(clientX: number) {
    const r = faixa.current?.getBoundingClientRect()
    if (!r) return null
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width))
  }

  const botoesDoTempo = (rotulos: boolean) => souMestre && (
    <>
      <button type="button" className="cal-btn" title="−1 hora" aria-label="Voltar 1 hora" onClick={() => passo(-minutosNaHora)}>{rotulos ? '− 1h' : <FontAwesomeIcon icon={faAnglesLeft} />}</button>
      <button type="button" className="cal-btn" title="−10 minutos" aria-label="Voltar 10 minutos" onClick={() => passo(-10)}>{rotulos ? '− 10m' : <FontAwesomeIcon icon={faBackwardStep} />}</button>
    </>
  )
  const botoesDepois = (rotulos: boolean) => souMestre && (
    <>
      <button type="button" className="cal-btn" title="+10 minutos" aria-label="Avançar 10 minutos" onClick={() => passo(10)}>{rotulos ? '+ 10m' : <FontAwesomeIcon icon={faForwardStep} />}</button>
      <button type="button" className="cal-btn" title="+1 hora" aria-label="Avançar 1 hora" onClick={() => passo(minutosNaHora)}>{rotulos ? '+ 1h' : <FontAwesomeIcon icon={faAnglesRight} />}</button>
    </>
  )
  const rodar = souMestre && (
    <button type="button" className="cal-btn" title={tempo.rodando ? 'Parar o tempo' : 'Deixar o tempo correr'} aria-label={tempo.rodando ? 'Parar o tempo' : 'Deixar o tempo correr'} onClick={() => onMudar(alternarRodando(tempo))}>
      <FontAwesomeIcon icon={tempo.rodando ? faPause : faPlay} />
    </button>
  )
  const hora = (
    <button type="button" className="cal-hora" disabled={!souMestre} title={souMestre ? 'Acertar a hora' : undefined} onClick={() => setAcertarHora(true)}>
      {textoHora(m, { formato: tempo.formato, segundos: tempo.segundos })}
    </button>
  )
  const clima = tempo.mostrarClima && (
    <span className="cal-clima" title={CLIMAS.find((c) => c.id === climaDoDia(tempo, m.dia))?.rotulo}>
      <FontAwesomeIcon icon={ICONE_CLIMA[climaDoDia(tempo, m.dia)]} />
    </span>
  )

  const titulo = est?.nome ?? (tempo.calendario ? nomeDoMes(tempo, m.data.mes) : `Dia ${m.dia + 1}`)

  return (
    <section className={`cal${lembrado.mes ? ' cal-mes' : ''}`} style={{ left: lembrado.x, top: lembrado.y }} aria-label="Calendário">
      <header
        className="cal-topo"
        style={{ background: fundoTopo }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return
          arrasto.current = { dx: e.clientX - lembrado.x, dy: e.clientY - lembrado.y }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!arrasto.current) return
          setLembrado((x) => ({ ...x, x: Math.max(0, Math.min(window.innerWidth - 80, e.clientX - arrasto.current!.dx)), y: Math.max(0, Math.min(window.innerHeight - 30, e.clientY - arrasto.current!.dy)) }))
        }}
        onPointerUp={() => {
          if (!arrasto.current) return
          arrasto.current = null
          mudar({})
        }}
        onDoubleClick={() => tempo.calendario && mudar({ mes: !lembrado.mes, minimizado: false })}
        title="Duplo clique: ver o mês"
      >
        <FontAwesomeIcon className={`cal-ceu cal-ceu-${per}`} icon={per === 'noite' ? faMoon : faSun} />
        <strong>{titulo}</strong>
        {tempo.calendario && (
          <button type="button" className="cal-topo-btn" aria-label={lembrado.mes ? 'Ver compacto' : 'Ver o mês'} title={lembrado.mes ? 'Ver compacto' : 'Ver o mês'} onClick={() => mudar({ mes: !lembrado.mes, minimizado: false })}>
            <FontAwesomeIcon icon={faCalendarDays} />
          </button>
        )}
        <button type="button" className="cal-topo-btn" aria-label={lembrado.minimizado ? 'Abrir' : 'Minimizar'} onClick={() => mudar({ minimizado: !lembrado.minimizado })}>
          <FontAwesomeIcon icon={lembrado.minimizado ? faChevronRight : faMinus} />
        </button>
      </header>

      {!lembrado.minimizado && !lembrado.mes && (
        <div className="cal-corpo">
          <div className="cal-linha">
            {tempo.calendario && tempo.mostrarLua && <Lua fase={faseDaLua(tempo, m.data)} />}
            <button type="button" className="cal-btn" title="Anotar hoje" aria-label="Anotar hoje" onClick={() => setDiaAberto(m.dia)}><FontAwesomeIcon icon={faCalendarPlus} /></button>
            {deHoje.length > 0 && (
              <button type="button" className="cal-btn" title={deHoje.map((n) => n.titulo).join('\n')} aria-label="Anotações de hoje" onClick={() => setDiaAberto(m.dia)}>
                <FontAwesomeIcon icon={deHoje.length > 1 ? faListUl : faBook} />
              </button>
            )}
            <span className="cal-data" title={textoData(tempo, m)}>{tempo.calendario ? `${m.data.dia} ${nomeDoMes(tempo, m.data.mes)} ${textoAno(tempo, m.data.ano)}` : `Dia ${m.dia + 1}`}</span>
            {souMestre && tempo.relogio && (
              <>
                <button type="button" className="cal-btn" title="Amanhecer de amanhã" aria-label="Amanhecer de amanhã" onClick={() => onMudar(mexer(tempo, irParaAmanhecer))}><FontAwesomeIcon icon={faSun} /></button>
                <button type="button" className="cal-btn" title="Pôr do sol de hoje" aria-label="Pôr do sol de hoje" onClick={() => onMudar(mexer(tempo, irParaAnoitecer))}><FontAwesomeIcon icon={faMoon} /></button>
              </>
            )}
          </div>
          {tempo.relogio && (
            <div className="cal-linha">
              {botoesDoTempo(false)}
              {clima}
              {hora}
              {rodar}
              {botoesDepois(false)}
            </div>
          )}
        </div>
      )}

      {!lembrado.minimizado && lembrado.mes && tempo.calendario && (
        <div className="cal-corpo">
          <div className="cal-mes-topo">
            <button type="button" className="cal-btn" aria-label="Mês anterior" onClick={() => setVendo(mesVizinho(tempo, mes.ano, mes.mes, -1))}><FontAwesomeIcon icon={faChevronLeft} /></button>
            <strong>{nomeDoMes(tempo, mes.mes).toUpperCase()} - {textoAno(tempo, mes.ano)}</strong>
            <button type="button" className="cal-btn" aria-label="Mês seguinte" onClick={() => setVendo(mesVizinho(tempo, mes.ano, mes.mes, 1))}><FontAwesomeIcon icon={faChevronRight} /></button>
          </div>
          <div className="cal-grade" style={{ gridTemplateColumns: `repeat(${diasDaSemana(tempo).length}, 1fr)` }}>
            {diasDaSemana(tempo).map((d) => <span key={d} className="cal-semana" title={d}>{d.slice(0, 3)}</span>)}
            {gradeDoMes(tempo, mes.ano, mes.mes).flat().map((dia, i) => {
              if (dia === null) return <span key={`v${i}`} className="cal-vazio" />
              const data = { ano: mes.ano, mes: mes.mes, dia }
              const n = diaDaCampanha(tempo, data)
              const doDia = notasDoDia(n)
              const hoje = mesmaData(data, m.data)
              const vivido = n >= 0 && n < m.dia
              return (
                <button
                  key={dia}
                  type="button"
                  className={`cal-dia${hoje ? ' hoje' : ''}${vivido ? ' vivido' : ''}`}
                  title={doDia.map((x) => x.titulo).join('\n') || undefined}
                  onClick={() => setDiaAberto(n)}
                >
                  <span className="cal-dia-num">{dia}</span>
                  {tempo.mostrarClima && n >= 0 && n <= m.dia + 2 && <FontAwesomeIcon className="cal-dia-clima" icon={ICONE_CLIMA[climaDoDia(tempo, n)]} />}
                  {doDia.length > 0 && <FontAwesomeIcon className="cal-dia-nota" icon={doDia.length > 1 ? faListUl : faBook} />}
                  {tempo.mostrarLua && <span className="cal-dia-lua"><Lua fase={faseDaLua(tempo, data)} tamanho={12} /></span>}
                </button>
              )
            })}
          </div>
          {tempo.relogio && (
            <div className="cal-linha cal-linha-mes">
              {botoesDoTempo(true)}
              {rodar}
              {hora}
              {botoesDepois(true)}
            </div>
          )}
          <div className="cal-rodape">
            <button type="button" className="cal-btn" onClick={() => setVendo(null)}><FontAwesomeIcon icon={faCalendarDays} /> Hoje</button>
            {souMestre && tempo.relogio && (
              <>
                <button type="button" className="cal-btn" onClick={() => onMudar(mexer(tempo, irParaAmanhecer))}><FontAwesomeIcon icon={faSun} /> Amanhecer</button>
                <button type="button" className="cal-btn" onClick={() => onMudar(mexer(tempo, irParaAnoitecer))}><FontAwesomeIcon icon={faMoon} /> Pôr do sol</button>
              </>
            )}
            {souMestre && <button type="button" className="cal-btn" aria-label="Configurar" title="Configurar" onClick={onConfigurar}><FontAwesomeIcon icon={faGear} /></button>}
          </div>
        </div>
      )}

      {!lembrado.minimizado && tempo.relogio && (
        <div
          ref={faixa}
          className={`cal-faixa${souMestre ? ' arrastavel' : ''}`}
          style={{ background: gradienteDoDia(tempo) }}
          onPointerDown={(e) => {
            if (!souMestre) return
            e.currentTarget.setPointerCapture(e.pointerId)
            setPrevia(soltarFaixa(e.clientX))
          }}
          onPointerMove={(e) => previa !== null && setPrevia(soltarFaixa(e.clientX))}
          onPointerUp={(e) => {
            if (previa === null) return
            const p = soltarFaixa(e.clientX) ?? previa
            setPrevia(null)
            onMudar(mexer(tempo, (x) => horaDaPosicao(x, p)))
          }}
        >
          <span className={`cal-sol cal-ceu-${per}`} style={{ left: `${posicaoNoDia(tempo, m) * 100}%` }}>
            <FontAwesomeIcon icon={per === 'noite' ? faMoon : faSun} />
          </span>
        </div>
      )}

      {diaAberto !== null && (
        <NotasDoDia
          tempo={tempo}
          dia={diaAberto}
          souMestre={souMestre}
          userId={userId}
          notas={notas}
          onIrPara={() => {
            const d = dataDoDia(tempo, diaAberto)
            onMudar(mexer(tempo, (x) => irPara(x, d, m.hora, m.minuto)))
            setDiaAberto(null)
          }}
          onClimaDoDia={(c) => onMudar({ ...tempo, clima: c ? { ...tempo.clima, [String(diaAberto)]: c } : Object.fromEntries(Object.entries(tempo.clima).filter(([k]) => k !== String(diaAberto))) })}
          onFechar={() => setDiaAberto(null)}
        />
      )}
      {acertarHora && souMestre && (
        <AcertarHora
          tempo={tempo}
          onSalvar={(d, h, mi) => {
            onMudar(mexer(tempo, (x) => irPara(x, d, h, mi)))
            setAcertarHora(false)
          }}
          onFechar={() => setAcertarHora(false)}
        />
      )}
    </section>
  )
}

// Anotações de um dia (Mini Calendar: lista com olho e lixeira, e o formulário de nova).
function NotasDoDia({ tempo, dia, souMestre, userId, notas, onIrPara, onClimaDoDia, onFechar }: {
  tempo: ConfigTempo
  dia: number
  souMestre: boolean
  userId: string
  notas: ReturnType<typeof useCalendario>
  onIrPara: () => void
  onClimaDoDia: (c: Clima | null) => void
  onFechar: () => void
}) {
  const doDia = notas.notas.filter((n) => n.dia === dia)
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [compartilhada, setCompartilhada] = useState(souMestre)
  const [editando, setEditando] = useState<NotaCalendario | null>(null)
  const data = dataDoDia(tempo, dia)
  const nome = tempo.calendario ? `${data.dia} de ${nomeDoMes(tempo, data.mes)} de ${textoAno(tempo, data.ano)}` : `Dia ${dia + 1}`
  const minha = (n: NotaCalendario) => n.author_id === userId

  async function salvar() {
    if (editando) {
      await notas.salvar(editando.id, { titulo: titulo.trim() || 'Anotação', texto: texto.trim(), compartilhada })
      setEditando(null)
    } else {
      await notas.criar(dia, titulo, texto, compartilhada)
    }
    setTitulo('')
    setTexto('')
  }

  return (
    <Janela titulo={`Anotações: ${nome}`} icone={faBook} largura={400} className="cal-janela" onFechar={onFechar}>
      <div className="janela-form">
        {doDia.length > 0 && (
          <ul className="cal-notas">
            {doDia.map((n) => (
              <li key={n.id} className="cal-nota">
                <div className="cal-nota-topo">
                  <FontAwesomeIcon icon={faBook} />
                  <button type="button" className="cal-nota-titulo" disabled={!minha(n)} onClick={() => { setEditando(n); setTitulo(n.titulo); setTexto(n.texto); setCompartilhada(n.compartilhada) }}>{n.titulo || 'Anotação'}</button>
                  {minha(n) && (
                    <button type="button" className="cal-btn" title={n.compartilhada ? 'A mesa vê (clique pra deixar só sua)' : 'Só você vê (clique pra mostrar à mesa)'} aria-label="Quem vê" onClick={() => notas.salvar(n.id, { compartilhada: !n.compartilhada })}>
                      <FontAwesomeIcon icon={n.compartilhada ? faEye : faEyeSlash} />
                    </button>
                  )}
                  {(minha(n) || souMestre) && (
                    <button type="button" className="cal-btn" aria-label="Apagar" onClick={() => window.confirm(`Apagar "${n.titulo || 'Anotação'}"?`) && notas.excluir(n.id)}><FontAwesomeIcon icon={faTrash} /></button>
                  )}
                </div>
                {n.texto && <p>{n.texto}</p>}
              </li>
            ))}
          </ul>
        )}
        <Campo rotulo="Título">
          <input value={titulo} placeholder="Anotação" aria-label="Título" onChange={(e) => setTitulo(e.target.value)} />
        </Campo>
        <Campo rotulo="Anotação">
          <textarea rows={4} value={texto} aria-label="Anotação" onChange={(e) => setTexto(e.target.value)} />
        </Campo>
        <label className="janela-check">
          <input type="checkbox" checked={compartilhada} onChange={(e) => setCompartilhada(e.target.checked)} /> {souMestre ? 'Jogadores veem' : 'A mesa vê'}
        </label>
        <button type="button" className="janela-botao" disabled={!titulo.trim() && !texto.trim()} onClick={salvar}>
          <FontAwesomeIcon icon={faCheck} /> {editando ? 'Salvar' : 'Anotar'}
        </button>
        {souMestre && (
          <>
            {tempo.mostrarClima && (
              <Campo rotulo="Clima do dia">
                <select value={tempo.clima[String(dia)] ?? ''} aria-label="Clima do dia" onChange={(e) => onClimaDoDia((e.target.value || null) as Clima | null)}>
                  <option value="">Automático ({CLIMAS.find((c) => c.id === climaDoDia({ ...tempo, clima: {} }, dia))?.rotulo})</option>
                  {CLIMAS.map((c) => <option key={c.id} value={c.id}>{c.rotulo}</option>)}
                </select>
              </Campo>
            )}
            <button type="button" className="janela-botao" onClick={onIrPara}><FontAwesomeIcon icon={faCalendarDays} /> Levar o tempo pra este dia</button>
          </>
        )}
      </div>
    </Janela>
  )
}

// Acertar a data e a hora (mestre).
function AcertarHora({ tempo, onSalvar, onFechar }: { tempo: ConfigTempo; onSalvar: (d: Data, h: number, m: number) => void; onFechar: () => void }) {
  const agora = momento(comAgora(tempo))
  const [data, setData] = useState(agora.data)
  const [h, setH] = useState(String(agora.hora))
  const [mi, setMi] = useState(String(agora.minuto))
  const { horasNoDia, minutosNaHora } = medidas(tempo)
  const n = (v: string, max: number) => Math.min(max - 1, Math.max(0, Math.round(Number(v)) || 0))
  return (
    <Janela titulo="Acertar o tempo" icone={faCalendarDays} largura={340} className="cal-janela" onFechar={onFechar}>
      <form className="janela-form" onSubmit={(e) => { e.preventDefault(); onSalvar(data, n(h, horasNoDia), n(mi, minutosNaHora)) }}>
        {tempo.calendario && (
          <div className="cal-acertar">
            <input type="number" aria-label="Dia" value={data.dia} min={1} onChange={(e) => setData({ ...data, dia: Math.max(1, Number(e.target.value) || 1) })} />
            <select aria-label="Mês" value={data.mes} onChange={(e) => setData({ ...data, mes: Number(e.target.value) })}>
              {Array.from({ length: tempo.modo === 'custom' ? tempo.custom.meses.length : 12 }, (_, i) => <option key={i} value={i + 1}>{nomeDoMes(tempo, i + 1)}</option>)}
            </select>
            <input type="number" aria-label="Ano" value={data.ano} onChange={(e) => setData({ ...data, ano: Number(e.target.value) || data.ano })} />
          </div>
        )}
        <div className="cal-acertar">
          <input type="number" aria-label="Hora" value={h} min={0} max={horasNoDia - 1} onChange={(e) => setH(e.target.value)} />
          <span>:</span>
          <input type="number" aria-label="Minuto" value={mi} min={0} max={minutosNaHora - 1} onChange={(e) => setMi(e.target.value)} />
        </div>
        <p className="janela-dica">Não dá pra voltar antes do começo da campanha.</p>
        <button type="submit" className="janela-botao"><FontAwesomeIcon icon={faCheck} /> Acertar</button>
      </form>
    </Janela>
  )
}
