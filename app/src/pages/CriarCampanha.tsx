import { useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { SISTEMAS } from '../lib/sistemas'

// Cores de destaque da referência que a Millie mandou (02/10).
export const CORES_DESTAQUE = ['#b48af0', '#ff6b6b', '#ff69b4', '#4d9fff', '#00b39b', '#00c13f', '#dfb300', '#ff6433', '#a3a3a3']

// Criar Campanha (spec 4.4): nome, descrição, capa, cor de destaque e o jogo.
// O card seleciona o jogo; ao criar, o mestre entra direto na mesa (12.1).
export default function CriarCampanha() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const capaRef = useRef<HTMLInputElement>(null)
  const [nome, setNome] = useState('Nova Campanha')
  const [descricao, setDescricao] = useState('')
  const [capa, setCapa] = useState<string | null>(null)
  const [cor, setCor] = useState(CORES_DESTAQUE[0])
  const [jogo, setJogo] = useState<string | null>(null)
  const [enviandoCapa, setEnviandoCapa] = useState(false)
  const [criando, setCriando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [erroCapa, setErroCapa] = useState<string | null>(null)

  async function escolherCapa(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo || !session) return
    setEnviandoCapa(true)
    setErroCapa(null)
    const caminho = `${session.user.id}/${Date.now()}-${arquivo.name.replace(/[^\w.-]/g, '_')}`
    const { error } = await supabase.storage.from('campaign_covers').upload(caminho, arquivo)
    setEnviandoCapa(false)
    if (error) {
      setErroCapa(`Não deu pra enviar a imagem: ${error.message}`)
      return
    }
    setCapa(supabase.storage.from('campaign_covers').getPublicUrl(caminho).data.publicUrl)
  }

  async function criar() {
    if (!session || criando) return
    if (!jogo) {
      setErro('Escolha o jogo da campanha.')
      return
    }
    if (!nome.trim()) {
      setErro('Dê um nome pra campanha.')
      return
    }
    setCriando(true)
    setErro(null)
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        name: nome.trim(),
        description: descricao.trim() || null,
        cover_image_url: capa,
        accent_color: cor,
        system: jogo,
        owner_id: session.user.id,
      })
      .select('id')
      .single()
    if (error) {
      setCriando(false)
      setErro(error.message)
      return
    }
    await supabase.from('campaign_members').insert({ campaign_id: data.id, user_id: session.user.id, role: 'mestre' })
    navigate(`/mesa/${data.id}`)
  }

  return (
    <main className="criar-campanha" style={{ '--cc-destaque': cor } as React.CSSProperties}>
      <h1>Criar Campanha</h1>

      <section>
        <h2>Informações básicas</h2>
        <label className="cc-linha">
          <span className="cc-rotulo">Nome da campanha</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>
        <label className="cc-linha">
          <span className="cc-rotulo">Descrição</span>
          <textarea value={descricao} placeholder="Escreva aqui" onChange={(e) => setDescricao(e.target.value)} />
        </label>
      </section>

      <section>
        <h2>Aparência</h2>
        <div className="cc-linha">
          <span className="cc-rotulo">Imagem de Capa</span>
          <div className="cc-capa">
            {capa && <img src={capa} alt="" className="cc-capa-previa" />}
            <input ref={capaRef} type="file" accept="image/*" hidden onChange={escolherCapa} />
            <button type="button" className="cc-botao" disabled={enviandoCapa} onClick={() => capaRef.current?.click()}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.6l2 2.2h8.4A1.5 1.5 0 0 1 21 8.7v9.8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" />
              </svg>
              {enviandoCapa ? 'Enviando…' : capa ? 'Trocar imagem' : 'Escolher imagem'}
            </button>
            {erroCapa && <p role="alert" className="cc-erro">{erroCapa}</p>}
          </div>
        </div>
        <div className="cc-linha">
          <span className="cc-rotulo">Cor de Destaque</span>
          <div className="cc-cores" role="radiogroup" aria-label="Cor de Destaque">
            {CORES_DESTAQUE.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={cor === c}
                aria-label={c}
                className={`cc-cor${cor === c ? ' ativa' : ''}`}
                style={{ background: c }}
                onClick={() => setCor(c)}
              />
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>Escolha o jogo para a campanha</h2>
        <div className="system-card-grid cc-jogos">
          {SISTEMAS.map((s) => (
            <div key={s.id} className={`system-card-wrap${jogo === s.id ? ' cc-jogo-escolhido' : ''}`}>
              <span className="system-card-badge">{s.version}</span>
              <div className="system-card">
                <div className="system-card-left">
                  <h2>{s.name}</h2>
                  <p>{s.description}</p>
                  <button type="button" className="btn-pill btn-pill-danger" aria-pressed={jogo === s.id} onClick={() => { setJogo(s.id); setErro(null) }}>
                    {jogo === s.id ? 'Jogo selecionado' : 'Selecionar jogo'}
                  </button>
                </div>
                <div className="system-card-right" style={{ backgroundImage: `url(${s.image})` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {erro && <p role="alert" className="cc-erro">{erro}</p>}

      <div className="cc-acoes">
        <button type="button" className="cc-botao cc-criar" disabled={criando || enviandoCapa} onClick={criar}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4.5 12.5l5 5L19.5 7" />
          </svg>
          {criando ? 'Criando…' : 'Criar Campanha'}
        </button>
      <Link to="/jogar" className="cc-voltar">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
        Voltar
      </Link>
      </div>
    </main>
  )
}
