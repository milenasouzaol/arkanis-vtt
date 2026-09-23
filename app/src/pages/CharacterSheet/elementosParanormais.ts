import sangueSimbolo from '../../assets/afinidade/sangue-simbolo.webp'
import morteSimbolo from '../../assets/afinidade/morte-simbolo.webp'
import conhecimentoSimbolo from '../../assets/afinidade/conhecimento-simbolo.webp'
import energiaSimbolo from '../../assets/afinidade/energia-simbolo.webp'
import bgSangue from '../../assets/backgrounds/bg-sangue.webp'
import bgMorte from '../../assets/backgrounds/bg-morte.webp'
import bgConhecimento from '../../assets/backgrounds/bg-conhecimento.webp'
import bgEnergia from '../../assets/backgrounds/bg-energia.webp'

export type ChaveElemento = 'sangue' | 'morte' | 'conhecimento' | 'energia'

export type Elemento = {
  key: ChaveElemento
  nome: string
  descricao: string
  /** A frase da tela final, a que "significa" o elemento. */
  frase: string
  simbolo: string
  fundo: string
  /** Cor do brilho no hover dos orbes. */
  cor: string
  /** Tom escuro que o fundo da roda assume com o elemento escolhido. */
  tinta: string
  /** Posicao do botao na arte de fundo, em % da arte (nao da tela). */
  x: number
  y: number
}

// As posicoes sao o miolo de cada circulo vazio da propria arte de fundo, achado por
// analise da imagem (o ponto mais longe de qualquer traco), em % da arte.
export const ELEMENTOS: Elemento[] = [
  {
    key: 'sangue',
    nome: 'Sangue',
    descricao: 'Vitalidade, fúria, o corpo levado ao extremo.',
    frase: 'O fluxo que banha o Outro Lado',
    simbolo: sangueSimbolo,
    fundo: bgSangue,
    cor: '#c8202b',
    tinta: '#281518',
    x: 36.8,
    y: 39.0,
  },
  {
    key: 'morte',
    nome: 'Morte',
    descricao: 'Entropia, decadência, o fim de todas as coisas.',
    frase: 'Todas as coisas precisam de um fim.',
    simbolo: morteSimbolo,
    fundo: bgMorte,
    cor: '#e8e8e8',
    tinta: '#212124',
    x: 62.2,
    y: 38.7,
  },
  {
    key: 'energia',
    nome: 'Energia',
    descricao: 'Caos, eletricidade, o acaso que rege o universo.',
    frase: 'O caos é inevitável.',
    simbolo: energiaSimbolo,
    fundo: bgEnergia,
    cor: '#7b2fd6',
    tinta: '#21192a',
    x: 33.6,
    y: 59.1,
  },
  {
    key: 'conhecimento',
    nome: 'Conhecimento',
    descricao: 'Segredos proibidos, mente e percepção além do véu.',
    frase: 'Saber tudo é perder tudo.',
    simbolo: conhecimentoSimbolo,
    fundo: bgConhecimento,
    cor: '#d9a227',
    tinta: '#2c261e',
    x: 65.6,
    y: 58.6,
  },
]

export function elementoPorChave(key: string | null | undefined) {
  return ELEMENTOS.find((e) => e.key === key) ?? null
}
