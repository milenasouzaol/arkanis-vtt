import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CharacterRecord } from './index'
import ItemModifiers from './ItemModifiers'
import InventarioTopBox from './InventarioTopBox'

type EquipmentItem = {
  id: string
  type: 'arma' | 'municao' | 'protecao' | 'geral' | 'paranormal'
  name: string
  category: string
  spaces: number | null
  description: string | null
  stats: Record<string, unknown>
}

type InventoryItem = {
  id: string
  equipment_item_id: string | null
  custom_item: (Partial<EquipmentItem> & { name: string }) | null
  category_override: string | null
  is_equipped: boolean
  quantity: number
  equipment_items: EquipmentItem | null
  applied_modifiers: { kind: 'modificacao' | 'maldicao'; name: string; effect: string; elemento: string | null }[]
  linked_ammo_id: string | null
  ammo_current: number | null
  ammo_total: number | null
  ammo_label: string | null
}

// Extrai bônus numéricos simples do texto de efeito de uma modificação (ex.: "+2 em
// margem de ameaça", "+1 no multiplicador de crítico"). Efeitos mais complexos (Calibre
// Grosso, Compensador etc.) não são parseados aqui e continuam só como referência textual.
function parseNumericMod(effect: string) {
  const result = { attackTestBonus: 0, threatMarginDelta: 0, damageBonus: 0, multiplierDelta: 0 }
  const margemMatch = effect.match(/([+-]?\d+)\s+em margem de ameaça/i)
  if (margemMatch) result.threatMarginDelta -= Number(margemMatch[1])
  const ataqueMatch = effect.match(/([+-]?\d+)\s+em testes de ataque/i)
  if (ataqueMatch) result.attackTestBonus += Number(ataqueMatch[1])
  const danoMatch = effect.match(/([+-]?\d+)\s+em rolagens de dano/i)
  if (danoMatch) result.damageBonus += Number(danoMatch[1])
  const multMatch = effect.match(/([+-]?\d+)\s+no multiplicador de crítico/i)
  if (multMatch) result.multiplierDelta += Number(multMatch[1])
  return result
}

function parseCritico(critico: unknown): { threatMargin: number; multiplier: number } {
  let threatMargin = 20
  let multiplier = 2
  for (const part of String(critico ?? '').split('/')) {
    const trimmed = part.trim()
    if (/^x\d+$/i.test(trimmed)) multiplier = Number(trimmed.slice(1))
    else if (/^\d+$/.test(trimmed)) threatMargin = Number(trimmed)
  }
  return { threatMargin, multiplier }
}

const TYPES: { key: EquipmentItem['type']; label: string }[] = [
  { key: 'arma', label: 'Armas' },
  { key: 'municao', label: 'Munições' },
  { key: 'protecao', label: 'Proteções' },
  { key: 'geral', label: 'Geral' },
  { key: 'paranormal', label: 'Paranormal' },
]

function summarize(item: EquipmentItem | Partial<EquipmentItem>): string {
  const stats = item.stats ?? {}
  if (item.type === 'arma') return `Dano ${stats.dano ?? '?'} · Crítico ${stats.critico ?? '?'} · Alcance ${stats.alcance ?? '—'} · Cat. ${item.category} · Esp. ${item.spaces ?? '—'}`
  if (item.type === 'protecao') return `Defesa +${stats.defesa ?? 0} · Cat. ${item.category} · Esp. ${item.spaces ?? '—'}`
  return `Cat. ${item.category} · Esp. ${item.spaces ?? '—'}`
}

export default function InventarioTab({ character }: { character: CharacterRecord }) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [type, setType] = useState<EquipmentItem['type']>('arma')
  const [search, setSearch] = useState('')
  const [catalog, setCatalog] = useState<EquipmentItem[]>([])
  const [creatingCustom, setCreatingCustom] = useState(false)
  const [customDraft, setCustomDraft] = useState({ name: '', category: 'I', spaces: 1, description: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState({ name: '', category: 'I', spaces: 1, description: '', dano: '', critico: '', defesa: 0 })

  async function loadInventory() {
    const { data } = await supabase
      .from('character_inventory')
      .select('id, equipment_item_id, custom_item, category_override, is_equipped, quantity, applied_modifiers, linked_ammo_id, ammo_current, ammo_total, ammo_label, equipment_items(id, type, name, category, spaces, description, stats)')
      .eq('character_id', character.id)
    setItems((data ?? []) as unknown as InventoryItem[])
  }

  useEffect(() => { loadInventory() }, [character.id])

  useEffect(() => {
    if (!adding) return
    supabase.from('equipment_items').select('id, type, name, category, spaces, description, stats').eq('type', type).order('name').then(({ data }) => setCatalog(data ?? []))
  }, [adding, type])

  async function addFromCatalog(item: EquipmentItem) {
    await supabase.from('character_inventory').insert({ character_id: character.id, equipment_item_id: item.id })
    await loadInventory()
  }

  async function addCustom() {
    if (!customDraft.name) return
    await supabase.from('character_inventory').insert({
      character_id: character.id,
      custom_item: { name: customDraft.name, type, category: customDraft.category, spaces: customDraft.spaces, description: customDraft.description, stats: {} },
    })
    setCustomDraft({ name: '', category: 'I', spaces: 1, description: '' })
    setCreatingCustom(false)
    await loadInventory()
  }

  function startEdit(inv: InventoryItem) {
    const item = inv.equipment_items ?? inv.custom_item
    if (!item) return
    const stats = item.stats ?? {}
    setEditDraft({
      name: item.name,
      category: (inv.category_override ?? item.category ?? 'I') as string,
      spaces: item.spaces ?? 1,
      description: item.description ?? '',
      dano: String(stats.dano ?? ''),
      critico: String(stats.critico ?? ''),
      defesa: Number(stats.defesa ?? 0),
    })
    setEditingId(inv.id)
  }

  async function saveEdit(inv: InventoryItem) {
    const item = inv.equipment_items ?? inv.custom_item
    if (!item) return
    const stats: Record<string, unknown> = { ...(item.stats ?? {}) }
    if (item.type === 'arma') { stats.dano = editDraft.dano; stats.critico = editDraft.critico }
    if (item.type === 'protecao') stats.defesa = editDraft.defesa

    await supabase.from('character_inventory').update({
      custom_item: {
        name: editDraft.name,
        type: item.type,
        category: editDraft.category,
        spaces: editDraft.spaces,
        description: editDraft.description,
        stats,
      },
      equipment_item_id: null,
    }).eq('id', inv.id)

    setEditingId(null)
    await loadInventory()
  }

  async function remove(id: string) {
    await supabase.from('character_inventory').delete().eq('id', id)
    await loadInventory()
  }

  async function toggleEquip(inv: InventoryItem) {
    const item = inv.equipment_items ?? inv.custom_item
    if (item?.type === 'protecao' && !inv.is_equipped) {
      // só 1 proteção equipada por vez
      const currentlyEquippedProtection = items.find((i) => i.is_equipped && (i.equipment_items?.type ?? i.custom_item?.type) === 'protecao')
      if (currentlyEquippedProtection) await supabase.from('character_inventory').update({ is_equipped: false }).eq('id', currentlyEquippedProtection.id)
    }
    await supabase.from('character_inventory').update({ is_equipped: !inv.is_equipped }).eq('id', inv.id)
    await loadInventory()
  }

  async function setQuantity(inv: InventoryItem, quantity: number) {
    if (quantity < 0) return
    await supabase.from('character_inventory').update({ quantity }).eq('id', inv.id)
    await loadInventory()
  }

  async function setAmmo(inv: InventoryItem, patch: Partial<Pick<InventoryItem, 'ammo_current' | 'ammo_total' | 'ammo_label'>>) {
    await supabase.from('character_inventory').update(patch).eq('id', inv.id)
    await loadInventory()
  }

  async function initAmmoTracking(inv: InventoryItem, item: EquipmentItem | Partial<EquipmentItem>) {
    const defaultLabel = character.optional_rules.contagem_municao && item.type === 'municao' ? 'Balas' : 'Usos'
    await setAmmo(inv, { ammo_total: 1, ammo_current: 1, ammo_label: defaultLabel })
  }

  async function linkAmmo(inv: InventoryItem, ammoId: string | null) {
    await supabase.from('character_inventory').update({ linked_ammo_id: ammoId }).eq('id', inv.id)
    await loadInventory()
  }

  async function sendToCombat(inv: InventoryItem) {
    const item = inv.equipment_items ?? inv.custom_item
    if (!item) return
    const stats = item.stats ?? {}
    const isMelee = stats.natureza === 'corpo_a_corpo' || !stats.natureza
    const { threatMargin, multiplier } = parseCritico(stats.critico)

    const damage: { formula: string; tipo: string }[] = [{ formula: String(stats.dano ?? ''), tipo: String(stats.tipo_dano ?? '') }]
    let finalMultiplier = multiplier
    let finalThreatMargin = threatMargin
    let attackTestBonus = 0
    let damageBonusFromMods = 0

    const linkedAmmo = inv.linked_ammo_id ? items.find((i) => i.id === inv.linked_ammo_id) : null

    for (const mod of [...(inv.applied_modifiers ?? []), ...(linkedAmmo?.applied_modifiers ?? [])]) {
      if (mod.kind !== 'modificacao') continue // maldições têm efeitos narrativos demais pra parsear automaticamente
      if (mod.name === 'Dum Dum') finalMultiplier += 1
      if (mod.name === 'Explosiva') damage.push({ formula: '2d6', tipo: 'explosão adicional' })
      const parsed = parseNumericMod(mod.effect)
      finalThreatMargin += parsed.threatMarginDelta
      finalMultiplier += parsed.multiplierDelta
      attackTestBonus += parsed.attackTestBonus
      damageBonusFromMods += parsed.damageBonus
    }

    const modificadores = [
      ...(inv.applied_modifiers ?? []).map((m) => ({ ...m, origem: 'Arma' as const })),
      ...(linkedAmmo?.applied_modifiers ?? []).map((m) => ({ ...m, origem: 'Munição' as const })),
    ]

    await supabase.from('character_attacks').insert({
      character_id: character.id,
      name: item.name,
      attribute: isMelee ? 'forca' : 'agilidade',
      d20_bonus: attackTestBonus,
      threat_margin: finalThreatMargin,
      multiplier: finalMultiplier,
      damage,
      general_info: {
        tipo: stats.natureza,
        empunhadura: stats.empunhadura,
        alcance: stats.alcance,
        tipo_municao: stats.tipo_municao,
        municao: linkedAmmo?.equipment_items?.name ?? linkedAmmo?.custom_item?.name ?? null,
        modificadores,
        damage_bonus_from_mods: damageBonusFromMods,
      },
      from_inventory_item_id: inv.id,
    })
  }

  const filteredCatalog = catalog.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))

  // Atual por categoria e carga saem dos proprios itens: cada item conta 1 na sua
  // categoria (I a IV) e soma os espacos dele, vezes a quantidade, na carga.
  const atualPorCategoria: [number, number, number, number] = [0, 0, 0, 0]
  let cargaAtual = 0
  for (const inv of items) {
    const item = inv.equipment_items ?? inv.custom_item
    if (!item) continue
    const indice = ['I', 'II', 'III', 'IV'].indexOf(String(inv.category_override ?? item.category ?? ''))
    if (indice >= 0) atualPorCategoria[indice] += 1
    cargaAtual += (item.spaces ?? 0) * Math.max(1, inv.quantity)
  }

  return (
    <div>
      <InventarioTopBox character={character} atualPorCategoria={atualPorCategoria} cargaAtual={cargaAtual} />
      <input placeholder="Buscar no Inventário" value={search} onChange={(e) => setSearch(e.target.value)} />
      <button type="button" onClick={() => setAdding((a) => !a)}>Adicionar Equipamento</button>

      <ul>
        {items.map((inv) => {
          const item = inv.equipment_items ?? inv.custom_item
          if (!item) return null
          const isExpanded = expanded === inv.id
          const canEquip = item.type === 'protecao' || item.type === 'geral' || item.type === 'paranormal'
          return (
            <li key={inv.id}>
              <button type="button" onClick={() => setExpanded(isExpanded ? null : inv.id)}>
                {item.name}{inv.quantity > 1 ? ` (x${inv.quantity})` : ''} — {summarize(item)} {inv.is_equipped ? '(equipado)' : ''}
              </button>
              {isExpanded && editingId !== inv.id && (
                <div>
                  {item.description && <p>{item.description}</p>}
                  <label>
                    Quantidade
                    <button type="button" onClick={() => setQuantity(inv, inv.quantity - 1)} disabled={inv.quantity <= 0}>-</button>
                    {inv.quantity}
                    <button type="button" onClick={() => setQuantity(inv, inv.quantity + 1)}>+</button>
                  </label>
                  {inv.ammo_total === null ? (
                    <button type="button" onClick={() => initAmmoTracking(inv, item)}>Rastrear Munição/Usos</button>
                  ) : (
                    <div>
                      <label>
                        Rótulo <input value={inv.ammo_label ?? ''} onChange={(e) => setAmmo(inv, { ammo_label: e.target.value })} />
                      </label>
                      <label>
                        Total <input type="number" value={inv.ammo_total} onChange={(e) => setAmmo(inv, { ammo_total: Number(e.target.value) })} />
                      </label>
                      <button type="button" onClick={() => setAmmo(inv, { ammo_current: Math.max(0, (inv.ammo_current ?? 0) - 1) })} disabled={(inv.ammo_current ?? 0) <= 0}>-</button>
                      {inv.ammo_current} / {inv.ammo_total} {inv.ammo_label}
                      <button type="button" onClick={() => setAmmo(inv, { ammo_current: Math.min(inv.ammo_total ?? 0, (inv.ammo_current ?? 0) + 1) })}>+</button>
                      <button type="button" onClick={() => setAmmo(inv, { ammo_current: inv.ammo_total })}>Recarregar</button>
                    </div>
                  )}
                  <button type="button" onClick={() => remove(inv.id)}>Remover</button>
                  <button type="button" onClick={() => startEdit(inv)}>Editar</button>
                  {item.type === 'arma' && (
                    <>
                      {(() => {
                        const requiredAmmo = (item.stats ?? {}).tipo_municao as string | undefined
                        const compatibleAmmo = items.filter((i) => {
                          const ammoItem = i.equipment_items ?? i.custom_item
                          if (ammoItem?.type !== 'municao') return false
                          return requiredAmmo ? ammoItem.name === requiredAmmo : true
                        })
                        return (
                          <label>
                            Munição {requiredAmmo ? `(${requiredAmmo})` : ''}
                            <select value={inv.linked_ammo_id ?? ''} onChange={(e) => linkAmmo(inv, e.target.value || null)}>
                              <option value="">Nenhuma</option>
                              {compatibleAmmo.map((i) => (
                                <option key={i.id} value={i.id}>{(i.equipment_items ?? i.custom_item)?.name}</option>
                              ))}
                            </select>
                            {requiredAmmo && compatibleAmmo.length === 0 && <p>Nenhuma {requiredAmmo} no inventário ainda.</p>}
                          </label>
                        )
                      })()}
                      <button type="button" onClick={() => sendToCombat(inv)}>Enviar para o combate</button>
                    </>
                  )}
                  {canEquip && <button type="button" onClick={() => toggleEquip(inv)}>{inv.is_equipped ? 'Desequipar' : 'Equipar'}</button>}
                  <ItemModifiers inventoryId={inv.id} itemType={item.type ?? 'geral'} applied={inv.applied_modifiers ?? []} onChanged={loadInventory} />
                </div>
              )}
              {isExpanded && editingId === inv.id && (
                <div>
                  <label>Nome <input value={editDraft.name} onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))} /></label>
                  <label>Categoria
                    <select value={editDraft.category} onChange={(e) => setEditDraft((d) => ({ ...d, category: e.target.value }))}>
                      {['0', 'I', 'II', 'III', 'IV'].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label>Espaços <input type="number" value={editDraft.spaces} onChange={(e) => setEditDraft((d) => ({ ...d, spaces: Number(e.target.value) }))} /></label>
                  {item.type === 'arma' && (
                    <>
                      <label>Dano <input value={editDraft.dano} onChange={(e) => setEditDraft((d) => ({ ...d, dano: e.target.value }))} /></label>
                      <label>Crítico <input value={editDraft.critico} onChange={(e) => setEditDraft((d) => ({ ...d, critico: e.target.value }))} /></label>
                    </>
                  )}
                  {item.type === 'protecao' && (
                    <label>Defesa <input type="number" value={editDraft.defesa} onChange={(e) => setEditDraft((d) => ({ ...d, defesa: Number(e.target.value) }))} /></label>
                  )}
                  <label>Descrição <textarea value={editDraft.description} onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))} /></label>
                  <button type="button" onClick={() => saveEdit(inv)}>Salvar</button>
                  <button type="button" onClick={() => setEditingId(null)}>Cancelar</button>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {adding && (
        <div>
          <nav>
            {TYPES.map((t) => (
              <button key={t.key} type="button" onClick={() => { setType(t.key); setCreatingCustom(false) }} disabled={type === t.key && !creatingCustom}>{t.label}</button>
            ))}
          </nav>

          <button type="button" onClick={() => setCreatingCustom(true)}>Criar novo Equipamento</button>

          {creatingCustom ? (
            <div>
              <label>Nome <input value={customDraft.name} onChange={(e) => setCustomDraft((d) => ({ ...d, name: e.target.value }))} /></label>
              <label>Categoria
                <select value={customDraft.category} onChange={(e) => setCustomDraft((d) => ({ ...d, category: e.target.value }))}>
                  {['0', 'I', 'II', 'III', 'IV'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>Espaços <input type="number" value={customDraft.spaces} onChange={(e) => setCustomDraft((d) => ({ ...d, spaces: Number(e.target.value) }))} /></label>
              <label>Descrição <textarea value={customDraft.description} onChange={(e) => setCustomDraft((d) => ({ ...d, description: e.target.value }))} /></label>
              <button type="button" onClick={addCustom}>Adicionar Item</button>
            </div>
          ) : filteredCatalog.length === 0 ? (
            <p>Sem itens cadastrados ainda nessa categoria.</p>
          ) : (
            <ul>
              {filteredCatalog.map((i) => (
                <li key={i.id}>
                  {i.name} — {summarize(i)}
                  <button type="button" onClick={() => addFromCatalog(i)}>Adicionar</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
