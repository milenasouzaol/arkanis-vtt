import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import MeusPersonagens from '../components/MeusPersonagens'
import { hexToRgba } from '../lib/color'
import settingsIcon from '../assets/icons/settings-icon.svg'
import logoutIcon from '../assets/icons/log-out-icon.svg'

type ProfileRow = {
  display_name: string | null
  description: string | null
  avatar_url: string | null
  banner_url: string | null
  banner_position_y: number
  accent_color: string | null
  background_color: string | null
}

export default function Perfil() {
  const { session, acesso } = useAuth()
  // Administradora: quantos pedidos de acesso estão esperando.
  const [esperando, setEsperando] = useState(0)
  useEffect(() => {
    if (!acesso.admin) return
    supabase.from('acesso_usuarios').select('user_id', { count: 'exact', head: true }).eq('status', 'pendente').then(({ count }) => setEsperando(count ?? 0))
  }, [acesso.admin])
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileRow | null>(null)

  useEffect(() => {
    if (!session) return
    supabase
      .from('profiles')
      .select('display_name, description, avatar_url, banner_url, banner_position_y, accent_color, background_color')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data))
  }, [session])

  async function handleSair() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const accent = profile?.accent_color || undefined
  const background = profile?.background_color || undefined
  const tint = background ? hexToRgba(background, 0.45) : undefined

  return (
    <main className="profile-page font-ashigea" style={{ '--profile-tint': tint, '--vignette-color': background } as React.CSSProperties}>
      <div className="profile-vignette" />

      <div className="profile-banner" style={{ backgroundColor: background }}>
        {profile?.banner_url && (
          <img
            className="profile-banner-img"
            src={profile.banner_url}
            alt=""
            style={{ objectPosition: `center ${profile.banner_position_y}%` }}
          />
        )}
        <div className="profile-banner-content">
          <img className="profile-avatar" src={profile?.avatar_url ?? undefined} alt="Avatar" />
          <div className="profile-banner-textbox">
            <h1 style={{ color: accent }}>{profile?.display_name || 'Sem nome definido'}</h1>
            {profile?.description && <p className="profile-desc">{profile.description}</p>}
          </div>
        </div>
      </div>

      <div className="profile-body">
        <section className="profile-characters">
          <MeusPersonagens />
        </section>

        <aside className="profile-actions">
          {acesso.admin && (
            <Link to="/acessos" className="profile-action-item">
              <img src={settingsIcon} alt="" />
              <span>Pedidos de Acesso{esperando ? ` (${esperando})` : ''}</span>
            </Link>
          )}
          <Link to="/perfil/editar" className="profile-action-item">
            <img src={settingsIcon} alt="" />
            <span>Editar Perfil</span>
          </Link>
          <button type="button" className="profile-action-item" onClick={handleSair}>
            <img src={logoutIcon} alt="" />
            <span>Sair</span>
          </button>
        </aside>
      </div>
    </main>
  )
}
