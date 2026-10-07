import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth, type StatusAcesso } from '../lib/AuthContext'

type Pedido = { user_id: string; status: StatusAcesso; email: string | null; nome: string | null; criado_em: string; decidido_em: string | null }

const ROTULO: Record<StatusAcesso, string> = { pendente: 'Esperando', aprovado: 'Aprovado', recusado: 'Recusado', bloqueado: 'Bloqueado' }

// Pedidos de Acesso (pedido da Millie, 07/10): só a administradora vê. Quem criou conta aparece
// como "Esperando"; ela aprova ou recusa um por um, e pode bloquear depois.
export default function PedidosDeAcesso() {
  const { session, acesso } = useAuth()
  const [lista, setLista] = useState<Pedido[]>([])
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    const { data } = await supabase.from('acesso_usuarios').select('user_id, status, email, nome, criado_em, decidido_em').order('criado_em', { ascending: false })
    setLista((data ?? []) as Pedido[])
  }, [])

  useEffect(() => {
    if (!acesso.admin) return
    carregar()
    // Pedido novo chega na hora.
    const canal = supabase
      .channel('acessos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'acesso_usuarios' }, () => carregar())
      .subscribe()
    return () => {
      supabase.removeChannel(canal)
    }
  }, [acesso.admin, carregar])

  if (!acesso.admin) return <Navigate to="/jogar" replace />

  async function decidir(p: Pedido, status: StatusAcesso) {
    setOcupado(p.user_id)
    setErro(null)
    const { error } = await supabase.rpc('decidir_acesso', { p_user_id: p.user_id, p_status: status })
    setOcupado(null)
    if (error) setErro(error.message)
    else carregar()
  }

  const esperando = lista.filter((p) => p.status === 'pendente')
  const outros = lista.filter((p) => p.status !== 'pendente')
  const linha = (p: Pedido) => {
    const eu = p.user_id === session?.user.id
    return (
      <li key={p.user_id} className={`acesso-linha ${p.status}`}>
        <div className="acesso-quem">
          <strong>{p.nome || p.email || 'Sem nome'}</strong>
          <small>{p.email}{' · '}criou a conta em {new Date(p.criado_em).toLocaleDateString('pt-BR')}</small>
        </div>
        <span className={`acesso-status ${p.status}`}>{eu ? 'Você' : ROTULO[p.status]}</span>
        {!eu && (
          <div className="acesso-botoes">
            {p.status !== 'aprovado' && <button type="button" className="btn-pill" disabled={ocupado === p.user_id} onClick={() => decidir(p, 'aprovado')}>Aprovar</button>}
            {p.status === 'pendente' && <button type="button" className="btn-pill acesso-recusar" disabled={ocupado === p.user_id} onClick={() => decidir(p, 'recusado')}>Recusar</button>}
            {p.status === 'aprovado' && (
              <button type="button" className="btn-pill acesso-recusar" disabled={ocupado === p.user_id} onClick={() => window.confirm(`Bloquear ${p.nome || p.email}? A pessoa perde o acesso na hora.`) && decidir(p, 'bloqueado')}>
                Bloquear
              </button>
            )}
          </div>
        )}
      </li>
    )
  }

  return (
    <main className="acesso-pagina">
      <header>
        <h1>Pedidos de Acesso</h1>
        <p>Quem cria conta no Arkanis fica esperando até você aprovar. Só quem estiver aprovado entra no site.</p>
        <Link to="/perfil" className="acesso-voltar">Voltar pro perfil</Link>
      </header>
      {erro && <p className="acesso-erro">{erro}</p>}
      <section>
        <h2>Esperando ({esperando.length})</h2>
        {esperando.length ? <ul>{esperando.map(linha)}</ul> : <p className="acesso-vazio">Nenhum pedido novo.</p>}
      </section>
      <section>
        <h2>Contas</h2>
        <ul>{outros.map(linha)}</ul>
      </section>
    </main>
  )
}
