import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowDownAZ, faArrowDown19, faBriefcase, faClone, faFloppyDisk, faFolder, faFolderOpen, faFolderPlus, faFolderTree, faMagnifyingGlass, faPenToSquare,
  faPlus, faTrash, faUserGear,
} from '@fortawesome/free-solid-svg-icons'
import Janela, { Campo } from './Janela'
import MenuContexto, { type ItemMenu } from './MenuContexto'
import { montarArvore, type NoPasta, type Pasta } from './cenas'
import { CATEGORIAS_ITEM, nivelNoItem, ordenarItens, type CategoriaItem, type ItemMesa } from './itens'

export const TIPO_ARRASTO_ITEM = 'application/x-arkanis-item'

type Acoes = {
  onAbrir: (i: ItemMesa) => void
  onPropriedade: (i: ItemMesa) => void
  onDuplicar: (i: ItemMesa) => void
  onExcluir: (i: ItemMesa) => void
  onCriar: (pasta: string | null) => void
  onCriarPasta: (pai: string | null) => void
  onEditarPasta: (p: Pasta) => void
  onExcluirPasta: (p: Pasta) => void
}

// Aba Itens (KAN-53, spec 12.10 + prints do Foundry da Millie): Criar Item / Criar Pasta, busca
// "Procurar Itens", ordem alfabética ou de criação, e a lista com a imagem e o nome.
export default function PainelItens({ souMestre, userId, itens, pastas, acoes }: {
  souMestre: boolean
  userId: string
  itens: ItemMesa[]
  pastas: Pasta[]
  acoes: Acoes
}) {
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState<'alfabetica' | 'criacao'>('alfabetica')
  const [fechadas, setFechadas] = useState<Set<string>>(new Set())
  const [menu, setMenu] = useState<{ x: number; y: number; itens: ItemMenu[] } | null>(null)

  const ordenados = ordenarItens(itens, ordem).map((i, n) => ({ ...i, sort: n }))
  // A ordem da raiz e das pastas "alfabéticas" segue o botão; nas manuais, a ordem de criação.
  const arvore = montarArvore<ItemMesa>(pastas, ordenados, busca, ordem === 'alfabetica' ? 'alfabetica' : 'manual')

  function menuDoItem(e: React.MouseEvent, i: ItemMesa) {
    e.preventDefault()
    const nivel = nivelNoItem(i, userId, souMestre)
    if (nivel === 'limitado') return
    setMenu({
      x: e.clientX,
      y: e.clientY,
      itens: [
        { rotulo: nivel === 'dono' ? 'Editar' : 'Ver', icone: faPenToSquare, onClick: () => acoes.onAbrir(i) },
        ...(souMestre
          ? [
              { rotulo: 'Configurar Propriedade', icone: faUserGear, onClick: () => acoes.onPropriedade(i) } as ItemMenu,
              { rotulo: 'Excluir', icone: faTrash, perigo: true, onClick: () => acoes.onExcluir(i) } as ItemMenu,
              { rotulo: 'Duplicar', icone: faClone, onClick: () => acoes.onDuplicar(i) } as ItemMenu,
            ]
          : []),
      ],
    })
  }

  function menuDaPasta(e: React.MouseEvent, p: Pasta) {
    e.preventDefault()
    if (!souMestre) return
    setMenu({
      x: e.clientX,
      y: e.clientY,
      itens: [
        { rotulo: 'Editar Pasta', icone: faPenToSquare, onClick: () => acoes.onEditarPasta(p) },
        { rotulo: 'Remover Pasta', icone: faTrash, perigo: true, onClick: () => acoes.onExcluirPasta(p) },
      ],
    })
  }

  const linha = (i: ItemMesa) => {
    const limitado = nivelNoItem(i, userId, souMestre) === 'limitado'
    return (
      <li key={i.id}>
        <button
          type="button"
          className="ator-linha item-linha"
          draggable={souMestre}
          onDragStart={(e) => {
            e.dataTransfer.setData(TIPO_ARRASTO_ITEM, i.id)
            e.dataTransfer.effectAllowed = 'copy'
          }}
          onClick={() => !limitado && acoes.onAbrir(i)}
          onContextMenu={(e) => menuDoItem(e, i)}
        >
          <span className="ator-token item-imagem">{i.image_url ? <img src={i.image_url} alt="" draggable={false} /> : <FontAwesomeIcon icon={faBriefcase} />}</span>
          <span className="ator-nome">{i.name}</span>
        </button>
      </li>
    )
  }

  const pasta = (n: NoPasta<ItemMesa>) => {
    const aberta = !fechadas.has(n.pasta.id) || !!busca
    return (
      <li key={n.pasta.id} className="cena-pasta">
        <div className="cena-pasta-topo" style={n.pasta.color ? { background: n.pasta.color } : undefined} onContextMenu={(e) => menuDaPasta(e, n.pasta)}>
          <button
            type="button"
            className="cena-pasta-nome"
            aria-expanded={aberta}
            onClick={() => setFechadas((s) => { const x = new Set(s); if (x.has(n.pasta.id)) x.delete(n.pasta.id); else x.add(n.pasta.id); return x })}
          >
            <FontAwesomeIcon icon={aberta ? faFolderOpen : faFolder} /> {n.pasta.name}
          </button>
          {souMestre && (
            <>
              <button type="button" className="cena-pasta-acao" aria-label="Criar outra pasta" title="Criar Pasta" onClick={() => acoes.onCriarPasta(n.pasta.id)}>
                <FontAwesomeIcon icon={faFolderPlus} />
              </button>
              <button type="button" className="cena-pasta-acao" aria-label="Criar item nesta pasta" title="Criar Item" onClick={() => acoes.onCriar(n.pasta.id)}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </>
          )}
        </div>
        {aberta && (
          <ul className="cena-lista">
            {n.pastas.map(pasta)}
            {n.cenas.map(linha)}
          </ul>
        )}
      </li>
    )
  }

  return (
    <div className="cenas-painel">
      {souMestre && (
        <div className="cenas-botoes">
          <button type="button" className="mesa-botao" onClick={() => acoes.onCriar(null)}>
            <FontAwesomeIcon icon={faBriefcase} /> Criar Item
          </button>
          <button type="button" className="mesa-botao" onClick={() => acoes.onCriarPasta(null)}>
            <FontAwesomeIcon icon={faFolder} /> Criar Pasta
          </button>
        </div>
      )}

      <div className="itens-busca">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
        <input value={busca} placeholder="Procurar Itens" aria-label="Procurar Itens" onChange={(e) => setBusca(e.target.value)} />
        <button
          type="button"
          className="itens-busca-acao"
          title={ordem === 'alfabetica' ? 'Ordem: Alfabética' : 'Ordem: de Criação'}
          aria-label={ordem === 'alfabetica' ? 'Ordem alfabética (mudar pra ordem de criação)' : 'Ordem de criação (mudar pra alfabética)'}
          onClick={() => setOrdem((o) => (o === 'alfabetica' ? 'criacao' : 'alfabetica'))}
        >
          <FontAwesomeIcon icon={ordem === 'alfabetica' ? faArrowDownAZ : faArrowDown19} />
        </button>
        <button
          type="button"
          className="itens-busca-acao"
          title="Recolher Pastas"
          aria-label="Recolher Pastas"
          onClick={() => setFechadas(new Set(pastas.map((p) => p.id)))}
        >
          <FontAwesomeIcon icon={faFolderTree} />
        </button>
      </div>

      {!itens.length && <p className="mesa-painel-vazio">{souMestre ? 'Nenhum item ainda.' : 'Nenhum item à vista.'}</p>}

      <ul className="cena-lista cena-raiz">
        {arvore.pastas.map(pasta)}
        {arvore.cenas.map(linha)}
      </ul>

      {menu && (
        <div onPointerDown={(e) => e.stopPropagation()}>
          <MenuContexto x={menu.x} y={menu.y} itens={menu.itens} onFechar={() => setMenu(null)} />
        </div>
      )}
    </div>
  )
}

// Criar Item: nome e categoria (spec 12.10).
export function CriarItem({ onCriar, onFechar }: { onCriar: (nome: string, categoria: CategoriaItem) => void; onFechar: () => void }) {
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState<CategoriaItem>('lootavel')
  return (
    <Janela titulo="Criar Item" icone={faBriefcase} largura={420} onFechar={onFechar}>
      <form className="janela-form" onSubmit={(e) => { e.preventDefault(); onCriar(nome.trim() || 'Novo Item', categoria) }}>
        <Campo rotulo="Nome">
          <input autoFocus value={nome} placeholder="Novo Item" aria-label="Nome" onChange={(e) => setNome(e.target.value)} />
        </Campo>
        <Campo rotulo="Tipo">
          <select value={categoria} aria-label="Tipo" onChange={(e) => setCategoria(e.target.value as CategoriaItem)}>
            {CATEGORIAS_ITEM.map((c) => <option key={c.id} value={c.id}>{c.rotulo}</option>)}
          </select>
        </Campo>
        <button type="submit" className="janela-botao"><FontAwesomeIcon icon={faFloppyDisk} /> Criar Item</button>
      </form>
    </Janela>
  )
}
