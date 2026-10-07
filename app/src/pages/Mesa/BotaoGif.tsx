import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faUpload } from '@fortawesome/free-solid-svg-icons'

// GIFs no chat (pedido da Millie, 06/10): botão "GIF" na barra do chat abre a busca do GIPHY
// (em alta quando a busca está vazia); clicar num GIF manda na hora. Sem a chave do GIPHY
// (VITE_GIPHY_API_KEY no .env), ainda dá pra mandar um GIF do computador ou por link.
const CHAVE = import.meta.env.VITE_GIPHY_API_KEY as string | undefined

type Gif = { id: string; titulo: string; previa: string; url: string; largura: number; altura: number }

type RespostaGiphy = {
  data: {
    id: string
    title: string
    images: {
      fixed_width: { url: string; width: string; height: string }
      downsized_medium?: { url: string }
      original: { url: string }
    }
  }[]
}

async function buscarGifs(termo: string, sinal: AbortSignal): Promise<Gif[]> {
  const q = new URLSearchParams({ api_key: CHAVE ?? '', limit: '30', rating: 'pg-13', lang: 'pt' })
  if (termo) q.set('q', termo)
  const r = await fetch(`https://api.giphy.com/v1/gifs/${termo ? 'search' : 'trending'}?${q}`, { signal: sinal })
  if (!r.ok) throw new Error(String(r.status))
  const j = (await r.json()) as RespostaGiphy
  return j.data.map((g) => ({
    id: g.id,
    titulo: g.title,
    previa: g.images.fixed_width.url,
    url: g.images.downsized_medium?.url || g.images.original.url,
    largura: Number(g.images.fixed_width.width) || 200,
    altura: Number(g.images.fixed_width.height) || 200,
  }))
}

export default function BotaoGif({ onEnviar, onImagem }: {
  onEnviar: (html: string) => Promise<boolean>
  onImagem: (arquivo: File) => Promise<string | null>
}) {
  const [aberto, setAberto] = useState(false)
  const [termo, setTermo] = useState('')
  const [gifs, setGifs] = useState<Gif[]>([])
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'erro'>('carregando')
  const [link, setLink] = useState('')
  const [enviando, setEnviando] = useState(false)
  const arquivo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!aberto || !CHAVE) return
    const c = new AbortController()
    const t = setTimeout(() => {
      setEstado('carregando')
      buscarGifs(termo.trim(), c.signal)
        .then((l) => {
          setGifs(l)
          setEstado('pronto')
        })
        .catch((e) => e.name !== 'AbortError' && setEstado('erro'))
    }, 300)
    return () => {
      clearTimeout(t)
      c.abort()
    }
  }, [aberto, termo])

  async function mandar(url: string) {
    if (enviando) return
    setEnviando(true)
    const ok = await onEnviar(`<img src="${url.replace(/"/g, '&quot;')}" alt="">`)
    setEnviando(false)
    if (ok) {
      setAberto(false)
      setTermo('')
      setLink('')
    }
  }

  async function doComputador(f: File) {
    setEnviando(true)
    const url = await onImagem(f)
    setEnviando(false)
    if (url) mandar(url)
  }

  return (
    <div className="chat-gif">
      <button
        type="button"
        className={`chat-barra-icone chat-gif-botao${aberto ? ' ligado' : ''}`}
        aria-label="GIFs"
        aria-expanded={aberto}
        title="GIFs"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setAberto((a) => !a)}
      >
        GIF
      </button>
      {aberto && (
        <>
          <div className="dropdown-backdrop" onClick={() => setAberto(false)} />
          <div className="chat-gif-painel" role="dialog" aria-label="Escolher GIF">
            {CHAVE ? (
              <>
                <label className="chat-gif-busca">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                  <input autoFocus value={termo} placeholder="Procurar GIFs" aria-label="Procurar GIFs" onChange={(e) => setTermo(e.target.value)} />
                </label>
                <div className="chat-gif-grade">
                  {estado === 'erro' && <p className="item-vazio">Não deu pra buscar agora.</p>}
                  {estado === 'pronto' && !gifs.length && <p className="item-vazio">Nada encontrado.</p>}
                  {gifs.map((g) => (
                    <button key={g.id} type="button" title={g.titulo} disabled={enviando} onClick={() => mandar(g.url)}>
                      <img src={g.previa} alt={g.titulo} loading="lazy" />
                    </button>
                  ))}
                </div>
                <p className="chat-gif-giphy">Powered by GIPHY</p>
              </>
            ) : (
              <p className="chat-gif-aviso">A busca de GIFs ainda não está ligada (falta a chave do GIPHY). Dá pra mandar um GIF do computador ou por link:</p>
            )}
            <div className="chat-gif-outros">
              <input value={link} placeholder="Colar link de um GIF" aria-label="Link do GIF" onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && /^https?:\/\//.test(link.trim()) && mandar(link.trim())} />
              <button type="button" className="janela-botao" disabled={enviando} title="Enviar GIF do computador" onClick={() => arquivo.current?.click()}>
                <FontAwesomeIcon icon={faUpload} />
              </button>
              <input ref={arquivo} type="file" accept="image/gif,image/webp,image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) doComputador(f) }} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
