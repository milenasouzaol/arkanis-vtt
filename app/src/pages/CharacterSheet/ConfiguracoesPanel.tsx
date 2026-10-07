import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { CharacterRecord } from './index'
import DiceTrayModal from './DiceTrayModal'
import FrameModal from './FrameModal'
import sangueSimbolo from '../../assets/elementos/sangue-simbolo.png'
import morteSimbolo from '../../assets/elementos/morte-simbolo.png'
import conhecimentoSimbolo from '../../assets/elementos/conhecimento-simbolo.png'
import energiaSimbolo from '../../assets/elementos/energia-simbolo.png'
import { efeitosMudos, lerVolumes, salvarEfeitosMudos, salvarVolume } from '../Mesa/volumesDoUsuario'
import medoSimbolo from '../../assets/elementos/medo-simbolo.png'

const RULES: { key: string; label: string; locked?: boolean }[] = [
  { key: 'nex_experiencia', label: 'NEX & Experiência' },
  { key: 'evolucao_patente', label: 'Evolução por Patentes', locked: true },
  { key: 'sem_sanidade', label: 'Jogando sem Sanidade' },
  { key: 'contagem_municao', label: 'Contagem de Munição' },
]

const ELEMENTOS: { key: string | null; label: string; color: string; icon?: string }[] = [
  { key: null, label: 'Nenhum', color: '#1a1a1a' },
  { key: 'sangue', label: 'Sangue', color: '#7a1421', icon: sangueSimbolo },
  { key: 'morte', label: 'Morte', color: '#0a0a0a', icon: morteSimbolo },
  { key: 'energia', label: 'Energia', color: '#5a3a7a', icon: energiaSimbolo },
  { key: 'conhecimento', label: 'Conhecimento', color: '#b8860b', icon: conhecimentoSimbolo },
  { key: 'medo', label: 'Medo', color: '#e6e6e6', icon: medoSimbolo },
]

const CONFIG_TABS = ['Aparência', 'Mecânicas', 'Preferências'] as const

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" className={`settings-toggle${checked ? ' on' : ''}`} onClick={onChange} role="switch" aria-checked={checked}>
      <span className="settings-toggle-knob">{checked ? '✓' : '×'}</span>
    </button>
  )
}

function TrayPreview({ tray }: { tray: string }) {
  if (tray === 'padrao') return <p className="settings-picker-value">Padrão</p>
  return <div className="settings-picker-preview" style={{ backgroundImage: `url(${tray})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
}

export default function ConfiguracoesPanel({
  character,
  onUpdated,
  onClose,
}: {
  character: CharacterRecord
  onUpdated: () => void
  onClose: () => void
}) {
  const [configTab, setConfigTab] = useState<(typeof CONFIG_TABS)[number]>('Aparência')
  // Mesmo volume dos Efeitos Sonoros da mesa (antes salvava num lugar que nenhum som lia).
  const [volume, setVolume] = useState(() => Math.round(lerVolumes().efeitos * 100))
  const [muted, setMuted] = useState(efeitosMudos)
  const [bgAnimated, setBgAnimated] = useState(true)
  const [showTrayModal, setShowTrayModal] = useState(false)
  const [showFrameModal, setShowFrameModal] = useState(false)

  useEffect(() => {
    setBgAnimated(localStorage.getItem('vtt_bg_animated') !== 'false')
  }, [])

  async function updateField(patch: Partial<CharacterRecord>) {
    await supabase.from('characters').update(patch).eq('id', character.id)
    onUpdated()
  }

  function toggleRule(key: string) {
    updateField({ optional_rules: { ...character.optional_rules, [key]: !character.optional_rules[key] } })
  }

  function setVolumeAndStore(v: number) {
    setVolume(v)
    salvarVolume('efeitos', v / 100)
  }

  function toggleMuted() {
    const next = !muted
    setMuted(next)
    salvarEfeitosMudos(next)
  }

  function toggleBgAnimated() {
    const next = !bgAnimated
    setBgAnimated(next)
    localStorage.setItem('vtt_bg_animated', String(next))
    window.dispatchEvent(new Event('vtt-bg-animated-change'))
  }

  return createPortal(
    <aside role="dialog" aria-label="Configurações" className="settings-panel">
      <header className="settings-header">
        <h2>Configurações</h2>
        <button type="button" className="settings-close" onClick={onClose} aria-label="Fechar">×</button>
      </header>

      <nav className="settings-tabs">
        {CONFIG_TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`settings-tab${configTab === t ? ' active' : ''}`}
            onClick={() => setConfigTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="settings-body">
        {configTab === 'Aparência' && (
          <section>
            <h3 className="settings-section-title">Editar aparência</h3>

            <p className="settings-label">Elemento em destaque</p>
            <div className="settings-elemento-row">
              {ELEMENTOS.map((e) => (
                <button
                  key={e.label}
                  type="button"
                  className={`settings-elemento-swatch${character.afinidade_elemento === e.key ? ' active' : ''}`}
                  style={{ background: e.color }}
                  onClick={() => updateField({ afinidade_elemento: e.key })}
                  aria-label={e.label}
                  title={e.label}
                >
                  {e.key === null ? '×' : (
                    <img src={e.icon} alt="" className="settings-elemento-icon" style={e.key === 'medo' ? { filter: 'invert(1)' } : undefined} />
                  )}
                </button>
              ))}
            </div>

            <div className="settings-row">
              <Toggle checked={bgAnimated} onChange={toggleBgAnimated} />
              <span>Fundo animado</span>
            </div>

            <p className="settings-label settings-label-block">Bandeja de dados</p>
            <div className="settings-picker">
              <TrayPreview tray={character.dice_tray} />
              <button type="button" className="settings-picker-btn" onClick={() => setShowTrayModal(true)}>Mudar Bandeja</button>
            </div>

            {showTrayModal && (
              <DiceTrayModal
                currentTray={character.dice_tray}
                onClose={() => setShowTrayModal(false)}
                onSave={(tray) => { updateField({ dice_tray: tray }); setShowTrayModal(false) }}
              />
            )}

            <p className="settings-label settings-label-block">Moldura</p>
            <div className="settings-picker">
              {character.avatar_frame ? (
                <div className="settings-picker-preview" style={{ backgroundImage: `url(${character.avatar_frame})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              ) : (
                <p className="settings-picker-value">Sem moldura</p>
              )}
              <button type="button" className="settings-picker-btn" onClick={() => setShowFrameModal(true)}>Mudar Moldura</button>
            </div>

            {showFrameModal && (
              <FrameModal
                currentFrame={character.avatar_frame}
                onClose={() => setShowFrameModal(false)}
                onSave={(frame) => { updateField({ avatar_frame: frame }); setShowFrameModal(false) }}
              />
            )}
          </section>
        )}

        {configTab === 'Mecânicas' && (
          <section>
            <h3 className="settings-section-title">Regras Opcionais</h3>
            {RULES.map(({ key, label, locked }) => (
              <div key={key} className={`settings-row${locked ? ' settings-row-sub' : ''}`}>
                <Toggle checked={Boolean(character.optional_rules[key])} onChange={() => toggleRule(key)} />
                <span>{label}</span>
                {locked && <span className="settings-lock">🔒</span>}
              </div>
            ))}

            {character.optional_rules.evolucao_patente && (
              <div className="settings-subsection">
                <p>Patente ajustável na aba Agente.</p>
                <label className="settings-label-block">
                  Pontos de Prestígio
                  <input
                    type="number"
                    className="settings-input"
                    value={character.prestigio}
                    onChange={(e) => updateField({ prestigio: Number(e.target.value) })}
                  />
                </label>
              </div>
            )}
          </section>
        )}

        {configTab === 'Preferências' && (
          <section>
            <h3 className="settings-section-title">Opções de privacidade</h3>
            <div className="settings-row">
              <Toggle checked={character.editable_by_others} onChange={() => updateField({ editable_by_others: !character.editable_by_others })} />
              <span>Editável por outros jogadores</span>
            </div>
            <div className="settings-row">
              <Toggle checked={character.hidden_from_others} onChange={() => updateField({ hidden_from_others: !character.hidden_from_others })} />
              <span>Oculta para outros jogadores</span>
            </div>

            <h3 className="settings-section-title settings-section-title-spaced">Opções de som</h3>
            <p className="settings-label">Volume</p>
            <div className="settings-volume-row">
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                disabled={muted}
                onChange={(e) => setVolumeAndStore(Number(e.target.value))}
                className="settings-slider"
              />
              <span className="settings-volume-value">{volume}</span>
            </div>
            <div className="settings-row">
              <Toggle checked={muted} onChange={toggleMuted} />
              <span>Desligar sons</span>
            </div>

            <h3 className="settings-section-title settings-section-title-spaced">Navegação</h3>
            <div className="settings-nav-links">
              <Link to="/perfil">Perfil</Link>
              <Link to="/jogar">Jogar</Link>
            </div>
          </section>
        )}
      </div>
    </aside>,
    document.body,
  )
}
