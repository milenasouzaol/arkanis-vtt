// Dados 3D caindo na tela (pedido da Millie, 06/10): regras puras, testadas. A animação só mostra
// o resultado que já saiu (o mesmo do chat e da ficha), então todo mundo vê os mesmos números.
import type { Mensagem } from './chat'

export type Dado = { sides: number; value: number }

// Dados que a biblioteca sabe desenhar.
const LADOS = new Set([4, 6, 8, 10, 12, 20, 100])

type Fonte = { chave: string; dados: Dado[] }

// Tudo que já foi rolado numa mensagem, cada pedaço com uma chave (pra saber o que é novo).
function fontes(m: Mensagem): Fonte[] {
  const f: Fonte[] = []
  if (m.rolagem?.dice?.length && !m.rolagem.sem_rolagem) f.push({ chave: 'rolagem', dados: m.rolagem.dice.map((d) => ({ sides: d.sides, value: d.value })) })
  const a = m.acao as Record<string, unknown> | null | undefined
  if (!a) return f
  const estado = (a.estado ?? {}) as Record<string, { rolls?: number[]; dados?: Dado[] } | undefined>
  if (estado.ataque?.rolls) f.push({ chave: 'ataque', dados: estado.ataque.rolls.map((v) => ({ sides: 20, value: v })) })
  if (estado.teste?.rolls) f.push({ chave: 'teste', dados: estado.teste.rolls.map((v) => ({ sides: 20, value: v })) })
  if (estado.dano?.dados) f.push({ chave: 'dano', dados: estado.dano.dados })
  if (estado.cura?.dados) f.push({ chave: 'cura', dados: estado.cura.dados })
  // Interação com item: o teste e a rolagem vêm prontos na própria ação.
  const teste = a.teste as { rolls?: number[] } | undefined
  if (a.tipo === 'interacao' && teste?.rolls) f.push({ chave: 'i-teste', dados: teste.rolls.map((v) => ({ sides: 20, value: v })) })
  const rolagem = a.rolagem as { dados?: Dado[] } | undefined
  if (a.tipo === 'interacao' && rolagem?.dados) f.push({ chave: 'i-rolagem', dados: rolagem.dados })
  return f
}

// Os dados novos desta mensagem, comparando com o que já tinha sido visto dela.
export function dadosNovos(m: Mensagem, jaVistos: Set<string>): { dados: Dado[]; chaves: string[] } {
  const novos = fontes(m).filter((x) => !jaVistos.has(`${m.id}:${x.chave}`))
  return {
    dados: novos.flatMap((x) => x.dados).filter((d) => LADOS.has(d.sides) && d.value >= 1 && d.value <= d.sides),
    chaves: novos.map((x) => `${m.id}:${x.chave}`),
  }
}

// Tudo que a mensagem já tem (pra marcar como visto sem animar, ao abrir a mesa).
export function chavesDe(m: Mensagem): string[] {
  return fontes(m).map((x) => `${m.id}:${x.chave}`)
}

// Agrupa por tipo de dado, na ordem em que aparecem: "2d20@15,7", "3d6@1,4,6".
export function gruposDeDados(dados: Dado[], limite = 20): { sides: number; notacao: string }[] {
  const ordem: number[] = []
  const por: Record<number, number[]> = {}
  for (const d of dados.slice(0, limite)) {
    if (!por[d.sides]) {
      por[d.sides] = []
      ordem.push(d.sides)
    }
    por[d.sides].push(d.value)
  }
  return ordem.map((s) => ({ sides: s, notacao: `${por[s].length}d${s}@${por[s].join(',')}` }))
}

// Tudo numa rolagem só (os dados caem juntos): "2d20+1d6@15,7,4" (resultados na ordem dos grupos).
export function notacaoUnica(dados: Dado[], limite = 20): string | null {
  const grupos = gruposDeDados(dados, limite)
  if (!grupos.length) return null
  const [tipos, valores] = [grupos.map((g) => g.notacao.split('@')[0]), grupos.map((g) => g.notacao.split('@')[1])]
  return `${tipos.join('+')}@${valores.join(',')}`
}
