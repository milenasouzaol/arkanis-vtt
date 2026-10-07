import { useEffect, useRef } from 'react'
import { DIE_COLOR } from '../CharacterSheet/RollResult'
import type { Mensagem } from './chat'
import { chavesDe, dadosNovos, notacaoUnica, type Dado } from './dados3d'
import { tocarSom, tocarSomDeArma } from '../../lib/sons'
import { armaDoRotulo } from '../../lib/somDasArmas'
import { conjuntoDoDado, estiloCompleto, EVENTO_PREFERENCIAS, lerPreferenciasDados, type EstiloDados, type PreferenciasDados } from './estiloDados'

// Rolar de teste (Configurações → Dados): mostra os dados com o estilo escolhido, só pra quem testou.
export const EVENTO_TESTAR_DADOS = 'arkanis-testar-dados'

// Biblioteca de dados 3D (MIT): https://github.com/3d-dice/dice-box-threejs
type Caixa = {
  initialize(): Promise<void>
  roll(n: string): Promise<unknown>
  clearDice(): void
  DiceColors: { makeColorSet(c: Record<string, unknown>): Promise<unknown> }
  DiceFactory: { create(tipo: string): unknown; applyColorSet(c: unknown): void; baseScale: number; geometries: Record<string, unknown> }
}

const ESCALA_BASE = 90

// Dados 3D caindo na tela (pedido da Millie, 06/10), por cima da mesa, pra todo mundo: cada
// rolagem nova que chega no chat (ficha, mira, cura, interação com item) cai na tela parando no
// mesmo número. Cada dado na cor do tipo dele, igual aos dadinhos do chat e da ficha.
// Cada um rola com o dado que escolheu (estilos: id da pessoa → estilo, do perfil); quem vê decide
// se mostra os dados 3D, o tamanho e quanto tempo ficam na tela (Configurações → Dados).
export default function DadosNaTela({ mensagens, estilos = {} }: { mensagens: Mensagem[] | null; estilos?: Record<string, Partial<EstiloDados> | null> }) {
  const caixa = useRef<Caixa | null>(null)
  const carregando = useRef<Promise<Caixa | null> | null>(null)
  const vistos = useRef<Set<string> | null>(null)
  // Cada rolagem na fila, com a arma (se for o dado de ataque).
  const fila = useRef<{ dados: Dado[]; arma: { nome: string; dano: string | null } | null; estilo: EstiloDados; teste?: boolean }[]>([])
  // A cor/material de cada tipo de dado da rolagem da vez (a fábrica lê na hora de criar o dado).
  const conjuntos = useRef<Record<string, unknown>>({})
  const prefs = useRef<PreferenciasDados>(lerPreferenciasDados())
  const estilosRef = useRef(estilos)
  useEffect(() => {
    estilosRef.current = estilos
  }, [estilos])
  useEffect(() => {
    const mudou = (e: Event) => (prefs.current = (e as CustomEvent<PreferenciasDados>).detail)
    const testar = (e: Event) => {
      const estilo = estiloCompleto((e as CustomEvent<Partial<EstiloDados>>).detail)
      fila.current.push({ dados: [4, 6, 8, 10, 12, 20].map((l) => ({ sides: l, value: 1 + Math.floor(Math.random() * l) })), arma: null, estilo, teste: true })
      proxima()
    }
    window.addEventListener(EVENTO_PREFERENCIAS, mudou)
    window.addEventListener(EVENTO_TESTAR_DADOS, testar)
    return () => {
      window.removeEventListener(EVENTO_PREFERENCIAS, mudou)
      window.removeEventListener(EVENTO_TESTAR_DADOS, testar)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const rolando = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  const palco = useRef<HTMLDivElement>(null)

  async function iniciar(): Promise<Caixa | null> {
    if (caixa.current) return caixa.current
    carregando.current ??= (async () => {
      try {
        const { default: DiceBox } = await import('@3d-dice/dice-box-threejs')
        const c = new DiceBox('#dados-na-tela', {
          assetPath: '/dados3d/',
          sounds: false,
          shadows: true,
          theme_material: 'plastic',
          theme_texture: 'none',
          gravity_multiplier: 400,
          baseScale: ESCALA_BASE,
          strength: 1.4,
        }) as unknown as Caixa
        await c.initialize()
        // A fábrica de dados usa a cor ativa na hora de criar: a cor certa (do estilo de quem rolou,
        // por tipo) entra logo antes de cada dado nascer.
        const criar = c.DiceFactory.create.bind(c.DiceFactory)
        c.DiceFactory.create = (tipo: string) => {
          const conj = conjuntos.current[tipo]
          if (conj) c.DiceFactory.applyColorSet(conj)
          return criar(tipo)
        }
        caixa.current = c
        return c
      } catch {
        return null // sem WebGL ou sem a biblioteca: só não mostra a animação
      }
    })()
    return carregando.current
  }

  async function proxima() {
    if (rolando.current) return
    const item = fila.current.shift()
    if (!item) return
    const { dados, arma, estilo, teste } = item
    // Dados 3D desligados (Configurações): só o som.
    if (!prefs.current.mostrar && !teste) {
      if (dados.length) tocarSom('dado')
      if (arma) tocarSomDeArma(arma.nome, arma.dano)
      proxima()
      return
    }
    rolando.current = true
    window.clearTimeout(timer.current)
    const c = await iniciar()
    if (!c) {
      rolando.current = false
      return
    }
    palco.current?.classList.add('ativo')
    c.clearDice()
    // Tamanho dos dados na tela de quem vê: a fábrica refaz as formas quando muda.
    const escala = Math.round(ESCALA_BASE * Math.min(1.6, Math.max(0.5, prefs.current.tamanho)))
    if (c.DiceFactory.baseScale !== escala) {
      c.DiceFactory.baseScale = escala
      c.DiceFactory.geometries = {}
    }
    const novos: Record<string, unknown> = {}
    for (const l of new Set(dados.map((d) => d.sides))) {
      try {
        novos[`d${l}`] = await c.DiceColors.makeColorSet(conjuntoDoDado(estilo, l, DIE_COLOR))
      } catch {
        // textura que não carregou: o dado sai na cor padrão
      }
    }
    conjuntos.current = novos
    const notacao = notacaoUnica(dados)
    if (notacao) {
      tocarSom('dado')
      if (arma) tocarSomDeArma(arma.nome, arma.dano)
      // Se algo travar, não prende a fila pra sempre.
      await Promise.race([c.roll(notacao).catch(() => null), new Promise((r) => setTimeout(r, 9000))])
    }
    timer.current = window.setTimeout(() => {
      c.clearDice()
      palco.current?.classList.remove('ativo')
      rolando.current = false
      proxima()
    }, fila.current.length ? 700 : Math.max(800, prefs.current.tempo * 1000))
  }

  // Cada rolagem nova (ou passo novo de uma ação) entra na fila. O que já estava no chat quando a
  // mesa abriu não rola de novo.
  useEffect(() => {
    if (!mensagens) return
    if (!vistos.current) {
      vistos.current = new Set(mensagens.flatMap(chavesDe))
      return
    }
    for (const m of mensagens) {
      const { dados, chaves } = dadosNovos(m, vistos.current)
      for (const k of chaves) vistos.current.add(k)
      if (!dados.length) continue
      // Iniciativa do começo do combate: só no chat, sem dado caindo na tela (pedido da Millie).
      if (!m.acao && m.rolagem && /iniciativa/i.test(m.rolagem.label)) continue
      // Dado de ataque: o da mira (botão Ataque) ou a rolagem "Ataque: [arma]" da ficha.
      const acao = m.acao?.tipo === 'ataque' ? m.acao : null
      const doAtaque = acao && chaves.includes(`${m.id}:ataque`) ? { nome: acao.ataque.nome, dano: acao.ataque.partes[0]?.tipo ?? null } : null
      const daFicha = chaves.includes(`${m.id}:rolagem`) && m.rolagem ? armaDoRotulo(m.rolagem.label) : null
      fila.current.push({ dados, arma: doAtaque ?? (daFicha ? { nome: daFicha, dano: null } : null), estilo: estiloCompleto(estilosRef.current[m.user_id]) })
    }
    proxima()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mensagens])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return <div id="dados-na-tela" ref={palco} className="dados-na-tela" aria-hidden />
}
