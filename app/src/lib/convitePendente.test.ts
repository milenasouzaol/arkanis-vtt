import { beforeEach, expect, it } from 'vitest'
import { destinoDepoisDoConvite, esquecerDestino, guardarConvite, guardarDestino } from './convitePendente'

beforeEach(() => esquecerDestino())

it('sem nada pendente vai pro destino padrão', () => {
  expect(destinoDepoisDoConvite('/jogar')).toBe('/jogar')
})

it('com convite pendente volta pro convite', () => {
  guardarConvite('abc123')
  expect(destinoDepoisDoConvite('/jogar')).toBe('/campanha/entrar/abc123')
  expect(destinoDepoisDoConvite('/personagem/x')).toBe('/campanha/entrar/abc123')
})

it('volta pra mesa de onde saiu pra criar personagem', () => {
  guardarDestino('/mesa/123')
  expect(destinoDepoisDoConvite('/jogar')).toBe('/mesa/123')
})

it('nunca manda pra fora do site', () => {
  guardarDestino('https://golpe.com')
  expect(destinoDepoisDoConvite('/jogar')).toBe('/jogar')
  guardarDestino('//golpe.com')
  expect(destinoDepoisDoConvite('/jogar')).toBe('/jogar')
})

it('depois de entrar na campanha some', () => {
  guardarConvite('abc123')
  esquecerDestino()
  expect(destinoDepoisDoConvite('/jogar')).toBe('/jogar')
})
