import { describe, expect, it } from 'vitest'
import { chavesDe, dadosNovos, gruposDeDados, notacaoUnica } from './dados3d'
import type { Mensagem } from './chat'

const msg = (c: Partial<Mensagem>) => ({ id: 'm', ...c }) as Mensagem

describe('dados 3D', () => {
  it('rolagem da ficha: os dados dela, inclusive os descartados', () => {
    const m = msg({ rolagem: { label: 'Luta', total: 18, detail: '', bonus: 5, dice: [{ sides: 20, value: 13 }, { sides: 20, value: 4, discarded: true }] } })
    expect(dadosNovos(m, new Set()).dados).toEqual([{ sides: 20, value: 13 }, { sides: 20, value: 4 }])
  })
  it('ação da mira: só o que é novo (ataque já visto, dano chegando agora)', () => {
    const m = msg({ acao: { tipo: 'ataque', estado: { ataque: { rolls: [17] }, dano: { dados: [{ sides: 8, value: 6 }] } } } as unknown as Mensagem['acao'] })
    const r = dadosNovos(m, new Set(['m:ataque']))
    expect(r.dados).toEqual([{ sides: 8, value: 6 }])
    expect(r.chaves).toEqual(['m:dano'])
  })
  it('interação com item e marcar o que já existia', () => {
    const m = msg({ acao: { tipo: 'interacao', teste: { rolls: [9, 15] }, rolagem: { dados: [{ sides: 6, value: 3 }] }, estado: {} } as unknown as Mensagem['acao'] })
    expect(dadosNovos(m, new Set()).dados).toHaveLength(3)
    expect(dadosNovos(m, new Set(chavesDe(m))).dados).toEqual([])
  })
  it('uma rolagem só, com os resultados na ordem dos grupos', () => {
    expect(notacaoUnica([{ sides: 20, value: 15 }, { sides: 6, value: 2 }, { sides: 20, value: 7 }])).toBe('2d20+1d6@15,7,2')
    expect(notacaoUnica([])).toBeNull()
  })
  it('agrupa por tipo, na ordem; ignora dado que não existe', () => {
    expect(gruposDeDados([{ sides: 20, value: 15 }, { sides: 6, value: 2 }, { sides: 20, value: 7 }])).toEqual([
      { sides: 20, notacao: '2d20@15,7' },
      { sides: 6, notacao: '1d6@2' },
    ])
    const m = msg({ rolagem: { label: '', total: 0, detail: '', bonus: 0, dice: [{ sides: 3, value: 2 }, { sides: 6, value: 9 }] } })
    expect(dadosNovos(m, new Set()).dados).toEqual([])
  })
})
