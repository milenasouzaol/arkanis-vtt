import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import { recordRoll } from '../../lib/rollHistory'
import { attrValue, computeDerivedStats, computePatentePd, rollAttributeTest, trainingBonus, CONDITION_ESCALATION, CONDITION_TEST_MODIFIERS, type AttributeKey, type Training } from '../../lib/rules'
import type { CharacterRecord } from './index'
import RollResult, { type RollResultData } from './RollResult'
import HabilidadesTab from './HabilidadesTab'
import RituaisTab from './RituaisTab'
import InventarioTab from './InventarioTab'
import { bonusCondicionais, bonusIncondicionais, penalidadeDeCarga } from './itemMods'
import CombateTab from './CombateTab'
import ModifiersPanel, { type Modifier } from './ModifiersPanel'
import PericiasTable from './PericiasTable'
import AttributeDiagram from './AttributeDiagram'
import StatBar from './StatBar'
import ConditionsModal from './ConditionsModal'
import FrameModal from './FrameModal'
import conditionsIcon from '../../assets/condicoes/conditions.svg'
import enemyEffectsIcon from '../../assets/condicoes/enemy-effects.svg'
import ritualsIcon from '../../assets/condicoes/rituals.svg'
import skillsIcon from '../../assets/condicoes/skills.svg'
import extraIcon from '../../assets/condicoes/extra.svg'
import { getClassExtras, type ClassTrack, type ClassTrackTier } from '../../lib/content'
import pvEmpty from '../../assets/pv-empty.svg'
import pvLow from '../../assets/pv-low.svg'
import pvHalf from '../../assets/pv-half.svg'
import pvFull from '../../assets/pv-full.svg'
import sanityEmpty from '../../assets/sanity-empty.svg'
import sanityLow from '../../assets/sanity-low.svg'
import sanityFull from '../../assets/sanity-full.svg'
import effortEmpty from '../../assets/effort-empty.svg'
import effortHalf from '../../assets/effort-half.svg'
import effortFull from '../../assets/effort-full.svg'
import determinationEmpty from '../../assets/determination-empty.svg'
import determinationLow from '../../assets/determination-low.svg'
import determinationHalf from '../../assets/determination-half.svg'
import determinationFull from '../../assets/determination-full.svg'
import conditionsBorderTop from '../../assets/conditions-border-top.svg'
import conditionsBorderBottom from '../../assets/conditions-border-bottom.svg'

function pvIconFor(pct: number): string {
  if (pct <= 0) return pvEmpty
  if (pct <= 33) return pvLow
  if (pct <= 66) return pvHalf
  return pvFull
}

function sanityIconFor(pct: number): string {
  if (pct <= 0) return sanityEmpty
  if (pct <= 50) return sanityLow
  return sanityFull
}

function effortIconFor(pct: number): string {
  if (pct <= 0) return effortEmpty
  if (pct <= 50) return effortHalf
  return effortFull
}

function determinationIconFor(pct: number): string {
  if (pct <= 0) return determinationEmpty
  if (pct <= 33) return determinationLow
  if (pct <= 66) return determinationHalf
  return determinationFull
}

type ClassRow = {
  pv_initial: number | null; pv_initial_attr: string | null; pv_per_nex: number | null; pv_per_nex_attr: string | null
  pe_initial: number | null; pe_initial_attr: string | null; pe_per_nex: number | null; pe_per_nex_attr: string | null
  sanity_initial: number | null; sanity_per_nex: number | null
  pd_initial: number | null; pd_initial_attr: string | null; pd_per_nex: number | null; pd_per_nex_attr: string | null
  pd_patente_initial: number | null; pd_patente_per_patente: number | null
}

type SkillRow = {
  id: string
  name: string
  default_attribute: string | null
  description: string | null
  carga_penalty?: boolean
}

type CharacterSkillRow = {
  skill_id: string
  training: Training
  attribute_override: string | null
  extra_bonus: number
}

export default function AgenteTab({
  character,
  onUpdated,
  editMode,
  originName,
  className,
  trackName,
  elementoNome,
  onNameChange,
}: {
  character: CharacterRecord
  onUpdated: () => void
  editMode: boolean
  originName: string | null
  className: string | null
  trackName: string | null
  elementoNome: string | null
  onNameChange: (name: string) => void
}) {
  const { session } = useAuth()
  const [classRow, setClassRow] = useState<ClassRow | null>(null)
  const [skills, setSkills] = useState<SkillRow[]>([])
  // Penalidade que a protecao equipada impoe as pericias de carga (ex.: -5 da pesada).
  const [cargaPenalty, setCargaPenalty] = useState(0)
  // Bonus de pericia que o item equipado da sempre (ex.: Pe de Morto, +5 Furtividade).
  const [bonusDeItens, setBonusDeItens] = useState<Record<string, number>>({})
  const [charSkills, setCharSkills] = useState<Record<string, CharacterSkillRow>>({})
  const [roll, setRoll] = useState<RollResultData | null>(null)
  const [rightTab, setRightTab] = useState<'Combate' | 'Habilidades' | 'Rituais' | 'Inventário'>('Combate')
  const [testModifiers, setTestModifiers] = useState<Modifier[]>([])
  const [testDraft, setTestDraft] = useState({ diceBonus: 0, valueBonus: 0 })
  const [showConditionsModal, setShowConditionsModal] = useState(false)
  const [showFrameModal, setShowFrameModal] = useState(false)
  const [conditionCatalog, setConditionCatalog] = useState<Record<string, { icon: string; description: string }>>({})
  const [openConditionDetail, setOpenConditionDetail] = useState<string | null>(null)
  const [tracks, setTracks] = useState<ClassTrack[]>([])
  const [trackTiers, setTrackTiers] = useState<ClassTrackTier[]>([])
  const [trackMenuOpen, setTrackMenuOpen] = useState(false)

  useEffect(() => {
    const categoryIcon: Record<string, string> = {
      condicao: conditionsIcon,
      efeito_inimigo: enemyEffectsIcon,
      habilidade: skillsIcon,
      extra: extraIcon,
    }
    Promise.all([
      supabase.from('effects_catalog').select('category, name, description'),
      supabase.from('rituals').select('name, effect'),
    ]).then(([effects, rituals]) => {
      const map: Record<string, { icon: string; description: string }> = {}
      for (const row of effects.data ?? []) {
        map[row.name] = { icon: categoryIcon[row.category] ?? conditionsIcon, description: row.description }
      }
      for (const row of rituals.data ?? []) {
        map[row.name] = { icon: ritualsIcon, description: row.effect }
      }
      setConditionCatalog(map)
    })
  }, [])

  useEffect(() => {
    if (character.class_id) {
      supabase
        .from('classes')
        .select('pv_initial, pv_initial_attr, pv_per_nex, pv_per_nex_attr, pe_initial, pe_initial_attr, pe_per_nex, pe_per_nex_attr, sanity_initial, sanity_per_nex, pd_initial, pd_initial_attr, pd_per_nex, pd_per_nex_attr, pd_patente_initial, pd_patente_per_patente')
        .eq('id', character.class_id)
        .single()
        .then(({ data }) => setClassRow(data))
    } else if (character.custom_class) {
      const cc = character.custom_class
      setClassRow({
        pv_initial: cc.pvInitial, pv_initial_attr: 'vigor', pv_per_nex: cc.pvPerNex, pv_per_nex_attr: 'vigor',
        pe_initial: cc.peInitial, pe_initial_attr: 'presenca', pe_per_nex: cc.pePerNex, pe_per_nex_attr: 'presenca',
        sanity_initial: cc.sanityInitial, sanity_per_nex: cc.sanityPerNex,
        pd_initial: cc.pdInitial, pd_initial_attr: 'presenca', pd_per_nex: cc.pdPerNex, pd_per_nex_attr: 'presenca',
        pd_patente_initial: null, pd_patente_per_patente: null,
      })
    }
  }, [character.class_id, character.custom_class])

  useEffect(() => {
    if (!character.class_id) {
      setTracks([])
      setTrackTiers([])
      return
    }
    getClassExtras(character.class_id).then((extras) => {
      setTracks(extras.tracks)
      setTrackTiers(extras.tiers)
    })
  }, [character.class_id])

  async function grantEligibleTrackTiers(trackId: string) {
    const eligibleTiers = trackTiers.filter((t) => t.track_id === trackId && t.nex_percent <= character.nex_percent)
    if (eligibleTiers.length === 0) return

    const [{ data: existingRows }, { data: existingAbilities }] = await Promise.all([
      supabase.from('character_progression_picks').select('nex_percent, note, picks').eq('character_id', character.id),
      supabase.from('character_abilities').select('class_track_tier_id').eq('character_id', character.id).not('class_track_tier_id', 'is', null),
    ])
    const grantedTierIds = new Set((existingAbilities ?? []).map((a) => a.class_track_tier_id))

    let changed = false
    for (const tier of eligibleTiers) {
      const existingRow = existingRows?.find((r) => r.nex_percent === tier.nex_percent)
      const existingPicks: { kind: string; label: string; ref_id: string | null }[] = existingRow?.picks ?? []
      if (!existingPicks.some((p) => p.kind === 'trilha' && p.ref_id === tier.id)) {
        await supabase.from('character_progression_picks').upsert(
          { character_id: character.id, nex_percent: tier.nex_percent, note: existingRow?.note ?? '', picks: [...existingPicks, { kind: 'trilha', label: tier.name, ref_id: tier.id }] },
          { onConflict: 'character_id,nex_percent' }
        )
        changed = true
      }
      if (!grantedTierIds.has(tier.id)) {
        await supabase.from('character_abilities').insert({ character_id: character.id, class_track_tier_id: tier.id })
        changed = true
      }
    }
    if (changed) onUpdated()
  }

  async function pickTrack(trackId: string) {
    setTrackMenuOpen(false)
    await supabase.from('characters').update({ chosen_track_id: trackId }).eq('id', character.id)
    await grantEligibleTrackTiers(trackId)
    onUpdated()
  }

  useEffect(() => {
    if (!character.chosen_track_id || trackTiers.length === 0) return
    grantEligibleTrackTiers(character.chosen_track_id)
  }, [character.chosen_track_id, character.nex_percent, trackTiers])

  // A penalidade de carga vem da descricao da protecao equipada ("-5 em perícias com
  // penalidade de carga"), entao ela muda quando a pessoa equipa ou desequipa.
  useEffect(() => {
    supabase
      .from('character_inventory')
      .select('active_bonuses, equipment_items(description), custom_item')
      .eq('character_id', character.id)
      .eq('is_equipped', true)
      .then(({ data }) => {
        const linhas = (data ?? []).map((i: any) => ({
          descricao: i.equipment_items?.description ?? i.custom_item?.description,
          ligados: (i.active_bonuses ?? []) as number[],
        }))
        setCargaPenalty(linhas.reduce((soma, l) => soma + penalidadeDeCarga(l.descricao), 0))

        const porPericia: Record<string, number> = {}
        for (const l of linhas) {
          // os que valem sempre entram direto; os condicionais so se a pessoa ligou
          const valendo = [
            ...bonusIncondicionais(l.descricao),
            ...bonusCondicionais(l.descricao).filter((_, i) => l.ligados.includes(i)),
          ]
          for (const b of valendo) {
            for (const pericia of b.pericias) porPericia[pericia] = (porPericia[pericia] ?? 0) + b.valor
          }
        }
        setBonusDeItens(porPericia)
      })
  }, [character.id, rightTab])

  useEffect(() => {
    supabase.from('skills').select('id, name, default_attribute, description, carga_penalty').order('sort_order').then(({ data }) => setSkills(data ?? []))
    supabase
      .from('character_skills')
      .select('skill_id, training, attribute_override, extra_bonus')
      .eq('character_id', character.id)
      .then(({ data }) => {
        const map: Record<string, CharacterSkillRow> = {}
        for (const row of data ?? []) map[row.skill_id] = row
        setCharSkills(map)
      })
  }, [character.id])

  const derived = useMemo(() => {
    if (!classRow) return { maxPv: 0, maxPe: 0, maxSanity: 0, maxPd: 0 }
    return computeDerivedStats(classRow, character.attributes, character.nex_percent)
  }, [classRow, character.attributes, character.nex_percent])

  async function updateAttribute(key: keyof typeof character.attributes, value: number) {
    const attributes = { ...character.attributes, [key]: value }
    await supabase.from('characters').update({ attributes }).eq('id', character.id)
    onUpdated()
  }

  async function updateCharacterField(field: string, value: number | string | null) {
    await supabase.from('characters').update({ [field]: value }).eq('id', character.id)
    onUpdated()
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !session) return
    const path = `${session.user.id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('character_photos').upload(path, file, { upsert: true })
    if (error) return
    const { publicUrl } = supabase.storage.from('character_photos').getPublicUrl(path).data
    await updateCharacterField('avatar_url', publicUrl)
  }

  async function syncConditionModifier(name: string) {
    const rule = CONDITION_TEST_MODIFIERS[name]
    if (!rule) return
    await supabase.from('character_modifiers').upsert(
      { character_id: character.id, scope: rule.scope, name, dice_bonus: rule.dice_bonus, value_bonus: 0, threat_margin_bonus: 0, multiplier_bonus: 0, is_active: true },
      { onConflict: 'character_id,scope,name' },
    )
  }

  async function addCondition(name: string) {
    const current = character.conditions ?? []
    const escalatesTo = CONDITION_ESCALATION[name]
    if (escalatesTo && current.includes(name)) {
      const next = [...current.filter((c) => c !== name), escalatesTo]
      await supabase.from('characters').update({ conditions: next }).eq('id', character.id)
      if (CONDITION_TEST_MODIFIERS[name] && !next.includes(name)) {
        await supabase.from('character_modifiers').delete().eq('character_id', character.id).eq('name', name)
      }
      await syncConditionModifier(escalatesTo)
    } else {
      await supabase.from('characters').update({ conditions: [...current, name] }).eq('id', character.id)
      await syncConditionModifier(name)
    }
    onUpdated()
  }

  async function removeCondition(index: number) {
    const current = character.conditions ?? []
    const removedName = current[index]
    const next = current.filter((_, i) => i !== index)
    await supabase.from('characters').update({ conditions: next }).eq('id', character.id)
    if (removedName && CONDITION_TEST_MODIFIERS[removedName] && !next.includes(removedName)) {
      await supabase.from('character_modifiers').delete().eq('character_id', character.id).eq('name', removedName)
    }
    onUpdated()
  }

  function rollAttribute(key: AttributeKey, abbr: string) {
    const score = character.attributes[key]
    const { rolls, kept } = rollAttributeTest(score)
    const label = `Teste de ${abbr}`
    setRoll({ label, rolls, kept, bonus: 0, characterName: character.name, diceTray: character.dice_tray })
    if (session) {
      recordRoll({
        characterId: character.id, userId: session.user.id, campaignId: character.campaign_id, characterName: character.name,
        label, total: kept, detail: `d20 mantido: ${kept} (rolados: ${rolls.join(', ')})`,
        dice: rolls.map((v) => ({ sides: 20, value: v, discarded: v !== kept })), bonus: 0,
      })
    }
  }

  async function setSkillField(skillId: string, patch: Partial<CharacterSkillRow>) {
    const current = charSkills[skillId] ?? { skill_id: skillId, training: 'nenhum', attribute_override: null, extra_bonus: 0 }
    const next = { ...current, ...patch }
    setCharSkills((m) => ({ ...m, [skillId]: next }))
    await supabase.from('character_skills').upsert({ character_id: character.id, skill_id: skillId, training: next.training, attribute_override: next.attribute_override, extra_bonus: next.extra_bonus })
  }

  const activeTestMods = testModifiers.filter((m) => m.is_active)
  const testDiceBonus = activeTestMods.reduce((sum, m) => sum + m.dice_bonus, 0) + testDraft.diceBonus
  const testValueBonus = activeTestMods.reduce((sum, m) => sum + m.value_bonus, 0) + testDraft.valueBonus

  function rollSkill(skill: SkillRow) {
    const cs = charSkills[skill.id] ?? { skill_id: skill.id, training: 'nenhum' as const, attribute_override: null, extra_bonus: 0 }
    const attr = cs.attribute_override ?? skill.default_attribute
    const score = attrValue(character.attributes, attr) + testDiceBonus
    const { rolls, kept } = rollAttributeTest(score)
    const bonus = trainingBonus(cs.training) + cs.extra_bonus + testValueBonus
    const label = `Teste de ${skill.name}`
    setRoll({ label, rolls, kept, bonus, characterName: character.name, diceTray: character.dice_tray })
    if (session) {
      recordRoll({
        characterId: character.id, userId: session.user.id, campaignId: character.campaign_id, characterName: character.name,
        label, total: kept + bonus, detail: `d20 mantido: ${kept} (rolados: ${rolls.join(', ')}) + bônus ${bonus}`,
        dice: rolls.map((v) => ({ sides: 20, value: v, discarded: v !== kept })), bonus,
      })
    }
  }

  const maxPv = character.max_pv_override ?? derived.maxPv
  const maxSanity = character.max_sanity_override ?? derived.maxSanity
  const pct = (cur: number, max: number) => (max > 0 ? Math.max(0, Math.min(100, (cur / max) * 100)) : 0)
  const maxPdPatente = character.optional_rules.evolucao_patente && classRow
    ? computePatentePd(classRow.pd_patente_initial, classRow.pd_patente_per_patente, character.attributes.presenca, character.patente)
    : null

  return (
    <div className="vtt-columns">
      {roll && <RollResult result={roll} onClose={() => setRoll(null)} />}

      <div className="vtt-col-side">
        <div className="vtt-card" style={{ textAlign: 'center' }}>
          <div className="vtt-avatar-wrap">
            <img className="vtt-avatar" src={character.avatar_url ?? undefined} alt="" />
            {character.avatar_frame && <img className="vtt-avatar-frame" src={character.avatar_frame} alt="" />}
          </div>
          {editMode && (
            <div className="vtt-avatar-actions">
              <label className="vtt-avatar-action-btn">
                Mudar foto
                <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
              </label>
              <button type="button" className="vtt-avatar-action-btn" onClick={() => setShowFrameModal(true)}>Mudar moldura</button>
            </div>
          )}

          {showFrameModal && (
            <FrameModal
              currentFrame={character.avatar_frame}
              onClose={() => setShowFrameModal(false)}
              onSave={(frame) => { updateCharacterField('avatar_frame', frame); setShowFrameModal(false) }}
            />
          )}

          {editMode ? (
            <input value={character.name} onChange={(e) => onNameChange(e.target.value)} className="vtt-name-input" style={{ textAlign: 'center', width: '100%' }} />
          ) : (
            <h2 className="vtt-name">{character.name}</h2>
          )}

          <div className="vtt-profile-grid">
            <span className={originName ? 'set' : undefined}>{originName || 'Origem'}</span>
            <span className={className ? 'set' : undefined}>{className || 'Classe'}</span>
            <span className={`vtt-track-field${trackName ? ' set' : ''}`} style={{ position: 'relative' }}>
              <button type="button" onClick={() => setTrackMenuOpen((v) => !v)} disabled={tracks.length === 0}>
                {trackName || 'Trilha'}
              </button>
              {trackMenuOpen && (
                <ul className="vtt-track-menu">
                  {tracks.map((t) => (
                    <li key={t.id}><button type="button" onClick={() => pickTrack(t.id)}>{t.name}</button></li>
                  ))}
                </ul>
              )}
            </span>
            <span className={elementoNome ? 'set' : undefined}>{elementoNome || 'Afinidade'}</span>
          </div>
        </div>

        <div className="vtt-card">
          <AttributeDiagram
            attributes={character.attributes}
            nexPercent={character.nex_percent}
            onRoll={rollAttribute}
            onNexChange={(value) => updateCharacterField('nex_percent', value)}
            editable={editMode}
            onAttributeChange={updateAttribute}
          />

          {character.optional_rules.evolucao_patente && (
            <label style={{ display: 'block', marginTop: '0.6em' }}>
              Patente
              <select value={character.patente} onChange={(e) => updateCharacterField('patente', e.target.value)}>
                {['sem_patente', 'recruta', 'operador', 'agente_especial', 'oficial_operacoes', 'agente_elite'].map((p) => (
                  <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="vtt-card">
          <StatBar
            label="Vida"
            icon={pvIconFor(pct(character.current_pv ?? 0, maxPv))}
            current={character.current_pv ?? 0}
            max={maxPv}
            temp={character.temp_pv}
            colorClass="pv"
            onDecrement={() => updateCharacterField('current_pv', (character.current_pv ?? 0) - 1)}
            onIncrement={() => updateCharacterField('current_pv', (character.current_pv ?? 0) + 1)}
            onTempDecrement={() => updateCharacterField('temp_pv', Math.max(0, (character.temp_pv ?? 0) - 1))}
            onTempIncrement={() => updateCharacterField('temp_pv', (character.temp_pv ?? 0) + 1)}
            onCurrentChange={(value) => updateCharacterField('current_pv', value)}
            onMaxChange={(value) => updateCharacterField('max_pv_override', value)}
            deathMarks={character.pv_death_marks ?? 0}
            onToggleDeathMark={(i) => updateCharacterField('pv_death_marks', (character.pv_death_marks ?? 0) ^ (1 << i))}
            onHeal={() => { updateCharacterField('current_pv', 1); updateCharacterField('pv_death_marks', 0) }}
          />

          {character.optional_rules.sem_sanidade ? (
            <StatBar
              label="Determinação"
              icon={determinationIconFor(pct(character.current_pd ?? 0, derived.maxPd))}
              current={character.current_pd ?? 0}
              max={derived.maxPd}
              temp={character.temp_pd}
              colorClass="pd"
              onDecrement={() => updateCharacterField('current_pd', (character.current_pd ?? 0) - 1)}
              onIncrement={() => updateCharacterField('current_pd', (character.current_pd ?? 0) + 1)}
              onTempDecrement={() => updateCharacterField('temp_pd', Math.max(0, (character.temp_pd ?? 0) - 1))}
              onTempIncrement={() => updateCharacterField('temp_pd', (character.temp_pd ?? 0) + 1)}
              onCurrentChange={(value) => updateCharacterField('current_pd', value)}
            />
          ) : (
            <>
              <StatBar
                label="Sanidade"
                icon={sanityIconFor(pct(character.current_sanity ?? 0, maxSanity))}
                current={character.current_sanity ?? 0}
                max={maxSanity}
                temp={character.temp_sanity}
                colorClass="sanidade"
                onDecrement={() => updateCharacterField('current_sanity', (character.current_sanity ?? 0) - 1)}
                onIncrement={() => updateCharacterField('current_sanity', (character.current_sanity ?? 0) + 1)}
                onTempDecrement={() => updateCharacterField('temp_sanity', Math.max(0, (character.temp_sanity ?? 0) - 1))}
                onTempIncrement={() => updateCharacterField('temp_sanity', (character.temp_sanity ?? 0) + 1)}
                onCurrentChange={(value) => updateCharacterField('current_sanity', value)}
                onMaxChange={(value) => updateCharacterField('max_sanity_override', value)}
                deathMarks={character.sanity_death_marks ?? 0}
                onToggleDeathMark={(i) => updateCharacterField('sanity_death_marks', (character.sanity_death_marks ?? 0) ^ (1 << i))}
                onHeal={() => { updateCharacterField('current_sanity', 1); updateCharacterField('sanity_death_marks', 0) }}
              />
              <StatBar
                label="Esforço"
                icon={effortIconFor(pct(character.current_pe ?? 0, derived.maxPe))}
                current={character.current_pe ?? 0}
                max={derived.maxPe}
                temp={character.temp_pe}
                colorClass="esforco"
                onDecrement={() => updateCharacterField('current_pe', (character.current_pe ?? 0) - 1)}
                onIncrement={() => updateCharacterField('current_pe', (character.current_pe ?? 0) + 1)}
                onTempDecrement={() => updateCharacterField('temp_pe', Math.max(0, (character.temp_pe ?? 0) - 1))}
                onTempIncrement={() => updateCharacterField('temp_pe', (character.temp_pe ?? 0) + 1)}
                onCurrentChange={(value) => updateCharacterField('current_pe', value)}
              />
            </>
          )}

          {character.optional_rules.evolucao_patente && !character.optional_rules.sem_sanidade && (
            maxPdPatente == null ? (
              <p style={{ fontSize: '0.85em', color: 'var(--text-dim)' }}>PD por Evolução de Patente ainda não confirmado pra essa classe.</p>
            ) : (
              <StatBar
                label="Determinação (Patente)"
                icon={determinationIconFor(pct(character.current_pd ?? 0, maxPdPatente))}
                current={character.current_pd ?? 0}
                max={maxPdPatente}
                temp={character.temp_pd}
                colorClass="pd"
                onDecrement={() => updateCharacterField('current_pd', (character.current_pd ?? 0) - 1)}
                onIncrement={() => updateCharacterField('current_pd', (character.current_pd ?? 0) + 1)}
                onTempDecrement={() => updateCharacterField('temp_pd', Math.max(0, (character.temp_pd ?? 0) - 1))}
                onTempIncrement={() => updateCharacterField('temp_pd', (character.temp_pd ?? 0) + 1)}
                onCurrentChange={(value) => updateCharacterField('current_pd', value)}
              />
            )
          )}

          <img className="vtt-condition-border" src={conditionsBorderTop} alt="" />
          <div className="vtt-condition-header">
            <h3>Condições e Efeitos</h3>
            <button type="button" className="vtt-condition-add" onClick={() => setShowConditionsModal(true)} aria-label="Adicionar condição">+</button>
          </div>
          <img className="vtt-condition-border" src={conditionsBorderBottom} alt="" />
          <div className="vtt-condition-tags">
            {(character.conditions ?? []).map((cond, i) => {
              const info = conditionCatalog[cond]
              return (
                <div key={i} className="vtt-condition-tag-row">
                  <button type="button" className="vtt-condition-tag" onClick={() => setOpenConditionDetail(cond)}>
                    {info && <img src={info.icon} alt="" />}
                    <span>{cond}</span>
                  </button>
                  <button type="button" className="vtt-condition-remove" onClick={() => removeCondition(i)} aria-label={`Remover ${cond}`}>×</button>
                </div>
              )
            })}
          </div>

          {openConditionDetail && (
            <div className="vtt-condition-detail-backdrop" onClick={() => setOpenConditionDetail(null)}>
              <div className="vtt-condition-detail-card" onClick={(e) => e.stopPropagation()}>
                <div className="vtt-condition-detail-header">
                  {conditionCatalog[openConditionDetail] && <img src={conditionCatalog[openConditionDetail].icon} alt="" />}
                  <h4>{openConditionDetail}</h4>
                  <button type="button" onClick={() => setOpenConditionDetail(null)} aria-label="Fechar">×</button>
                </div>
                <p>{conditionCatalog[openConditionDetail]?.description ?? 'Condição personalizada.'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showConditionsModal && (
        <ConditionsModal onClose={() => setShowConditionsModal(false)} onAddCondition={addCondition} />
      )}

      <div className="vtt-col-main">
        <div className="vtt-card modpanel-card">
          <ModifiersPanel characterId={character.id} scope="teste" onChange={setTestModifiers} onDraftChange={setTestDraft} />
        </div>

        <div className="vtt-card pericias-card">
          <PericiasTable
            skills={skills}
            charSkills={charSkills}
            attributes={character.attributes}
            testDiceBonus={testDiceBonus}
            testValueBonus={testValueBonus}
            cargaPenalty={cargaPenalty}
            bonusDeItens={bonusDeItens}
            onSetSkillField={setSkillField}
            onRoll={rollSkill}
          />
        </div>
      </div>

      <div className="vtt-col-combat">
        <nav className="vtt-subtabs">
          {(['Combate', 'Habilidades', 'Rituais', 'Inventário'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setRightTab(t)} disabled={rightTab === t}>{t}</button>
          ))}
        </nav>

        {rightTab === 'Habilidades' && <HabilidadesTab character={character} />}
        {rightTab === 'Rituais' && <RituaisTab character={character} />}
        {rightTab === 'Inventário' && <InventarioTab character={character} editMode={editMode} />}
        {rightTab === 'Combate' && <CombateTab character={character} onUpdated={onUpdated} editMode={editMode} />}
      </div>
    </div>
  )
}
