import CreationLetterhead from './CreationLetterhead'
import type { Attributes, CharacterDraft } from './types'
import stepArrow from '../../assets/criacao/step-arrow.svg'
import papelTextura from '../../assets/criacao/papel-textura.png'
import forcaIcon from '../../assets/criacao/forca-icon.png'
import agilidadeIcon from '../../assets/criacao/agilidade-icon.png'
import intelectoIcon from '../../assets/criacao/intelecto-icon.png'
import vigorIcon from '../../assets/criacao/vigor-icon.png'
import presencaIcon from '../../assets/criacao/presenca-icon.png'
import atributosDiagrama from '../../assets/criacao/atributos-diagrama.svg'

const NODES: { key: keyof Attributes; top: string; left: string }[] = [
  { key: 'agilidade', top: '20.2%', left: '47.9%' },
  { key: 'intelecto', top: '42.3%', left: '72.45%' },
  { key: 'vigor', top: '78.2%', left: '62.5%' },
  { key: 'presenca', top: '77.85%', left: '33.3%' },
  { key: 'forca', top: '42.6%', left: '23.6%' },
]

const ABOUT = [
  { abbr: 'FOR', name: 'Força', icon: forcaIcon, description: 'Determina sua potência muscular e habilidade atlética.' },
  { abbr: 'AGI', name: 'Agilidade', icon: agilidadeIcon, description: 'Define sua coordenação motora, velocidade de reação e destreza manual.' },
  { abbr: 'INT', name: 'Intelecto', icon: intelectoIcon, description: 'Mede seu raciocínio, memória e educação geral.' },
  { abbr: 'VIG', name: 'Vigor', icon: vigorIcon, description: 'Determina sua saúde e resistência física.' },
  { abbr: 'PRE', name: 'Presença', icon: presencaIcon, description: 'Define seus sentidos, força de vontade, habilidades sociais e concede pontos de esforço (PE) adicionais.' },
]

function computePool(attributes: Attributes) {
  const values = Object.values(attributes)
  const zeros = values.filter((v) => v === 0).length
  const spent = values.reduce((sum, v) => sum + Math.max(0, v - 1), 0)
  const pool = 4 + zeros
  return { pool, spent, remaining: pool - spent }
}

export default function Step2Attributes({
  draft,
  onChange,
  onNext,
  onBack,
}: {
  draft: CharacterDraft
  onChange: (attributes: Attributes) => void
  onNext: () => void
  onBack: () => void
}) {
  const { attributes } = draft
  const { remaining } = computePool(attributes)
  const paperStyle = { backgroundImage: `url(${papelTextura})` }

  function setValue(key: keyof Attributes, raw: number) {
    if (Number.isNaN(raw)) return
    // Sem limite de pontos (pedido da Millie, 07/10): a ficha pode não ser de NEX 5%.
    const next = Math.max(0, Math.min(9, Math.round(raw)))
    onChange({ ...attributes, [key]: next })
  }

  return (
    <div className="creation-spread">
      <div className="creation-paper-slot">
        <div className="creation-paper-shadow" style={paperStyle} />
        <div className="creation-paper creation-paper-tilt-l" style={paperStyle}>
          <CreationLetterhead docNumber={draft.docNumber} />

          <div className="creation-section-title">Atributos</div>

          <div className="attr-radar">
            <img className="attr-radar-img" src={atributosDiagrama} alt="Diagrama de atributos" />

            {NODES.map((node) => (
              <input
                key={node.key}
                type="number"
                className="attr-radar-input"
                style={{ top: node.top, left: node.left }}
                min={0}
                max={9}
                value={attributes[node.key]}
                onChange={(e) => setValue(node.key, Number(e.target.value))}
              />
            ))}
          </div>

          <p>Todos os seus atributos começam em 1 e você recebe 4 pontos para distribuir entre eles como quiser.</p>
          <p>Você também pode reduzir um atributo para 0 para receber 1 ponto adicional. O valor máximo inicial que você pode ter em cada atributo é 3.</p>
          <p className="creation-footnote">
            {remaining >= 0 ? `Pontos restantes: ${remaining}` : `${-remaining} ponto${remaining === -1 ? '' : 's'} além da criação básica`}
            {' '}(é só uma referência: dá pra seguir com qualquer valor)
          </p>
        </div>
      </div>

      <div className="creation-paper-slot">
        <div className="creation-paper-shadow" style={paperStyle} />
        <div className="creation-paper creation-paper-tilt-r" style={paperStyle}>
          <CreationLetterhead docNumber={draft.docNumber} />

          <div className="creation-section-title">Sobre Atributos</div>

          <ul className="attr-about-list">
            {ABOUT.map((a, i) => (
              <li key={a.abbr}>
                <img className="attr-about-icon" src={a.icon} alt="" />
                <div>
                  <span className="creation-rule-title"><span className="creation-rule-num">{i + 1}.</span> {a.name.toUpperCase()} ({a.abbr})</span>
                  <p>{a.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button type="button" className="creation-back-arrow" onClick={onBack} aria-label="Voltar">
        <img src={stepArrow} alt="" />
      </button>
      <button type="button" className="creation-next-arrow" onClick={onNext} aria-label="Avançar">
        <img src={stepArrow} alt="" />
      </button>
    </div>
  )
}
