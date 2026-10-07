import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { StatusAcesso } from '../lib/AuthContext'
import arkanisLogo from '../assets/icons/arkanis-logo.png'

// Tela de quem criou conta mas ainda não foi aprovado pela administradora (pedido da Millie, 07/10).
// Quando ela aprovar, a pessoa entra sozinha (o acesso chega ao vivo).
export default function AguardandoAprovacao({ status }: { status: StatusAcesso | null }) {
  const navigate = useNavigate()
  const recusado = status === 'recusado' || status === 'bloqueado'
  return (
    <main className="acesso-espera">
      <div className="acesso-espera-caixa">
        <img src={arkanisLogo} alt="Arkanis" />
        <h1>{recusado ? 'Acesso não liberado' : 'Seu acesso está esperando a liberação'}</h1>
        <p>
          {recusado
            ? 'Essa conta não tem acesso ao Arkanis.'
            : 'O Arkanis é uma mesa fechada. Sua conta foi criada e agora precisa ser aprovada. Assim que for liberada, esta página abre sozinha.'}
        </p>
        <button
          type="button"
          className="btn-pill"
          onClick={async () => {
            await supabase.auth.signOut()
            navigate('/')
          }}
        >
          Sair
        </button>
      </div>
    </main>
  )
}
