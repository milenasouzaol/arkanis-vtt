import { describe, expect, it } from 'vitest'
import { canalDoSom, ordemDosSons, primeiroSom, proximoModo, proximoSom, segundosTocados, volumeFinal } from './playlists'

const sons = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

describe('playlist', () => {
  it('sequencial toca em ordem e para no fim', () => {
    expect(primeiroSom('sequencial', sons)).toBe('a')
    expect(proximoSom('sequencial', sons, 'a')).toBe('b')
    expect(proximoSom('sequencial', sons, 'c')).toBeNull()
  })
  it('repetir volta pro começo', () => {
    expect(proximoSom('repetir', sons, 'c')).toBe('a')
  })
  it('embaralhar nunca repete o mesmo em seguida', () => {
    expect(proximoSom('embaralhar', sons, 'a', () => 0)).toBe('b')
    expect(proximoSom('embaralhar', sons, 'a', () => 0.99)).toBe('c')
    expect(proximoSom('embaralhar', [{ id: 'a' }], 'a', () => 0.5)).toBe('a')
  })
  it('playlist vazia não toca', () => {
    expect(primeiroSom('sequencial', [])).toBeNull()
  })
  it('modo gira entre os três', () => {
    expect(proximoModo('sequencial')).toBe('embaralhar')
    expect(proximoModo('repetir')).toBe('sequencial')
  })
  it('canal do som: o dele ou o da playlist', () => {
    expect(canalDoSom({ canal: null }, { canal: 'ambiente' })).toBe('ambiente')
    expect(canalDoSom({ canal: 'efeitos' }, { canal: 'ambiente' })).toBe('efeitos')
  })
  it('volume final e ordem', () => {
    expect(volumeFinal(0.8, 1)).toBe(0.8)
    expect(volumeFinal(0.8, 0.5)).toBe(0.4)
    expect(volumeFinal(0.8, 0)).toBe(0)
    expect(ordemDosSons([{ sort: 2, created_at: 'a', name: 'x' }, { sort: 1, created_at: 'b', name: 'y' }]).map((s) => s.name)).toEqual(['y', 'x'])
  })
  it('em que segundo o som está', () => {
    expect(segundosTocados('2026-10-05T10:00:00Z', new Date('2026-10-05T10:01:30Z').getTime())).toBe(90)
    expect(segundosTocados(null)).toBe(0)
  })
})
