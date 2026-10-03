import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesLeft, faAnglesRight, faChevronLeft, faChevronRight, faSkull } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../../lib/supabase'

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
  presenca_dt: number | null
  presenca_dano: string | null
  presenca_nex_imune: number | null
  acoes: Acao[] | null
  habilidades: Acao[] | null
  flavor_text: string | null
  description: string | null
}

type Aba = 'status' | 'combate' | 'descricao'

const ATRIBUTOS = ['agi', 'for', 'int', 'pre', 'vig']

// Ficha de Ameaça (12.4) na versão da aba Personagens: cabeçalho, Vida com as setas e as
// abas Status / Combate / Descrição. A versão completa, com rolagens no turno, vem com os
// Encontros de Combate (KAN-50).
export default function FichaAmeaca({ criaturaId, pvAtual, podeEditar, onMudarPv }: {
  criaturaId: string
  pvAtual: number | null
  podeEditar: boolean
  onMudarPv: (pv: number) => void
}) {
  const [c, setC] = useState<Criatura | null>(null)
  const [aba, setAba] = useState<Aba>('status')

  useEffect(() => {
    supabase.from('creatures').select('*').eq('id', criaturaId).single().then(({ data }) => setC(data as Criatura | null))
  }, [criaturaId])

  if (!c) return <p className="mesa-painel-vazio">Carregando…</p>

  const maximo = c.pv_maximo ?? 0
  const pv = pvAtual ?? maximo
  const mudar = (d: number) => onMudarPv(Math.max(0, Math.min(maximo || Infinity, pv + d)))

  return (
    <div className="ficha-ameaca">
      <header className="ficha-ameaca-topo">
        <div className="ficha-ameaca-foto">{c.image_url ? <img src={c.image_url} alt="" /> : <FontAwesomeIcon icon={faSkull} />}</div>
        <div>
          <h3>{c.name}</h3>
          <p>VD: {c.vd ?? '—'}</p>
          <p>{[c.tipo_criatura, c.tamanho].filter(Boolean).join(' - ')}</p>
        </div>
      </header>

      {maximo > 0 && (
        <div className="ficha-ameaca-vida">
          {podeEditar && (
            <>
              <button type="button" aria-label="Menos 5" onClick={() => mudar(-5)}><FontAwesomeIcon icon={faAnglesLeft} /></button>
              <button type="button" aria-label="Menos 1" onClick={() => mudar(-1)}><FontAwesomeIcon icon={faChevronLeft} /></button>
            </>
          )}
          <div className="ficha-ameaca-barra">
            <span style={{ width: `${Math.min(100, (pv / maximo) * 100)}%` }} />
            <strong>{pv}/{maximo}</strong>
          </div>
          {podeEditar && (
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
              {c.percepcao && <><dt>Percepção</dt><dd>{c.percepcao}</dd></>}
              {c.iniciativa && <><dt>Iniciativa</dt><dd>{c.iniciativa}</dd></>}
              {c.fortitude && <><dt>Fortitude</dt><dd>{c.fortitude}</dd></>}
              {c.reflexos && <><dt>Reflexos</dt><dd>{c.reflexos}</dd></>}
              {c.vontade && <><dt>Vontade</dt><dd>{c.vontade}</dd></>}
              {c.pericias && <><dt>Perícias</dt><dd>{c.pericias}</dd></>}
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
            {[...(c.acoes ?? []), ...(c.habilidades ?? [])].map((a, i) => (
              <details key={i} className="ficha-ameaca-acao">
                <summary>{a.tipo ? <span>{a.tipo.toUpperCase()} - </span> : null}{a.nome}</summary>
                {a.teste && <p><strong>Teste:</strong> {a.teste}</p>}
                {a.dano && <p><strong>Dano:</strong> {a.dano}</p>}
                {a.descricao && <p>{a.descricao}</p>}
              </details>
            ))}
            {!c.acoes?.length && !c.habilidades?.length && <p className="janela-dica">Sem ações cadastradas.</p>}
          </>
        )}

        {aba === 'descricao' && <p className="ficha-ameaca-texto">{c.description || c.flavor_text || 'Sem descrição.'}</p>}
      </div>
    </div>
  )
}
