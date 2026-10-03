import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { esquecerDestino, guardarConvite } from '../lib/convitePendente'
import EscolherPersonagem from '../components/EscolherPersonagem'

type Previa = { id: string; name: string; cover_image_url: string | null; owner_name: string | null; ja_membro: boolean }

// Link de convite: mostra a campanha e pede o personagem. A pessoa só vira membro
// quando confirma o personagem (antes, abrir o link já colocava ela na campanha).
export default function EntrarCampanha() {
  const { code } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [previa, setPrevia] = useState<Previa | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!session || !code) return
    // Guarda o convite pra voltar aqui depois de criar o personagem.
    guardarConvite(code)
    ;(async () => {
      const { data, error } = await supabase.rpc('campaign_by_invite', { p_invite_code: code })
      const campanha = (data as Previa[] | null)?.[0]
      if (error || !campanha) {
        esquecerDestino()
        setErro('Esse link de convite não é válido. Peça um novo pra quem está mestrando.')
        return
      }
      if (campanha.ja_membro) {
        // Já é da campanha: com personagem lá, vai direto pra mesa.
        const { count } = await supabase
          .from('characters')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('campaign_id', campanha.id)
        if (count) {
          esquecerDestino()
          navigate(`/mesa/${campanha.id}`, { replace: true })
          return
        }
      }
      setPrevia(campanha)
    })()
  }, [session, code, navigate])

  if (erro) {
    return (
      <main className="page-shell font-ashigea">
        <h1>Não deu pra entrar</h1>
        <p role="alert">{erro}</p>
      </main>
    )
  }

  if (!previa || !code) {
    return (
      <main className="page-shell font-ashigea">
        <p>Abrindo o convite…</p>
      </main>
    )
  }

  return (
    <main className="page-shell font-ashigea">
      {previa.cover_image_url && <img className="convite-capa" src={previa.cover_image_url} alt="" />}
      <h1>Você foi convidado pra {previa.name}</h1>
      {previa.owner_name && <p className="character-list-desc">Mestrada por {previa.owner_name}.</p>}
      <EscolherPersonagem campanha={previa} codigoConvite={code} voltarPara={`/campanha/entrar/${encodeURIComponent(code)}`} />
    </main>
  )
}
