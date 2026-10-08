// Nome de arquivo que o armazenamento aceita: sem acento, sem espaço nem símbolo
// ("Jovem urbano com equipamento tático.png" dava "Invalid key").
export function nomeSeguro(nome: string): string {
  return nome.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]/g, '_') || 'arquivo'
}
