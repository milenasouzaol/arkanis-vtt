import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDoorOpen, faGamepad, faGears, faGlobe, faHouse, faUsers, faWifi } from '@fortawesome/free-solid-svg-icons'

export type JanelaDoPainel = 'jogo' | 'controles' | 'mundo' | 'usuarios'

// Aba de Configurações (12.15, KAN-54, print do Foundry da Millie): nome da mesa, o sistema de
// jogo, Ajustes e Configuração (Configurações, Controles; o mestre também Configuração do Mundo e
// Usuários) e Acesso ao Jogo (Links de Convite, Sair, Voltar às Campanhas).
export default function PainelConfig({ souMestre, sistema, copiado, onCopiarConvite, onAbrir, onSair, onVoltar }: {
  souMestre: boolean
  sistema: string
  copiado: boolean
  onCopiarConvite: () => void
  onAbrir: (j: JanelaDoPainel) => void
  onSair: () => void
  onVoltar: () => void
}) {
  return (
    <div className="mesa-config">
      <header className="mesa-config-marca">
        <h2>Arkanis</h2>
      </header>

      <h3 className="mesa-secao">Sistema de Jogo</h3>
      <p className="mesa-config-sistema">{sistema}</p>

      <h3 className="mesa-secao">Ajustes e Configuração</h3>
      <button type="button" className="mesa-botao" onClick={() => onAbrir('jogo')}>
        <FontAwesomeIcon icon={faGears} /> Configurações
      </button>
      <button type="button" className="mesa-botao" onClick={() => onAbrir('controles')}>
        <FontAwesomeIcon icon={faGamepad} /> Controles
      </button>
      {souMestre && (
        <>
          <button type="button" className="mesa-botao" onClick={() => onAbrir('mundo')}>
            <FontAwesomeIcon icon={faGlobe} /> Configuração do Mundo
          </button>
          <button type="button" className="mesa-botao" onClick={() => onAbrir('usuarios')}>
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
      <button type="button" className="mesa-botao" onClick={onVoltar}>
        <FontAwesomeIcon icon={faHouse} /> Voltar às Campanhas
      </button>
    </div>
  )
}
