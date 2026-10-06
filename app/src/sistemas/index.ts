import { ordemParanormal } from './ordemParanormal'
import type { Sistema } from './tipos'

export type { Sistema } from './tipos'

const SISTEMAS: Record<string, Sistema> = {
  [ordemParanormal.id]: ordemParanormal,
}

// O sistema da campanha (campaigns.system). Desconhecido cai no Ordem Paranormal.
export function sistemaDe(id: string | null | undefined): Sistema {
  return (id && SISTEMAS[id]) || ordemParanormal
}
