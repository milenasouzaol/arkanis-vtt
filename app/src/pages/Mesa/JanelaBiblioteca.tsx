import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faCheck } from '@fortawesome/free-solid-svg-icons'
import Janela from './Janela'
import {
  carregarBiblioteca, colecoesDa, filtrarBiblioteca, imagemDaBiblioteca, miniaturaDaBiblioteca, TIPO_ARRASTO_BIBLIOTECA, type TokenBiblioteca,
} from './biblioteca'

// Quantos aparecem de cada vez (o resto vem no "Mostrar mais").
const PAGINA = 60

type PropsBusca = {
  dica?: string
  // Endereços já escolhidos (aparecem marcados).
  escolhidos?: string[]
  // Já abre procurando isto (ex.: o nome do item da ficha).
  buscaInicial?: string
  // Só o que tem alguma destas etiquetas (ex.: ['item'] na ficha).
  tags?: string[]
  // Na mesa dá pra arrastar direto pro mapa; na ficha não.
  arrastavel?: boolean
  onEscolher: (t: TokenBiblioteca, url: string) => void
}

// Busca da Biblioteca (pedido da Millie, 07/10): código ou palavra (com as parentes: "espada"
// acha katanas), filtro por coleção, clica pra usar.
export function BuscaBiblioteca({ dica, escolhidos = [], buscaInicial = '', tags, arrastavel = true, onEscolher }: PropsBusca) {
  const [lista, setLista] = useState<TokenBiblioteca[] | null>(null)
  const [busca, setBusca] = useState(buscaInicial)
  const [colecao, setColecao] = useState('')
  const [limite, setLimite] = useState(PAGINA)

  useEffect(() => {
    carregarBiblioteca().then(setLista)
  }, [])

  const daBusca = useMemo(() => (lista ?? []).filter((t) => !tags || t.tags.some((x) => tags.includes(x))), [lista, tags])
  const achados = useMemo(() => filtrarBiblioteca(daBusca, busca, colecao || null), [daBusca, busca, colecao])

  return (
    <div className="biblioteca">
      <div className="biblioteca-filtro">
        <input
          autoFocus
          value={busca}
          placeholder="Código (#042) ou palavra: mulher, monstro, espada, escudo…"
          aria-label="Procurar na biblioteca"
          onChange={(e) => { setBusca(e.target.value); setLimite(PAGINA) }}
        />
        <select value={colecao} aria-label="Coleção" onChange={(e) => { setColecao(e.target.value); setLimite(PAGINA) }}>
          <option value="">Todas as coleções</option>
          {colecoesDa(daBusca).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <p className="janela-dica">{dica ?? 'Clique pra usar, ou arraste direto pra mesa.'} {lista && <strong>{achados.length} {achados.length === 1 ? 'imagem' : 'imagens'}</strong>}</p>

      <div className="janela-rolagem biblioteca-grade">
        {!lista && <p className="janela-dica">Carregando…</p>}
        {lista && !achados.length && <p className="janela-dica">Nada encontrado.</p>}
        {achados.slice(0, limite).map((t) => {
          const url = imagemDaBiblioteca(t)
          const marcado = escolhidos.includes(url)
          return (
            <button
              key={t.id}
              type="button"
              className={`biblioteca-token${marcado ? ' ativo' : ''}`}
              title={[t.nome, t.grupo, t.colecao].filter(Boolean).join(' · ')}
              draggable={arrastavel}
              onDragStart={(e) => {
                if (!arrastavel) return
                e.dataTransfer.setData(TIPO_ARRASTO_BIBLIOTECA, JSON.stringify({ url, nome: t.nome }))
                e.dataTransfer.effectAllowed = 'copy'
              }}
              onClick={() => onEscolher(t, url)}
            >
              <span className="biblioteca-imagem"><img src={miniaturaDaBiblioteca(t)} alt="" loading="lazy" draggable={false} /></span>
              <span className="biblioteca-nome">{t.nome}</span>
              <small className="biblioteca-codigo">#{t.id}</small>
              {marcado && <FontAwesomeIcon className="biblioteca-marca" icon={faCheck} />}
            </button>
          )
        })}
        {achados.length > limite && (
          <button type="button" className="mesa-botao biblioteca-mais" onClick={() => setLimite((l) => l + PAGINA)}>
            Mostrar mais ({achados.length - limite})
          </button>
        )}
      </div>
    </div>
  )
}

// Biblioteca de Tokens na mesa: janela flutuante.
export default function JanelaBiblioteca({ titulo = 'Biblioteca de Tokens', onFechar, ...busca }: PropsBusca & { titulo?: string; onFechar: () => void }) {
  return (
    <Janela titulo={titulo} icone={faBookOpen} largura={640} altura={640} onFechar={onFechar}>
      <BuscaBiblioteca {...busca} />
    </Janela>
  )
}
