import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faBriefcase, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import type { EntradaCompendio, Sistema } from '../../sistemas/tipos'

// Busca no compêndio do sistema (equipamentos prontos dos livros) e escolhe um. Usado no
// Criar Item (item já preenchido e ligado ao equipamento) e no Conteúdo do contêiner.
export function BuscaCompendio({ sistema, onEscolher }: { sistema: Sistema; onEscolher: (e: EntradaCompendio) => void }) {
  const [termo, setTermo] = useState('')
  const [tipo, setTipo] = useState('')
  const [lista, setLista] = useState<EntradaCompendio[]>([])
  const [carregando, setCarregando] = useState(true)
  const compendio = sistema.compendio

  useEffect(() => {
    if (!compendio) return
    let vivo = true
    setCarregando(true)
    const t = setTimeout(() => {
      compendio.buscar(termo, tipo || undefined).then((l) => {
        if (!vivo) return
        setLista(l)
        setCarregando(false)
      })
    }, 200)
    return () => {
      vivo = false
      clearTimeout(t)
    }
  }, [compendio, termo, tipo])

  if (!compendio) return <p className="item-vazio">Este sistema não tem compêndio.</p>

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
      </div>
      <ul className="compendio-lista">
        {lista.map((e) => (
          <li key={e.id}>
            <button type="button" className="ator-linha compendio-linha" onClick={() => onEscolher(e)}>
              <span className="ator-token item-imagem">{e.imagem ? <img src={e.imagem} alt="" /> : <FontAwesomeIcon icon={faBriefcase} />}</span>
              <span className="compendio-nome">
                <strong>{e.nome}</strong>
                <small>{[compendio.tipos.find((t) => t.id === e.tipo)?.rotulo ?? e.tipo, sistema.categoriasDeItem.length ? `Categoria ${e.categoria}` : '', `${e.carga} espaço${e.carga === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}</small>
              </span>
            </button>
          </li>
        ))}
        {!carregando && !lista.length && <li className="item-vazio">Nada encontrado.</li>}
      </ul>
    </div>
  )
}

export const ICONE_COMPENDIO = faBook
