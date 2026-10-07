import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

// Acesso ao site (pedido da Millie, 07/10): conta nova fica "pendente" até a administradora
// aprovar. O banco já bloqueia tudo pra quem não foi aprovado; aqui é só pra mostrar a tela certa.
export type StatusAcesso = 'pendente' | 'aprovado' | 'recusado' | 'bloqueado'

type AuthContextValue = {
  session: Session | null
  loading: boolean
  acesso: { status: StatusAcesso | null; admin: boolean; carregando: boolean }
}

const SEM_ACESSO = { status: null, admin: false, carregando: false }

const AuthContext = createContext<AuthContextValue>({ session: null, loading: true, acesso: SEM_ACESSO })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [acesso, setAcesso] = useState<AuthContextValue['acesso']>({ ...SEM_ACESSO, carregando: true })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  // Situação do acesso de quem entrou, ao vivo (a aprovação chega sem precisar recarregar).
  const userId = session?.user.id
  useEffect(() => {
    if (!userId) {
      setAcesso(SEM_ACESSO)
      return
    }
    let vivo = true
    setAcesso((a) => ({ ...a, carregando: true }))
    Promise.all([
      supabase.from('acesso_usuarios').select('status').eq('user_id', userId).maybeSingle(),
      supabase.from('acesso_admins').select('user_id').eq('user_id', userId).maybeSingle(),
    ]).then(([{ data: a }, { data: adm }]) => {
      if (vivo) setAcesso({ status: (a?.status as StatusAcesso | undefined) ?? 'pendente', admin: !!adm, carregando: false })
    })
    const canal = supabase
      .channel(`acesso:${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'acesso_usuarios', filter: `user_id=eq.${userId}` }, (p) => {
        setAcesso((x) => ({ ...x, status: (p.new as { status: StatusAcesso }).status }))
      })
      .subscribe()
    return () => {
      vivo = false
      supabase.removeChannel(canal)
    }
  }, [userId])

  return <AuthContext.Provider value={{ session, loading, acesso }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
