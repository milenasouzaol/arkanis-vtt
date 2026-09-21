import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import { recordRoll } from '../../lib/rollHistory'
import { attrValue, rollAttributeTest, rollDiceFormula, trainingBonus, type AttributeKey, type Training } from '../../lib/rules'
import type { CharacterRecord } from './index'
import RollResult, { RollCard, type RollResultData, type RollCardDie } from './RollResult'
import { type Modifier } from './ModifiersPanel'
import CombateModifiersPanel from './CombateModifiersPanel'
import AttackFormModal, { type AttackToEdit } from './AttackFormModal'
import AttackCard from './AttackCard'
import { numerosDoAtaque, somaBonusNoDano, type AppliedModifier } from './itemMods'
import defenseRing from '../../assets/combate/border-defense-desktop.png'
import resetIcon from '../../assets/combate/seta-reset.svg'
import mysteryIcon from '../../assets/combate/op-icon-misterio-custom.png'

type Attack = {
  id: string
  name: string
  skill_id: string | null
  attribute: AttributeKey | null
  d20_bonus: number
  threat_margin: number
  multiplier: number
  damage: { formula: string; tipo: string }[]
  general_info: {
    tipo?: string
    empunhadura?: string
    alcance?: string
    tipo_municao?: string
    municao?: string | null
    modificadores?: { kind: 'modificacao' | 'maldicao'; name: string; effect: string; elemento: string | null; origem: 'Arma' | 'Munição' }[]
    damage_bonus_from_mods?: number
  } | null
  from_inventory_item_id: string | null
  attack_bonus: string | null
  damage_attribute: AttributeKey | null
  modifiers: AppliedModifier[] | null
  alternative_attacks: Record<string, unknown>[] | null
  image_url: string | null
}

type InventoryAmmoInfo = {
  id: string
  linked_ammo_id: string | null
  ammo_current: number | null
  ammo_total: number | null
  ammo_label: string | null
  quantity: number
  name: string
  stats: Record<string, unknown>
  applied_modifiers: AppliedModifier[]
}

type Skill = { id: string; name: string }

export default function CombateTab({ character, onUpdated, editMode }: { character: CharacterRecord; onUpdated: () => void; editMode: boolean }) {
  const { session } = useAuth()
  const [attacks, setAttacks] = useState<Attack[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [charSkillBonus, setCharSkillBonus] = useState<Record<string, number>>({})
  const [equippedDefense, setEquippedDefense] = useState(0)
  const [equippedProtectionName, setEquippedProtectionName] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [roll, setRoll] = useState<RollResultData | null>(null)
  const [attackMods, setAttackMods] = useState<Modifier[]>([])
  const [damageMods, setDamageMods] = useState<Modifier[]>([])
  const [testMods, setTestMods] = useState<Modifier[]>([])
  const [inventoryAmmo, setInventoryAmmo] = useState<InventoryAmmoInfo[]>([])
  const [defenseDetailsOpen, setDefenseDetailsOpen] = useState(false)
  const [ammoOpen, setAmmoOpen] = useState(false)
  const [confirmDeleteAmmo, setConfirmDeleteAmmo] = useState<InventoryAmmoInfo | null>(null)
  const [expandedAttack, setExpandedAttack] = useState<string | null>(null)
  const [editingAttack, setEditingAttack] = useState<AttackToEdit | null>(null)
  const [attackSearch, setAttackSearch] = useState('')
  const [pendingAttack, setPendingAttack] = useState<{ attackId: string; isCrit: boolean } | null>(null)
  const [damageRoll, setDamageRoll] = useState<{ title: string; subtitle: string; total: number; dice: RollCardDie[]; extraLines?: string[]; bonus?: number } | null>(null)

  async function loadAttacks() {
    const { data } = await supabase
      .from('character_attacks')
      .select('id, name, skill_id, attribute, d20_bonus, attack_bonus, threat_margin, multiplier, damage_attribute, damage, general_info, modifiers, alternative_attacks, image_url, from_inventory_item_id')
      .eq('character_id', character.id)
    setAttacks((data ?? []) as unknown as Attack[])
  }

  async function loadInventoryAmmo() {
    const { data } = await supabase
      .from('character_inventory')
      .select('id, linked_ammo_id, ammo_current, ammo_total, ammo_label, quantity, applied_modifiers, custom_item, equipment_items(name, stats)')
      .eq('character_id', character.id)
    setInventoryAmmo(
      (data ?? []).map((row: any) => ({
        id: row.id,
        linked_ammo_id: row.linked_ammo_id,
        ammo_current: row.ammo_current,
        ammo_total: row.ammo_total,
        ammo_label: row.ammo_label,
        stats: row.equipment_items?.stats ?? row.custom_item?.stats ?? {},
        applied_modifiers: row.applied_modifiers ?? [],
        quantity: row.quantity,
        name: row.equipment_items?.name ?? row.custom_item?.name ?? 'Item',
      })),
    )
  }

  function loadEquippedProtection() {
    supabase
      .from('character_inventory')
      .select('is_equipped, equipment_items(type, stats, name), custom_item')
      .eq('character_id', character.id)
      .eq('is_equipped', true)
      .then(({ data }) => {
        const protection = (data ?? []).find((i: any) => (i.equipment_items?.type ?? i.custom_item?.type) === 'protecao')
        const stats = (protection as any)?.equipment_items?.stats ?? (protection as any)?.custom_item?.stats ?? {}
        const name = (protection as any)?.equipment_items?.name ?? (protection as any)?.custom_item?.name ?? null
        setEquippedDefense(Number(stats.defesa ?? 0))
        setEquippedProtectionName(name)
      })
  }

  useEffect(() => { loadAttacks(); loadInventoryAmmo() }, [character.id])

  useEffect(() => {
    supabase.from('skills').select('id, name').order('sort_order').then(({ data }) => setSkills(data ?? []))
    supabase
      .from('character_modifiers')
      .select('id, name, dice_bonus, value_bonus, threat_margin_bonus, multiplier_bonus, damage_type, is_active')
      .eq('character_id', character.id)
      .eq('scope', 'teste')
      .then(({ data }) => setTestMods(data ?? []))
    supabase
      .from('character_skills')
      .select('skill_id, training, extra_bonus')
      .eq('character_id', character.id)
      .then(({ data }) => {
        const map: Record<string, number> = {}
        for (const row of data ?? []) map[row.skill_id] = trainingBonus(row.training as Training) + row.extra_bonus
        setCharSkillBonus(map)
      })
    loadEquippedProtection()
  }, [character.id])

  async function updateDefenseField(patch: Partial<Pick<CharacterRecord, 'defense_other_bonus' | 'bloqueio_bonus' | 'esquiva_bonus'>>) {
    await supabase.from('characters').update(patch).eq('id', character.id)
    onUpdated()
  }

  async function removeAttack(id: string) {
    await supabase.from('character_attacks').delete().eq('id', id)
    await loadAttacks()
  }

  // O ataque guarda uma copia dos numeros de quando foi enviado. Quem manda e o item:
  // tirar uma maldicao da arma tem que mudar o ataque tambem. Entao aqui ele e recalculado
  // a partir do item e das modificacoes de agora, e e essa versao que aparece e que rola.
  const attacksAtualizados = attacks.map((a) => {
    if (!a.from_inventory_item_id) return a
    const origem = inventoryAmmo.find((i) => i.id === a.from_inventory_item_id)
    if (!origem) return a // item apagado do inventario: o ataque fica como estava
    const municao = origem.linked_ammo_id ? inventoryAmmo.find((i) => i.id === origem.linked_ammo_id) : null
    const numeros = numerosDoAtaque(origem.stats, [...origem.applied_modifiers, ...(municao?.applied_modifiers ?? [])])
    return {
      ...a,
      d20_bonus: numeros.d20Bonus,
      threat_margin: numeros.threatMargin,
      multiplier: numeros.multiplier,
      damage: numeros.damage,
      general_info: { ...a.general_info, damage_bonus_from_mods: numeros.damageBonusFromMods },
      modifiers: [...origem.applied_modifiers, ...(municao?.applied_modifiers ?? [])],
    }
  })

  function ammoForAttack(attack: Attack): InventoryAmmoInfo | null {
    if (!character.optional_rules.contagem_municao || !attack.from_inventory_item_id) return null
    const sourceInv = inventoryAmmo.find((i) => i.id === attack.from_inventory_item_id)
    if (!sourceInv?.linked_ammo_id) return null
    const ammoInv = inventoryAmmo.find((i) => i.id === sourceInv.linked_ammo_id)
    if (!ammoInv || ammoInv.ammo_total === null) return null
    return ammoInv
  }

  async function consumeAmmo(ammoInv: InventoryAmmoInfo) {
    const next = Math.max(0, (ammoInv.ammo_current ?? 0) - 1)
    await supabase.from('character_inventory').update({ ammo_current: next }).eq('id', ammoInv.id)
    await loadInventoryAmmo()
  }

  async function adjustAmmoCurrent(ammoInv: InventoryAmmoInfo, delta: number) {
    const next = Math.min(ammoInv.ammo_total ?? 0, Math.max(0, (ammoInv.ammo_current ?? 0) + delta))
    await supabase.from('character_inventory').update({ ammo_current: next }).eq('id', ammoInv.id)
    await loadInventoryAmmo()
  }

  async function deleteAmmoItem(ammoInv: InventoryAmmoInfo) {
    await supabase.from('character_inventory').update({ linked_ammo_id: null }).eq('linked_ammo_id', ammoInv.id)
    await supabase.from('character_inventory').delete().eq('id', ammoInv.id)
    setConfirmDeleteAmmo(null)
    await loadInventoryAmmo()
    await loadAttacks()
  }

  function rollAttackTest(attack: Attack) {
    const ammoInv = ammoForAttack(attack)
    if (ammoInv && (ammoInv.ammo_current ?? 0) <= 0) {
      window.alert(`Sem ${ammoInv.ammo_label ?? 'munição'} — recarregue no Inventário antes de atacar.`)
      return
    }

    const activeAttackMods = attackMods.filter((m) => m.is_active)
    const activeTestMods = testMods.filter((m) => m.is_active)

    const attackDiceBonus = activeAttackMods.reduce((sum, m) => sum + m.dice_bonus, 0) + activeTestMods.reduce((sum, m) => sum + m.dice_bonus, 0)
    const attackValueBonus = activeAttackMods.reduce((sum, m) => sum + m.value_bonus, 0) + activeTestMods.reduce((sum, m) => sum + m.value_bonus, 0)
    const threatBonus = activeAttackMods.reduce((sum, m) => sum + m.threat_margin_bonus, 0)

    const score = attrValue(character.attributes, attack.attribute) + attackDiceBonus
    const { rolls, kept } = rollAttributeTest(score)
    const skillBonus = attack.skill_id ? (charSkillBonus[attack.skill_id] ?? 0) : 0
    const bonus = skillBonus + attack.d20_bonus + attackValueBonus

    const effectiveThreatMargin = attack.threat_margin - threatBonus
    const isCrit = kept >= effectiveThreatMargin

    const label = `Ataque: ${attack.name}${isCrit ? ' (crítico!)' : ''}`
    setRoll({
      label,
      rolls,
      kept,
      bonus,
      municao: attack.general_info?.municao ?? null,
      modificadores: attack.general_info?.modificadores ?? [],
      characterName: character.name,
      diceTray: character.dice_tray,
    })
    setPendingAttack({ attackId: attack.id, isCrit })

    if (ammoInv) consumeAmmo(ammoInv)

    if (session) {
      recordRoll({
        characterId: character.id, userId: session.user.id, campaignId: character.campaign_id, characterName: character.name,
        label,
        total: kept + bonus,
        detail: `d20 mantido: ${kept} (rolados: ${rolls.join(', ')}) + bônus ${bonus}`,
        dice: rolls.map((v) => ({ sides: 20, value: v, discarded: v !== kept })), bonus,
      })
    }
  }

  function rollDamage(attack: Attack, isCrit: boolean) {
    const activeAttackMods = attackMods.filter((m) => m.is_active)
    const activeDamageMods = damageMods.filter((m) => m.is_active)

    const multiplierBonus = activeAttackMods.reduce((sum, m) => sum + m.multiplier_bonus, 0)
    const damageValueBonus = activeDamageMods.reduce((sum, m) => sum + m.value_bonus, 0) + (attack.general_info?.damage_bonus_from_mods ?? 0)
    const critMultiplier = isCrit ? attack.multiplier + multiplierBonus : 1

    const dice: RollCardDie[] = []
    const extraLines: string[] = []
    let total = damageValueBonus

    attack.damage.forEach((d) => {
      const sidesMatch = d.formula.match(/d(\d+)/i)
      const sides = sidesMatch ? Number(sidesMatch[1]) : 6
      const rolled = rollDiceFormula(d.formula, 1)
      if (!rolled) {
        extraLines.push(`Dano${d.tipo ? ` (${d.tipo})` : ''}: role manualmente (${d.formula})`)
        return
      }
      rolled.rolls.forEach((v) => dice.push({ sides, value: v }))
      total += rolled.total * critMultiplier
      if (d.tipo) extraLines.push(`Tipo: ${d.tipo}`)
    })

    const label = isCrit ? `Dano Crítico: ${attack.name} (x${critMultiplier})` : `Dano: ${attack.name}`
    setDamageRoll({ title: character.name, subtitle: label, total, dice, extraLines, bonus: damageValueBonus })
    setPendingAttack(null)

    if (session) {
      recordRoll({
        characterId: character.id, userId: session.user.id, campaignId: character.campaign_id, characterName: character.name,
        label, total, detail: dice.map((d) => `d${d.sides}: ${d.value}`).join(' · '),
        dice, bonus: damageValueBonus,
      })
    }
  }

  const agilidade = character.attributes.agilidade
  const defenseTotal = equippedDefense + character.defense_other_bonus + agilidade + 10
  const fortitudeSkill = skills.find((s) => s.name === 'Fortitude')
  const reflexosSkill = skills.find((s) => s.name === 'Reflexos')
  const bloqueioAuto = fortitudeSkill ? (charSkillBonus[fortitudeSkill.id] ?? 0) : 0
  const esquivaAuto = 10 + (reflexosSkill ? (charSkillBonus[reflexosSkill.id] ?? 0) : 0)

  useEffect(() => {
    if (fortitudeSkill && character.bloqueio_bonus !== bloqueioAuto) updateDefenseField({ bloqueio_bonus: bloqueioAuto })
  }, [bloqueioAuto])

  useEffect(() => {
    if (reflexosSkill && character.esquiva_bonus !== esquivaAuto) updateDefenseField({ esquiva_bonus: esquivaAuto })
  }, [esquivaAuto])

  return (
    <div>
      {roll && <RollResult result={roll} onClose={() => setRoll(null)} />}
      {damageRoll && (
        <RollCard
          title={damageRoll.title}
          subtitle={damageRoll.subtitle}
          total={damageRoll.total}
          dice={damageRoll.dice}
          extraLines={damageRoll.extraLines}
          bonus={damageRoll.bonus}
          background={character.dice_tray && character.dice_tray !== 'padrao' ? character.dice_tray : undefined}
          onClose={() => setDamageRoll(null)}
        />
      )}

      <div className="combat-defense-frame">
       <div className="combat-defense-card">
        <div className="combat-defense-top">
          <div className="combat-defense-badge">
            <img src={defenseRing} alt="" className="combat-defense-ring" />
            <span className="combat-defense-value">{defenseTotal}</span>
          </div>

          <div className="combat-defense-main">
            <span className="combat-defense-label">Defesa</span>
            <div className="combat-defense-formula">
              <span className="combat-plain-value">{equippedDefense}</span>
              <span className="combat-defense-sub">Equip</span>
              <span className="combat-defense-plus">+</span>
              <input
                className="combat-dotted-input"
                type="number"
                value={character.defense_other_bonus}
                onChange={(e) => updateDefenseField({ defense_other_bonus: Number(e.target.value) })}
              />
              <span className="combat-defense-sub">Outros</span>
              <span className="combat-defense-fixed">+AGI({agilidade})+10</span>
            </div>
          </div>

          <div className="combat-defense-side">
            <div className="combat-defense-side-item">
              {editMode ? (
                <input
                  className="combat-dotted-input"
                  type="number"
                  value={character.bloqueio_bonus}
                  onChange={(e) => updateDefenseField({ bloqueio_bonus: Number(e.target.value) })}
                />
              ) : (
                <span className="combat-plain-value">{character.bloqueio_bonus}</span>
              )}
              <span className="combat-defense-sub">Bloqueio</span>
            </div>
            <div className="combat-defense-side-item">
              {editMode ? (
                <input
                  className="combat-dotted-input"
                  type="number"
                  value={character.esquiva_bonus}
                  onChange={(e) => updateDefenseField({ esquiva_bonus: Number(e.target.value) })}
                />
              ) : (
                <span className="combat-plain-value">{character.esquiva_bonus}</span>
              )}
              <span className="combat-defense-sub">Esquiva</span>
            </div>
          </div>

          <button type="button" className="combat-defense-chevron" onClick={() => setDefenseDetailsOpen((v) => !v)} aria-label="Detalhes de defesa">
            {defenseDetailsOpen ? '▲' : '▾'}
          </button>
        </div>

        {defenseDetailsOpen && (
          <div className="combat-defense-details">
            <p><strong>Proteção:</strong> {equippedProtectionName ?? 'Nenhuma equipada'}</p>
            <p><strong>Resistência:</strong> Nenhuma</p>
          </div>
        )}
       </div>
      </div>

      <div className="combat-stats-line">
        <button type="button" className="combat-refresh-btn" onClick={loadEquippedProtection} aria-label="Atualizar">
          <img src={resetIcon} alt="" />
        </button>

        <div className="combat-stats-row">
          <span><strong>PE / Turno:</strong> 1/1</span>
          <span><strong>Deslocamento:</strong> 9m (6q)</span>
        </div>
      </div>

      <CombateModifiersPanel characterId={character.id} onAttackChange={setAttackMods} onDamageChange={setDamageMods} />

      {character.optional_rules.contagem_municao && (
        (() => {
          const ammoItems = inventoryAmmo.filter((i) => i.ammo_total !== null)
          if (ammoItems.length === 0) {
            return <div className="combat-ammo-empty">Você não possui munição. Adicione a partir do seu inventário.</div>
          }
          return (
            <div className="combat-ammo-frame">
              <button type="button" className="combat-ammo-header" onClick={() => setAmmoOpen((v) => !v)}>
                <div className="combat-ammo-icons">
                  {ammoItems.map((a) => (
                    <span key={a.id} className="combat-ammo-icon-wrap">
                      <img src={mysteryIcon} alt="" className="combat-ammo-icon" />
                      <span className="combat-ammo-badge">×{a.quantity}</span>
                    </span>
                  ))}
                </div>
                <span className="combat-ammo-chevron">{ammoOpen ? '▲' : '▾'}</span>
              </button>

              {ammoOpen && (
                <div className="combat-ammo-body">
                  {ammoItems.map((a) => (
                    <div key={a.id} className="combat-ammo-row">
                      <img src={mysteryIcon} alt="" className="combat-ammo-row-thumb" />
                      <span className="combat-ammo-row-name">{a.name}</span>
                      <div className="combat-ammo-qty">
                        <span className="combat-ammo-qty-label">QUANTIDADE:</span>
                        <button type="button" onClick={() => adjustAmmoCurrent(a, -1)} disabled={(a.ammo_current ?? 0) <= 0}>−</button>
                        <span className="combat-ammo-qty-value">{a.ammo_current}/{a.ammo_total}</span>
                        <button type="button" onClick={() => adjustAmmoCurrent(a, 1)} disabled={(a.ammo_current ?? 0) >= (a.ammo_total ?? 0)}>+</button>
                      </div>
                      <button type="button" className="combat-ammo-delete" onClick={() => setConfirmDeleteAmmo(a)} aria-label="Excluir munição" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })()
      )}

      {confirmDeleteAmmo && (
        <div className="combat-ammo-confirm-backdrop" onClick={() => setConfirmDeleteAmmo(null)}>
          <div className="combat-ammo-confirm" onClick={(e) => e.stopPropagation()}>
            <p>Você quer excluir <strong>{confirmDeleteAmmo.name}</strong>?</p>
            <div className="combat-ammo-confirm-actions">
              <button type="button" className="combat-ammo-confirm-yes" onClick={() => deleteAmmoItem(confirmDeleteAmmo)}>Confirmar</button>
              <button type="button" className="combat-ammo-confirm-no" onClick={() => setConfirmDeleteAmmo(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="combat-search-row">
        <div className="combat-search-field">
          <input className="combat-search-input" placeholder="Buscar Ataques" value={attackSearch} onChange={(e) => setAttackSearch(e.target.value)} />
          <svg className="combat-search-icon" viewBox="0 0 24 24" aria-hidden>
            <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <button type="button" className="combat-add-btn" onClick={() => setAdding(true)}>Adicionar Ataque</button>
      </div>

      {(adding || editingAttack) && (
        <AttackFormModal
          characterId={character.id}
          skills={skills}
          editing={editingAttack ?? undefined}
          onClose={() => { setAdding(false); setEditingAttack(null) }}
          onSaved={loadAttacks}
        />
      )}

      {attacksAtualizados.filter((a) => a.name.toLowerCase().includes(attackSearch.toLowerCase())).map((a) => {
        const ammoInv = ammoForAttack(a)
        return (
          <AttackCard
            key={a.id}
            name={a.name}
            ataque={`${attrValue(character.attributes, a.attribute)}d20${a.d20_bonus ? `+${a.d20_bonus}` : ''}`}
            dano={a.damage.map((d, i) => {
              const bonus = i === 0 ? (a.general_info?.damage_bonus_from_mods ?? 0) : 0
              return `${somaBonusNoDano(d.formula, bonus)}${d.tipo ? ` ${d.tipo}` : ''}`
            }).join(', ') || '—'}
            critico={`${a.threat_margin}/x${a.multiplier}`}
            info={a.general_info}
            municaoRestante={ammoInv ? `${ammoInv.ammo_current ?? 0}/${ammoInv.ammo_total} ${ammoInv.ammo_label ?? ''}`.trim() : null}
            expanded={expandedAttack === a.id}
            onToggle={() => setExpandedAttack((atual) => (atual === a.id ? null : a.id))}
            onRemove={() => removeAttack(a.id)}
            onEdit={() => setEditingAttack(a as unknown as AttackToEdit)}
            onRollAtaque={() => rollAttackTest(a)}
            onRollDano={(critico) => rollDamage(a, critico)}
            danoArmado={pendingAttack?.attackId === a.id}
            ehCritico={pendingAttack?.attackId === a.id && pendingAttack.isCrit}
          />
        )
      })}
    </div>
  )
}
