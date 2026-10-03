import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import BarraIcones, { BotaoIcone } from './BarraIcones'
import PainelConfig from './PainelConfig'
import PainelSessao from './PainelSessao'
import EscolherPersonagem from '../../components/EscolherPersonagem'
import PalcoCena from './PalcoCena'
import PainelCenas from './PainelCenas'
import EditorCena from './EditorCena'
import { enviarImagemDaCena, useCenas } from './useCenas'
import { useObjetos } from './useObjetos'
import { tamanhoInicial } from './cenas'
import type { Cena } from './cenas'
import { useFps, useSessaoMesa } from './useSessaoMesa'
import { autoria, type ModoEnvio } from './chat'
import { enviarImagemDoChat, useChat } from './useChat'
import PainelChat from './PainelChat'
import ChatEntrada from './ChatEntrada'
import ModosEnvio from './ModosEnvio'
import ChatMensagem from './ChatMensagem'
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
  active_scene_id: string | null
}

type Estado =
  | { tipo: 'carregando' }
  | { tipo: 'sem-acesso' }
  | { tipo: 'pronta'; campanha: Campanha; membros: Membro[]; meuModo: ModoEnvio }

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
        .select('id, name, owner_id, invite_code, accent_color, active_scene_id')
        .eq('id', id)
        .maybeSingle()
      if (cancelado) return
      if (!campanha) {
        setEstado({ tipo: 'sem-acesso' })
        return
      }
      const [{ data: linhas }, { data: personagens }] = await Promise.all([
        supabase.from('campaign_members').select('user_id, role, chat_mode').eq('campaign_id', id),
        supabase.from('characters').select('id, user_id, name, avatar_url').eq('campaign_id', id),
      ])
      const ids = [...new Set([campanha.owner_id, ...(linhas ?? []).map((l) => l.user_id)])]
      const { data: perfis } = await supabase.from('profiles').select('id, display_name, avatar_url').in('id', ids)
      if (cancelado) return
      const perfil = new Map((perfis ?? []).map((p) => [p.id, p]))
      const membros: Membro[] = ids.map((uid) => {
        const p = (personagens ?? []).find((c) => c.user_id === uid)
        return {
          userId: uid,
          papel: uid === campanha.owner_id ? 'mestre' : 'jogador',
          nomeConta: perfil.get(uid)?.display_name ?? 'Sem nome',
          fotoConta: perfil.get(uid)?.avatar_url ?? null,
          personagem: p?.name ?? null,
          personagemId: p?.id ?? null,
          fotoPersonagem: p?.avatar_url ?? null,
        }
      })
      const meuModo = (linhas ?? []).find((l) => l.user_id === userId)?.chat_mode as ModoEnvio | undefined
      setEstado({ tipo: 'pronta', campanha, membros, meuModo: meuModo ?? 'publico_personagem' })
    })()
    return () => {
      cancelado = true
    }
  }, [id, userId])

  const pronta = estado.tipo === 'pronta' ? estado : null
  const { presencas, latencia } = useSessaoMesa(pronta?.campanha.id, userId)
  const fps = useFps()
  const online = useMemo(() => (pronta ? filtrarConectados(pronta.membros, presencas) : []), [pronta, presencas])
  const chat = useChat(pronta?.campanha.id)
  const [modoEscolhido, setModoEscolhido] = useState<ModoEnvio | null>(null)
  const [destaqueFechado, setDestaqueFechado] = useState<string | null>(null)
  const cenas = useCenas(pronta?.campanha.id, pronta?.campanha.active_scene_id ?? null)
  const [editandoCena, setEditandoCena] = useState<string | null>(null)
  const objetos = useObjetos(cenas.atual?.id ?? null)
  const [avisoPalco, setAvisoPalco] = useState<string | null>(null)

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
  const meu = estado.membros.find((m) => m.userId === userId)

  // Jogador só entra na mesa com um personagem na campanha.
  if (!souMestre && !meu?.personagemId) {
    return (
      <main className="mesa mesa-aviso mesa-sem-personagem">
        <EscolherPersonagem campanha={campanha} voltarPara={`/mesa/${campanha.id}`} onFechar={() => navigate('/jogar')} />
      </main>
    )
  }
  const abaAtual = ABAS_DIREITA.find((a) => a.id === aba)

  async function copiarConvite() {
    await navigator.clipboard.writeText(linkDeConvite(window.location.origin, campanha.invite_code))
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const eu = estado.membros.find((m) => m.userId === userId)
  const mestre = estado.membros.find((m) => m.papel === 'mestre')
  const modo = modoEscolhido ?? estado.meuModo
  const chatAberto = !recolhida && aba === 'chat'
  // Mensagem destacada pelo mestre aparece no meio da mesa pra todo mundo.
  const destaque = [...(chat.mensagens ?? [])].reverse().find((m) => m.destacada)

  // O modo fica salvo na campanha porque também decide quem vê as rolagens da ficha.
  async function mudarModo(m: ModoEnvio) {
    setModoEscolhido(m)
    await supabase.from('campaign_members').update({ chat_mode: m }).eq('campaign_id', campanha.id).eq('user_id', userId)
  }

  function enviarMensagem(html: string) {
    if (!userId || !eu) return Promise.resolve(false)
    const autor = autoria(modo, { nome: eu.nomeConta, foto: eu.fotoConta ?? null }, { nome: eu.personagem, foto: eu.fotoPersonagem ?? null })
    return chat.enviar({ userId, modo, autor, personagemId: modo === 'publico_usuario' ? null : eu.personagemId ?? null, html })
  }

  function enviarImagem(arquivo: File) {
    return userId ? enviarImagemDoChat(userId, arquivo) : Promise.resolve(null)
  }

  // Mestre ativa a cena pra todos; jogador só olha a cena que escolheu na navegação.
  function abrirCena(c: Cena) {
    if (souMestre) cenas.ativar(c.id)
    else cenas.setVendo(c.id === cenas.ativa ? null : c.id)
  }

  async function criarCena(nome: string, pastaId: string | null) {
    const nova = await cenas.criarCena({ name: nome, folder_id: pastaId })
    if (nova) setEditandoCena(nova.id)
  }

  function avisar(texto: string | null, some = false) {
    setAvisoPalco(texto)
    if (some) setTimeout(() => setAvisoPalco((atual) => (atual === texto ? null : atual)), 3000)
  }

  // Imagem de outra aba: tenta guardar uma cópia nossa (não some se o site original tirar
  // do ar ou bloquear); se o site não deixar copiar, usa o endereço dele mesmo.
  async function guardarImagem(origem: File | string): Promise<string | null> {
    if (!userId) return null
    if (typeof origem !== 'string') return enviarImagemDaCena(userId, origem)
    try {
      const resposta = await fetch(origem)
      const blob = await resposta.blob()
      if (resposta.ok && blob.type.startsWith('image/')) {
        const nome = origem.split(/[?#]/)[0].split('/').pop() || 'imagem'
        const copia = await enviarImagemDaCena(userId, new File([blob], nome, { type: blob.type }))
        if (copia) return copia
      }
    } catch {
      // site não deixa baixar: fica o endereço original
    }
    return origem
  }

  function tamanhoDaImagem(url: string): Promise<{ w: number; h: number }> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
      img.onerror = () => resolve({ w: 0, h: 0 })
      img.src = url
    })
  }

  // Imagem arrastada pra mesa (12.2): sem cena, vira uma cena nova; cena sem fundo, vira o
  // fundo; cena com fundo, entra por cima do mapa onde foi solta.
  async function soltarImagem(origem: File | string, ponto: { x: number; y: number }, mapa: { w: number; h: number }) {
    if (!origem) {
      avisar('Isso não é uma imagem. Arraste o arquivo da imagem, ou a própria imagem de outra aba.', true)
      return
    }
    avisar('Enviando imagem…')
    const url = await guardarImagem(origem)
    if (!url) {
      avisar('Não deu pra enviar a imagem.', true)
      return
    }
    const atual = cenas.atual
    if (!atual) {
      const nova = await cenas.criarCena({ name: `Cena (${cenas.cenas.length + 1})`, background_url: url })
      if (nova) await cenas.ativar(nova.id)
    } else if (!atual.background_url) {
      await cenas.salvarCena(atual.id, { background_url: url })
    } else {
      const nat = await tamanhoDaImagem(url)
      const t = tamanhoInicial(nat.w, nat.h, mapa.w, mapa.h)
      const nome = typeof origem === 'string' ? null : origem.name.replace(/.[^.]+$/, '')
      await objetos.criar({
        scene_id: atual.id,
        campaign_id: campanha.id,
        name: nome,
        image_url: url,
        x: Math.round(ponto.x - t.width / 2),
        y: Math.round(ponto.y - t.height / 2),
        width: t.width,
        height: t.height,
        layer: 'mapa',
      })
    }
    avisar(null)
  }

  const cenaEditada = cenas.cenas.find((c) => c.id === editandoCena)
  const jogadoresParaCena = estado.membros
    .filter((m) => m.papel === 'jogador')
    .map((m) => ({ userId: m.userId, rotulo: m.personagem ? `${m.personagem} (${m.nomeConta})` : m.nomeConta }))

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
      <PalcoCena
        cena={cenas.atual}
        souMestre={souMestre}
        objetos={objetos.objetos}
        aviso={avisoPalco}
        onSoltarImagem={soltarImagem}
        onAlterarObjeto={objetos.alterar}
        onExcluirObjeto={objetos.excluir}
      />

      {destaque && destaque.id !== destaqueFechado && (
        <div className="mesa-destaque" role="status">
          <ChatMensagem
            mensagem={destaque}
            souMestre={souMestre}
            nomeMestre={mestre?.nomeConta ?? 'Mestre'}
            agora={new Date()}
            onDestacar={() => chat.alterar(destaque.id, { destacada: false })}
            onRevelar={() => chat.alterar(destaque.id, { revelada: true })}
            onExcluir={() => chat.excluir(destaque.id)}
          />
          <button type="button" className="mesa-destaque-fechar" aria-label="Fechar destaque" onClick={() => setDestaqueFechado(destaque.id)}>×</button>
        </div>
      )}

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
          {!chatAberto && <ModosEnvio vertical modo={modo} onMudar={mudarModo} />}
        </nav>

        {!chatAberto && (
          <div className="mesa-chat-flutuante">
            <ChatEntrada compacto onEnviar={enviarMensagem} onImagem={enviarImagem} />
          </div>
        )}

        {!recolhida && abaAtual && (
          <aside className="mesa-painel" aria-label={abaAtual.rotulo}>
            {aba === 'chat' ? (
              <PainelChat
                mensagens={chat.mensagens}
                souMestre={souMestre}
                nomeMestre={mestre?.nomeConta ?? 'Mestre'}
                nomeCampanha={campanha.name}
                modo={modo}
                onMudarModo={mudarModo}
                onEnviar={enviarMensagem}
                onImagem={enviarImagem}
                onAlterar={chat.alterar}
                onExcluir={chat.excluir}
                onLimpar={chat.limpar}
              />
            ) : aba === 'cenas' ? (
              <PainelCenas
                souMestre={souMestre}
                cenas={cenas.cenas}
                pastas={cenas.pastas}
                ativa={cenas.ativa}
                vendo={cenas.vendo}
                onAbrir={abrirCena}
                onEditar={(c) => setEditandoCena(c.id)}
                onTrazerTodos={(c) => cenas.ativar(c.id)}
                onExcluir={(c) => cenas.excluirCena(c.id)}
                onDuplicar={cenas.duplicarCena}
                onCriarCena={criarCena}
                onCriarPasta={cenas.criarPasta}
                onSalvarPasta={cenas.salvarPasta}
                onExcluirPasta={(p, comCenas) => cenas.excluirPasta(p.id, comCenas)}
              />
            ) : aba === 'config' ? (
              <PainelConfig souMestre={souMestre} copiado={copiado} onCopiarConvite={copiarConvite} onSair={() => navigate('/jogar')} />
            ) : (
              <p className="mesa-painel-vazio">{abaAtual.rotulo}: em construção ({abaAtual.card}).</p>
            )}
          </aside>
        )}
      </div>

      {souMestre && cenaEditada && (
        <EditorCena
          key={cenaEditada.id}
          cena={cenaEditada}
          jogadores={jogadoresParaCena}
          onSalvar={(campos) => cenas.salvarCena(cenaEditada.id, campos)}
          onImagem={(arquivo) => (userId ? enviarImagemDaCena(userId, arquivo) : Promise.resolve(null))}
          onFechar={() => setEditandoCena(null)}
        />
      )}

      <PainelSessao conectados={online} latencia={latencia} fps={fps} />
    </main>
  )
}
