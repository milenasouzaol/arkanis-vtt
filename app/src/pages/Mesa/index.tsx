import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import BarraIcones, { BotaoIcone } from './BarraIcones'
import PainelConfig from './PainelConfig'
import PainelSessao from './PainelSessao'
import EscolherPersonagem from '../../components/EscolherPersonagem'
import PalcoCena from './PalcoCena'
import PainelCenas, { CriarPasta } from './PainelCenas'
import EditorCena from './EditorCena'
import { enviarImagemDaCena, useCenas } from './useCenas'
import { useObjetos, type Ping } from './useObjetos'
import { tamanhoInicial, type Pasta } from './cenas'
import PainelPersonagens from './PainelPersonagens'
import { ConfigurarPropriedadeAtor, ConfigurarToken, ConfirmarExclusao, CriarPersonagem, FichaPortatil, PainelVariacoes } from './JanelasAtor'
import { colocarToken, enviarImagemDeToken, trocarVariacao, useAtores } from './useAtores'
import { imagemDoToken, nivelDoJogador, nivelNaFichaDoJogador, variacoesDoToken, type Ator, type NivelAcesso } from './atores'
import Janela from './Janela'
import PainelCombate, { IndicadorTurno } from './PainelCombate'
import CriarCombate from './CriarCombate'
import FichaAmeaca from './FichaAmeaca'
import { useCombate, type Combate } from './useCombate'
import type { Combatente } from './combate'
import { faSkull } from '@fortawesome/free-solid-svg-icons'
import type { Cena } from './cenas'
import { useFps, useSessaoMesa } from './useSessaoMesa'
import { autoria, type ModoEnvio } from './chat'
import { enviarImagemDoChat, useChat } from './useChat'
import PainelChat from './PainelChat'
import ChatEntrada from './ChatEntrada'
import ModosEnvio from './ModosEnvio'
import ChatMensagem from './ChatMensagem'
import { QuemVeContexto } from './AcaoNoChat'
import { useMira } from './useMira'
import { useAnunciarAlvos } from '../../lib/miraDaMesa'
import { postarAtaque } from './acoesDeMira'
import type { Alvo, AtaqueDaAcao } from './mira'
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
  const [pings, setPings] = useState<Ping[]>([])
  const [focoPing, setFocoPing] = useState<Ping | null>(null)
  // Ping (12.8): marca o ponto por uns segundos; o de foco leva a câmera de todos até ele.
  const receberPing = useCallback((p: Ping) => {
    setPings((l) => [...l, p])
    if (p.foco) setFocoPing(p)
    setTimeout(() => setPings((l) => l.filter((x) => x.id !== p.id)), 2600)
  }, [])
  const objetos = useObjetos(cenas.atual?.id ?? null, receberPing)
  const atores = useAtores(pronta?.campanha.id)
  const [criandoAtor, setCriandoAtor] = useState<{ pasta: string | null } | null>(null)
  const [pastaAtor, setPastaAtor] = useState<{ pai: string | null; editando?: Pasta } | null>(null)
  const [propriedadeAtor, setPropriedadeAtor] = useState<string | null>(null)
  const [tokenAtor, setTokenAtor] = useState<string | null>(null)
  const [excluindoAtor, setExcluindoAtor] = useState<string | null>(null)
  const [fichasAbertas, setFichasAbertas] = useState<string[]>([])
  const [tokenDasVariacoes, setTokenDasVariacoes] = useState<string | null>(null)
  const combate = useCombate(pronta?.campanha.id, pronta?.campanha.owner_id === userId)
  const [montandoCombate, setMontandoCombate] = useState<{ editando?: Combate; adicionarEm?: Combate } | null>(null)
  const [fichaCombate, setFichaCombate] = useState<string | null>(null)
  const [vdDe, setVdDe] = useState<Record<string, number | null>>({})
  const idsAmeacas = [...new Set(combate.combates.flatMap((c) => c.ameacas))].sort().join(',')
  // VD das ameaças dos combates salvos, pro card mostrar o VD total.
  useEffect(() => {
    const faltam = idsAmeacas.split(',').filter((id) => id && !(id in vdDe))
    if (!faltam.length) return
    supabase.from('creatures').select('id, vd').in('id', faltam).then(({ data }) => {
      setVdDe((m) => ({ ...m, ...Object.fromEntries((data ?? []).map((c) => [c.id, c.vd])) }))
    })
  }, [idsAmeacas, vdDe])
  const [avisoPalco, setAvisoPalco] = useState<string | null>(null)

  // ---- Mira (12.9) ----
  const euNaMesa = pronta?.membros.find((m) => m.userId === userId)
  const mira = useMira(pronta?.campanha.id, userId, euNaMesa?.personagem || euNaMesa?.nomeConta || 'Alguém')
  const alvosComNome: Alvo[] = mira.meus.flatMap((id) => {
    const o = objetos.objetos.find((x) => x.id === id)
    if (!o) return []
    const a = o.actor_id ? atores.atores.find((x) => x.id === o.actor_id) : undefined
    return [{ token_id: id, nome: o.name || a?.name || 'Token' }]
  })
  // A ficha (que abre num iframe) fica sabendo dos alvos pra transformar o ataque em ação no chat.
  useAnunciarAlvos(pronta?.campanha.id, alvosComNome)
  // Trocou de cena: os alvos da outra cena não valem mais.
  const cenaVista = cenas.atual?.id
  const limparAlvos = mira.limpar
  useEffect(() => limparAlvos(), [cenaVista, limparAlvos])

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

  // Clicar na cena só abre ela pra quem clicou; quem muda a cena de todo mundo é o
  // "Ativar Cena" do botão direito (mestre).
  function abrirCena(c: Cena) {
    cenas.setVendo(c.id === cenas.ativa ? null : c.id)
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

  // ---- Personagens (12.7) ----

  function nivelNoAtor(a: Ator): NivelAcesso {
    if (souMestre) return 'dono'
    const ficha = a.character_id ? atores.fichas[a.character_id] : undefined
    if (a.tipo === 'jogador') return ficha ? nivelNaFichaDoJogador(ficha.user_id === userId, ficha) : 'limitado'
    return nivelDoJogador(a, userId ?? '')
  }

  function abrirFicha(atorId: string) {
    setFichasAbertas((l) => (l.includes(atorId) ? l : [...l, atorId]))
  }

  // O token entra com o formato da imagem: largura de um quadrado da grade, altura proporcional.
  async function colocarAtor(atorId: string, ponto: { x: number; y: number }) {
    if (!cenas.atual) return
    const a = atores.atores.find((x) => x.id === atorId)
    const url = a && imagemDoToken(a, (a.character_id && atores.fichas[a.character_id]?.avatar_url) || (a.creature_id && atores.criaturas[a.creature_id]?.image_url) || null)
    const largura = cenas.atual.grid_size
    const nat = url ? await tamanhoDaImagem(url) : { w: 0, h: 0 }
    const altura = nat.w > 0 ? Math.round((largura * nat.h) / nat.w) : largura
    const erro = await colocarToken(atorId, cenas.atual.id, ponto.x, ponto.y, largura, altura)
    if (erro) avisar(erro, true)
  }

  async function criarNPC(nome: string, pasta: string | null) {
    setCriandoAtor(null)
    if (!userId) return
    const novo = await atores.criarNPC(userId, nome, pasta)
    if (novo) abrirFicha(novo.id)
  }

  // ---- Combate (12.4) ----

  const meusPersonagensIds = eu?.personagemId ? [eu.personagemId] : []

  function abrirCombatente(c: Combatente) {
    if (c.tipo === 'jogador') {
      const a = atores.atores.find((x) => x.character_id === c.character_id)
      if (a) abrirFicha(a.id)
    } else setFichaCombate(c.id)
  }

  function rolarNoChat(rolagem: Parameters<typeof chat.enviarRolagem>[0]['rolagem'], autor: { nome: string; foto: string | null }) {
    if (userId) chat.enviarRolagem({ userId, modo, autor, rolagem })
  }

  // Ação/poder de uma ameaça mostrado no chat, com o nome e a foto dela.
  function mostrarNoChat(html: string, autor: { nome: string; foto: string | null }) {
    if (userId) chat.enviar({ userId, modo, autor, personagemId: null, html })
  }

  // Ameaça atacando os alvos marcados (mestre).
  function atacarComAmeaca(ataque: AtaqueDaAcao, autor: { nome: string; foto: string | null }) {
    postarAtaque({ campanhaId: campanha.id, characterId: null, autor, ataque, alvos: alvosComNome }).then((e) => e && avisar(e, true))
  }

  // Bloquear (12.9): quem pode mexer na ficha do alvo.
  function controlaAlvo(tokenId: string) {
    const o = objetos.objetos.find((x) => x.id === tokenId)
    if (!o) return false
    const a = o.actor_id ? atores.atores.find((x) => x.id === o.actor_id) : undefined
    if (a) return !!a.character_id && nivelNoAtor(a) === 'dono'
    return !!o.character_id && (souMestre || meusPersonagensIds.includes(o.character_id))
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
    <QuemVeContexto.Provider value={{ userId: userId ?? '', souMestre, controlaAlvo }}>
    <main className="mesa" style={campanha.accent_color ? ({ '--mesa-destaque': campanha.accent_color } as React.CSSProperties) : undefined}>
      <PalcoCena
        cena={cenas.atual}
        souMestre={souMestre}
        userId={userId ?? ''}
        nomeUsuario={eu?.personagem || eu?.nomeConta || 'Alguém'}
        meusPersonagens={eu?.personagemId ? [eu.personagemId] : []}
        jogadores={jogadoresParaCena}
        obj={objetos}
        aviso={avisoPalco}
        pings={pings}
        focoPing={focoPing}
        onSoltarImagem={soltarImagem}
        onColocarAtor={colocarAtor}
        onAbrirFicha={abrirFicha}
        variacoesDe={(id) => {
          const a = atores.atores.find((x) => x.id === id)
          return a ? variacoesDoToken(a) : []
        }}
        onAbrirVariacoes={setTokenDasVariacoes}
        ferramenta={ferramenta}
        meusAlvos={alvosComNome.map((a) => a.token_id)}
        outrosAlvos={mira.outros}
        onAlternarAlvo={mira.alternar}
        onLimparAlvos={mira.limpar}
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
                onAtivar={(c) => cenas.ativar(c.id)}
                onTrazerTodos={(c) => cenas.ativar(c.id)}
                onExcluir={(c) => cenas.excluirCena(c.id)}
                onDuplicar={cenas.duplicarCena}
                onCriarCena={criarCena}
                onCriarPasta={cenas.criarPasta}
                onSalvarPasta={cenas.salvarPasta}
                onExcluirPasta={(p, comCenas) => cenas.excluirPasta(p.id, comCenas)}
              />
            ) : aba === 'combate' ? (
              <PainelCombate
                souMestre={souMestre}
                combates={combate.combates}
                vdDe={vdDe}
                ativo={combate.ativo}
                ordem={combate.ordem}
                vidas={combate.vidas}
                barras={combate.barras}
                meusPersonagens={meusPersonagensIds}
                onCriar={() => setMontandoCombate({})}
                onEditar={(c) => setMontandoCombate({ editando: c })}
                onExcluir={(c) => combate.excluir(c.id)}
                onIniciar={(c) => combate.iniciar(c)}
                onEncerrar={(c) => combate.encerrar(c)}
                onAdicionar={(c) => setMontandoCombate({ adicionarEm: c })}
                onPassar={(c, voltar) => combate.passar(c, voltar)}
                onRemover={(c, id) => combate.remover(c, id)}
                onAbrir={abrirCombatente}
              />
            ) : aba === 'personagens' ? (
              <PainelPersonagens
                souMestre={souMestre}
                userId={userId ?? ''}
                atores={atores.atores}
                pastas={atores.pastas}
                fichas={atores.fichas}
                criaturas={atores.criaturas}
                acoes={{
                  onAbrir: (a) => abrirFicha(a.id),
                  onPropriedade: (a) => setPropriedadeAtor(a.id),
                  onToken: (a) => setTokenAtor(a.id),
                  onExcluir: (a) => setExcluindoAtor(a.id),
                  onDuplicar: (a) => userId && atores.duplicar(a, userId),
                  onCriar: (pasta) => setCriandoAtor({ pasta }),
                  onCriarPasta: (pai) => setPastaAtor({ pai }),
                  onEditarPasta: (p) => setPastaAtor({ pai: p.parent_id, editando: p }),
                  onExcluirPasta: (p) => window.confirm(`Remover a pasta "${p.name}"? Os personagens dela ficam soltos.`) && atores.excluirPasta(p.id),
                }}
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

      {combate.ativo && (
        <IndicadorTurno
          ativo={combate.ativo}
          ordem={combate.ordem}
          meusPersonagens={meusPersonagensIds}
          souMestre={souMestre}
          onPassar={() => combate.ativo && combate.passar(combate.ativo)}
        />
      )}

      {montandoCombate && (
        <CriarCombate
          inicial={montandoCombate.editando ?? montandoCombate.adicionarEm}
          modo={montandoCombate.adicionarEm ? 'adicionar' : 'criar'}
          onSalvar={(nome, ameacas) => {
            if (montandoCombate.adicionarEm) combate.entrarAmeacas(montandoCombate.adicionarEm, ameacas)
            else if (montandoCombate.editando) combate.salvar(montandoCombate.editando.id, { name: nome, ameacas })
            else combate.criar(nome, ameacas)
            setMontandoCombate(null)
          }}
          onFechar={() => setMontandoCombate(null)}
        />
      )}

      {(() => {
        const c = combate.ordem.find((x) => x.id === fichaCombate)
        if (!c || !c.creature_id || !souMestre) return null
        const vida = combate.vidas[c.id]
        return (
          <Janela titulo={c.name} icone={faSkull} largura={440} altura={640} inicial={{ x: Math.max(16, window.innerWidth - 820), y: 40 }} onFechar={() => setFichaCombate(null)}>
            <FichaAmeaca
              criaturaId={c.creature_id}
              nome={c.name}
              pvAtual={vida?.pv_atual ?? null}
              pvMax={vida?.pv_max ?? null}
              podeEditar
              podeRolar
              onMudarPv={(pv) => combate.mudarVida(c.id, pv)}
              onRolar={rolarNoChat}
              onMostrar={mostrarNoChat}
              alvos={alvosComNome}
              onAtacar={atacarComAmeaca}
            />
          </Janela>
        )
      })()}

      {criandoAtor && (
        <CriarPersonagem
          pastas={atores.pastas}
          pastaInicial={criandoAtor.pasta}
          onCriarNPC={criarNPC}
          onCriarAmeaca={async (c, pasta) => { setCriandoAtor(null); const novo = await atores.criarAmeaca(c, pasta); if (novo) abrirFicha(novo.id) }}
          onFechar={() => setCriandoAtor(null)}
        />
      )}

      {pastaAtor && (
        <CriarPasta
          inicial={pastaAtor.editando}
          onCriar={(campos) => {
            if (pastaAtor.editando) atores.salvarPasta(pastaAtor.editando.id, campos)
            else atores.criarPasta({ ...campos, parent_id: pastaAtor.pai })
            setPastaAtor(null)
          }}
          onFechar={() => setPastaAtor(null)}
        />
      )}

      {(() => {
        const a = atores.atores.find((x) => x.id === propriedadeAtor)
        return a ? (
          <ConfigurarPropriedadeAtor
            ator={a}
            jogadores={jogadoresParaCena}
            onSalvar={(campos) => { atores.salvar(a.id, campos); setPropriedadeAtor(null) }}
            onFechar={() => setPropriedadeAtor(null)}
          />
        ) : null
      })()}

      {(() => {
        const a = atores.atores.find((x) => x.id === tokenAtor)
        return a ? (
          <ConfigurarToken
            ator={a}
            onEnviar={(f) => (userId ? enviarImagemDeToken(userId, f) : Promise.resolve(null))}
            onSalvar={(campos) => { atores.salvar(a.id, campos); setTokenAtor(null) }}
            onFechar={() => setTokenAtor(null)}
          />
        ) : null
      })()}

      {(() => {
        const a = atores.atores.find((x) => x.id === excluindoAtor)
        return a ? (
          <ConfirmarExclusao ator={a} onSim={() => { atores.excluir(a); setExcluindoAtor(null) }} onNao={() => setExcluindoAtor(null)} />
        ) : null
      })()}

      {(() => {
        const token = objetos.objetos.find((o) => o.id === tokenDasVariacoes)
        const a = token?.actor_id ? atores.atores.find((x) => x.id === token.actor_id) : undefined
        if (!token || !a) return null
        return (
          <PainelVariacoes
            ator={a}
            atual={token.image_url}
            onEscolher={async (url) => {
              // Mantém a largura do token e acompanha o formato da nova imagem.
              const nat = await tamanhoDaImagem(url)
              const altura = nat.w > 0 ? Math.round((token.width * nat.h) / nat.w) : null
              if (!(await trocarVariacao(token.id, url, altura))) avisar('Não deu pra trocar a imagem do token.', true)
            }}
            onFechar={() => setTokenDasVariacoes(null)}
          />
        )
      })()}

      {fichasAbertas.map((id) => {
        const a = atores.atores.find((x) => x.id === id)
        if (!a) return null
        const nivel = nivelNoAtor(a)
        const fechar = () => setFichasAbertas((l) => l.filter((x) => x !== id))
        // Limitado: só o card de prévia (5.8), sem abrir a ficha inteira.
        if (nivel === 'limitado' || nivel === 'nenhum') {
          const img = imagemDoToken(a, (a.character_id && atores.fichas[a.character_id]?.avatar_url) || null)
          return (
            <Janela key={id} titulo={a.name} largura={300} onFechar={fechar}>
              <div className="ator-previa">
                {img && <img src={img} alt="" />}
                <strong>{a.name}</strong>
                <p className="janela-dica">A ficha deste personagem está oculta pra você.</p>
              </div>
            </Janela>
          )
        }
        return (
          <FichaPortatil
            key={id}
            ator={a}
            podeEditar={nivel === 'dono'}
            onMudarPv={(pv) => atores.salvar(a.id, { pv_atual: pv })}
            onRolar={rolarNoChat}
            onMostrar={mostrarNoChat}
            alvos={alvosComNome}
            onAtacar={atacarComAmeaca}
            onFechar={fechar}
          />
        )
      })}

      <PainelSessao conectados={online} latencia={latencia} fps={fps} />
    </main>
    </QuemVeContexto.Provider>
  )
}
