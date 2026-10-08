import { nomeSeguro } from '../lib/nomeDeArquivo'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { hexToRgba } from '../lib/color'

export default function EditarPerfil() {
  const { session } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [bannerPositionY, setBannerPositionY] = useState(50)
  const [accentColor, setAccentColor] = useState('#eaeaea')
  const [backgroundColor, setBackgroundColor] = useState('#6a1f42')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const draggingRef = useRef(false)
  const bannerBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!session) return
    supabase
      .from('profiles')
      .select('display_name, description, avatar_url, banner_url, banner_position_y, accent_color, background_color')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name ?? '')
          setDescription(data.description ?? '')
          setAvatarUrl(data.avatar_url)
          setBannerUrl(data.banner_url)
          setBannerPositionY(data.banner_position_y ?? 50)
          setAccentColor(data.accent_color ?? '#eaeaea')
          setBackgroundColor(data.background_color ?? '#6a1f42')
        }
        setLoading(false)
      })
  }, [session])

  async function uploadTo(bucket: 'avatars' | 'banners', file: File): Promise<string> {
    const path = `${session!.user.id}/${Date.now()}-${nomeSeguro(file.name)}`
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (uploadError) throw uploadError
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !session) return
    try {
      setAvatarUrl(await uploadTo('avatars', file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar foto')
    }
  }

  async function handleBannerChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !session) return
    try {
      setBannerUrl(await uploadTo('banners', file))
      setBannerPositionY(50)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar banner')
    }
  }

  function handleBannerPointerDown() {
    draggingRef.current = true
  }

  function handleBannerPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current || !bannerBoxRef.current) return
    const rect = bannerBoxRef.current.getBoundingClientRect()
    const ratio = (e.clientY - rect.top) / rect.height
    setBannerPositionY(Math.min(100, Math.max(0, Math.round(ratio * 100))))
  }

  function handleBannerPointerUp() {
    draggingRef.current = false
  }

  async function handleSalvar() {
    if (!session) return
    setSaving(true)
    setError(null)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        description,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        banner_position_y: bannerPositionY,
        accent_color: accentColor,
        background_color: backgroundColor,
      })
      .eq('id', session.user.id)
    setSaving(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    navigate('/perfil')
  }

  if (loading) return null

  const tint = hexToRgba(backgroundColor, 0.45)

  return (
    <main className="page-shell font-ashigea" style={{ '--profile-tint': tint, '--vignette-color': backgroundColor } as React.CSSProperties}>
      <div className="profile-vignette" />

      <h1>Editar Perfil</h1>
      {error && <p role="alert">{error}</p>}

      <section className="editperfil-section">
        <h2>Informações</h2>
        <label className="editperfil-field">
          Nome de usuário
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </label>
        <label className="editperfil-field">
          Descrição
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </section>

      <section className="editperfil-section">
        <h2>Aparência</h2>

        <div className="editperfil-row">
          <p className="editperfil-row-label">Foto de Perfil</p>
          <div className="editperfil-row-content">
            <img className="editperfil-avatar-preview" src={avatarUrl ?? undefined} alt="" />
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            <button type="button" onClick={() => avatarInputRef.current?.click()}>Mudar foto</button>
          </div>
        </div>

        <div className="editperfil-row">
          <div>
            <p className="editperfil-row-label">Banner de Perfil</p>
            <p className="editperfil-hint">Segure e arraste dentro da prévia pra posicionar o banner.</p>
          </div>
          <div
            ref={bannerBoxRef}
            className="editperfil-banner-preview"
            onPointerDown={handleBannerPointerDown}
            onPointerMove={handleBannerPointerMove}
            onPointerUp={handleBannerPointerUp}
            onPointerLeave={handleBannerPointerUp}
          >
            {bannerUrl && (
              <img src={bannerUrl} alt="" draggable={false} style={{ objectPosition: `center ${bannerPositionY}%` }} />
            )}
            <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerChange} hidden />
            <button type="button" onClick={() => bannerInputRef.current?.click()}>Mudar Banner</button>
          </div>
        </div>
      </section>

      <section className="editperfil-section">
        <div className="editperfil-row">
          <div>
            <p className="editperfil-row-label">Cor de Destaque</p>
            <p className="editperfil-hint">Cor do seu nome no perfil.</p>
          </div>
          <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
        </div>

        <div className="editperfil-row">
          <div>
            <p className="editperfil-row-label">Cor de Fundo</p>
            <p className="editperfil-hint">Cor do fundo do seu perfil e das caixas da área de início.</p>
          </div>
          <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
        </div>
      </section>

      <button type="button" onClick={handleSalvar} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
    </main>
  )
}
