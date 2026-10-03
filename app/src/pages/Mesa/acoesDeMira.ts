// Chamadas ao banco do Sistema de Mira (KAN-51). As contas ficam em mira.ts; o banco confere
// quem pode fazer cada passo e grava cada um uma vez só.
import { supabase } from '../../lib/supabase'
import { recordRoll } from '../../lib/rollHistory'
import type { Mensagem } from './chat'
import {
  danoNoAlvo, defesaDoAlvo, perfilDoAlvo, rolarAtaque, rolarDanoDoAtaque,
  type AcaoAtaque, type Alvo, type AtaqueDaAcao, type DadosDoAlvo,
} from './mira'

function motivoDoErro(e: { message?: string } | null): string | null {
  return e ? e.message || 'Não deu certo.' : null
}

export async function dadosDoAlvo(tokenId: string): Promise<DadosDoAlvo | null> {
  const { data } = await supabase.rpc('dados_do_alvo', { p_token_id: tokenId })
  return (data as DadosDoAlvo | null) ?? null
}

// Ficha (ou ameaça, pelo mestre) usou um ataque com alvos marcados: vai pro chat com os botões.
export async function postarAtaque(p: {
  campanhaId: string
  characterId: string | null
  autor: { nome: string; foto: string | null }
  ataque: AtaqueDaAcao
  alvos: Alvo[]
}): Promise<string | null> {
  const acao: Omit<AcaoAtaque, 'estado'> = { tipo: 'ataque', atacante: p.autor.nome, ataque: p.ataque, alvos: p.alvos }
  const { error } = await supabase.rpc('postar_acao', {
    p_campaign_id: p.campanhaId,
    p_character_id: p.characterId,
    p_autor_nome: p.autor.nome,
    p_autor_foto: p.autor.foto,
    p_acao: acao,
  })
  return motivoDoErro(error)
}

// Botão Ataque: rola e confere a Defesa de cada alvo. Alvo sem ficha (só uma imagem) conta
// como atingido, porque não tem Defesa pra comparar.
export async function rolarAtaqueDaMensagem(m: Mensagem): Promise<string | null> {
  const acao = m.acao
  if (!acao) return null
  const r = rolarAtaque(acao.ataque)
  const acertos: Record<string, boolean> = {}
  for (const a of acao.alvos) {
    const dados = await dadosDoAlvo(a.token_id)
    const defesa = dados ? defesaDoAlvo(dados) : null
    acertos[a.token_id] = defesa === null || r.total >= defesa
  }
  const { error } = await supabase.rpc('registrar_na_acao', { p_msg_id: m.id, p_chave: 'ataque', p_valor: { ...r, acertos } })
  if (!error && m.character_id) {
    recordRoll({
      characterId: m.character_id, userId: m.user_id, campaignId: m.campaign_id, characterName: acao.atacante,
      label: `Ataque: ${acao.ataque.nome}${r.critico ? ' (crítico!)' : ''}`, total: r.total,
      detail: `d20 mantido: ${r.kept} (rolados: ${r.rolls.join(', ')}) + bônus ${r.bonus}`,
      dice: r.rolls.map((v) => ({ sides: 20, value: v, discarded: v !== r.kept })), bonus: r.bonus, semChat: true,
    })
  }
  return motivoDoErro(error)
}

// Botão Dano: rola (crítico multiplica os dados) e desconta da Vida de quem foi atingido,
// já com resistências, vulnerabilidades e o Bloqueio de quem bloqueou.
export async function rolarDanoDaMensagem(m: Mensagem): Promise<string | null> {
  const acao = m.acao
  const ataque = acao?.estado.ataque
  if (!acao || !ataque) return null
  const atingidos = acao.alvos.filter((a) => ataque.acertos[a.token_id])
  const d = rolarDanoDoAtaque(acao.ataque, ataque.critico)
  const efeitos: Record<string, { pv: number; san: number; motivos: string[] } | null> = {}
  for (const a of atingidos) {
    const dados = await dadosDoAlvo(a.token_id)
    efeitos[a.token_id] = dados && dados.tipo !== 'nenhum' ? danoNoAlvo(d.partes, perfilDoAlvo(dados), acao.estado.bloqueios?.[a.token_id] ?? 0) : null
  }
  const { error } = await supabase.rpc('registrar_na_acao', { p_msg_id: m.id, p_chave: 'dano', p_valor: { ...d, efeitos } })
  if (error) return motivoDoErro(error)
  if (m.character_id) {
    recordRoll({
      characterId: m.character_id, userId: m.user_id, campaignId: m.campaign_id, characterName: acao.atacante,
      label: d.critico ? `Dano Crítico: ${acao.ataque.nome} (x${acao.ataque.multiplicador})` : `Dano: ${acao.ataque.nome}`,
      total: d.total, detail: d.dados.map((x) => `d${x.sides}: ${x.value}`).join(' · '), dice: d.dados, bonus: acao.ataque.bonus_dano, semChat: true,
    })
  }
  for (const [tokenId, e] of Object.entries(efeitos)) {
    if (!e) continue
    const { error: erro } = await supabase.rpc('aplicar_dano_da_acao', { p_msg_id: m.id, p_token_id: tokenId, p_pv: e.pv, p_san: e.san })
    if (erro) return motivoDoErro(erro)
  }
  return null
}

export async function bloquearAtaque(m: Mensagem, tokenId: string): Promise<string | null> {
  const { error } = await supabase.rpc('bloquear_na_acao', { p_msg_id: m.id, p_token_id: tokenId })
  return motivoDoErro(error)
}
