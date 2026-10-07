import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faCheck } from '@fortawesome/free-solid-svg-icons'
import Janela from './Janela'
import {
  carregarBiblioteca, colecoesDa, filtrarBiblioteca, imagemDaBiblioteca, miniaturaDaBiblioteca, TIPO_ARRASTO_BIBLIOTECA, type TokenBiblioteca,
} from './biblioteca'

// Quantos aparecem de cada vez (o resto vem no "Mostrar mais").
const PAGINA = 60

// Biblioteca de Tokens (pedido da Millie, 07/10): procura por código ou palavra, clica pra usar.
// Também dá pra arrastar o token daqui direto pra mesa.
export default function JanelaBiblioteca({ titulo = 'Biblioteca de Tokens', dica, escolhidos = [], onEscolher, onFechar }: {
  titulo?: string
  dica?: string
  // Endereços já escolhidos (aparecem marcados).
  escolhidos?: string[]
  onEscolher: (t: TokenBiblioteca, url: string) => void
  onFechar: () => void
}) {
  const [lista, setLista] = useState<TokenBiblioteca[] | null>(null)
  const [busca, setBusca] = useState('')
  const [colecao, setColecao] = useState('')
  const [limite, setLimite] = useState(PAGINA)

  useEffect(() => {
    carregarBiblioteca().then(setLista)
  }, [])

  const achados = useMemo(() => filtrarBiblioteca(lista ?? [], busca, colecao || null), [lista, busca, colecao])

  return (
    <Janela titulo={titulo} icone={faBookOpen} largura={640} altura={640} onFechar={onFechar}>
      <div className="biblioteca">
        <div className="biblioteca-filtro">
          <input
            autoFocus
            value={busca}
            placeholder="Código (#042) ou palavra: mulher, homem, monstro, sangue…"
            aria-label="Procurar na biblioteca"
            onChange={(e) => { setBusca(e.target.value); setLimite(PAGINA) }}
          />
          <select value={colecao} aria-label="Coleção" onChange={(e) => { setColecao(e.target.value); setLimite(PAGINA) }}>
            <option value="">Todas as coleções</option>
            {colecoesDa(lista ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <p className="janela-dica">{dica ?? 'Clique pra usar, ou arraste direto pra mesa.'} {lista && <strong>{achados.length} token{achados.length === 1 ? '' : 's'}</strong>}</p>

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
                draggable
                onDragStart={(e) => {
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
    </Janela>
  )
}
