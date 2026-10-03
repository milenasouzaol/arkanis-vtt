import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { fallbackAvatarColor } from '../lib/color'
import arkanisLogo from '../assets/icons/arkanis-logo.png'

type CampaignItem = {
  id: string
  name: string
  description: string | null
  invite_code: string
  owner_id: string
  cover_image_url: string | null
}

export default function MinhasCampanhas() {
  const { session } = useAuth()
  const [campaigns, setCampaigns] = useState<CampaignItem[] | null>(null)
  const [accentColor, setAccentColor] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function loadCampaigns() {
    if (!session) return
    const { data } = await supabase
      .from('campaign_members')
      .select('campaigns(id, name, description, invite_code, owner_id, cover_image_url)')
      .eq('user_id', session.user.id)
    setCampaigns((data ?? []).map((row) => row.campaigns as unknown as CampaignItem).filter(Boolean))
  }

  useEffect(() => {
    loadCampaigns()
  }, [session])

  useEffect(() => {
    if (!session) return
    supabase.from('profiles').select('accent_color').eq('id', session.user.id).single()
      .then(({ data }) => setAccentColor(data?.accent_color ?? null))
  }, [session])

  async function handleCopiarLink(c: CampaignItem) {
    const url = `${window.location.origin}/campanha/entrar/${c.invite_code}`
    await navigator.clipboard.writeText(url)
    setCopiedId(c.id)
    setMenuOpen(null)
    setTimeout(() => setCopiedId((id) => (id === c.id ? null : id)), 2000)
  }

  return (
    <section>
      <div className="character-list-header">
        <h2>Minhas Campanhas</h2>
        <div className="character-list-actions">
          <Link to="/jogar" className="btn-pill" style={{ backgroundColor: accentColor ?? undefined }}>
            Ver todas as campanhas
          </Link>
          <Link to="/campanha/criar" className="btn-pill btn-pill-neutral">
            Criar nova campanha
          </Link>
        </div>
      </div>

      <p className="character-list-desc">
        Aqui você tem uma visão das últimas campanhas que entrou. Não está vendo aquilo que procura aqui? Acesse "Ver todas as campanhas" para uma lista completa.
      </p>

      {campaigns === null && <p>Carregando…</p>}
      {campaigns?.length === 0 && <p>Nenhuma campanha ainda.</p>}

      <div className="character-tile-grid">
        {campaigns?.map((c) => (
          <div key={c.id} className="character-tile" style={c.cover_image_url ? { backgroundImage: `url(${c.cover_image_url})` } : { backgroundColor: fallbackAvatarColor(c.id) }}>
            {!c.cover_image_url && <img className="character-tile-watermark" src={arkanisLogo} alt="" />}
            <div className="character-card-menu" onClick={(e) => e.preventDefault()}>
              <button
                type="button"
                className="character-card-menu-btn"
                onClick={() => setMenuOpen((id) => (id === c.id ? null : c.id))}
                aria-label="Opções"
              >
                •••
              </button>
              {menuOpen === c.id && (
                <>
                  <div className="dropdown-backdrop" onClick={() => setMenuOpen(null)} />
                  <ul className="character-card-dropdown">
                    <li><button type="button" onClick={() => handleCopiarLink(c)}>{copiedId === c.id ? 'Link copiado!' : 'Copiar link de convite'}</button></li>
                  </ul>
                </>
              )}
            </div>
            <Link to={`/mesa/${c.id}`} className="character-tile-link" aria-label={`Abrir a mesa de ${c.name}`} />
            <div className="character-tile-info">
              <strong>{c.name}</strong>
              <span>{c.owner_id === session?.user.id ? 'Mestre' : 'Jogador'}</span>
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}
