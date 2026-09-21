import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import ItemModifiersModal, { type AppliedModifier } from './ItemModifiersModal'

export default function ItemModifiers({
  inventoryId,
  itemType,
  applied,
  onChanged,
}: {
  inventoryId: string
  itemType: 'arma' | 'municao' | 'protecao' | 'geral' | 'paranormal'
  applied: AppliedModifier[]
  onChanged: () => void
}) {
  const [aberto, setAberto] = useState(false)

  async function salvar(next: AppliedModifier[]) {
    await supabase.from('character_inventory').update({ applied_modifiers: next }).eq('id', inventoryId)
    onChanged()
  }

  const quantidade = applied.length

  return (
    <>
      <button type="button" className="inv-item-btn" onClick={() => setAberto(true)}>
        Modificações e Maldições{quantidade > 0 ? ` (${quantidade})` : ''}
      </button>

      {aberto && (
        <ItemModifiersModal
          itemType={itemType}
          applied={applied}
          onClose={() => setAberto(false)}
          onApply={salvar}
        />
      )}
    </>
  )
}
