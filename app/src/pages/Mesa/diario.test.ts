import { describe, expect, it } from 'vitest'
import { embutirYoutube, exportarDiario, importarDiario, moverPagina, nivelNoDiario, novaPagina, paginasQueBatem, VIDEO_PADRAO } from './diario'

describe('diário', () => {
  it('página nova: nome padrão pelo tipo; vídeo vem com as opções', () => {
    expect(novaPagina('', 'pdf', 'a')).toMatchObject({ id: 'a', nome: 'PDF', tipo: 'pdf', mostrarTitulo: true })
    expect(novaPagina('Cena', 'video', 'b').video).toEqual(VIDEO_PADRAO)
  })
  it('quem é dono: mestre, quem escreveu, ou pelo acesso', () => {
    const e = { author_id: 'j1', acesso_padrao: 'observador' as const, acesso_jogadores: { j2: 'nenhum' as const } }
    expect(nivelNoDiario(e, 'x', true)).toBe('dono')
    expect(nivelNoDiario(e, 'j1', false)).toBe('dono')
    expect(nivelNoDiario(e, 'j2', false)).toBe('nenhum')
    expect(nivelNoDiario(e, 'j3', false)).toBe('observador')
  })
  it('mover página e procurar', () => {
    const l = [novaPagina('A', 'texto', '1'), novaPagina('B', 'texto', '2'), { ...novaPagina('C', 'texto', '3'), texto: '<p>O barman sabe</p>' }]
    expect(moverPagina(l, 0, 2).map((p) => p.id)).toEqual(['2', '3', '1'])
    expect([...paginasQueBatem(l, 'BARMAN')]).toEqual(['3'])
    expect(paginasQueBatem(l, '').size).toBe(3)
  })
  it('YouTube vira embutido com as opções', () => {
    const u = embutirYoutube('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { ...VIDEO_PADRAO, loop: true, inicio: 30 })!
    expect(u).toContain('/embed/dQw4w9WgXcQ?')
    expect(u).toContain('loop=1')
    expect(u).toContain('playlist=dQw4w9WgXcQ')
    expect(u).toContain('start=30')
    expect(embutirYoutube('https://youtu.be/dQw4w9WgXcQ')).toContain('dQw4w9WgXcQ')
    expect(embutirYoutube('https://site.com/video.mp4')).toBeNull()
  })
  it('exportar e importar', () => {
    const json = exportarDiario({ name: 'Teste', paginas: [novaPagina('A', 'texto', '1')] })
    const d = importarDiario(json)!
    expect(d.name).toBe('Teste')
    expect(d.paginas[0].nome).toBe('A')
    expect(d.paginas[0].id).not.toBe('1')
    expect(importarDiario('lixo')).toBeNull()
  })
})
