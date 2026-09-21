import { describe, expect, it } from 'vitest'
import { bonusCondicionais, bonusDePericiaDaDescricao, bonusIncondicionais, resistenciasDoEfeito } from './itemMods'

// Descrições reais do catálogo, copiadas do banco.
const DESC = {
  peDeMorto: '+5 Furtividade; em cena de furtividade, ação chamativa de só se mover (correr/saltar) aumenta visibilidade em só +1 (em vez do padrão).',
  amuleto: '+2 Religião e Vontade.',
  camera: '+2 Investigação/Percepção; lanterna 9m ou visão no escuro.',
  binoculos: '+5 em Percepção pra observar coisas distantes.',
  corda: '10m; +5 em Atletismo pra descer buracos/prédios; amarrar pessoas.',
  mascara: '+10 em Fortitude contra efeitos que dependam de respiração.',
  documentos: '+2 Diplomacia/Enganação/Intimidação pra se passar pela identidade falsa.',
  hazmat: '+5 em resistência contra efeitos ambientais; resistência a químico 10.',
  espacial: '+10 resistência a efeitos ambientais, resistência a químico 20; 8h água/oxigênio; espaço de vestimenta.',
  sobrevivencia: '+5 em Sobrevivência pra acampar/orientar-se; permite o teste sem treinamento.',
}

describe('bônus incondicionais', () => {
  it('Pé de Morto: +5 Furtividade vale sempre', () => {
    expect(bonusIncondicionais(DESC.peDeMorto)).toEqual([
      { pericias: ['Furtividade'], valor: 5, condicao: '' },
    ])
  })

  it('Amuleto sagrado vale pras duas perícias da frase', () => {
    expect(bonusIncondicionais(DESC.amuleto)).toEqual([
      { pericias: ['Religião', 'Vontade'], valor: 2, condicao: '' },
    ])
  })

  it('Câmera Filmadora: a barra separa duas perícias', () => {
    const b = bonusIncondicionais(DESC.camera)
    expect(b).toHaveLength(1)
    expect(b[0].pericias).toEqual(['Investigação', 'Percepção'])
    expect(b[0].valor).toBe(2)
  })
})

describe('bônus condicionais', () => {
  // O ponto todo: somar esses direto deixaria a Percepção +5 pra sempre.
  it('Binóculos dependem de "pra observar coisas distantes"', () => {
    const b = bonusCondicionais(DESC.binoculos)
    expect(b).toHaveLength(1)
    expect(b[0].pericias).toEqual(['Percepção'])
    expect(b[0].valor).toBe(5)
    expect(b[0].condicao).toContain('observar coisas distantes')
    expect(bonusIncondicionais(DESC.binoculos)).toEqual([])
  })

  it('Corda, Máscara de Gás e Documentos falsos também são condicionais', () => {
    expect(bonusIncondicionais(DESC.corda)).toEqual([])
    expect(bonusIncondicionais(DESC.mascara)).toEqual([])
    expect(bonusIncondicionais(DESC.documentos)).toEqual([])
    expect(bonusCondicionais(DESC.corda)[0].pericias).toEqual(['Atletismo'])
    expect(bonusCondicionais(DESC.mascara)[0].valor).toBe(10)
  })

  it('Equipamento de Sobrevivência: "pra acampar" é condição', () => {
    expect(bonusCondicionais(DESC.sobrevivencia)[0].pericias).toEqual(['Sobrevivência'])
  })
})

describe('texto sem bônus de perícia', () => {
  it('não inventa bônus onde não há perícia', () => {
    expect(bonusDePericiaDaDescricao('Corda de 10m para amarrar pessoas.')).toEqual([])
    expect(bonusDePericiaDaDescricao('')).toEqual([])
    expect(bonusDePericiaDaDescricao(null)).toEqual([])
  })
})

describe('resistência de tipo que não é elemento', () => {
  it('Traje Hazmat dá resistência a químico 10', () => {
    expect(resistenciasDoEfeito(DESC.hazmat)).toContainEqual({ tipo: 'Químico', valor: 10 })
  })

  it('Traje espacial dá 20', () => {
    expect(resistenciasDoEfeito(DESC.espacial)).toContainEqual({ tipo: 'Químico', valor: 20 })
  })

  // "resistência contra efeitos ambientais" é condicional e não vira número fixo.
  it('não transforma "efeitos ambientais" em resistência', () => {
    const r = resistenciasDoEfeito(DESC.hazmat)
    expect(r.some((x) => /efeito/i.test(x.tipo))).toBe(false)
  })
})

describe('quais bônus valem, com e sem o liga/desliga', () => {
  // Mesma conta que a ficha faz: incondicionais sempre, condicionais só se ligados.
  function valendo(descricao: string, ligados: number[]) {
    const lista = [
      ...bonusIncondicionais(descricao),
      ...bonusCondicionais(descricao).filter((_, i) => ligados.includes(i)),
    ]
    const porPericia: Record<string, number> = {}
    for (const b of lista) for (const p of b.pericias) porPericia[p] = (porPericia[p] ?? 0) + b.valor
    return porPericia
  }

  it('binóculos desligados não somam nada', () => {
    expect(valendo(DESC.binoculos, [])).toEqual({})
  })

  it('binóculos ligados somam +5 em Percepção', () => {
    expect(valendo(DESC.binoculos, [0])).toEqual({ Percepção: 5 })
  })

  it('Pé de Morto soma mesmo sem ligar nada, porque vale sempre', () => {
    expect(valendo(DESC.peDeMorto, [])).toEqual({ Furtividade: 5 })
  })

  it('dois itens somam na mesma perícia', () => {
    const a = valendo(DESC.peDeMorto, [])
    const b = valendo(DESC.camera, [])
    expect(a.Furtividade).toBe(5)
    expect(b.Percepção).toBe(2)
  })
})
