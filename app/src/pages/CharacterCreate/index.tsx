import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { destinoDepoisDoConvite } from '../../lib/convitePendente'
import { useAuth } from '../../lib/AuthContext'
import { emptyDraft, type Attributes, type CharacterDraft } from './types'
import Step1Intro from './Step1Intro'
import Step2Attributes from './Step2Attributes'
import Step3Origin from './Step3Origin'
import Step4Class from './Step4Class'
import Step5Auth from './Step5Auth'
import creationBg from '../../assets/criacao/creation-background.png'

const STEP_NAMES = ['Introdução', 'Atributos', 'Origem', 'Classe', 'Autenticação']

function attrValue(attributes: Attributes, attr: string | null): number {
  if (!attr) return 0
  return (attributes as Record<string, number>)[attr] ?? 0
}

export default function CharacterCreate() {
  const { system } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<CharacterDraft>(emptyDraft)
  const [finishing, setFinishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function patch(p: Partial<CharacterDraft>) {
    setDraft((d) => ({ ...d, ...p }))
  }

  async function handleFinish() {
    if (!session) return
    setFinishing(true)
    setError(null)

    let derived = { pv: 0, pe: 0, sanity: 0, pd: 0 }

    if (draft.classId) {
      const { data: cls } = await supabase.from('classes').select('*').eq('id', draft.classId).single()
      if (cls) {
        derived = {
          pv: (cls.pv_initial ?? 0) + attrValue(draft.attributes, cls.pv_initial_attr),
          pe: (cls.pe_initial ?? 0) + attrValue(draft.attributes, cls.pe_initial_attr),
          sanity: cls.sanity_initial ?? 0,
          pd: (cls.pd_initial ?? 0) + attrValue(draft.attributes, cls.pd_initial_attr),
        }
      }
    } else if (draft.customClass) {
      derived = {
        pv: (draft.customClass.pvInitial ?? 0) + attrValue(draft.attributes, 'vigor'),
        pe: (draft.customClass.peInitial ?? 0) + attrValue(draft.attributes, 'presenca'),
        sanity: draft.customClass.sanityInitial ?? 0,
        pd: (draft.customClass.pdInitial ?? 0) + attrValue(draft.attributes, 'presenca'),
      }
    }

    const { data: character, error: insertError } = await supabase
      .from('characters')
      .insert({
        user_id: session.user.id,
        system: 'ordem_paranormal',
        name: draft.name,
        doc_number: draft.docNumber,
        origin_id: draft.originId,
        custom_origin: draft.customOrigin
          ? { name: draft.customOrigin.name, skill1Id: draft.customOrigin.skill1Id, skill2Id: draft.customOrigin.skill2Id, powerName: draft.customOrigin.powerName, powerDescription: draft.customOrigin.powerDescription }
          : null,
        class_id: draft.classId,
        custom_class: draft.customClass ?? null,
        attributes: draft.attributes,
        nex_mode: draft.optionalRules.nex_experiencia ? 'nex_experiencia' : 'padrao',
        nex_percent: draft.nexPercent,
        experience: draft.optionalRules.nex_experiencia ? draft.experience : null,
        current_pv: derived.pv,
        current_sanity: derived.sanity,
        current_pe: derived.pe,
        current_pd: derived.pd,
        optional_rules: draft.optionalRules,
        avatar_url: draft.photoUrl,
        aparencia: draft.appearance,
        personalidade: draft.personality,
        historico: draft.history,
        objetivo: draft.objective,
      })
      .select('id')
      .single()

    if (insertError) {
      setFinishing(false)
      setError(insertError.message)
      return
    }

    const abilityRows: { character_id: string; class_power_id?: string; origin_power_of?: string }[] = []
    if (draft.originId) abilityRows.push({ character_id: character.id, origin_power_of: draft.originId })
    if (draft.classId) {
      const { data: baseAbilities } = await supabase.from('class_powers').select('id').eq('class_id', draft.classId).eq('is_base_ability', true)
      for (const power of baseAbilities ?? []) abilityRows.push({ character_id: character.id, class_power_id: power.id })
    }
    if (abilityRows.length) await supabase.from('character_abilities').insert(abilityRows)

    // Origem (pedido da Millie, 07/10): as duas perícias dela já vêm treinadas na ficha. Na origem
    // própria, as escolhidas e o poder que a pessoa escreveu.
    let periciasDaOrigem: (string | null)[] = []
    if (draft.originId) {
      const { data: origem } = await supabase.from('origins').select('skill_1_id, skill_2_id').eq('id', draft.originId).single()
      periciasDaOrigem = [origem?.skill_1_id ?? null, origem?.skill_2_id ?? null]
    } else if (draft.customOrigin) {
      periciasDaOrigem = [draft.customOrigin.skill1Id, draft.customOrigin.skill2Id]
      if (draft.customOrigin.powerName.trim()) {
        await supabase.from('character_abilities').insert({
          character_id: character.id,
          custom_ability: { name: draft.customOrigin.powerName.trim(), description: draft.customOrigin.powerDescription.trim(), hasElement: false },
        })
      }
    }
    const treinadas = [...new Set(periciasDaOrigem.filter((x): x is string => !!x))]
    if (treinadas.length) {
      await supabase.from('character_skills').upsert(treinadas.map((skill_id) => ({ character_id: character.id, skill_id, training: 'treinado' })))
    }

    setFinishing(false)
    // Quem veio de um convite volta pra ele pra levar o personagem novo pra campanha.
    navigate(destinoDepoisDoConvite(`/personagem/${character.id}`))
  }

  if (system !== 'ordem-paranormal') {
    return <main><p>Sistema ainda não implementado.</p></main>
  }

  return (
    <main className="creation-page">
      <div className="creation-page-bg" style={{ backgroundImage: `url(${creationBg})` }} />

      <nav className="creation-stepper">
        {STEP_NAMES.map((name, i) => (
          <span key={name} className="creation-stepper-item">
            <span className={`creation-stepper-pill${step === i + 1 ? ' active' : ''}`}>{name}</span>
            {i < STEP_NAMES.length - 1 && <span className="creation-stepper-line" />}
          </span>
        ))}
      </nav>

      {error && <p role="alert" className="creation-error">{error}</p>}

      {step === 1 && <Step1Intro draft={draft} onNext={() => setStep(2)} />}
      {step === 2 && (
        <Step2Attributes
          draft={draft}
          onChange={(attributes) => patch({ attributes })}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3Origin draft={draft} onChange={patch} onNext={() => setStep(4)} onBack={() => setStep(2)} />
      )}
      {step === 4 && (
        <Step4Class draft={draft} onChange={patch} onNext={() => setStep(5)} onBack={() => setStep(3)} />
      )}
      {step === 5 && (
        <Step5Auth draft={draft} onChange={patch} onBack={() => setStep(4)} onFinish={handleFinish} finishing={finishing} />
      )}
    </main>
  )
}
