import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import { recordRoll } from '../../lib/rollHistory'
import { attrValue, rollAttributeTest, trainingBonus, type Training } from '../../lib/rules'
import type { CharacterRecord } from './index'
import RollResult, { type RollResultData } from './RollResult'
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

type CharacterRitual = {
  id: string
  ritual_id: string | null
  custom_ritual: { name: string; elemento: string | null; circle: number | null; effect: string } | null
  rituals: Ritual | null
}

const ELEMENTOS = ['sangue', 'morte', 'conhecimento', 'energia', 'medo'] as const
const CIRCULOS = [1, 2, 3, 4]

type CustomRitualDraft = { name: string; elemento: string; circle: number; effect: string }
const emptyCustomRitual: CustomRitualDraft = { name: '', elemento: '', circle: 1, effect: '' }

export default function RituaisTab({ character }: { character: CharacterRecord }) {
  const { session } = useAuth()
  const [known, setKnown] = useState<CharacterRitual[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')
  const [elementFilter, setElementFilter] = useState<string[]>([])
  const [circleFilter, setCircleFilter] = useState<number[]>([])
  const [catalog, setCatalog] = useState<Ritual[]>([])
  const [creatingCustom, setCreatingCustom] = useState(false)
  const [customDraft, setCustomDraft] = useState<CustomRitualDraft>(emptyCustomRitual)
  const [ocultismoSkill, setOcultismoSkill] = useState<{ id: string; default_attribute: string } | null>(null)
  const [ocultismoBonus, setOcultismoBonus] = useState({ training: 'nenhum' as Training, extra_bonus: 0, attribute_override: null as string | null })
  const [roll, setRoll] = useState<RollResultData | null>(null)

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
      .select('id, ritual_id, custom_ritual, rituals(id, name, elemento, circle, execution, range, target, duration, resistance, effect, discente_cost, discente_effect, verdadeiro_cost, verdadeiro_effect)')
      .eq('character_id', character.id)
    setKnown((data ?? []) as unknown as CharacterRitual[])
  }

  useEffect(() => { loadKnown() }, [character.id])

  useEffect(() => {
    if (!adding) return
    let query = supabase.from('rituals').select('id, name, elemento, circle, execution, range, target, duration, resistance, effect, discente_cost, discente_effect, verdadeiro_cost, verdadeiro_effect')
    if (elementFilter.length) query = query.in('elemento', elementFilter)
    if (circleFilter.length) query = query.in('circle', circleFilter)
    query.order('circle').then(({ data }) => setCatalog(data ?? []))
  }, [adding, elementFilter, circleFilter])

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
  }

  async function addRitual(ritual: Ritual) {
    await supabase.from('character_rituals').insert({ character_id: character.id, ritual_id: ritual.id })
    await loadKnown()
  }

  async function removeRitual(id: string) {
    await supabase.from('character_rituals').delete().eq('id', id)
    await loadKnown()
  }

  async function saveCustomRitual() {
    if (!customDraft.name || !customDraft.effect) return
    await supabase.from('character_rituals').insert({
      character_id: character.id,
      custom_ritual: {
        name: customDraft.name,
        elemento: customDraft.elemento || null,
        circle: customDraft.circle,
        effect: customDraft.effect,
      },
    })
    setCustomDraft(emptyCustomRitual)
    setCreatingCustom(false)
    setAdding(false)
    await loadKnown()
  }

  const filteredCatalog = catalog.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))

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

      <div className="rituais-toolbar">
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

        <div className="rituais-divider" />

        <button type="button" className="rituais-skill-btn" onClick={rollOcultismo}>
          <img src={d20Icon} alt="" />
          <span>Ocultismo</span>
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

      <div className="rituais-rune-row">Ordem Paranormal</div>

      <ul>
        {filteredKnown.map((cr) => {
          const ritual = cr.rituals ?? cr.custom_ritual
          if (!ritual) return null
          const isExpanded = expanded === cr.id
          return (
            <li key={cr.id}>
              <button type="button" onClick={() => setExpanded(isExpanded ? null : cr.id)}>
                {ritual.circle ?? '?'}º — {ritual.name} ({ritual.elemento ?? 'multi-elemento'})
              </button>
              {isExpanded && (
                <div>
                  {cr.rituals && (
                    <>
                      <p>Execução: {cr.rituals.execution} · Alcance: {cr.rituals.range} · Alvo: {cr.rituals.target} · Duração: {cr.rituals.duration} · Resistência: {cr.rituals.resistance ?? '—'}</p>
                      <p>{cr.rituals.effect}</p>
                      {cr.rituals.discente_effect && <p><strong>Discente ({cr.rituals.discente_cost} PE):</strong> {cr.rituals.discente_effect}</p>}
                      {cr.rituals.verdadeiro_effect && <p><strong>Verdadeiro ({cr.rituals.verdadeiro_cost} PE):</strong> {cr.rituals.verdadeiro_effect}</p>}
                    </>
                  )}
                  {cr.custom_ritual && <p>{cr.custom_ritual.effect}</p>}
                  <button type="button" onClick={() => removeRitual(cr.id)}>Remover</button>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {adding && (
        <div>
          <button type="button" onClick={() => setCreatingCustom((c) => !c)}>Criar Ritual Personalizado</button>

          {creatingCustom ? (
            <div>
              <label>Nome <input value={customDraft.name} onChange={(e) => setCustomDraft((d) => ({ ...d, name: e.target.value }))} /></label>
              <label>Elemento
                <select value={customDraft.elemento} onChange={(e) => setCustomDraft((d) => ({ ...d, elemento: e.target.value }))}>
                  <option value="">Multi-elemento / nenhum</option>
                  {ELEMENTOS.map((el) => <option key={el} value={el}>{el}</option>)}
                </select>
              </label>
              <label>Círculo
                <select value={customDraft.circle} onChange={(e) => setCustomDraft((d) => ({ ...d, circle: Number(e.target.value) }))}>
                  {CIRCULOS.map((c) => <option key={c} value={c}>{c}º</option>)}
                </select>
              </label>
              <label>Efeito <textarea value={customDraft.effect} onChange={(e) => setCustomDraft((d) => ({ ...d, effect: e.target.value }))} /></label>
              <button type="button" onClick={saveCustomRitual}>Adicionar Ritual</button>
            </div>
          ) : filteredCatalog.length === 0 ? <p>Nenhum ritual encontrado com esses filtros.</p> : (
            <ul>
              {filteredCatalog.map((r) => (
                <li key={r.id}>
                  <strong>{r.circle}º — {r.name}</strong> ({r.elemento ?? 'multi-elemento'}): {r.effect}
                  <button type="button" onClick={() => addRitual(r)}>Adicionar Ritual</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
