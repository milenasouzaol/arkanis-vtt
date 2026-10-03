import cardOrdemParanormal from '../assets/backgrounds/card-ordem-paranormal.webp'

// Jogos disponíveis no Arkanis. A mesa é genérica; cada jogo traz a própria ficha.
// `slug` vai na URL da criação de personagem; `id` é o que a campanha guarda em `system`.
export const SISTEMAS = [
  {
    id: 'ordem_paranormal',
    slug: 'ordem-paranormal',
    name: 'Ordem Paranormal',
    description: 'Se torne um agente da Ordo Realitas, especializado em defender o nosso mundo das forças do Outro Lado.',
    version: 'Atualizado v0.1',
    image: cardOrdemParanormal,
  },
]
