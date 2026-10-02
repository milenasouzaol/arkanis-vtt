import { describe, expect, it } from 'vitest'
import { deveAvisar } from './avisoErro'

const rest = 'https://x.supabase.co/rest/v1/characters?id=eq.1'

describe('deveAvisar', () => {
  it('gravação que falha avisa "salvar"', () => {
    expect(deveAvisar('PATCH', rest, 400)).toBe('salvar')
    expect(deveAvisar('POST', rest, 403)).toBe('salvar')
    expect(deveAvisar('DELETE', rest, 500)).toBe('salvar')
  })

  it('leitura que quebra avisa "carregar"', () => {
    expect(deveAvisar('GET', rest, 400)).toBe('carregar')
    expect(deveAvisar('GET', 'https://x.supabase.co/storage/v1/object/x', 404)).toBe('carregar')
  })

  // .single() sem linha devolve 406: é normal, não é erro pra pessoa.
  it('leitura 406 não avisa', () => {
    expect(deveAvisar('GET', rest, 406)).toBeNull()
  })

  it('sucesso e login não avisam', () => {
    expect(deveAvisar('PATCH', rest, 204)).toBeNull()
    expect(deveAvisar('POST', 'https://x.supabase.co/auth/v1/token', 400)).toBeNull()
  })
})
