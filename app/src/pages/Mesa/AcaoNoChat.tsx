import { createContext, useContext, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronRight, faCrosshairs, faDiceD20, faBurst, faShieldHalved } from '@fortawesome/free-solid-svg-icons'
import type { Mensagem } from './chat'
import { nomeDoTipo, textoDosAlvos } from './mira'
import { bloquearAtaque, rolarAtaqueDaMensagem, rolarDanoDaMensagem } from './acoesDeMira'

// Quem está olhando o chat: pra saber quem pode clicar em Ataque/Dano e quem pode bloquear.
export type QuemVe = { userId: string; souMestre: boolean; controlaAlvo: (tokenId: string) => boolean }

export const QuemVeContexto = createContext<QuemVe | null>(null)

// "[Atacante] está atacando [Alvo]" com os botões Ataque e Dano (12.9).
export default function AcaoNoChat({ mensagem }: { mensagem: Mensagem }) {
  const quem = useContext(QuemVeContexto)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [verDados, setVerDados] = useState<'ataque' | 'dano' | null>(null)
  const acao = mensagem.acao
  if (!acao) return null
  const { ataque, dano, bloqueios, aplicado } = acao.estado
  const conduz = !!quem && (quem.souMestre || mensagem.user_id === quem.userId)
  const algumAcerto = !!ataque && acao.alvos.some((a) => ataque.acertos[a.token_id])

  async function fazer(passo: () => Promise<string | null>) {
    setOcupado(true)
    setErro(null)
    const e = await passo()
    setOcupado(false)
    if (e) setErro(e)
  }

  return (
    <div className="chat-acao">
      <p className="chat-acao-titulo">
        <FontAwesomeIcon icon={faCrosshairs} /> <strong>{acao.atacante}</strong> está atacando <strong>{textoDosAlvos(acao.alvos)}</strong>
      </p>
      <p className="chat-rolagem-rotulo">{acao.ataque.nome}</p>

      {!ataque ? (
        conduz ? (
          <button type="button" className="chat-acao-botao" disabled={ocupado} onClick={() => fazer(() => rolarAtaqueDaMensagem(mensagem))}>
            <FontAwesomeIcon icon={faDiceD20} /> Ataque
          </button>
        ) : (
          <p className="chat-acao-espera">Aguardando o ataque…</p>
        )
      ) : (
        <>
          <button type="button" className="chat-rolagem-total" aria-expanded={verDados === 'ataque'} onClick={() => setVerDados((v) => (v === 'ataque' ? null : 'ataque'))}>
            <span>{ataque.total}</span>
            <FontAwesomeIcon icon={verDados === 'ataque' ? faChevronDown : faChevronRight} />
          </button>
          {verDados === 'ataque' && (
            <div className="chat-rolagem-dados">
              {ataque.rolls.map((v, i) => <span key={i} className={`chat-dado${v !== ataque.kept ? ' descartado' : ''}`} title="d20">{v}</span>)}
              {ataque.bonus ? <span className="chat-rolagem-bonus">{ataque.bonus > 0 ? `+${ataque.bonus}` : ataque.bonus}</span> : null}
            </div>
          )}
          {ataque.critico && algumAcerto && <p className="chat-acao-critico">Crítico!</p>}

          {!dano ? (
            conduz && algumAcerto ? (
              <button type="button" className="chat-acao-botao" disabled={ocupado} onClick={() => fazer(() => rolarDanoDaMensagem(mensagem))}>
                <FontAwesomeIcon icon={faBurst} /> Dano
              </button>
            ) : algumAcerto ? (
              <p className="chat-acao-espera">Aguardando o dano…</p>
            ) : null
          ) : (
            <>
              <p className="chat-rolagem-rotulo">{dano.critico ? `Dano Crítico (x${acao.ataque.multiplicador})` : 'Dano'}{dano.partes.some((p) => p.tipo) ? ` · ${[...new Set(dano.partes.map((p) => nomeDoTipo(p.tipo)).filter(Boolean))].join(', ')}` : ''}</p>
              <button type="button" className="chat-rolagem-total" aria-expanded={verDados === 'dano'} onClick={() => setVerDados((v) => (v === 'dano' ? null : 'dano'))}>
                <span>{dano.total}</span>
                <FontAwesomeIcon icon={verDados === 'dano' ? faChevronDown : faChevronRight} />
              </button>
              {verDados === 'dano' && (
                <div className="chat-rolagem-dados">
                  {dano.dados.map((d, i) => <span key={i} className="chat-dado" title={`d${d.sides}`}>{d.value}</span>)}
                </div>
              )}
            </>
          )}
          <ul className="chat-acao-alvos">
            {acao.alvos.map((a) => {
              const acertou = ataque.acertos[a.token_id]
              const efeito = dano?.efeitos?.[a.token_id]
              const feito = aplicado?.[a.token_id]
              const podeBloquear = acertou && !dano && !bloqueios?.[a.token_id] && quem?.controlaAlvo(a.token_id)
              return (
                <li key={a.token_id} className={acertou ? 'acertou' : 'errou'}>
                  <span className="chat-acao-alvo">{a.nome}</span>
                  <span>{acertou ? 'Acertou' : 'Errou'}</span>
                  {bloqueios?.[a.token_id] !== undefined && <span className="chat-acao-extra"><FontAwesomeIcon icon={faShieldHalved} /> Bloqueou ({bloqueios[a.token_id]})</span>}
                  {podeBloquear && (
                    <button type="button" className="chat-acao-mini" disabled={ocupado} onClick={() => fazer(() => bloquearAtaque(mensagem, a.token_id))}>
                      <FontAwesomeIcon icon={faShieldHalved} /> Bloquear
                    </button>
                  )}
                  {dano && acertou && (
                    <span className="chat-acao-dano">
                      {efeito === null
                        ? 'sem ficha'
                        : feito
                          ? [feito.pv ? `−${feito.pv} PV` : '', feito.san ? `−${feito.san} SAN` : ''].filter(Boolean).join(' ') || 'sem dano'
                          : 'aplicando…'}
                      {efeito?.motivos.length ? <small> ({efeito.motivos.join(', ')})</small> : null}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}
      {erro && <p className="chat-acao-erro" role="alert">{erro}</p>}
    </div>
  )
}
