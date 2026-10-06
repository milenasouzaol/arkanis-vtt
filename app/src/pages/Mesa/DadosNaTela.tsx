import { useEffect, useRef } from 'react'
import { DIE_COLOR } from '../CharacterSheet/RollResult'
import type { Mensagem } from './chat'
import { chavesDe, dadosNovos, notacaoUnica, type Dado } from './dados3d'
import { tocarSom, tocarSomDeArma } from '../../lib/sons'
import { armaDoRotulo } from '../../lib/somDasArmas'

// Biblioteca de dados 3D (MIT): https://github.com/3d-dice/dice-box-threejs
type Caixa = {
  initialize(): Promise<void>
  roll(n: string): Promise<unknown>
  clearDice(): void
  DiceColors: { makeColorSet(c: Record<string, unknown>): Promise<unknown> }
  DiceFactory: { create(tipo: string): unknown; applyColorSet(c: unknown): void }
}

const TIPOS = [4, 6, 8, 10, 12, 20, 100]

const TEMPO_NA_TELA = 2600 // depois que param, os dados ficam um pouco e somem

// Dados 3D caindo na tela (pedido da Millie, 06/10), por cima da mesa, pra todo mundo: cada
// rolagem nova que chega no chat (ficha, mira, cura, interação com item) cai na tela parando no
// mesmo número. Cada dado na cor do tipo dele, igual aos dadinhos do chat e da ficha.
export default function DadosNaTela({ mensagens }: { mensagens: Mensagem[] | null }) {
  const caixa = useRef<Caixa | null>(null)
  const carregando = useRef<Promise<Caixa | null> | null>(null)
  const vistos = useRef<Set<string> | null>(null)
  // Cada rolagem na fila, com a arma (se for o dado de ataque).
  const fila = useRef<{ dados: Dado[]; arma: { nome: string; dano: string | null } | null }[]>([])
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
          baseScale: 90,
          strength: 1.4,
        }) as unknown as Caixa
        await c.initialize()
        // Cada dado na cor do tipo dele (como os dadinhos do chat e da ficha): a fábrica de dados
        // usa a cor ativa na hora de criar, então a cor certa entra logo antes de cada dado nascer.
        const cores: Record<string, unknown> = {}
        for (const s of TIPOS) {
          const cor = DIE_COLOR[s] ?? '#5a5a66'
          cores[`d${s}`] = await c.DiceColors.makeColorSet({ name: `arkanis-d${s}`, foreground: '#ffffff', background: cor, outline: '#000000', edge: cor, texture: 'none', material: 'plastic' })
        }
        const criar = c.DiceFactory.create.bind(c.DiceFactory)
        c.DiceFactory.create = (tipo: string) => {
          if (cores[tipo]) c.DiceFactory.applyColorSet(cores[tipo])
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
    const { dados, arma } = item
    rolando.current = true
    window.clearTimeout(timer.current)
    const c = await iniciar()
    if (!c) {
      rolando.current = false
      return
    }
    palco.current?.classList.add('ativo')
    c.clearDice()
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
    }, fila.current.length ? 700 : TEMPO_NA_TELA)
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
      // Dado de ataque: o da mira (botão Ataque) ou a rolagem "Ataque: [arma]" da ficha.
      const acao = m.acao?.tipo === 'ataque' ? m.acao : null
      const doAtaque = acao && chaves.includes(`${m.id}:ataque`) ? { nome: acao.ataque.nome, dano: acao.ataque.partes[0]?.tipo ?? null } : null
      const daFicha = chaves.includes(`${m.id}:rolagem`) && m.rolagem ? armaDoRotulo(m.rolagem.label) : null
      fila.current.push({ dados, arma: doAtaque ?? (daFicha ? { nome: daFicha, dano: null } : null) })
    }
    proxima()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mensagens])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return <div id="dados-na-tela" ref={palco} className="dados-na-tela" aria-hidden />
}
