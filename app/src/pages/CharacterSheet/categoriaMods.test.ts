import { describe, expect, it } from 'vitest'
import { categoriaComMods, degrausDeCategoria, type AppliedModifier } from './itemMods'

const mod = (name: string): AppliedModifier => ({ kind: 'modificacao', name, effect: '', elemento: null })
const mald = (name: string): AppliedModifier => ({ kind: 'maldicao', name, effect: '', elemento: 'sangue' })

describe('categoria sobe com modificações e maldições', () => {
  it('modificação +I; 1ª maldição +II; as outras +I', () => {
    expect(degrausDeCategoria([mod('Certeira')])).toBe(1)
    expect(degrausDeCategoria([mald('Sanguinária')])).toBe(2)
    expect(degrausDeCategoria([mald('Sanguinária'), mald('Lancinante'), mod('Cruel')])).toBe(4)
  })

  it('iguais não se acumulam', () => {
    expect(degrausDeCategoria([mod('Cruel'), mod('Cruel')])).toBe(1)
  })

  it('adicionar sobe, tirar desce', () => {
    expect(categoriaComMods('I', [], [mald('Cinética')])).toBe('III')
    expect(categoriaComMods('III', [mald('Cinética')], [])).toBe('I')
    expect(categoriaComMods('0', [], [mod('Discreta')])).toBe('I')
  })

  it('aplica só a diferença (ajuste feito à mão continua)', () => {
    expect(categoriaComMods('III', [mod('Reforçada')], [mod('Reforçada'), mod('Discreta')])).toBe('IV')
  })

  it('não passa de IV nem fica abaixo de 0', () => {
    expect(categoriaComMods('III', [], [mald('A'), mald('B')])).toBe('IV')
    expect(categoriaComMods('0', [mod('X')], [])).toBe('0')
  })

  it('categoria desconhecida fica como está', () => {
    expect(categoriaComMods(null, [], [mod('X')])).toBe(null)
  })
})
