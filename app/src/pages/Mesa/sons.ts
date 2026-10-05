// Som Ambiente (KAN-52, spec 12.13): área retangular no mapa com um áudio que toca pra quem tem
// token dentro. Regras puras, testadas.

export type SomAmbiente = {
  id: string
  scene_id: string
  campaign_id: string
  name: string | null
  url: string
  x: number
  y: number
  width: number
  height: number
  volume: number // volume máximo (0 a 1)
  suavizar: boolean // vai baixando do centro pra borda
  escondido: boolean // não toca pros jogadores
  ligado: boolean // clique direito liga/desliga
  created_at: string
}

type Ponto = { x: number; y: number }

// Volume que alguém nesse ponto ouve: 0 fora da área; dentro, o máximo (ou, com suavização,
// o máximo no centro e baixando em curva até sumir na borda).
export function volumeNoPonto(s: Pick<SomAmbiente, 'x' | 'y' | 'width' | 'height' | 'volume' | 'suavizar'>, p: Ponto): number {
  if (p.x < s.x || p.x > s.x + s.width || p.y < s.y || p.y > s.y + s.height) return 0
  if (!s.suavizar) return s.volume
  const dx = (p.x - (s.x + s.width / 2)) / (s.width / 2)
  const dy = (p.y - (s.y + s.height / 2)) / (s.height / 2)
  const longe = Math.min(1, Math.max(Math.abs(dx), Math.abs(dy)))
  // Curva, não reta (pedido da Millie): o ouvido acha 20% de volume ainda alto, então em linha
  // reta a beirada soava forte e o som cortava de repente ao sair. Elevando ao quadrado, vai
  // baixando cada vez mais perto da borda e some suave quando o token sai da área.
  return Math.round(s.volume * (1 - longe) ** 2 * 1000) / 1000
}

// Com vários tokens, vale o que está mais perto do centro (o volume mais alto).
export function volumeParaOuvintes(s: SomAmbiente, ouvintes: Ponto[], souMestre: boolean): number {
  if (!s.ligado || (s.escondido && !souMestre)) return 0
  return ouvintes.reduce((m, p) => Math.max(m, volumeNoPonto(s, p)), 0)
}

export const PADRAO_SOM = { volume: 1, suavizar: true, escondido: false }
