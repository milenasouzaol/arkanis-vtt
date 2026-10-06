// Interagir com itens na mesa (KAN-53, parte 2): regras puras, testadas. Quem roda é a
// JanelaInteracao; o banco confere cada passo (0122_interagir_com_itens.sql).
import type { Caixa } from './tokens'
import { TEM_TESTE, type Atividade, type Teste } from './itens'

// Distância em metros entre o token de quem interage e o item: conta os quadrados entre as
// bordas (encostado = 1 quadrado, como no tabuleiro), vezes a distância de cada quadrado.
export function distanciaEmMetros(a: Caixa, b: Caixa, celula: { w: number; h: number }, metrosPorQuadrado: number): number {
  const gx = Math.max(0, Math.abs(a.x + a.width / 2 - (b.x + b.width / 2)) - (a.width + b.width) / 2)
  const gy = Math.max(0, Math.abs(a.y + a.height / 2 - (b.y + b.height / 2)) - (a.height + b.height) / 2)
  const quadrados = Math.max(Math.floor(gx / celula.w + 1e-6), Math.floor(gy / celula.h + 1e-6)) + 1
  return quadrados * metrosPorQuadrado
}

// Alcance em metros (null = Pessoal/Ilimitado: não confere).
export function dentroDoAlcance(distancia: number | null, alcanceMetros: number | null): boolean {
  if (alcanceMetros === null) return true
  if (distancia === null) return false
  return distancia <= alcanceMetros + 1e-6
}

// Atividades que viram botão na janela (as de "Nenhuma" só rodam pelo encadeamento).
export function botoesDaInteracao(atividades: Atividade[]): Atividade[] {
  return atividades.filter((a) => a.ativacao.quando === 'clicar' || a.ativacao.quando === 'teste')
}

export function semUsos(a: Pick<Atividade, 'ativacao'>): boolean {
  const u = a.ativacao.usos
  return u.max !== null && u.max !== undefined && u.gastos >= u.max
}

// O teste que a atividade pede (Checar, ou o teste pra evitar do Ritual). Sem perícia nem
// atributo, não tem teste.
export function testeDe(a: Atividade): Teste | null {
  const t = a.tipo === 'checar' ? a.checar : a.tipo === 'ritual' ? a.ritual?.evitar : null
  return t && (t.pericia || t.atributo) ? t : null
}

// "Teste de Crime", "Teste de Agilidade".
export function rotuloDoTeste(t: Teste, atributos: { id: string; rotulo: string }[]): string {
  return `Teste de ${t.pericia || atributos.find((x) => x.id === t.atributo)?.rotulo || t.atributo}`
}

// Passou no teste? Sem DT, passa.
export function passouNoTeste(total: number, dt: number | null | undefined): boolean {
  return dt === null || dt === undefined || total >= dt
}

// O que roda depois desta atividade (Se passar / Se falhar / Em seguida), sem repetir a mesma
// atividade no mesmo encadeamento (evita laço infinito: A → B → A).
export function proximas(a: Atividade, passou: boolean | null, lista: Atividade[], jaRodaram: Set<string>): Atividade[] {
  const ids = TEM_TESTE.includes(a.tipo) ? (passou === false ? a.seNao : a.seSim) : a.seSim
  return ids.filter((id) => !jaRodaram.has(id)).map((id) => lista.find((x) => x.id === id)).filter((x): x is Atividade => !!x)
}
