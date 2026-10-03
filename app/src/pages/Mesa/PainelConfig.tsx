import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDoorOpen, faGlobe, faUsers, faWifi } from '@fortawesome/free-solid-svg-icons'

// Aba de Configurações (12.15). Os dados da campanha e a lista de usuários entram no KAN-54;
// por enquanto ficam o link de convite e o Sair.
export default function PainelConfig({ souMestre, copiado, onCopiarConvite, onSair }: {
  souMestre: boolean
  copiado: boolean
  onCopiarConvite: () => void
  onSair: () => void
}) {
  return (
    <div className="mesa-config">
      <header className="mesa-config-marca">
        <h2>Arkanis</h2>
        <span>Ordem Paranormal</span>
      </header>

      {souMestre && (
        <>
          <h3 className="mesa-secao">Ajustes e Configuração</h3>
          <button type="button" className="mesa-botao" disabled title="Chega no KAN-54">
            <FontAwesomeIcon icon={faGlobe} /> Configuração de Campanha
          </button>
          <button type="button" className="mesa-botao" disabled title="Chega no KAN-54">
            <FontAwesomeIcon icon={faUsers} /> Usuários
          </button>
        </>
      )}

      <h3 className="mesa-secao">Acesso ao Jogo</h3>
      {souMestre && (
        <button type="button" className="mesa-botao" onClick={onCopiarConvite}>
          <FontAwesomeIcon icon={faWifi} /> {copiado ? 'Link copiado!' : 'Links de Convite'}
        </button>
      )}
      <button type="button" className="mesa-botao" onClick={onSair}>
        <FontAwesomeIcon icon={faDoorOpen} /> Sair
      </button>
    </div>
  )
}
