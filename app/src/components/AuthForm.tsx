import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Provider } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { destinoDepoisDoConvite } from '../lib/convitePendente'
import arkanisLogo from '../assets/icons/arkanis-logo.png'

export default function AuthForm({
  initialMode = 'login',
  onDone,
}: {
  initialMode?: 'login' | 'signup'
  onDone?: () => void
}) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleOAuth(provider: Provider) {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${destinoDepoisDoConvite('/jogar')}` },
    })
    if (error) setError(error.message)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setSubmitting(false)
      if (error) {
        setError(error.message)
        return
      }
      onDone?.()
      navigate(destinoDepoisDoConvite('/jogar'))
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      setSubmitting(false)
      if (error) {
        setError(error.message)
        return
      }
      setMessage('Cadastro criado! Confirma seu e-mail antes de fazer login.')
    }
  }

  return (
    <div className="auth-form">
      <img className="auth-form-logo" src={arkanisLogo} alt="Arkanis" />
      <h2>{mode === 'login' ? 'Entrar' : 'Criar conta'}</h2>

      <form onSubmit={handleSubmit}>
        <label className="editperfil-field">
          E-mail
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="editperfil-field">
          Senha
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {error && <p role="alert" className="auth-form-alert">{error}</p>}
        {message && <p role="status" className="auth-form-alert">{message}</p>}

        <button type="submit" className="btn-pill auth-form-submit" disabled={submitting}>
          {mode === 'login' ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>

      <button type="button" className="auth-form-toggle" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
      </button>

      <div className="auth-form-oauth">
        <p>ou continue com</p>
        <div className="character-list-actions">
          <button type="button" className="btn-pill btn-pill-neutral" onClick={() => handleOAuth('google')}>Google</button>
          <button type="button" className="btn-pill btn-pill-neutral" onClick={() => handleOAuth('discord')}>Discord</button>
        </div>
      </div>
    </div>
  )
}
