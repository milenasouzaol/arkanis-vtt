-- Bestiário Arquivos Secretos 02 — Os Mascarados (5 agentes + Juan, cada um com forma
-- normal e "Intenção Assassina" transformada = 12 fichas) + Fauna Corrompida do
-- Hexatombe (2 animais mundanos base + 4 versões corrompidas por Sangue).

insert into creatures (source_id, categoria, tipo_criatura, name, vd, flavor_text, tamanho, percepcao, iniciativa, defesa, fortitude, reflexos, vontade, pv_maximo, pv_machucado, atributos, pericias, deslocamento, habilidades, acoes, sort_order)
values
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'mundana', 'Pessoa', 'Jonas Aguiar', 80,
  'Ex-policial de Inquisidor do Vale, teve sua consciência transferida pro corpo do serial killer "Mutilador Noturno" pra se infiltrar no Hexatombe. Carrega a intenção assassina do corpo original, que pode "despertar" e assumir o controle. (Forma normal — ver também "Mutilador Noturno".)',
  'Médio', '+1d20+5', '+2d20+5', 21, '+2d20+5', '+2d20+5', '+1d20+5', 120, 60,
  '{}', 'Adestramento +2d20+5, Atletismo +3d20+10, Crime +2d20+5, Enganação +2d20+5, Furtividade +2d20+5, Investigação +1d20+5, Pilotagem +2d20+5, Sobrevivência +1d20+5', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Machado, corpo a corpo x2)","teste":"3d20+10, crítico x3","dano":"1d8+10 corte + 1d8 Sangue (multiplica em crítico) + sangrando"},{"tipo":"Padrão","nome":"Agredir (Revólver, distância x2 curto)","teste":"2d20+10, crítico 19/x3","dano":"2d6+10 balístico"},{"tipo":"Reação","nome":"Revidar","descricao":"1x/rodada, ataque contra Jonas erra, contra-ataca corpo a corpo."},{"tipo":"Livre","nome":"Golpe Cruel","descricao":"1x/rodada, ao atacar, +5 no teste e na rolagem de dano."},{"tipo":"Padrão","nome":"Intenção Assassina","descricao":"Desperta a intenção, vira o Mutilador Noturno."},{"tipo":"Padrão","nome":"Predador de Sangue","descricao":"Memoriza odor de vítima (precisa de fonte física, ex. pedaço de roupa); +1d20 pra rastrear/perceber/atacá-la; só 1 vítima memorizada por vez."},{"tipo":"Reação (Poder de Intenção)","nome":"RD ao ser ferido","descricao":"Quando ferido 3x (cada ferimento 5+ dano), ativa RD 25; enquanto ativo, perde 5 PV no início de cada turno."}]',
  108
),
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'mundana', 'Pessoa', 'Mutilador Noturno', 140,
  'Forma transformada de Jonas Aguiar, despertada pela "Intenção Assassina" do corpo original do serial killer.',
  'Médio', '+1d20+10', '+2d20+10', 29, '+2d20+10', '+2d20+10', '+1d20+10', 260, 130,
  '{}', 'Adestramento +2d20+10, Atletismo +3d20+15, Crime +2d20+10, Enganação +2d20+10, Furtividade +2d20+10, Investigação +1d20+10, Pilotagem +2d20+10, Sobrevivência +1d20+10', '9m | 6',
  '[{"nome":"Predador Perfeito","descricao":"Ação padrão adicional por rodada."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Machado, corpo a corpo x2)","teste":"3d20+15, crítico x3","dano":"1d8+20 corte + 2d8 Sangue (multiplica em crítico) + sangrando"},{"tipo":"Padrão","nome":"Agredir (Revólver, distância x2 curto)","teste":"2d20+15, crítico 19/x3","dano":"3d6+20 balístico"},{"tipo":"Reação","nome":"Revidar Violento","descricao":"2x/rodada, ataque corpo a corpo contra o Mutilador erra, contra-ataca corpo a corpo."},{"tipo":"Livre","nome":"Golpe Mutilador","descricao":"1x/rodada, ao atacar, +5 no teste e +10 no dano."},{"tipo":"Padrão","nome":"Intenção Assassina","descricao":"Adormece a intenção (volta a ser Jonas), não pode reusar até dormir. Sem matar ninguém até o fim da cena nessa forma, a intenção adormece sozinha e só reativa depois de dormir."},{"tipo":"Padrão","nome":"Predador Sanguinário","descricao":"Mesmo efeito de Predador de Sangue."},{"tipo":"Reação (Poder de Intenção)","nome":"RD ao ser ferido","descricao":"Mesma regra: ferido 3x, RD 25, perde 5 PV/turno enquanto ativo."}]',
  109
),
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'mundana', 'Pessoa', 'Dalmo Magno', 80,
  'Lutador de arena clandestina que teve sua consciência transferida pro corpo do "Colosso", um dos assassinos mais fisicamente destrutivos do Hexatombe — poderes de impacto e pressão de Energia através dos punhos. (Forma normal — ver também "Colosso".)',
  'Médio', '+1d20+5', '+1d20+5', 23, '+3d20+10', '+1d20+5', '+1d20+5', 140, 70,
  '{}', 'Atletismo +4d20+10, Intimidação +1d20+10, Pilotagem +1d20+10', '9m | 6',
  '[{"nome":"Lutador de Arena","descricao":"+5 em manobras de combate (inclusive pra resistir a elas)."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Pancada, corpo a corpo x2)","teste":"4d20+10","dano":"2d6+10 impacto + 1d10 Energia"},{"tipo":"Reação","nome":"Corpo Fechado","descricao":"1x/rodada, sofrendo dano, RD 10 contra esse dano."},{"tipo":"Reação","nome":"Pressão Atmosférica","dano":"+1d10 Energia + atordoado 1 rodada (Fortitude DT 20 evita; só 1x/cena por alvo)","descricao":"1x/rodada, acertando corpo a corpo em alvo agarrado."},{"tipo":"Livre","nome":"Golpes de Arena","descricao":"1x/rodada, acertando corpo a corpo, ataque de pancada adicional ou manobra de combate no mesmo alvo."},{"tipo":"Padrão","nome":"Intenção Assassina","descricao":"Desperta, vira o Colosso."}]',
  110
),
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'mundana', 'Pessoa', 'Colosso', 140,
  'Forma transformada de Dalmo Magno.',
  'Médio', '+1d20+10', '+1d20+10', 31, '+3d20+15', '+1d20+10', '+1d20+10', 280, 140,
  '{}', 'Atletismo +4d20+15, Intimidação +1d20+15, Pilotagem +1d20+15', '9m | 6',
  '[{"nome":"Campeão de Arena","descricao":"+10 em manobras de combate (inclusive pra resistir a elas)."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Pancada, corpo a corpo x2)","teste":"4d20+15","dano":"4d6+20 impacto"},{"tipo":"Reação","nome":"Campo de Pressão","descricao":"1x/rodada, sofrendo dano, RD 15 contra esse dano."},{"tipo":"Reação","nome":"Implosão Atmosférica","dano":"+1d10 Energia + atordoado 1 rodada + caído + sangrando (Fortitude DT 24 evita só o atordoado; só 1x/cena por alvo)","descricao":"1x/rodada, acertando corpo a corpo em alvo agarrado."},{"tipo":"Livre","nome":"Golpes de Jaula","dano":"+1d10 impacto no ataque extra","descricao":"1x/rodada, acertando corpo a corpo, ataque/manobra adicional no mesmo alvo."},{"tipo":"Padrão","nome":"Intenção Assassina","descricao":"Adormece (volta a ser Dalmo), não reusa até dormir; sem matar até o fim da cena, adormece sozinha."}]',
  111
),
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'mundana', 'Pessoa', 'Jae-Yoon', 80,
  'Agente com habilidades analíticas, teve sua consciência transferida pro corpo de um assassino cuja identidade nunca é revelada — só conhecido como "X" (marca a boca das vítimas com um X). (Forma normal — ver também "X".)',
  'Médio', '+1d20+5', '+3d20+10', 22, '+1d20+5', '+3d20+10', '+1d20+5', 100, 50,
  '{}', 'Acrobacia +3d20+5, Atletismo +2d20+5, Crime +3d20+10, Enganação +1d20+10, Furtividade +3d20+10, Investigação +3d20+10, Tecnologia +3d20+5', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Punhal, corpo a corpo x2)","teste":"3d20+10, crítico 19/x2","dano":"2d4+10 perfuração + 1d6 Conhecimento"},{"tipo":"Reação","nome":"Esquiva Tática","descricao":"1x/rodada, sofrendo ataque, esquiva +10 Defesa."},{"tipo":"Reação","nome":"Perito","descricao":"1x/rodada, teste de perícia treinada, +1d8."},{"tipo":"Livre","nome":"Assassinato Furtivo","descricao":"1x/rodada, atingindo desprevenido/flanqueado, +3d8 dano."},{"tipo":"Livre","nome":"Punhal X","descricao":"1x/rodada, ao atacar, deixa alvo desprevenido; causando dano, cego 1 rodada (só 1x/cena por alvo)."},{"tipo":"Padrão","nome":"Intenção Assassina","descricao":"Desperta, vira X."},{"tipo":"Completa","nome":"Zona dos Sussurros","descricao":"Marca área tipo cômodo com \"X\"s; nela, +5 ataque e sem penalidade em Furtividade após ação chamativa; máximo 3 áreas simultâneas (4ª some uma antiga)."},{"tipo":"Reação (Poder de Intenção)","nome":"Prova de Sangue","descricao":"Prova sangue de adjacente machucado: ataques +1d8 dano e +2 margem de ameaça; crítico corta a boca do alvo em X — silenciado (não comunica nem usa poder/ritual) por 1d4 rodadas, até o fim da cena."}]',
  112
),
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'mundana', 'Pessoa', 'X', 140,
  'Forma transformada de Jae-Yoon.',
  'Médio', '+1d20+10', '+3d20+15', 30, '+1d20+10', '+3d20+15', '+1d20+10', 200, 100,
  '{}', 'Acrobacia +3d20+10, Atletismo +2d20+10, Crime +3d20+15, Enganação +1d20+15, Furtividade +3d20+15, Investigação +3d20+15, Tecnologia +3d20+10', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Punhal, corpo a corpo x2)","teste":"3d20+15, crítico 19/x2","dano":"4d4+20 perfuração + 2d6 Conhecimento"},{"tipo":"Reação","nome":"Analítico","descricao":"1x/rodada, teste de perícia treinada, +1d12."},{"tipo":"Reação","nome":"Esquiva Sombria","descricao":"2x/rodada, sofrendo ataque, esquiva +10 Defesa."},{"tipo":"Livre","nome":"Assassinato Cruel","descricao":"1x/rodada, atingindo desprevenido/flanqueado, +6d8 dano."},{"tipo":"Livre","nome":"Punhal X","descricao":"1x/rodada, ao atacar, deixa alvo desprevenido; causando dano, cego 2 rodadas (só 1x/cena por alvo)."},{"tipo":"Padrão","nome":"Intenção Assassina","descricao":"Adormece (volta a ser Jae), não reusa até dormir; sem matar até o fim da cena, adormece sozinha."},{"tipo":"Completa","nome":"Zona das Sombras","descricao":"Mesma mecânica de Zona dos Sussurros; usando Assassinato Cruel dentro da zona, rerrola resultados 7-8 nos dados de dano e soma ao total."},{"tipo":"Reação (Poder de Intenção)","nome":"Prova de Sangue","descricao":"Mesma regra de Jae-Yoon."}]',
  113
),
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'mundana', 'Pessoa', 'Kemi', 80,
  'Mercenária atiradora de elite, teve sua consciência transferida pro corpo de "Fantasma", assassino sniper ligado à Morte. (Forma normal — ver também "Fantasma".)',
  'Médio', '+2d20+5', '+3d20+10', 23, '+1d20+5', '+3d20+10', '+2d20+5', 90, 45,
  '{}', 'Acrobacia +3d20+10, Atletismo +1d20+5, Crime +3d20+10, Furtividade +3d20+10, Investigação +3d20+10, Medicina +3d20+5, Ocultismo +3d20+5, Sobrevivência +2d20+5', '9m | 6',
  '[{"nome":"Sniper da Morte","descricao":"Alvo reduzido a 0 PV pela sniper dela morre iniciando 2 turnos morrendo (em vez de 3)."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Facada, corpo a corpo x2)","teste":"3d20+10, crítico 19/x2","dano":"2d4+10 perfuração"},{"tipo":"Padrão","nome":"Agredir (Fuzil de Precisão, distância longo)","teste":"3d20+10, crítico 17/x3","dano":"2d10+20 balístico + 2d4 Morte"},{"tipo":"Reação","nome":"Esquiva Tática","descricao":"1x/rodada, sofrendo ataque, +10 Defesa."},{"tipo":"Reação","nome":"Perito","descricao":"1x/rodada, teste de perícia treinada, +1d8."},{"tipo":"Livre","nome":"Disparo da Morte","descricao":"1x/rodada, atacando com arma de fogo, +2 margem de ameaça."},{"tipo":"Padrão","nome":"Intenção Assassina","descricao":"Desperta, vira Fantasma."},{"tipo":"Reação (Poder de Intenção)","nome":"Vingança","descricao":"1x/rodada, ao ouvir o grito de morte de alguém que tentou proteger (em seu campo de visão), ataca quem causou; também usável contra quem a deixou morrendo."}]',
  114
),
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'mundana', 'Pessoa', 'Fantasma', 140,
  'Forma transformada de Kemi.',
  'Médio', '+2d20+10', '+3d20+15', 30, '+1d20+10', '+3d20+15', '+2d20+10', 180, 90,
  '{}', 'Acrobacia +3d20+15, Atletismo +1d20+10, Crime +3d20+15, Furtividade +3d20+15, Investigação +3d20+15, Medicina +3d20+10, Ocultismo +3d20+10, Sobrevivência +2d20+10', '9m | 6',
  '[{"nome":"Sniper da Morte","descricao":"Mesma regra (2 turnos morrendo em vez de 3)."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Facada, corpo a corpo x2)","teste":"3d20+15, crítico 19/x2","dano":"4d4+20 perfuração"},{"tipo":"Padrão","nome":"Agredir (Fuzil de Precisão, distância longo)","teste":"3d20+15, crítico 17/x3","dano":"4d10+40 balístico + 4d4 Morte"},{"tipo":"Reação","nome":"Analítica","descricao":"1x/rodada, teste de perícia treinada, +1d12."},{"tipo":"Reação","nome":"Esquiva Fantasma","descricao":"2x/rodada, sofrendo ataque, +10 Defesa."},{"tipo":"Livre","nome":"Disparo Espiral","descricao":"1x/rodada, atacando com arma de fogo, +2 margem de ameaça + ignora cobertura e 10 de resistência a dano."},{"tipo":"Padrão","nome":"Intenção Assassina","descricao":"Adormece (volta a ser Kemi), não reusa até dormir; sem matar até o fim da cena, adormece sozinha."},{"tipo":"Reação (Poder de Intenção)","nome":"Vingança","descricao":"Mesma regra de Kemi."}]',
  115
),
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'mundana', 'Pessoa', 'Labirinto', 80,
  'Ocultista que teve sua consciência transferida pro corpo de um assassino ligado a Morte/Conhecimento/Energia — usa rituais de verdade (não poderes fixos), com uma antena que armazena um ritual pra liberar depois. (Forma normal — ver também "Forma Transformada".)',
  'Médio', '+3d20+5', '+1d20+5', 20, '+1d20+5', '+1d20+5', '+3d20+10', 120, 60,
  '{}', 'Ciências +3d20+10, Intuição +3d20+5, Investigação +3d20+10, Medicina +3d20+10, Ocultismo +3d20+15, Sobrevivência +3d20+5, Tecnologia +3d20+10', '9m | 6',
  '[{"nome":"Antena do Medo","descricao":"Pode conjurar um ritual na antena (fica contido, sem efeito na hora); ação padrão libera o efeito sem gastar recursos de conjuração; só 1 ritual por vez na antena."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Pancada com Antena, corpo a corpo x2)","teste":"1d20+5","dano":"1d8+10 impacto"},{"tipo":"Padrão","nome":"Ritual Mapa Sanguíneo (Sangue 2)","descricao":"Toca superfície, mapa de sangue mostra localização de todos os seres em 1km (Vontade DT 20 evita); dura até o fim da cena."},{"tipo":"Padrão","nome":"Ritual Capturar Momento (Morte 2)","descricao":"Marca local em alcance médio com símbolo invisível que capta imagens/sons; ação padrão vê/ouve remotamente; máximo 3 símbolos (4º substitui o mais antigo)."},{"tipo":"Padrão","nome":"Ritual Labirinto Mental (Conhecimento 2)","descricao":"Prende mente de alvo em alcance médio; 1d4 rodadas gastando ações se movendo em direção aleatória; Vontade DT 20 no início do turno liberta."},{"tipo":"Padrão","nome":"Ritual Rajada Caótica (Energia 2)","dano":"8d8 Energia (Reflexos DT 20 reduz à metade)","descricao":"Raio em alcance médio."},{"tipo":"Padrão","nome":"Intenção Assassina","descricao":"Desperta, vira a forma transformada."},{"tipo":"Reação (Poder de Intenção)","nome":"Absorver Intenções","descricao":"Testemunhando a morte de alguém, absorve intenções (alcance curto) e cura um ser em alcance curto em PV = metade dos PV máximos do cadáver."}]',
  116
),
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'mundana', 'Pessoa', 'Forma Transformada (Labirinto)', 140,
  'Forma transformada de Labirinto (identidade original do assassino nunca revelada no livro). Nota de extração: o livro mostra "???" no lugar do círculo dos 4 rituais desta forma — provável erro de diagramação (versões mais fortes dos rituais de círculo 2 da forma normal, então provavelmente 3º círculo, mas não confirmado no texto).',
  'Médio', '+3d20+10', '+1d20+10', 28, '+1d20+10', '+1d20+10', '+3d20+15', 240, 120,
  '{}', 'Ciências +3d20+15, Intuição +3d20+10, Investigação +3d20+15, Medicina +3d20+15, Ocultismo +3d20+20, Sobrevivência +3d20+10, Tecnologia +3d20+15', '9m | 6',
  '[{"nome":"Antena do Medo","descricao":"Mesma regra da forma normal."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Pancada com Antena, corpo a corpo x2)","teste":"1d20+10","dano":"2d8+20 impacto"},{"tipo":"Padrão","nome":"Ritual Consumir Momento (Morte, círculo \"???\")","dano":"8d8 Morte (Fortitude DT 25 reduz à metade)","descricao":"Como Capturar Momento, mas alternativamente pode fazer o símbolo explodir em todos os captados."},{"tipo":"Padrão","nome":"Ritual Labirinto Abissal (Conhecimento, círculo \"???\")","descricao":"Como Labirinto Mental, mas dura até o fim da cena (DT 25)."},{"tipo":"Padrão","nome":"Ritual Revelação Sanguínea (Sangue, círculo \"???\")","descricao":"Como Mapa Sanguíneo, mas também revela condição de saúde (ileso/ferido/machucado/morrendo) de cada ser (DT 25)."},{"tipo":"Padrão","nome":"Ritual Tempestade Caótica (Energia, círculo \"???\")","dano":"8d10 Energia (Reflexos DT 25 reduz à metade)","descricao":"Raio; nas rodadas seguintes até o fim da cena, ação padrão dispara outro raio igual."},{"tipo":"Padrão","nome":"Intenção Assassina","descricao":"Adormece (volta ao normal), não reusa até dormir; sem matar até o fim da cena, adormece sozinha."},{"tipo":"Reação (Poder de Intenção)","nome":"Absorver Intenções","descricao":"Mesma regra."}]',
  117
),
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'mundana', 'Pessoa', 'Juan', 80,
  'O sacrifício da equipe dos Mascarados — não passou pelo ritual de troca de corpos como os outros 5; carrega uma relíquia/entidade de Sangue ("Ele") que o guia, e um pacto com o Diabo que lhe dá uma forma "diabólica" transformada. (Forma normal — ver também "Juan Diabólico".)',
  'Médio', '+3d20+5', '+3d20+10', 20, '+1d20+5', '+2d20+10', '+3d20+10', 100, 50,
  '{}', 'Atletismo +2d20+5, Enganação +3d20+5, Intimidação +3d20+10, Ocultismo +2d20+10', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Facada, corpo a corpo x2)","teste":"2d20+10, crítico 19/x2","dano":"2d4+10 perfuração + 2d10 Sangue"},{"tipo":"Reação","nome":"Faca Predadora","descricao":"1x/rodada, acertando ataque, recupera 2d10 PV (excedente vira PV temporário)."},{"tipo":"Padrão","nome":"Armadura de Sangue Diabólica","descricao":"Conjura o ritual — vira Juan Diabólico."},{"tipo":"Padrão","nome":"Ritual Descansar Discente (Sangue 2)","dano":"10d8 (metade corte/Sangue) + hemorragia (Fortitude DT 20, 4d8 Sangue/turno até passar 2 seguidos)","descricao":"Toque."},{"tipo":"Padrão","nome":"Ritual Perturbação Discente (Conhecimento 2)","descricao":"Alcance curto, uma ordem (Vontade DT 20 anula) — Fuja/Largue/Sente/Venha/Sofra (3d8 Conhecimento + abalado 1 rodada)."},{"tipo":"Padrão","nome":"Ritual Vínculo de Sangue (Sangue 4)","descricao":"Símbolo em si + alvo em alcance curto até o fim da cena (Fortitude DT 20 se involuntário); metade do dano sofrido por você transfere pro alvo (ou inverso, à escolha na conjuração)."},{"tipo":"Reação (Poder de Intenção)","nome":"Sucesso Automático","descricao":"Se obedeceu \"Ele\" na cena, 1x/cena pode declarar sucesso automático (como 20 natural) num teste, na mesma cena em que obedeceu."}]',
  118
),
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'mundana', 'Pessoa', 'Juan Diabólico', 140,
  'Forma transformada de Juan. Nota de extração: mesmo padrão do Labirinto — os rituais desta forma aparecem com "???" no círculo no livro (provável erro de diagramação).',
  'Médio', '+3d20+10', '+3d20+15', 31, '+1d20+10', '+2d20+15', '+3d20+15', 280, 140,
  '{}', 'Atletismo +2d20+10, Enganação +3d20+10, Intimidação +3d20+15, Ocultismo +2d20+15', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Facada, corpo a corpo x2)","teste":"2d20+15, crítico 19/x2","dano":"4d4+20 perfuração + 4d10 Sangue"},{"tipo":"Reação","nome":"Faca Predadora","descricao":"1x/rodada, acertando ataque, recupera 4d10 PV."},{"tipo":"Padrão","nome":"Armadura de Sangue Diabólica","descricao":"Abandona a forma (volta a ser Juan), não reusa até dormir; sem matar até o fim da cena, adormece sozinha."},{"tipo":"Padrão","nome":"Ritual Descansar Discente Diabólico (Sangue, círculo \"???\")","dano":"12d8 + hemorragia (Fortitude DT 25, 5d8/turno)","descricao":"Alcance curto."},{"tipo":"Padrão","nome":"Ritual Perturbação Discente Diabólica (Conhecimento, círculo \"???\")","descricao":"Alcance médio, mesmas ordens (Vontade DT 25), dano de Sofra sobe pra 5d8."},{"tipo":"Padrão","nome":"Ritual Vínculo de Sangue Diabólico (Sangue, círculo \"???\")","descricao":"Alcance médio, mesma mecânica (Fortitude DT 25)."},{"tipo":"Reação (Poder de Intenção)","nome":"Sucesso Automático","descricao":"Mesma regra."}]',
  119
);

-- Fauna Corrompida do Hexatombe (categoria mundana para as bases, paranormal pras corrompidas)

insert into creatures (source_id, categoria, tipo_criatura, name, vd, flavor_text, tamanho, percepcao, iniciativa, defesa, fortitude, reflexos, vontade, pv_maximo, pv_machucado, atributos, deslocamento, habilidades, acoes, sort_order)
values
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'mundana', 'Animal', 'Arara-Vermelha', 10,
  'Ave típica da fauna brasileira — base mundana, antes da corrupção por Sangue durante o ritual Hexatombe.',
  'Pequeno', '+2d20+5', '+2d20+5', 12, '+0', '+2d20+5', '+2d20', 8, 4,
  '{"agi":2,"for":1,"int":0,"pre":2,"vig":1}', '3m | 2, voo 9m | 6',
  '[{"nome":"E do Nada","descricao":"Voo rasante surpreende — na 1ª rodada de combate, todos que agem depois dela na iniciativa ficam desprevenidos contra ela."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Bicada, corpo a corpo)","teste":"2d20+5","dano":"1d6+2 perfuração"},{"tipo":"Padrão","nome":"Agredir (Arranhão, corpo a corpo x2)","teste":"2d20+5","dano":"1d4+2 corte"}]',
  120
),
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'mundana', 'Animal', 'Jaguatirica', 10,
  'Felino selvagem brasileiro — base mundana, antes da corrupção por Sangue durante o ritual Hexatombe.',
  'Pequeno', '+1d20+5', '+2d20+5', 13, '+0', '+2d20+5', '+0', 16, 8,
  '{"agi":2,"for":1,"int":0,"pre":1,"vig":1}', '12m | 8',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Mordida, corpo a corpo)","teste":"2d20+5","dano":"1d6+2 corte"},{"tipo":"Padrão","nome":"Agredir (Arranhar, corpo a corpo x2)","teste":"2d20+5","dano":"1d4+2 corte"},{"tipo":"Movimento","nome":"Pulo do Gato","dano":"+1d4 dano adicional se agredir no mesmo turno","descricao":"Pula até alvo em alcance curto; contra desprevenido, 1x/rodada como ação livre."}]',
  121
);

insert into creatures (source_id, categoria, name, vd, flavor_text, descritores, tamanho, presenca_dt, presenca_dano, presenca_nex_imune, percepcao, iniciativa, defesa, fortitude, reflexos, vontade, pv_maximo, pv_machucado, resistencias, vulnerabilidades, atributos, deslocamento, habilidades, acoes, sort_order)
values
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'paranormal', 'Arara-Devorada', 80,
  'Arara-vermelha tomada pelo Sangue — tamanho aumentado, garras nas asas, presas no bico, ossos rompendo a pele como estacas.',
  '{Sangue}', 'Médio', 20, '3d8 mental', 40, '+2d20+5', '+3d20+10', 21, '+2d20+5', '+3d20+10', '+2d20', 120, 60, 'Balístico, impacto e perfuração 5, Sangue 10', 'Morte',
  '{"agi":3,"for":2,"int":0,"pre":2,"vig":2}', '9m | 6, voo 12m | 8',
  '[{"nome":"E do Nada","descricao":"Mesma regra da arara-vermelha."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Bicada, corpo a corpo)","teste":"3d20+5","dano":"1d8+5 perfuração + 1d8 Sangue"},{"tipo":"Padrão","nome":"Agredir (Garras, corpo a corpo x2)","teste":"3d20+5","dano":"1d6+5 corte"},{"tipo":"Livre","nome":"Agarrão","teste":"3d20+7","descricao":"Acertando garras, tenta agarrar com braços extras."},{"tipo":"Completa","nome":"Penas Afiadas","descricao":"Rajada de penas-lâmina, raio 9m (Reflexos DT 20 evita); 1d6 define a cor: 1-2 vermelha (sangrando), 3-4 azul (lento até curar qualquer PV), 5-6 amarela (fraco até fim da cena ou remover veneno)."}]',
  122
),
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'paranormal', 'Arara-Infernal', 120,
  'Forma mais avançada/aterrorizante da arara-devorada — maior ainda, com bocarra abdominal capaz de mastigar presas agarradas.',
  '{Sangue}', 'Grande', 23, '4d6 mental', 50, '+2d20+5', '+4d20+10', 26, '+3d20+10', '+4d20+10', '+2d20+5', 220, 110, 'Balístico, impacto e perfuração 10, Sangue 20', 'Morte',
  '{"agi":4,"for":2,"int":0,"pre":2,"vig":3}', '12m | 8, voo 15m | 10',
  '[{"nome":"E do Nada","descricao":"Mesma regra."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Bicada, corpo a corpo)","teste":"4d20+10","dano":"1d10+10 perfuração + 1d10 Sangue"},{"tipo":"Padrão","nome":"Agredir (Garras, corpo a corpo x4)","teste":"4d20+10","dano":"1d8+10 corte"},{"tipo":"Livre","nome":"Agarrão","teste":"4d20+12","descricao":"Acertando garras, tenta agarrar."},{"tipo":"Movimento","nome":"Mastigar","dano":"6d10 Sangue (Fortitude DT 23 reduz à metade)","descricao":"Mastiga um agarrado com a bocarra abdominal; se isso deixar o alvo morrendo, é engolido por completo (morte) e a arara recupera 2d10 PV."},{"tipo":"Completa","nome":"Penas Afiadas","dano":"+2d6 PV além do efeito de cor","descricao":"Mesma mecânica, raio 9m (Reflexos DT 23 evita)."}]',
  123
),
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'paranormal', 'Felino-Devorado', 80,
  'Jaguatirica corrompida pelo Sangue — músculos dilatados com veias expostas, cauda com osso pontiagudo na ponta, duas bocas dentadas destruindo a face.',
  '{Sangue}', 'Médio', 20, '3d8 mental', 40, '+2d20+10', '+3d20+10', 23, '+2d20+5', '+3d20+10', '+2d20', 140, 70, 'Balístico, impacto e perfuração 5, Sangue 10', 'Morte',
  '{"agi":3,"for":2,"int":0,"pre":2,"vig":2}', '12m | 8',
  '[{"nome":"Camuflagem Perversa","descricao":"Sempre com camuflagem leve; 1x/cena, ignora efeitos de um acerto crítico contra ele (vira ataque comum); testes pra percebê-lo/rastreá-lo sofrem -1d20."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Mordidas, corpo a corpo x2)","teste":"3d20+10","dano":"1d8+5 corte + 1d8 Sangue"},{"tipo":"Padrão","nome":"Agredir (Garras, corpo a corpo x2)","teste":"3d20+10","dano":"1d6+5 corte"},{"tipo":"Movimento","nome":"Pulo do Felino","dano":"+1d8 dano adicional se agredir no mesmo turno","descricao":"Pula até alvo em alcance curto; contra desprevenido, 1x/rodada como ação livre."},{"tipo":"Padrão","nome":"Chicotada Perfurante","dano":"4d8 Sangue + caído + movido pra espaço desocupado em alcance curto à escolha da criatura (Reflexos DT 20 reduz o dano à metade e evita condição/movimento)","descricao":"Cauda perfura/puxa ser em alcance curto."}]',
  124
),
(
  (select id from sources where slug = 'arquivos_secretos_02'), 'paranormal', 'Felino-Infernal', 120,
  'Forma mais aterrorizante do felino-devorado — maior, cauda maior, as duas bocas se abrem como uma "flor diabólica" de ossos.',
  '{Sangue}', 'Grande', 23, '4d6 mental', 50, '+2d20+10', '+4d20+10', 28, '+3d20+10', '+4d20+10', '+2d20+5', 230, 125, 'Balístico, impacto e perfuração 10, Sangue 20', 'Morte',
  '{"agi":4,"for":2,"int":0,"pre":2,"vig":3}', '12m | 8',
  '[{"nome":"Camuflagem Perversa","descricao":"Mesma regra, mas penalidade pra percebê-lo/rastreá-lo sobe pra -2d20."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Mordidas, corpo a corpo x2)","teste":"4d20+10","dano":"2d8+5 corte + 2d8 Sangue"},{"tipo":"Padrão","nome":"Agredir (Garras, corpo a corpo x2)","teste":"4d20+10","dano":"2d6+5 corte"},{"tipo":"Movimento","nome":"Pulo do Felino","dano":"+2d8 dano adicional","descricao":"Mesma mecânica."},{"tipo":"Padrão","nome":"Boca da Loucura","dano":"4d6 Sangue + 4d6 mental (repete no início de cada turno da criatura enquanto agarrado)","descricao":"Envolve a cabeça de um adjacente com a própria cabeça dentada; Reflexos DT 23 evita; falhando, agarrado; soltar-se exige ação + Acrobacia/Atletismo/Luta DT 23; enquanto agarrando assim, não pode usar mordidas."},{"tipo":"Padrão","nome":"Chicotada Perfurante","dano":"6d8 Sangue + caído + sangrando + movido (Reflexos DT 23 reduz à metade e evita condições/movimento)","descricao":"Mesma mecânica."}]',
  125
);
