import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { elementoPorChave } from './elementosParanormais'
import { lerRegra, normalizar, separarTermo, type Bloco } from './regrasExtras'

/*
 * Regras Extras: compendio de consulta. Nao muda nenhuma conta da ficha, so poupa abrir
 * o livro. A esquerda a lista por categoria (com busca), a direita a regra escolhida.
 */

type Rule = { id: string; category: string; title: string; content: string }

const CATEGORY_LABELS: Record<string, string> = {
  mecanicas_de_cena: 'Mecânicas de Cena',
  combate_alternativo: 'Combate Alternativo',
  equipamento_especial: 'Equipamento Especial',
  campanha: 'Campanha',
}

// Ordem das categorias na lista: das mais usadas em jogo pras de campanha.
const ORDEM = ['mecanicas_de_cena', 'combate_alternativo', 'equipamento_especial', 'campanha']

export default function RegrasExtrasTab({ elemento }: { elemento?: string | null }) {
  const [rules, setRules] = useState<Rule[]>([])
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('extra_rules').select('id, category, title, content').order('category').order('sort_order')
      .then(({ data }) => setRules(data ?? []))
  }, [])

  const termo = normalizar(search.trim())
  const filtradas = termo
    ? rules.filter((r) => normalizar(r.title).includes(termo) || normalizar(r.content).includes(termo))
    : rules
  const categorias = [...new Set(filtradas.map((r) => r.category))]
    .sort((a, b) => (ORDEM.indexOf(a) + 1 || 99) - (ORDEM.indexOf(b) + 1 || 99))

  // Sem nada escolhido (ou a escolhida sumiu na busca), mostra a primeira da lista.
  const primeira = categorias.length ? filtradas.find((r) => r.category === categorias[0]) : undefined
  const regra = filtradas.find((r) => r.id === selecionada) ?? primeira ?? null
  const blocos = useMemo(() => (regra ? lerRegra(regra.content) : []), [regra])

  const cor = elemento ? elementoPorChave(elemento as never)?.cor : null

  return (
    <div className="regras aba-travada" style={{ '--regras-cor': cor ?? '#8b8596' } as React.CSSProperties}>
      <nav className="regras-vidro regras-indice" aria-label="Regras extras">
        <input
          className="regras-busca"
          type="search"
          placeholder="Buscar regra ou palavra..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="regras-rolagem">
          {categorias.map((cat) => (
            <section key={cat} className="regras-grupo">
              <h3 className="regras-grupo-titulo">{CATEGORY_LABELS[cat] ?? cat}</h3>
              <ul>
                {filtradas.filter((r) => r.category === cat).map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      className={`regras-item${regra?.id === r.id ? ' regras-ativa' : ''}`}
                      aria-current={regra?.id === r.id}
                      onClick={() => setSelecionada(r.id)}
                    >
                      {r.title}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {rules.length > 0 && categorias.length === 0 && <p className="regras-vazio">Nenhuma regra fala disso.</p>}
        </div>
      </nav>

      <article className="regras-vidro regras-leitura">
        {regra ? (
          <>
            <header className="regras-cabeca">
              <span className="regras-categoria">{CATEGORY_LABELS[regra.category] ?? regra.category}</span>
              <h2 className="regras-titulo">{regra.title}</h2>
            </header>
            <div className="regras-rolagem regras-texto">
              {blocos.map((b, i) => <BlocoDaRegra key={`${regra.id}-${i}`} bloco={b} />)}
            </div>
          </>
        ) : (
          <p className="regras-vazio">{rules.length ? 'Escolha uma regra na lista.' : 'Carregando...'}</p>
        )}
        <p className="regras-nota">Material de consulta: não muda nenhum cálculo da ficha.</p>
      </article>
    </div>
  )
}

function ComTermo({ texto }: { texto: string }) {
  const { termo, resto } = separarTermo(texto)
  if (!termo) return <>{texto}</>
  return <><strong className="regras-termo">{termo}:</strong> {resto}</>
}

function BlocoDaRegra({ bloco }: { bloco: Bloco }) {
  if (bloco.tipo === 'titulo') return <h4 className="regras-subtitulo">{bloco.texto}</h4>
  if (bloco.tipo === 'lista') {
    return (
      <ul className="regras-lista">
        {bloco.itens.map((item, i) => <li key={i}><ComTermo texto={item} /></li>)}
      </ul>
    )
  }
  return (
    <>
      {bloco.texto && <p className="regras-paragrafo"><ComTermo texto={bloco.texto} /></p>}
      {bloco.sequencia && (
        <ul className="regras-sequencia">
          {bloco.sequencia.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      )}
    </>
  )
}
