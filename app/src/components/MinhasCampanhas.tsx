import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
}

export default function MinhasCampanhas() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState<CampaignItem[] | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [accentColor, setAccentColor] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function loadCampaigns() {
    if (!session) return
    const { data } = await supabase
      .from('campaign_members')
      .select('campaigns(id, name, description, invite_code, owner_id)')
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

  async function handleCreate() {
    if (!session || !newName.trim()) return
    const { data, error: createError } = await supabase
      .from('campaigns')
      .insert({ name: newName, description: newDescription || null, owner_id: session.user.id })
      .select('id')
      .single()
    if (createError) {
      setError(createError.message)
      return
    }
    await supabase.from('campaign_members').insert({ campaign_id: data.id, user_id: session.user.id, role: 'mestre' })
    // 12.1: ao criar, o mestre vai direto pra dentro da mesa.
    navigate(`/mesa/${data.id}`)
  }

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
          <button type="button" className="btn-pill btn-pill-neutral" onClick={() => setShowCreate(true)}>
            Criar nova campanha
          </button>
        </div>
      </div>

      <p className="character-list-desc">
        Aqui você tem uma visão das últimas campanhas que entrou. Não está vendo aquilo que procura aqui? Acesse "Ver todas as campanhas" para uma lista completa.
      </p>

      {error && <p role="alert">{error}</p>}

      {campaigns === null && <p>Carregando…</p>}
      {campaigns?.length === 0 && <p>Nenhuma campanha ainda.</p>}

      <div className="character-tile-grid">
        {campaigns?.map((c) => (
          <div key={c.id} className="character-tile" style={{ backgroundColor: fallbackAvatarColor(c.id) }}>
            <img className="character-tile-watermark" src={arkanisLogo} alt="" />
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

      {showCreate && (
        <div className="campaign-form">
          <label className="editperfil-field">
            Nome
            <input value={newName} onChange={(e) => setNewName(e.target.value)} />
          </label>
          <label className="editperfil-field">
            Descrição
            <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
          </label>
          <button type="button" onClick={handleCreate}>Criar</button>
          <button type="button" onClick={() => setShowCreate(false)}>Cancelar</button>
        </div>
      )}
    </section>
  )
}
