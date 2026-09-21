import mysteryIcon from '../../assets/combate/op-icon-misterio-custom.png'

// Os mesmos rotulos do card de item: o ataque que vem de uma arma do inventario carrega
// esses codigos, e tem que ler igual nos dois lugares.
const ALCANCE_LABEL: Record<string, string> = {
  curto: 'Curto', medio: 'Médio', longo: 'Longo', extremo: 'Extremo',
}

const NATUREZA_LABEL: Record<string, string> = {
  corpo_a_corpo: 'Corpo a Corpo', disparo: 'Disparo', fogo: 'Fogo',
}

const EMPUNHADURA_LABEL: Record<string, string> = {
  nenhuma: 'Nenhuma', uma_mao: 'Uma Mão', duas_maos: 'Duas Mãos',
}

function rotulo(mapa: Record<string, string>, valor: unknown) {
  const chave = String(valor ?? '')
  if (!chave) return null
  return mapa[chave] ?? chave
}

export type AttackGeneralInfo = {
  tipo?: string
  empunhadura?: string
  alcance?: string
  tipo_municao?: string
  municao?: string | null
} | null

// So entram os campos que o ataque realmente tem - arma branca nao mostra municao vazia.
export function caracteristicas(info: AttackGeneralInfo): { label: string; value: string }[] {
  const dados = info ?? {}
  const pares: { label: string; value: string | null }[] = [
    { label: 'Tipo', value: rotulo(NATUREZA_LABEL, dados.tipo) },
    { label: 'Alcance', value: rotulo(ALCANCE_LABEL, dados.alcance) },
    { label: 'Empunhadura', value: rotulo(EMPUNHADURA_LABEL, dados.empunhadura) },
    { label: 'Munição', value: dados.municao ?? (dados.tipo_municao ? String(dados.tipo_municao) : null) },
  ]
  return pares.filter((p): p is { label: string; value: string } => !!p.value)
}

export default function AttackCard({
  name,
  ataque,
  dano,
  critico,
  info,
  descricao,
  municaoRestante,
  expanded,
  onToggle,
  rollButtons,
  onRemove,
  onEdit,
}: {
  name: string
  ataque: string
  dano: string
  critico: string
  info: AttackGeneralInfo
  descricao?: string | null
  /** "12/15 Balas", quando a arma tem munição vinculada no inventário. */
  municaoRestante?: string | null
  expanded: boolean
  onToggle: () => void
  rollButtons: React.ReactNode
  onRemove: () => void
  onEdit: () => void
}) {
  const lista = caracteristicas(info)

  return (
    <div className={`inv-item-card attack-card${expanded ? ' expanded' : ''}`}>
      <button type="button" className="inv-item-head" onClick={onToggle}>
        <img className="inv-item-icon" src={mysteryIcon} alt="" />
        <span className="inv-item-name">{name}</span>
        <span className={`inv-item-chevron${expanded ? ' up' : ''}`} aria-hidden>⌄</span>
      </button>

      <div className="attack-card-boxes">
        <span className="attack-card-box">
          <span className="attack-card-box-value">{ataque}</span>
          <span className="attack-card-box-label">Ataque</span>
        </span>
        <span className="attack-card-box">
          <span className="attack-card-box-value">{dano}</span>
          <span className="attack-card-box-label">Dano</span>
        </span>
        <span className="attack-card-box">
          <span className="attack-card-box-value">{critico}</span>
          <span className="attack-card-box-label">Crítico</span>
        </span>
      </div>

      {municaoRestante && (
        <div className="inv-item-qty-row">
          <span className="inv-item-qty-label">Munição:</span>
          <span className="inv-item-qty-box"><span className="inv-item-qty-value">{municaoRestante}</span></span>
        </div>
      )}

      <div className="attack-card-rolls">{rollButtons}</div>

      {expanded && (
        <>
          {lista.length > 0 && (
            <>
              <div className="inv-item-divider" />
              <dl className="inv-item-details">
                {lista.map((d) => (
                  <div key={d.label}>
                    <dt>{d.label}</dt>
                    <dd>{d.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          {descricao && (
            <>
              <div className="inv-item-divider" />
              <p className="inv-item-description">{descricao}</p>
            </>
          )}

          <div className="inv-item-actions">
            <button type="button" className="inv-item-btn" onClick={onRemove}>Remover</button>
            <span className="inv-item-actions-right">
              <button type="button" className="inv-item-btn" onClick={onEdit}>Editar</button>
            </span>
          </div>
        </>
      )}
    </div>
  )
}
