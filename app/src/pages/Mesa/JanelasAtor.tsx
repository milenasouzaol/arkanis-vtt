import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faFloppyDisk, faImage, faPlus, faSkull, faUser, faUserGear, faXmark } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../../lib/supabase'
import Janela, { Campo } from './Janela'
import FichaAmeaca from './FichaAmeaca'
import { NIVEIS, nomeDoArquivo, ROTULO_TIPO, type Ator, type NivelAcesso, type Variacao } from './atores'
import { pastasEmLista, type Pasta } from './cenas'
import type { CriaturaResumo } from './useAtores'

// Criar Personagem (12.7): pra Ordem Paranormal só NPC e Ameaça/Monstro.
export function CriarPersonagem({ pastas, pastaInicial, onCriarNPC, onCriarAmeaca, onFechar }: {
  pastas: Pasta[]
  pastaInicial: string | null
  onCriarNPC: (nome: string, pasta: string | null) => void
  onCriarAmeaca: (c: CriaturaResumo & { pv_maximo: number | null }, pasta: string | null) => void
  onFechar: () => void
}) {
  const [tipo, setTipo] = useState<'npc' | 'ameaca'>('npc')
  const [nome, setNome] = useState('')
  const [pasta, setPasta] = useState(pastaInicial ?? '')
  const [busca, setBusca] = useState('')
  const [lista, setLista] = useState<(CriaturaResumo & { pv_maximo: number | null })[]>([])
  const [escolhida, setEscolhida] = useState<string | null>(null)

  // Ameaça vem do bestiário.
  useEffect(() => {
    if (tipo !== 'ameaca') return
    const t = setTimeout(() => {
      let q = supabase.from('creatures').select('id, name, vd, image_url, tipo_criatura, tamanho, pv_maximo').order('name').limit(60)
      if (busca.trim()) q = q.ilike('name', `%${busca.trim()}%`)
      q.then(({ data }) => setLista((data ?? []) as (CriaturaResumo & { pv_maximo: number | null })[]))
    }, 200)
    return () => clearTimeout(t)
  }, [tipo, busca])

  function criar() {
    if (tipo === 'npc') onCriarNPC(nome.trim() || 'Novo NPC', pasta || null)
    else {
      const c = lista.find((x) => x.id === escolhida)
      if (c) onCriarAmeaca(c, pasta || null)
    }
  }

  return (
    <Janela titulo="Criar Personagem" icone={faUser} largura={440} onFechar={onFechar}>
      <div className="janela-form">
        <div className="criar-personagem-tipos" role="radiogroup" aria-label="Tipo">
          {(['npc', 'ameaca'] as const).map((t) => (
            <label key={t} className={`criar-personagem-tipo${tipo === t ? ' ativo' : ''}`}>
              <input type="radio" checked={tipo === t} onChange={() => setTipo(t)} />
              <FontAwesomeIcon icon={t === 'npc' ? faUser : faSkull} /> {ROTULO_TIPO[t]}
            </label>
          ))}
        </div>

        {tipo === 'npc' ? (
          <Campo rotulo="Nome">
            <input autoFocus value={nome} placeholder="Novo NPC" aria-label="Nome" onChange={(e) => setNome(e.target.value)} />
          </Campo>
        ) : (
          <>
            <input value={busca} placeholder="Procurar no bestiário" aria-label="Procurar no bestiário" onChange={(e) => setBusca(e.target.value)} />
            <ul className="criar-personagem-bestiario">
              {lista.map((c) => (
                <li key={c.id}>
                  <button type="button" className={escolhida === c.id ? 'ativo' : undefined} onClick={() => setEscolhida(c.id)}>
                    <span className="ator-token">{c.image_url ? <img src={c.image_url} alt="" /> : <FontAwesomeIcon icon={faSkull} />}</span>
                    <span className="criar-personagem-nome">
                      <strong>{c.name}</strong>
                      <small>VD: {c.vd ?? '—'} · {[c.tipo_criatura, c.tamanho].filter(Boolean).join(' - ')}</small>
                    </span>
                  </button>
                </li>
              ))}
              {!lista.length && <li className="janela-dica">Nada encontrado.</li>}
            </ul>
          </>
        )}

        <Campo rotulo="Pasta">
          <select value={pasta} aria-label="Pasta" onChange={(e) => setPasta(e.target.value)}>
            <option value="">Sem pasta</option>
            {pastasEmLista(pastas).map((p) => <option key={p.id} value={p.id}>{p.rotulo}</option>)}
          </select>
        </Campo>

        <button type="button" className="janela-botao" disabled={tipo === 'ameaca' && !escolhida} onClick={criar}>
          <FontAwesomeIcon icon={faCheck} /> Criar Personagem
        </button>
      </div>
    </Janela>
  )
}

// Configuração de Propriedade (12.7): quem acessa a ficha deste NPC/Ameaça.
export function ConfigurarPropriedadeAtor({ ator, jogadores, onSalvar, onFechar }: {
  ator: Ator
  jogadores: { userId: string; rotulo: string }[]
  onSalvar: (campos: Pick<Ator, 'acesso_padrao' | 'acesso_jogadores' | 'mostrar_mestres'>) => void
  onFechar: () => void
}) {
  const [padrao, setPadrao] = useState<NivelAcesso>(ator.acesso_padrao)
  const [porJogador, setPorJogador] = useState<Record<string, NivelAcesso>>(ator.acesso_jogadores)
  const [mestres, setMestres] = useState(ator.mostrar_mestres)

  return (
    <Janela titulo={`Configuração de Propriedade: ${ator.name}`} icone={faUserGear} largura={460} onFechar={onFechar}>
      <form
        className="janela-form"
        onSubmit={(e) => {
          e.preventDefault()
          onSalvar({ acesso_padrao: padrao, acesso_jogadores: porJogador, mostrar_mestres: mestres })
        }}
      >
        <label className="janela-check">
          <input type="checkbox" checked={mestres} onChange={(e) => setMestres(e.target.checked)} /> Mostrar Usuários Mestres
        </label>
        <Campo rotulo="Todos os Jogadores">
          <select value={padrao} aria-label="Todos os Jogadores" onChange={(e) => setPadrao(e.target.value as NivelAcesso)}>
            {NIVEIS.map((n) => <option key={n.id} value={n.id}>{n.rotulo}</option>)}
          </select>
        </Campo>
        {jogadores.map((j) => (
          <Campo key={j.userId} rotulo={j.rotulo}>
            <select
              value={porJogador[j.userId] ?? ''}
              aria-label={j.rotulo}
              onChange={(e) => {
                const v = e.target.value as NivelAcesso | ''
                setPorJogador((p) => {
                  const n = { ...p }
                  if (v) n[j.userId] = v
                  else delete n[j.userId]
                  return n
                })
              }}
            >
              <option value="">Padrão</option>
              {NIVEIS.map((n) => <option key={n.id} value={n.id}>{n.rotulo}</option>)}
            </select>
          </Campo>
        ))}
        <p className="janela-dica">Nenhum: o jogador nem vê. Limitado: vê o card. Observador: só olha a ficha. Dono: edita tudo.</p>
        <button type="submit" className="janela-botao"><FontAwesomeIcon icon={faFloppyDisk} /> Salvar Alterações</button>
      </form>
    </Janela>
  )
}

// Configurar Token (12.7): Token Principal + Tokens Variáveis, renomeáveis com o botão direito.
export function ConfigurarToken({ ator, onEnviar, onSalvar, onFechar }: {
  ator: Ator
  onEnviar: (arquivo: File) => Promise<string | null>
  onSalvar: (campos: Pick<Ator, 'token_url' | 'token_variacoes'>) => void
  onFechar: () => void
}) {
  const [principal, setPrincipal] = useState(ator.token_url)
  const [variacoes, setVariacoes] = useState<Variacao[]>(ator.token_variacoes)
  const [aviso, setAviso] = useState<string | null>(null)
  const principalRef = useRef<HTMLInputElement>(null)
  const variacaoRef = useRef<HTMLInputElement>(null)

  async function enviar(arquivos: File[], comoPrincipal: boolean) {
    const imagens = arquivos.filter((f) => f.type.startsWith('image/'))
    if (!imagens.length) return
    setAviso('Enviando…')
    for (const f of imagens) {
      const url = await onEnviar(f)
      if (!url) {
        setAviso('Não deu pra enviar a imagem.')
        return
      }
      if (comoPrincipal) setPrincipal(url)
      else setVariacoes((v) => [...v, { id: crypto.randomUUID(), nome: nomeDoArquivo(f.name), url }])
    }
    setAviso(null)
  }

  function renomear(v: Variacao) {
    const nome = window.prompt('Nome da variação:', v.nome)
    if (nome?.trim()) setVariacoes((l) => l.map((x) => (x.id === v.id ? { ...x, nome: nome.trim() } : x)))
  }

  return (
    <Janela titulo={`Configurar Token: ${ator.name}`} icone={faImage} largura={520} onFechar={onFechar}>
      <div className="janela-form">
        <fieldset className="janela-grupo">
          <legend>Token Principal</legend>
          <p className="janela-dica">A imagem que vai pro mapa quando o personagem é arrastado, e a miniatura da lista.</p>
          <div className="token-principal">
            <button type="button" className="token-quadro" onClick={() => principalRef.current?.click()} aria-label="Escolher token principal">
              {principal ? <img src={principal} alt="" /> : <FontAwesomeIcon icon={faPlus} />}
            </button>
            {principal && <button type="button" className="janela-link" onClick={() => setPrincipal(null)}>Tirar</button>}
          </div>
          <input ref={principalRef} type="file" accept="image/*" hidden onChange={(e) => { enviar(Array.from(e.target.files ?? []), true); e.target.value = '' }} />
        </fieldset>

        <fieldset className="janela-grupo">
          <legend>Tokens Variáveis</legend>
          <p className="janela-dica">Outras aparências pra trocar em jogo (botão direito no token › Variação de Token). Botão direito aqui renomeia.</p>
          <div className="token-variacoes">
            {variacoes.map((v) => (
              <figure key={v.id} className="token-variacao" onContextMenu={(e) => { e.preventDefault(); renomear(v) }}>
                <div className="token-quadro"><img src={v.url} alt="" /></div>
                <figcaption>{v.nome}</figcaption>
                <button type="button" className="token-tirar" aria-label={`Tirar ${v.nome}`} onClick={() => setVariacoes((l) => l.filter((x) => x.id !== v.id))}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </figure>
            ))}
            <button type="button" className="token-quadro token-mais" aria-label="Adicionar variação" onClick={() => variacaoRef.current?.click()}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
          <input ref={variacaoRef} type="file" accept="image/*" multiple hidden onChange={(e) => { enviar(Array.from(e.target.files ?? []), false); e.target.value = '' }} />
        </fieldset>

        {aviso && <p className="janela-aviso">{aviso}</p>}
        <button type="button" className="janela-botao" onClick={() => onSalvar({ token_url: principal, token_variacoes: variacoes })}>
          <FontAwesomeIcon icon={faFloppyDisk} /> Salvar Alterações
        </button>
      </div>
    </Janela>
  )
}

// Excluir (12.7), com o texto da referência adaptado ("Personagem" no lugar de "Ator").
export function ConfirmarExclusao({ ator, onSim, onNao }: { ator: Ator; onSim: () => void; onNao: () => void }) {
  return (
    <Janela titulo={`Excluir ${ator.name}`} largura={380} onFechar={onNao}>
      <div className="janela-form">
        <p><strong>Você Tem Certeza?</strong> Este Personagem será excluído permanentemente e não poderá ser recuperado.</p>
        <div className="janela-linha">
          <button type="button" className="janela-botao" style={{ flex: 1 }} onClick={onSim}><FontAwesomeIcon icon={faCheck} /> Sim</button>
          <button type="button" className="janela-botao" style={{ flex: 1 }} onClick={onNao}><FontAwesomeIcon icon={faXmark} /> Não</button>
        </div>
      </div>
    </Janela>
  )
}

// Ficha portátil (12.7): janela flutuante, redimensionável. NPC e jogador abrem a ficha de
// Ordem Paranormal inteira (a mesma da seção 5, salvando sozinha); Ameaça abre a ficha dela.
export function FichaPortatil({ ator, podeEditar, onMudarPv, onFechar }: {
  ator: Ator
  podeEditar: boolean
  onMudarPv: (pv: number) => void
  onFechar: () => void
}) {
  const ameaca = ator.tipo === 'ameaca' && ator.creature_id
  return (
    <Janela titulo={ator.name} icone={ameaca ? faSkull : faUser} largura={ameaca ? 440 : 1100} altura={ameaca ? 620 : 760} inicial={{ x: 40, y: 30 }} onFechar={onFechar}>
      {ameaca ? (
        <FichaAmeaca criaturaId={ator.creature_id!} pvAtual={ator.pv_atual} podeEditar={podeEditar} onMudarPv={onMudarPv} />
      ) : (
        <iframe className="ficha-portatil" title={`Ficha de ${ator.name}`} src={`/personagem/${ator.character_id}?mesa=${ator.campaign_id}`} />
      )}
    </Janela>
  )
}
