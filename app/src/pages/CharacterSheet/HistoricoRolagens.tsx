import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import { RollCard, type RollCardDie } from './RollResult'
import type { CharacterRecord } from './index'

type RollRow = {
  id: string
  character_id: string
  character_name: string | null
  user_id: string
  label: string
  total: number
  detail: string
  dice: RollCardDie[] | null
  bonus: number
  nota: string | null
  sem_rolagem: boolean
  created_at: string
  characters: { avatar_url: string | null; dice_tray: string | null } | { avatar_url: string | null; dice_tray: string | null }[] | null
}

function formatTimestamp(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${date} ${time}`
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name
}

function characterOf(r: RollRow): { avatar_url: string | null; dice_tray: string | null } | null {
  const c = r.characters
  if (!c) return null
  return Array.isArray(c) ? c[0] ?? null : c
}

function HistoryEntry({ row, playerName }: { row: RollRow; playerName: string }) {
  const c = characterOf(row)
  const avatar = c?.avatar_url ?? null
  const dice = row.dice ?? []

  return (
    <div className="historico-entry">
      <p className="historico-timestamp">{formatTimestamp(row.created_at)}</p>
      <div className="historico-who">
        <div className="historico-avatar">
          {avatar ? <img src={avatar} alt="" /> : <span className="historico-avatar-fallback" />}
        </div>
        <p className="historico-names">
          <span className="historico-charname">{row.character_name ?? '?'}</span>
          <span className="historico-playername">({playerName})</span>
        </p>
      </div>

      {dice.length > 0 ? (
        <RollCard
          inline
          title={row.character_name ?? '?'}
          subtitle={row.label}
          total={row.total}
          dice={dice}
          bonus={row.bonus}
          background={c?.dice_tray && c.dice_tray !== 'padrao' ? c.dice_tray : undefined}
        />
      ) : (
        <p className="historico-detail-fallback">{row.sem_rolagem ? row.label : `${row.label}: ${row.total} (${row.detail})`}</p>
      )}
      {row.nota && <p className="historico-nota">{row.nota}</p>}
    </div>
  )
}

export default function HistoricoRolagens({ character, onClose }: { character: CharacterRecord; onClose: () => void }) {
  const { session } = useAuth()
  const [rows, setRows] = useState<RollRow[] | null>(null)
  const [names, setNames] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!session) return

    function fetchRows() {
      let query = supabase
        .from('character_rolls')
        .select('id, character_id, character_name, user_id, label, total, detail, dice, bonus, nota, sem_rolagem, created_at, characters(avatar_url, dice_tray)')
        .order('created_at', { ascending: false })
        .limit(50)

      query = character.campaign_id
        ? query.or(`user_id.eq.${session!.user.id},campaign_id.eq.${character.campaign_id}`)
        : query.eq('user_id', session!.user.id)

      query.then(async ({ data }) => {
        setRows((data as unknown as RollRow[]) ?? [])
        const userIds = [...new Set((data ?? []).map((r) => r.user_id))]
        if (userIds.length) {
          const { data: profiles } = await supabase.from('profiles').select('id, display_name').in('id', userIds)
          setNames(Object.fromEntries((profiles ?? []).map((p) => [p.id, p.display_name ?? 'Sem nome'])))
        }
      })
    }

    fetchRows()
    window.addEventListener('vtt-roll-recorded', fetchRows)

    const channel = supabase
      .channel(`character_rolls-${character.campaign_id ?? session.user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'character_rolls' }, fetchRows)
      .subscribe()

    return () => {
      window.removeEventListener('vtt-roll-recorded', fetchRows)
      supabase.removeChannel(channel)
    }
  }, [session, character.campaign_id])

  return createPortal(
    <aside className="historico-panel" role="dialog" aria-label="Histórico de Rolagens">
      <header className="historico-header">
        <h2>Histórico de rolagens</h2>
        <button type="button" className="historico-close" onClick={onClose} aria-label="Fechar">×</button>
      </header>

      <div className="historico-list">
        {rows === null && <p className="historico-empty">Carregando…</p>}
        {rows?.length === 0 && <p className="historico-empty">Nenhuma rolagem ainda.</p>}
        {rows?.map((r) => (
          <HistoryEntry key={r.id} row={r} playerName={firstName(names[r.user_id] ?? '…')} />
        ))}
      </div>
    </aside>,
    document.body,
  )
}
