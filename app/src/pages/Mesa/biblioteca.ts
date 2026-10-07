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
  itens: 'item', equipamento: 'item', equipamentos: 'item', objetos: 'objeto',
  pessoa: 'humano', humana: 'humano', humanos: 'humano', npc: 'humano', npcs: 'humano',
}

// Famílias de coisas (pedido da Millie): procurar uma acha as parentes. "espada" acha katanas,
// sabres e montantes; "arma de fogo" acha pistolas, revólveres, fuzis…
const FAMILIAS: string[][] = [
  ['espada', 'espadas', 'katana', 'katanas', 'sabre', 'montante', 'florete', 'gladio', 'lamina', 'laminas'],
  ['faca', 'facas', 'punhal', 'adaga', 'machete', 'canivete', 'foice'],
  ['machado', 'machados', 'machadinha', 'acha'],
  ['martelo', 'marreta', 'porrete', 'bastao', 'taco', 'cajado', 'bengala'],
  ['pistola', 'pistolas', 'revolver', 'revolveres', 'fuzil', 'fuzis', 'espingarda', 'rifle', 'metralhadora', 'submetralhadora', 'fogo'],
  ['granada', 'granadas', 'explosivo', 'explosivos', 'dinamite', 'molotov', 'bomba'],
  ['arco', 'besta', 'flecha', 'flechas'],
  ['lanca', 'lancas', 'gadanho', 'foice'],
  ['escudo', 'escudos'],
  ['lanterna', 'lanternas', 'lampiao', 'lampioes'],
  ['celular', 'celulares', 'telefone'],
  ['mochila', 'mochilas', 'bolsa', 'bolsas'],
  ['livro', 'livros', 'caderno', 'diario', 'manual'],
  ['carro', 'carros', 'veiculo', 'onibus'],
  ['documento', 'documentos', 'papel', 'papeis', 'carta'],
  ['remedio', 'remedios', 'pilulas', 'medicamento', 'cura'],
]

// O termo e as palavras da família dele (e a etiqueta, se for uma palavra do dia a dia).
export function parentesDe(termo: string): string[] {
  const familia = FAMILIAS.find((f) => f.includes(termo)) ?? [termo]
  const tag = SINONIMOS[termo]
  return [...new Set([termo, ...familia, ...(tag ? [tag] : [])])]
}

function textoDe(t: TokenBiblioteca): string {
  return normal([t.nome, t.colecao, t.grupo ?? '', ...t.tags].join(' '))
}

// Cada palavra tem que bater (no nome, coleção, grupo ou etiqueta; ou uma parente dela). Número
// sozinho (ou #042) procura o código. Com `tags`, só o que tem alguma delas (itens da ficha).
export function filtrarBiblioteca(lista: TokenBiblioteca[], busca: string, colecao: string | null = null, tags: string[] | null = null): TokenBiblioteca[] {
  const base = lista.filter((t) => (!colecao || t.colecao === colecao) && (!tags || t.tags.some((x) => tags.includes(x))))
  const termos = normal(busca).split(/\s+/).filter(Boolean)
  if (!termos.length) return base
  return base.filter((t) => {
    const palavras = textoDe(t).split(/[^a-z0-9-]+/)
    return termos.every((termo) => {
      const codigo = /^#?(\d{1,3})$/.exec(termo)
      if (codigo) return Number(t.id) === Number(codigo[1])
      return parentesDe(termo).some((p) => palavras.some((w) => w.startsWith(p)))
    })
  })
}

// Primeira palavra que diz o que o item é ("Pistola pesada" → "pistola"), pra já abrir procurando.
export function buscaInicialDoItem(nome: string): string {
  return normal(nome).split(/[^a-z0-9-]+/).find((p) => p.length > 2 && !['de', 'da', 'do', 'com'].includes(p)) ?? ''
}

export function colecoesDa(lista: TokenBiblioteca[]): string[] {
  return [...new Set(lista.map((t) => t.colecao))]
}
