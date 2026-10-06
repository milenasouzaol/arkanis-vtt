// Sonoplastia (pedido da Millie, 06/10; arquivos que ela trouxe, em public/sons). Cada som toca no
// volume de Efeitos Sonoros da pessoa (Lista de Reprodução → Controles de Volume de Usuário).
import { lerVolumes } from '../pages/Mesa/volumesDoUsuario'

export const SONS = {
  dado: 'dado.mp3', // dados caindo
  virar: 'virar-cartao.mp3', // virar o cartão de rolagem
  aba: 'abrir.mp3', // trocar de aba
  abrir: 'abrir.mp3', // abrir janela/módulo
  fechar: 'fechar.mp3', // fechar janela/módulo
  parar: 'fechar.mp3', // desligar um som da Lista de Reprodução
  check: 'check.mp3', // marcar uma caixinha
  escrever: 'escrever.mp3', // mandar mensagem, salvar nota
  criar: 'pagina-nova.mp3', // criar item, nota, pasta
  deletar: 'deletar.mp3', // excluir
  'ritual-sangue': 'ritual-sangue.mp3',
  'ritual-morte': 'ritual-morte.mp3',
  'ritual-conhecimento': 'ritual-conhecimento.mp3',
  'ritual-energia': 'ritual-energia.mp3',
  'ritual-medo': 'ritual-medo.mp3',
} as const

export type Som = keyof typeof SONS

// O mesmo som disparado várias vezes no mesmo instante (ex.: excluir 5 tokens) toca uma vez só.
const ultimo: Partial<Record<Som, number>> = {}

export function tocarSom(som: Som) {
  const volume = lerVolumes().efeitos
  if (volume <= 0) return
  const agora = performance.now()
  if ((ultimo[som] ?? -1e9) > agora - 90) return
  ultimo[som] = agora
  try {
    const a = new Audio(`/sons/${SONS[som]}`)
    a.volume = Math.min(1, volume)
    a.play().catch(() => null) // navegador bloqueia som antes do primeiro clique: tudo bem
  } catch {
    // sem áudio no navegador
  }
}

// "Sangue" → ritual-sangue (Medo, Morte, Conhecimento, Energia). Sem elemento conhecido, nada.
export function somDoRitual(elemento: string | null | undefined): Som | null {
  const e = (elemento ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
  const s = `ritual-${e}` as Som
  return s in SONS ? s : null
}

// Ficha aberta dentro da mesa (janela portátil): quem toca o dado é a mesa, junto com os dados 3D.
export function dentroDaMesa(): boolean {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}
