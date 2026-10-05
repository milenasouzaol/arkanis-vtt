// Áudio do YouTube nos sons da mesa (pedido da Millie em 05/10): o vídeo toca num player
// escondido e o volume é controlado pelo código, igual a um mp3.

// "https://youtu.be/abc", "youtube.com/watch?v=abc", "/shorts/abc", "/embed/abc",
// "music.youtube.com/watch?v=abc" → "abc". Outro endereço → null.
export function idDoYoutube(url: string): string | null {
  const u = url.trim()
  if (!/youtu\.?be/i.test(u)) return null
  const m =
    /youtu\.be\/([\w-]{6,})/i.exec(u) ??
    /[?&]v=([\w-]{6,})/i.exec(u) ??
    /youtube\.com\/(?:shorts|embed|live|v)\/([\w-]{6,})/i.exec(u)
  return m ? m[1] : null
}

type YTPlayer = {
  playVideo(): void
  pauseVideo(): void
  setVolume(v: number): void
  destroy(): void
  getPlayerState(): number
}

type YTNamespace = {
  Player: new (el: HTMLElement, opcoes: Record<string, unknown>) => YTPlayer
  PlayerState: { PLAYING: number }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let carregando: Promise<YTNamespace> | null = null

// Carrega a API do player do YouTube uma vez só.
export function apiDoYoutube(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (carregando) return carregando
  carregando = new Promise((resolve) => {
    const antes = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      antes?.()
      resolve(window.YT!)
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(s)
  })
  return carregando
}

// Erros que o YouTube devolve: 101/150 = o dono não deixa tocar fora do YouTube.
export function motivoDoErroYoutube(codigo: number): string {
  if (codigo === 101 || codigo === 150) return 'o dono do vídeo não deixa tocar fora do YouTube'
  if (codigo === 100) return 'vídeo não encontrado (apagado ou privado)'
  return 'o YouTube não deixou tocar esse vídeo'
}

// O volume desliza do valor atual até o novo em ~meio segundo (o token anda de quadrado em
// quadrado; sem isso o som mudaria aos pulos). Devolve uma função que cancela a rampa.
export function rampaDeVolume(de: number, ate: number, aplicar: (v: number) => void, ms = 500): () => void {
  if (Math.abs(ate - de) < 0.005) {
    aplicar(ate)
    return () => {}
  }
  const inicio = performance.now()
  let quadro = 0
  const passo = (agora: number) => {
    const t = Math.min(1, (agora - inicio) / ms)
    aplicar(de + (ate - de) * t)
    if (t < 1) quadro = requestAnimationFrame(passo)
  }
  quadro = requestAnimationFrame(passo)
  return () => cancelAnimationFrame(quadro)
}

export type TocadorYoutube = { definirVolume(v: number): void; parar(): void }

// Um player escondido, em loop, que avisa se o vídeo não pode tocar.
export function criarTocadorYoutube(id: string, onErro: (motivo: string) => void): TocadorYoutube {
  const caixa = document.createElement('div')
  caixa.style.cssText = 'position:fixed;left:-10000px;top:0;width:200px;height:200px;opacity:0;pointer-events:none'
  const alvo = document.createElement('div')
  caixa.appendChild(alvo)
  document.body.appendChild(caixa)
  let player: YTPlayer | null = null
  let pronto = false
  let volume = 0 // o volume que se quer
  let atual = 0 // o volume que está tocando agora (desliza até o de cima)
  let parado = false
  let cancelar = () => {}
  const aplicar = () => {
    if (!player || !pronto) return
    const p = player
    if (volume > 0 && p.getPlayerState() !== window.YT?.PlayerState.PLAYING) p.playVideo()
    cancelar()
    cancelar = rampaDeVolume(atual, volume, (v) => {
      atual = v
      p.setVolume(Math.round(v * 100))
      if (v === 0 && volume === 0) p.pauseVideo()
    })
  }
  apiDoYoutube().then((YT) => {
    if (parado) return
    player = new YT.Player(alvo, {
      videoId: id,
      width: 200,
      height: 200,
      playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: id, playsinline: 1, disablekb: 1 },
      events: {
        onReady: () => {
          pronto = true
          aplicar()
        },
        onError: (e: { data: number }) => onErro(motivoDoErroYoutube(e.data)),
      },
    })
  })
  return {
    definirVolume(v: number) {
      volume = v
      aplicar()
    },
    parar() {
      parado = true
      cancelar()
      player?.destroy()
      caixa.remove()
    },
  }
}
