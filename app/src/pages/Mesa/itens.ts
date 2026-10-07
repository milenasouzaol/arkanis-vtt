// Itens da mesa (KAN-53, spec 12.10 + prints do Foundry da Millie): regras puras, testadas.
// É o motor de interatividade da mesa (pedido da Millie, 06/10): itens e tokens com atividades
// encadeadas (Se passar / Se falhar). Vale pra qualquer sistema de jogo: o que é do sistema
// (perícias, atributos, alcances, tipos de dano, recursos) vem de src/sistemas.
import type { NivelAcesso } from './atores'

export type CategoriaItem = 'lootavel' | 'conteiner' | 'documento' | 'amaldicoado' | 'armadilha' | 'loja'
export type Raridade = 'comum' | 'incomum' | 'raro' | 'muito_raro' | 'lendario' | 'amaldicoado'
export type TipoItem = 'arma' | 'municao' | 'protecao' | 'geral' | 'paranormal'

export const CATEGORIAS_ITEM: { id: CategoriaItem; rotulo: string }[] = [
  { id: 'lootavel', rotulo: 'Item Lootável' },
  { id: 'conteiner', rotulo: 'Contêiner' },
  { id: 'documento', rotulo: 'Documento/Pista' },
  { id: 'amaldicoado', rotulo: 'Artefato Amaldiçoado' },
  { id: 'armadilha', rotulo: 'Armadilha' },
  { id: 'loja', rotulo: 'Loja' },
]

// Como a loja cobra (pedido da Millie): requisição (patente), dinheiro, ou os dois (quem compra escolhe).
export type ModoLoja = 'requisicao' | 'dinheiro' | 'ambos'
export const MODOS_LOJA: { id: ModoLoja; rotulo: string }[] = [
  { id: 'requisicao', rotulo: 'Requisição' },
  { id: 'dinheiro', rotulo: 'Dinheiro' },
  { id: 'ambos', rotulo: 'Os Dois' },
]

export function formatarDinheiro(valor: number, simbolo: string): string {
  return `${simbolo} ${valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`
}

export const RARIDADES: { id: Raridade; rotulo: string }[] = [
  { id: 'comum', rotulo: 'Comum' },
  { id: 'incomum', rotulo: 'Incomum' },
  { id: 'raro', rotulo: 'Raro' },
  { id: 'muito_raro', rotulo: 'Muito Raro' },
  { id: 'lendario', rotulo: 'Lendário' },
  { id: 'amaldicoado', rotulo: 'Artefato Amaldiçoado' },
]

export const TIPOS_ITEM: { id: TipoItem; rotulo: string }[] = [
  { id: 'arma', rotulo: 'Arma' },
  { id: 'municao', rotulo: 'Munição' },
  { id: 'protecao', rotulo: 'Proteção' },
  { id: 'geral', rotulo: 'Geral' },
  { id: 'paranormal', rotulo: 'Paranormal' },
]

// Usos do item (Detalhes): limite (vazio = ∞) e quem pode usar.
export type QuemUsa = 'todos' | 'pessoa' | 'compartilhado'
export const QUEM_USA: { id: QuemUsa; rotulo: string }[] = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'pessoa', rotulo: 'Pessoa Específica' },
  { id: 'compartilhado', rotulo: 'Uso Único Compartilhado' },
]

export type Teste = { pericia: string; atributo: string; dt: number | null }

export type DetalhesItem = {
  tipo?: TipoItem
  categoriaSistema?: string // categoria de requisição do sistema (OP: 0, I, II, III, IV)
  preco?: number | null // preço em dinheiro, se o mestre quiser vender por dinheiro
  loja?: { modo: ModoLoja } // categoria Loja: como ela cobra
  teste?: Teste
  usos?: { gastos: number; max: number | null; quem: QuemUsa; pessoa?: string | null }
}

// ---- Atividades ----

export type TipoAtividade = 'ataque' | 'ritual' | 'checar' | 'dano' | 'cura' | 'sumonar' | 'transformar' | 'conteiner' | 'documento'

export const TIPOS_ATIVIDADE: { id: TipoAtividade; rotulo: string }[] = [
  { id: 'ataque', rotulo: 'Ataque' },
  { id: 'ritual', rotulo: 'Castar Ritual' }, // no editor, o nome vem do sistema (Ritual, Magia…)
  { id: 'checar', rotulo: 'Checar' },
  { id: 'dano', rotulo: 'Dano' },
  { id: 'cura', rotulo: 'Cura' },
  { id: 'sumonar', rotulo: 'Sumonar' },
  { id: 'transformar', rotulo: 'Transformar' },
  { id: 'conteiner', rotulo: 'Abrir Contêiner' },
  { id: 'documento', rotulo: 'Mostrar Documento' },
]

// Atividades que têm teste: dá pra dizer o que acontece se passar e se falhar.
export const TEM_TESTE: TipoAtividade[] = ['checar', 'ataque', 'ritual']

// Esta atividade tem resultado de teste (Se passar / Se falhar)? Pelo tipo, ou porque ela só
// acontece "Ao Passar no Teste".
export function temTeste(a: Pick<Atividade, 'tipo' | 'ativacao'>): boolean {
  return TEM_TESTE.includes(a.tipo) || a.ativacao.quando === 'teste'
}

// Quando dispara (Ativação → Tempo).
export const QUANDO_DISPARA: { grupo: string | null; itens: { id: string; rotulo: string }[] }[] = [
  { grupo: null, itens: [{ id: 'clicar', rotulo: 'Ao Clicar' }, { id: 'teste', rotulo: 'Ao Passar no Teste' }] },
  { grupo: 'Combate', itens: [{ id: 'inicio_turno', rotulo: 'Início do Turno' }, { id: 'fim_turno', rotulo: 'Fim do Turno' }] },
  { grupo: 'Descanso', itens: [{ id: 'inicio_descanso', rotulo: 'Início do Descanso' }, { id: 'fim_descanso', rotulo: 'Fim do Descanso' }] },
  { grupo: null, itens: [{ id: 'nenhuma', rotulo: 'Nenhuma' }] },
]

export const DURACOES: { grupo: string | null; itens: { id: string; rotulo: string }[] }[] = [
  { grupo: null, itens: [{ id: 'instantanea', rotulo: 'Instantânea' }, { id: 'especial', rotulo: 'Especial' }] },
  { grupo: 'Tempo', itens: [{ id: 'turno', rotulo: 'Turno' }, { id: 'rodada', rotulo: 'Rodada' }, { id: 'cena', rotulo: 'Cena' }, { id: 'minuto', rotulo: 'Minuto' }, { id: 'hora', rotulo: 'Hora' }, { id: 'dia', rotulo: 'Dia' }] },
  { grupo: 'Permanente', itens: [{ id: 'ate_dissipar', rotulo: 'Até ser Dissipado' }, { id: 'permanente', rotulo: 'Permanente' }] },
]

export const ALVOS_ATIVIDADE = [
  { id: 'quem_tocou', rotulo: 'Quem Tocou' },
  { id: 'todos', rotulo: 'Todos' },
  { id: 'ninguem', rotulo: 'Ninguém' },
  { id: 'jogadores', rotulo: 'Todos os Jogadores' },
  { id: 'mira', rotulo: 'Os Marcados pela Mira' },
]

export const FORMAS_AREA = [
  { id: '', rotulo: 'Nenhuma' },
  { id: 'circulo', rotulo: 'Círculo' },
  { id: 'cone', rotulo: 'Cone' },
  { id: 'linha', rotulo: 'Linha' },
  { id: 'quadrado', rotulo: 'Quadrado' },
]

export const CONSUMOS = [
  { id: 'nada', rotulo: 'Nada' },
  { id: 'usos', rotulo: 'Usos do Item' },
  { id: 'quantidade', rotulo: 'Quantidade do Item' },
]

export type Ativacao = {
  quando: string
  // "Ao Passar no Teste": o teste que a pessoa faz antes (passou = a atividade acontece; falhou =
  // roda o Se Falhar).
  teste?: Teste
  condicao: string
  duracao: string
  duracaoValor: number | null
  consumo: { tipo: string; quanto: number }
  usos: { gastos: number; max: number | null }
  alcance: string
  alvos: string
  area: { forma: string; tamanho: number | null } // tamanho em metros (vira quadrados pela grade)
}

export type Atividade = {
  id: string
  tipo: TipoAtividade
  nome: string
  icone: string | null // imagem própria; sem, usa o ícone do tipo
  textoChat: string
  ativacao: Ativacao
  // Encadeamento: atividades deste item que disparam depois (ids). Nas que têm teste, seSim vale
  // se passar e seNao se falhar; nas outras, seSim vale sempre.
  seSim: string[]
  seNao: string[]
  // Efeito, conforme o tipo.
  ataque?: { alcance: 'corpo' | 'distancia'; classe: 'fisica' | 'alcance_longo' | 'desarmado'; bonus: number; dano: string; tipoDano: string }
  ritual?: { ritual: string; alvo: 'pessoa' | 'area' | 'local'; evitar: Teste }
  checar?: Teste
  dano?: { formula: string; tipoDano: string }
  cura?: { formula: string; recurso: 'pv' | 'san' | 'pe' }
  sumonar?: { ameaca: string; quantidade: number }
  transformar?: { imagem: string | null; duracao: string }
}

export const ATIVACAO_PADRAO: Ativacao = {
  quando: 'clicar',
  condicao: '',
  duracao: 'instantanea',
  duracaoValor: null,
  consumo: { tipo: 'nada', quanto: 1 },
  usos: { gastos: 0, max: null },
  alcance: 'toque',
  alvos: 'quem_tocou',
  area: { forma: '', tamanho: null },
}

const TESTE_VAZIO: Teste = { pericia: '', atributo: '', dt: null }

export function novaAtividade(tipo: TipoAtividade, id: string = crypto.randomUUID()): Atividade {
  const base = { id, tipo, nome: TIPOS_ATIVIDADE.find((t) => t.id === tipo)!.rotulo, icone: null, textoChat: '', ativacao: { ...ATIVACAO_PADRAO }, seSim: [] as string[], seNao: [] as string[] }
  switch (tipo) {
    case 'ataque': return { ...base, ataque: { alcance: 'corpo', classe: 'fisica', bonus: 0, dano: '', tipoDano: 'corte' } }
    case 'ritual': return { ...base, ritual: { ritual: '', alvo: 'pessoa', evitar: { ...TESTE_VAZIO } } }
    case 'checar': return { ...base, checar: { ...TESTE_VAZIO } }
    case 'dano': return { ...base, dano: { formula: '', tipoDano: 'impacto' } }
    case 'cura': return { ...base, cura: { formula: '', recurso: 'pv' } }
    case 'sumonar': return { ...base, sumonar: { ameaca: '', quantidade: 1 } }
    case 'transformar': return { ...base, transformar: { imagem: null, duracao: '' } }
    case 'conteiner':
    case 'documento': return base
  }
}

// Atividade gravada por uma versão antiga, sem algum campo: completa com o padrão.
export function atividadeCompleta(a: Partial<Atividade> & Pick<Atividade, 'id' | 'tipo'>): Atividade {
  const padrao = novaAtividade(a.tipo, a.id)
  return { ...padrao, ...a, ativacao: { ...ATIVACAO_PADRAO, ...a.ativacao } } as Atividade
}

export function duplicarAtividade(a: Atividade, id: string = crypto.randomUUID()): Atividade {
  return { ...structuredClone(a), id, nome: `${a.nome} (Cópia)` }
}

// Tirar uma atividade: as outras deixam de apontar pra ela.
export function semAtividade(lista: Atividade[], id: string): Atividade[] {
  return lista.filter((a) => a.id !== id).map((a) => ({ ...a, seSim: a.seSim.filter((x) => x !== id), seNao: a.seNao.filter((x) => x !== id) }))
}

// O que aparece embaixo do nome da atividade na lista.
export function rotuloDaAtivacao(a: Pick<Atividade, 'ativacao'>): string {
  for (const g of QUANDO_DISPARA) {
    const q = g.itens.find((i) => i.id === a.ativacao.quando)
    if (q) return q.rotulo
  }
  return ''
}

// "2/5", "—" sem limite.
export function textoDeUsos(u: { gastos: number; max: number | null } | undefined): string {
  if (!u || u.max === null || u.max === undefined) return '—'
  return `${Math.max(0, u.max - u.gastos)}/${u.max}`
}

// ---- Item ----

export type ItemMesa = {
  id: string
  campaign_id: string
  folder_id: string | null
  name: string
  categoria: CategoriaItem
  image_url: string | null
  raridade: Raridade | null
  quantidade: number
  carga: number
  descricao: string | null
  detalhes: DetalhesItem
  atividades: Atividade[]
  // coleta (Criar Item do objeto): porPessoa = cada um pega 1 até acabar a quantidade; infinito = todos pegam 1.
  efeitos: { inventario?: boolean; documento?: string; imagem?: string | null; coleta?: ColetaItem }
  // O que tem dentro (Contêiner): item da campanha (item_id) ou equipamento do compêndio (compendio_id).
  conteudo: EntradaConteudo[]
  compendio_id: string | null // criado a partir deste equipamento do compêndio
  acesso_padrao: NivelAcesso
  acesso_jogadores: Record<string, NivelAcesso>
  mostrar_mestres: boolean
  sort: number
  created_at: string
}

// Na Loja (estoque): ilimitado = nunca acaba; preco = o desta loja (sem: o do item).
export type ColetaItem = 'porPessoa' | 'infinito'

// Objeto do mapa virando item (pedido da Millie, 07/10): nome, tipo, quantos podem pegar (ou
// infinito) e o peso. Vai pro inventário de quem pegar; documento abre a imagem dele.
export function itemDoObjeto(o: { categoria: CategoriaItem; imagem: string | null; quantidade: number; infinito: boolean; peso: number }): Partial<ItemMesa> {
  return {
    image_url: o.imagem,
    quantidade: o.infinito ? 1 : Math.max(1, Math.round(o.quantidade)),
    carga: Math.max(0, o.peso),
    efeitos: { inventario: true, coleta: o.infinito ? 'infinito' : 'porPessoa', ...(o.categoria === 'documento' ? { imagem: o.imagem } : {}) },
  }
}

export type EntradaConteudo = { item_id?: string; compendio_id?: string; nome?: string; quantidade: number; ilimitado?: boolean; preco?: number | null }

// Item novo a partir de um equipamento do compêndio: já vem com nome, descrição, tipo,
// categoria, carga e imagem, e ligado a ele.
export function itemDoCompendio(e: { id: string; nome: string; tipo: string; categoria: string; carga: number; descricao: string; imagem: string | null }) {
  const escapar = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const descricao = e.descricao.trim() ? e.descricao.trim().split(/\n{2,}/).map((p) => `<p>${escapar(p).replace(/\n/g, '<br>')}</p>`).join('') : null
  const tipo = TIPOS_ITEM.some((t) => t.id === e.tipo) ? (e.tipo as TipoItem) : undefined
  return {
    name: e.nome,
    categoria: 'lootavel' as CategoriaItem,
    image_url: e.imagem,
    carga: e.carga,
    descricao,
    detalhes: { tipo, categoriaSistema: e.categoria || undefined } as DetalhesItem,
    compendio_id: e.id,
  }
}

export function nivelNoItem(i: Pick<ItemMesa, 'acesso_padrao' | 'acesso_jogadores'>, userId: string, souMestre: boolean): NivelAcesso {
  if (souMestre) return 'dono'
  return i.acesso_jogadores[userId] ?? i.acesso_padrao
}

// Duplicar: mesmo conteúdo, nome "(Cópia)", atividades com ids novos.
export function copiaDoItem(i: ItemMesa): Omit<ItemMesa, 'id' | 'created_at'> {
  const { id: _id, created_at: _c, ...resto } = i
  // Atividades ganham ids novos e o encadeamento aponta pros novos.
  const novos = Object.fromEntries(i.atividades.map((a) => [a.id, crypto.randomUUID()]))
  const troca = (ids: string[]) => ids.map((x) => novos[x]).filter(Boolean)
  return {
    ...structuredClone(resto),
    name: `${i.name} (Cópia)`,
    atividades: i.atividades.map((a) => ({ ...structuredClone(a), id: novos[a.id], seSim: troca(a.seSim), seNao: troca(a.seNao) })),
  }
}

// Ordem da lista: alfabética ou de criação (spec 12.10).
export function ordenarItens<T extends Pick<ItemMesa, 'name' | 'created_at'>>(lista: T[], modo: 'alfabetica' | 'criacao'): T[] {
  return [...lista].sort((a, b) => (modo === 'alfabetica' ? a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }) : a.created_at.localeCompare(b.created_at)))
}

// Etiquetas embaixo da descrição (como as do Foundry): categoria, tipo, raridade, duração.
export function etiquetasDoItem(i: Pick<ItemMesa, 'categoria' | 'raridade' | 'detalhes'>): string[] {
  const e = [CATEGORIAS_ITEM.find((c) => c.id === i.categoria)?.rotulo ?? '']
  if (i.categoria === 'lootavel' && i.detalhes.tipo) e.push(TIPOS_ITEM.find((t) => t.id === i.detalhes.tipo)?.rotulo ?? '')
  if (i.raridade) e.push(RARIDADES.find((r) => r.id === i.raridade)?.rotulo ?? '')
  return e.filter(Boolean)
}
