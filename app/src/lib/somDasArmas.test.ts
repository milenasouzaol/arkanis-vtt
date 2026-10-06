import { describe, expect, it } from 'vitest'
import { armaDoRotulo, somDaArma } from './somDasArmas'

describe('som das armas', () => {
  it('pelo nome da arma do livro', () => {
    expect(somDaArma('Katana')).toBe('katana')
    expect(somDaArma('Espada')).toBe('espada')
    expect(somDaArma('Faca tática')).toBe('espada')
    expect(somDaArma('Machado Tático')).toBe('machado')
    expect(somDaArma('Marreta')).toBe('machado')
    expect(somDaArma('Arco composto')).toBe('arco')
    expect(somDaArma('Pistola pesada')).toBe('pistola')
    expect(somDaArma('Revólver compacto')).toBe('revolver')
    expect(somDaArma('Espingarda Serrada')).toBe('escopeta')
    expect(somDaArma('Espingarda de cano duplo')).toBe('escopeta-estrondosa')
    expect(somDaArma('Fuzil de assalto')).toBe('fuzil')
    expect(somDaArma('Fuzil de precisão')).toBe('sniper')
    expect(somDaArma('Designated Marksman Rifle (DMR)')).toBe('sniper')
    expect(somDaArma('Submetralhadora')).toBe('submetralhadora')
    expect(somDaArma('Metralhadora')).toBe('metralhadora')
    expect(somDaArma('Lança-chamas')).toBe('lanca-chamas')
    expect(somDaArma('Lança')).toBe('espada')
    expect(somDaArma('Ataque Desarmado')).toBeNull()
  })
  it('nome próprio cai pelo tipo de dano', () => {
    expect(somDaArma('Minha Glock')).toBe('pistola')
    expect(somDaArma('Velha Amiga', 'B')).toBe('pistola')
    expect(somDaArma('Lâmina do Avô', 'C')).toBe('espada')
    expect(somDaArma('Coisa', 'Impacto')).toBe('machado')
    expect(somDaArma('Coisa')).toBeNull()
  })
  it('arma do rótulo da rolagem', () => {
    expect(armaDoRotulo('Ataque: Pistola (crítico!)')).toBe('Pistola')
    expect(armaDoRotulo('Ataque: Fuzil de assalto — Caído')).toBe('Fuzil de assalto')
    expect(armaDoRotulo('Dano: Pistola')).toBeNull()
  })
})
