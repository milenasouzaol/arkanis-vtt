import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesLeft, faAnglesRight, faChevronLeft, faChevronRight, faDiceD20, faPlus, faSkull } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../../lib/supabase'
import { lerPericias, lerTeste, rolarDano, rolarTeste } from './combate'
import type { Rolagem } from './chat'

type Acao = { nome: string; tipo?: string; teste?: string; dano?: string; descricao?: string }

type Criatura = {
  id: string
  name: string
  vd: number | null
  image_url: string | null
  tipo_criatura: string | null
  tamanho: string | null
  pv_maximo: number | null
  defesa: number | null
  deslocamento: string | null
  atributos: Record<string, number> | null
  percepcao: string | null
  iniciativa: string | null
  fortitude: string | null
  reflexos: string | null
  vontade: string | null
  pericias: string | null
  resistencias: string | null
  vulnerabilidades: string | null
  descritores: string[] | null
  presenca_dt: number | null
  presenca_dano: string | null
  presenca_nex_imune: number | null
  acoes: Acao[] | null
  habilidades: Acao[] | null
  enigma_medo: string | null
  flavor_text: string | null
  description: string | null
}

type Aba = 'status' | 'combate' | 'descricao'

const ATRIBUTOS = ['agi', 'for', 'int', 'pre', 'vig']

// Ficha de Ameaça (12.4): cabeçalho, Vida com as setas e as abas Status / Combate / Descrição.
// As setas e os dados só funcionam com a ameaça dentro de um combate rodando (podeRolar /
// onMudarPv); na escolha de ameaças ela é só pra ver, com o botão Adicionar no rodapé.
export default function FichaAmeaca({ criaturaId, pvAtual, pvMax, podeEditar, podeRolar = false, nome, onMudarPv, onRolar, onAdicionar }: {
  criaturaId: string
  pvAtual: number | null
  pvMax?: number | null
  podeEditar: boolean
  podeRolar?: boolean
  nome?: string
  onMudarPv?: (pv: number) => void
  onRolar?: (rolagem: Rolagem, autor: { nome: string; foto: string | null }) => void
  onAdicionar?: () => void
}) {
  const [c, setC] = useState<Criatura | null>(null)
  const [aba, setAba] = useState<Aba>('status')
  const [subaba, setSubaba] = useState<'acoes' | 'poderes'>('acoes')

  useEffect(() => {
    supabase.from('creatures').select('*').eq('id', criaturaId).single().then(({ data }) => setC(data as Criatura | null))
  }, [criaturaId])

  if (!c) return <p className="mesa-painel-vazio">Carregando…</p>

  const maximo = pvMax ?? c.pv_maximo ?? 0
  const pv = pvAtual ?? maximo
  const mudar = (d: number) => onMudarPv?.(Math.max(0, Math.min(maximo || Infinity, pv + d)))
  const autor = { nome: nome ?? c.name, foto: c.image_url }

  function rolarPericia(rotulo: string, texto: string) {
    if (!podeRolar || !onRolar) return
    const t = lerTeste(texto)
    const r = rolarTeste(t)
    onRolar({
      label: `${rotulo} (${nome ?? c!.name})`, total: r.total, bonus: r.bonus,
      detail: `d20 mantido: ${r.kept} (rolados: ${r.rolls.join(', ')}) + ${r.bonus}`,
      dice: r.rolls.map((v) => ({ sides: 20, value: v, discarded: v !== r.kept })),
    }, autor)
  }

  function rolarDanoDaAcao(a: Acao) {
    if (!podeRolar || !onRolar || !a.dano) return
    const d = rolarDano(a.dano)
    if (!d) return
    onRolar({ label: `Dano: ${a.nome}${d.tipo ? ` (${d.tipo})` : ''}`, total: d.total, bonus: 0, detail: d.detalhe, dice: null }, autor)
  }

  const dado = (onClick: () => void, rotulo: string) => (
    <button type="button" className="ficha-ameaca-dado" disabled={!podeRolar} aria-label={rotulo} title={podeRolar ? rotulo : 'Só rola com a ameaça num combate rodando'} onClick={onClick}>
      <FontAwesomeIcon icon={faDiceD20} />
    </button>
  )

  const testes: [string, string | null][] = [
    ['Percepção', c.percepcao], ['Iniciativa', c.iniciativa], ['Fortitude', c.fortitude], ['Reflexos', c.reflexos], ['Vontade', c.vontade],
  ]
  const lista = subaba === 'acoes' ? c.acoes ?? [] : c.habilidades ?? []

  return (
    <div className="ficha-ameaca">
      <header className="ficha-ameaca-topo">
        <div className="ficha-ameaca-foto">{c.image_url ? <img src={c.image_url} alt="" /> : <FontAwesomeIcon icon={faSkull} />}</div>
        <div>
          <h3>{nome ?? c.name}</h3>
          <p>VD: {c.vd ?? '—'}</p>
          <p>{[c.tipo_criatura, c.tamanho].filter(Boolean).join(' - ')}</p>
        </div>
      </header>

      {maximo > 0 && (
        <div className="ficha-ameaca-vida">
          {podeEditar && onMudarPv && (
            <>
              <button type="button" aria-label="Menos 5" onClick={() => mudar(-5)}><FontAwesomeIcon icon={faAnglesLeft} /></button>
              <button type="button" aria-label="Menos 1" onClick={() => mudar(-1)}><FontAwesomeIcon icon={faChevronLeft} /></button>
            </>
          )}
          <div className="ficha-ameaca-barra">
            <span style={{ width: `${Math.min(100, (pv / maximo) * 100)}%` }} />
            <strong>{pv}/{maximo}</strong>
          </div>
          {podeEditar && onMudarPv && (
            <>
              <button type="button" aria-label="Mais 1" onClick={() => mudar(1)}><FontAwesomeIcon icon={faChevronRight} /></button>
              <button type="button" aria-label="Mais 5" onClick={() => mudar(5)}><FontAwesomeIcon icon={faAnglesRight} /></button>
            </>
          )}
        </div>
      )}

      <nav className="janela-abas ficha-ameaca-abas" role="tablist">
        {(['status', 'combate', 'descricao'] as Aba[]).map((a) => (
          <button key={a} type="button" role="tab" aria-selected={aba === a} className={aba === a ? 'ativa' : undefined} onClick={() => setAba(a)}>
            {a === 'status' ? 'Status' : a === 'combate' ? 'Combate' : 'Descrição'}
          </button>
        ))}
      </nav>

      <div className="ficha-ameaca-corpo">
        {aba === 'status' && (
          <>
            {c.atributos && (
              <div className="ficha-ameaca-atributos">
                {ATRIBUTOS.map((k) => (
                  <div key={k}><span>{k.toUpperCase()}</span><strong>{c.atributos?.[k] ?? 0}</strong></div>
                ))}
              </div>
            )}
            <dl className="ficha-ameaca-lista">
              {c.defesa !== null && <><dt>Defesa</dt><dd>{c.defesa}</dd></>}
              {c.deslocamento && <><dt>Deslocamento</dt><dd>{c.deslocamento}</dd></>}
            </dl>
            <h4 className="ficha-ameaca-titulo">Perícias</h4>
            <ul className="ficha-ameaca-pericias">
              {[...testes.filter(([, t]) => t), ...lerPericias(c.pericias).map((p) => [p.nome, p.teste] as [string, string])].map(([n, t]) => (
                <li key={n}>
                  <span>{n.toUpperCase()}</span>
                  <strong>{t}</strong>
                  {dado(() => rolarPericia(n, t ?? ''), `Rolar ${n}`)}
                </li>
              ))}
            </ul>
            <dl className="ficha-ameaca-lista">
              {!!c.descritores?.length && <><dt>Elementos</dt><dd>{c.descritores.join(', ')}</dd></>}
              {c.resistencias && <><dt>Resistências</dt><dd>{c.resistencias}</dd></>}
              {c.vulnerabilidades && <><dt>Vulnerabilidades</dt><dd>{c.vulnerabilidades}</dd></>}
            </dl>
          </>
        )}

        {aba === 'combate' && (
          <>
            {c.presenca_dt && (
              <p className="ficha-ameaca-presenca">
                <strong>Presença Perturbadora:</strong> DT {c.presenca_dt}{c.presenca_dano ? ` - ${c.presenca_dano}` : ''}
                {c.presenca_nex_imune ? ` (NEX ${c.presenca_nex_imune}% imune)` : ''}
              </p>
            )}
            <nav className="ficha-ameaca-subabas">
              <button type="button" className={subaba === 'acoes' ? 'ativa' : undefined} onClick={() => setSubaba('acoes')}>Ações</button>
              <button type="button" className={subaba === 'poderes' ? 'ativa' : undefined} onClick={() => setSubaba('poderes')}>Poderes</button>
            </nav>
            {lista.map((a, i) => (
              <details key={i} className="ficha-ameaca-acao">
                <summary>{a.tipo ? <span>{a.tipo.toUpperCase()} - </span> : null}{a.nome}</summary>
                {a.teste && (
                  <p className="ficha-ameaca-linha"><strong>Teste:</strong> {a.teste} {dado(() => rolarPericia(`Teste: ${a.nome}`, a.teste!), `Rolar teste de ${a.nome}`)}</p>
                )}
                {a.dano && (
                  <p className="ficha-ameaca-linha"><strong>Dano:</strong> {a.dano} {rolarDano(a.dano) !== null && dado(() => rolarDanoDaAcao(a), `Rolar dano de ${a.nome}`)}</p>
                )}
                {a.descricao && <p>{a.descricao}</p>}
              </details>
            ))}
            {!lista.length && <p className="janela-dica">Nada cadastrado.</p>}
          </>
        )}

        {aba === 'descricao' && (
          <>
            <p className="ficha-ameaca-texto">{c.description || c.flavor_text || 'Sem descrição.'}</p>
            {c.enigma_medo && (
              <>
                <h4 className="ficha-ameaca-titulo">Enigma do Medo</h4>
                <p className="ficha-ameaca-texto">{c.enigma_medo}</p>
              </>
            )}
          </>
        )}
      </div>

      {onAdicionar && (
        <button type="button" className="janela-botao ficha-ameaca-adicionar" onClick={onAdicionar}>
          <FontAwesomeIcon icon={faPlus} /> Adicionar
        </button>
      )}
    </div>
  )
}
