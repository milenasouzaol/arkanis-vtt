import { supabase } from './supabase'

// Dono de cada ficha, pra rolagem sempre sair em nome dele — mesmo quando quem rola é o
// mestre abrindo a ficha do jogador pela mesa (o banco exige isso).
const donos = new Map<string, string>()

async function donoDaFicha(characterId: string, reserva: string): Promise<string> {
  const conhecido = donos.get(characterId)
  if (conhecido) return conhecido
  const { data } = await supabase.from('characters').select('user_id').eq('id', characterId).maybeSingle()
  const dono = data?.user_id ?? reserva
  donos.set(characterId, dono)
  return dono
}

export async function recordRoll(params: {
  characterId: string
  userId: string
  campaignId: string | null
  characterName: string
  label: string
  total: number
  detail: string
  dice?: { sides: number; value: number; discarded?: boolean }[]
  bonus?: number
}) {
  await supabase.from('character_rolls').insert({
    character_id: params.characterId,
    user_id: await donoDaFicha(params.characterId, params.userId),
    campaign_id: params.campaignId,
    character_name: params.characterName,
    label: params.label,
    total: params.total,
    detail: params.detail,
    dice: params.dice ?? null,
    bonus: params.bonus ?? 0,
  })
  window.dispatchEvent(new CustomEvent('vtt-roll-recorded'))
}
