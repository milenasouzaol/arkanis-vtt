import { useState } from 'react'
import { createPortal } from 'react-dom'
import { attrValue, type Attributes, type AttributeKey, type Training } from '../../lib/rules'
import d20Icon from '../../assets/icons/d20-paranormal.svg'
import untrainedIcon from '../../assets/pericias/untrained.svg'
import trainedIcon from '../../assets/pericias/trained.svg'
import veteranIcon from '../../assets/pericias/veteran.svg'
import expertIcon from '../../assets/pericias/expert.svg'
import ellipsisIcon from '../../assets/pericias/ellipsis.svg'
import ellipsisGreenIcon from '../../assets/pericias/ellipsis-green.svg'
import ellipsisRedIcon from '../../assets/pericias/ellipsis-red.svg'

type SkillRow = { id: string; name: string; default_attribute: string | null; description: string | null; carga_penalty?: boolean }
type CharacterSkillRow = { skill_id: string; training: Training; attribute_override: string | null; extra_bonus: number }

const ATTR_LABELS: { key: AttributeKey; abbr: string }[] = [
  { key: 'forca', abbr: 'FOR' },
  { key: 'agilidade', abbr: 'AGI' },
  { key: 'intelecto', abbr: 'INT' },
  { key: 'vigor', abbr: 'VIG' },
  { key: 'presenca', abbr: 'PRE' },
]

const TRAINING_ORDER: Training[] = ['nenhum', 'treinado', 'veterano', 'expert']

const TRAINING_ICON: Record<Training, string> = {
  nenhum: untrainedIcon,
  treinado: trainedIcon,
  veterano: veteranIcon,
  expert: expertIcon,
}

function trainingBonus(training: Training): number {
  if (training === 'treinado') return 5
  if (training === 'veterano') return 10
  if (training === 'expert') return 15
  return 0
}

type SortField = 'pericia' | 'treino' | 'atributo' | 'extra' | 'total'

function formatDescription(text: string) {
  return text.split(/(?:\r?\n){2,}/).map((paragraph, i) => {
    const parts = paragraph.split(/(\*\*[^*]+\*\*)/g)
    return (
      <p key={i}>
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : part
        )}
      </p>
    )
  })
}

function SkillDescriptionModal({ skill, onClose }: { skill: SkillRow; onClose: () => void }) {
  return createPortal(
    <div className="skill-desc-backdrop" onClick={onClose}>
      <div className="skill-desc-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="skill-desc-close" onClick={onClose}>FECHAR ×</button>
        <h2 className="skill-desc-title">{skill.name}</h2>
        <div className="skill-desc-divider" />
        <div className="skill-desc-body">
          {skill.description ? formatDescription(skill.description) : <p>Descrição ainda não cadastrada.</p>}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function PericiasTable({
  skills,
  charSkills,
  attributes,
  testDiceBonus,
  testValueBonus,
  cargaPenalty,
  onSetSkillField,
  onRoll,
}: {
  skills: SkillRow[]
  charSkills: Record<string, CharacterSkillRow>
  attributes: Attributes
  testDiceBonus: number
  testValueBonus: number
  /** Penalidade da proteção equipada nas perícias afetadas por carga (negativo, ex.: -5). */
  cargaPenalty: number
  onSetSkillField: (skillId: string, patch: Partial<CharacterSkillRow>) => void
  onRoll: (skill: SkillRow) => void
}) {
  const [skillFilter, setSkillFilter] = useState('')
  const [onlyTrained, setOnlyTrained] = useState(false)
  const [sortField, setSortField] = useState<SortField>('pericia')
  const [treinoPickerFor, setTreinoPickerFor] = useState<string | null>(null)
  const [atributoPickerFor, setAtributoPickerFor] = useState<string | null>(null)
  const [descriptionFor, setDescriptionFor] = useState<SkillRow | null>(null)

  function csOf(skillId: string): CharacterSkillRow {
    return charSkills[skillId] ?? { skill_id: skillId, training: 'nenhum', attribute_override: null, extra_bonus: 0 }
  }

  const rows = skills
    .filter((s) => {
      if (skillFilter && !s.name.toLowerCase().includes(skillFilter.toLowerCase())) return false
      if (onlyTrained && csOf(s.id).training === 'nenhum') return false
      return true
    })
    .map((s) => {
      const cs = csOf(s.id)
      const attr = cs.attribute_override ?? s.default_attribute
      // A Protecao Pesada tira 5 das pericias marcadas com carga_penalty no banco:
      // Acrobacia, Crime e Furtividade.
      const penalidade = s.carga_penalty ? cargaPenalty : 0
      const total = trainingBonus(cs.training) + cs.extra_bonus + testValueBonus + penalidade
      return { skill: s, cs, attr, total, penalidade }
    })

  rows.sort((a, b) => {
    if (sortField === 'treino') return TRAINING_ORDER.indexOf(b.cs.training) - TRAINING_ORDER.indexOf(a.cs.training)
    if (sortField === 'atributo') return (a.attr ?? '').localeCompare(b.attr ?? '')
    if (sortField === 'extra') return b.cs.extra_bonus - a.cs.extra_bonus
    if (sortField === 'total') return b.total - a.total
    return a.skill.name.localeCompare(b.skill.name)
  })

  return (
    <div className="pericias-panel">
      <div className="pericias-toggle-row">
        <button type="button" className={`pericias-toggle${!onlyTrained ? ' active' : ''}`} onClick={() => setOnlyTrained(false)}>TODAS AS PERÍCIAS</button>
        <button type="button" className={`pericias-toggle${onlyTrained ? ' active' : ''}`} onClick={() => setOnlyTrained(true)}>APENAS TREINADAS</button>
      </div>

      <div className="pericias-search">
        <input placeholder="Busque Perícias" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} />
      </div>

      <div className="pericias-columns">
        <button type="button" className={`pericias-col-btn pericias-col-pericia${sortField === 'pericia' ? ' active' : ''}`} onClick={() => setSortField('pericia')}>Perícia</button>
        <button type="button" className={`pericias-col-btn${sortField === 'treino' ? ' active' : ''}`} onClick={() => setSortField('treino')}>Treino</button>
        <button type="button" className={`pericias-col-btn${sortField === 'atributo' ? ' active' : ''}`} onClick={() => setSortField('atributo')}>Atrib.</button>
        <span />
        <button type="button" className={`pericias-col-btn${sortField === 'extra' ? ' active' : ''}`} onClick={() => setSortField('extra')}>Extra</button>
        <button type="button" className={`pericias-col-btn${sortField === 'total' ? ' active' : ''}`} onClick={() => setSortField('total')}>Total</button>
      </div>

      <div className="pericias-list">
        {rows.map(({ skill, cs, attr, total, penalidade }) => {
          const effectiveScore = attr ? attrValue(attributes, attr) + testDiceBonus : 0
          const diceCount = effectiveScore > 0 ? effectiveScore : 2
          const bonusPips = Math.min(Math.abs(testDiceBonus), diceCount)
          const bonusPipIcon = testDiceBonus < 0 ? ellipsisRedIcon : ellipsisGreenIcon

          return (
            <div key={skill.id} className="pericias-row" data-training={cs.training}>
              <button type="button" className="pericias-row-roll-btn" onClick={() => onRoll(skill)} disabled={!attr} aria-label={`Rolar ${skill.name}`}>
                <img className="pericias-row-icon" src={d20Icon} alt="" />
              </button>

              <button type="button" className="pericias-row-name-btn" onClick={() => setDescriptionFor(skill)}>
                <span className="pericias-row-name">
                  {skill.name}
                  <span className="pericias-row-formula">
                    <span style={{ color: testDiceBonus > 0 ? '#3ecf6e' : testDiceBonus < 0 ? '#e0393e' : undefined }}>{diceCount}d20</span>
                    {Array.from({ length: diceCount }).map((_, i) => (
                      <img key={i} src={i < diceCount - bonusPips ? ellipsisIcon : bonusPipIcon} alt="" className="pericias-pip" />
                    ))}
                  </span>
                </span>
              </button>

              <div className="pericias-cell pericias-cell-treino" style={{ position: 'relative' }}>
                <button type="button" className="pericias-treino-btn" onClick={() => setTreinoPickerFor((v) => v === skill.id ? null : skill.id)}>
                  <img src={TRAINING_ICON[cs.training]} alt={cs.training} />
                </button>
                {treinoPickerFor === skill.id && (
                  <div className="pericias-picker pericias-picker-treino">
                    {TRAINING_ORDER.map((t) => (
                      <button key={t} type="button" className={t === cs.training ? 'selected' : ''} onClick={() => { onSetSkillField(skill.id, { training: t }); setTreinoPickerFor(null) }}>
                        <img src={TRAINING_ICON[t]} alt={t} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pericias-cell pericias-cell-atributo" style={{ position: 'relative' }}>
                <button type="button" className="pericias-atributo-btn" onClick={() => setAtributoPickerFor((v) => v === skill.id ? null : skill.id)}>
                  {attr ? ATTR_LABELS.find((a) => a.key === attr)?.abbr ?? '—' : '—'}
                </button>
                {atributoPickerFor === skill.id && (
                  <div className="pericias-picker pericias-picker-atributo">
                    {ATTR_LABELS.map((a) => (
                      <button key={a.key} type="button" className={a.key === attr ? 'selected' : ''} onClick={() => { onSetSkillField(skill.id, { attribute_override: a.key }); setAtributoPickerFor(null) }}>
                        {a.abbr}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pericias-divider" />

              <div className="pericias-cell pericias-cell-extra">
                <input
                  type="number"
                  value={cs.extra_bonus}
                  onChange={(e) => onSetSkillField(skill.id, { extra_bonus: Number(e.target.value) })}
                />
              </div>

              {/* a penalidade de carga aparece do lado do total, pra nao sumir dentro dele */}
              <div className="pericias-cell pericias-cell-total" title={penalidade ? `inclui ${penalidade} de penalidade de carga` : undefined}>
                {total}
                {penalidade !== 0 && <span className="pericias-carga-penalty">{penalidade}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {descriptionFor && <SkillDescriptionModal skill={descriptionFor} onClose={() => setDescriptionFor(null)} />}
    </div>
  )
}
