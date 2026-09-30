import type { ChaveElemento } from './elementosParanormais'
import emblemaTransformacao from '../../assets/afinidade/emblema-transformacao.webp'
import emblemaEmpatia from '../../assets/afinidade/emblema-empatia.webp'
import emblemaEquilibrio from '../../assets/afinidade/emblema-equilibrio.webp'
import emblemaContemplacao from '../../assets/afinidade/emblema-contemplacao.webp'

/**
 * Arquetipos do Teste de Personalidade. Na referencia cada elemento tem mais de um
 * arquetipo (Transformacao e Liberdade sao de Energia, Empatia e Intensidade de Sangue...).
 * Por enquanto o teste decide so o elemento, e cada elemento mostra um arquetipo, com o
 * texto tirado dos prints da referencia.
 */
export type Arquetipo = {
  nome: string
  titulo: string
  texto: string
  /** Sem emblema ainda, a tela usa o simbolo do elemento. */
  emblema?: string
}

export const ARQUETIPOS: Partial<Record<ChaveElemento, Arquetipo>> = {
  energia: {
    nome: 'Transformação',
    titulo: 'Transformação: a metamorfose infinita.',
    texto: 'Tudo que é estático é entediante, por isso, você clama por mudanças constantes. A capacidade de adaptar, reinventar e reconstruir é uma característica fundamental da sua persona, sempre esperando pelo novo desafio que o universo irá te impor.',
    emblema: emblemaTransformacao,
  },
  sangue: {
    nome: 'Empatia',
    titulo: 'Empatia: o laço compartilhado.',
    texto: 'Uma vida solitária não vale a pena ser vivida. Sua mente o coloca dentro da pele de cada um que você se aproxima, absorvendo seus sentimentos, dores e sonhos, isso não te faz exatamente uma pessoa exemplar, mas permite a criação de laços profundos com os outros seres vivos deste mundo.',
    emblema: emblemaEmpatia,
  },
  conhecimento: {
    nome: 'Equilíbrio',
    titulo: 'Equilíbrio: o pilar da temperança.',
    texto: 'Tudo tem um motivo para existir: O bem e o mal, a luz e a escuridão, o certo e o errado. Você tem um estrito código moral, buscando resolver a maioria dos conflitos através da mediação entre emoção e razão. Todavia, isso cria uma dúvida, seria o excesso de equilíbrio injusto?',
    emblema: emblemaEquilibrio,
  },
  morte: {
    nome: 'Contemplação',
    titulo: 'Contemplação: a eterna reflexão.',
    texto: 'Os segundos parecem infinitos enquanto você contempla a infinita espiral de acontecimentos da vida. Seja o passado, presente ou futuro, você enxerga cada momento como um artista que analisa uma obra de arte: Buscando significados, detalhes e novas perguntas que engrandecem o grande desígnio do tempo.',
    emblema: emblemaContemplacao,
  },
}

/** Citacao de cada entidade, tirada dos prints. As que faltam ficam de fora ate chegarem. */
export const CITACOES: Partial<Record<ChaveElemento, string>> = {
  energia: 'A Energia é a entidade do caos. Tudo que não pode ser explicado, o intangível, a anarquia. A constante mudança, o calor e o frio, a luz e as trevas. Tudo que envolve a imprevisibilidade e a transformação agrada a entidade de Energia.',
  conhecimento: 'O Conhecimento é a entidade da consciência. Descobrir, aprender, conhecer, decifrar. Ter a própria percepção do Outro Lado e suas entidades agrada o elemento de Conhecimento.',
  morte: 'A Morte é a entidade do tempo. Ela busca os momentos vivenciados, distorcendo a percepção egóica da existência de cada indivíduo para seu próprio agrado.',
  sangue: 'O Sangue é a entidade do sentimento. Ele busca a intensidade: dor, obsessão, paixão, amor, fome, ódio - tudo que envolve sentir uma emoção extrema agrada a entidade de Sangue.',
}

/** A frase de baixo do titulo muda por elemento; o arquetipo entra no fim, em destaque. */
export const SUBTITULOS: Partial<Record<ChaveElemento, string>> = {
  energia: 'Sua alma flui através de ondas de',
  sangue: 'Seu coração pulsa em uma corrente de',
  conhecimento: 'Os sigilos da sua mente são decifrados através de',
  morte: 'Você segue a grande espiral por linhas de',
}
