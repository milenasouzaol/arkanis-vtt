import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faBriefcase, faMagnifyingGlass, faPlus } from '@fortawesome/free-solid-svg-icons'
import type { EntradaCompendio, Sistema } from '../../sistemas/tipos'

// Busca no compêndio do sistema (equipamentos prontos dos livros). Usado no Criar Item (escolhe
// um: item já preenchido e ligado a ele) e no Estoque/Conteúdo (multiplo: marca vários — ou
// "Marcar todos" do filtro, ex.: todas as armas de categoria I — e adiciona de uma vez).
export function BuscaCompendio({ sistema, onEscolher, multiplo, jaTem, onEscolherVarios }: {
  sistema: Sistema
  onEscolher?: (e: EntradaCompendio) => void
  multiplo?: boolean
  jaTem?: Set<string> // ids que já estão no estoque (aparecem marcados como "já está")
  onEscolherVarios?: (lista: EntradaCompendio[]) => void
}) {
  const [termo, setTermo] = useState('')
  const [tipo, setTipo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [lista, setLista] = useState<EntradaCompendio[]>([])
  const [carregando, setCarregando] = useState(true)
  const [marcados, setMarcados] = useState<Map<string, EntradaCompendio>>(new Map())
  const compendio = sistema.compendio

  useEffect(() => {
    if (!compendio) return
    let vivo = true
    setCarregando(true)
    const t = setTimeout(() => {
      compendio.buscar(termo, tipo || undefined, categoria || undefined).then((l) => {
        if (!vivo) return
        setLista(l)
        setCarregando(false)
      })
    }, 200)
    return () => {
      vivo = false
      clearTimeout(t)
    }
  }, [compendio, termo, tipo, categoria])

  if (!compendio) return <p className="item-vazio">Este sistema não tem compêndio.</p>

  const disponiveis = lista.filter((e) => !jaTem?.has(e.id))
  const todosMarcados = disponiveis.length > 0 && disponiveis.every((e) => marcados.has(e.id))
  const alternar = (e: EntradaCompendio) => setMarcados((m) => {
    const n = new Map(m)
    if (n.has(e.id)) n.delete(e.id)
    else n.set(e.id, e)
    return n
  })
  const marcarTodos = () => setMarcados((m) => {
    const n = new Map(m)
    if (todosMarcados) for (const e of disponiveis) n.delete(e.id)
    else for (const e of disponiveis) n.set(e.id, e)
    return n
  })

  return (
    <div className="compendio">
      <div className="compendio-filtros">
        <label className="itens-busca compendio-busca">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input autoFocus value={termo} placeholder={`Procurar ${compendio.nome}`} aria-label={`Procurar ${compendio.nome}`} onChange={(e) => setTermo(e.target.value)} />
        </label>
        <select value={tipo} aria-label="Tipo" onChange={(e) => setTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          {compendio.tipos.map((t) => <option key={t.id} value={t.id}>{t.rotulo}</option>)}
        </select>
        {sistema.categoriasDeItem.length > 0 && (
          <select value={categoria} aria-label="Categoria" onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas as categorias</option>
            {sistema.categoriasDeItem.map((c) => <option key={c} value={c}>Categoria {c}</option>)}
          </select>
        )}
      </div>

      {multiplo && (
        <div className="compendio-marcar">
          <label className="janela-check">
            <input type="checkbox" checked={todosMarcados} disabled={!disponiveis.length} onChange={marcarTodos} />
            Marcar todos ({disponiveis.length})
          </label>
          <button
            type="button"
            className="janela-botao janela-botao-destaque"
            disabled={!marcados.size}
            onClick={() => onEscolherVarios?.([...marcados.values()])}
          >
            <FontAwesomeIcon icon={faPlus} /> Adicionar ({marcados.size})
          </button>
        </div>
      )}

      <ul className="compendio-lista">
        {lista.map((e) => {
          const ja = !!jaTem?.has(e.id)
          const detalhe = [compendio.tipos.find((t) => t.id === e.tipo)?.rotulo ?? e.tipo, sistema.categoriasDeItem.length ? `Categoria ${e.categoria}` : '', `${e.carga} espaço${e.carga === 1 ? '' : 's'}`, ja ? 'já está' : ''].filter(Boolean).join(' · ')
          const conteudo = (
            <>
              <span className="ator-token item-imagem">{e.imagem ? <img src={e.imagem} alt="" /> : <FontAwesomeIcon icon={faBriefcase} />}</span>
              <span className="compendio-nome">
                <strong>{e.nome}</strong>
                <small>{detalhe}</small>
              </span>
            </>
          )
          return (
            <li key={e.id}>
              {multiplo ? (
                <label className={`ator-linha compendio-linha${ja ? ' ja' : ''}`}>
                  <input type="checkbox" checked={ja || marcados.has(e.id)} disabled={ja} onChange={() => alternar(e)} />
                  {conteudo}
                </label>
              ) : (
                <button type="button" className="ator-linha compendio-linha" onClick={() => onEscolher?.(e)}>{conteudo}</button>
              )}
            </li>
          )
        })}
        {!carregando && !lista.length && <li className="item-vazio">Nada encontrado.</li>}
      </ul>
    </div>
  )
}

export const ICONE_COMPENDIO = faBook
