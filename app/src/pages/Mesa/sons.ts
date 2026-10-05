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
  posicionavel_id?: string | null // colocado a partir dos Posicionáveis
  created_at: string
}

type Ponto = { x: number; y: number }

// Quanto do som chega nesse ponto, de 0 a 100 (pedido da Millie): 100 no centro e diminuindo um
// pouquinho a cada passo até 1 na borda; fora da área, 0. Sem suavização, 100 na área toda.
export function porcentagemNoPonto(s: Pick<SomAmbiente, 'x' | 'y' | 'width' | 'height' | 'suavizar'>, p: Ponto): number {
  if (p.x < s.x || p.x > s.x + s.width || p.y < s.y || p.y > s.y + s.height) return 0
  if (!s.suavizar) return 100
  const dx = (p.x - (s.x + s.width / 2)) / (s.width / 2)
  const dy = (p.y - (s.y + s.height / 2)) / (s.height / 2)
  const longe = Math.min(1, Math.max(Math.abs(dx), Math.abs(dy)))
  return Math.max(1, Math.round(100 * (1 - longe)))
}

// O volume que vai pro áudio. A porcentagem passa por uma curva de audição: o ouvido acha que
// 20% do volume ainda é alto, então em linha reta a borda soava forte. Ao cubo, 10% vira um
// sussurro (0,1%) e o som vai crescendo devagar até o centro — soa como 100, 99, 98… 1.
export function volumeNoPonto(s: Pick<SomAmbiente, 'x' | 'y' | 'width' | 'height' | 'volume' | 'suavizar'>, p: Ponto): number {
  const pct = porcentagemNoPonto(s, p)
  return Math.round(s.volume * (pct / 100) ** 3 * 100000) / 100000
}

// Com vários tokens, vale o que está mais perto do centro (o volume mais alto).
export function volumeParaOuvintes(s: SomAmbiente, ouvintes: Ponto[], souMestre: boolean): number {
  if (!s.ligado || (s.escondido && !souMestre)) return 0
  return ouvintes.reduce((m, p) => Math.max(m, volumeNoPonto(s, p)), 0)
}

export const PADRAO_SOM = { volume: 1, suavizar: true, escondido: false }
