import { describe, expect, it } from 'vitest'
import { PATENTES, juntarProficiencias, patenteOf, proficienciasDeTexto } from './InventarioTopBox'

describe('patenteOf', () => {
  it('acha a patente pela chave', () => {
    expect(patenteOf('agente_de_elite').label).toBe('Agente de Elite')
  })

  it('cai em Sem Patente quando o personagem ainda nao tem patente nenhuma', () => {
    expect(patenteOf(null).key).toBe('sem_patente')
    expect(patenteOf(undefined).key).toBe('sem_patente')
    expect(patenteOf('patente_que_nao_existe').key).toBe('sem_patente')
  })
})

describe('limites de item por patente', () => {
  it('tem as 6 patentes, cada uma com as 4 categorias', () => {
    expect(PATENTES).toHaveLength(6)
    for (const p of PATENTES) expect(p.limites).toHaveLength(4)
  })

  it('nunca diminui o limite ao subir de patente', () => {
    for (let i = 1; i < PATENTES.length; i++) {
      for (let cat = 0; cat < 4; cat++) {
        expect(PATENTES[i].limites[cat]).toBeGreaterThanOrEqual(PATENTES[i - 1].limites[cat])
      }
    }
  })

  it('dentro da mesma patente, categoria mais alta nunca libera mais itens que a mais baixa', () => {
    for (const p of PATENTES) {
      for (let cat = 1; cat < 4; cat++) {
        expect(p.limites[cat]).toBeLessThanOrEqual(p.limites[cat - 1])
      }
    }
  })
})

describe('proficienciasDeTexto', () => {
  it('pega a proficiencia que o poder da', () => {
    expect(proficienciasDeTexto(['Armamento Pesado: proficiência com armas pesadas. Pré-requisito: For 2.']))
      .toEqual(['armas pesadas'])
  })

  it('para antes dos outros beneficios do mesmo poder', () => {
    expect(proficienciasDeTexto(['Balística Avançada: proficiência com armas táticas de fogo e +2 em dano com armas de fogo.']))
      .toEqual(['armas táticas de fogo'])
  })

  it('para no ponto-e-virgula', () => {
    expect(proficienciasDeTexto(['Mira de Elite: proficiência com armas de fogo de balas longas; soma Intelecto no dano.']))
      .toEqual(['armas de fogo de balas longas'])
  })

  it('ignora poder que nao da proficiencia nenhuma', () => {
    expect(proficienciasDeTexto(['Eclético: gaste 1 PE para ficar treinado numa perícia até o fim da cena.']))
      .toEqual([])
  })
})

describe('juntarProficiencias', () => {
  it('mantem o texto da classe quando nenhum poder acrescenta nada', () => {
    expect(juntarProficiencias(['Armas simples e proteções leves']))
      .toBe('Armas simples e proteções leves.')
  })

  it('junta tudo numa lista so, em vez de "... e X, Y e Z"', () => {
    expect(juntarProficiencias(['Armas simples, armas táticas e proteções leves', 'armas pesadas', 'Proteções Pesadas']))
      .toBe('Armas simples, armas táticas, proteções leves, armas pesadas e proteções pesadas.')
  })

  it('nao repete o que a classe ja dava, mesmo com caixa diferente', () => {
    expect(juntarProficiencias(['Armas simples e proteções leves', 'Armas Simples']))
      .toBe('Armas simples e proteções leves.')
  })

  it('devolve vazio quando nao ha proficiencia', () => {
    expect(juntarProficiencias([''])).toBe('')
  })
})
