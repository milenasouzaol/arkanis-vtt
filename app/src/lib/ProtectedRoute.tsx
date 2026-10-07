import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { guardarDestino } from './convitePendente'
import AguardandoAprovacao from '../pages/AguardandoAprovacao'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading, acesso } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!session) {
    // Quem abriu um convite sem estar logado volta pra ele depois de entrar ou criar a conta.
    if (location.pathname.startsWith('/campanha/entrar/')) guardarDestino(location.pathname)
    return <Navigate to="/login" replace />
  }
  if (acesso.carregando) return null
  // Conta ainda não aprovada pela administradora: só a tela de espera (o banco também bloqueia).
  if (!acesso.admin && acesso.status !== 'aprovado') {
    if (location.pathname.startsWith('/campanha/entrar/')) guardarDestino(location.pathname)
    return <AguardandoAprovacao status={acesso.status} />
  }

  return <>{children}</>
}
