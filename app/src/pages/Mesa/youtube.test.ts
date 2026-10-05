import { expect, it } from 'vitest'
import { idDoYoutube, motivoDoErroYoutube } from './youtube'

it('acha o vídeo nos vários formatos de link do YouTube', () => {
  expect(idDoYoutube('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  expect(idDoYoutube('https://youtu.be/dQw4w9WgXcQ?si=abc')).toBe('dQw4w9WgXcQ')
  expect(idDoYoutube('https://www.youtube.com/watch?list=PL1&v=dQw4w9WgXcQ&t=30s')).toBe('dQw4w9WgXcQ')
  expect(idDoYoutube('https://youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  expect(idDoYoutube('https://music.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  expect(idDoYoutube('https://site.com/chuva.mp3')).toBeNull()
})

it('explica por que o vídeo não toca', () => {
  expect(motivoDoErroYoutube(150)).toContain('não deixa tocar fora do YouTube')
  expect(motivoDoErroYoutube(100)).toContain('não encontrado')
})
