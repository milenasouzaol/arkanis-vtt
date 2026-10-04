import { createContext, useContext, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronRight, faCrosshairs, faDiceD20, faBurst, faHeartPulse, faPersonRunning, faRotateLeft, faShieldHalved } from '@fortawesome/free-solid-svg-icons'
import type { Mensagem } from './chat'
import { nomeDoTipo, SIGLA_RECURSO, textoDosAlvos, type AcaoAtaque, type AcaoCura } from './mira'
import { reagirAoAtaque, rolarAtaqueDaMensagem, rolarCuraDaMensagem, rolarDanoDaMensagem, rolarTesteDaCura } from './acoesDeMira'

// Quem está olhando o chat: pra saber quem pode clicar em Ataque/Dano e quem reage.
export type QuemVe = {
  userId: string
  souMestre: boolean
  controlaAlvo: (tokenId: string) => boolean
  // Contra-atacar: mira em quem errou (devolve o erro, se não achar o token dele na cena).
  contraAtacar: (acao: AcaoAtaque) => string | null
}

export const QuemVeContexto = createContext<QuemVe | null>(null)

// Ação com alvo no chat (12.9): ataque ou cura.
export default function AcaoNoChat({ mensagem }: { mensagem: Mensagem }) {
  const acao = mensagem.acao
  if (!acao) return null
  return acao.tipo === 'cura' ? <CartaoCura mensagem={mensagem} acao={acao} /> : <CartaoAtaque mensagem={mensagem} acao={acao} />
}

// Quem mandou (ou o mestre) clica nos botões; o resto só acompanha.
function usePasso(mensagem: Mensagem) {
  const quem = useContext(QuemVeContexto)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const conduz = !!quem && (quem.souMestre || mensagem.user_id === quem.userId)
  async function fazer(passo: () => Promise<string | null>) {
    setOcupado(true)
    setErro(null)
    const e = await passo()
    setOcupado(false)
    if (e) setErro(e)
  }
  return { quem, ocupado, erro, conduz, fazer }
}

// "[Atacante] está atacando [Alvo]" com os botões Ataque e Dano.
function CartaoAtaque({ mensagem, acao }: { mensagem: Mensagem; acao: AcaoAtaque }) {
  const { quem, ocupado, erro, conduz, fazer } = usePasso(mensagem)
  const [verDados, setVerDados] = useState<'ataque' | 'dano' | null>(null)
  const { ataque, dano, aplicado } = acao.estado
  const algumAcerto = !!ataque && acao.alvos.some((a) => ataque.acertos[a.token_id])
  const reacaoDe = (t: string) => acao.estado.reacoes?.[t] ?? (acao.estado.bloqueios?.[t] !== undefined ? { tipo: 'bloqueio' as const, valor: acao.estado.bloqueios[t] } : undefined)

  const rotuloReacao = (r: NonNullable<ReturnType<typeof reacaoDe>>) =>
    r.tipo === 'esquiva' ? <><FontAwesomeIcon icon={faPersonRunning} /> Esquivou (+{r.valor})</>
      : r.tipo === 'bloqueio' ? <><FontAwesomeIcon icon={faShieldHalved} /> Bloqueou ({r.valor})</>
        : <><FontAwesomeIcon icon={faRotateLeft} /> Contra-atacou</>

  return (
    <div className="chat-acao">
      <p className="chat-acao-titulo">
        <FontAwesomeIcon icon={faCrosshairs} /> <strong>{acao.atacante}</strong> está atacando <strong>{textoDosAlvos(acao.alvos)}</strong>
      </p>
      <p className="chat-rolagem-rotulo">{acao.ataque.nome}{acao.ataque.corpo ? ' · corpo a corpo' : ''}</p>

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
        </>
      )}

      {/* Cada alvo: a reação dele (Esquivar / Bloquear / Contra-atacar) e o resultado. */}
      <ul className="chat-acao-alvos">
        {acao.alvos.map((a) => {
          const acertou = ataque ? ataque.acertos[a.token_id] : undefined
          const efeito = dano?.efeitos?.[a.token_id]
          const feito = aplicado?.[a.token_id]
          const reacao = reacaoDe(a.token_id)
          const controla = !reacao && !!quem?.controlaAlvo(a.token_id)
          const podeEsquivar = controla && !ataque
          const podeBloquear = controla && !dano && (!ataque || acertou)
          const podeContra = controla && !!ataque && acertou === false && !!acao.ataque.corpo
          return (
            <li key={a.token_id} className={acertou === undefined ? '' : acertou ? 'acertou' : 'errou'}>
              <span className="chat-acao-alvo">{a.nome}</span>
              {acertou !== undefined && <span>{acertou ? 'Acertou' : 'Errou'}</span>}
              {reacao && <span className="chat-acao-extra">{rotuloReacao(reacao)}</span>}
              {podeEsquivar && (
                <button type="button" className="chat-acao-mini" disabled={ocupado} title="Soma o seu bônus de Reflexos na Defesa contra este ataque" onClick={() => fazer(() => reagirAoAtaque(mensagem, a.token_id, 'esquiva'))}>
                  <FontAwesomeIcon icon={faPersonRunning} /> Esquivar
                </button>
              )}
              {podeBloquear && (
                <button type="button" className="chat-acao-mini" disabled={ocupado} title="Tira o seu Bloqueio do dano deste ataque" onClick={() => fazer(() => reagirAoAtaque(mensagem, a.token_id, 'bloqueio'))}>
                  <FontAwesomeIcon icon={faShieldHalved} /> Bloquear
                </button>
              )}
              {podeContra && (
                <button
                  type="button"
                  className="chat-acao-mini"
                  disabled={ocupado}
                  title="Marca quem errou como seu alvo; ataque pela sua ficha"
                  onClick={() => fazer(async () => (await reagirAoAtaque(mensagem, a.token_id, 'contra')) ?? quem!.contraAtacar(acao))}
                >
                  <FontAwesomeIcon icon={faRotateLeft} /> Contra-atacar
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
      {erro && <p className="chat-acao-erro" role="alert">{erro}</p>}
    </div>
  )
}

// "[Pedro] está usando o ritual [Cicatrização] em [Maria]": teste (no ritual) e depois Curar,
// que soma no alvo sem passar do máximo.
function CartaoCura({ mensagem, acao }: { mensagem: Mensagem; acao: AcaoCura }) {
  const { ocupado, erro, conduz, fazer } = usePasso(mensagem)
  const [verDados, setVerDados] = useState<'teste' | 'cura' | null>(null)
  const { teste, cura, aplicado } = acao.estado
  const sigla = SIGLA_RECURSO[acao.recurso]
  const podeCurar = !acao.teste || !!teste

  return (
    <div className="chat-acao">
      <p className="chat-acao-titulo">
        <FontAwesomeIcon icon={faHeartPulse} /> <strong>{acao.curador}</strong> está usando {acao.fonte} em <strong>{textoDosAlvos(acao.alvos)}</strong>
      </p>
      <p className="chat-rolagem-rotulo">Cura: {acao.formula} {sigla}</p>

      {acao.teste && (
        !teste ? (
          conduz ? (
            <button type="button" className="chat-acao-botao" disabled={ocupado} onClick={() => fazer(() => rolarTesteDaCura(mensagem))}>
              <FontAwesomeIcon icon={faDiceD20} /> Teste de {acao.teste.nome}
            </button>
          ) : (
            <p className="chat-acao-espera">Aguardando o teste…</p>
          )
        ) : (
          <>
            <p className="chat-rolagem-rotulo">Teste de {acao.teste.nome}</p>
            <button type="button" className="chat-rolagem-total" aria-expanded={verDados === 'teste'} onClick={() => setVerDados((v) => (v === 'teste' ? null : 'teste'))}>
              <span>{teste.total}</span>
              <FontAwesomeIcon icon={verDados === 'teste' ? faChevronDown : faChevronRight} />
            </button>
            {verDados === 'teste' && (
              <div className="chat-rolagem-dados">
                {teste.rolls.map((v, i) => <span key={i} className={`chat-dado${v !== teste.kept ? ' descartado' : ''}`} title="d20">{v}</span>)}
                {teste.bonus ? <span className="chat-rolagem-bonus">{teste.bonus > 0 ? `+${teste.bonus}` : teste.bonus}</span> : null}
              </div>
            )}
          </>
        )
      )}

      {podeCurar && (
        !cura ? (
          conduz ? (
            <button type="button" className="chat-acao-botao" disabled={ocupado} onClick={() => fazer(() => rolarCuraDaMensagem(mensagem))}>
              <FontAwesomeIcon icon={faHeartPulse} /> Curar
            </button>
          ) : (
            <p className="chat-acao-espera">Aguardando a cura…</p>
          )
        ) : (
          <>
            <p className="chat-rolagem-rotulo">Cura</p>
            <button type="button" className="chat-rolagem-total" aria-expanded={verDados === 'cura'} onClick={() => setVerDados((v) => (v === 'cura' ? null : 'cura'))}>
              <span>{cura.total}</span>
              <FontAwesomeIcon icon={verDados === 'cura' ? faChevronDown : faChevronRight} />
            </button>
            {verDados === 'cura' && (
              <div className="chat-rolagem-dados">
                {cura.dados.map((d, i) => <span key={i} className="chat-dado" title={`d${d.sides}`}>{d.value}</span>)}
              </div>
            )}
            <ul className="chat-acao-alvos">
              {acao.alvos.map((a) => {
                const feito = aplicado?.[a.token_id]
                return (
                  <li key={a.token_id} className="acertou">
                    <span className="chat-acao-alvo">{a.nome}</span>
                    <span className="chat-acao-dano">{feito ? (feito.valor ? `+${feito.valor} ${sigla}` : 'já estava no máximo') : 'sem ficha'}</span>
                  </li>
                )
              })}
            </ul>
          </>
        )
      )}
      {erro && <p className="chat-acao-erro" role="alert">{erro}</p>}
    </div>
  )
}
