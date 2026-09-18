import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CharacterRecord } from './index'
import semPatenteIcon from '../../assets/inventario/sem-patente.svg'
import recrutaIcon from '../../assets/inventario/recruta.svg'
import operadorIcon from '../../assets/inventario/operador.svg'
import agenteEspecialIcon from '../../assets/inventario/agente-especial.svg'
import oficialIcon from '../../assets/inventario/oficial-de-operacoes.svg'
import agenteEliteIcon from '../../assets/inventario/agente-de-elite.svg'

// Cada patente libera um limite de itens por categoria (I a IV). "Sem Patente" nao e
// uma patente do livro, e o estado de quem ainda nao tem nenhuma - so o item de
// categoria I ja garantido.
export type PatenteKey = 'sem_patente' | 'recruta' | 'operador' | 'agente_especial' | 'oficial_de_operacoes' | 'agente_de_elite'

export const PATENTES: { key: PatenteKey; label: string; icon: string; limites: [number, number, number, number] }[] = [
  { key: 'sem_patente', label: 'Sem Patente', icon: semPatenteIcon, limites: [1, 0, 0, 0] },
  { key: 'recruta', label: 'Recruta', icon: recrutaIcon, limites: [2, 1, 0, 0] },
  { key: 'operador', label: 'Operador', icon: operadorIcon, limites: [3, 2, 1, 0] },
  { key: 'agente_especial', label: 'Agente Especial', icon: agenteEspecialIcon, limites: [4, 3, 2, 1] },
  { key: 'oficial_de_operacoes', label: 'Oficial de Operações', icon: oficialIcon, limites: [5, 4, 3, 2] },
  { key: 'agente_de_elite', label: 'Agente de Elite', icon: agenteEliteIcon, limites: [6, 5, 4, 3] },
]

const CATEGORIAS = ['I', 'II', 'III', 'IV'] as const

export function patenteOf(value: string | null | undefined) {
  return PATENTES.find((p) => p.key === value) ?? PATENTES[0]
}

// Poderes que dao proficiencia sempre escrevem "proficiencia com <coisa>" na descricao
// (Armamento Pesado, Protecao Pesada, Balistica Avancada, Ninja Urbano, Mira de Elite...).
// Em vez de manter uma lista fixa de poderes, a gente le isso do texto - assim poder novo
// de livro ou homebrew ja entra sozinho. O trecho termina no ponto, no ponto-e-virgula ou
// num "e +2 em dano" da vida, que ja e outro beneficio do mesmo poder.
const PROFICIENCIA_RE = /profici[êe]ncia com ((?:[^.;])+?)(?=\s+e\s+[+-]|\s*[.;]|$)/gi

export function proficienciasDeTexto(descricoes: string[]) {
  const achadas: string[] = []
  for (const descricao of descricoes) {
    for (const m of descricao.matchAll(PROFICIENCIA_RE)) {
      const trecho = m[1].trim()
      if (trecho) achadas.push(trecho)
    }
  }
  return achadas
}

// "a, b e c." - do jeito que o texto da classe ja vem escrito. O texto da classe entra
// aqui inteiro ("Armas simples, armas taticas e protecoes leves"), entao ele e quebrado
// de volta em itens pra tudo sair numa lista so, em vez de "... e X, Y e Z".
export function juntarProficiencias(partes: string[]) {
  const limpas: string[] = []
  for (const parte of partes.flatMap((p) => p.split(/,\s*|\s+e\s+/i))) {
    const normal = parte.trim().replace(/\.$/, '').toLowerCase()
    if (!normal) continue
    if (limpas.some((j) => j === normal)) continue
    limpas.push(normal)
  }
  if (!limpas.length) return ''
  const texto = limpas.length === 1 ? limpas[0] : `${limpas.slice(0, -1).join(', ')} e ${limpas[limpas.length - 1]}`
  return `${texto.charAt(0).toUpperCase()}${texto.slice(1)}.`
}

export default function InventarioTopBox({
  character,
  atualPorCategoria,
  cargaAtual,
}: {
  character: CharacterRecord
  atualPorCategoria: [number, number, number, number]
  cargaAtual: number
}) {
  const [patente, setPatente] = useState<PatenteKey>((character.patente as PatenteKey) ?? 'sem_patente')
  const [prestigio, setPrestigio] = useState(String(character.prestigio ?? 0))
  const [pickerOpen, setPickerOpen] = useState(false)
  const [painel, setPainel] = useState<'limite' | 'proficiencias'>('limite')
  const [proficiencias, setProficiencias] = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPatente((character.patente as PatenteKey) ?? 'sem_patente')
    setPrestigio(String(character.prestigio ?? 0))
  }, [character.id, character.patente, character.prestigio])

  useEffect(() => {
    if (!pickerOpen) return
    function onDown(e: MouseEvent) {
      if (!pickerRef.current?.contains(e.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [pickerOpen])

  // A proficiencia e a da classe mais o que os poderes da ficha derem por cima.
  useEffect(() => {
    let cancelado = false

    async function carregar() {
      let daClasse = character.custom_class?.proficienciesText ?? ''
      if (!daClasse && character.class_id) {
        const { data } = await supabase.from('classes').select('proficiencies_text').eq('id', character.class_id).single()
        daClasse = data?.proficiencies_text ?? ''
      }

      const { data: habilidades } = await supabase
        .from('character_abilities')
        .select('custom_ability, class_powers(description), paranormal_powers(description), general_powers(description), origins(power_description), class_track_tiers(description)')
        .eq('character_id', character.id)

      const descricoes = (habilidades ?? []).map((row: any) =>
        row.custom_ability?.description
        ?? row.class_powers?.description
        ?? row.paranormal_powers?.description
        ?? row.general_powers?.description
        ?? row.origins?.power_description
        ?? row.class_track_tiers?.description
        ?? '',
      )

      const dosPoderes = proficienciasDeTexto(descricoes).filter(
        (extra) => !daClasse.toLowerCase().includes(extra.toLowerCase()),
      )

      if (!cancelado) setProficiencias(juntarProficiencias([daClasse, ...dosPoderes]))
    }

    carregar()
    return () => { cancelado = true }
  }, [character.id, character.class_id, character.custom_class])

  async function escolherPatente(key: PatenteKey) {
    setPatente(key)
    setPickerOpen(false)
    await supabase.from('characters').update({ patente: key }).eq('id', character.id)
  }

  async function salvarPrestigio(raw: string) {
    const valor = Number(raw)
    if (!Number.isFinite(valor)) return
    await supabase.from('characters').update({ prestigio: valor }).eq('id', character.id)
  }

  const atual = patenteOf(patente)
  // Carga maxima nao vem da patente, vem de Forca: 5 espacos por ponto, minimo 2.
  const forca = character.attributes?.forca ?? 0
  const cargaMaxima = Math.max(2, forca * 5)

  return (
    <div className="inv-top-frame">
      <div className="inv-top-box">
        <div className="inv-patente-col" ref={pickerRef}>
          <img className="inv-patente-icon" src={atual.icon} alt={atual.label} />

          <button type="button" className="inv-patente-btn" onClick={() => setPickerOpen((v) => !v)}>
            {atual.label}
          </button>

          {pickerOpen && (
            <div className="inv-patente-picker">
              {PATENTES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={p.key === patente ? 'selected' : ''}
                  onClick={() => escolherPatente(p.key)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          <div className="inv-prestigio-row">
            <span className="inv-prestigio-label">Prestígio</span>
            <input
              className="inv-prestigio-input"
              type="number"
              value={prestigio}
              onChange={(e) => setPrestigio(e.target.value)}
              onBlur={(e) => salvarPrestigio(e.target.value)}
            />
          </div>
        </div>

        <div className="inv-limite-col">
          <div className="inv-limite-tabs">
            <button
              type="button"
              className={painel === 'limite' ? 'active' : ''}
              onClick={() => setPainel('limite')}
            >
              Limite de Itens
            </button>
            <button
              type="button"
              className={painel === 'proficiencias' ? 'active' : ''}
              onClick={() => setPainel('proficiencias')}
            >
              Proficiências
            </button>
          </div>

          {painel === 'limite' ? (
            <div className="inv-limite-grid">
              <span className="inv-limite-rowlabel">Categoria</span>
              {CATEGORIAS.map((c) => (
                <span key={c} className="inv-limite-cat">{c}</span>
              ))}

              <span className="inv-limite-rowlabel">Atual</span>
              {CATEGORIAS.map((c, i) => (
                <span key={c} className="inv-limite-num">{atualPorCategoria[i]}</span>
              ))}

              <span className="inv-limite-rowlabel">Máximo</span>
              {CATEGORIAS.map((c, i) => (
                <span key={c} className="inv-limite-num">{atual.limites[i]}</span>
              ))}
            </div>
          ) : (
            <div className="inv-proficiencias-box">{proficiencias || '—'}</div>
          )}
        </div>

        {/* Na referencia, em Proficiencias a caixa de texto vai ate a borda e a Carga some. */}
        {painel === 'limite' && (
          <>
            <div className="inv-carga-col">
              <span className="inv-carga-label">Carga</span>
              <span className="inv-carga-value">{cargaAtual}|{cargaMaxima}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
