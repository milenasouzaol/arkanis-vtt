import { describe, expect, it } from 'vitest'
import { aceitaArquivo, caixaNoPonto, categoriaDoObjeto, guardarDesenho, guardarObjeto, nomeDoArquivo, vaiProMapa } from './posicionaveis'
import type { ObjetoCena } from './cenas'
import { ESTILO_PADRAO, type Desenho } from './desenhos'

const png = { name: 'arvore.png', type: 'image/png' }
const gif = { name: 'fogo.gif', type: 'image/gif' }
const pdf = { name: 'mapa.pdf', type: 'application/pdf' }
const mp3 = { name: 'porta.mp3', type: 'audio/mpeg' }

describe('posicionáveis', () => {
  it('cada aba aceita o arquivo dela', () => {
    expect(aceitaArquivo('token', png)).toBe(true)
    expect(aceitaArquivo('token', mp3)).toBe(false)
    expect(aceitaArquivo('luz', gif)).toBe(true)
    expect(aceitaArquivo('desenho', pdf)).toBe(true)
    expect(aceitaArquivo('desenho', { name: 'carta.docx', type: '' })).toBe(true)
    expect(aceitaArquivo('objeto', pdf)).toBe(false)
    expect(aceitaArquivo('som', mp3)).toBe(true)
    expect(aceitaArquivo('som', png)).toBe(false)
    expect(aceitaArquivo('nota', png)).toBe(false)
  })
  it('nome = nome do arquivo sem extensão', () => {
    expect(nomeDoArquivo('Carro Velho.png')).toBe('Carro Velho')
    expect(nomeDoArquivo('.png')).toBe('Sem nome')
  })
  it('o que vai pro mapa', () => {
    expect(vaiProMapa({ categoria: 'nota', url: null, dados: {} })).toBe(false)
    expect(vaiProMapa({ categoria: 'desenho', url: 'x/mapa.pdf', dados: {} })).toBe(false)
    expect(vaiProMapa({ categoria: 'desenho', url: 'x/rabisco.png', dados: {} })).toBe(true)
    expect(vaiProMapa({ categoria: 'token', url: 'x/a.png', dados: {} })).toBe(true)
  })
  it('da mesa pra aba: camada decide a aba', () => {
    expect(categoriaDoObjeto({ layer: 'mapa' })).toBe('objeto')
    expect(categoriaDoObjeto({ layer: 'token' })).toBe('token')
    expect(categoriaDoObjeto({ layer: 'mestre' })).toBe('token')
    expect(categoriaDoObjeto({ layer: 'mapa', luz: true })).toBe('luz')
    const o = { name: null, image_url: 'u', width: 100.4, height: 50, layer: 'mapa' } as unknown as ObjetoCena
    expect(guardarObjeto(o)).toEqual({ categoria: 'objeto', name: 'Objeto', url: 'u', dados: { largura: 100, altura: 50 } })
  })
  it('desenho guardado leva a forma, sem posição', () => {
    const d = { id: '1', tipo: 'texto', texto: 'Cuidado', x: 5, y: 5, width: 10, height: 20, rotation: 0, pontos: [], estilo: ESTILO_PADRAO } as unknown as Desenho
    const g = guardarDesenho(d)
    expect(g.name).toBe('Cuidado')
    expect(g.dados.desenho).not.toHaveProperty('x')
    expect(g.dados.desenho?.width).toBe(10)
  })
  it('entra centrado onde soltou', () => {
    expect(caixaNoPonto({ x: 100, y: 100 }, 50, 20)).toEqual({ x: 75, y: 90, width: 50, height: 20 })
  })
})
