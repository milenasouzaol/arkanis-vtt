import { expect, it } from 'vitest'
import { fotoNaMoldura, nomeDaMoldura } from './molduras'

it('acha o nome da moldura no endereço gerado pelo Vite', () => {
  expect(nomeDaMoldura('/assets/frame-anfitriao-B2kq9xZa.png')).toBe('anfitriao')
  expect(nomeDaMoldura('/assets/frame-dama-de-sangue-Xy12AbCd.png')).toBe('dama-de-sangue')
  expect(nomeDaMoldura('https://x/foto.png')).toBeNull()
})

it('a foto cabe no furo da moldura', () => {
  expect(fotoNaMoldura('/assets/frame-anfitriao-B2kq9xZa.png')).toBe(86)
  // moldura muito fechada não deixa a foto sumir
  expect(fotoNaMoldura('/assets/frame-nidere-B2kq9xZa.png')).toBe(64)
  // moldura desconhecida usa o meio-termo
  expect(fotoNaMoldura('/assets/frame-nova-B2kq9xZa.png')).toBe(77)
})
