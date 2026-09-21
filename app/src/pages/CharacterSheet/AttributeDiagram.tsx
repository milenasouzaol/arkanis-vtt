import { useState } from 'react'
import type { Attributes, AttributeKey } from '../../lib/rules'
import attributesDiagram from '../../assets/attributes-diagram.png'

const ATTRS: { key: AttributeKey; abbr: string; top: string; left: string }[] = [
  { key: 'agilidade', abbr: 'AGI', top: '16%', left: '50.2%' },
  { key: 'forca', abbr: 'FOR', top: '38%', left: '18.8%' },
  { key: 'intelecto', abbr: 'INT', top: '38%', left: '81.6%' },
  { key: 'presenca', abbr: 'PRE', top: '77%', left: '27%' },
  { key: 'vigor', abbr: 'VIG', top: '77%', left: '72.4%' },
]

const NEX_OPTIONS = [0, ...Array.from({ length: 19 }, (_, i) => (i + 1) * 5), 99]

export default function AttributeDiagram({
  attributes,
  nexPercent,
  onRoll,
  onNexChange,
  editable,
  onAttributeChange,
  bonus,
}: {
  attributes: Attributes
  nexPercent: number
  onRoll: (key: AttributeKey, abbr: string) => void
  onNexChange: (value: number) => void
  editable?: boolean
  onAttributeChange?: (key: AttributeKey, value: number) => void
  /** Bônus de item equipado, mostrado do lado do número em vez de somado nele. */
  bonus?: Partial<Record<AttributeKey, number>>
}) {
  const [nexOpen, setNexOpen] = useState(false)

  return (
    <div className="attr-diagram">
      <img src={attributesDiagram} alt="Atributos" />
      <button
        type="button"
        className="attr-value-badge attr-nex-badge"
        onClick={() => setNexOpen((v) => !v)}
        aria-label="NEX"
      >
        {nexPercent}%
      </button>
      {nexOpen && (
        <>
          <div className="nex-dropdown-backdrop" onClick={() => setNexOpen(false)} />
          <ul className="nex-dropdown">
            {NEX_OPTIONS.map((n) => (
              <li key={n}>
                <button
                  type="button"
                  className={n === nexPercent ? 'active' : undefined}
                  onClick={() => { onNexChange(n); setNexOpen(false) }}
                >
                  {n}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {ATTRS.map(({ key, abbr, top, left }) =>
        editable ? (
          <input
            key={key}
            type="number"
            className="attr-value-badge attr-value-input"
            style={{ top, left }}
            value={attributes[key]}
            onChange={(e) => onAttributeChange?.(key, Number(e.target.value))}
            aria-label={abbr}
          />
        ) : (
          <button
            key={key}
            type="button"
            className="attr-value-badge"
            style={{ top, left }}
            onClick={() => onRoll(key, abbr)}
            aria-label={`Rolar ${abbr}`}
          >
            {attributes[key]}
            {!!bonus?.[key] && <span className="attr-item-bonus">+{bonus[key]}</span>}
          </button>
        )
      )}
    </div>
  )
}
