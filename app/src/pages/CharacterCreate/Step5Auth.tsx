import { recortarImagem } from '../../components/RecortarImagem'
import { nomeSeguro } from '../../lib/nomeDeArquivo'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import type { Attributes, CharacterDraft, OptionalRules } from './types'
import CreationLetterhead from './CreationLetterhead'
import stepArrow from '../../assets/criacao/step-arrow.svg'
import papelTextura from '../../assets/criacao/papel-textura.png'
import atributosDiagrama from '../../assets/criacao/atributos-diagrama.svg'

const NEX_OPTIONS = [...Array.from({ length: 19 }, (_, i) => (i + 1) * 5), 99]

const RULES: { key: keyof OptionalRules; label: string }[] = [
  { key: 'nex_experiencia', label: 'NEX & Experiência' },
  { key: 'contagem_municao', label: 'Contagem de Munição' },
  { key: 'sem_sanidade', label: 'Jogando sem Sanidade' },
  { key: 'evolucao_patente', label: 'Evolução por Patente' },
]

const NODES: { key: keyof Attributes; top: string; left: string }[] = [
  { key: 'agilidade', top: '18.2%', left: '47.9%' },
  { key: 'intelecto', top: '42.3%', left: '72.45%' },
  { key: 'vigor', top: '81%', left: '62.5%' },
  { key: 'presenca', top: '81%', left: '33.3%' },
  { key: 'forca', top: '42.6%', left: '23.6%' },
]

export default function Step5Auth({
  draft,
  onChange,
  onBack,
  onFinish,
  finishing,
}: {
  draft: CharacterDraft
  onChange: (patch: Partial<CharacterDraft>) => void
  onBack: () => void
  onFinish: () => void
  finishing: boolean
}) {
  const { session } = useAuth()
  const [originName, setOriginName] = useState<string | null>(null)
  const [className, setClassName] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [signature, setSignature] = useState('')
  const signingRef = useRef(false)
  const paperStyle = { backgroundImage: `url(${papelTextura})` }

  useEffect(() => {
    if (draft.customOrigin) {
      setOriginName(draft.customOrigin.name)
      return
    }
    if (!draft.originId) {
      setOriginName(null)
      return
    }
    supabase.from('origins').select('name').eq('id', draft.originId).single().then(({ data }) => setOriginName(data?.name ?? null))
  }, [draft.originId, draft.customOrigin])

  useEffect(() => {
    if (draft.customClass) {
      setClassName(draft.customClass.name)
      return
    }
    if (!draft.classId) {
      setClassName(null)
      return
    }
    supabase.from('classes').select('name').eq('id', draft.classId).single().then(({ data }) => setClassName(data?.name ?? null))
  }, [draft.classId, draft.customClass])

  const canFinish = Boolean(draft.name.trim())

  function toggleRule(key: keyof OptionalRules) {
    onChange({ optionalRules: { ...draft.optionalRules, [key]: !draft.optionalRules[key] } })
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const escolhido = e.target.files?.[0]
    e.target.value = ''
    // Recorte (pedido da Millie, 08/10): a pessoa enquadra a parte que quer ou usa a inteira.
    const file = escolhido ? await recortarImagem(escolhido, { proporcao: 'quadrado', titulo: 'Foto do personagem' }) : null
    if (!file || !session) return
    setUploadError(null)
    try {
      const path = `${session.user.id}/${Date.now()}-${nomeSeguro(file.name)}`
      const { error } = await supabase.storage.from('character_photos').upload(path, file, { upsert: true })
      if (error) throw error
      onChange({ photoUrl: supabase.storage.from('character_photos').getPublicUrl(path).data.publicUrl })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erro ao enviar foto')
    }
  }

  function handleSign() {
    if (signingRef.current || finishing || !canFinish) return
    signingRef.current = true
    const name = draft.name
    let i = 0
    const interval = setInterval(() => {
      i += 1
      setSignature(name.slice(0, i))
      if (i >= name.length) {
        clearInterval(interval)
        setTimeout(onFinish, 400)
      }
    }, 90)
  }

  return (
    <div className="creation-spread">
      <div className="creation-paper-slot">
        <div className="creation-paper-shadow" style={paperStyle} />
        <div className="creation-paper creation-paper-tilt-l" style={paperStyle}>
          <CreationLetterhead docNumber={draft.docNumber} />

          <div className="creation-section-title">Regras opcionais</div>
          <div className="auth-rules-grid">
            {RULES.map(({ key, label }) => (
              <label key={key} className="auth-checkbox">
                <input type="checkbox" checked={draft.optionalRules[key]} onChange={() => toggleRule(key)} />
                <span className="auth-checkbox-box">{draft.optionalRules[key] && '✓'}</span>
                {label}
              </label>
            ))}
          </div>

          <div className="creation-section-title">Sobre o agente</div>

          <label className="auth-textarea-block">
            Aparência
            <textarea value={draft.appearance} onChange={(e) => onChange({ appearance: e.target.value })} placeholder="Escreva aqui." />
          </label>
          <label className="auth-textarea-block">
            Personalidade
            <textarea value={draft.personality} onChange={(e) => onChange({ personality: e.target.value })} placeholder="Escreva aqui." />
          </label>
          <label className="auth-textarea-block">
            Histórico
            <textarea value={draft.history} onChange={(e) => onChange({ history: e.target.value })} placeholder="Escreva aqui." />
          </label>
          <label className="auth-textarea-block">
            Objetivo
            <textarea value={draft.objective} onChange={(e) => onChange({ objective: e.target.value })} placeholder="Escreva aqui." />
          </label>
        </div>
      </div>

      <div className="creation-paper-slot">
        <div className="creation-paper-shadow" style={paperStyle} />
        <div className="creation-paper creation-paper-tilt-r" style={paperStyle}>
          <CreationLetterhead docNumber={draft.docNumber} />

          <div className="auth-header-row">
            <label className="auth-photo-box">
              <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
              {draft.photoUrl ? <img src={draft.photoUrl} alt="" /> : <span>Sua foto aqui</span>}
            </label>

            <div className="auth-fields">
              <label className="auth-field">
                NEX: <select value={draft.nexPercent} onChange={(e) => onChange({ nexPercent: Number(e.target.value) })}>
                  <option value={0}>—</option>
                  {NEX_OPTIONS.map((n) => <option key={n} value={n}>{n}%</option>)}
                </select>
              </label>
              {draft.optionalRules.nex_experiencia && (
                <label className="auth-field">
                  Experiência: <select value={draft.experience ?? 0} onChange={(e) => onChange({ experience: Number(e.target.value) })}>
                    {Array.from({ length: 21 }, (_, i) => i).map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
              )}
              <label className="auth-field">
                Nome: <input value={draft.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Seu nome aqui." />
              </label>
              <div className="auth-field">Origem: <span className="auth-field-readonly">{originName || 'Sua origem aqui.'}</span></div>
              <div className="auth-field">Classe: <span className="auth-field-readonly">{className || 'Sua classe aqui.'}</span></div>
            </div>
          </div>

          {uploadError && <p role="alert" className="creation-error">{uploadError}</p>}

          <div className="creation-section-title">Seus atributos</div>

          <div className="attr-radar attr-radar-readonly">
            <img className="attr-radar-img" src={atributosDiagrama} alt="Diagrama de atributos" />
            {NODES.map((node) => (
              <span key={node.key} className="attr-radar-value" style={{ top: node.top, left: node.left }}>
                {draft.attributes[node.key]}
              </span>
            ))}
          </div>

          <button type="button" className="auth-sign-box" onClick={handleSign} disabled={!canFinish || finishing}>
            {signature || (finishing ? 'Salvando…' : 'Assine aqui para finalizar')}
          </button>
        </div>
      </div>

      <button type="button" className="creation-back-arrow" onClick={onBack} aria-label="Voltar">
        <img src={stepArrow} alt="" />
      </button>
    </div>
  )
}
