import type { ChaveElemento } from './elementosParanormais'
import emblemaTransformacao from '../../assets/afinidade/emblema-transformacao.webp'
import emblemaEmpatia from '../../assets/afinidade/emblema-empatia.webp'

/**
 * Arquetipos do Teste de Personalidade. Na referencia cada elemento tem mais de um
 * arquetipo (Transformacao e Liberdade sao de Energia; Empatia e Intensidade, de Sangue).
 * Por enquanto o teste decide so o elemento, e cada elemento mostra um arquetipo, com o
 * texto tirado dos prints da referencia. Quem nao tem cai no simbolo e no nome do elemento.
 */
export type Arquetipo = {
  nome: string
  titulo: string
  texto: string
  emblema: string
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
}

/** Citacao de cada entidade, tirada dos prints. As que faltam ficam de fora ate chegarem. */
export const CITACOES: Partial<Record<ChaveElemento, string>> = {
  energia: 'A Energia é a entidade do caos. Tudo que não pode ser explicado, o intangível, a anarquia. A constante mudança, o calor e o frio, a luz e as trevas. Tudo que envolve a imprevisibilidade e a transformação agrada a entidade de Energia.',
  sangue: 'O Sangue é a entidade do sentimento. Ele busca a intensidade: dor, obsessão, paixão, amor, fome, ódio - tudo que envolve sentir uma emoção extrema agrada a entidade de Sangue.',
}

/** A frase de baixo do titulo muda por elemento; o arquetipo entra no fim, em destaque. */
export const SUBTITULOS: Partial<Record<ChaveElemento, string>> = {
  energia: 'Sua alma flui através de ondas de',
  sangue: 'Seu coração pulsa em uma corrente de',
}
