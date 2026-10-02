// Gera a migration 0087 a partir de dados estruturados (JSON e aspas sempre validos).
const fs = require('fs')
const q = (v) => (v === null || v === undefined ? 'null' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`)
const j = (v) => q(JSON.stringify(v))
const arr = (a) => q('{' + a.map((x) => `"${x}"`).join(',') + '}')
const src = (s) => `(select id from sources where slug = '${s}')`
const img = (p) => `/conteudo/${p}.webp`
const T = 'Treinamento'

const out = []
const L = (s) => out.push(s)

L(`-- Extras do AS05, AS06 e AS07 (KAN-45): arte dos itens, tokens das criaturas e NPCs,
-- simbolos de ritual, as fichas do AS06 e os NPCs do AS07 que faltavam no bestiario, os
-- aliados do AS06, o ritual Vampirismo e o uso Resguardar Espirito da pericia Religiao.
-- Gerado por supabase/scripts/gera0087.cjs (node) pra o JSON e as aspas sairem sempre validos.
-- Imagens servidas pelo app em /conteudo/as05, as06 e as07.

alter table cursed_items_special add column if not exists image_url text;
`)

// ---------- imagens de itens ----------
const itens = [
  ['equipment_items', 'arquivos_secretos_05', 'Câmera Filmadora', 'as05/itens/camera-filmadora'],
  ['cursed_items_special', 'arquivos_secretos_05', 'Faixas da Vidência', 'as05/itens/faixas-da-videncia'],
  ['cursed_items_special', 'arquivos_secretos_05', 'Joias da Mente', 'as05/itens/joias-da-mente'],
  ['cursed_items_special', 'arquivos_secretos_05', 'Larva da Fúria', 'as05/itens/larva-da-furia'],
  ['cursed_items_special', 'arquivos_secretos_05', 'Skate Caótico', 'as05/itens/skate-caotico'],
  ['cursed_items_special', 'arquivos_secretos_05', 'Tênis Lépidos', 'as05/itens/tenis-lepidos'],
  ['equipment_items', 'arquivos_secretos_06', 'Aplicador de Adrenalina', 'as06/itens/aplicador-de-adrenalina'],
  ['equipment_items', 'arquivos_secretos_06', 'Lança-Nitrogênio', 'as06/itens/lanca-nitrogenio'],
  ['cursed_items_special', 'arquivos_secretos_06', 'Anel Invertido', 'as06/itens/anel-invertido'],
  ['equipment_items', 'arquivos_secretos_07', 'Carranca Caçadora', 'as07/itens/carranca-cacadora'],
  ['equipment_items', 'arquivos_secretos_07', 'Pé de Coelho', 'as07/itens/pe-de-coelho'],
  ['equipment_items', 'arquivos_secretos_07', 'Sal Dourado', 'as07/itens/sal-dourado'],
  ['cursed_items_special', 'arquivos_secretos_07', 'Cajado da Cruz de Sangue', 'as07/itens/cajado-da-cruz-de-sangue'],
  ['cursed_items_special', 'arquivos_secretos_07', 'Terço Maculado', 'as07/itens/terco-maculado'],
]
L('-- ===================== Arte dos itens =====================\n')
for (const [t, s, n, p] of itens) L(`update ${t} set image_url = ${q(img(p))} where source_id = ${src(s)} and name = ${q(n)};`)

// ---------- tokens das criaturas que ja existem ----------
const tokens = [
  ['arquivos_secretos_05', 'Hospedeiro Parasitado', 'as05/criaturas/hospedeiro-parasitado'],
  ['arquivos_secretos_05', 'Hospedeiro Aflorado', 'as05/criaturas/hospedeiro-aflorado'],
  ['arquivos_secretos_05', 'Interflorado', 'as05/criaturas/interflorado'],
  ['arquivos_secretos_05', 'Fummu', 'as05/criaturas/fummu'],
  ['arquivos_secretos_05', 'Doppelganger (Civil)', 'as05/criaturas/doppelganger-civil'],
  ['arquivos_secretos_05', 'Doppelganger (Combatente)', 'as05/criaturas/doppelganger-combatente'],
  ['arquivos_secretos_05', 'Doppelganger (Cultista)', 'as05/criaturas/doppelganger-cultista'],
  ['arquivos_secretos_05', 'Bilu', 'as05/criaturas/bilu'],
  ['arquivos_secretos_05', 'Rastropoda', 'as05/criaturas/rastropoda'],
  ['arquivos_secretos_05', 'Memoflígico', 'as05/criaturas/memofligico'],
  ['arquivos_secretos_07', 'Incinerado', 'as07/criaturas/incinerado'],
  ['arquivos_secretos_07', 'Stryzga', 'as07/criaturas/stryzga'],
  ['arquivos_secretos_07', 'Apóstata', 'as07/criaturas/apostata'],
]
L('\n-- ===================== Tokens das criaturas que ja estavam no bestiario =====================\n')
for (const [s, n, p] of tokens) L(`update creatures set image_url = ${q(img(p))} where source_id = ${src(s)} and name = ${q(n)};`)

L(`\n-- Os Hell Hunters (AS09) sao pessoas: mundanas, como as outras fichas de pessoa.
update creatures set categoria = 'mundana', tipo_criatura = 'Pessoa'
where source_id = ${src('arquivos_secretos_09')};

update rituals set image_url = ${q(img('as06/rituais/hesitacao-forcada'))}
where source_id = ${src('arquivos_secretos_06')} and name = 'Hesitação Forçada';
`)

// ---------- fichas novas ----------
const tatico = null
const pessoa = (o) => ({ categoria: 'mundana', tipo: 'Pessoa', descritores: ['Pessoa'], ...o })
const criaturas = [
  // ---------------- AS06 ----------------
  pessoa({ s: 'arquivos_secretos_06', name: 'Alice Cruzes', vd: 40, img: 'as06/criaturas/alice-cruzes', ord: 120,
    flavor: 'Diretora de algumas instalações da Panacea. Mestra estrategista, capaz de analisar cenários complexos em segundos e coordenar seus aliados com precisão cirúrgica.',
    percepcao: '2d20+5', iniciativa: '2d20', defesa: 18, fortitude: '1d20', reflexos: '2d20+5', vontade: '2d20+10', pv: 30, mach: 15,
    atributos: { agi: 2, for: 1, int: 4, pre: 2, vig: 1 }, pericias: 'Diplomacia 2d20+10, Enganação 2d20+10, Intimidação 2d20+5, Intuição 2d20+5, Medicina 4d20+5, Tática 4d20+10',
    hab: [['Diretora', 'Alice nunca se expõe desnecessariamente ao perigo. Ela está sempre acompanhada por dois seguranças da Panacea.']],
    acoes: [
      { tipo: 'Padrão', nome: 'Pistola, à distância (curto)', teste: '2d20+5, crítico 18', dano: '1d12+5 balístico' },
      { tipo: 'Reação', nome: 'Reencontro', dano: '8d6 perfuração (Reflexos DT 15 reduz à metade)', descricao: 'Ao chegar a 0 PV, ativa um dispositivo explosivo que carrega consigo; atinge todos os seres em um raio de 6m.' },
      { tipo: 'Movimento', nome: 'Coordenar Equipe', descricao: 'Emite instruções rápidas e precisas a um aliado em alcance curto. Se, em seu turno, o aliado acatar as ordens e elas resultarem em um teste, ele recebe +5 nesse teste.' },
      { tipo: 'Padrão', nome: 'Recursos Humanos', dano: '6d6 perfuração (Reflexos DT 15 reduz à metade)', descricao: 'Os seguranças carregam explosivos implantados no corpo. Alice escolhe um segurança aliado em alcance longo: o dispositivo explode, matando o segurança e atingindo todos os seres em um raio de 6m.' },
    ] }),
  pessoa({ s: 'arquivos_secretos_06', name: 'Ketan Arjuna', vd: 100, img: 'as06/criaturas/ketan-arjuna', ord: 121,
    flavor: 'Chefe de segurança da Panacea e representante da sede Durgā. Funcionalmente frio, pragmaticamente violento e resistente ao estresse; usa uma prótese robótica como arma e escudo.',
    percepcao: '2d20+5', iniciativa: '4d20+10', defesa: 20, fortitude: '1d20+5', reflexos: '4d20+10', vontade: '2d20+5', pv: 90, mach: 45,
    atributos: { agi: 4, for: 3, int: 2, pre: 2, vig: 1 }, pericias: 'Atletismo 3d20+10, Intimidação 2d20+10, Tática 2d20+10, Tecnologia 2d20+10',
    hab: [
      ['Armado e Preparado', 'Ketan tem uma ação padrão adicional por rodada. Além disso, quando faz um ataque usando uma arma, causa +1 dado de dano extra do mesmo tipo.'],
      ['Prótese Robótica', 'Avançada prótese tecnológica da Panacea, integrada ao seu estilo de combate. Pode ser alvo de ataques separadamente (Defesa 25, RD 5 e 45 PV). Se for destruída, Ketan perde a ação padrão adicional e as ações Punho de Aço, Reparo na Hora, Atirar e Fatiar e Defesa Improvisada.'],
    ],
    acoes: [
      { tipo: 'Padrão', nome: 'Revólver, à distância (curto)', teste: '4d20+10, crítico x3', dano: '3d6+10 balístico' },
      { tipo: 'Padrão', nome: 'Machadinha, corpo a corpo', teste: '3d20+10, crítico x3', dano: '2d6+10 corte' },
      { tipo: 'Padrão', nome: 'Punhalada, corpo a corpo', teste: '3d20+10, crítico x3', dano: '2d4+10 perfuração' },
      { tipo: 'Padrão', nome: 'Punho de Aço, corpo a corpo', teste: '3d20+10, crítico 18', dano: '2d10+10 impacto mais 2d4 eletricidade' },
      { tipo: 'Reação', nome: 'Atirar e Fatiar', descricao: 'Quando acerta um ataque corpo a corpo contra um alvo já atingido por um de seus ataques à distância nesta rodada, o ataque corpo a corpo causa +1 dado de dano extra do mesmo tipo.' },
      { tipo: 'Reação', nome: 'Coice', descricao: 'Ao atacar com o Punho de Aço, a prótese sofre metade do dano que ele causar.' },
      { tipo: 'Reação', nome: 'Defesa Improvisada', descricao: 'Uma vez por rodada, quando for atingido por um ataque, interpõe a prótese: ela sofre todo o dano no lugar de Ketan. Se a prótese for destruída por esse ataque, Ketan sofre 2d10 pontos de dano de eletricidade.' },
      { tipo: 'Padrão', nome: 'Reparo na Hora', descricao: 'Com ferramentas improvisadas, realiza reparos emergenciais na prótese, recuperando 10 PV dela.' },
    ] }),
  pessoa({ s: 'arquivos_secretos_06', name: 'Laila Verdante', vd: 80, img: 'as06/criaturas/laila-verdante', ord: 122,
    flavor: 'Parapsicóloga sênior da Panacea, cofundadora do Instituto de Parapsicologia e criadora do Projeto Roseta. Sabe muito bem como aproveitar a fragilidade da psique humana.',
    percepcao: '4d20+10', iniciativa: '2d20+5', defesa: 19, fortitude: '1d20', reflexos: '2d20+5', vontade: '4d20+10', pv: 70, mach: 35,
    atributos: { agi: 2, for: 1, int: 3, pre: 4, vig: 1 }, pericias: 'Enganação 4d20+10, Furtividade 2d20+10, Intuição 4d20+10, Ocultismo 3d20+10, Tecnologia 3d20+10',
    hab: [
      ['Arruinar Mentes', 'Seres que estejam sofrendo uma ou mais condições mentais são considerados vulneráveis ao dano de Conhecimento causado pelos rituais de Laila.'],
      ['Rituais (DT 22)', 'Laila pode conjurar os rituais a seguir sem gastar seu custo de PE, até um limite de 6 PE por conjuração, usando a ação apropriada.'],
    ],
    acoes: [
      { tipo: 'Padrão', nome: 'Arremesso de Agulha, à distância (curto) x2', teste: '2d20+10', dano: '1d4+5 perfuração' },
      { tipo: 'Reação', nome: 'Sedar', descricao: 'Seres atingidos pelo arremesso de agulha ficam esmorecidos até o fim da cena (Fortitude DT 22 muda para frustrado).' },
      { tipo: 'Padrão', nome: 'Ritual: Aurora da Verdade (Conhecimento 2)', descricao: 'Até o fim da cena, cria um raio de 3m onde nenhum ser pode obter camuflagem ou ficar invisível. Nenhum ser dentro da área pode mentir (Vontade anula esse efeito).' },
      { tipo: 'Padrão', nome: 'Ritual: Enfeitiçar Discente (Conhecimento 1)', descricao: 'Dá uma sugestão aceitável de uma ação que uma pessoa em alcance curto deve realizar (Vontade anula). Em combate, por exemplo, que o alvo ataque a conjuradora por último.' },
      { tipo: 'Padrão', nome: 'Ritual: Invadir Mente (Conhecimento 2)', dano: '6d6 Conhecimento + atordoado (Vontade reduz à metade e evita a condição)', descricao: 'Um ser em alcance médio. Um mesmo alvo só pode ficar atordoado por este ritual uma vez por cena.' },
      { tipo: 'Padrão', nome: 'Ritual: Hesitação Forçada Discente (Conhecimento 1)', descricao: 'Um ser em alcance curto testa Vontade no início de cada turno. Se falhar, não consegue fazer ações hostis contra Laila e precisa rolar novamente o maior dado de qualquer teste, aceitando o novo valor. Dissipa ao passar no teste duas vezes seguidas ou no fim da cena.' },
    ] }),
  pessoa({ s: 'arquivos_secretos_06', name: 'Dr. Neruda', vd: 20, img: 'as06/criaturas/dr-neruda', ord: 123,
    flavor: 'Carlos Augusto Neruda, pesquisador da Panacea que estudou o NADA-1. Diferente da maioria, sabe muito bem o que faz lá. E adora o seu trabalho.',
    percepcao: '2d20+5', iniciativa: '2d20+5', defesa: 14, fortitude: '1d20', reflexos: '2d20+5', vontade: '2d20+5', pv: 15, mach: 7,
    atributos: { agi: 2, for: 0, int: 3, pre: 2, vig: 1 }, pericias: 'Ciências 3d20+10, Intuição 2d20+5, Medicina 3d20+10, Tecnologia 3d20+10',
    hab: [['Veneno Sádico', 'Os venenos do Dr. Neruda maximizam o sofrimento humano. Em seres machucados, seu veneno causa 1d4 pontos de dano mental. Esse dano ignora RD.']],
    acoes: [
      { tipo: 'Padrão', nome: 'Seringa, corpo a corpo', teste: '2d20+5', dano: '1d4+5 perfuração' },
      { tipo: 'Reação', nome: 'Veneno na Seringa', descricao: 'Ao acertar com a seringa, a vítima perde 2d4 PV, 1 vez por rodada, por 3 rodadas (Fortitude DT 15 muda para 1 rodada). Ele sempre carrega o antídoto e pode ser convencido a entregá-lo.' },
      { tipo: 'Padrão', nome: 'Dose Experimental', descricao: 'Arremessa um frasco em alcance curto: seres em um raio de 6m ficam enjoados por 1 rodada e fracos até o fim da cena (Fortitude DT 15 evita). Um mesmo alvo só fica enjoado por esta habilidade uma vez por cena.' },
    ] }),
  pessoa({ s: 'arquivos_secretos_06', name: 'Cientista da Panacea', vd: 40, img: 'as06/criaturas/cientista', ord: 124,
    flavor: 'Uma pessoa cujas habilidades únicas e inteligência notável foram corrompidas pela prática de experimentos antiéticos.',
    percepcao: '1d20+5', iniciativa: '2d20+5', defesa: 16, fortitude: '1d20+5', reflexos: '2d20+5', vontade: '1d20+5', pv: 20, mach: 10,
    resistencias: 'Perfuração e químico 10 (Traje de Proteção)',
    atributos: { agi: 2, for: 1, int: 4, pre: 1, vig: 1 }, pericias: 'Ciências 4d20+10, Investigação 4d20+5, Medicina 4d20+5, Sobrevivência 4d20+5, Tecnologia 4d20+5',
    hab: [
      ['Seringas com Venenos', 'Escolha um veneno com DT até 25 (OPRPG, p. 293, ou AS06, p. 77). Se acertar um ataque de injetar, o cientista envenena o alvo com o veneno escolhido.'],
      ['Submissão', 'Se estiver no mesmo ambiente que um manda-chuva da Panacea, seus testes recebem +5. O efeito termina se o manda-chuva sair de cena.'],
      ['Traje de Proteção', 'Traje hazmat de alta qualidade: +10 em testes de resistência contra efeitos ambientais e infecções, e resistência a dano de perfuração e químico 10.'],
    ],
    acoes: [
      { tipo: 'Padrão', nome: 'Pancada, corpo a corpo', teste: '1d20+5', dano: '1d4+5 impacto' },
      { tipo: 'Padrão', nome: 'Injetar, corpo a corpo', teste: '1d20+5', descricao: 'Aplica o veneno escolhido.' },
    ] }),
  pessoa({ s: 'arquivos_secretos_06', name: 'Manda-Chuva da Panacea', vd: 120, img: 'as06/criaturas/manda-chuva', ord: 125,
    flavor: 'Um executivo ou funcionário com cargo de gerência, fiel às Indústrias Panacea e disposto a sacrificar todos os seus subalternos pela empresa.',
    percepcao: '3d20+10', iniciativa: '2d20', defesa: 23, fortitude: '3d20+5', reflexos: '2d20', vontade: '3d20+10', pv: 120, mach: 60,
    atributos: { agi: 2, for: 1, int: 3, pre: 3, vig: 3 }, pericias: 'Atualidades 3d20+5, Diplomacia 3d20+10, Enganação 3d20+10, Intimidação 3d20+10, Intuição 3d20+10, Ocultismo 3d20+5',
    hab: [
      ['Negociador', 'Quando faz um teste de perícia baseado em Presença, pode rolar novamente e ficar com o melhor resultado.'],
      ['Objeto de Pesquisa', 'Tem um item amaldiçoado determinado pelo mestre guardado consigo e sabe como usá-lo.'],
    ],
    acoes: [
      { tipo: 'Padrão', nome: 'Pancada, corpo a corpo', teste: '1d20+10', dano: '1d6+5 impacto' },
      { tipo: 'Padrão', nome: 'Pistola, à distância (curto) x2', teste: '2d20+10, crítico 18', dano: '2d12+10 balístico' },
      { tipo: 'Reação', nome: 'Sou Mais Importante', descricao: 'Uma vez por rodada, quando é alvo de um efeito negativo e há um subalterno seu na cena em alcance médio, destina o efeito para o funcionário.' },
      { tipo: 'Padrão', nome: 'Chamar Reforços', descricao: 'Uma vez por cena, traz 1d4+1 seguranças da Panacea para a cena, agindo logo após o manda-chuva na iniciativa.' },
    ] }),
  pessoa({ s: 'arquivos_secretos_06', name: 'Segurança da Panacea', vd: 80, img: 'as06/criaturas/seguranca', ord: 126,
    flavor: 'Um paramilitar muito bem pago, encarregado da força bruta contra criaturas fora de contenção e possíveis visitas indesejadas.',
    percepcao: '2d20', iniciativa: '3d20+10', defesa: 21, fortitude: '2d20+5', reflexos: '3d20+5', vontade: '2d20+5', pv: 80, mach: 40,
    resistencias: 'RD 5 (Traje de Campo)',
    atributos: { agi: 3, for: 3, int: 1, pre: 2, vig: 2 }, pericias: 'Atletismo 3d20+10, Intimidação 2d20+5',
    hab: [
      ['Bem Pago', 'Se estiver no mesmo ambiente que um manda-chuva da Panacea, seus testes recebem +5. O efeito termina se o manda-chuva sair de cena.'],
      ['Munição Não Letal', 'Equipado com munições letais e não letais. A menos que receba ordem de atirar para matar, usa munição não letal (balas de borracha ou dardos tranquilizantes).'],
      ['Ossos do Ofício', '+5 em testes de resistência contra efeitos paranormais (rituais, poderes paranormais e afins).'],
      ['Traje de Campo', 'Fornece RD 5 e máscara de gás (+10 em Fortitude contra efeitos que dependam de respiração).'],
    ],
    acoes: [
      { tipo: 'Padrão', nome: 'Pancada, corpo a corpo x2', teste: '3d20+10', dano: '2d6+10 impacto' },
      { tipo: 'Padrão', nome: 'Pistola, à distância (curto) x2', teste: '3d20+10, crítico 18', dano: '1d12+10 balístico' },
      { tipo: 'Padrão', nome: 'Submetralhadora, à distância (curto) x2', teste: '3d20+10, crítico 19/x3', dano: '3d6+10 balístico' },
      { tipo: 'Livre', nome: 'Agarrar', descricao: 'Se acertar uma pancada, pode tentar agarrar o alvo (teste 3d20+10).' },
      { tipo: 'Movimento', nome: 'Derrubar', descricao: 'Agarrando um alvo, pode tentar derrubá-lo (teste 3d20+10); continua agarrando de qualquer forma.' },
      { tipo: 'Movimento', nome: 'Imobilizar', descricao: 'Agarrando um alvo caído, faz uma manobra (teste 3d20+10) para imobilizá-lo: o alvo fica paralisado até ser solto. Manter o alvo imobilizado deixa o segurança indefeso, mas ele pode soltar o alvo como reação.' },
      { tipo: 'Padrão', nome: 'Atordoamento', descricao: 'Uma vez por cena, flashbang em alcance curto: seres em um raio de 6m ficam atordoados por 1 rodada (Fortitude DT 20 reduz para ofuscado e surdo por 1 rodada).' },
      { tipo: 'Padrão', nome: 'Fragmentação', dano: '8d6 perfuração (Reflexos DT 20 reduz à metade)', descricao: 'Uma vez por cena, granada em alcance curto; raio de 6m.' },
      { tipo: 'Padrão', nome: 'Gás Lacrimogêneo', dano: '4d6 químico (Fortitude DT 20 reduz à metade e evita enjoado)', descricao: 'Uma vez por cena, granada em alcance curto; raio de 6m. Ficam enjoados e asfixiados; fora da área, continuam asfixiados por 1d4 rodadas e enjoados até o fim da cena.' },
      { tipo: 'Padrão', nome: 'Incendiária', dano: '6d6 fogo + em chamas (Reflexos DT 20 reduz à metade e evita em chamas)', descricao: 'Uma vez por cena, granada em alcance curto; raio de 6m.' },
      { tipo: 'Padrão', nome: 'Rajadas', descricao: 'Dois ataques com a submetralhadora; cada um com –1d20 no teste (2d20+10), mas causando 1 dado de dano adicional (4d6+10).' },
    ] }),
  { s: 'arquivos_secretos_06', name: 'Hikikomori', vd: 20, img: 'as06/criaturas/hikikomori', ord: 127, categoria: 'paranormal', tipo: null,
    descritores: ['Energia', 'Sangue'], presenca: [14, '2d6 mental', 25],
    flavor: 'Criatura humanoide originada do contato entre o vírus infecticídio e um humano solitário, cujo contato com a tecnologia é maior que o contato humano. Seu corpo se contorce para dentro, escondido atrás de periféricos e enrolado em fios. Solitário, mas extremamente agressivo.',
    percepcao: '1d20', iniciativa: '2d20+5', defesa: 16, fortitude: '1d20', reflexos: '2d20+5', vontade: '1d20', pv: 35, mach: 17,
    resistencias: 'Energia 5', vulnerabilidades: 'Conhecimento',
    atributos: { agi: 2, for: 1, int: 1, pre: 1, vig: 1 },
    hab: [['Casulo Voltaico', 'Enquanto não estiver machucado, drena a energia dos eletrônicos do corpo: cura acelerada 5. Além disso, sempre que for alvo de um ataque corpo a corpo, projeta uma onda elétrica no atacante (2d4 de dano de Energia). Machucado, perde essa habilidade.']],
    acoes: [
      { tipo: 'Padrão', nome: 'Disparo Infectado, à distância (curto)', teste: '2d20+5', dano: '2d12 eletricidade' },
      { tipo: 'Padrão', nome: 'Esbarrão Infectado, corpo a corpo', teste: '2d20+5', dano: '2d12 eletricidade' },
      { tipo: 'Livre', nome: 'Infecção', descricao: 'Um ser que sofra dano do disparo ou do esbarrão é infectado pelo vírus do infecticídio (Fortitude DT 14 evita; OPRPG, p. 292). Quem passa fica imune até o fim da cena.' },
      { tipo: 'Livre', nome: 'Ricochete', descricao: 'Ao acertar um esbarrão, pode fazer uma ação de movimento para se deslocar.' },
    ] },
  { s: 'arquivos_secretos_06', name: 'Marca-Passo', vd: 80, img: 'as06/criaturas/marca-passo', ord: 128, categoria: 'paranormal', tipo: null,
    descritores: ['Energia', 'Sangue'], presenca: [20, '3d8 mental', 40],
    flavor: 'Surge da união do vírus infecticídio com pessoas que já tinham implantes tecnológicos ou biohacking (chips, placas de metal, marca-passos). O vírus deforma a tecnologia do corpo, expelindo-a pela carne.',
    percepcao: '2d20', iniciativa: '3d20+10', defesa: 23, fortitude: '2d20+5', reflexos: '3d20+10', vontade: '2d20', pv: 140, mach: 70,
    resistencias: 'Balístico, corte e perfuração 10, Energia 20', vulnerabilidades: 'Conhecimento',
    atributos: { agi: 3, for: 3, int: 1, pre: 2, vig: 2 },
    hab: [['Trilha Digital', 'Capta vibrações elétricas e de Energia em alcance extremo. Qualquer agente com aparelho eletrônico (celular, lanterna, relógio digital, escutas etc.) ou item amaldiçoado de Energia é percebido automaticamente (não pode pegá-lo desprevenido ou surpreendido) e fica vulnerável contra a criatura até se livrar de todos esses objetos.']],
    acoes: [
      { tipo: 'Padrão', nome: 'Golpe Infectado, corpo a corpo x2', teste: '3d20+10', dano: '2d12+5 impacto' },
      { tipo: 'Reação', nome: 'Frenesi Eletrônico', dano: '4d6+5 Energia (Reflexos DT 20 reduz à metade)', descricao: 'Quando um ser em alcance curto usa poder, ritual, equipamento eletrônico ou item amaldiçoado de Energia, o marca-passo se move até ficar adjacente a ele e explode em um raio de 6m.' },
      { tipo: 'Livre', nome: 'Infecção de Equipamento', descricao: 'Um ser que sofra dano do golpe rola 1d100. Com 51 ou mais, um equipamento dele vira item amaldiçoado de Energia (o mestre escolhe item e maldição). Com 50 ou menos, um equipamento é infectado pelo infecticídio; quem tocar no item pode se contaminar (Fortitude DT 20 evita; quem passa fica imune até o fim da cena).' },
    ] },
  { s: 'arquivos_secretos_06', name: 'Estímulo', vd: 320, img: 'as06/criaturas/estimulo', ord: 129, categoria: 'paranormal', tipo: null, tamanho: 'Grande',
    descritores: ['Energia', 'Sangue'], presenca: [null, '9d6 mental', 95],
    flavor: 'Manifestação espectral do vírus infecticídio que adquiriu autoconsciência fora de um hospedeiro. Move-se e se fragmenta por sinais digitais e analógicos (bluetooth, wi-fi, rádio, televisão). Parece uma forma poligonal errática cujas arestas nunca chegam a formar uma esfera perfeita. A DT da presença perturbadora é rolada: 8d10.',
    percepcao: '5d20+20', iniciativa: '5d20+20', defesa: 50, fortitude: '4d20+15', reflexos: '5d20+25', vontade: '5d20+20', pv: 800, mach: 400,
    resistencias: 'Imune a dano (exceto Conhecimento) e a todas as condições', vulnerabilidades: 'Conhecimento', deslocamento: '12m | 8',
    atributos: { agi: 5, for: 0, int: 5, pre: 5, vig: 4 },
    hab: [['Cogito Ergo Sum', 'Um ser que falhe no teste contra a presença perturbadora (DT 8d10) é automaticamente infectado pelo vírus infecticídio (OPRPG, p. 292). Qualquer ser que tocar no Estímulo também é infectado automaticamente.']],
    acoes: [
      { tipo: 'Movimento', nome: 'Sequestrar Sinal', descricao: 'Teletransporta-se para qualquer espaço em alcance médio, desde que fique adjacente a um aparelho eletrônico.' },
      { tipo: 'Padrão', nome: 'Glitch', descricao: 'Desaparece e reaparece, distorcendo a percepção de todos os seres em um raio de 9m: os alvos testam contra a presença perturbadora de novo.' },
      { tipo: 'Padrão', nome: 'Rodar Simulação', descricao: 'Distorce a natureza física de um ser em alcance curto até o fim da cena: o maior atributo troca de lugar com o menor (Vontade DT 8d10 evita). Afeta apenas testes.' },
      { tipo: 'Completa', nome: 'Imergir', dano: '10d12 Energia (Fortitude DT 8d10 reduz à metade e evita o avanço da doença)', descricao: 'Um ser em alcance curto sob efeito do infecticídio: a doença avança 1 estágio. Se morrer infectado, vira o princípio de uma horda de infecticídio (OPRPG, p. 267).' },
      { tipo: 'Completa', nome: 'Sequestro de Atenção', descricao: 'Projeta uma imagem hipnotizante para todos os seres infectados em um raio de 30m. Quem falhar em Vontade (DT 35) gasta todas as ações do próximo turno para ir até a criatura e tocá-la.' },
    ] },
  { s: 'arquivos_secretos_06', name: 'Experimento Ssabáka', vd: 180, img: 'as06/criaturas/ssabaka', ord: 130, categoria: 'paranormal', tipo: null,
    descritores: ['Morte', 'Sangue'], presenca: [28, '6d6 mental', 60],
    flavor: 'Experimento russo de codinome Ssabáka, feito com ossadas amaldiçoadas encontradas na Sibéria Ocidental e que foi parar nas mãos das Indústrias Panacea. Criatura grotesca, descarnada, de ossos protuberantes, membros irregulares, força sobrenatural e cabeçorra dentada.',
    percepcao: '2d20+10', iniciativa: '3d20+15', defesa: 36, fortitude: '4d20+15', reflexos: '3d20+15', vontade: '2d20+10', pv: 360, mach: 180,
    resistencias: 'Balístico, impacto e perfuração 10, Sangue 20', vulnerabilidades: 'Energia', deslocamento: '12m | 8',
    atributos: { agi: 3, for: 3, int: 0, pre: 2, vig: 4 },
    hab: [['Fugitivo do Tempo', 'Imune a qualquer efeito negativo relacionado ao tempo, natural ou paranormal (por exemplo, envelhecimento por idade, Decadência ou Paradoxo).']],
    acoes: [
      { tipo: 'Padrão', nome: 'Mordida, corpo a corpo', teste: '3d20+20', dano: '4d12+20 perfuração' },
      { tipo: 'Padrão', nome: 'Garras, corpo a corpo x2', teste: '3d20+20', dano: '4d12+10 corte' },
      { tipo: 'Livre', nome: 'Mastigar', descricao: 'Ao acertar a mordida num alvo Grande ou menor, pode agarrá-lo com os dentes (teste 3d20+20): o alvo se move junto com a criatura até se libertar. Só mastiga um por vez e solta se fizer outra mordida.' },
      { tipo: 'Movimento', nome: 'Sofrimento Duradouro', descricao: 'Despeja Lodo de Morte num alvo agarrado: ele recupera 3d8+3 PV atuais, mas perde 1d8+1 PV máximos permanentemente.' },
      { tipo: 'Completa', nome: 'Giro de Cauda', dano: '4d10+10 impacto + caído (Reflexos DT 28 reduz à metade e evita a condição)', descricao: 'Atinge todos os seres adjacentes.' },
    ] },
]

// AS07: os vampiros de Raziel. Pessoas, mas com Monstruosidade (resistencias e faro).
const monstruosidade = (quem, rd = 10, sangue = 20) => [`Monstruosidade`, `${quem} já passou por incontáveis rituais para manter seus poderes e longevidade, sendo quase uma criatura do Outro Lado: recebe faro, percepção às cegas, resistência a balístico, impacto e perfuração ${rd} e Sangue ${sangue}, mas sofre vulnerabilidade a Morte (já contabilizado).`]
const abraco = (quem, teste, dano, dt) => ({ tipo: 'Livre', nome: 'Abraço Sanguinolento', dano: `${dano} Sangue (Fortitude DT ${dt} reduz à metade)`, descricao: `Se acertar as garras, pode agarrar o alvo (teste ${teste}). Uma vez por rodada, como ação livre, morde um ser agarrado e recupera PV iguais à metade do dano causado.` })
const perseguir = { tipo: 'Movimento', nome: 'Perseguir', descricao: 'Uma vez por rodada, percorre o dobro do deslocamento na direção de um alvo que esteja querendo matar.' }
const vamp = (o) => pessoa({ s: 'arquivos_secretos_07', resistencias: 'Balístico, impacto e perfuração 10, Sangue 20', vulnerabilidades: 'Morte', ...o })
criaturas.push(
  vamp({ name: 'Raziel', vd: 120, img: 'as07/criaturas/raziel', ord: 140,
    flavor: 'Vampiro ancestral, elegante e vingativo. Se Raziel ficar machucado ou enfurecido, a critério do mestre, muda de forma: use a ficha O Verdadeiro Raziel.',
    percepcao: '2d20+5 (faro, percepção às cegas)', iniciativa: '4d20+10', defesa: 28, fortitude: '3d20+10', reflexos: '4d20+10', vontade: '2d20+5', pv: 240, mach: 120,
    atributos: { agi: 4, for: 3, int: 3, pre: 2, vig: 3 }, pericias: 'Atletismo 3d20+10, Intimidação 2d20+10, Ocultismo 3d20+10',
    hab: [
      ['Ignorar Dor', 'Para efeitos dramáticos e de intimidação, Raziel ignora até mesmo a dor e parece imune a qualquer dano; passar em Intuição ou Percepção (DT 30) revela que essa imunidade não é real.'],
      monstruosidade('Raziel'),
      ['Vingança', 'Toda vez que um familiar de Raziel é morto, ele se sente impelido a rastrear e matar não só o alvo, mas a maioria das pessoas ligadas a ele ou no mesmo local. Se isso acontecer na frente dele, entra em Fúria Sanguinária.'],
      ['Fúria Sanguinária', 'Se ficar machucado ou enfurecido, a critério do mestre, muda de forma: use a ficha O Verdadeiro Raziel.'],
    ],
    acoes: [
      { tipo: 'Padrão', nome: 'Garras, corpo a corpo x2', teste: '4d20+15, crítico 18', dano: '2d10+20 perfuração' },
      { tipo: 'Reação', nome: 'Revidar e Estripar', descricao: 'Uma vez por rodada, quando sofre um ataque corpo a corpo, revida com um ataque; se fizer isso, perde suas RD por 1 rodada.' },
      abraco('Raziel', '4d20+15', '6d6', 23), perseguir,
      { tipo: 'Padrão', nome: 'Endurecer Sangue', descricao: 'Bombeia sangue para os músculos e recebe RD 5 até o fim da cena.' },
      { tipo: 'Padrão', nome: 'Fazer Sangrar', dano: '6d6 Sangue + sangrando (Fortitude DT 23 reduz à metade e evita a condição)', descricao: 'Um ser em alcance curto. O sangramento desta habilidade causa a perda de 2d6 PV (em vez de 1d6).' },
      { tipo: 'Padrão', nome: 'Maldição Sanguínea', descricao: 'Um ser em alcance curto sofre –1d20 em todos os testes até o fim da cena (Fortitude DT 23 reduz para 1 rodada).' },
    ] }),
  vamp({ name: 'O Verdadeiro Raziel', vd: 200, img: 'as07/criaturas/raziel-verdadeiro', ord: 141,
    flavor: 'A forma de Fúria Sanguinária de Raziel, assumida quando está machucado ou enfurecido.',
    percepcao: '2d20+10 (faro, percepção às cegas)', iniciativa: '4d20+15', defesa: 38, fortitude: '3d20+15', reflexos: '4d20+15', vontade: '2d20+10', pv: 400, mach: 200, deslocamento: '12m | 8',
    atributos: { agi: 4, for: 3, int: 3, pre: 2, vig: 3 }, pericias: 'Atletismo 3d20+15, Intimidação 2d20+15, Ocultismo 3d20+15',
    hab: [
      monstruosidade('Raziel'),
      ['Fúria Sanguinária', 'Raziel assume essa forma quando está machucado ou enfurecido, a critério do mestre. Se estiver com menos de 200 PV ao assumir essa forma, fica imediatamente com 200 PV.'],
      ['Sede Incontrolável', 'Se Alvira estiver sendo ameaçada, gasta todas as ações para matar quem a ameaça. Caso contrário, foca no alvo com menos PV na cena, para finalizá-lo.'],
    ],
    acoes: [
      { tipo: 'Padrão', nome: 'Garras, corpo a corpo x2', teste: '4d20+25, crítico 18', dano: '5d10+30 perfuração' },
      { tipo: 'Reação', nome: 'Revidar e Estripar', descricao: 'Uma vez por rodada, quando sofre um ataque corpo a corpo, revida com um ataque; se fizer isso, perde suas RD por 1 rodada.' },
      abraco('Raziel', '4d20+15', '10d6', 29), perseguir,
      { tipo: 'Padrão', nome: 'Bote Retalhador', dano: '10d10+30 perfuração + caído e sangrando', descricao: 'Salta sobre 1 ser em até 3m. O alvo escolhe: Atacar (um único ataque como reação; se errar, sofre o dano e as condições; se acertar, metade e sem condições) ou Escapar (Reflexos DT 29; falha sofre tudo, sucesso reduz à metade e evita as condições).' },
    ] }),
  vamp({ name: 'Alvira', vd: 120, img: 'as07/criaturas/alvira', ord: 142,
    flavor: 'Madre superior do clã de Raziel, ligada ao Sangue e às crenças distorcidas.',
    percepcao: '4d20+10 (faro, percepção às cegas)', iniciativa: '3d20+10', defesa: 26, fortitude: '2d20+5', reflexos: '3d20+10', vontade: '4d20+10', pv: 210, mach: 105,
    atributos: { agi: 3, for: 1, int: 2, pre: 4, vig: 2 }, pericias: 'Enganação 4d20+10, Medicina 2d20+10, Ocultismo 2d20+10, Religião 4d20+10',
    hab: [
      monstruosidade('Alvira'),
      ['Madre Superior', 'Qualquer aliado adjacente pode gastar uma ação de movimento para sugar o sangue de Alvira, causando-lhe 3d8+3 de dano; o aliado se cura na mesma quantidade (metade se ela estiver machucada). Não funciona se ela estiver morrendo.'],
      ['Rituais (DT 23)', 'Pode conjurar o ritual a seguir sem pagar seu custo de PE, até um limite de 10 PE por conjuração, usando a ação apropriada.'],
    ],
    acoes: [
      { tipo: 'Padrão', nome: 'Cruz de Sangue, corpo a corpo x2', teste: '1d20+15', dano: '2d12+10 corte' },
      { tipo: 'Movimento', nome: 'Clamor do Sangue Divino', descricao: 'Uma vez por cena, todos os seres em alcance longo, à escolha dela, recebem +1d20 em testes de Agilidade, Força ou Vigor até o fim da cena.' },
      { tipo: 'Padrão', nome: 'Bolsa de Sangue', descricao: 'Um ser em alcance longo recebe 3d8+3 PV; o que passar dos PV máximos vira PV temporários.' },
      { tipo: 'Padrão', nome: 'Sussurro Horripilante', descricao: 'Faz a voz ressoar por alcance longo, com os mesmos efeitos de uma presença perturbadora (DT 23, 4d6 mental, NEX 50% é imune).' },
      { tipo: 'Completa', nome: 'Ritual: Vampirismo (Sangue 2)', descricao: 'Ritual complexo com diversas escolhas; veja o ritual Vampirismo.' },
      { tipo: 'Completa', nome: 'Titereira de Sangue', descricao: 'Cordas de Sangue manipulam o corpo de 1 ser em alcance longo até o fim da cena; o alvo deve ter bebido ou sido curado pelo sangue dela. Em seu turno, gasta todas as ações fazendo o que ela ordenar (Fortitude DT 23 evita; pode repetir o teste no início de cada turno).' },
      { tipo: 'Completa', nome: 'Transferir Sangue', descricao: 'Uma vez por rodada, regurgita sangue em 1 ser adjacente: ela sofre 3d8+3 de dano e cura o alvo na mesma quantidade (metade se machucada). O alvo pode evitar a cura com Reflexos (DT 23). Não funciona se ela estiver morrendo.' },
    ] }),
  vamp({ name: 'Sabara', vd: 100, img: 'as07/criaturas/sabara', ord: 143,
    flavor: 'Espadachim do clã de Raziel, mestra da espada e da adaga.',
    percepcao: '2d20+5 (faro, percepção às cegas)', iniciativa: '3d20+10', defesa: 25, fortitude: '2d20+5', reflexos: '3d20+10', vontade: '2d20', pv: 200, mach: 100,
    atributos: { agi: 3, for: 3, int: 2, pre: 2, vig: 2 }, pericias: 'Acrobacia 3d20+10, Atletismo 3d20+10, Sobrevivência 2d20+10',
    hab: [monstruosidade('Sabara')],
    acoes: [
      { tipo: 'Padrão', nome: 'Espada e Adaga, corpo a corpo x2', teste: '3d20+15, crítico 18/x3', dano: '2d6+10 corte mais 2d4 Sangue' },
      { tipo: 'Padrão', nome: 'Arremessar Faca, à distância (curto) x2', teste: '3d20+15, crítico 19', dano: '4d4+10 perfuração' },
      { tipo: 'Reação', nome: 'Esquiva', descricao: 'Uma vez por rodada, quando sofre um ataque, recebe +10 na Defesa contra ele.' },
      { tipo: 'Reação', nome: 'Mil Perfurações', descricao: 'Se acertar os dois ataques de espada e adaga no mesmo alvo, deixa-o sangrando (Fortitude DT 21 evita); esse sangramento causa a perda de 2d6 PV (em vez de 1d6).' },
      { tipo: 'Reação', nome: 'Ripostar e Revidar', descricao: 'Uma vez por rodada, quando sofre um ataque corpo a corpo, se defende com um ataque de espada e adaga; se vencer o teste oposto, não sofre dano e causa 2d6+10 corte mais 2d4 Sangue ao atacante.' },
      { tipo: 'Livre', nome: 'Ringen am Schwert', dano: '6d6 Sangue (Fortitude DT 21 reduz à metade)', descricao: 'Se acertar um ataque, pode agarrar o alvo (teste 3d20+15). Uma vez por rodada, como ação livre, morde um ser agarrado e recupera metade do dano em PV.' },
      perseguir,
      { tipo: 'Padrão', nome: 'Dança Armada', dano: '2d6+10 corte mais 2d4 Sangue (Reflexos DT 21 reduz à metade)', descricao: 'Gira com os braços estendidos, golpeando todos os seres adjacentes à sua escolha.' },
      { tipo: 'Padrão', nome: 'Golpe Derrubante', dano: '2d6+10 corte mais 2d4 Sangue + caído (Reflexos DT 21 reduz à metade e evita a condição)', descricao: 'Golpeia atrás da perna de 1 ser adjacente e mantém a ponta da espada no peito dele. Se a vítima se levantar ou agir, Sabara faz um ataque de espada e adaga como reação. Para rolar para longe, a vítima gasta uma ação padrão e testa Iniciativa (DT 23); se falhar, sofre o ataque de reação.' },
    ] }),
  vamp({ name: 'Velisar', vd: 100, img: 'as07/criaturas/velisar', ord: 144,
    flavor: 'O cientista do clã, mestre de Zéfero. Percebe auras paranormais e armadilhas, e cria armadilhas de sangue.',
    percepcao: '3d20+10 (faro, percepção às cegas)', iniciativa: '2d20+5', defesa: 25, fortitude: '2d20', reflexos: '2d20+5', vontade: '3d20+10', pv: 180, mach: 90,
    atributos: { agi: 2, for: 1, int: 4, pre: 3, vig: 2 }, pericias: 'Artes 3d20+10, Atletismo 1d20+10, Ciências 4d20+10, Ocultismo 4d20+10, Tecnologia 4d20+10',
    hab: [
      monstruosidade('Velisar'),
      ['Velisar Sabe', 'Percebe auras paranormais e criaturas invisíveis ou semelhantes em alcance médio, e qualquer ameaça ou armadilha em um raio de 18m.'],
    ],
    acoes: [
      { tipo: 'Padrão', nome: 'Garras, corpo a corpo x2', teste: '3d20+15, crítico 19', dano: '2d10+10 perfuração' },
      { tipo: 'Reação', nome: 'Esquiva', descricao: 'Uma vez por rodada, quando sofre um ataque, recebe +5 na Defesa contra ele.' },
      abraco('Velisar', '3d20+15', '6d6', 21), perseguir,
      { tipo: 'Padrão', nome: 'Armadilha Sanguinária', descricao: 'Cria uma armadilha em espaço desocupado em alcance médio, ativada por quem ficar a 3m ou menos (Investigação DT 21 encontra; Ocultismo DT 21 desarma). Caixão de Sangue: 1 ser fica agarrado, caído e enredado (Reflexos DT 21 evita), e Velisar pode teletransportar o caixão para sua base. Explosão de Carne: todos a 3m sofrem 6d6 perfuração e ficam sangrando (Reflexos DT 21 reduz à metade e evita a condição). Gás Paralisante: todos a 3m ficam paralisados por 1d4+1 rodadas (Fortitude DT 21 muda para 1 rodada).' },
      { tipo: 'Padrão', nome: 'Comandar Experimento', descricao: 'Uma vez por rodada, comanda um de seus experimentos em alcance longo; se o experimento cumprir o comando até o próximo turno de Velisar e envolver um teste, recebe +1d20 nele.' },
      { tipo: 'Padrão', nome: 'Olhar da Curiosidade Mórbida', descricao: 'Encara 1 ser em alcance médio: Reflexos (DT 21) para desviar o olhar ou Vontade (DT 21) para resistir. Se falhar, fica fascinado e só pode dar atenção e ser prestativo com Velisar até sofrer ação hostil ou ser sacudido.' },
    ] }),
  vamp({ name: 'Zéfero', vd: 80, img: 'as07/criaturas/zefero', ord: 145, resistencias: 'Balístico, impacto e perfuração 5, Sangue 10',
    flavor: 'O "espécime" domesticado por Velisar em Praga: rápido, leve, com olfato estupendo. Faz o que o mestre manda em troca de carne ou sangue.',
    percepcao: '2d20+5 (faro, percepção às cegas)', iniciativa: '2d20+10', defesa: 23, fortitude: '3d20+10', reflexos: '2d20+5', vontade: '2d20', pv: 140, mach: 70, deslocamento: '12m | 8, Escalada 12m | 8',
    atributos: { agi: 2, for: 3, int: 0, pre: 2, vig: 2 }, pericias: 'Atletismo 3d20+10',
    hab: [
      ['Demônio de Coleira', 'Domesticado por Velisar; em troca de carne ou sangue, faz o que ele manda. Se Velisar morrer, pode ser domesticado por um novo dono que ofereça carne ou sangue e passe em Adestramento (DT 20).'],
      ['Fome Bestial', 'Se Velisar estiver sendo ameaçado, gasta todas as ações para matar quem o ameaça. Caso contrário, foca no alvo com menos PV na cena.'],
      monstruosidade('Zéfero', 5, 10),
    ],
    acoes: [
      { tipo: 'Padrão', nome: 'Garras, corpo a corpo x2', teste: '3d20+10, crítico 19', dano: '1d10+10 perfuração' },
      { tipo: 'Padrão', nome: 'Mordida Furiosa, corpo a corpo', teste: '3d20+10, crítico 19', dano: '3d12+20 Sangue' },
      { tipo: 'Reação', nome: 'Bloqueio', descricao: 'Uma vez por rodada, quando sofre um ataque, recebe RD 10 contra ele.' },
      { tipo: 'Livre', nome: 'Agarrão Lacerador', dano: '4d6 Sangue (Fortitude DT 20 reduz à metade)', descricao: 'Se acertar a mordida, pode agarrar o alvo (teste 3d20+10). Uma vez por rodada, como ação livre, morde um ser agarrado e recupera metade do dano em PV.' },
      { tipo: 'Livre', nome: 'Dilacerar', descricao: 'Se acertar os dois ataques de garras no mesmo alvo, causa +1d10 de dano de perfuração.' },
    ] }),
)

L('\n-- ===================== Fichas novas: AS06 (Panacea) e NPCs do AS07 =====================\n')
L('insert into creatures (source_id, name, vd, flavor_text, descritores, tamanho, categoria, tipo_criatura, presenca_dt, presenca_dano, presenca_nex_imune, percepcao, iniciativa, defesa, fortitude, reflexos, vontade, pv_maximo, pv_machucado, resistencias, vulnerabilidades, atributos, pericias, deslocamento, habilidades, acoes, image_url, sort_order)\nvalues')
L(criaturas.map((c) => {
  const p = c.presenca ?? [null, null, null]
  return `(${src(c.s)}, ${q(c.name)}, ${c.vd}, ${q(c.flavor)}, ${arr(c.descritores)}, ${q(c.tamanho ?? 'Médio')}, ${q(c.categoria)}, ${q(c.tipo)}, ${q(p[0])}, ${q(p[1])}, ${q(p[2])}, ${q(c.percepcao)}, ${q(c.iniciativa)}, ${c.defesa}, ${q(c.fortitude)}, ${q(c.reflexos)}, ${q(c.vontade)}, ${c.pv}, ${c.mach}, ${q(c.resistencias ?? null)}, ${q(c.vulnerabilidades ?? null)}, ${j(c.atributos)}, ${q(c.pericias ?? null)}, ${q(c.deslocamento ?? '9m | 6')}, ${j(c.hab.map(([nome, descricao]) => ({ nome, descricao })))}, ${j(c.acoes)}, ${q(img(c.img))}, ${c.ord})`
}).join(',\n') + ';')

// ---------- aliados do AS06 ----------
const aliados = [
  ['Alice Cruzes', 'A diretora de algumas instalações da Panacea é uma mestra estrategista, capaz de analisar cenários complexos em segundos e coordenar seus aliados com precisão cirúrgica.', 'Você recebe +1d20 em Diplomacia e Tática.', 'Ainda é Útil', 'Uma vez por cena, quando está morrendo, você pode gastar 3 PE para ser estabilizado.', 'alice-cruzes'],
  ['Ketan Arjuna', 'Chefe de Segurança da Panacea, apto para qualquer tipo de combate, corpo a corpo ou à distância.', 'Sempre que causar dano, você causa +2d4 pontos de dano extra de um tipo à sua escolha (balístico, corte, impacto ou perfuração).', 'Fornecimento Secreto', 'Uma vez por missão, como uma ação de interlúdio, você pode gastar 3 PE para receber uma arma, que não seja amaldiçoada, de até categoria II. Se precisar, também recebe 2 pacotes de munição.', 'ketan-arjuna'],
  ['Laila Verdante', 'Laila possui um vasto conhecimento acerca da psique humana e de como o paranormal a afeta.', 'Você recebe resistência a dano mental 2.', 'Ajuda Especializada', 'Uma vez por dia, você pode gastar 3 PE para fazer um teste de Vontade usando o Ocultismo (4d20+10) de Laila, em vez de sua própria perícia.', 'laila-verdante'],
  ['Dr. Neruda', 'Um entre vários pesquisadores da Panacea; diferente da maioria, sabe muito bem o que faz lá. E adora o seu trabalho.', 'Sempre que causar dano com um ataque, o alvo também perde 1d4 PV.', 'Imunologista', 'Como uma ação de interlúdio, você pode gastar 3 PE para reduzir o estágio de uma doença que esteja afetando você em 1.', 'dr-neruda'],
]
L('\n-- ===================== Aliados do AS06 =====================\n')
L('insert into allies (source_id, tipo, name, descricao, bonus, habilidade_nome, habilidade, image_url, sort_order)\nvalues')
L(aliados.map(([n, d, b, hn, h, im], i) => `(${src('arquivos_secretos_06')}, 'pessoa', ${q(n)}, ${q(d)}, ${q(b)}, ${q(hn)}, ${q(h)}, ${q(img('as06/criaturas/' + im))}, ${20 + i})`).join(',\n') + ';')

// ---------- ritual Vampirismo ----------
const vasos = (n) => [
  `Vasos da Visão: você visualiza flashes confusos da pessoa lutando pela própria vida. Você recebe +${[5, 10, 15][n]} em testes de ataque.`,
  `Vasos da Audição: você entende um pouco da linguagem utilizada pela pessoa. Se a pessoa conjurava rituais de ${n + 1}º círculo, você pode escolher um para ser capaz de conjurar normalmente.`,
  `Vasos do Paladar: você consegue sentir a vitalidade fluindo. Você recupera ${['2d8+2', '3d8+3', '4d8+4'][n]} PV.`,
  `Vasos do Olfato: você consegue discernir com mais facilidade os rastros de um único ser ligado à pessoa. Você recebe +${[5, 10, 15][n]} em testes para rastrear o ser.`,
  `Vasos do Tato: você sente que pode reproduzir as capacidades da pessoa. Se a pessoa é ${['treinada', 'veterana', 'expert'][n]} em perícias, você pode escolher uma para ser ${['treinado', 'veterano', 'expert'][n]}. Se já for ${['treinado', 'veterano', 'expert'][n]} na perícia escolhida, em vez disso, recebe +2 nela.`,
].map((x) => '- ' + x).join('\n')
L(`\n-- ===================== Ritual Vampirismo (AS07) =====================\n
insert into rituals (source_id, name, elemento, circle, execution, range, target, duration, resistance, effect, discente_cost, discente_effect, discente_requires_circle, verdadeiro_cost, verdadeiro_effect, verdadeiro_requires_circle, verdadeiro_requires_affinity, image_url)
values (${src('arquivos_secretos_07')}, 'Vampirismo', 'sangue', 2, 'completa', 'toque', '1 pessoa', 'cena', null,
${q(`Você absorve fragmentos de memórias inconscientes e instintivas de um ser. Este ritual transforma o corpo de uma pessoa viva ou morta em uma refeição paranormal até o fim da cena; com o fim da cena, o mesmo corpo não pode ser alvo deste ritual novamente. Qualquer pessoa que gaste 1 minuto comendo parte desse corpo recebe os efeitos dos vasos sanguíneos que escolheu consumir. Os mesmos vasos não podem ser consumidos mais de uma vez. Os efeitos duram até o final da cena.\n\nEscolha quais vasos sanguíneos deseja consumir:\n${vasos(0)}`)},
5, ${q(`Escolha quais vasos sanguíneos deseja consumir:\n${vasos(1)}`)}, 3,
10, ${q(`Escolha quais vasos sanguíneos deseja consumir:\n${vasos(2)}`)}, 4, true,
${q(img('as07/rituais/vampirismo'))});
`)

L(`-- ===================== Pericia Religiao: novo uso (AS07) =====================

update skills
set description = description || ${q('\r\n\r\n**Resguardar Espírito (Treinado, DT 20).** Você pode gastar uma ação completa e fazer um teste de Religião para dedicar um breve rito religioso de proteção (rezas, oferendas, mantras etc.) a você ou uma pessoa adjacente. Se passar, o alvo recebe +2 em testes de Vontade até o final da cena. Se falhar, não pode tentar novamente na mesma pessoa até o final da cena. O bônus é fruto de como a fé pode motivar o ser humano, não tendo qualquer efeito paranormal. (Arquivos Secretos 07)')}
where name = 'Religião' and description not like '%Resguardar Espírito%';
`)

fs.writeFileSync(require('path').join(__dirname, '../migrations/0087_extras_as05_as06_as07.sql'), out.join('\n'))
console.log('ok', criaturas.length, 'criaturas,', aliados.length, 'aliados,', itens.length, 'itens,', tokens.length, 'tokens')
