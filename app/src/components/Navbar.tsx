import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import arkanisLogo from '../assets/icons/arkanis-logo.png'

export default function Navbar() {
  const { session } = useAuth()
  const location = useLocation()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setAvatarUrl(data?.avatar_url ?? null))
  }, [session])

  const isSheetRoute = /^\/personagem\/[^/]+$/.test(location.pathname) && location.pathname !== '/personagem/criar'
  const isCreationWizard = /^\/personagem\/criar\/[^/]+$/.test(location.pathname)
  const isMesa = location.pathname.startsWith('/mesa/')
  if (isSheetRoute || isCreationWizard || isMesa) return null

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={arkanisLogo} alt="Arkanis" />
      </Link>
      {session && (
        <>
          <Link to="/perfil">Perfil</Link>
          <Link to="/jogar">Jogar</Link>
          <Link to="/perfil" className="navbar-avatar">
            {avatarUrl ? <img src={avatarUrl} alt="Avatar" width={32} height={32} /> : <span>(avatar)</span>}
          </Link>
        </>
      )}
    </nav>
  )
}
