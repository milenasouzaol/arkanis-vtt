/*
 * Vigia de erros do banco. A maioria das gravacoes da ficha nao confere o erro que o
 * Supabase devolve; quando algo falhava (coluna que nao existe, permissao, sem internet),
 * a ficha so ficava vazia ou nao salvava, sem aviso. Este fetch passa por baixo de todas
 * as chamadas e avisa a tela (AvisoErroBanco) quando uma delas da errado.
 */

export const EVENTO_ERRO_BANCO = 'arkanis:erro-banco'

export type ErroBanco = { acao: 'salvar' | 'carregar'; detalhe: string }

/**
 * Se a resposta merece aviso. So olha o banco e o armazenamento de arquivos (o login tem
 * as proprias mensagens). Leitura que volta 406 e o .single() sem linha: normal, sem aviso.
 */
export function deveAvisar(metodo: string, url: string, status: number): ErroBanco['acao'] | null {
  if (status < 400) return null
  if (!url.includes('/rest/v1/') && !url.includes('/storage/v1/')) return null
  const leitura = metodo === 'GET' || metodo === 'HEAD'
  if (leitura && status === 406) return null
  return leitura ? 'carregar' : 'salvar'
}

function avisar(erro: ErroBanco) {
  window.dispatchEvent(new CustomEvent<ErroBanco>(EVENTO_ERRO_BANCO, { detail: erro }))
}

export async function fetchVigiado(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const metodo = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
  let resposta: Response
  try {
    resposta = await fetch(input, init)
  } catch (e) {
    if (url.includes('/rest/v1/') || url.includes('/storage/v1/')) {
      avisar({ acao: metodo === 'GET' ? 'carregar' : 'salvar', detalhe: 'Sem conexão com o servidor.' })
    }
    throw e
  }
  const acao = deveAvisar(metodo, url, resposta.status)
  if (acao) {
    // Le uma copia: a resposta original segue intacta pro Supabase tratar.
    resposta.clone().json()
      .then((corpo) => avisar({ acao, detalhe: corpo?.message ?? corpo?.error ?? `Erro ${resposta.status}` }))
      .catch(() => avisar({ acao, detalhe: `Erro ${resposta.status}` }))
  }
  return resposta
}
