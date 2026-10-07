// Biblioteca de Tokens (pedido da Millie, 07/10): tokens prontos dos pacotes dela, servidos junto
// com o site (public/biblioteca). Procura por código (#042), nome, coleção ou palavras como
// "mulher", "homem", "monstro", "sangue". Regras puras, testadas.

export type TokenBiblioteca = {
  id: string // código de 3 dígitos
  nome: string
  colecao: string
  grupo: string | null
  tags: string[] // humano | criatura | item, feminino | masculino, sangue | morte | energia | conhecimento
  variante?: boolean
  w: number
  h: number
}

export const imagemDaBiblioteca = (t: Pick<TokenBiblioteca, 'id'>) => `/biblioteca/img/${t.id}.webp`
export const miniaturaDaBiblioteca = (t: Pick<TokenBiblioteca, 'id'>) => `/biblioteca/mini/${t.id}.webp`

// Arrastar da Biblioteca direto pra mesa.
export const TIPO_ARRASTO_BIBLIOTECA = 'application/x-arkanis-biblioteca'

let cache: Promise<TokenBiblioteca[]> | null = null
export function carregarBiblioteca(): Promise<TokenBiblioteca[]> {
  cache ??= fetch('/biblioteca/indice.json')
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => {
      cache = null
      return []
    })
  return cache
}

const normal = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Palavras do dia a dia que viram as etiquetas.
const SINONIMOS: Record<string, string> = {
  mulher: 'feminino', mulheres: 'feminino', menina: 'feminino', moca: 'feminino', garota: 'feminino', feminina: 'feminino', fem: 'feminino',
  homem: 'masculino', homens: 'masculino', menino: 'masculino', rapaz: 'masculino', garoto: 'masculino', masculina: 'masculino', masc: 'masculino',
  monstro: 'criatura', monstros: 'criatura', ameaca: 'criatura', ameacas: 'criatura', criaturas: 'criatura', bicho: 'criatura',
  itens: 'item', equipamento: 'item', equipamentos: 'item', objeto: 'item', objetos: 'item',
  pessoa: 'humano', humana: 'humano', humanos: 'humano', npc: 'humano', npcs: 'humano',
}

function textoDe(t: TokenBiblioteca): string {
  return normal([t.nome, t.colecao, t.grupo ?? '', ...t.tags].join(' '))
}

// Cada palavra tem que bater (no nome, coleção, grupo ou etiqueta). Número sozinho (ou #042)
// procura o código.
export function filtrarBiblioteca(lista: TokenBiblioteca[], busca: string, colecao: string | null = null): TokenBiblioteca[] {
  const daColecao = colecao ? lista.filter((t) => t.colecao === colecao) : lista
  const termos = normal(busca).split(/\s+/).filter(Boolean)
  if (!termos.length) return daColecao
  return daColecao.filter((t) => {
    const texto = textoDe(t)
    const palavras = texto.split(/[^a-z0-9-]+/)
    return termos.every((termo) => {
      const codigo = /^#?(\d{1,3})$/.exec(termo)
      if (codigo) return Number(t.id) === Number(codigo[1])
      const tag = SINONIMOS[termo]
      if (tag && t.tags.includes(tag)) return true
      return palavras.some((p) => p.startsWith(termo))
    })
  })
}

export function colecoesDa(lista: TokenBiblioteca[]): string[] {
  return [...new Set(lista.map((t) => t.colecao))]
}
