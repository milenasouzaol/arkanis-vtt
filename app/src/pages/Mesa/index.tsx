import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import BarraIcones from './BarraIcones'
import PainelSessao from './PainelSessao'
import { useFps, useSessaoMesa } from './useSessaoMesa'
import {
  ABAS_DIREITA,
  CATEGORIAS_ESQUERDA,
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
  const [aba, setAba] = useState<AbaDireita | null>(null)
  const [categoria, setCategoria] = useState<CategoriaEsquerda | null>(null)
  const [menuAberto, setMenuAberto] = useState(false)
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

  return (
    <main className="mesa" style={campanha.accent_color ? ({ '--mesa-destaque': campanha.accent_color } as React.CSSProperties) : undefined}>
      <div className="mesa-palco" aria-label="Cena">
        <p className="mesa-palco-vazio">Nenhuma cena ativa</p>
      </div>

      <header className="mesa-topo">
        <strong className="mesa-nome">{campanha.name}</strong>
        <div className="mesa-config">
          <button type="button" className="mesa-icone" aria-label="Configurações da mesa" aria-expanded={menuAberto} onClick={() => setMenuAberto((v) => !v)}>
            <span className="mesa-icone-sigla" aria-hidden>Cf</span>
            <span className="mesa-icone-rotulo" role="tooltip">Configurações</span>
          </button>
          {menuAberto && (
            <ul className="mesa-config-menu">
              {souMestre && (
                <li><button type="button" onClick={copiarConvite}>{copiado ? 'Link copiado!' : 'Copiar link de convite'}</button></li>
              )}
              <li><button type="button" onClick={() => navigate('/jogar')}>Sair</button></li>
            </ul>
          )}
        </div>
      </header>

      <BarraIcones
        lado="esquerda"
        itens={CATEGORIAS_ESQUERDA}
        ativo={categoria}
        onEscolher={(c) => setCategoria((atual) => (atual === c ? null : c))}
      />

      <BarraIcones
        lado="direita"
        itens={ABAS_DIREITA}
        ativo={aba}
        onEscolher={(a) => setAba((atual) => (atual === a ? null : a))}
      />

      {abaAtual && (
        <aside className="mesa-painel" aria-label={abaAtual.rotulo}>
          <header className="mesa-painel-topo">
            <h2>{abaAtual.rotulo}</h2>
            <button type="button" className="mesa-painel-fechar" aria-label="Fechar" onClick={() => setAba(null)}>×</button>
          </header>
          <p className="mesa-painel-vazio">Em construção ({abaAtual.card}).</p>
        </aside>
      )}

      <PainelSessao conectados={online} latencia={latencia} fps={fps} />
    </main>
  )
}
