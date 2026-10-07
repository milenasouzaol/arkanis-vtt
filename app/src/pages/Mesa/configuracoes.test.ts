import { describe, expect, it } from 'vitest'
import { combateDa, nomesDasFontes, podeJogador } from './configuracoes'
import { conjuntoDoDado, estiloCompleto, ESTILO_PADRAO } from './estiloDados'

describe('configurações', () => {
  it('permissões: mestre sempre pode; jogador, se não estiver desligado', () => {
    expect(podeJogador({ medir: false }, 'medir', true)).toBe(true)
    expect(podeJogador({ medir: false }, 'medir', false)).toBe(false)
    expect(podeJogador({}, 'pingar', false)).toBe(true)
    expect(podeJogador(null, 'criarDiario', false)).toBe(true)
  })
  it('combate e fontes', () => {
    expect(combateDa({})).toEqual({ vidaNoCarrossel: true, caveirasAutomaticas: true })
    expect(combateDa({ combate: { caveirasAutomaticas: false } }).caveirasAutomaticas).toBe(false)
    expect(nomesDasFontes({ fontes: [{ nome: 'Modesto', url: 'a', peso: '400', estilo: 'normal' }, { nome: 'Modesto ', url: 'b', peso: '700', estilo: 'normal' }] })).toEqual(['Modesto'])
  })
  it('estilo do dado: completa e conserta valores ruins', () => {
    expect(estiloCompleto(null)).toEqual(ESTILO_PADRAO)
    expect(estiloCompleto({ cor: 'vermelho', material: 'ouro' as never, textura: 'x' })).toMatchObject({ cor: ESTILO_PADRAO.cor, material: 'plastico', textura: 'none' })
  })
  it('conjunto de cor por tipo ou único', () => {
    const tipos = { 20: '#7c4fe0' }
    expect(conjuntoDoDado(ESTILO_PADRAO, 20, tipos)).toMatchObject({ background: '#7c4fe0', material: 'plastic', texture: 'none' })
    const unico = conjuntoDoDado({ ...ESTILO_PADRAO, modo: 'unica', cor: '#ff0000', material: 'vidro', textura: 'fire' }, 20, tipos)
    expect(unico).toMatchObject({ background: '#ff0000', material: 'glass', texture: 'fire' })
    expect(unico.name).not.toBe(conjuntoDoDado(ESTILO_PADRAO, 20, tipos).name)
  })
})

import { brilhoDoEstilo, clarear } from './brilhoDosDados'

describe('animação dos dados', () => {
  it('cada textura ganha o seu efeito; metal sem textura brilha', () => {
    expect(brilhoDoEstilo({ textura: 'fire', material: 'plastico' })).toBe('fogo')
    expect(brilhoDoEstilo({ textura: 'stars', material: 'plastico' })).toBe('constelacao')
    expect(brilhoDoEstilo({ textura: 'astral', material: 'vidro' })).toBe('constelacao')
    expect(brilhoDoEstilo({ textura: 'none', material: 'metal' })).toBe('metal')
    expect(brilhoDoEstilo({ textura: 'none', material: 'plastico' })).toBeNull()
    expect(brilhoDoEstilo({ textura: 'marble', material: 'plastico' })).toBeNull()
  })
  it('clarear puxa pro branco; metal polido virou metal', () => {
    expect(clarear('#000000', 1)).toBe('#ffffff')
    expect(clarear('#ff0000', 0)).toBe('#ff0000')
    expect(estiloCompleto({ material: 'metal_polido' as never }).material).toBe('metal')
  })
})

describe('elementos nos dados', () => {
  it('o efeito do elemento vence a textura; Nenhum desliga', () => {
    expect(brilhoDoEstilo({ textura: 'fire', material: 'plastico', efeito: 'sangue' })).toBe('sangue')
    expect(brilhoDoEstilo({ textura: 'fire', material: 'plastico', efeito: 'nenhum' })).toBeNull()
    expect(brilhoDoEstilo({ textura: 'fire', material: 'plastico', efeito: 'auto' })).toBe('fogo')
    expect(estiloCompleto({ efeito: 'energia', cor: '#00ff00' })).toMatchObject({ efeito: 'energia', cor: '#1a1466', modo: 'unica', contorno: '#9a4dff' })
    expect(estiloCompleto({ efeito: 'banana' as never }).efeito).toBe('auto')
  })
})
