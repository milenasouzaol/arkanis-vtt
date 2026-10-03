import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { fallbackAvatarColor } from '../lib/color'
import arkanisLogo from '../assets/icons/arkanis-logo.png'

type CharacterOption = {
  id: string
  name: string | null
  avatar_url: string | null
}

export default function EntrarCampanha() {
  const { code } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [campaignName, setCampaignName] = useState<string | null>(null)
  const [characters, setCharacters] = useState<CharacterOption[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!session || !code) return
    supabase.rpc('join_campaign_by_code', { p_invite_code: code }).then(async ({ data, error: joinError }) => {
      if (joinError) {
        setError(joinError.message)
        setLoading(false)
        return
      }
      setCampaignId(data)
      const [{ data: campaign }, { data: chars }] = await Promise.all([
        supabase.from('campaigns').select('name').eq('id', data).single(),
        supabase.from('characters').select('id, name, avatar_url').eq('user_id', session.user.id),
      ])
      setCampaignName(campaign?.name ?? null)
      setCharacters(chars ?? [])
      setLoading(false)
    })
  }, [session, code])

  async function handleConfirm() {
    if (!selected || !campaignId) return
    setSaving(true)
    await supabase.from('characters').update({ campaign_id: campaignId }).eq('id', selected)
    navigate(`/mesa/${campaignId}`)
  }

  if (loading) {
    return (
      <main className="page-shell font-ashigea">
        <p>Entrando na campanha…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="page-shell font-ashigea">
        <h1>Não deu pra entrar</h1>
        <p role="alert">{error}</p>
      </main>
    )
  }

  return (
    <main className="page-shell font-ashigea">
      <h1>Você entrou em {campaignName ?? 'uma campanha'}!</h1>
      <p className="character-list-desc">Escolha qual personagem vai levar pra essa campanha.</p>

      {characters.length === 0 ? (
        <p>Você ainda não tem nenhum personagem. Crie um primeiro pra poder entrar na campanha.</p>
      ) : (
        <div className="character-tile-grid">
          {characters.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`character-tile character-tile-selectable${selected === c.id ? ' selected' : ''}`}
              style={c.avatar_url ? { backgroundImage: `url(${c.avatar_url})` } : { backgroundColor: fallbackAvatarColor(c.id) }}
              onClick={() => setSelected(c.id)}
            >
              {!c.avatar_url && <img className="character-tile-watermark" src={arkanisLogo} alt="" />}
              <div className="character-tile-info">
                <strong>{c.name || 'Sem nome'}</strong>
                <span>Ordem Paranormal</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <button type="button" className="btn-pill" style={{ marginTop: '1.4em' }} disabled={!selected || saving} onClick={handleConfirm}>
        {saving ? 'Entrando...' : 'Confirmar'}
      </button>
    </main>
  )
}
