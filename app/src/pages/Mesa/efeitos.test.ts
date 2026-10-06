import { describe, expect, it } from 'vitest'
import { andar, aparencia, corClara, corDoMiolo, efeitoCompleto, efeitoPadrao, nascer, quantasNascem } from './efeitos'

const fixo = (v: number) => () => v

describe('efeitos animados', () => {
  it('padrão por tipo e completar', () => {
    expect(efeitoPadrao('fogo')).toMatchObject({ tipo: 'fogo', direcao: -90 })
    expect(efeitoCompleto({ tipo: 'agua', cor: '#000000' })).toMatchObject({ tipo: 'agua', cor: '#000000', tamanho: 3 })
    expect(efeitoCompleto(null)).toBeNull()
    expect(efeitoCompleto({ tipo: 'banana' as never })).toBeNull()
  })
  it('fogo nasce na base e sobe; gira junto com o objeto', () => {
    const e = efeitoPadrao('fogo')
    const p = nascer(e, 100, 0, fixo(0.5))
    expect(p.vy).toBeLessThan(0)
    expect(Math.abs(p.vx)).toBeLessThan(1e-6)
    const virado = nascer(e, 100, 90, fixo(0.5)) // objeto girado 90°: o fogo sai pra direita
    expect(virado.vx).toBeGreaterThan(0)
  })
  it('anda, some no fim da vida, e a água cai com a gravidade', () => {
    const e = efeitoPadrao('agua')
    const p = nascer(e, 100, 0, fixo(0.5))
    const vy0 = p.vy
    expect(andar(p, e, 100, 0.1)).toBe(true)
    expect(p.vy).toBeGreaterThan(vy0)
    expect(andar(p, e, 100, 10)).toBe(false)
  })
  it('aparece e some aos poucos', () => {
    const e = efeitoPadrao('fumaca')
    const p = nascer(e, 100, 0, fixo(0.5))
    expect(aparencia(p, e, 100).alfa).toBe(0)
    p.idade = p.vida * 0.5
    expect(aparencia(p, e, 100).alfa).toBeGreaterThan(0.2)
    p.idade = p.vida * 0.999
    expect(aparencia(p, e, 100).alfa).toBeLessThan(0.01)
  })
  it('quantas nascem guarda o resto', () => {
    const e = { ...efeitoPadrao('nuvem'), quantidade: 1 } // 5/s
    const a = quantasNascem(e, 0.1, 0)
    expect(a.n).toBe(0)
    expect(quantasNascem(e, 0.1, a.sobra).n).toBe(1)
  })
  it('cor clara brilha, escura pinta; miolo clareia', () => {
    expect(corClara('#ff5a14')).toBe(true)
    expect(corClara('#000000')).toBe(false)
    expect(corDoMiolo('#ff0000')).toMatch(/^#ff/)
  })
})
