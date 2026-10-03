import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { guardarDestino } from './convitePendente'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!session) {
    // Quem abriu um convite sem estar logado volta pra ele depois de entrar ou criar a conta.
    if (location.pathname.startsWith('/campanha/entrar/')) guardarDestino(location.pathname)
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
