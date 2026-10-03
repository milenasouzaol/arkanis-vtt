import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEyeSlash, faGlobe, faHatWizard, faUser, faUserSecret } from '@fortawesome/free-solid-svg-icons'
import { MODOS_ENVIO, type ModoEnvio } from './chat'

const ICONE = {
  publico_usuario: faGlobe,
  privado_mestres: faUserSecret,
  cego_mestres: faEyeSlash,
  somente_si: faUser,
  publico_personagem: faHatWizard,
}

// Os 5 modos de envio (12.3). O escolhido vale pras mensagens e pras rolagens da ficha.
export default function ModosEnvio({ modo, onMudar, vertical }: {
  modo: ModoEnvio
  onMudar: (m: ModoEnvio) => void
  vertical?: boolean
}) {
  return (
    <div className={`chat-modos${vertical ? ' vertical' : ''}`} role="radiogroup" aria-label="Modo de envio">
      {MODOS_ENVIO.map((m) => (
        <button
          key={m.id}
          type="button"
          role="radio"
          aria-checked={modo === m.id}
          aria-label={m.rotulo}
          className={`mesa-icone mesa-icone-direita${modo === m.id ? ' ativo' : ''}`}
          onClick={() => onMudar(m.id)}
        >
          <FontAwesomeIcon icon={ICONE[m.id]} />
          <span className="mesa-icone-rotulo" role="tooltip">{m.rotulo}</span>
        </button>
      ))}
    </div>
  )
}
