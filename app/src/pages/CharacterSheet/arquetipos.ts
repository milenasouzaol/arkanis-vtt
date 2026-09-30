import type { ChaveElemento } from './elementosParanormais'
import emblemaTransformacao from '../../assets/afinidade/emblema-transformacao.webp'

/**
 * Arquetipos do Teste de Personalidade. Na referencia cada elemento tem mais de um
 * arquetipo (Transformacao e Liberdade sao os dois de Energia). Por enquanto o teste
 * decide so o elemento, e cada elemento mostra um arquetipo: so Energia tem texto e
 * emblema, tirados do print da referencia. Os outros caem no simbolo e no nome do elemento.
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
}

/** Citacao de cada entidade. So a de Energia veio (do print); as outras ficam de fora ate chegarem. */
export const CITACOES: Partial<Record<ChaveElemento, string>> = {
  energia: 'A Energia é a entidade do caos. Tudo que não pode ser explicado, o intangível, a anarquia. A constante mudança, o calor e o frio, a luz e as trevas. Tudo que envolve a imprevisibilidade e a transformação agrada a entidade de Energia.',
}
