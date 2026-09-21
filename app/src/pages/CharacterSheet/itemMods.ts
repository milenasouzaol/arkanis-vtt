// Bonus numericos que uma modificacao ou maldicao aplica num item.
//
// O catalogo nao guarda esses bonus em coluna: eles estao escritos no texto do efeito
// ("+2 em margem de ameaca", "+1 no multiplicador de critico"). Entao a gente le do texto.
// Efeitos que nao sao numericos (Calibre Grosso, Compensador e afins) continuam valendo
// so como referencia escrita - nao da pra somar o que nao e numero.
//
// Este arquivo e a unica fonte desse calculo: a ficha e o envio pro combate usam ele, pra
// o numero que aparece no card ser o mesmo que vai rolar na mesa.

export type AppliedModifier = { kind: 'modificacao' | 'maldicao'; name: string; effect: string; elemento: string | null }

export type ModBonuses = {
  attackTestBonus: number
  threatMarginDelta: number
  damageBonus: number
  multiplierDelta: number
  /** Dados extras de dano, do mesmo tipo (ex.: Calibre Grosso). */
  extraDamageDice: number
}

export function parseNumericMod(effect: string): ModBonuses {
  const result: ModBonuses = { attackTestBonus: 0, threatMarginDelta: 0, damageBonus: 0, multiplierDelta: 0, extraDamageDice: 0 }
  // Margem de ameaca conta ao contrario: +2 de margem abaixa o numero de 19 pra 17,
  // porque o critico acontece a partir dele.
  const margem = effect.match(/([+-]?\d+)\s+em margem de ameaça/i)
  if (margem) result.threatMarginDelta -= Number(margem[1])
  const ataque = effect.match(/([+-]?\d+)\s+em testes de ataque/i)
  if (ataque) result.attackTestBonus += Number(ataque[1])
  // "+1 dado de dano" e outro dado da arma, nao um bonus fixo - tem que vir antes do
  // bonus fixo, senao o "+1" dele seria lido como +1 de dano.
  const dadoExtra = effect.match(/([+-]?\d+)\s+dados?\s+de\s+dano/i)
  if (dadoExtra) result.extraDamageDice += Number(dadoExtra[1])
  else {
    // O catalogo escreve "em rolagens de dano", mas modificacao escrita a mao sai como
    // "de dano", "no dano" ou "em dano" - todas valem a mesma coisa.
    const dano = effect.match(/([+-]?\d+)\s+(?:em rolagens de|em|no|de)\s+dano/i)
    if (dano) result.damageBonus += Number(dano[1])
  }
  const mult = effect.match(/([+-]?\d+)\s+no multiplicador de crítico/i)
  if (mult) result.multiplierDelta += Number(mult[1])
  return result
}

export function somaBonuses(applied: AppliedModifier[]): ModBonuses {
  const total: ModBonuses = { attackTestBonus: 0, threatMarginDelta: 0, damageBonus: 0, multiplierDelta: 0, extraDamageDice: 0 }
  for (const m of applied) {
    const b = parseNumericMod(m.effect ?? '')
    total.attackTestBonus += b.attackTestBonus
    total.threatMarginDelta += b.threatMarginDelta
    total.damageBonus += b.damageBonus
    total.multiplierDelta += b.multiplierDelta
    total.extraDamageDice += b.extraDamageDice
  }
  return total
}

// "19/x3" -> { threatMargin: 19, multiplier: 3 }. Aceita so "19" ou so "x3".
export function parseCritico(critico: unknown): { threatMargin: number; multiplier: number } {
  let threatMargin = 20
  let multiplier = 2
  for (const parte of String(critico ?? '').split('/')) {
    const limpo = parte.trim()
    if (/^x\d+$/i.test(limpo)) multiplier = Number(limpo.slice(1))
    else if (/^\d+$/.test(limpo)) threatMargin = Number(limpo)
  }
  return { threatMargin, multiplier }
}

// Soma um bonus fixo numa formula de dano, juntando com o que ja existir:
// "2d8" + 2 -> "2d8+2";  "2d8+1" + 2 -> "2d8+3";  "2d8+2" + (-2) -> "2d8".
export function somaBonusNoDano(formula: string, bonus: number): string {
  if (!formula) return formula
  if (!bonus) return formula
  const m = formula.match(/^(.*?)\s*([+-]\s*\d+)?$/)
  const base = (m?.[1] ?? formula).trim()
  const atual = m?.[2] ? Number(m[2].replace(/\s+/g, '')) : 0
  const total = atual + bonus
  if (total === 0) return base
  return `${base}${total > 0 ? '+' : '-'}${Math.abs(total)}`
}

// Acrescenta dados do mesmo tipo na formula: "1d10" + 1 dado -> "2d10".
// So mexe em formula no formato NdX; o que nao for assim volta como veio.
export function somaDadosNoDano(formula: string, dados: number): string {
  if (!formula || !dados) return formula
  const m = formula.match(/^(\d*)d(\d+)(.*)$/i)
  if (!m) return formula
  const quantidade = Math.max(1, (Number(m[1] || '1')) + dados)
  return `${quantidade}d${m[2]}${m[3]}`
}

// Stats do item com as modificacoes ja aplicadas, do jeito que tem que aparecer na ficha.
export function statsComModificadores(
  stats: Record<string, unknown> | undefined,
  applied: AppliedModifier[] | undefined,
): Record<string, unknown> {
  const base = stats ?? {}
  if (!applied?.length) return base

  const b = somaBonuses(applied)
  if (!b.threatMarginDelta && !b.multiplierDelta && !b.damageBonus && !b.extraDamageDice) return base

  const resultado = { ...base }

  if (b.threatMarginDelta || b.multiplierDelta) {
    const { threatMargin, multiplier } = parseCritico(base.critico)
    // A margem nao pode passar de 20: nao existe critico "a partir de 21".
    const margemFinal = Math.min(20, threatMargin + b.threatMarginDelta)
    resultado.critico = `${margemFinal}/x${Math.max(1, multiplier + b.multiplierDelta)}`
  }

  if ((b.damageBonus || b.extraDamageDice) && base.dano) {
    resultado.dano = somaBonusNoDano(somaDadosNoDano(String(base.dano), b.extraDamageDice), b.damageBonus)
  }

  return resultado
}

export type NumerosDoAtaque = {
  d20Bonus: number
  threatMargin: number
  multiplier: number
  damage: { formula: string; tipo: string }[]
  damageBonusFromMods: number
}

// Numeros de ataque de uma arma do inventario: os do item mais o que as modificacoes da
// arma e da municao acrescentam.
//
// O ataque criado no Combate guarda uma copia desses numeros, mas quem manda e o item:
// tirar uma maldicao da arma tem que mudar o ataque tambem. Entao o Combate recalcula por
// aqui na hora de mostrar e de rolar, em vez de confiar na copia que ficou gravada.
export function numerosDoAtaque(
  stats: Record<string, unknown> | undefined,
  mods: AppliedModifier[],
): NumerosDoAtaque {
  const s = stats ?? {}
  const { threatMargin, multiplier } = parseCritico(s.critico)

  const damage: { formula: string; tipo: string }[] = [
    { formula: String(s.dano ?? ''), tipo: String(s.tipo_dano ?? '') },
  ]

  let finalMultiplier = multiplier
  let finalThreatMargin = threatMargin
  let d20Bonus = 0
  let damageBonusFromMods = 0

  for (const mod of mods) {
    // Casos com nome proprio so existem em modificacao; o bonus escrito no texto vale
    // pros dois, senao a ficha e o combate mostrariam numeros diferentes.
    if (mod.kind === 'modificacao') {
      if (mod.name === 'Dum Dum') finalMultiplier += 1
      if (mod.name === 'Explosiva') damage.push({ formula: '2d6', tipo: 'explosão adicional' })
    }
    const parsed = parseNumericMod(mod.effect ?? '')
    finalThreatMargin += parsed.threatMarginDelta
    finalMultiplier += parsed.multiplierDelta
    d20Bonus += parsed.attackTestBonus
    damageBonusFromMods += parsed.damageBonus
    // Dado extra entra na primeira linha de dano, que e a da propria arma.
    if (parsed.extraDamageDice) damage[0] = { ...damage[0], formula: somaDadosNoDano(damage[0].formula, parsed.extraDamageDice) }
  }

  return {
    d20Bonus,
    // A margem nao passa de 20 e o multiplicador nao desce de 1.
    threatMargin: Math.min(20, finalThreatMargin),
    multiplier: Math.max(1, finalMultiplier),
    damage,
    damageBonusFromMods,
  }
}
