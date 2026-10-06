import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import cardBg from '../../assets/dice-roll/card-bg.png'
import d6Icon from '../../assets/dice-roll/d6-icon.png'
import d8Icon from '../../assets/dice-roll/d8-icon.png'
import d10Icon from '../../assets/dice-roll/d10-icon.png'
import d12Icon from '../../assets/dice-roll/d12-icon.png'
import d20Icon from '../../assets/dice-roll/d20-icon.png'
import { dentroDaMesa, tocarSom } from '../../lib/sons'

const DIE_ICON: Record<number, string> = { 6: d6Icon, 8: d8Icon, 10: d10Icon, 12: d12Icon, 20: d20Icon }
export const DIE_COLOR: Record<number, string> = { 4: '#3b6fd6', 6: '#12786a', 8: '#8a721f', 10: '#d1571f', 12: '#249c3d', 20: '#7c4fe0' }

export type DamageRollDetail =
  | { label: string; rolls: number[]; modifier: number; total: number; manualFormula?: undefined }
  | { label: string; manualFormula: string; rolls?: undefined; modifier?: undefined; total?: undefined }

export type RollContextModifier = { kind: 'modificacao' | 'maldicao'; name: string; effect: string; elemento: string | null; origem: 'Arma' | 'Munição' }

export type RollResultData = {
  label: string
  rolls: number[]
  kept: number
  bonus: number
  characterName: string
  diceTray?: string
  damage?: DamageRollDetail[]
  municao?: string | null
  modificadores?: RollContextModifier[]
}

export type RollCardDie = { sides: number; value: number; discarded?: boolean }

export function Die({ sides, value, discarded }: RollCardDie) {
  const color = DIE_COLOR[sides] ?? '#fff'
  const valueColor = value === 1 ? '#e0393e' : value === sides ? '#3ecf6e' : '#fff'
  return (
    <div className={`roll-card-die${discarded ? ' discarded' : ''}`}>
      {DIE_ICON[sides] ? (
        <img src={DIE_ICON[sides]} alt={`d${sides}`} className="roll-card-die-icon" />
      ) : (
        <svg viewBox="0 0 24 24" className="roll-card-die-icon roll-card-die-fallback">
          <polygon points="12,3 21,19 3,19" fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      )}
      <span className="roll-card-die-value" style={{ color: valueColor }}>{value}</span>
    </div>
  )
}

export function totalColorForDice(dice: RollCardDie[]): string {
  const isD20Test = dice.length > 0 && dice.every((d) => d.sides === 20)
  if (!isD20Test) return '#fff'
  const kept = dice.filter((d) => !d.discarded)
  if (kept.some((d) => d.value === 1)) return '#e0393e'
  if (kept.some((d) => d.value === d.sides)) return '#3ecf6e'
  return '#fff'
}

export function formulaSegments(dice: RollCardDie[], bonus?: number): { text: string; color: string }[] {
  const segments: { text: string; color: string }[] = []
  let currentSides: number | null = null
  let count = 0
  const flush = () => {
    if (currentSides !== null) segments.push({ text: `${count}d${currentSides}`, color: DIE_COLOR[currentSides] ?? '#fff' })
  }
  dice.forEach((d) => {
    if (d.sides === currentSides) {
      count += 1
    } else {
      flush()
      currentSides = d.sides
      count = 1
    }
  })
  flush()
  if (bonus) segments.push({ text: `(${bonus >= 0 ? '+' : ''}${bonus})`, color: '#fff' })
  return segments
}

export function RollCard({
  title,
  subtitle,
  total,
  dice,
  extraLines,
  background,
  bonus,
  onClose,
  inline,
  semRolagem = false,
}: {
  title: string
  subtitle: string
  total: number
  dice: RollCardDie[]
  extraLines?: string[]
  background?: string
  bonus?: number
  onClose?: () => void
  inline?: boolean
  // Sem dados (ritual sem rolagem, encanto de arma…): o cartão abre direto com o nome e a nota.
  semRolagem?: boolean
}) {
  const [revealed, setRevealed] = useState(semRolagem)
  const [flipping, setFlipping] = useState(false)

  // Rolou: o som do dado (dentro da mesa quem toca é a mesa, junto com os dados 3D).
  useEffect(() => {
    if (!semRolagem && !dentroDaMesa()) tocarSom('dado')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggle() {
    if (flipping || semRolagem) return
    tocarSom('virar')
    setFlipping(true)
    setTimeout(() => {
      setRevealed((v) => !v)
      setFlipping(false)
    }, 150)
  }

  const totalColor = totalColorForDice(dice)

  const content = (
    <div className={`roll-card-wrap${inline ? ' inline' : ''}`}>
      <div
        className={`roll-card${revealed ? ' revealed' : ' collapsed'}${flipping ? ' flipping' : ''}`}
        style={{ backgroundImage: `url(${background || cardBg})` }}
        onClick={toggle}
      >
        {!revealed ? (
            <div className="roll-card-total roll-card-total-collapsed-wrap">
              <span className="roll-card-total-backdrop" style={{ color: totalColor }}>{total}</span>
            </div>
          ) : (
            <>
              <div className="roll-card-header">
                <span className="roll-card-header-backdrop">
                  <span className="roll-card-title">{title}</span>
                  <span className="roll-card-subtitle">{subtitle}</span>
                </span>
              </div>

              {!semRolagem && (
              <>
              <div className="roll-card-total"><span className="roll-card-total-backdrop" style={{ color: totalColor }}>{total}</span></div>

              <div className="roll-card-divider" />

              <div className="roll-card-dice-backdrop">
                <div className="roll-card-formula">
                  {formulaSegments(dice, bonus).map((s, i, arr) => (
                    <span key={i}>
                      <span className="roll-card-formula-chip" style={{ color: s.color }}>{s.text}</span>
                      {i < arr.length - 1 && <span className="roll-card-formula-plus">+</span>}
                    </span>
                  ))}
                </div>

                <div className="roll-card-dice">
                  {dice.map((d, i) => (
                    <div key={i} className="roll-card-die-slot">
                      <Die sides={d.sides} value={d.value} discarded={d.discarded} />
                      {i < dice.length - 1 && <span className="roll-card-die-plus">+</span>}
                    </div>
                  ))}
                </div>
              </div>
              </>
              )}

              {extraLines && extraLines.length > 0 && (
                <div className="roll-card-extra">
                  {extraLines.map((l, i) => <p key={i}>{l}</p>)}
                </div>
              )}
            </>
          )}
      </div>

      {!inline && <button type="button" className="roll-card-close" onClick={onClose} aria-label="Fechar">×</button>}
    </div>
  )

  return inline ? content : createPortal(content, document.body)
}

export default function RollResult({ result, onClose }: { result: RollResultData; onClose: () => void }) {
  const total = result.kept + result.bonus

  const extraLines: string[] = []
  if (result.municao) extraLines.push(`Munição: ${result.municao}`)
  result.damage?.forEach((d) => {
    extraLines.push(
      d.manualFormula !== undefined
        ? `${d.label}: role manualmente (${d.manualFormula})`
        : `${d.label}: ${d.total} (${d.rolls.join(', ')}${d.modifier ? `, ${d.modifier >= 0 ? '+' : ''}${d.modifier}` : ''})`,
    )
  })
  result.modificadores?.forEach((m) => {
    extraLines.push(`[${m.origem} · ${m.kind === 'modificacao' ? 'Modificação' : 'Maldição'}] ${m.name}${m.elemento ? ` (${m.elemento})` : ''}: ${m.effect}`)
  })

  return (
    <RollCard
      title={result.characterName}
      subtitle={result.label}
      total={total}
      dice={result.rolls.map((v) => ({ sides: 20, value: v, discarded: v !== result.kept }))}
      extraLines={extraLines}
      background={result.diceTray && result.diceTray !== 'padrao' ? result.diceTray : undefined}
      bonus={result.bonus}
      onClose={onClose}
    />
  )
}
