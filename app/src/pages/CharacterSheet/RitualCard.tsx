import defaultRitualImg from '../../assets/rituais/op-default-ritual-img.svg'
import sangueTexture from '../../assets/rituais/sangue-texture.webp'
import morteTexture from '../../assets/rituais/morte-texture.webp'
import conhecimentoTexture from '../../assets/rituais/conhecimento-texture.webp'
import energiaTexture from '../../assets/rituais/energia-texture.webp'
import medoTexture from '../../assets/rituais/medo-texture.webp'

export const ELEMENT_TEXTURE: Record<string, string> = {
  sangue: sangueTexture,
  morte: morteTexture,
  conhecimento: conhecimentoTexture,
  energia: energiaTexture,
  medo: medoTexture,
}

const ROMAN: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' }

export type RitualView = {
  entryId: string
  name: string
  elemento: string | null
  circle: number
  execution: string | null
  range: string | null
  target: string | null
  area: string | null
  duration: string | null
  resistance: string | null
  effect: string
  description: string | null
  image_url: string | null
  dice: string | null
  diceDiscente: string | null
  diceVerdadeiro: string | null
}

// Os rituais do catalogo nao guardam a formula de dados numa coluna propria: o dano/cura
// aparece dentro do texto do efeito ("8d6 dano de Energia"). Entao a formula do botao sai
// do primeiro XdY(+Z) que aparecer no texto correspondente a cada modo.
export function diceFromText(text: string | null | undefined): string | null {
  if (!text) return null
  const m = text.match(/\b(\d+d\d+(?:\s*[+-]\s*\d+)?)/i)
  return m ? m[1].replace(/\s+/g, '') : null
}

export default function RitualCard({
  ritual,
  expanded,
  onToggle,
  onRoll,
  onRemove,
  onEdit,
}: {
  ritual: RitualView
  expanded: boolean
  onToggle: () => void
  onRoll: (mode: 'normal' | 'discente' | 'verdadeiro', formula: string) => void
  onRemove: () => void
  onEdit: () => void
}) {
  const texture = ritual.elemento ? ELEMENT_TEXTURE[ritual.elemento] : undefined
  const modes: { key: 'normal' | 'discente' | 'verdadeiro'; label: string; formula: string | null }[] = [
    { key: 'normal', label: 'Normal', formula: ritual.dice },
    { key: 'discente', label: 'Discente', formula: ritual.diceDiscente },
    { key: 'verdadeiro', label: 'Verdadeiro', formula: ritual.diceVerdadeiro },
  ]

  const meta: { label: string; value: string | null }[] = [
    { label: 'Execução', value: ritual.execution },
    { label: 'Alcance', value: ritual.range },
    { label: 'Alvo', value: ritual.target },
    { label: 'Área', value: ritual.area },
    { label: 'Duração', value: ritual.duration },
    { label: 'Resistência', value: ritual.resistance },
    { label: 'Efeito', value: ritual.effect },
  ].filter((m) => m.value)

  return (
    <div
      className={`ritual-card${expanded ? ' expanded' : ''}`}
      style={texture ? { backgroundImage: `url(${texture})` } : undefined}
    >
      <button type="button" className="ritual-card-head" onClick={onToggle}>
        <img className="ritual-card-icon" src={ritual.image_url ?? defaultRitualImg} alt="" />
        <span className="ritual-card-circle">{ROMAN[ritual.circle] ?? ritual.circle}</span>
        <span className="ritual-card-name">{ritual.name}</span>
        <span className="ritual-card-chevron">{expanded ? '⌃' : '⌄'}</span>
      </button>

      {expanded && (
        <div className="ritual-card-body">
          <div className="ritual-card-rolls">
            {modes.map((m) => (
              <button
                key={m.key}
                type="button"
                className="ritual-roll-btn"
                disabled={!m.formula}
                onClick={() => m.formula && onRoll(m.key, m.formula)}
              >
                <span className="ritual-roll-formula">{m.formula ?? '—'}</span>
                <span className="ritual-roll-label">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="ritual-card-meta">
            {meta.map((m) => (
              <p key={m.label}>
                <strong>{m.label.toUpperCase()}</strong> {m.value}
              </p>
            ))}
          </div>

          {ritual.description && <p className="ritual-card-desc">{ritual.description}</p>}

          <div className="ritual-card-actions">
            <button type="button" className="ritual-card-action" onClick={onRemove}>Remover</button>
            <button type="button" className="ritual-card-action" onClick={onEdit}>Editar</button>
          </div>
        </div>
      )}
    </div>
  )
}
