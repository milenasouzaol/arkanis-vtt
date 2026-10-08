import { defesaDeModificadores, type AppliedModifier } from './itemMods'
import { defesaDeCondicoes } from './condicoes'

// Defesa e testes de resistência num lugar só (bug 08/10, ficha da Renata): a ficha e a mesa
// fazem a mesma conta. Antes ficavam de fora a maldição/modificação de item que não é proteção
// (Coturnos com "+5 Defesa") e os poderes que dão bônus fixo (Reflexos Defensivos).

export const TESTES_DE_RESISTENCIA = ['Fortitude', 'Reflexos', 'Vontade']

type Passivo = { defesa?: number; pericias?: Record<string, number>; soComProtecaoLeve?: boolean }

const RESISTENCIA_2 = { Fortitude: 2, Reflexos: 2, Vontade: 2 }

// Só os poderes cujo bônus vale sempre. Os que dependem de ação, PE ou situação
// ("gasta 2 PE", "contra o próximo ataque", "machucado") ficam na mão, em "Outros".
const PODERES_PASSIVOS: Record<string, Passivo> = {
  'reflexos defensivos': { defesa: 2, pericias: RESISTENCIA_2 }, // +2 em Defesa e testes de resistência
  'precognição': { defesa: 2, pericias: RESISTENCIA_2 },
  'patrulha': { defesa: 2 }, // poder da origem Policial
  'especialista em proteção leve': { defesa: 2, pericias: { Reflexos: 2 }, soComProtecaoLeve: true },
  'vitalidade reforçada': { pericias: { Fortitude: 2 } },
  'adaptação climática': { pericias: { Fortitude: 2 } },
  'vontade inabalável': { pericias: { Vontade: 2 } },
  'luta ou fuga': { pericias: { Vontade: 2 } },
}

export type BonusDosPoderes = { defesa: number; pericias: Record<string, number>; motivos: string[] }

export function bonusDosPoderes(nomes: (string | null | undefined)[], ctx: { protecaoLeve?: boolean } = {}): BonusDosPoderes {
  const r: BonusDosPoderes = { defesa: 0, pericias: {}, motivos: [] }
  // O mesmo poder escolhido duas vezes (registro repetido) não soma de novo.
  for (const nome of new Set(nomes.map((n) => String(n ?? '').trim()))) {
    const p = PODERES_PASSIVOS[nome.toLowerCase()]
    if (!p || (p.soComProtecaoLeve && !ctx.protecaoLeve)) continue
    if (p.defesa) {
      r.defesa += p.defesa
      r.motivos.push(`${nome} +${p.defesa}`)
    }
    for (const [pericia, v] of Object.entries(p.pericias ?? {})) r.pericias[pericia] = (r.pericias[pericia] ?? 0) + v
  }
  return r
}

export type ItemDeDefesa = { tipo: string | null | undefined; nome?: string | null; stats?: Record<string, unknown> | null; mods?: AppliedModifier[] | null }

// Proteção conta a Defesa dela; modificação/maldição que dá Defesa vale em qualquer item equipado.
export function defesaDosItens(itens: ItemDeDefesa[]): number {
  return itens.reduce((s, i) => s + (i.tipo === 'protecao' ? Number(i.stats?.defesa ?? 0) : 0) + defesaDeModificadores(i.mods ?? undefined), 0)
}

export function temProtecaoLeve(itens: ItemDeDefesa[]): boolean {
  return itens.some((i) => i.tipo === 'protecao' && /\bleve\b/i.test(String(i.nome ?? '')))
}

export function defesaTotal(p: { agilidade: number; outros: number; condicoes: string[] | null | undefined; itens: ItemDeDefesa[]; poderes: (string | null | undefined)[] }) {
  const itens = defesaDosItens(p.itens)
  const poderes = bonusDosPoderes(p.poderes, { protecaoLeve: temProtecaoLeve(p.itens) })
  const condicoes = defesaDeCondicoes(p.condicoes ?? [])
  return { total: 10 + p.agilidade + itens + poderes.defesa + p.outros + condicoes.valor, itens, poderes, condicoes }
}
