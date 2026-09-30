import { useState } from 'react'
import { INTRODUCAO, PERGUNTAS, PERGUNTA_EXTRA, empatados, ranking, type Pergunta } from './testeAfinidade'
import AfinidadeResultado from './AfinidadeResultado'
import AfinidadeEmpate from './AfinidadeEmpate'
import tituloEnfeite from '../../assets/afinidade/titulo-enfeite.webp'
import type { ChaveElemento } from './elementosParanormais'
import marcadorRespondida from '../../assets/afinidade/marcador-respondida.webp'
import marcadorAtual from '../../assets/afinidade/marcador-atual.webp'
import marcadorFutura from '../../assets/afinidade/marcador-futura.webp'
import cantoSupDir from '../../assets/afinidade/canto-sup-dir.webp'
import cantoInfEsq from '../../assets/afinidade/canto-inf-esq.webp'
import cantoInfDir from '../../assets/afinidade/canto-inf-dir.webp'

/** Onde o mouse esta dentro do botao, pra luz acompanhar ele. */
function acompanharMouse(e: React.MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

function Titulo({ children }: { children: React.ReactNode }) {
  return (
    <div className="afin-teste-titulo">
      <img className="afin-teste-titulo-enfeite" src={tituloEnfeite} alt="" />
      <span>{children}</span>
      <img className="afin-teste-titulo-enfeite espelhado" src={tituloEnfeite} alt="" />
    </div>
  )
}

export default function AfinidadeTeste({
  onResultado,
  onDesistir,
}: {
  onResultado: (elemento: ChaveElemento) => void
  onDesistir: () => void
}) {
  const [etapa, setEtapa] = useState<'intro' | 'perguntas'>('intro')
  // Preenchido quando o resultado da quase empatado: a pessoa escolhe entre eles.
  const [empate, setEmpate] = useState<ChaveElemento[] | null>(null)
  // A ordem final dos elementos; o primeiro e o resultado mostrado.
  const [final, setFinal] = useState<ChaveElemento[] | null>(null)
  // 0..PERGUNTAS.length-1 sao as perguntas; PERGUNTAS.length e a pergunta extra.
  const [indice, setIndice] = useState(0)
  const [respostas, setRespostas] = useState<(number | undefined)[]>([])
  const [extra, setExtra] = useState<number | undefined>(undefined)

  const total = PERGUNTAS.length
  const naExtra = indice === total
  const pergunta: Pergunta = naExtra ? PERGUNTA_EXTRA : PERGUNTAS[indice]
  const escolhida = naExtra ? extra : respostas[indice]

  function escolher(i: number) {
    if (naExtra) setExtra(i)
    else setRespostas((r) => { const novo = [...r]; novo[indice] = i; return novo })
  }

  function continuar() {
    if (escolhida === undefined) return
    if (!naExtra) { setIndice((i) => i + 1); return }
    const topo = empatados(respostas)
    if (topo.length === 1) setFinal(ranking(respostas))
    else setEmpate(topo)
  }

  if (final) return <AfinidadeResultado ranking={final} onAceitar={onResultado} onRecusar={onDesistir} />

  if (empate) {
    // O escolhido no empate sobe pro topo; o resto segue a ordem do calculo.
    return <AfinidadeEmpate opcoes={empate} onEscolher={(k) => setFinal([k, ...ranking(respostas).filter((r) => r !== k)])} />
  }

  if (etapa === 'intro') {
    return (
      <div className="afin-teste aba-travada">
        <Cantos />
        <div className="afin-teste-miolo">
          <Titulo>Atenção!</Titulo>
          <div className="afin-teste-intro">
            {INTRODUCAO.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
          </div>
          <div className="afin-teste-navegar">
            <button type="button" className="afin-teste-nav contorno" onClick={onDesistir}>
              <span aria-hidden>‹</span> Voltar
            </button>
            <button type="button" className="afin-teste-nav cheio" onClick={() => setEtapa('perguntas')}>
              Transcender <span aria-hidden>›</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="afin-teste aba-travada">
      <Cantos />
      <button type="button" className="afin-teste-desistir" onClick={onDesistir}>Desistir</button>

      <div className="afin-teste-miolo">
        <Titulo>{naExtra ? 'Extra' : `${indice + 1}/${total}`}</Titulo>
        <p className="afin-teste-pergunta">{pergunta.texto}</p>

        <div className="afin-teste-opcoes">
          {pergunta.opcoes.map((o, i) => (
            <button
              key={o.texto}
              type="button"
              className={`afin-teste-opcao${escolhida === i ? ' escolhida' : ''}`}
              onMouseMove={acompanharMouse}
              onClick={() => escolher(i)}
              aria-pressed={escolhida === i}
            >
              {o.texto}
            </button>
          ))}
        </div>

        <div className="afin-teste-navegar">
          {indice > 0 && (
            <button type="button" className="afin-teste-nav contorno" onClick={() => setIndice((i) => i - 1)}>
              <span aria-hidden>‹</span> Voltar
            </button>
          )}
          <button type="button" className="afin-teste-nav cheio" disabled={escolhida === undefined} onClick={continuar}>
            {naExtra ? 'Terminar' : 'Continuar'} <span aria-hidden>›</span>
          </button>
        </div>

        <div className="afin-teste-marcadores" aria-hidden>
          {PERGUNTAS.map((p, i) => {
            const estado = i < indice ? 'respondida' : i === indice ? 'atual' : 'futura'
            const src = estado === 'respondida' ? marcadorRespondida : estado === 'atual' ? marcadorAtual : marcadorFutura
            return <img key={p.numero} className={`afin-teste-marcador ${estado}`} src={src} alt="" />
          })}
        </div>
      </div>
    </div>
  )
}

function Cantos() {
  return (
    <>
      <img className="afin-teste-canto sup-dir" src={cantoSupDir} alt="" />
      <img className="afin-teste-canto inf-esq" src={cantoInfEsq} alt="" />
      <img className="afin-teste-canto inf-dir" src={cantoInfDir} alt="" />
    </>
  )
}
