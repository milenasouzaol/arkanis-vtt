import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

// Nomes dos poderes/habilidades da ficha (classe, paranormais, gerais, origem, trilha e os criados
// na mão). A Defesa e os testes de resistência usam pra somar os bônus fixos (ver defesa.ts).
export function usePoderes(characterId: string, recarregar?: unknown): string[] {
  const [nomes, setNomes] = useState<string[]>([])
  useEffect(() => {
    let cancelado = false
    supabase
      .from('character_abilities')
      .select('custom_ability, class_powers(name), paranormal_powers(name), general_powers(name), origins(power_name), class_track_tiers(name)')
      .eq('character_id', characterId)
      .then(({ data }) => {
        if (cancelado) return
        setNomes((data ?? []).map((r: any) =>
          r.class_powers?.name ?? r.paranormal_powers?.name ?? r.general_powers?.name ?? r.origins?.power_name ?? r.class_track_tiers?.name ?? r.custom_ability?.name ?? '',
        ).filter(Boolean))
      })
    return () => { cancelado = true }
  }, [characterId, recarregar])
  return nomes
}
