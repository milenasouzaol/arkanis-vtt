// Regras puras da mesa (KAN-46): abas das barras, quem está conectado e como
// cada pessoa aparece no painel de sessão. Ficam fora dos componentes pra serem testadas.

export type AbaDireita =
  | 'chat'
  | 'combate'
  | 'cenas'
  | 'posicionaveis'
  | 'personagens'
  | 'itens'
  | 'diario'
  | 'playlist'
  | 'config'

export type CategoriaEsquerda = 'tokens' | 'desenho' | 'som'

// Ordem da barra direita conforme a spec (12.3 a 12.12), com o card que constrói cada uma.
export const ABAS_DIREITA: { id: AbaDireita; rotulo: string; card: string }[] = [
  { id: 'chat', rotulo: 'Mensagens de Chat', card: 'KAN-47' },
  { id: 'combate', rotulo: 'Encontros de Combate', card: 'KAN-50' },
  { id: 'cenas', rotulo: 'Cenas', card: 'KAN-48' },
  { id: 'posicionaveis', rotulo: 'Posicionáveis', card: 'KAN-53' },
  { id: 'personagens', rotulo: 'Personagens', card: 'KAN-49' },
  { id: 'itens', rotulo: 'Itens', card: 'KAN-53' },
  { id: 'diario', rotulo: 'Diário', card: 'KAN-53' },
  { id: 'playlist', rotulo: 'Lista de Reprodução', card: 'KAN-53' },
  { id: 'config', rotulo: 'Configurações', card: 'KAN-54' },
]

// Categorias da barra esquerda (12.13). Paredes e Iluminação estão fora do escopo.
export const CATEGORIAS_ESQUERDA: { id: CategoriaEsquerda; rotulo: string }[] = [
  { id: 'tokens', rotulo: 'Controles de Token' },
  { id: 'desenho', rotulo: 'Ferramentas de Desenho' },
  { id: 'som', rotulo: 'Controles de Som Ambiente' },
]

// Ferramentas de cada categoria (12.13). As de desenho e som entram no KAN-52.
export const FERRAMENTAS: Record<CategoriaEsquerda, { id: string; rotulo: string }[]> = {
  tokens: [
    { id: 'selecionar', rotulo: 'Selecionar Tokens' },
    { id: 'alvos', rotulo: 'Selecionar Alvos' },
    { id: 'medir', rotulo: 'Medir Distância' },
  ],
  desenho: [],
  som: [],
}

export type Papel = 'mestre' | 'jogador'

export type Membro = {
  userId: string
  papel: Papel
  nomeConta: string
  personagem: string | null
  fotoConta?: string | null
  personagemId?: string | null
  fotoPersonagem?: string | null
}

// O que cada aba aberta da mesa anuncia no canal de presença.
export type Presenca = { userId: string }

export function primeiroNome(nome: string): string {
  const limpo = nome.trim()
  if (!limpo) return 'Sem nome'
  return limpo.split(/\s+/)[0]
}

// "Novo Agente (Millie)" — mesmo padrão do Histórico de Rolagens (5.9).
// Sem personagem na campanha, aparece só o nome da conta.
export function rotuloJogador(m: Pick<Membro, 'nomeConta' | 'personagem'>): string {
  const conta = primeiroNome(m.nomeConta)
  return m.personagem?.trim() ? `${m.personagem.trim()} (${conta})` : conta
}

// Junta os membros com quem está com a mesa aberta agora. Uma pessoa com várias abas
// abertas conta uma vez só. O mestre vem primeiro; jogadores em ordem alfabética.
export function conectados(membros: Membro[], presencas: Presenca[]): Membro[] {
  const online = new Set(presencas.map((p) => p.userId))
  return membros
    .filter((m) => online.has(m.userId))
    .sort((a, b) => {
      if (a.papel !== b.papel) return a.papel === 'mestre' ? -1 : 1
      return rotuloJogador(a).localeCompare(rotuloJogador(b), 'pt-BR')
    })
}

// Quadros por segundo a partir dos instantes (ms) dos últimos quadros desenhados.
export function calcularFps(instantes: number[]): number {
  if (instantes.length < 2) return 0
  const duracao = instantes[instantes.length - 1] - instantes[0]
  if (duracao <= 0) return 0
  return Math.round(((instantes.length - 1) * 1000) / duracao)
}

export function linkDeConvite(origem: string, codigo: string): string {
  return `${origem}/campanha/entrar/${codigo}`
}
