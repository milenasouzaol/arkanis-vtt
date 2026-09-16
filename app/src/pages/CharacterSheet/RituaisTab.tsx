import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import { recordRoll } from '../../lib/rollHistory'
import { attrValue, rollAttributeTest, rollDiceFormula, trainingBonus, type Training } from '../../lib/rules'
import type { CharacterRecord } from './index'
import RollResult, { RollCard, type RollCardDie, type RollResultData } from './RollResult'
import RitualPickerModal, { type RitualPickResult } from './RitualPickerModal'
import RitualCard, { diceFromText, type RitualView } from './RitualCard'
import RitualEditModal from './RitualEditModal'
import d20Icon from '../../assets/icons/d20-paranormal.svg'
import sangueIcon from '../../assets/rituais/sangue-simbolo.png'
import morteIcon from '../../assets/rituais/morte-simbolo.png'
import conhecimentoIcon from '../../assets/rituais/conhecimento-simbolo.png'
import energiaIcon from '../../assets/rituais/energia-simbolo.png'
import medoIcon from '../../assets/rituais/medo-simbolo.png'

const ELEMENT_ICON: Record<string, string> = {
  sangue: sangueIcon,
  morte: morteIcon,
  conhecimento: conhecimentoIcon,
  energia: energiaIcon,
  medo: medoIcon,
}

const ROMAN: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' }


type Ritual = {
  id: string
  name: string
  elemento: string | null
  circle: number
  execution: string | null
  range: string | null
  target: string | null
  duration: string | null
  resistance: string | null
  effect: string
  discente_cost: number | null
  discente_effect: string | null
  verdadeiro_cost: number | null
  verdadeiro_effect: string | null
}

type CustomRitual = {
  name: string
  elemento: string | null
  circle: number | null
  execution?: string | null
  duration?: string | null
  target?: string | null
  range?: string | null
  area?: string | null
  resistance?: string | null
  effect: string
  dice?: string | null
  dice_discente?: string | null
  dice_verdadeiro?: string | null
  discente_cost?: number | null
  discente_effect?: string | null
  verdadeiro_cost?: number | null
  verdadeiro_effect?: string | null
  image_url?: string | null
  description?: string | null
}

type CharacterRitual = {
  id: string
  ritual_id: string | null
  custom_ritual: CustomRitual | null
  rituals: (Ritual & { image_url: string | null }) | null
}

const ELEMENTOS = ['sangue', 'morte', 'conhecimento', 'energia', 'medo'] as const
const CIRCULOS = [1, 2, 3, 4]

export default function RituaisTab({ character }: { character: CharacterRecord }) {
  const { session } = useAuth()
  const [known, setKnown] = useState<CharacterRitual[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<CharacterRitual | null>(null)
  const [search, setSearch] = useState('')
  const [elementFilter, setElementFilter] = useState<string[]>([])
  const [circleFilter, setCircleFilter] = useState<number[]>([])
  const [ocultismoSkill, setOcultismoSkill] = useState<{ id: string; default_attribute: string } | null>(null)
  const [ocultismoBonus, setOcultismoBonus] = useState({ training: 'nenhum' as Training, extra_bonus: 0, attribute_override: null as string | null })
  const [roll, setRoll] = useState<RollResultData | null>(null)
  const [ritualRoll, setRitualRoll] = useState<{ title: string; subtitle: string; total: number; dice: RollCardDie[]; bonus: number } | null>(null)

  useEffect(() => {
    supabase.from('skills').select('id, default_attribute').eq('name', 'Ocultismo').single().then(({ data }) => {
      if (!data) return
      setOcultismoSkill(data)
      supabase
        .from('character_skills')
        .select('training, extra_bonus, attribute_override')
        .eq('character_id', character.id)
        .eq('skill_id', data.id)
        .maybeSingle()
        .then(({ data: cs }) => {
          if (cs) setOcultismoBonus(cs as any)
        })
    })
  }, [character.id])

  function rollOcultismo() {
    if (!ocultismoSkill) return
    const attr = ocultismoBonus.attribute_override ?? ocultismoSkill.default_attribute
    const score = attrValue(character.attributes, attr)
    const { rolls, kept } = rollAttributeTest(score)
    const bonus = trainingBonus(ocultismoBonus.training) + ocultismoBonus.extra_bonus
    const label = 'Teste de Ocultismo'
    setRoll({ label, rolls, kept, bonus, characterName: character.name, diceTray: character.dice_tray })
    if (session) {
      recordRoll({
        characterId: character.id, userId: session.user.id, campaignId: character.campaign_id, characterName: character.name,
        label, total: kept + bonus, detail: `d20 mantido: ${kept} (rolados: ${rolls.join(', ')}) + bônus ${bonus}`,
        dice: rolls.map((v) => ({ sides: 20, value: v, discarded: v !== kept })), bonus,
      })
    }
  }

  async function loadKnown() {
    const { data } = await supabase
      .from('character_rituals')
      .select('id, ritual_id, custom_ritual, rituals(id, name, elemento, circle, execution, range, target, duration, resistance, effect, discente_cost, discente_effect, verdadeiro_cost, verdadeiro_effect, image_url)')
      .eq('character_id', character.id)
    setKnown((data ?? []) as unknown as CharacterRitual[])
  }

  useEffect(() => { loadKnown() }, [character.id])

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
  }

  async function removeRitual(id: string) {
    await supabase.from('character_rituals').delete().eq('id', id)
    await loadKnown()
  }

  async function addFromPicker(result: RitualPickResult) {
    if (result.kind === 'catalog') {
      await supabase.from('character_rituals').insert({ character_id: character.id, ritual_id: result.id })
    } else {
      await supabase.from('character_rituals').insert({
        character_id: character.id,
        custom_ritual: {
          name: result.name,
          elemento: result.elemento,
          circle: result.circle,
          execution: result.execution || null,
          duration: result.duration || null,
          target: result.target || null,
          range: result.range || null,
          area: result.area || null,
          resistance: result.resistance || null,
          effect: result.effect || result.description || '',
          dice: result.dice || null,
          dice_discente: result.diceDiscente || null,
          dice_verdadeiro: result.diceVerdadeiro || null,
          image_url: result.image_url,
          description: result.description || null,
        },
      })
    }
    setAdding(false)
    await loadKnown()
  }

  function toView(cr: CharacterRitual): RitualView | null {
    if (cr.rituals) {
      const r = cr.rituals
      return {
        entryId: cr.id,
        name: r.name,
        elemento: r.elemento,
        circle: r.circle,
        execution: r.execution,
        range: r.range,
        target: r.target,
        area: null,
        duration: r.duration,
        resistance: r.resistance,
        effect: r.effect,
        description: null,
        image_url: r.image_url,
        dice: diceFromText(r.effect),
        diceDiscente: diceFromText(r.discente_effect),
        diceVerdadeiro: diceFromText(r.verdadeiro_effect),
        discenteCost: r.discente_cost,
        discenteEffect: r.discente_effect,
        verdadeiroCost: r.verdadeiro_cost,
        verdadeiroEffect: r.verdadeiro_effect,
      }
    }
    const c = cr.custom_ritual
    if (!c) return null
    return {
      entryId: cr.id,
      name: c.name,
      elemento: c.elemento,
      circle: c.circle ?? 1,
      execution: c.execution ?? null,
      range: c.range ?? null,
      target: c.target ?? null,
      area: c.area ?? null,
      duration: c.duration ?? null,
      resistance: c.resistance ?? null,
      effect: c.effect,
      description: c.description ?? null,
      image_url: c.image_url ?? null,
      dice: c.dice ?? diceFromText(c.effect),
      diceDiscente: c.dice_discente ?? null,
      diceVerdadeiro: c.dice_verdadeiro ?? null,
      discenteCost: c.discente_cost ?? null,
      discenteEffect: c.discente_effect ?? null,
      verdadeiroCost: c.verdadeiro_cost ?? null,
      verdadeiroEffect: c.verdadeiro_effect ?? null,
    }
  }

  function rollRitual(name: string, mode: 'normal' | 'discente' | 'verdadeiro', formula: string) {
    const rolled = rollDiceFormula(formula)
    if (!rolled) return
    // O RollResult e feito pra teste de pericia e assume d20; rolagem de ritual usa a
    // formula do proprio ritual (3d6, 8d6...), entao vai pelo RollCard com os lados certos.
    const sides = Number(formula.match(/d(\d+)/i)?.[1] ?? 20)
    const dice: RollCardDie[] = rolled.rolls.map((v) => ({ sides, value: v }))
    const modeLabel = mode === 'normal' ? '' : mode === 'discente' ? ' (Discente)' : ' (Verdadeiro)'
    const label = `Ritual: ${name}${modeLabel}`
    setRitualRoll({ title: character.name, subtitle: label, total: rolled.total, dice, bonus: rolled.modifier })
    if (session) {
      recordRoll({
        characterId: character.id, userId: session.user.id, campaignId: character.campaign_id, characterName: character.name,
        label, total: rolled.total, detail: `${formula}: ${rolled.rolls.join(', ')}${rolled.modifier ? ` ${rolled.modifier > 0 ? '+' : ''}${rolled.modifier}` : ''}`,
        dice,
        bonus: rolled.modifier,
      })
    }
  }

  const filteredKnown = known.filter((cr) => {
    const ritual = cr.rituals ?? cr.custom_ritual
    if (!ritual) return false
    if (elementFilter.length && (!ritual.elemento || !elementFilter.includes(ritual.elemento))) return false
    if (circleFilter.length && !circleFilter.includes(ritual.circle ?? 0)) return false
    if (search && !ritual.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div>
      {roll && <RollResult result={roll} onClose={() => setRoll(null)} />}
      {ritualRoll && (
        <RollCard
          title={ritualRoll.title}
          subtitle={ritualRoll.subtitle}
          total={ritualRoll.total}
          dice={ritualRoll.dice}
          bonus={ritualRoll.bonus}
          background={character.dice_tray && character.dice_tray !== 'padrao' ? character.dice_tray : undefined}
          onClose={() => setRitualRoll(null)}
        />
      )}

      <div className="rituais-toolbar">
        <div className="rituais-left-box">
          <div className="rituais-top-row">
            <div className="rituais-search combat-search-field">
              <input className="combat-search-input" placeholder="Busque Rituais" value={search} onChange={(e) => setSearch(e.target.value)} />
              <svg className="combat-search-icon" viewBox="0 0 24 24" aria-hidden>
                <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <button type="button" className="rituais-add-ghost-btn" onClick={() => setAdding((a) => !a)}>
              Adicionar<br />Ritual
            </button>
          </div>

          <div className="rituais-filter-row">
            {ELEMENTOS.map((e) => (
              <button
                key={e}
                type="button"
                className={`rituais-element-btn${elementFilter.includes(e) ? ' active' : ''}`}
                onClick={() => setElementFilter((f) => toggle(f, e))}
                aria-pressed={elementFilter.includes(e)}
                title={e}
              >
                <img src={ELEMENT_ICON[e]} alt={e} />
              </button>
            ))}

            <div className="rituais-circle-group">
              {CIRCULOS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`rituais-circle-btn${circleFilter.includes(c) ? ' active' : ''}`}
                  onClick={() => setCircleFilter((f) => toggle(f, c))}
                  aria-pressed={circleFilter.includes(c)}
                >
                  {ROMAN[c]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rituais-divider" />

        <button type="button" className="rituais-skill-btn" onClick={rollOcultismo}>
          <img src={d20Icon} alt="" />
          <span>Ocultismo</span>
        </button>
      </div>

      <div className="rituais-rune-row">Tudo comeca com o sangue. Saber tudo e perder tudo</div>

      <div className="ritual-card-list">
        {filteredKnown.map((cr) => {
          const view = toView(cr)
          if (!view) return null
          return (
            <RitualCard
              key={cr.id}
              ritual={view}
              expanded={expanded === cr.id}
              onToggle={() => setExpanded(expanded === cr.id ? null : cr.id)}
              onRoll={(mode, formula) => rollRitual(view.name, mode, formula)}
              onRemove={() => removeRitual(cr.id)}
              onEdit={() => setEditing(cr)}
            />
          )
        })}
      </div>

      {adding && (
        <RitualPickerModal
          characterId={character.id}
          onClose={() => setAdding(false)}
          onAdd={addFromPicker}
          onDeleteHomebrew={removeRitual}
        />
      )}

      {editing && (() => {
        const view = toView(editing)
        if (!view) return null
        return (
          <RitualEditModal
            characterId={character.id}
            entryId={editing.id}
            initial={view}
            onClose={() => setEditing(null)}
            onSaved={loadKnown}
          />
        )
      })()}
    </div>
  )
}
