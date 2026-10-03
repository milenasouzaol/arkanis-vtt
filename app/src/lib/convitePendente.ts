// Pra onde voltar depois de entrar na conta ou de criar um personagem, quando a pessoa
// estava no meio de entrar numa campanha (pelo convite ou pela janelinha de escolher
// personagem). Fica no navegador — vale até depois de confirmar o e-mail noutra aba — e
// some quando ela entra na campanha.

const CHAVE = 'arkanis:destino-campanha'

export function guardarDestino(caminho: string) {
  try {
    localStorage.setItem(CHAVE, caminho)
  } catch {
    // sem armazenamento, a pessoa só precisa abrir o link de novo
  }
}

export function guardarConvite(codigo: string) {
  guardarDestino(`/campanha/entrar/${encodeURIComponent(codigo)}`)
}

export function esquecerDestino() {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    // nada a fazer
  }
}

export function destinoDepoisDoConvite(padrao: string): string {
  try {
    const caminho = localStorage.getItem(CHAVE)
    // Só caminhos internos, nunca uma URL de fora.
    return caminho && caminho.startsWith('/') && !caminho.startsWith('//') ? caminho : padrao
  } catch {
    return padrao
  }
}
