import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CharacterRecord } from './index'

/** Numeros da classe que entram nos maximos da ficha (PV, PE, Sanidade, PD). */
export type ClasseDaFicha = {
  pv_initial: number | null; pv_initial_attr: string | null; pv_per_nex: number | null; pv_per_nex_attr: string | null
  pe_initial: number | null; pe_initial_attr: string | null; pe_per_nex: number | null; pe_per_nex_attr: string | null
  sanity_initial: number | null; sanity_per_nex: number | null
  pd_initial: number | null; pd_initial_attr: string | null; pd_per_nex: number | null; pd_per_nex_attr: string | null
  pd_patente_initial: number | null; pd_patente_per_patente: number | null
}

/**
 * Classe do personagem: a do banco ou a classe propria criada na ficha. A aba Agente e o
 * Interludio usam a mesma, pra o descanso parar no mesmo maximo que aparece nas barras.
 */
export function useClasseDaFicha(character: Pick<CharacterRecord, 'class_id' | 'custom_class'>) {
  const [classe, setClasse] = useState<ClasseDaFicha | null>(null)

  useEffect(() => {
    if (character.class_id) {
      supabase
        .from('classes')
        .select('pv_initial, pv_initial_attr, pv_per_nex, pv_per_nex_attr, pe_initial, pe_initial_attr, pe_per_nex, pe_per_nex_attr, sanity_initial, sanity_per_nex, pd_initial, pd_initial_attr, pd_per_nex, pd_per_nex_attr, pd_patente_initial, pd_patente_per_patente')
        .eq('id', character.class_id)
        .single()
        .then(({ data }) => setClasse(data))
    } else if (character.custom_class) {
      const cc = character.custom_class
      setClasse({
        pv_initial: cc.pvInitial, pv_initial_attr: 'vigor', pv_per_nex: cc.pvPerNex, pv_per_nex_attr: 'vigor',
        pe_initial: cc.peInitial, pe_initial_attr: 'presenca', pe_per_nex: cc.pePerNex, pe_per_nex_attr: 'presenca',
        sanity_initial: cc.sanityInitial, sanity_per_nex: cc.sanityPerNex,
        pd_initial: cc.pdInitial, pd_initial_attr: 'presenca', pd_per_nex: cc.pdPerNex, pd_per_nex_attr: 'presenca',
        pd_patente_initial: null, pd_patente_per_patente: null,
      })
    } else {
      setClasse(null)
    }
  }, [character.class_id, character.custom_class])

  return classe
}
