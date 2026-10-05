import { useEffect, useState } from 'react'
import type { Canal } from './playlists'

// Controles de Volume de Usuário (spec 12.12): Música, Ambiente e Efeitos Sonoros. Cada pessoa
// ajusta o próprio, guardado no navegador dela (não muda o som de mais ninguém).
export type VolumesDoUsuario = Record<Canal, number>

const CHAVE = 'arkanis-volumes'
const EVENTO = 'arkanis-volumes'
// Começa cheio: o som que o mestre calibrou chega igual até a pessoa baixar o dela.
export const VOLUMES_PADRAO: VolumesDoUsuario = { musica: 1, ambiente: 1, efeitos: 1 }

export function lerVolumes(): VolumesDoUsuario {
  try {
    return { ...VOLUMES_PADRAO, ...JSON.parse(localStorage.getItem(CHAVE) ?? '{}') }
  } catch {
    return VOLUMES_PADRAO
  }
}

export function salvarVolume(canal: Canal, valor: number) {
  const novos = { ...lerVolumes(), [canal]: Math.min(1, Math.max(0, valor)) }
  try {
    localStorage.setItem(CHAVE, JSON.stringify(novos))
  } catch {
    // sem armazenamento: vale só até recarregar
  }
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: novos }))
}

// Os volumes atuais, atualizando quando a pessoa mexe no controle (em qualquer parte da mesa).
export function useVolumesDoUsuario(): VolumesDoUsuario {
  const [v, setV] = useState(lerVolumes)
  useEffect(() => {
    const mudou = (e: Event) => setV((e as CustomEvent<VolumesDoUsuario>).detail)
    window.addEventListener(EVENTO, mudou)
    return () => window.removeEventListener(EVENTO, mudou)
  }, [])
  return v
}
