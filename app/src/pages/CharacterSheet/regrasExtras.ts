/*
 * Le o texto puro das Regras Extras (como esta no banco) e separa em blocos pra tela:
 * subtitulos ("Combustível:" sozinho na linha), listas ("- ..."), paragrafos e sequencias
 * "a · b · c" (as tabelas de DT), que viram blocos lado a lado.
 */

export type Bloco =
  | { tipo: 'titulo'; texto: string }
  | { tipo: 'paragrafo'; texto: string; sequencia?: string[] }
  | { tipo: 'lista'; itens: string[] }

/** "Deslocamento: ... cena: DT5→15m · DT10→18m · DT15→21m" vira intro + 3 itens. */
function comSequencia(texto: string): Bloco {
  const partes = texto.split(' · ').map((p) => p.trim())
  if (partes.length < 3) return { tipo: 'paragrafo', texto }
  const primeira = partes[0]
  const corte = primeira.lastIndexOf(': ')
  if (corte < 0) return { tipo: 'paragrafo', texto: '', sequencia: partes }
  return {
    tipo: 'paragrafo',
    texto: primeira.slice(0, corte + 1),
    sequencia: [primeira.slice(corte + 2), ...partes.slice(1)].filter(Boolean),
  }
}

export function lerRegra(conteudo: string): Bloco[] {
  const blocos: Bloco[] = []
  let lista: string[] | null = null
  const fecharLista = () => {
    if (lista) blocos.push({ tipo: 'lista', itens: lista })
    lista = null
  }
  for (const bruta of conteudo.split('\n')) {
    const linha = bruta.trim()
    if (!linha) {
      fecharLista()
      continue
    }
    if (linha.startsWith('- ')) {
      ;(lista ??= []).push(linha.slice(2).trim())
      continue
    }
    fecharLista()
    if (linha.endsWith(':') && linha.length <= 60) blocos.push({ tipo: 'titulo', texto: linha.slice(0, -1) })
    else blocos.push(comSequencia(linha))
  }
  fecharLista()
  return blocos
}

/** "Colidir: alvo testa..." separa o termo ("Colidir") do resto, pra o termo ir em negrito. */
export function separarTermo(texto: string): { termo: string | null; resto: string } {
  const m = texto.match(/^([^:.]{2,40}):\s+(.+)$/s)
  // Termo e curto (ate 6 palavras); mais que isso e frase que so tem dois-pontos no meio.
  if (!m || m[1].trim().split(/\s+/).length > 6) return { termo: null, resto: texto }
  return { termo: m[1], resto: m[2] }
}

/** Busca sem diferenca de acento nem maiuscula. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
