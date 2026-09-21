import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CharacterRecord } from './index'
import InventarioTopBox from './InventarioTopBox'
import InventoryItemCard from './InventoryItemCard'
import EquipmentPickerModal, { type EquipmentPickResult } from './EquipmentPickerModal'
import { numerosDoAtaque, statsComModificadores } from './itemMods'
import ItemEditModal, { type ItemToEdit } from './ItemEditModal'

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

export default function InventarioTab({ character, editMode }: { character: CharacterRecord; editMode: boolean }) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<ItemToEdit | null>(null)

  async function loadInventory() {
    const { data } = await supabase
      .from('character_inventory')
      .select('id, equipment_item_id, custom_item, category_override, is_equipped, quantity, applied_modifiers, linked_ammo_id, ammo_current, ammo_total, ammo_label, equipment_items(id, type, name, category, spaces, description, stats)')
      .eq('character_id', character.id)
    setItems((data ?? []) as unknown as InventoryItem[])
  }

  useEffect(() => { loadInventory() }, [character.id])

  async function addFromPicker(result: EquipmentPickResult) {
    if (result.kind === 'catalog') {
      await supabase.from('character_inventory').insert({ character_id: character.id, equipment_item_id: result.id })
    } else {
      await supabase.from('character_inventory').insert({
        character_id: character.id,
        custom_item: { name: result.name, type: result.type, category: result.category, spaces: result.spaces, description: result.description, stats: result.stats ?? {} },
      })
    }
    setAdding(false)
    await loadInventory()
  }

  function startEdit(inv: InventoryItem) {
    const item = inv.equipment_items ?? inv.custom_item
    if (!item) return
    setEditingItem({
      id: inv.id,
      name: item.name,
      type: (item.type ?? 'geral') as ItemToEdit['type'],
      category: (inv.category_override ?? item.category ?? 'I') as string,
      spaces: item.spaces ?? 1,
      description: item.description ?? null,
      stats: item.stats ?? {},
      applied_modifiers: inv.applied_modifiers ?? [],
      image_url: (item as { image_url?: string | null }).image_url ?? null,
    })
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
    const linkedAmmo = inv.linked_ammo_id ? items.find((it) => it.id === inv.linked_ammo_id) : null
    const todosMods = [...(inv.applied_modifiers ?? []), ...(linkedAmmo?.applied_modifiers ?? [])]
    const numeros = numerosDoAtaque(stats, todosMods)

    const modificadores = [
      ...(inv.applied_modifiers ?? []).map((m) => ({ ...m, origem: 'Arma' as const })),
      ...(linkedAmmo?.applied_modifiers ?? []).map((m) => ({ ...m, origem: 'Munição' as const })),
    ]

    await supabase.from('character_attacks').insert({
      character_id: character.id,
      name: item.name,
      attribute: isMelee ? 'forca' : 'agilidade',
      d20_bonus: numeros.d20Bonus,
      threat_margin: numeros.threatMargin,
      multiplier: numeros.multiplier,
      damage: numeros.damage,
      general_info: {
        tipo: stats.natureza,
        empunhadura: stats.empunhadura,
        alcance: stats.alcance,
        tipo_municao: stats.tipo_municao,
        municao: linkedAmmo?.equipment_items?.name ?? linkedAmmo?.custom_item?.name ?? null,
        modificadores,
        damage_bonus_from_mods: numeros.damageBonusFromMods,
      },
      from_inventory_item_id: inv.id,
    })
  }

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

  // Os filtros da barra: "Equipamentos" e o mesmo que a categoria Geral, e "Amaldicoados"
  // nao e um tipo de item - e qualquer item que tenha alguma maldicao aplicada.
  const FILTROS = [
    { key: 'arma', label: 'Armas' },
    { key: 'geral', label: 'Equipamentos' },
    { key: 'protecao', label: 'Proteções' },
    { key: 'municao', label: 'Munições' },
    { key: 'amaldicoados', label: 'Amaldiçoados' },
  ] as const

  const itensVisiveis = items.filter((inv) => {
    const item = inv.equipment_items ?? inv.custom_item
    if (!item) return false
    if (!item.name.toLowerCase().includes(search.toLowerCase())) return false
    if (!filtro) return true
    if (filtro === 'amaldicoados') return (inv.applied_modifiers ?? []).some((m) => m.kind === 'maldicao')
    return item.type === filtro
  })

  return (
    <div>
      <InventarioTopBox character={character} atualPorCategoria={atualPorCategoria} cargaAtual={cargaAtual} editMode={editMode} />

      <div className="combat-search-row inv-search-row">
        <div className="combat-search-field">
          <input className="combat-search-input" placeholder="Buscar no Inventário" value={search} onChange={(e) => setSearch(e.target.value)} />
          <svg className="combat-search-icon" viewBox="0 0 24 24" aria-hidden>
            <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <button type="button" className="combat-add-btn" onClick={() => setAdding((a) => !a)}>Adicionar Equipamento</button>
      </div>

      <div className="inv-filtros">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={filtro === f.key ? 'inv-filtro-btn active' : 'inv-filtro-btn'}
            onClick={() => setFiltro((atualFiltro) => (atualFiltro === f.key ? null : f.key))}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="inv-item-list">
        {itensVisiveis.map((inv) => {
          const item = inv.equipment_items ?? inv.custom_item
          if (!item) return null
          const isExpanded = expanded === inv.id
          const canEquip = item.type === 'protecao' || item.type === 'geral' || item.type === 'paranormal'

          return (
            <InventoryItemCard
              key={inv.id}
              item={{ ...item, category: inv.category_override ?? item.category, stats: statsComModificadores(item.stats, inv.applied_modifiers) }}
              expanded={isExpanded}
              onToggle={() => setExpanded(isExpanded ? null : inv.id)}
              quantidade={inv.ammo_total !== null ? (
                <>
                  <span className="inv-item-qty-label">Quantidade:</span>
                  <span className="inv-item-qty-box">
                    <button type="button" onClick={() => setAmmo(inv, { ammo_current: Math.max(0, (inv.ammo_current ?? 0) - 1) })} disabled={(inv.ammo_current ?? 0) <= 0}>-</button>
                    <span className="inv-item-qty-value">{inv.ammo_current}/{inv.ammo_total}</span>
                    <button type="button" onClick={() => setAmmo(inv, { ammo_current: Math.min(inv.ammo_total ?? 0, (inv.ammo_current ?? 0) + 1) })}>+</button>
                  </span>
                </>
              ) : undefined}
              actions={
                <>
                  <button type="button" className="inv-item-btn" onClick={() => remove(inv.id)}>Remover</button>
                  <span className="inv-item-actions-right">
                    <button type="button" className="inv-item-btn" onClick={() => startEdit(inv)}>Editar</button>
                    {item.type === 'arma' && (
                      <button type="button" className="inv-item-btn" onClick={() => sendToCombat(inv)}>Enviar para o combate</button>
                    )}
                  </span>
                </>
              }
            >
              <div className="inv-item-extras">
                <label>
                  Quantas unidades
                  <button type="button" className="inv-item-btn" onClick={() => setQuantity(inv, inv.quantity - 1)} disabled={inv.quantity <= 0}>-</button>
                  {inv.quantity}
                  <button type="button" className="inv-item-btn" onClick={() => setQuantity(inv, inv.quantity + 1)}>+</button>
                </label>
                {inv.ammo_total === null ? (
                  <button type="button" className="inv-item-btn" onClick={() => initAmmoTracking(inv, item)}>Rastrear Munição/Usos</button>
                ) : (
                  <>
                    <label>Rótulo <input value={inv.ammo_label ?? ''} onChange={(e) => setAmmo(inv, { ammo_label: e.target.value })} /></label>
                    <label>Total <input type="number" value={inv.ammo_total} onChange={(e) => setAmmo(inv, { ammo_total: Number(e.target.value) })} /></label>
                    <button type="button" className="inv-item-btn" onClick={() => setAmmo(inv, { ammo_current: inv.ammo_total })}>Recarregar</button>
                  </>
                )}
                {item.type === 'arma' && (() => {
                  const requiredAmmo = (item.stats ?? {}).tipo_municao as string | undefined
                  const compatibleAmmo = items.filter((i) => {
                    const ammoItem = i.equipment_items ?? i.custom_item
                    if (ammoItem?.type !== 'municao') return false
                    return requiredAmmo ? ammoItem.name === requiredAmmo : true
                  })
                  return (
                    <label>
                      Munição {requiredAmmo ? '(' + requiredAmmo + ')' : ''}
                      <select value={inv.linked_ammo_id ?? ''} onChange={(e) => linkAmmo(inv, e.target.value || null)}>
                        <option value="">Nenhuma</option>
                        {compatibleAmmo.map((i) => (
                          <option key={i.id} value={i.id}>{(i.equipment_items ?? i.custom_item)?.name}</option>
                        ))}
                      </select>
                    </label>
                  )
                })()}
                {canEquip && (
                  <button type="button" className="inv-item-btn" onClick={() => toggleEquip(inv)}>{inv.is_equipped ? 'Desequipar' : 'Equipar'}</button>
                )}
              </div>
            </InventoryItemCard>
          )
        })}
      </div>

      {editingItem && (
        <ItemEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={loadInventory}
        />
      )}

      {adding && (
        <EquipmentPickerModal
          characterId={character.id}
          onClose={() => setAdding(false)}
          onAdd={addFromPicker}
        />
      )}

    </div>
  )
}
