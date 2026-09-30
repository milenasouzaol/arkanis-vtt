import { ELEMENTOS, type ChaveElemento } from './elementosParanormais'

/**
 * Teste de Personalidade da aba Afinidade.
 *
 * Cada resposta da pontos pra um ou dois elementos. O elemento com mais pontos vence.
 * Os pontos seguem o que cada entidade tem de mais proprio:
 *
 * - Sangue: emocao a flor da pele e no extremo (odio extremo, amor extremo), instinto,
 *   brutalidade, rebeldia, ser direto.
 * - Morte: tempo, solidao, calma, melancolia, introspeccao; analisa antes de agir e acha
 *   que o tempo resolve; familiaridade, aceitacao, viver no mundo dos sonhos e dos medos.
 * - Conhecimento: curiosidade, informacao, investigacao, responsabilidade pelos proprios
 *   atos, moralidade e vida em sociedade; pode ser seco, mas nao solta da verdade.
 * - Energia: caos, aleatoriedade, instabilidade, relacoes volateis; nao liga pros outros
 *   nem pro fluxo da vida.
 *
 * A regra oficial de fraquezas do livro base (Sangue > Conhecimento > Energia > Morte >
 * Sangue) bate com isso: a emocao atropela a razao, a razao doma o caos, o caos quebra o
 * fluxo do tempo, e o tempo apaga a intensidade.
 */

export type Pontos = Partial<Record<ChaveElemento, number>>

export type Opcao = { texto: string; pontos: Pontos }

export type Pergunta = { numero: number; texto: string; opcoes: Opcao[] }

export const INTRODUCAO = [
  'Chegou a sua hora. Através do ritual de Transcender, você abre a porta para se conectar com uma das Entidades do Outro Lado: Sangue, Conhecimento, Energia ou Morte. Este Teste de Personalidade é composto de 30 perguntas que irão dar as respostas que essas entidades buscam, explorando o que habita no fundo do seu cerne.',
  'Não tenha medo de abrir seu coração à elas. Ninguém irá te julgar. Ninguém irá te aplaudir.',
  'Este é um teste baseado em uma interpretação não-oficial dos elementos do universo de Ordem Paranormal que, mesmo buscando uma proximidade com as descrições e história contadas até então, não se compromete em entregar algo estritamente canônico.',
]

// S = Sangue, M = Morte, C = Conhecimento, E = Energia. As opcoes seguem a ordem da tela:
// esquerda, direita, esquerda, direita...
const S = (n = 2): Pontos => ({ sangue: n })
const M = (n = 2): Pontos => ({ morte: n })
const C = (n = 2): Pontos => ({ conhecimento: n })
const E = (n = 2): Pontos => ({ energia: n })
const mix = (...partes: Pontos[]): Pontos => Object.assign({}, ...partes)

export const PERGUNTAS: Pergunta[] = [
  {
    numero: 1,
    texto: 'O que você sente em relação às figuras de autoridade?',
    opcoes: [
      { texto: 'Desgosto', pontos: E() },
      { texto: 'Necessidade', pontos: C() },
      { texto: 'Receio', pontos: M() },
      { texto: 'Inveja', pontos: S() },
      { texto: 'Revolta', pontos: mix(S(1), E(1)) },
      { texto: 'Respeito', pontos: mix(C(1), M(1)) },
    ],
  },
  {
    numero: 2,
    texto: 'O Outro Lado te oferece um único desejo a ser realizado, o mentalize. Qual sentimento motiva o seu desejo?',
    opcoes: [
      { texto: 'Paixão', pontos: S() },
      { texto: 'Prazer', pontos: mix(S(1), E(1)) },
      { texto: 'Saudades', pontos: M() },
      { texto: 'Ambição', pontos: E() },
      { texto: 'Arrependimento', pontos: mix(M(1), C(1)) },
      { texto: 'Justiça', pontos: C() },
    ],
  },
  {
    numero: 3,
    texto: 'Quando você está em uma equipe, em qual posição você prefere estar?',
    opcoes: [
      { texto: 'Estrategista', pontos: mix(C(1), M(1)) },
      { texto: 'Liderança', pontos: mix(S(1), E(1)) },
      { texto: 'Linha de frente', pontos: S() },
      { texto: 'Suporte', pontos: E() },
      { texto: 'Retaguarda', pontos: M() },
      { texto: 'Pesquisador', pontos: C() },
    ],
  },
  {
    numero: 4,
    texto: 'Até o fim da sua vida, o que você mais quer conquistar?',
    opcoes: [
      { texto: 'Reconhecimento', pontos: C() },
      { texto: 'Riquezas', pontos: mix(E(1), C(1)) },
      { texto: 'Bons relacionamentos', pontos: mix(S(1), M(1)) },
      { texto: 'Poder', pontos: S() },
      { texto: 'Satisfação', pontos: E() },
      { texto: 'Paz', pontos: M() },
    ],
  },
  {
    numero: 5,
    texto: 'Ao conhecer uma nova pessoa, qual é o seu maior medo diante dessa relação?',
    opcoes: [
      { texto: 'Descobrir sua má índole', pontos: C() },
      { texto: 'Decepcioná-la futuramente', pontos: mix(M(1), S(1)) },
      { texto: 'Não conseguir conquistar a sua aprovação', pontos: mix(S(1), C(1)) },
      { texto: 'A timidez não deixar vocês se aproximarem', pontos: M() },
      { texto: 'Falta de honestidade', pontos: C() },
      { texto: 'Nenhum', pontos: E() },
    ],
  },
  {
    numero: 6,
    texto: 'Qual sua maior qualidade?',
    opcoes: [
      { texto: 'Esperteza', pontos: C() },
      { texto: 'Criatividade', pontos: E() },
      { texto: 'Carisma', pontos: S() },
      { texto: 'Determinação', pontos: mix(S(1), C(1)) },
      { texto: 'Empatia', pontos: mix(M(1), S(1)) },
      { texto: 'Não consigo definir', pontos: mix(M(1), E(1)) },
    ],
  },
  {
    numero: 7,
    texto: 'Qual seu maior defeito?',
    opcoes: [
      { texto: 'Tato social', pontos: C() },
      { texto: 'Impaciência', pontos: S() },
      { texto: 'Dissimulação', pontos: mix(E(1), C(1)) },
      { texto: 'Teimosia', pontos: mix(S(1), C(1)) },
      { texto: 'Procrastinação', pontos: M() },
      { texto: 'Não consigo definir', pontos: E() },
    ],
  },
  {
    numero: 8,
    texto: 'O que você sente em relação à mudança?',
    opcoes: [
      { texto: 'Ansiedade', pontos: mix(C(1), M(1)) },
      { texto: 'Empolgação', pontos: E() },
      { texto: 'Necessidade', pontos: C() },
      { texto: 'Aversão', pontos: M() },
      { texto: 'Desafio', pontos: S() },
      { texto: 'Luto', pontos: mix(M(1), S(1)) },
    ],
  },
  {
    numero: 9,
    texto: 'O que você sente em relação a punições?',
    opcoes: [
      { texto: 'Aversão', pontos: E() },
      { texto: 'Culpa', pontos: mix(M(1), C(1)) },
      { texto: 'Medo', pontos: M() },
      { texto: 'Justiça', pontos: C() },
      { texto: 'Necessidade', pontos: mix(C(1), S(1)) },
      { texto: 'Satisfação', pontos: S() },
    ],
  },
  {
    numero: 10,
    texto: 'O que você sente em relação ao ato de matar?',
    opcoes: [
      { texto: 'Sou contra em qualquer circunstância.', pontos: C() },
      { texto: 'Sou contra, mas é necessário.', pontos: mix(C(1), M(1)) },
      { texto: 'É algo que deve ser usado somente como último recurso.', pontos: M() },
      { texto: 'Sou indiferente.', pontos: E() },
      { texto: 'Existem maus no mundo que só podem ser resolvidos através da morte.', pontos: mix(S(1), C(1)) },
      { texto: 'Faz parte da nossa natureza.', pontos: S() },
    ],
  },
  {
    numero: 11,
    texto: 'O que mantém os seus pés no chão?',
    opcoes: [
      { texto: 'Esperança', pontos: mix(C(1), M(1)) },
      { texto: 'Relacionamentos', pontos: S() },
      { texto: 'Sonhos', pontos: M() },
      { texto: 'Medos', pontos: mix(M(1), S(1)) },
      { texto: 'Pendências', pontos: C() },
      { texto: 'Prazeres', pontos: E() },
    ],
  },
  {
    numero: 12,
    texto: 'O que ou quem é responsável pelos problemas da sua vida?',
    opcoes: [
      { texto: 'Minha dificuldade em buscar soluções.', pontos: C() },
      { texto: 'Obstáculos que surgem sem parar.', pontos: E() },
      { texto: 'Azar ou destino.', pontos: mix(E(1), M(1)) },
      { texto: 'Meus sentimentos e ações.', pontos: mix(S(1), C(1)) },
      { texto: 'Pessoas má intencionadas.', pontos: S() },
      { texto: 'Nada deve ser culpabilizado.', pontos: M() },
    ],
  },
  {
    numero: 13,
    texto: 'O que você sente em relação à morte?',
    opcoes: [
      { texto: 'Medo', pontos: mix(S(1), C(1)) },
      { texto: 'Melancolia', pontos: M() },
      { texto: 'Revolta', pontos: S() },
      { texto: 'Curiosidade', pontos: C() },
      { texto: 'Familiaridade', pontos: M() },
      { texto: 'Conforto', pontos: mix(M(1), E(1)) },
    ],
  },
  {
    numero: 14,
    texto: 'O quanto a visão dos outros sobre ti é importante para você?',
    opcoes: [
      { texto: 'Só me importo com a visão de algumas pessoas', pontos: mix(S(1), M(1)) },
      { texto: 'De extrema importância', pontos: C() },
      { texto: 'Há alguma importância', pontos: mix(C(1), M(1)) },
      { texto: 'Um pouco', pontos: M() },
      { texto: 'A minha visão é mais importante', pontos: mix(S(1), E(1)) },
      { texto: 'Nem um pouco', pontos: E() },
    ],
  },
  {
    numero: 15,
    texto: 'O que você sente sobre a possibilidade de existir uma força maior?',
    opcoes: [
      { texto: 'Medo', pontos: mix(C(1), M(1)) },
      { texto: 'Raiva', pontos: S() },
      { texto: 'Curiosidade', pontos: C() },
      { texto: 'Esperança', pontos: mix(S(1), M(1)) },
      { texto: 'Conforto', pontos: M() },
      { texto: 'Indiferença', pontos: E() },
    ],
  },
  {
    numero: 16,
    texto: 'Os fins podem justificar os meios?',
    opcoes: [
      { texto: 'Sim, em todos os casos.', pontos: S() },
      { texto: 'Somente se os fins me beneficiarem.', pontos: E() },
      { texto: 'Somente se os fins tiverem um peso maior do que os meios.', pontos: mix(M(1), C(1)) },
      { texto: 'Somente se os meios não ferirem os meus ideais.', pontos: C() },
      { texto: 'Somente se os meios não me prejudicarem', pontos: mix(E(1), M(1)) },
      { texto: 'Não, em nenhuma circunstância.', pontos: mix(C(1), M(1)) },
    ],
  },
  // A pergunta 17 ainda nao chegou.
  {
    numero: 18,
    texto: 'Se você tivesse poder suficiente para alterar a realidade, o usaria para modificar quem você é, mesmo que isso tenha consequências?',
    opcoes: [
      { texto: 'Sim, focando na minha aparência física.', pontos: S() },
      { texto: 'Sim, focando na minha personalidade.', pontos: E() },
      { texto: 'Sim, focando na minha história.', pontos: M() },
      { texto: 'Sim, focando no jeito que as pessoas me veem.', pontos: C() },
      { texto: 'Sim, focando nas minhas habilidades e talentos.', pontos: mix(S(1), C(1)) },
      { texto: 'Não faria nenhuma alteração.', pontos: mix(M(1), C(1)) },
    ],
  },
  {
    numero: 19,
    texto: 'Qual desses aspectos da sua vida você seria capaz de abdicar em prol de uma vida em paz?',
    opcoes: [
      { texto: 'Formas de arte.', pontos: mix(S(1), C(1)) },
      { texto: 'Bens materiais.', pontos: M() },
      { texto: 'Crenças e ideais.', pontos: E() },
      { texto: 'Ambições e sonhos.', pontos: mix(C(1), M(1)) },
      { texto: 'Prazeres carnais.', pontos: C() },
      { texto: 'Relacionamentos.', pontos: mix(E(1), M(1)) },
    ],
  },
  {
    numero: 20,
    texto: 'Você guardaria um segredo para proteger alguém, mesmo que seja algo que essa pessoa deveria saber?',
    opcoes: [
      { texto: 'Sim, o bem estar do outro é o que vale.', pontos: mix(S(1), M(1)) },
      { texto: 'Sim, algumas situações devem ser evitadas.', pontos: M() },
      { texto: 'Depende do peso desse segredo.', pontos: mix(C(1), M(1)) },
      { texto: 'Depende de quem é este segredo.', pontos: E() },
      { texto: 'Não, honestidade é um dos pilares de uma relação.', pontos: C() },
      { texto: 'Não, cabe aos outros aguentar a verdade.', pontos: S() },
    ],
  },
  {
    numero: 21,
    texto: 'Como você lida com impulsos e pensamentos violentos?',
    opcoes: [
      { texto: 'Eu constantemente os extravaso.', pontos: S() },
      { texto: 'Às vezes eu os deixo escapar.', pontos: mix(S(1), E(1)) },
      { texto: 'Eu desconto em outras coisas ou pessoas.', pontos: E() },
      { texto: 'Eu busco me acalmar e me distrair.', pontos: M() },
      { texto: 'Eu consigo os reprimir.', pontos: C() },
      { texto: 'Eu não sinto esses impulsos.', pontos: mix(M(1), C(1)) },
    ],
  },
  {
    numero: 22,
    texto: 'Você acredita que o mundo pode ser “corrigido” somente pelo uso de uma força maior como o paranormal ou o divino?',
    opcoes: [
      { texto: 'Sim, o mundo sempre será imperfeito.', pontos: mix(M(1), E(1)) },
      { texto: 'Sim, os humanos não conseguem se ajudar.', pontos: mix(C(1), E(1)) },
      { texto: 'Sim, há maus intrínsecos no mundo.', pontos: S() },
      { texto: 'Não, devemos ter a responsabilidade do nosso destino.', pontos: C() },
      { texto: 'Não, há esperança no futuro.', pontos: M() },
      { texto: 'Não, o mundo não precisa ser corrigido.', pontos: E() },
    ],
  },
  {
    numero: 23,
    texto: 'Com que frequência você mascara quem você realmente é?',
    opcoes: [
      { texto: 'Sempre.', pontos: E() },
      { texto: 'Com uma certa frequência.', pontos: mix(M(1), C(1)) },
      { texto: 'Depende do grupo que estou inserido.', pontos: C() },
      { texto: 'Depende do que eu estou sentindo.', pontos: mix(S(1), E(1)) },
      { texto: 'Raramente.', pontos: mix(M(1), S(1)) },
      { texto: 'Nunca.', pontos: S() },
    ],
  },
  {
    numero: 24,
    texto: 'Em uma discussão, qual o seu principal objetivo?',
    opcoes: [
      { texto: 'Provar o seu ponto.', pontos: mix(S(1), C(1)) },
      { texto: 'Tentar não magoar o outro.', pontos: M() },
      { texto: 'Tentar compreender outros pontos de vista.', pontos: C() },
      { texto: 'Tentar transformar a visão do outro na sua.', pontos: S() },
      { texto: 'Provocar o outro até ele desistir da discussão.', pontos: E() },
      { texto: 'Encerrar a discussão o mais rápido possível.', pontos: mix(M(1), E(1)) },
    ],
  },
  {
    numero: 25,
    texto: 'O que há de mais obscuro dentro de ti?',
    opcoes: [
      { texto: 'Desejos.', pontos: mix(S(1), E(1)) },
      { texto: 'Segredos.', pontos: C() },
      { texto: 'Rancores.', pontos: S() },
      { texto: 'Sentimentos.', pontos: mix(M(1), S(1)) },
      { texto: 'Intenções.', pontos: E() },
      { texto: 'Dores.', pontos: M() },
    ],
  },
  {
    numero: 26,
    texto: 'O que te faz sofrer mais: O passado, o presente ou o futuro?',
    opcoes: [
      { texto: 'O passado.', pontos: M() },
      { texto: 'O presente.', pontos: mix(S(1), E(1)) },
      { texto: 'O futuro.', pontos: mix(C(1), E(1)) },
    ],
  },
  {
    numero: 27,
    texto: 'Se você pudesse, reverteria o seu maior arrependimento, mesmo que isso viesse com consequência?',
    opcoes: [
      { texto: 'Sim.', pontos: S() },
      { texto: 'Não.', pontos: mix(M(1), C(1)) },
      { texto: 'Não possuo arrependimentos.', pontos: E() },
    ],
  },
  {
    numero: 28,
    texto: 'Você acredita que podemos entrar em paz uns com os outros a partir da compreensão do motivo das suas atitudes?',
    opcoes: [
      { texto: 'Sim.', pontos: mix(C(1), M(1)) },
      { texto: 'Não.', pontos: mix(S(1), E(1)) },
    ],
  },
  {
    numero: 29,
    texto: 'Um mundo que recai somente pela razão, é um mundo inclinado a ser injusto/infeliz?',
    opcoes: [
      { texto: 'Sim', pontos: mix(S(1), E(1)) },
      { texto: 'Não', pontos: C() },
    ],
  },
  {
    numero: 30,
    texto: 'Você é uma boa pessoa?',
    opcoes: [
      { texto: 'Sim', pontos: C() },
      { texto: 'Não', pontos: mix(S(1), E(1)) },
      { texto: 'Não cabe a mim definir.', pontos: M() },
    ],
  },
]

/** Pergunta de fechamento: aparece depois da ultima e nao conta ponto. */
export const PERGUNTA_EXTRA: Pergunta = {
  numero: 0,
  texto: 'Esse teste é anônimo e ninguém vai julgar as suas respostas, exceto você. Sabendo disso, você sente que respondeu com toda honestidade, mesmo que não se orgulhe da resposta dada?',
  opcoes: [
    { texto: 'Sim', pontos: {} },
    { texto: 'Não', pontos: {} },
  ],
}

const CHAVES = ELEMENTOS.map((e) => e.key)

/** Quanto cada elemento consegue fazer no maximo, somando a melhor opcao dele em cada pergunta. */
export function maximoPossivel(perguntas: Pergunta[] = PERGUNTAS): Record<ChaveElemento, number> {
  const max = Object.fromEntries(CHAVES.map((k) => [k, 0])) as Record<ChaveElemento, number>
  for (const p of perguntas) {
    for (const k of CHAVES) max[k] += Math.max(0, ...p.opcoes.map((o) => o.pontos[k] ?? 0))
  }
  return max
}

/**
 * Quanto cada elemento ganha em media por pergunta, se a pessoa escolhesse ao acaso.
 * Morte e Conhecimento aparecem em mais opcoes que Energia; sem essa correcao, quem
 * responde meio no chute cairia mais neles.
 */
export function esperadoAoAcaso(perguntas: Pergunta[] = PERGUNTAS): Record<ChaveElemento, number> {
  const esperado = Object.fromEntries(CHAVES.map((k) => [k, 0])) as Record<ChaveElemento, number>
  for (const p of perguntas) {
    for (const k of CHAVES) esperado[k] += p.opcoes.reduce((soma, o) => soma + (o.pontos[k] ?? 0), 0) / p.opcoes.length
  }
  return esperado
}

/**
 * Soma as respostas e divide pelo que cada elemento ganharia respondendo ao acaso. Assim
 * nenhum elemento sai na frente so por aparecer em mais opcoes: o que conta e o quanto a
 * pessoa puxou pra ele acima da media. `respostas[i]` e o indice da opcao escolhida na
 * pergunta i (ou undefined).
 */
export function pontuar(respostas: (number | undefined)[], perguntas: Pergunta[] = PERGUNTAS) {
  const brutos = Object.fromEntries(CHAVES.map((k) => [k, 0])) as Record<ChaveElemento, number>
  perguntas.forEach((p, i) => {
    const escolha = respostas[i]
    if (escolha === undefined) return
    for (const [k, v] of Object.entries(p.opcoes[escolha]?.pontos ?? {})) brutos[k as ChaveElemento] += v ?? 0
  })
  const esperado = esperadoAoAcaso(perguntas)
  const proporcao = Object.fromEntries(CHAVES.map((k) => [k, esperado[k] ? brutos[k] / esperado[k] : 0])) as Record<ChaveElemento, number>
  return { brutos, proporcao }
}

/** O elemento com a maior proporcao. Empate e decidido na sorte entre os empatados. */
export function resultado(respostas: (number | undefined)[], sorte: number = Math.random(), perguntas: Pergunta[] = PERGUNTAS): ChaveElemento {
  const { proporcao } = pontuar(respostas, perguntas)
  const topo = Math.max(...CHAVES.map((k) => proporcao[k]))
  const empatados = CHAVES.filter((k) => Math.abs(proporcao[k] - topo) < 1e-9)
  return empatados[Math.min(empatados.length - 1, Math.floor(sorte * empatados.length))]
}
