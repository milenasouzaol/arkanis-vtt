import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { juntarMensagem, linkificar, sanitizarHtml, type Mensagem, type ModoEnvio } from './chat'

const CAMPOS = 'id, campaign_id, user_id, character_id, modo, autor_nome, autor_foto, conteudo, rolagem, destacada, revelada, created_at'

// Mensagens do chat da campanha em tempo real. O banco (RLS) já decide quem vê o quê;
// aqui só se carrega, escuta e envia.
export function useChat(campanhaId: string | undefined) {
  const [mensagens, setMensagens] = useState<Mensagem[] | null>(null)

  useEffect(() => {
    if (!campanhaId) return
    let cancelado = false
    supabase
      .from('chat_messages')
      .select(CAMPOS)
      .eq('campaign_id', campanhaId)
      .order('created_at', { ascending: false })
      .limit(300)
      .then(({ data }) => {
        if (!cancelado) setMensagens(((data ?? []) as Mensagem[]).reverse())
      })

    const canal = supabase
      .channel(`chat:${campanhaId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `campaign_id=eq.${campanhaId}` }, (p) => {
        setMensagens((lista) => juntarMensagem(lista ?? [], p.new as Mensagem))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `campaign_id=eq.${campanhaId}` }, (p) => {
        setMensagens((lista) => juntarMensagem(lista ?? [], p.new as Mensagem))
      })
      // Exclusões chegam só com o id (o Realtime não filtra DELETE por coluna).
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages' }, (p) => {
        const id = (p.old as { id?: string }).id
        if (id) setMensagens((lista) => (lista ?? []).filter((m) => m.id !== id))
      })
      .subscribe()

    return () => {
      cancelado = true
      supabase.removeChannel(canal)
    }
  }, [campanhaId])

  const enviar = useCallback(
    async (dados: { userId: string; modo: ModoEnvio; autor: { nome: string; foto: string | null }; personagemId: string | null; html: string }) => {
      if (!campanhaId) return false
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          campaign_id: campanhaId,
          user_id: dados.userId,
          character_id: dados.personagemId,
          modo: dados.modo,
          autor_nome: dados.autor.nome,
          autor_foto: dados.autor.foto,
          conteudo: sanitizarHtml(linkificar(dados.html)),
        })
        .select(CAMPOS)
        .single()
      if (error) return false
      setMensagens((lista) => juntarMensagem(lista ?? [], data as Mensagem))
      return true
    },
    [campanhaId],
  )

  // Rolagem feita na mesa (ex.: o mestre rolando o teste de uma ameaça) vai pro chat (12.3).
  const enviarRolagem = useCallback(
    async (dados: { userId: string; modo: ModoEnvio; autor: { nome: string; foto: string | null }; rolagem: Mensagem['rolagem'] }) => {
      if (!campanhaId) return false
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({ campaign_id: campanhaId, user_id: dados.userId, modo: dados.modo, autor_nome: dados.autor.nome, autor_foto: dados.autor.foto, rolagem: dados.rolagem })
        .select(CAMPOS)
        .single()
      if (error) return false
      setMensagens((lista) => juntarMensagem(lista ?? [], data as Mensagem))
      return true
    },
    [campanhaId],
  )

  const alterar = useCallback(async (id: string, campos: Partial<Pick<Mensagem, 'destacada' | 'revelada'>>) => {
    const { data } = await supabase.from('chat_messages').update(campos).eq('id', id).select(CAMPOS).single()
    if (data) setMensagens((lista) => juntarMensagem(lista ?? [], data as Mensagem))
  }, [])

  const excluir = useCallback(async (id: string) => {
    const { error } = await supabase.from('chat_messages').delete().eq('id', id)
    if (!error) setMensagens((lista) => (lista ?? []).filter((m) => m.id !== id))
  }, [])

  const limpar = useCallback(async () => {
    if (!campanhaId) return
    const { error } = await supabase.from('chat_messages').delete().eq('campaign_id', campanhaId)
    if (!error) setMensagens([])
  }, [campanhaId])

  return { mensagens, enviar, enviarRolagem, alterar, excluir, limpar }
}

// Imagem colada, arrastada ou escolhida no chat vai pro bucket e volta como URL pública.
export async function enviarImagemDoChat(userId: string, arquivo: File): Promise<string | null> {
  const caminho = `${userId}/${Date.now()}-${arquivo.name.replace(/[^\w.-]/g, '_') || 'imagem.png'}`
  const { error } = await supabase.storage.from('chat_images').upload(caminho, arquivo)
  if (error) return null
  return supabase.storage.from('chat_images').getPublicUrl(caminho).data.publicUrl
}
