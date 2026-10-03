import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFloppyDisk, faMagnifyingGlass, faPlus, faSkull, faXmark } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../../lib/supabase'
import Janela from './Janela'
import FichaAmeaca from './FichaAmeaca'
import { COR_ELEMENTO, elementoDaCriatura, filtrarAmeacas, FILTROS_ELEMENTO, vdTotal, type CriaturaLista, type FiltroElemento } from './combate'

const CAMPOS = 'id, name, vd, image_url, tipo_criatura, tamanho, descritores, categoria, source_id, iniciativa, pv_maximo'

// Criar Combate (12.4): Nome, VD Total, filtros por livro e elemento, a lista de ameaças
// (Ficha / Adicionar) e, do lado, as Ameaças Selecionadas com Remover na cor do elemento.
// No modo "adicionar" (combate já rodando) escolhe ameaças pra entrar no meio da luta.
export default function CriarCombate({ inicial, modo = 'criar', onSalvar, onFechar }: {
  inicial?: { name: string; ameacas: string[] }
  modo?: 'criar' | 'adicionar'
  onSalvar: (nome: string, ameacas: string[]) => void
  onFechar: () => void
}) {
  const [nome, setNome] = useState(inicial?.name ?? '')
  const [escolhidas, setEscolhidas] = useState<string[]>(modo === 'adicionar' ? [] : inicial?.ameacas ?? [])
  const [criaturas, setCriaturas] = useState<CriaturaLista[]>([])
  const [fontes, setFontes] = useState<{ id: string; name: string }[]>([])
  const [busca, setBusca] = useState('')
  const [elemento, setElemento] = useState<FiltroElemento>('todos')
  const [fonte, setFonte] = useState<string | null>(null)
  const [ficha, setFicha] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('creatures').select(CAMPOS).order('name').then(({ data }) => setCriaturas((data ?? []) as CriaturaLista[]))
    supabase.from('sources').select('id, name').then(({ data }) => setFontes(data ?? []))
  }, [])

  // Só os livros que têm ameaça no bestiário.
  const fontesComAmeaca = useMemo(() => {
    const usadas = new Set(criaturas.map((c) => c.source_id))
    return fontes.filter((f) => usadas.has(f.id)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [criaturas, fontes])

  const lista = filtrarAmeacas(criaturas, { busca, elemento, fonte })
  const porId = new Map(criaturas.map((c) => [c.id, c]))
  const total = vdTotal(escolhidas, criaturas)

  function salvar() {
    if (modo === 'criar' && !nome.trim()) {
      setErro('Dê um nome pro combate.')
      return
    }
    onSalvar(nome.trim(), escolhidas)
  }

  return (
    <Janela titulo={modo === 'adicionar' ? 'Adicionar ao Combate' : 'Criar Combate'} icone={faSkull} largura={1000} altura={720} onFechar={onFechar}>
      <div className="criar-combate">
        <div className="criar-combate-topo">
          {modo === 'criar' && (
            <label className="criar-combate-nome">
              Nome*
              <input value={nome} placeholder="Combate na floresta" aria-label="Nome do combate" onChange={(e) => { setNome(e.target.value); setErro(null) }} />
            </label>
          )}
          <div className="criar-combate-vd"><span>VD Total</span><strong>{total}</strong></div>
        </div>

        <div className="criar-combate-fontes" role="radiogroup" aria-label="Livro">
          <button type="button" className={!fonte ? 'ativo' : undefined} onClick={() => setFonte(null)}>Todos os livros</button>
          {fontesComAmeaca.map((f) => (
            <button key={f.id} type="button" className={fonte === f.id ? 'ativo' : undefined} onClick={() => setFonte(f.id)}>{f.name}</button>
          ))}
        </div>

        <div className="criar-combate-colunas">
          <section className="criar-combate-lista">
            <h3>Lista de Ameaças</h3>
            <div className="criar-combate-busca">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              <input value={busca} placeholder="Procurar por nome" aria-label="Procurar ameaça" onChange={(e) => setBusca(e.target.value)} />
            </div>
            <div className="criar-combate-elementos" role="tablist">
              {FILTROS_ELEMENTO.map((f) => (
                <button key={f.id} type="button" role="tab" aria-selected={elemento === f.id} className={elemento === f.id ? 'ativo' : undefined} onClick={() => setElemento(f.id)}>
                  {f.rotulo}
                </button>
              ))}
            </div>
            <ul>
              {lista.map((c) => (
                <li key={c.id} className="criar-combate-ameaca">
                  <span className="ator-token">{c.image_url ? <img src={c.image_url} alt="" /> : <FontAwesomeIcon icon={faSkull} />}</span>
                  <span className="criar-personagem-nome">
                    <strong>{c.name}</strong>
                    <small>VD: {c.vd ?? '—'} · {[c.tipo_criatura, c.tamanho].filter(Boolean).join(' - ')}</small>
                  </span>
                  <button type="button" className="mesa-botao" onClick={() => setFicha(c.id)}>Ficha</button>
                  <button type="button" className="mesa-botao" onClick={() => setEscolhidas((l) => [...l, c.id])}><FontAwesomeIcon icon={faPlus} /> Adicionar</button>
                </li>
              ))}
              {!lista.length && <li className="janela-dica">Nenhuma ameaça com esse filtro.</li>}
            </ul>
          </section>

          <section className="criar-combate-selecionadas">
            <h3>Ameaças Selecionadas</h3>
            <ul>
              {escolhidas.map((id, i) => {
                const c = porId.get(id)
                if (!c) return null
                return (
                  <li key={`${id}-${i}`} className="criar-combate-ameaca">
                    <span className="ator-token">{c.image_url ? <img src={c.image_url} alt="" /> : <FontAwesomeIcon icon={faSkull} />}</span>
                    <span className="criar-personagem-nome"><strong>{c.name}</strong><small>VD: {c.vd ?? '—'}</small></span>
                    <button
                      type="button"
                      className="criar-combate-remover"
                      style={{ ['--cor' as string]: COR_ELEMENTO[elementoDaCriatura(c)] }}
                      onClick={() => setEscolhidas((l) => l.filter((_, j) => j !== i))}
                    >
                      <FontAwesomeIcon icon={faXmark} /> Remover
                    </button>
                  </li>
                )
              })}
              {!escolhidas.length && <li className="janela-dica">Adicione ameaças da lista.</li>}
            </ul>
          </section>
        </div>

        {erro && <p className="janela-aviso">{erro}</p>}
        <div className="criar-combate-acoes">
          <button type="button" className="janela-botao" onClick={onFechar}><FontAwesomeIcon icon={faXmark} /> Sair sem salvar</button>
          <button type="button" className="janela-botao" disabled={modo === 'adicionar' && !escolhidas.length} onClick={salvar}>
            <FontAwesomeIcon icon={modo === 'adicionar' ? faPlus : faFloppyDisk} /> {modo === 'adicionar' ? 'Adicionar ao combate' : 'Salvar'}
          </button>
        </div>
      </div>

      {ficha && (
        <Janela titulo={porId.get(ficha)?.name ?? 'Ameaça'} icone={faSkull} largura={440} altura={620} inicial={{ x: Math.max(16, window.innerWidth - 480), y: 40 }} onFechar={() => setFicha(null)}>
          <FichaAmeaca criaturaId={ficha} pvAtual={null} podeEditar={false} onAdicionar={() => { setEscolhidas((l) => [...l, ficha]); setFicha(null) }} />
        </Janela>
      )}
    </Janela>
  )
}
