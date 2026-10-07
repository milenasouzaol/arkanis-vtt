/**
 * Condições que, ao serem sofridas de novo, viram uma condição mais grave
 * (Livro Base, Apêndice de Condições).
 */
export const CONDITION_ESCALATION: Record<string, string> = {
  'Abalado': 'Apavorado',
  'Fraco': 'Debilitado',
  'Debilitado': 'Inconsciente',
  'Fatigado': 'Exausto',
  'Exausto': 'Inconsciente',
  'Frustrado': 'Esmorecido',
}

export type AttributeKey = 'forca' | 'agilidade' | 'intelecto' | 'vigor' | 'presenca'

export type Attributes = Record<AttributeKey, number>

export function attrValue(attributes: Attributes, attr: string | null): number {
  if (!attr) return 0
  return (attributes as Record<string, number>)[attr] ?? 0
}

function d20() {
  return 1 + Math.floor(Math.random() * 20)
}

/**
 * Regra central de teste: rola d20 igual ao valor do atributo e fica com o maior;
 * se o atributo for 0, rola 2d20 e fica com o menor (penalidade).
 */
export function rollAttributeTest(attributeScore: number) {
  const count = attributeScore > 0 ? attributeScore : 2
  const rolls = Array.from({ length: count }, d20)
  const kept = attributeScore > 0 ? Math.max(...rolls) : Math.min(...rolls)
  return { rolls, kept }
}

export type Training = 'nenhum' | 'treinado' | 'veterano' | 'expert'

export function trainingBonus(training: Training): number {
  if (training === 'treinado') return 5
  if (training === 'veterano') return 10
  if (training === 'expert') return 15
  return 0
}

/** Converte NEX (0-99, passos de 5, com 99 como último passo) no índice de passo 0-20. */
export function nexSteps(nexPercent: number): number {
  if (nexPercent <= 0) return 0
  if (nexPercent >= 99) return 20
  return Math.round(nexPercent / 5)
}

type ClassLike = {
  pv_initial: number | null
  pv_initial_attr: string | null
  pv_per_nex: number | null
  pv_per_nex_attr: string | null
  pe_initial: number | null
  pe_initial_attr: string | null
  pe_per_nex: number | null
  pe_per_nex_attr: string | null
  sanity_initial: number | null
  sanity_per_nex: number | null
  pd_initial: number | null
  pd_initial_attr: string | null
  pd_per_nex: number | null
  pd_per_nex_attr: string | null
}

/**
 * Rola uma fórmula de dado simples ("1d8", "2d6+3", "4d6-1"). Retorna null se a
 * fórmula não seguir esse formato (ex.: texto livre, "1d6/1d8" com duas opções).
 */
export function rollDiceFormula(formula: string, diceMultiplier = 1): { rolls: number[]; modifier: number; total: number } | null {
  const match = formula.trim().match(/^(\d+)d(\d+)\s*([+-]\s*\d+)?$/i)
  if (!match) return null
  const count = parseInt(match[1], 10) * diceMultiplier
  const sides = parseInt(match[2], 10)
  const modifier = match[3] ? parseInt(match[3].replace(/\s/g, ''), 10) : 0
  const rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides))
  const total = rolls.reduce((a, b) => a + b, 0) + modifier
  return { rolls, modifier, total }
}

/**
 * Quantos aumentos "a cada novo NEX" o personagem ja recebeu. No NEX 5% ele tem so os
 * valores iniciais da classe; cada passo depois disso soma um aumento (99% = 19 aumentos).
 */
export function nexAumentos(nexPercent: number): number {
  return Math.max(0, nexSteps(nexPercent) - 1)
}

export function computeDerivedStats(cls: ClassLike, attributes: Attributes, nexPercent: number) {
  const steps = nexAumentos(nexPercent)
  return {
    maxPv: (cls.pv_initial ?? 0) + attrValue(attributes, cls.pv_initial_attr) + steps * ((cls.pv_per_nex ?? 0) + attrValue(attributes, cls.pv_per_nex_attr)),
    maxPe: (cls.pe_initial ?? 0) + attrValue(attributes, cls.pe_initial_attr) + steps * ((cls.pe_per_nex ?? 0) + attrValue(attributes, cls.pe_per_nex_attr)),
    maxSanity: (cls.sanity_initial ?? 0) + steps * (cls.sanity_per_nex ?? 0),
    // maxPd aqui é a fórmula de "Jogando sem Sanidade" (fonte confirmada, ver 5.8) — PD por NEX.
    maxPd: (cls.pd_initial ?? 0) + attrValue(attributes, cls.pd_initial_attr) + steps * ((cls.pd_per_nex ?? 0) + attrValue(attributes, cls.pd_per_nex_attr)),
  }
}

/**
 * Recuperacao que para no maximo da ficha. Se o valor atual ja estiver acima (ajuste a
 * mao ou bonus), a recuperacao nao tira nada dele.
 */
export function recuperarAteMaximo(atual: number, recuperacao: number, maximo: number | null): number {
  if (maximo == null) return atual + recuperacao
  return Math.max(atual, Math.min(maximo, atual + recuperacao))
}

export type Patente = 'sem_patente' | 'recruta' | 'operador' | 'agente_especial' | 'oficial_operacoes' | 'agente_elite'

const PATENTE_ORDER: Patente[] = ['sem_patente', 'recruta', 'operador', 'agente_especial', 'oficial_operacoes', 'agente_elite']

/** Índice da patente (Sem Patente=0 .. Agente de Elite=5), pra fórmulas de "Evolução por Patente". */
export function patenteIndex(patente: string): number {
  const i = PATENTE_ORDER.indexOf(patente as Patente)
  return i < 0 ? 0 : i
}

/**
 * PD por "Evolução por Patente" (5.8) — fórmula separada da de "Jogando sem Sanidade",
 * por patente em vez de por NEX. Sem Patente e Recruta contam como o mesmo patamar inicial.
 */
export function computePatentePd(pdPatenteInitial: number | null, pdPatentePerPatente: number | null, presenca: number, patente: string): number | null {
  if (pdPatenteInitial == null || pdPatentePerPatente == null) return null
  const steps = Math.max(0, patenteIndex(patente) - 1) // 0 na Recruta, 1 no Operador, ...
  return pdPatenteInitial + presenca + steps * (pdPatentePerPatente + presenca)
}
