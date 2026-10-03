import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import BarraIcones, { BotaoIcone } from './BarraIcones'
import PainelConfig from './PainelConfig'
import PainelSessao from './PainelSessao'
import { useFps, useSessaoMesa } from './useSessaoMesa'
import {
  ABAS_DIREITA,
  CATEGORIAS_ESQUERDA,
  FERRAMENTAS,
  conectados as filtrarConectados,
  linkDeConvite,
  type AbaDireita,
  type CategoriaEsquerda,
  type Membro,
} from './mesa'

type Campanha = {
  id: string
  name: string
  owner_id: string
  invite_code: string
  accent_color: string | null
}

type Estado =
  | { tipo: 'carregando' }
  | { tipo: 'sem-acesso' }
  | { tipo: 'pronta'; campanha: Campanha; membros: Membro[] }

// A Mesa (KAN-46): palco da cena no centro, abas na barra direita, ferramentas
// de cena na esquerda e o painel de sessão no rodapé esquerdo.
export default function Mesa() {
  const { id } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  const userId = session?.user.id
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' })
  // Como no Foundry, a mesa abre com o chat à mostra.
  const [aba, setAba] = useState<AbaDireita>('chat')
  const [recolhida, setRecolhida] = useState(false)
  const [categoria, setCategoria] = useState<CategoriaEsquerda>('tokens')
  const [ferramenta, setFerramenta] = useState('selecionar')
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!id || !userId) return
    let cancelado = false
    ;(async () => {
      // RLS só devolve a campanha pra quem é dono ou membro.
      const { data: campanha } = await supabase
        .from('campaigns')
        .select('id, name, owner_id, invite_code, accent_color')
        .eq('id', id)
        .maybeSingle()
      if (cancelado) return
      if (!campanha) {
        setEstado({ tipo: 'sem-acesso' })
        return
      }
      const [{ data: linhas }, { data: personagens }] = await Promise.all([
        supabase.from('campaign_members').select('user_id, role').eq('campaign_id', id),
        supabase.from('characters').select('user_id, name').eq('campaign_id', id),
      ])
      const ids = [...new Set([campanha.owner_id, ...(linhas ?? []).map((l) => l.user_id)])]
      const { data: perfis } = await supabase.from('profiles').select('id, display_name').in('id', ids)
      if (cancelado) return
      const nomes = new Map((perfis ?? []).map((p) => [p.id, p.display_name ?? 'Sem nome']))
      const membros: Membro[] = ids.map((uid) => ({
        userId: uid,
        papel: uid === campanha.owner_id ? 'mestre' : 'jogador',
        nomeConta: nomes.get(uid) ?? 'Sem nome',
        personagem: (personagens ?? []).find((p) => p.user_id === uid)?.name ?? null,
      }))
      setEstado({ tipo: 'pronta', campanha, membros })
    })()
    return () => {
      cancelado = true
    }
  }, [id, userId])

  const pronta = estado.tipo === 'pronta' ? estado : null
  const { presencas, latencia } = useSessaoMesa(pronta?.campanha.id, userId)
  const fps = useFps()
  const online = useMemo(() => (pronta ? filtrarConectados(pronta.membros, presencas) : []), [pronta, presencas])

  if (estado.tipo === 'carregando') {
    return <main className="mesa mesa-aviso"><p>Carregando a mesa…</p></main>
  }

  if (estado.tipo === 'sem-acesso') {
    return (
      <main className="mesa mesa-aviso">
        <h1>Mesa indisponível</h1>
        <p>Essa campanha não existe ou você não faz parte dela. Peça o link de convite pra quem está mestrando.</p>
        <Link to="/jogar" className="btn-pill">Voltar</Link>
      </main>
    )
  }

  const { campanha } = estado
  const souMestre = campanha.owner_id === userId
  const abaAtual = ABAS_DIREITA.find((a) => a.id === aba)

  async function copiarConvite() {
    await navigator.clipboard.writeText(linkDeConvite(window.location.origin, campanha.invite_code))
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function escolherAba(a: AbaDireita) {
    // Clicar na aba aberta recolhe o painel, como o Foundry faz.
    if (a === aba && !recolhida) setRecolhida(true)
    else {
      setAba(a)
      setRecolhida(false)
    }
  }

  return (
    <main className="mesa" style={campanha.accent_color ? ({ '--mesa-destaque': campanha.accent_color } as React.CSSProperties) : undefined}>
      <div className="mesa-palco" aria-label="Cena">
        <p className="mesa-palco-vazio">Nenhuma cena ativa</p>
      </div>

      <nav className="mesa-controles" aria-label="Ferramentas de cena">
        <div className="mesa-coluna">
          <BarraIcones lado="esquerda" itens={CATEGORIAS_ESQUERDA} ativo={categoria} onEscolher={setCategoria} />
        </div>
        <div className="mesa-coluna">
          {FERRAMENTAS[categoria].map((f) => (
            <BotaoIcone key={f.id} id={f.id} rotulo={f.rotulo} lado="esquerda" ativo={ferramenta === f.id} onClick={() => setFerramenta(f.id)} />
          ))}
        </div>
      </nav>

      <div className={`mesa-lateral${recolhida ? ' recolhida' : ''}`}>
        <nav className="mesa-barra" aria-label="Abas da mesa">
          <BarraIcones lado="direita" itens={ABAS_DIREITA} ativo={recolhida ? null : aba} onEscolher={escolherAba} />
          <BotaoIcone id="recolher" rotulo={recolhida ? 'Expandir' : 'Recolher'} lado="direita" onClick={() => setRecolhida((v) => !v)} />
        </nav>

        {!recolhida && abaAtual && (
          <aside className="mesa-painel" aria-label={abaAtual.rotulo}>
            {aba === 'config' ? (
              <PainelConfig souMestre={souMestre} copiado={copiado} onCopiarConvite={copiarConvite} onSair={() => navigate('/jogar')} />
            ) : (
              <p className="mesa-painel-vazio">{abaAtual.rotulo}: em construção ({abaAtual.card}).</p>
            )}
          </aside>
        )}
      </div>

      <PainelSessao conectados={online} latencia={latencia} fps={fps} />
    </main>
  )
}
