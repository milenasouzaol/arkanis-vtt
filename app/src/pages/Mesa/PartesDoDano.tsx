import { DIE_COLOR } from '../CharacterSheet/RollResult'
import { corDoElemento } from '../CharacterSheet/danoDaArma'
import { nomeDoTipo } from './mira'

export type ParteParaMostrar = { formula?: string; tipo: string; origem?: string; elemento?: string; lados?: number; total?: number; valor?: number }

// Cada parte do dano numa linha (pedido da Millie em 05/10): a fórmula na cor do dado (igual aos
// cartões de rolagem), o tipo, de onde veio (na cor do elemento) e quanto deu.
export default function PartesDoDano({ partes }: { partes: ParteParaMostrar[] }) {
  if (partes.length < 1) return null
  return (
    <ul className="chat-partes">
      {partes.map((p, i) => {
        const lados = p.lados ?? Number(/d(\d+)/i.exec(p.formula ?? '')?.[1] ?? 0)
        const cor = corDoElemento(p.elemento)
        return (
          <li key={i}>
            {p.formula && <span className="chat-partes-formula" style={{ background: DIE_COLOR[lados] ?? '#3a3a3e' }}>{p.formula}</span>}
            <span className="chat-partes-tipo">{nomeDoTipo(p.tipo)}</span>
            {p.origem && <span className="chat-partes-origem" style={cor ? { background: cor, color: cor === '#e8e8e8' ? '#191813' : '#fff' } : undefined}>{p.origem}</span>}
            <strong className="chat-partes-valor">{p.total ?? p.valor}</strong>
          </li>
        )
      })}
    </ul>
  )
}
