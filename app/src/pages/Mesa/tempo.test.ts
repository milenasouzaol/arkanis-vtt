import { describe, expect, it } from 'vitest'
import {
  alternarRodando, avancar, climaDoDia, CUSTOM_PADRAO, estacaoDe, faseDaLua, horaDaPosicao, irParaAmanhecer, irParaAnoitecer, minutosAgora, nomeDaFase, periodo, dataDoDia, diaDaCampanha, diaDaSemana, diasNoMes, gradeDoMes, irPara, mesVizinho, momento, tempoAtivo, tempoCompleto,
  textoData, textoHora, type ConfigTempo,
} from './tempo'

const tradicional = (minutos = 0): ConfigTempo =>
  tempoCompleto({ modo: 'tradicional', relogio: true, calendario: true, inicio: { ano: 2026, mes: 10, dia: 7, hora: 8, minuto: 0 }, minutos })

const custom = (minutos = 0): ConfigTempo =>
  tempoCompleto({
    modo: 'custom', relogio: true, calendario: true, minutos,
    inicio: { ano: 312, mes: 1, dia: 1, hora: 0, minuto: 0 },
    custom: { horasNoDia: 10, minutosNaHora: 100, diasDaSemana: ['Lua', 'Sol', 'Sangue'], meses: [{ nome: 'Brasa', dias: 5 }, { nome: 'Cinza', dias: 4 }], sufixoAno: 'd.R.' },
  })

describe('tempo tradicional', () => {
  it('começa na data e hora inicial', () => {
    const t = tradicional()
    const m = momento(t)
    expect(textoHora(m)).toBe('08:00')
    expect(textoData(t, m)).toBe('Quarta, 7 de Outubro de 2026')
  })

  it('o relógio passando vira o dia, o mês e o ano', () => {
    expect(textoData(tradicional(), momento(tradicional(16 * 60)))).toBe('Quinta, 8 de Outubro de 2026')
    const fimDoAno = tradicional((84 * 24 + 16) * 60) // 31/12 00:00
    expect(momento(fimDoAno).data).toEqual({ ano: 2026, mes: 12, dia: 31 })
    expect(momento(avancar(fimDoAno, 24 * 60)).data).toEqual({ ano: 2027, mes: 1, dia: 1 })
  })

  it('fevereiro bissexto', () => {
    expect(diasNoMes(tradicional(), 2028, 2)).toBe(29)
    expect(diasNoMes(tradicional(), 2026, 2)).toBe(28)
    expect(diasNoMes(tradicional(), 1900, 2)).toBe(28)
  })

  it('não volta antes do começo', () => {
    expect(avancar(tradicional(30), -999).minutos).toBe(0)
  })

  it('ir para uma data e hora', () => {
    const t = irPara(tradicional(), { ano: 2026, mes: 10, dia: 9 }, 14, 30)
    expect(textoHora(momento(t))).toBe('14:30')
    expect(momento(t).dia).toBe(2)
  })

  it('a grade do mês começa no dia da semana certo', () => {
    const g = gradeDoMes(tradicional(), 2026, 10) // 1/10/2026 é quinta
    expect(g[0]).toEqual([null, null, null, null, 1, 2, 3])
    expect(g.flat().filter(Boolean)).toHaveLength(31)
  })
})

describe('tempo personalizado', () => {
  it('usa as horas, minutos, meses, semana e sufixo do mestre', () => {
    const t = custom(10 * 100 * 6 + 250) // 6 dias e 2h50
    const m = momento(t)
    expect(textoHora(m)).toBe('02:50')
    expect(m.data).toEqual({ ano: 312, mes: 2, dia: 2 })
    expect(textoData(t, m)).toBe('Lua, 2 de Cinza de 312 d.R.')
  })

  it('vira o ano depois do último mês', () => {
    expect(dataDoDia(custom(), 9)).toEqual({ ano: 313, mes: 1, dia: 1 })
    expect(mesVizinho(custom(), 312, 2, 1)).toEqual({ ano: 313, mes: 1 })
    expect(mesVizinho(custom(), 312, 1, -1)).toEqual({ ano: 311, mes: 2 })
  })

  it('a semana continua entre os meses', () => {
    const t = custom()
    expect(diaDaSemana(t, { ano: 312, mes: 1, dia: 1 })).toBe(0)
    expect(diaDaSemana(t, { ano: 312, mes: 2, dia: 1 })).toBe(5 % 3)
    expect(diaDaCampanha(t, { ano: 312, mes: 2, dia: 1 })).toBe(5)
  })
})

describe('tempo sem calendário', () => {
  it('mostra Dia 1, Dia 2…', () => {
    const t = { ...tradicional(24 * 60), calendario: false }
    expect(textoData(t, momento(t))).toBe('Dia 2')
  })

  it('ligado com relógio ou calendário', () => {
    expect(tempoAtivo(null)).toBe(false)
    expect(tempoAtivo({ relogio: false, calendario: false })).toBe(false)
    expect(tempoAtivo({ relogio: true, calendario: false })).toBe(true)
  })

  it('completa o que faltar com o padrão', () => {
    const t = tempoCompleto({ modo: 'custom', custom: { ...CUSTOM_PADRAO, meses: [], horasNoDia: 0 } })
    expect(t.custom.meses).toHaveLength(12)
    expect(t.custom.horasNoDia).toBe(24)
  })
})

describe('relógio correndo, faixa do dia, estação, lua e clima', () => {
  it('▶ corre sozinho e ⏸ guarda o que passou', () => {
    const t0 = tradicional()
    const rodando = alternarRodando(t0, 1_000_000)
    expect(minutosAgora(rodando, 1_000_000 + 90_000)).toBeCloseTo(1.5)
    const parado = alternarRodando(rodando, 1_000_000 + 120_000)
    expect(parado.rodando).toBeNull()
    expect(parado.minutos).toBeCloseTo(2)
  })

  it('mostra segundos e o formato 12h', () => {
    const m = momento(tradicional(5 * 60 + 2.5)) // 13:02:30
    expect(textoHora(m, { segundos: true })).toBe('13:02:30')
    expect(textoHora(m, { formato: '12h' })).toBe('1:02 PM')
  })

  it('arrastar a bolinha muda só a hora do dia', () => {
    const t = horaDaPosicao(tradicional(24 * 60), 0.75) // dia seguinte, 18:00
    const m = momento(t)
    expect(textoHora(m)).toBe('18:00')
    expect(m.dia).toBe(1)
  })

  it('amanhecer de amanhã e pôr do sol de hoje', () => {
    expect(textoHora(momento(irParaAmanhecer(tradicional())))).toBe('06:00')
    expect(momento(irParaAmanhecer(tradicional())).dia).toBe(1)
    expect(textoHora(momento(irParaAnoitecer(tradicional())))).toBe('18:00')
  })

  it('estação pela data, dando a volta no ano', () => {
    const t = tradicional()
    expect(estacaoDe(t, { ano: 2026, mes: 10, dia: 7 })?.nome).toBe('Primavera')
    expect(estacaoDe(t, { ano: 2026, mes: 1, dia: 10 })?.nome).toBe('Verão')
    expect(estacaoDe(t, { ano: 2026, mes: 12, dia: 25 })?.nome).toBe('Verão')
    expect(estacaoDe(t, { ano: 2026, mes: 7, dia: 1 })?.nome).toBe('Inverno')
  })

  it('lua de verdade no tradicional (cheia em 1/5/2026)', () => {
    const f = faseDaLua(tradicional(), { ano: 2026, mes: 5, dia: 1 })
    expect(nomeDaFase(f)).toBe('Lua cheia')
  })

  it('clima: o escolhido pelo mestre ou um sorteio fixo do bioma', () => {
    const t = tradicional()
    expect(climaDoDia({ ...t, clima: { '3': 'neve' } }, 3)).toBe('neve')
    expect(climaDoDia(t, 5)).toBe(climaDoDia(t, 5))
    const deserto = { ...t, bioma: 'deserto' as const }
    const dias = Array.from({ length: 60 }, (_, i) => climaDoDia(deserto, i))
    expect(dias).not.toContain('neve')
  })

  it('período do dia', () => {
    expect(periodo(tradicional(), momento(tradicional()))).toBe('dia')
    expect(periodo(tradicional(), momento(irParaAnoitecer(tradicional())))).toBe('entardecer')
    expect(periodo(tradicional(), momento(tradicional(15 * 60)))).toBe('noite')
  })
})
