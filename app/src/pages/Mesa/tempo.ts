// Tempo e Calendário (pedido da Millie, 07/10): o mestre liga o relógio, o calendário ou os dois.
// O tempo da campanha é um número só: minutos passados desde o começo (data inicial). Daí sai a
// hora, o dia, o mês e o ano, no calendário tradicional (o nosso) ou num personalizado.
// Regras puras, testadas.

export type MesCustom = { nome: string; dias: number }

export type CalendarioCustom = {
  horasNoDia: number
  minutosNaHora: number
  diasDaSemana: string[]
  meses: MesCustom[]
  sufixoAno: string // ex.: "d.R." → "Ano 312 d.R."
}

export type ConfigTempo = {
  relogio: boolean
  calendario: boolean
  jogadoresVeem: boolean
  modo: 'tradicional' | 'custom'
  // Começo da campanha. Mês e dia contam de 1.
  inicio: { ano: number; mes: number; dia: number; hora: number; minuto: number }
  custom: CalendarioCustom
  // Minutos passados desde o início (o mestre avança). Pode ter fração (segundos).
  minutos: number
  // Tempo correndo sozinho (▶): desde quando, e quantos minutos de jogo por minuto real.
  rodando: string | null
  velocidade: number
  // O que aparece (escolha do mestre, no modelo do Mini Calendar).
  formato: '24h' | '12h'
  segundos: boolean
  mostrarLua: boolean
  cicloLua: number // dias de uma lua nova até a outra
  mostrarEstacao: boolean
  estacoes: Estacao[]
  amanhecer: number // hora em que o sol nasce
  anoitecer: number // hora em que o sol se põe
  mostrarClima: boolean
  bioma: Bioma
  clima: Record<string, Clima> // dia da campanha → clima escolhido pelo mestre (senão, gerado)
  tomDaCena: boolean // a cena escurece e esquenta conforme a hora
}

// Estação: começa num mês/dia e tem as duas cores da barra de cima (o mestre escolhe).
export type Estacao = { nome: string; mes: number; dia: number; cor: string; cor2: string }

export type Bioma = 'temperado' | 'tropical' | 'deserto' | 'polar'
export const BIOMAS: { id: Bioma; rotulo: string }[] = [
  { id: 'temperado', rotulo: 'Temperado' },
  { id: 'tropical', rotulo: 'Tropical' },
  { id: 'deserto', rotulo: 'Deserto' },
  { id: 'polar', rotulo: 'Polar' },
]

export type Clima = 'limpo' | 'nublado' | 'chuva' | 'tempestade' | 'neblina' | 'neve' | 'vento' | 'calor'
export const CLIMAS: { id: Clima; rotulo: string }[] = [
  { id: 'limpo', rotulo: 'Céu limpo' },
  { id: 'nublado', rotulo: 'Nublado' },
  { id: 'chuva', rotulo: 'Chuva' },
  { id: 'tempestade', rotulo: 'Tempestade' },
  { id: 'neblina', rotulo: 'Neblina' },
  { id: 'neve', rotulo: 'Neve' },
  { id: 'vento', rotulo: 'Vento forte' },
  { id: 'calor', rotulo: 'Calor intenso' },
]

// Estações do hemisfério sul (Brasil), com cores de partida que o mestre troca.
export const ESTACOES_PADRAO: Estacao[] = [
  { nome: 'Verão', mes: 12, dia: 21, cor: '#f2b33d', cor2: '#e8662e' },
  { nome: 'Outono', mes: 3, dia: 20, cor: '#c8743a', cor2: '#7a3b2a' },
  { nome: 'Inverno', mes: 6, dia: 21, cor: '#7aa7d8', cor2: '#3c5a8c' },
  { nome: 'Primavera', mes: 9, dia: 22, cor: '#e58fb8', cor2: '#7cc47f' },
]

export const MESES_TRADICIONAIS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
export const SEMANA_TRADICIONAL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export const CUSTOM_PADRAO: CalendarioCustom = {
  horasNoDia: 24,
  minutosNaHora: 60,
  diasDaSemana: [...SEMANA_TRADICIONAL],
  meses: MESES_TRADICIONAIS.map((nome, i) => ({ nome, dias: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i] })),
  sufixoAno: '',
}

export function tempoPadrao(hoje = new Date()): ConfigTempo {
  return {
    relogio: true,
    calendario: true,
    jogadoresVeem: true,
    modo: 'tradicional',
    inicio: { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1, dia: hoje.getDate(), hora: 8, minuto: 0 },
    custom: CUSTOM_PADRAO,
    minutos: 0,
    rodando: null,
    velocidade: 1,
    formato: '24h',
    segundos: true,
    mostrarLua: true,
    cicloLua: 29.53,
    mostrarEstacao: true,
    estacoes: ESTACOES_PADRAO,
    amanhecer: 6,
    anoitecer: 18,
    mostrarClima: false,
    bioma: 'temperado',
    clima: {},
    tomDaCena: false,
  }
}

// Desligado = nem relógio nem calendário.
export function tempoAtivo(t: Partial<ConfigTempo> | null | undefined): boolean {
  return !!t && (!!t.relogio || !!t.calendario)
}

// Junta o que veio do banco com o padrão (campos faltando, números inválidos).
export function tempoCompleto(t: Partial<ConfigTempo> | null | undefined): ConfigTempo {
  const p = tempoPadrao()
  const c = { ...CUSTOM_PADRAO, ...(t?.custom ?? {}) }
  return {
    ...p,
    ...(t ?? {}),
    inicio: { ...p.inicio, ...(t?.inicio ?? {}) },
    custom: {
      horasNoDia: Math.max(1, Math.round(c.horasNoDia) || 24),
      minutosNaHora: Math.max(1, Math.round(c.minutosNaHora) || 60),
      diasDaSemana: c.diasDaSemana.length ? c.diasDaSemana : [...SEMANA_TRADICIONAL],
      meses: c.meses.length ? c.meses.map((m) => ({ nome: m.nome, dias: Math.max(1, Math.round(m.dias) || 1) })) : CUSTOM_PADRAO.meses,
      sufixoAno: c.sufixoAno ?? '',
    },
    minutos: Math.max(0, Number(t?.minutos) || 0),
    velocidade: Math.max(0.1, Number(t?.velocidade) || 1),
    cicloLua: Math.max(1, Number(t?.cicloLua) || 29.53),
    estacoes: Array.isArray(t?.estacoes) ? t.estacoes : ESTACOES_PADRAO,
    clima: t?.clima ?? {},
  }
}

// Minutos por hora e horas por dia do modo escolhido.
export function medidas(t: ConfigTempo): { minutosNaHora: number; horasNoDia: number; minutosNoDia: number } {
  const mh = t.modo === 'custom' ? t.custom.minutosNaHora : 60
  const hd = t.modo === 'custom' ? t.custom.horasNoDia : 24
  return { minutosNaHora: mh, horasNoDia: hd, minutosNoDia: mh * hd }
}

export type Data = { ano: number; mes: number; dia: number } // mês e dia contam de 1

const UM_DIA = 86_400_000

function diaUTC(d: Data): number {
  const x = new Date(Date.UTC(2000, d.mes - 1, d.dia))
  x.setUTCFullYear(d.ano) // anos antes de 100 não viram 19xx
  return Math.round(x.getTime() / UM_DIA)
}

function diasNoAnoCustom(c: CalendarioCustom): number {
  return c.meses.reduce((s, m) => s + m.dias, 0)
}

// Número absoluto do dia (pra contar a semana e comparar datas).
function absoluto(t: ConfigTempo, d: Data): number {
  if (t.modo === 'tradicional') return diaUTC(d)
  const c = t.custom
  let n = d.ano * diasNoAnoCustom(c)
  for (let i = 0; i < d.mes - 1; i++) n += c.meses[i]?.dias ?? 0
  return n + d.dia - 1
}

function deAbsoluto(t: ConfigTempo, n: number): Data {
  if (t.modo === 'tradicional') {
    const x = new Date(n * UM_DIA)
    return { ano: x.getUTCFullYear(), mes: x.getUTCMonth() + 1, dia: x.getUTCDate() }
  }
  const c = t.custom
  const ano = Math.floor(n / diasNoAnoCustom(c))
  let resto = n - ano * diasNoAnoCustom(c)
  let mes = 0
  while (mes < c.meses.length - 1 && resto >= c.meses[mes].dias) {
    resto -= c.meses[mes].dias
    mes++
  }
  return { ano, mes: mes + 1, dia: resto + 1 }
}

// Dia da campanha de uma data: 0 = o dia em que começou (as anotações usam esse número).
export function diaDaCampanha(t: ConfigTempo, d: Data): number {
  return absoluto(t, d) - absoluto(t, t.inicio)
}

export function dataDoDia(t: ConfigTempo, dia: number): Data {
  return deAbsoluto(t, absoluto(t, t.inicio) + dia)
}

export function nomeDoMes(t: ConfigTempo, mes: number): string {
  return t.modo === 'custom' ? t.custom.meses[mes - 1]?.nome ?? `Mês ${mes}` : MESES_TRADICIONAIS[mes - 1]
}

export function diasDaSemana(t: ConfigTempo): string[] {
  return t.modo === 'custom' ? t.custom.diasDaSemana : SEMANA_TRADICIONAL
}

// Índice do dia da semana (0 = o primeiro da lista).
export function diaDaSemana(t: ConfigTempo, d: Data): number {
  const semana = diasDaSemana(t).length
  // 1/1/1970 foi quinta (índice 4); no personalizado, o dia 0 é o primeiro da semana.
  const base = t.modo === 'tradicional' ? absoluto(t, d) + 4 : absoluto(t, d)
  return ((base % semana) + semana) % semana
}

export function diasNoMes(t: ConfigTempo, ano: number, mes: number): number {
  if (t.modo === 'custom') return t.custom.meses[mes - 1]?.dias ?? 30
  if (mes !== 2) return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mes - 1]
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0 ? 29 : 28
}

export function mesesNoAno(t: ConfigTempo): number {
  return t.modo === 'custom' ? t.custom.meses.length : 12
}

export type Momento = {
  dia: number // dia da campanha (0 = o primeiro)
  data: Data
  hora: number
  minuto: number
  segundo: number
  semana: number // índice do dia da semana
  noDia: number // minutos desde a meia-noite
}

// Onde a campanha está agora.
export function momento(t: ConfigTempo): Momento {
  const { minutosNaHora, minutosNoDia } = medidas(t)
  const inicioNoDia = Math.min(minutosNoDia - 1, t.inicio.hora * minutosNaHora + t.inicio.minuto)
  // Arredonda no segundo, pra fração não virar 59.
  const total = Math.round((inicioNoDia + t.minutos) * 60) / 60
  const dia = Math.floor(total / minutosNoDia)
  const resto = total - dia * minutosNoDia
  const inteiros = Math.floor(resto)
  const data = dataDoDia(t, dia)
  return {
    dia, data, noDia: resto,
    hora: Math.floor(inteiros / minutosNaHora), minuto: inteiros % minutosNaHora, segundo: Math.min(59, Math.round((resto - inteiros) * 60)),
    semana: diaDaSemana(t, data),
  }
}

const doisDigitos = (n: number) => String(n).padStart(2, '0')

// 08:05, 08:05:20 ou 8:05 AM (o formato que o mestre escolheu).
export function textoHora(m: Pick<Momento, 'hora' | 'minuto'> & { segundo?: number }, opcoes: { formato?: '24h' | '12h'; segundos?: boolean } = {}): string {
  const seg = opcoes.segundos && m.segundo !== undefined ? `:${doisDigitos(m.segundo)}` : ''
  if (opcoes.formato === '12h') {
    const h = m.hora % 12 === 0 ? 12 : m.hora % 12
    return `${h}:${doisDigitos(m.minuto)}${seg} ${m.hora < 12 ? 'AM' : 'PM'}`
  }
  return `${doisDigitos(m.hora)}:${doisDigitos(m.minuto)}${seg}`
}

export function textoAno(t: ConfigTempo, ano: number): string {
  const sufixo = t.modo === 'custom' ? t.custom.sufixoAno.trim() : ''
  return sufixo ? `${ano} ${sufixo}` : String(ano)
}

// "Quarta, 7 de Outubro de 2026"; sem calendário, "Dia 3".
export function textoData(t: ConfigTempo, m: Momento): string {
  if (!t.calendario) return `Dia ${m.dia + 1}`
  return `${diasDaSemana(t)[m.semana]}, ${m.data.dia} de ${nomeDoMes(t, m.data.mes)} de ${textoAno(t, m.data.ano)}`
}

// Avança (ou volta, com negativo) sem passar de antes do início.
export function avancar(t: ConfigTempo, minutos: number): ConfigTempo {
  return { ...t, minutos: Math.max(0, t.minutos + minutos) }
}

// Leva até uma data e hora (o mestre acerta o relógio). Antes do início não dá.
export function irPara(t: ConfigTempo, d: Data, hora: number, minuto: number): ConfigTempo {
  const { minutosNaHora, minutosNoDia } = medidas(t)
  const inicioNoDia = t.inicio.hora * minutosNaHora + t.inicio.minuto
  const alvo = diaDaCampanha(t, d) * minutosNoDia + hora * minutosNaHora + minuto - inicioNoDia
  return { ...t, minutos: Math.max(0, alvo) }
}

// Grade do mês: semanas com os dias (null = espaço antes do dia 1).
export function gradeDoMes(t: ConfigTempo, ano: number, mes: number): (number | null)[][] {
  const semana = diasDaSemana(t).length
  const primeiro = diaDaSemana(t, { ano, mes, dia: 1 })
  const total = diasNoMes(t, ano, mes)
  const celulas: (number | null)[] = [...Array(primeiro).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
  while (celulas.length % semana) celulas.push(null)
  const linhas: (number | null)[][] = []
  for (let i = 0; i < celulas.length; i += semana) linhas.push(celulas.slice(i, i + semana))
  return linhas
}

// Mês anterior/seguinte (vira o ano).
export function mesVizinho(t: ConfigTempo, ano: number, mes: number, passo: 1 | -1): { ano: number; mes: number } {
  const n = mesesNoAno(t)
  const m = mes + passo
  if (m < 1) return { ano: ano - 1, mes: n }
  if (m > n) return { ano: ano + 1, mes: 1 }
  return { ano, mes: m }
}

// ---- Tempo correndo (▶) ----

// Com o relógio correndo, todo mundo calcula o agora sozinho a partir de quando começou: o banco só
// muda quando o mestre aperta ▶/⏸ ou mexe no tempo.
export function minutosAgora(t: ConfigTempo, agora = Date.now()): number {
  if (!t.rodando) return t.minutos
  const desde = Date.parse(t.rodando)
  if (Number.isNaN(desde)) return t.minutos
  return t.minutos + (Math.max(0, agora - desde) / 60_000) * t.velocidade
}

export function comAgora(t: ConfigTempo, agora = Date.now()): ConfigTempo {
  return { ...t, minutos: minutosAgora(t, agora) }
}

// ▶ guarda o instante; ⏸ guarda os minutos que passaram.
export function alternarRodando(t: ConfigTempo, agora = Date.now()): ConfigTempo {
  if (t.rodando) return { ...t, minutos: minutosAgora(t, agora), rodando: null }
  return { ...t, rodando: new Date(agora).toISOString() }
}

// Mexer no tempo com ele correndo: fixa o agora e continua correndo a partir daqui.
export function mexer(t: ConfigTempo, f: (x: ConfigTempo) => ConfigTempo, agora = Date.now()): ConfigTempo {
  const fixo = f(comAgora(t, agora))
  return { ...fixo, rodando: t.rodando ? new Date(agora).toISOString() : null }
}

// ---- Faixa do dia (a barrinha de baixo) ----

// Onde está o sol na faixa (0 = meia-noite, 1 = meia-noite seguinte).
export function posicaoNoDia(t: ConfigTempo, m: Momento): number {
  return m.noDia / medidas(t).minutosNoDia
}

// Arrastou a bolinha: a mesma data, na hora da posição (de minuto em minuto).
export function horaDaPosicao(t: ConfigTempo, posicao: number): ConfigTempo {
  const { minutosNoDia } = medidas(t)
  const m = momento(t)
  const alvo = Math.round(Math.min(0.9999, Math.max(0, posicao)) * minutosNoDia)
  return { ...t, minutos: Math.max(0, t.minutos - m.noDia + alvo) }
}

// Amanhecer de amanhã e pôr do sol de hoje (os botões do sol e da lua).
export function irParaAmanhecer(t: ConfigTempo): ConfigTempo {
  const { minutosNaHora, minutosNoDia } = medidas(t)
  const m = momento(t)
  return { ...t, minutos: t.minutos - m.noDia + minutosNoDia + t.amanhecer * minutosNaHora }
}

export function irParaAnoitecer(t: ConfigTempo): ConfigTempo {
  const { minutosNaHora } = medidas(t)
  const m = momento(t)
  return { ...t, minutos: Math.max(0, t.minutos - m.noDia + t.anoitecer * minutosNaHora) }
}

export type Periodo = 'noite' | 'amanhecer' | 'dia' | 'entardecer'

// Uma hora em volta do nascer e do pôr do sol conta como amanhecer/entardecer.
export function periodo(t: ConfigTempo, m: Momento): Periodo {
  const h = m.noDia / medidas(t).minutosNaHora
  if (Math.abs(h - t.amanhecer) <= 1) return 'amanhecer'
  if (Math.abs(h - t.anoitecer) <= 1) return 'entardecer'
  return h > t.amanhecer && h < t.anoitecer ? 'dia' : 'noite'
}

// Cores da faixa: noite azul-escura, amanhecer dourado, dia claro, entardecer laranja.
export function gradienteDoDia(t: ConfigTempo): string {
  const { horasNoDia } = medidas(t)
  const p = (h: number) => `${Math.round(Math.min(100, Math.max(0, (h / horasNoDia) * 100)))}%`
  return `linear-gradient(90deg, #0b1630 0%, #1d2b55 ${p(t.amanhecer - 1.5)}, #f2c14e ${p(t.amanhecer)}, #8fd3f4 ${p(t.amanhecer + 2)}, #8fd3f4 ${p(t.anoitecer - 2)}, #f08a3c ${p(t.anoitecer)}, #1d2b55 ${p(t.anoitecer + 1.5)}, #0b1630 100%)`
}

// Tom da cena pela hora (opcional): uma camada de cor por cima do mapa.
export function tomDaHora(t: ConfigTempo, m: Momento): { cor: string; opacidade: number } {
  switch (periodo(t, m)) {
    case 'noite': return { cor: '#0a1433', opacidade: 0.45 }
    case 'amanhecer': return { cor: '#f2a65a', opacidade: 0.18 }
    case 'entardecer': return { cor: '#e8662e', opacidade: 0.22 }
    default: return { cor: '#000000', opacidade: 0 }
  }
}

// ---- Estação ----

// A estação de uma data: a última que começou (o ano dá a volta).
export function estacaoDe(t: ConfigTempo, d: Data): Estacao | null {
  if (!t.estacoes.length) return null
  const chave = (mes: number, dia: number) => mes * 100 + dia
  const ordenadas = [...t.estacoes].sort((a, b) => chave(a.mes, a.dia) - chave(b.mes, b.dia))
  const hoje = chave(d.mes, d.dia)
  return [...ordenadas].reverse().find((e) => chave(e.mes, e.dia) <= hoje) ?? ordenadas[ordenadas.length - 1]
}

// ---- Lua ----

// Fase de 0 a 1 (0 = nova, 0,5 = cheia). No tradicional, a lua de verdade (lua nova de 6/1/2000).
export function faseDaLua(t: ConfigTempo, d: Data): number {
  const dias = t.modo === 'tradicional' ? diaUTC(d) - diaUTC({ ano: 2000, mes: 1, dia: 6 }) : absoluto(t, d)
  const ciclo = t.modo === 'tradicional' ? 29.530588 : t.cicloLua
  return (((dias % ciclo) + ciclo) % ciclo) / ciclo
}

export function nomeDaFase(f: number): string {
  const nomes = ['Lua nova', 'Lua crescente', 'Quarto crescente', 'Crescente gibosa', 'Lua cheia', 'Minguante gibosa', 'Quarto minguante', 'Lua minguante']
  return nomes[Math.round(f * 8) % 8]
}

// ---- Clima ----

// Chances de cada clima por bioma e estação (índice da estação: 0..3 ≈ verão, outono, inverno, primavera).
const PESOS_CLIMA: Record<Bioma, Partial<Record<Clima, number>>[]> = {
  temperado: [
    { limpo: 5, nublado: 3, chuva: 2, tempestade: 2, calor: 2 },
    { limpo: 3, nublado: 4, chuva: 3, neblina: 2, vento: 2 },
    { limpo: 3, nublado: 4, chuva: 2, neblina: 3, neve: 1, vento: 2 },
    { limpo: 5, nublado: 3, chuva: 3, vento: 1 },
  ],
  tropical: [
    { limpo: 3, nublado: 2, chuva: 4, tempestade: 3, calor: 3 },
    { limpo: 4, nublado: 3, chuva: 3, tempestade: 1, calor: 1 },
    { limpo: 5, nublado: 3, chuva: 1, neblina: 1 },
    { limpo: 4, nublado: 3, chuva: 3, tempestade: 1, calor: 2 },
  ],
  deserto: [
    { limpo: 6, calor: 5, vento: 2 },
    { limpo: 6, calor: 2, vento: 3, nublado: 1 },
    { limpo: 6, vento: 3, nublado: 2 },
    { limpo: 6, calor: 3, vento: 2 },
  ],
  polar: [
    { limpo: 3, nublado: 4, neve: 3, vento: 3 },
    { nublado: 4, neve: 5, vento: 4, neblina: 1 },
    { nublado: 3, neve: 6, vento: 5, tempestade: 1 },
    { limpo: 3, nublado: 4, neve: 4, vento: 3 },
  ],
}

// Sorteio fixo por dia (todo mundo vê o mesmo, e não muda ao recarregar).
function sorteio(semente: number): number {
  let x = Math.imul(semente ^ 0x9e3779b9, 0x85ebca6b)
  x ^= x >>> 13
  x = Math.imul(x, 0xc2b2ae35)
  x ^= x >>> 16
  return (x >>> 0) / 4294967296
}

export function climaDoDia(t: ConfigTempo, dia: number): Clima {
  const escolhido = t.clima[String(dia)]
  if (escolhido) return escolhido
  const d = dataDoDia(t, dia)
  const e = estacaoDe(t, d)
  const indice = e ? Math.max(0, t.estacoes.indexOf(e)) % 4 : 0
  const pesos = Object.entries(PESOS_CLIMA[t.bioma][indice]) as [Clima, number][]
  const total = pesos.reduce((s, [, p]) => s + p, 0)
  let r = sorteio(dia * 7919 + indice * 31) * total
  for (const [c, p] of pesos) {
    r -= p
    if (r < 0) return c
  }
  return 'limpo'
}
