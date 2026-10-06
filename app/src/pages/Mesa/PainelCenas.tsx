import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck, faClone, faFloppyDisk, faFolder, faFolderOpen, faFolderPlus, faMap, faPenToSquare, faPeopleArrows, faTrash,
} from '@fortawesome/free-solid-svg-icons'
import Janela, { Campo, CampoCor } from './Janela'
import { montarArvore, pastasEmLista, type Cena, type NoPasta, type Pasta } from './cenas'
import { tocarSom } from '../../lib/sons'

type Alvo = { tipo: 'cena'; cena: Cena } | { tipo: 'pasta'; pasta: Pasta }
type Menu = { x: number; y: number } & Alvo

// Aba Cenas (12.5): Criar Cena / Criar Pasta, pastas com subpastas e as miniaturas.
// Clicar abre a cena só pra quem clicou; o mestre muda a de todo mundo com "Ativar Cena".
export default function PainelCenas({ souMestre, cenas, pastas, ativa, vendo, onAbrir, onEditar, onAtivar, onTrazerTodos, onExcluir, onDuplicar, onCriarCena, onCriarPasta, onSalvarPasta, onExcluirPasta }: {
  souMestre: boolean
  cenas: Cena[]
  pastas: Pasta[]
  ativa: string | null
  vendo: string | null
  onAbrir: (c: Cena) => void
  onEditar: (c: Cena) => void
  onAtivar: (c: Cena) => void
  onTrazerTodos: (c: Cena) => void
  onExcluir: (c: Cena) => void
  onDuplicar: (c: Cena) => void
  onCriarCena: (nome: string, pastaId: string | null) => void
  onCriarPasta: (p: Pick<Pasta, 'name' | 'color' | 'sort_mode' | 'parent_id'>) => void
  onSalvarPasta: (id: string, p: Pick<Pasta, 'name' | 'color' | 'sort_mode'>) => void
  onExcluirPasta: (p: Pasta, comCenas: boolean) => void
}) {
  const [menu, setMenu] = useState<Menu | null>(null)
  const [criandoCena, setCriandoCena] = useState<{ pasta: string | null } | null>(null)
  const [criandoPasta, setCriandoPasta] = useState<{ pai: string | null } | null>(null)
  const [editandoPasta, setEditandoPasta] = useState<Pasta | null>(null)
  const [fechadas, setFechadas] = useState<Set<string>>(new Set())
  const arvore = montarArvore(pastas, cenas)

  useEffect(() => {
    if (!menu) return
    const fechar = () => setMenu(null)
    window.addEventListener('scroll', fechar, true)
    return () => window.removeEventListener('scroll', fechar, true)
  }, [menu])

  function abrirMenu(e: React.MouseEvent, m: Alvo) {
    if (!souMestre) return
    e.preventDefault()
    setMenu({ ...m, x: Math.min(e.clientX, window.innerWidth - 230), y: Math.min(e.clientY, window.innerHeight - 200) })
  }

  function alternar(id: string) {
    setFechadas((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const cartao = (c: Cena) => (
    <li key={c.id}>
      <button
        type="button"
        className={`cena-cartao${c.id === ativa ? ' ativa' : ''}${c.id === vendo ? ' vendo' : ''}`}
        style={c.background_url ? { backgroundImage: `url(${c.background_url})` } : undefined}
        onClick={() => onAbrir(c)}
        onContextMenu={(e) => abrirMenu(e, { tipo: 'cena', cena: c })}
        aria-label={c.name}
        title={souMestre ? 'Clique pra olhar; botão direito › Ativar Cena pra mostrar pra todos' : undefined}
      >
        <span>{c.name}</span>
        {c.id === ativa && <FontAwesomeIcon icon={faCheck} className="cena-cartao-ativa" aria-label="Cena ativa" />}
      </button>
    </li>
  )

  const pasta = (n: NoPasta) => {
    const aberta = !fechadas.has(n.pasta.id)
    return (
      <li key={n.pasta.id} className="cena-pasta">
        <div className="cena-pasta-topo" style={n.pasta.color ? { background: n.pasta.color } : undefined} onContextMenu={(e) => abrirMenu(e, { tipo: 'pasta', pasta: n.pasta })}>
          <button type="button" className="cena-pasta-nome" aria-expanded={aberta} onClick={() => alternar(n.pasta.id)}>
            <FontAwesomeIcon icon={aberta ? faFolderOpen : faFolder} /> {n.pasta.name}
          </button>
          {souMestre && (
            <>
              <button type="button" className="cena-pasta-acao" aria-label="Criar outra pasta" title="Criar Pasta" onClick={() => setCriandoPasta({ pai: n.pasta.id })}>
                <FontAwesomeIcon icon={faFolderPlus} />
              </button>
              <button type="button" className="cena-pasta-acao" aria-label="Criar uma cena nesta pasta" title="Criar Cena" onClick={() => setCriandoCena({ pasta: n.pasta.id })}>
                <FontAwesomeIcon icon={faMap} />
                <span className="cena-pasta-mais">+</span>
              </button>
            </>
          )}
        </div>
        {aberta && (
          <ul className="cena-lista">
            {n.pastas.map(pasta)}
            {n.cenas.map(cartao)}
          </ul>
        )}
      </li>
    )
  }

  const vazio = !arvore.pastas.length && !arvore.cenas.length

  return (
    <div className="cenas-painel">
      {souMestre && (
        <div className="cenas-botoes">
          <button type="button" className="mesa-botao" onClick={() => setCriandoCena({ pasta: null })}>
            <FontAwesomeIcon icon={faMap} /> Criar Cena
          </button>
          <button type="button" className="mesa-botao" onClick={() => setCriandoPasta({ pai: null })}>
            <FontAwesomeIcon icon={faFolder} /> Criar Pasta
          </button>
        </div>
      )}

      {vazio && (
        <p className="mesa-painel-vazio">
          {souMestre ? 'Nenhuma cena ainda. Crie uma, ou arraste uma imagem pra mesa.' : 'Nenhuma cena disponível pra você ainda.'}
        </p>
      )}

      <ul className="cena-lista cena-raiz">
        {arvore.pastas.map(pasta)}
        {arvore.cenas.map(cartao)}
      </ul>

      {menu && (
        <>
          <div className="dropdown-backdrop" onClick={() => setMenu(null)} onContextMenu={(e) => { e.preventDefault(); setMenu(null) }} />
          <ul className="mesa-menu" style={{ left: menu.x, top: menu.y }}>
            {menu.tipo === 'cena' ? (
              <>
                <li><button type="button" disabled={menu.cena.id === ativa} onClick={() => { onAtivar(menu.cena); setMenu(null) }}><FontAwesomeIcon icon={faCheck} /> {menu.cena.id === ativa ? 'Cena Ativa' : 'Ativar Cena'}</button></li>
                <li><button type="button" onClick={() => { onEditar(menu.cena); setMenu(null) }}><FontAwesomeIcon icon={faPenToSquare} /> Editar</button></li>
                <li><button type="button" onClick={() => { onTrazerTodos(menu.cena); setMenu(null) }}><FontAwesomeIcon icon={faPeopleArrows} /> Trazer todos pra cá</button></li>
                <li>
                  <button type="button" onClick={() => {
                    if (window.confirm(`Excluir a cena "${menu.cena.name}"?`)) onExcluir(menu.cena)
                    setMenu(null)
                  }}><FontAwesomeIcon icon={faTrash} /> Excluir</button>
                </li>
                <li><button type="button" onClick={() => { onDuplicar(menu.cena); setMenu(null) }}><FontAwesomeIcon icon={faClone} /> Duplicar</button></li>
              </>
            ) : (
              <>
                <li><button type="button" onClick={() => { setEditandoPasta(menu.pasta); setMenu(null) }}><FontAwesomeIcon icon={faPenToSquare} /> Editar Pasta</button></li>
                <li>
                  <button type="button" onClick={() => {
                    if (window.confirm(`Remover a pasta "${menu.pasta.name}"? As cenas dela ficam soltas na lista.`)) onExcluirPasta(menu.pasta, false)
                    setMenu(null)
                  }}><FontAwesomeIcon icon={faFolder} /> Remover Pasta</button>
                </li>
                <li>
                  <button type="button" onClick={() => {
                    if (window.confirm(`Excluir a pasta "${menu.pasta.name}" e todas as cenas dentro dela?`)) onExcluirPasta(menu.pasta, true)
                    setMenu(null)
                  }}><FontAwesomeIcon icon={faTrash} /> Excluir Todas</button>
                </li>
              </>
            )}
          </ul>
        </>
      )}

      {criandoCena && (
        <CriarCena
          pastas={pastas}
          pastaInicial={criandoCena.pasta}
          sugestao={`Cena (${cenas.length + 1})`}
          onCriar={(nome, pastaId) => { onCriarCena(nome, pastaId); setCriandoCena(null) }}
          onFechar={() => setCriandoCena(null)}
        />
      )}

      {criandoPasta && (
        <CriarPasta
          onCriar={(p) => { onCriarPasta({ ...p, parent_id: criandoPasta.pai }); setCriandoPasta(null) }}
          onFechar={() => setCriandoPasta(null)}
        />
      )}

      {editandoPasta && (
        <CriarPasta
          inicial={editandoPasta}
          onCriar={(campos) => { onSalvarPasta(editandoPasta.id, campos); setEditandoPasta(null) }}
          onFechar={() => setEditandoPasta(null)}
        />
      )}
    </div>
  )
}

function CriarCena({ pastas, pastaInicial, sugestao, onCriar, onFechar }: {
  pastas: Pasta[]
  pastaInicial: string | null
  sugestao: string
  onCriar: (nome: string, pastaId: string | null) => void
  onFechar: () => void
}) {
  const [nome, setNome] = useState('')
  const [pasta, setPasta] = useState(pastaInicial ?? '')
  return (
    <Janela titulo="Criar Cena" largura={340} onFechar={onFechar}>
      <form className="janela-form" onSubmit={(e) => { e.preventDefault(); onCriar(nome.trim() || sugestao, pasta || null) }}>
        <Campo rotulo="Nome">
          <input autoFocus value={nome} placeholder={sugestao} aria-label="Nome" onChange={(e) => setNome(e.target.value)} />
        </Campo>
        <Campo rotulo="Pasta">
          <select value={pasta} aria-label="Pasta" onChange={(e) => setPasta(e.target.value)}>
            <option value="">Sem pasta</option>
            {pastasEmLista(pastas).map((p) => <option key={p.id} value={p.id}>{p.rotulo}</option>)}
          </select>
        </Campo>
        <button type="submit" className="janela-botao"><FontAwesomeIcon icon={faCheck} /> Criar Cena</button>
      </form>
    </Janela>
  )
}

export function CriarPasta({ inicial, onCriar, onFechar }: {
  inicial?: Pasta
  onCriar: (p: Pick<Pasta, 'name' | 'color' | 'sort_mode'>) => void
  onFechar: () => void
}) {
  const [nome, setNome] = useState(inicial?.name ?? '')
  const [cor, setCor] = useState(inicial?.color ?? '#000000')
  const [modo, setModo] = useState<Pasta['sort_mode']>(inicial?.sort_mode ?? 'alfabetica')
  return (
    <Janela titulo={`Pasta: ${nome.trim() || 'Pasta'}`} icone={faFolder} largura={460} onFechar={onFechar}>
      <form className="janela-form" onSubmit={(e) => { e.preventDefault(); if (!inicial) tocarSom('criar'); onCriar({ name: nome.trim() || 'Pasta', color: cor === '#000000' ? null : cor, sort_mode: modo }) }}>
        <Campo rotulo="Nome da Pasta">
          <input autoFocus value={nome} placeholder="Pasta" aria-label="Nome da Pasta" onChange={(e) => setNome(e.target.value)} />
        </Campo>
        <Campo rotulo="Cor da Pasta">
          <CampoCor rotulo="Cor da Pasta" valor={cor} onMudar={setCor} />
        </Campo>
        <Campo rotulo="Modo de Organização">
          <div className="janela-linha janela-linha-direita" role="radiogroup" aria-label="Modo de Organização">
            <label className="janela-radio"><input type="radio" checked={modo === 'alfabetica'} onChange={() => setModo('alfabetica')} /> Alfabética</label>
            <label className="janela-radio"><input type="radio" checked={modo === 'manual'} onChange={() => setModo('manual')} /> Manual</label>
          </div>
        </Campo>
        <button type="submit" className="janela-botao"><FontAwesomeIcon icon={faFloppyDisk} /> {inicial ? 'Salvar Alterações' : 'Criar Pasta'}</button>
      </form>
    </Janela>
  )
}
