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

// Os arquivos vêm com volumes muito diferentes (os cliques chegam a ser 40x mais baixos que o
// dado) e o <audio> do navegador para em 100%. Então cada som é normalizado: ao carregar, mede o
// pico e ganha o reforço que falta pra chegar em PICO_ALVO; depois passa por um limitador, pra
// não estourar (pedido da Millie: os sons estavam muito baixinhos).
export const PICO_ALVO = 0.9
const REFORCO_MAXIMO = 60

let contexto: AudioContext | null = null
let saida: AudioNode | null = null
const buffers = new Map<string, Promise<{ buffer: AudioBuffer; reforco: number } | null>>()

// Quanto multiplicar pra o pico chegar no alvo (sem passar do reforço máximo).
export function reforcoDoPico(pico: number): number {
  if (pico <= 0) return 1
  return Math.min(REFORCO_MAXIMO, Math.max(1, PICO_ALVO / pico))
}

function audio(): { ctx: AudioContext; saida: AudioNode } | null {
  try {
    if (!contexto) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctx) return null
      contexto = new Ctx()
      const limitador = contexto.createDynamicsCompressor()
      limitador.threshold.value = -3
      limitador.knee.value = 0
      limitador.ratio.value = 20
      limitador.attack.value = 0.002
      limitador.release.value = 0.12
      limitador.connect(contexto.destination)
      saida = limitador
      // Já deixa todos os sons carregados (o primeiro clique não fica atrasado).
      for (const arquivo of new Set(Object.values(SONS))) carregar(contexto, arquivo)
    }
    if (contexto.state === 'suspended') contexto.resume().catch(() => null)
    return { ctx: contexto, saida: saida! }
  } catch {
    return null
  }
}

function carregar(ctx: AudioContext, arquivo: string): Promise<{ buffer: AudioBuffer; reforco: number } | null> {
  let b = buffers.get(arquivo)
  if (!b) {
    b = fetch(`/sons/${arquivo}`)
      .then((r) => r.arrayBuffer())
      .then((d) => ctx.decodeAudioData(d))
      .then((buffer) => {
        let pico = 0
        for (let c = 0; c < buffer.numberOfChannels; c++) {
          const dados = buffer.getChannelData(c)
          for (let i = 0; i < dados.length; i++) pico = Math.max(pico, Math.abs(dados[i]))
        }
        return { buffer, reforco: reforcoDoPico(pico) }
      })
      .catch(() => null)
    buffers.set(arquivo, b)
  }
  return b
}

export function tocarSom(som: Som) {
  const volume = lerVolumes().efeitos
  if (volume <= 0) return
  const agora = performance.now()
  if ((ultimo[som] ?? -1e9) > agora - 90) return
  ultimo[som] = agora
  const a = audio()
  if (!a) return
  carregar(a.ctx, SONS[som]).then((s) => {
    if (!s) return
    const fonte = a.ctx.createBufferSource()
    fonte.buffer = s.buffer
    const ganho = a.ctx.createGain()
    ganho.gain.value = volume * s.reforco
    fonte.connect(ganho).connect(a.saida)
    fonte.start()
  })
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
