import { ELEMENTOS, type Elemento } from './elementosDosDados'

// Dado 3D de cada pessoa (Configurações, KAN-54, pedido da Millie, 06/10): cor, número, contorno,
// material e textura, como no Dice So Nice. Fica no perfil, então todo mundo vê os dados de quem
// rolou do jeito que essa pessoa escolheu. Regras puras, testadas.

export type MaterialDado = 'plastico' | 'metal' | 'metal_polido' | 'madeira' | 'vidro'

export type EstiloDados = {
  modo: 'tipo' | 'unica' // por tipo: cada dado na cor do tipo (padrão); única: todos na cor escolhida
  cor: string
  numero: string
  contorno: string
  material: MaterialDado
  textura: string // 'none' ou uma das TEXTURAS_DADO
  // Animação: pela textura (fogo, estrelas…), nenhuma, ou um elemento de Ordem.
  efeito: 'auto' | 'nenhum' | Elemento
}

export const ESTILO_PADRAO: EstiloDados = { modo: 'tipo', cor: '#7c4fe0', numero: '#ffffff', contorno: '#000000', material: 'plastico', textura: 'none', efeito: 'auto' }

// Nome do material na biblioteca dos dados.
export const MATERIAIS_DADO: { id: MaterialDado; rotulo: string; biblioteca: string }[] = [
  { id: 'plastico', rotulo: 'Plástico', biblioteca: 'plastic' },
  { id: 'metal', rotulo: 'Metal', biblioteca: 'metal' },
  { id: 'madeira', rotulo: 'Madeira', biblioteca: 'wood' },
  { id: 'vidro', rotulo: 'Vidro', biblioteca: 'glass' },
]

// Só as texturas que temos o arquivo (public/dados3d/textures).
export const TEXTURAS_DADO: { id: string; rotulo: string }[] = [
  { id: 'none', rotulo: 'Nenhuma' },
  { id: 'marble', rotulo: 'Mármore' },
  { id: 'cloudy', rotulo: 'Nuvens' },
  { id: 'fire', rotulo: 'Fogo' },
  { id: 'ice', rotulo: 'Gelo' },
  { id: 'water', rotulo: 'Água' },
  { id: 'stars', rotulo: 'Estrelas' },
  { id: 'astral', rotulo: 'Astral' },
  { id: 'glitter', rotulo: 'Glitter' },
  { id: 'speckles', rotulo: 'Pintinhas' },
  { id: 'stainedglass', rotulo: 'Vitral' },
  { id: 'paper', rotulo: 'Papel' },
  { id: 'wood', rotulo: 'Madeira' },
  { id: 'metal', rotulo: 'Metal' },
  { id: 'skulls', rotulo: 'Caveiras' },
  { id: 'dragon', rotulo: 'Dragão' },
  { id: 'lizard', rotulo: 'Lagarto' },
  { id: 'leopard', rotulo: 'Leopardo' },
  { id: 'tiger', rotulo: 'Tigre' },
  { id: 'cheetah', rotulo: 'Guepardo' },
]

const HEX = /^#[0-9a-f]{6}$/i

export function estiloCompleto(e: Partial<EstiloDados> | null | undefined): EstiloDados {
  const x = { ...ESTILO_PADRAO, ...(e ?? {}) }
  // Dado de elemento é especial: as cores, o material e a textura são os do elemento.
  const el = ELEMENTOS.find((y) => y.id === x.efeito)
  if (el) return { ...ESTILO_PADRAO, modo: 'unica', textura: 'none', efeito: el.id, ...el.cores }
  return {
    modo: x.modo === 'unica' ? 'unica' : 'tipo',
    cor: HEX.test(x.cor) ? x.cor : ESTILO_PADRAO.cor,
    numero: HEX.test(x.numero) ? x.numero : ESTILO_PADRAO.numero,
    contorno: HEX.test(x.contorno) ? x.contorno : ESTILO_PADRAO.contorno,
    // Metal Polido saiu (ficava preto sem reflexo de ambiente): vira Metal.
    material: x.material === 'metal_polido' ? 'metal' : MATERIAIS_DADO.some((m) => m.id === x.material) ? x.material : 'plastico',
    textura: TEXTURAS_DADO.some((t) => t.id === x.textura) ? x.textura : 'none',
    efeito: x.efeito === 'nenhum' || ELEMENTOS.some((e) => e.id === x.efeito) ? x.efeito : 'auto',
  }
}

// Conjunto de cores de um tipo de dado (o que a biblioteca pede), com um nome único por estilo
// (a biblioteca guarda pelo nome).
export function conjuntoDoDado(estilo: EstiloDados, lados: number, corDoTipo: Record<number, string>): Record<string, string> {
  const fundo = estilo.modo === 'unica' ? estilo.cor : corDoTipo[lados] ?? '#5a5a66'
  const material = MATERIAIS_DADO.find((m) => m.id === estilo.material)!.biblioteca
  return {
    name: `arkanis-${lados}-${fundo}-${estilo.numero}-${estilo.contorno}-${material}-${estilo.textura}-${estilo.efeito}`,
    foreground: estilo.numero,
    background: fundo,
    outline: estilo.contorno,
    edge: fundo,
    texture: estilo.textura,
    material,
  }
}

// ---- Preferências de quem está vendo (no navegador): mostrar os dados 3D, tamanho e tempo ----

export type PreferenciasDados = { mostrar: boolean; tamanho: number; tempo: number }

export const PREFERENCIAS_PADRAO: PreferenciasDados = { mostrar: true, tamanho: 1, tempo: 2.6 }

const CHAVE = 'arkanis-preferencias-dados'
export const EVENTO_PREFERENCIAS = 'arkanis-preferencias-dados'

export function lerPreferenciasDados(): PreferenciasDados {
  try {
    return { ...PREFERENCIAS_PADRAO, ...JSON.parse(localStorage.getItem(CHAVE) ?? '{}') }
  } catch {
    return PREFERENCIAS_PADRAO
  }
}

export function salvarPreferenciasDados(p: PreferenciasDados) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(p))
  } catch {
    // sem armazenamento: vale só até recarregar
  }
  window.dispatchEvent(new CustomEvent(EVENTO_PREFERENCIAS, { detail: p }))
}
