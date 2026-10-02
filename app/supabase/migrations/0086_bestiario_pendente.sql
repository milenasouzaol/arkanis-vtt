-- Bestiário que nunca entrou no banco (achado na revisão geral): a 0040 (colunas
-- categoria e tipo_criatura) não tinha rodado, e com ela falharam as fichas que dependem
-- dela. Este arquivo junta, na ordem, 0040, 0041 e 0043 a 0049 (a 0042, perigos, já está
-- no banco). Roda tudo ou nada: se der erro, nada é gravado. Não rodar duas vezes.

-- Suporte a ameaças mundanas (não-paranormais): agentes da lei, cultistas, animais.
-- Fichas mais simples — sem Presença Perturbadora nem elemento — mas reutilizam a
-- mesma tabela `creatures`. Precisamos apenas diferenciar categoria e tipo de criatura.

alter table creatures add column if not exists categoria text not null default 'paranormal'; -- 'paranormal' | 'mundana'
alter table creatures add column if not exists tipo_criatura text; -- 'Pessoa', 'Animal', 'Animal (Enxame)', etc.


-- ===================== 0041_bestiario_mundanas.sql =====================

-- Bestiário Livro Base — Ameaças da Realidade (Mundanas): Criminosos & Mercenários,
-- Cultistas, Policiais, Animais. Fichas sem Presença Perturbadora nem elemento.

insert into creatures (source_id, categoria, tipo_criatura, name, vd, flavor_text, tamanho, percepcao, iniciativa, defesa, fortitude, reflexos, vontade, pv_maximo, pv_machucado, resistencias, atributos, pericias, deslocamento, habilidades, acoes, sort_order)
values
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Pessoa', 'Bandido', 10,
  'Criminoso típico, como ladrão ou assaltante.',
  'Médio', '+0', '+5 (2d20)', 14, '+0', '+5 (2d20)', '+0', 8, 4, null,
  '{"agi":2,"for":2,"int":1,"pre":1,"vig":1}', 'Crime +5 (2d20), Furtividade +5 (2d20)', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Faca, corpo a corpo)","teste":"+5 (2d20)","dano":"1d4+2 perfuração"},{"tipo":"Livre","nome":"Ataque Furtivo","descricao":"1x/rodada, +1d6 dano corpo a corpo ou à distância curta contra desprevenido/flanqueado."}]',
  49
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Pessoa', 'Capanga', 20,
  'Pessoas embrutecidas que vivem pela violência — membros de gangue, executores da máfia, seguranças de boate.',
  'Médio', '+5', '+5', 13, '+5 (2d20)', '+5', '+0', 17, 8, null,
  '{"agi":1,"for":2,"int":1,"pre":1,"vig":2}', 'Intimidação +5', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Bastão, corpo a corpo)","teste":"+5 (2d20)","dano":"1d8+7 impacto"},{"tipo":"Padrão","nome":"Agredir (Revólver, distância, curto)","teste":"+5, crítico 19/x3","dano":"2d6+5 balístico"},{"tipo":"Livre","nome":"Ataque Furtivo","descricao":"1x/rodada, +2d6 dano corpo a corpo ou à distância curta contra desprevenido/flanqueado."}]',
  50
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Pessoa', 'Soldado de Aluguel', 40,
  'Combatente profissional que trabalha pra quem pagar mais.',
  'Médio', '+5', '+10 (2d20)', 18, '+5 (2d20)', '+5 (2d20)', '+0', 25, 12, null,
  '{"agi":2,"for":2,"int":1,"pre":1,"vig":2}', null, '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Machete, corpo a corpo)","teste":"+10 (2d20), crítico 19","dano":"1d6+9 corte"},{"tipo":"Padrão","nome":"Agredir (Fuzil de Assalto, distância, médio)","teste":"+10 (2d20), crítico 19/x3","dano":"2d8+9 balístico"},{"tipo":"Completa","nome":"Ataque em Movimento","descricao":"Percorre o deslocamento e ataca em qualquer ponto do movimento."}]',
  51
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Pessoa', 'Assassino', 80,
  'Matador habilidoso e furtivo que elimina alguém de forma discreta e eficiente.',
  'Médio', '+10 (3d20)', '+15 (4d20)', 26, '+5 (2d20)', '+10 (4d20)', '+10 (3d20)', 90, 45, null,
  '{"agi":4,"for":2,"int":3,"pre":3,"vig":2}', 'Crime +10 (4d20), Enganação +10 (3d20), Furtividade +10 (4d20)', '9m | 6',
  '[{"nome":"Evasão","descricao":"Teste de Reflexos pra reduzir dano à metade — se passar, não sofre dano algum."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Faca, corpo a corpo x2)","teste":"+17 (4d20), crítico 19","dano":"1d4+11 corte"},{"tipo":"Padrão","nome":"Agredir (Pistola, distância x2, curto)","teste":"+15 (4d20), crítico 16/x4","dano":"1d12+14 balístico"},{"tipo":"Livre","nome":"Ataque Furtivo","descricao":"1x/rodada, +4d6 dano corpo a corpo ou distância curta contra desprevenido/flanqueado."},{"tipo":"Livre","nome":"Mão na Boca","teste":"+15 (2d20)","descricao":"Ataque corpo a corpo furtivo contra desprevenido pode agarrar; agarrado não fala."},{"tipo":"Movimento","nome":"Assassinar","descricao":"Analisa um alvo em alcance curto; até o fim do próximo turno, o primeiro Ataque Furtivo que causar dano nele dobra os dados extras."}]',
  52
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Pessoa', 'Comandante Mercenário', 120,
  'Endurecido por anos de conflito — oficial competente e combatente perigoso por si só.',
  'Médio', '+10 (2d20)', '+15 (3d20)', 29, '+10 (3d20)', '+10 (3d20)', '+5 (2d20)', 145, 72, 'Balístico, corte, impacto e perfuração 5',
  '{"agi":3,"for":3,"int":2,"pre":2,"vig":3}', 'Intimidação +10 (2d20), Tática +10 (2d20)', '6m | 4',
  '[{"nome":"Sadismo","descricao":"Ao causar dano, o próximo ataque recebe +1d20 e, se acertar, +1 dado de dano do mesmo tipo."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Machete, corpo a corpo x2)","teste":"+17 (3d20), crítico 19","dano":"1d6+15 corte"},{"tipo":"Padrão","nome":"Agredir (Metralhadora, distância x2, médio)","teste":"+17 (2d20), crítico 19/x3","dano":"3d12+15 balístico"},{"tipo":"Completa","nome":"Ataque em Movimento","descricao":"Percorre o deslocamento e ataca (os dois ataques corpo a corpo ou à distância) em qualquer ponto."},{"tipo":"Movimento","nome":"Ordens","descricao":"Aliados em alcance médio recebem +1d20 em perícias e +1 dado de dano até o fim da cena."}]',
  53
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Pessoa', 'Iniciado', 20,
  'No começo do caminho da adoração, já capaz de conjurar rituais — pode ser perigoso pra agentes inexperientes.',
  'Médio', '+5 (2d20)', '+0', 16, '+0', '+0', '+5 (2d20)', 15, 7, null,
  '{"agi":1,"for":1,"int":2,"pre":2,"vig":1}', 'Enganação +5 (2d20), Ocultismo +5 (2d20)', '9m | 6',
  '[{"nome":"Conjurador","descricao":"2 rituais de 1º círculo de um elemento, conjuráveis sem pagar PE (limite 3 PE por conjuração); DT pra resistir 15."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Faca, corpo a corpo)","teste":"+0, crítico 19","dano":"1d4+1 corte"}]',
  54
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Pessoa', 'Investido', 40,
  'Comprometido com as Entidades após ritos de admissão — um perigo real pra Realidade.',
  'Médio', '+5 (2d20)', '+5 (2d20)', 17, '+0', '+0 (2d20)', '+5 (2d20)', 35, 17, null,
  '{"agi":2,"for":1,"int":2,"pre":2,"vig":1}', 'Enganação +10 (2d20), Ocultismo +10 (2d20)', '9m | 6',
  '[{"nome":"Conjurador","descricao":"2 rituais de 1º e 2 de 2º círculo de até dois elementos, sem pagar PE (limite 5 PE por conjuração); DT 17."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Faca, corpo a corpo)","teste":"+5 (2d20), crítico 19","dano":"1d4+1 corte"},{"tipo":"Padrão","nome":"Agredir (Revólver, distância, curto)","teste":"+0, crítico 19/x3","dano":"2d6 balístico"}]',
  55
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Pessoa', 'Líder de Culto', 140,
  'Experiente, capaz de rituais mais poderosos — mantém disfarce de bom cidadão; pode ser qualquer um, até alguém próximo dos agentes.',
  'Médio', '+10 (3d20)', '+10 (2d20)', 27, '+10 (2d20)', '+5 (2d20)', '+15 (3d20)', 150, 75, null,
  '{"agi":2,"for":1,"int":3,"pre":3,"vig":2}', 'Enganação +15 (3d20), Ocultismo +15 (3d20)', '9m | 6',
  '[{"nome":"Conjurador","descricao":"2 rituais de 1º, 2 de 2º e 2 de 3º círculo de até dois elementos, sem pagar PE (limite 10 PE por conjuração); DT 25."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Faca, corpo a corpo)","teste":"+10 (2d20), crítico 19","dano":"1d4+1 corte"},{"tipo":"Padrão","nome":"Agredir (Revólver, distância, curto)","teste":"+5 (2d20), crítico 19/x3","dano":"2d6 balístico"}]',
  56
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Pessoa', 'Policial', 20,
  'Padrão, patrulhando ruas e praças; provavelmente nunca teve contato com o paranormal. Ficha também serve pra vigias, seguranças corporativos, pessoas com treinamento básico em armas.',
  'Médio', '+5', '+5 (2d20)', 19, '+5 (2d20)', '+5 (2d20)', '+0', 15, 7, null,
  '{"agi":2,"for":2,"int":1,"pre":1,"vig":2}', null, '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Bastão, corpo a corpo)","teste":"+5 (2d20)","dano":"1d8+7 impacto"},{"tipo":"Padrão","nome":"Agredir (Pistola, distância, curto)","teste":"+5 (2d20), crítico 18","dano":"1d12+5 balístico"}]',
  57
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Pessoa', 'Policial de Elite', 60,
  'Treinados e equipados pra situações extremas — os primeiros a chegar quando uma investigação discreta vira confronto armado.',
  'Médio', '+10', '+15 (3d20)', 27, '+10 (3d20)', '+10 (3d20)', '+10 (1d20)', 40, 20, 'Balístico, corte, impacto e perfuração 5',
  '{"agi":3,"for":3,"int":1,"pre":1,"vig":3}', null, '6m | 4',
  '[{"nome":"Fortificação","descricao":"50% de chance de ignorar dano adicional de crítico/furtivo."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Bastão, corpo a corpo x2)","teste":"+10 (3d20)","dano":"1d8+13 impacto"},{"tipo":"Padrão","nome":"Agredir (Fuzil de Assalto, distância, médio)","teste":"+10 (3d20), crítico 17/x3","dano":"2d8+13 balístico"},{"tipo":"Padrão","nome":"Lança-Granadas","dano":"8d6 impacto (Reflexos DT 19 reduz à metade)","descricao":"1x/cena, granada em alcance médio; 6m do impacto."},{"tipo":"Completa","nome":"Empurrar e Atirar","descricao":"Empurra adjacente 3m (Fortitude DT 19 evita), depois atira com o fuzil; se empurrou, +1d20 e +2d8 dano nesse ataque."}]',
  58
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Pessoa', 'Chefe de Polícia', 100,
  'Delegado ou coronel que já passou por situações difíceis e não se intimida fácil.',
  'Médio', '+15 (3d20)', '+10 (2d20)', 25, '+10 (3d20)', '+10 (2d20)', '+15 (3d20)', 105, 52, null,
  '{"agi":2,"for":3,"int":2,"pre":3,"vig":3}', null, '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Bastão, corpo a corpo x2)","teste":"+15 (3d20)","dano":"1d8+8 impacto"},{"tipo":"Padrão","nome":"Agredir (Espingarda, distância x2, curto)","teste":"+17 (2d20), crítico x3","dano":"4d6+12 balístico"},{"tipo":"Reação","nome":"Teimoso","descricao":"1x/cena, ignora um efeito que exija teste de resistência, ou reduz um dano recém sofrido à metade."}]',
  59
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Animal', 'Cão de Guarda', 10,
  'Treinado pra guarda — atrapalha grupos que precisam ser furtivos. Também serve pra cães policiais ou lobos.',
  'Médio', '+10 (Faro, Visão na Penumbra)', '+5 (2d20)', 14, '+5 (2d20)', '+5 (2d20)', '+0', 12, 6, null,
  '{"agi":2,"for":2,"int":0,"pre":1,"vig":2}', 'Sobrevivência +10', '12m | 8',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Mordida, corpo a corpo)","teste":"+5 (2d20)","dano":"1d6+2 corte"},{"tipo":"Livre","nome":"Derrubar","teste":"+5 (2d20)","descricao":"Ao acertar mordida, manobra de derrubar."}]',
  60
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Animal (Enxame)', 'Enxame de Abelhas', 10,
  'Normalmente pacíficas, mas agressivas se a colmeia é ameaçada — comuns em zonas rurais.',
  'Médio', '+5 (Visão na Penumbra)', '+5', 15, '-2d20', '+5', '+0', 10, 5, null,
  '{"agi":1,"for":0,"int":0,"pre":1,"vig":0}', null, '3m | 2, voo 9m | 6',
  '[{"nome":"Enxame","descricao":"Entra no espaço de outro ser; no fim do turno, 2d6 dano de perfuração automático a quem estiver no espaço; imune a manobras/efeitos de alvo único sem dano; metade do dano de armas; +50% dano de área."},{"nome":"Zumbido Nauseante","descricao":"Quem sofre dano do enxame fica enjoado 1 rodada (Fortitude DT 15 evita)."}]',
  '[]',
  61
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Animal (Enxame)', 'Enxame de Ratos', 10,
  'Encontrados quase em todo lugar habitado por humanos; normalmente tímidos, se unem em enxame por fome ou energias paranormais.',
  'Médio', '+5 (Faro, Visão na Penumbra)', '+5', 13, '+5', '+5', '+0', 15, 7, null,
  '{"agi":1,"for":0,"int":0,"pre":1,"vig":1}', null, '9m | 6, escalar/nadar 6m | 4',
  '[{"nome":"Enxame","descricao":"Entra no espaço de outro ser; no fim do turno, 2d6 dano de perfuração automático a quem estiver no espaço; imune a manobras/efeitos de alvo único sem dano; metade do dano de armas; +50% dano de área."},{"nome":"Doença","descricao":"Quem sofre dano contrai febre hemorrágica (Fortitude DT 15 evita)."}]',
  '[]',
  62
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Animal', 'Jacaré', 40,
  'Várias espécies existem, algumas até em áreas urbanas — ficha representa um espécime grande, perigoso pra agentes. (Versão simplificada; ver "Jacaré (completo)" para a ficha com ações.)',
  'Grande', '+5 (Visão na Penumbra)', '+5', 16, '+5 (2d20)', '+5', '+0', 40, 20, null,
  '{"agi":1,"for":3,"int":0,"pre":1,"vig":2}', 'Furtividade +8', null,
  '[]',
  '[]',
  63
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Animal', 'Jacaré (completo)', 40,
  'Várias espécies existem, algumas até em áreas urbanas — ficha representa um espécime grande, perigoso pra agentes.',
  'Grande', '+10 (Faro, Visão na Penumbra)', '+10 (3d20)', 16, '+5 (2d20)', '+5 (3d20)', '+5', 55, 27, null,
  '{"agi":3,"for":3,"int":0,"pre":1,"vig":2}', 'Furtividade +13 (3d20)', '6m | 4, nadar 9m | 6',
  '[{"nome":"Giro da Morte","descricao":"Agarrando um ser na água, repetir a manobra de agarrar causa +2d8 dano."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Mordida, corpo a corpo)","teste":"+5 (3d20)","dano":"1d8+8 corte"},{"tipo":"Padrão","nome":"Agredir (Cauda, corpo a corpo)","teste":"+5 (3d20)","dano":"1d12 impacto"},{"tipo":"Livre","nome":"Agarrão","teste":"+7 (3d20)","descricao":"Ao acertar mordida num alvo Médio ou menor, tenta agarrar."}]',
  64
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Animal', 'Javaporco', 20,
  'Cruzamento de javali com porco doméstico, virou praga em regiões rurais — voraz e agressivo.',
  'Médio', '+5 (Faro, Visão na Penumbra)', '+5', 14, '+5 (3d20)', '+5', '+0', 35, 17, null,
  '{"agi":1,"for":2,"int":0,"pre":1,"vig":3}', null, '12m | 8',
  '[{"nome":"Ferocidade","descricao":"Ao sofrer dano, +1d20 em ataques e +1 dado de dano em todas as rolagens até o fim da cena."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Mordida, corpo a corpo)","teste":"+5 (2d20)","dano":"1d8+4 corte"},{"tipo":"Reação","nome":"Mordida Final","descricao":"Ao ser reduzido a 0 PV, ataca de mordida um oponente aleatório ao alcance antes de morrer."}]',
  65
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Animal', 'Onça-Pintada', 40,
  'O maior felino das Américas, principal predador das selvas brasileiras — raramente fora de seu território, mas mortal pra agentes embrenhados nele.',
  'Grande', '+10 (Faro, Visão na Penumbra)', '+10 (3d20)', 16, '+5 (2d20)', '+5 (3d20)', '+5', 55, 27, null,
  '{"agi":3,"for":3,"int":0,"pre":1,"vig":2}', 'Furtividade +13 (3d20)', '12m | 8, escalar/nadar 6m | 4',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Mordida, corpo a corpo)","teste":"+10 (3d20)","dano":"1d8+5 corte"},{"tipo":"Padrão","nome":"Agredir (Garras, corpo a corpo x2)","teste":"+10 (3d20), crítico 19","dano":"1d6+5 corte"},{"tipo":"Livre","nome":"Agarrão","teste":"+7 (3d20)","descricao":"Ao acertar mordida num alvo Médio ou menor, tenta agarrar."},{"tipo":"Completa","nome":"Bote","descricao":"Investida + ataca com mordida e garras no mesmo alvo (todos com +1d20 da investida)."}]',
  66
),
(
  (select id from sources where slug = 'ordem_paranormal'), 'mundana', 'Animal', 'Sucuri', 40,
  'Grande cobra constritora das selvas amazônicas — encontrada com colecionadores de animais exóticos ou como mascote perigoso de cultistas excêntricos.',
  'Grande', '+5 (Faro, Visão na Penumbra)', '+5 (2d20)', 16, '+5 (3d20)', '+5 (2d20)', '+0', 68, 34, null,
  '{"agi":2,"for":3,"int":0,"pre":1,"vig":3}', 'Furtividade +8 (2d20)', '6m | 4, escalar/nadar 9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Mordida, corpo a corpo)","teste":"+10 (3d20)","dano":"1d6+8 corte"},{"tipo":"Livre","nome":"Agarrão","teste":"+12 (3d20)","descricao":"Ao acertar mordida num alvo Médio ou menor, tenta agarrar."},{"tipo":"Livre","nome":"Constrição","descricao":"No início de cada turno, 2d6+8 dano de impacto em quem estiver agarrando."}]',
  67
);


-- ===================== 0043_bestiario_sh_paranormais.sql =====================

-- Bestiário Sobrevivendo ao Horror — 12 criaturas paranormais (Cap. 3).
-- Notação de bônus deste livro usa "N1d20+K" (N reservas de esforço + K bônus fixo);
-- mantida como texto nos campos de teste/perícia/defesas pra não perder informação.

insert into creatures (source_id, name, vd, flavor_text, descritores, tamanho, presenca_dt, presenca_dano, presenca_nex_imune, percepcao, iniciativa, defesa, fortitude, reflexos, vontade, pv_maximo, pv_machucado, resistencias, vulnerabilidades, atributos, pericias, deslocamento, habilidades, acoes, enigma_medo, sort_order)
values
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'Sepultado', 20,
  'Caixão/sarcófago amaldiçoado que emite batidas rítmicas de dentro de sepulturas — o som de alguém enterrado vivo eternamente tentando escapar. Membros ósseos deformados (de um ou vários corpos fundidos na maldição) escapam pelas rachaduras. Pode passar despercebido como mobília num cemitério/mausoléu.',
  '{Morte}', 'Médio', 15, '2d4 mental', 25, '+0 (Percepção às Cegas)', '+0', 16, '3d20+5', '+0', '+0', 50, 25, 'Balístico, corte, impacto e perfuração 5, Morte 10', 'Energia',
  '{"agi":1,"for":3,"int":0,"pre":1,"vig":3}', 'Furtividade +1d20+10', '9m | 6 · Escalada 9m | 6',
  '[{"nome":"Membros Longos","descricao":"Alcance natural 3m (apesar de Médio)."},{"nome":"Parte do Cenário","descricao":"Em forma de caixão, +10 Furtividade (quase indistinguível de mobília); treinado em Ocultismo procurando ativamente ameaças pode notar com teste DT 20 como reação."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Dedos Ósseos, corpo a corpo x3)","teste":"3d20+5","dano":"1d6+5 corte"},{"tipo":"Livre","nome":"Agarrão","teste":"3d20+5","descricao":"Ao acertar dedos ósseos, tenta agarrar."},{"tipo":"Padrão","nome":"Bater Desesperado","descricao":"Som ouvido a até 90m; a até 9m, todos (pessoas/animais) ficam atordoados 1 rodada (Vontade DT 14 reduz pra abalado 1 rodada); quem passa fica imune até o fim da cena."},{"tipo":"Completa","nome":"Tragar","dano":"2d4 dano mental ao ser tragado e no início de cada turno preso (Vontade DT 14 reduz à metade)","descricao":"Se agarrando ser Médio ou menor, puxa pra dentro do caixão e fecha; agarrado + imóvel; só liberta destruindo o Sepultado; só traga 1 por vez."}]',
  null, 68
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'Mescla', 60,
  'Fusão grotesca entre pessoa e inseto — alguém que se expôs deliberadamente a vermes/larvas/parasitas buscando uma "revelação natural" do que é ser humano. Membros longos terminados em garras, pele mesclada entre carapaça de inseto e carne exposta, olhos substituídos por buracos com larvas; cheiro insuportável. Vista às vezes como silhueta voadora (asas de mosca gigante) ou como centopeia alongada. Intenção: proliferar e consumir.',
  '{Sangue}', 'Grande', 20, '3d6 mental', 35, '1d20+5 (Faro, Percepção às Cegas alcance longo)', '3d20+10', 21, '2d20+5', '3d20+10', '1d20+5', 100, 50, 'Balístico, corte, perfuração 10, Sangue 20', 'Morte, fogo e frio',
  '{"agi":3,"for":3,"int":1,"pre":1,"vig":2}', 'Acrobacia +3d20+10, Atletismo +3d20+10, Furtividade +3d20+8', '12m | 8 · Escalada 12m | 8 · Voo 9m | 6',
  '[{"nome":"Fluidos Repugnantes","descricao":"Dano corpo a corpo/curto nela, ou sofrer dano de Sangue dela, causa enjoado 1 rodada (Fortitude DT 20 evita)."},{"nome":"Percepção Multifacetada","descricao":"Não pode ser flanqueada nem surpreendida."},{"nome":"Imunidades","descricao":"Químico."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Garras, corpo a corpo x2)","teste":"3d20+10","dano":"2d6+5 corte"},{"tipo":"Padrão","nome":"Agredir (Cuspe Ácido, distância, curto)","teste":"3d20+10","dano":"3d12 Sangue"},{"tipo":"Livre","nome":"Vomitar Ácido","dano":"+1d12 Sangue","descricao":"Acertando os 2 ataques de garra na mesma ação num alvo."},{"tipo":"Reação","nome":"Agarrão","teste":"3d20+12","descricao":"Acertando os 2 ataques de garra na mesma ação, tenta agarrar."},{"tipo":"Completa","nome":"Camuflagem Sobrenatural","descricao":"Não sendo vista por ninguém, fica imóvel + camuflagem total, +10 Furtividade."},{"tipo":"Completa","nome":"Incubar Ovos","teste":"3d20+10","descricao":"Agarrando um ser, ferrão oculto na língua; acertando, incuba 1d4 ovos (Fortitude DT 5+5 por ovo evita); incubado sofre versão modificada de Sangue Quente com Estágio IV — ao alcançar, nasce uma nova Mescla de dentro da vítima, matando-a."},{"tipo":"Completa","nome":"Investida Insectoide","descricao":"De local acima de um alvo em alcance médio, salta e aterrissa adjacente; conta como investida, mas ataca com as 2 garras (ambas com bônus de investida)."}]',
  null, 69
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'Espectro Inesquecido', null,
  'TEMPLATE, não uma criatura fixa — ecos das memórias da Realidade que vazam através da Membrana fragilizada; não são almas ou fantasmas de verdade, só repetições distorcidas. Toda história envolve os "Marcados" (NPCs específicos escolhidos misteriosamente pelo Outro Lado). Quando um Marcado sem destino predeterminado morre, pode gerar um Espectro Inesquecido: versão translúcida/espectral/distorcida dele, existindo e não existindo ao mesmo tempo, até que seu passado seja descoberto por outro Marcado com a mesma Marca.

Aplicado sobre a ficha do NPC "Marcado" original, usando o NEX dele: vira criatura de Energia; VD = 4 × NEX do Marcado; tamanho inalterado. Ganha Presença Perturbadora (DT e dano mental conforme faixa de VD — tabela abaixo); seres com NEX 20+ acima do NEX original do Marcado são imunes. Sentidos: +5 Iniciativa e Percepção, Percepção às Cegas, Visão no Escuro. Defesa/Fortitude/Reflexos/Vontade: bônus da tabela + 1d20+5. PV = PV do Marcado × multiplicador da tabela; resistência a balístico/corte/impacto/perfuração/Conhecimento/Morte = valor da tabela; resistência a Energia = esse valor +10; vulnerabilidade a Conhecimento. Atributos e Perícias iguais ao Marcado (Furtividade sobe 1 grau: treinado→veterano; veterano já expert vira +5). Deslocamento/Habilidades/Ações/Ataques iguais ao Marcado (NEX original usado pra qualquer efeito baseado em NEX); ataques recebem +1d20+5 no teste e o bônus de dano da tabela; todo dano vira dano de Energia. PE = PE do Marcado; não tem Sanidade. Ação Completa universal "Aterrorizar": pessoas/animais em alcance curto sofrem dano mental da tabela (Vontade da tabela reduz à metade).

Tabela 3.1 (VD → DT/Dano mental/Defesa+Resist./Multiplicador PV/Dano extra): 20-40 → 15 / 2d8 / +2 / x2 / +5. 60-100 → 20 / 3d8 / +5 / x3 / +10. 120-160 → 25 / 4d8 / +10 / x4 / +20. 180-300 → 35 / 6d8 / +15 / x5 / +30. 320-400 → 40 / 8d8 / +20 / x6 / +40.

Exemplo de aplicação (Marcado NEX 55% → Espectro VD 220): Marcado original Pessoa Médio, Percepção +2d20, Defesa 12, PV 68/34, PE 66, Sanidade 56, AGI2/FOR1/INT3/PRE3/VIG2, perícias Ciências/Medicina/Intuição, poderes Balística Avançada/Conhecimento Aplicado/Eclético/Investigação Científica/Na Trilha Certa/Pensamento Ágil/Perito/Equipe de Trauma/Paramédico, armado com faca e pistola sinalizadora. Espectro: VD 220, Energia (descritores adicionais Conhecimento, Morte), Criatura Médio, Presença Perturbadora DT 35/6d8 mental/NEX 75%+ imune, Percepção 3d20+15, Iniciativa 3d20+5, Percepção às Cegas, Visão no Escuro, Defesa 27, Fortitude 3d20+5, Reflexos 3d20+15, Vontade 4d20+15, PV 340/170, Resistências balístico/corte/impacto/perfuração/Conhecimento/Morte 15 e Energia 25, Vulnerabilidade Conhecimento, mesmos atributos/perícias (Furtividade +1 grau), mesmos poderes, ataques "Lâmina Espectral" (corpo a corpo, Teste 2d20+10 crítico 19, Dano 1d4+31 Energia) e "Pistola Sinalizadora Espectral" (distância curto, Teste 3d20+15, Dano 2d6+32 Energia), Aterrorizar 2d8 dano mental alcance curto (Vontade DT 15 reduz à metade).',
  '{Energia}', null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  '{}', null, null,
  '[{"nome":"Ver flavor_text","descricao":"Template completo (fórmulas por faixa de VD, exemplo de aplicação) documentado no flavor_text — não tem stat block fixo."}]',
  '[]',
  'Cada Espectro Inesquecido surge de uma morte específica e imprevisível de um Marcado — as condições pra dissipá-lo são únicas por manifestação, ligadas à personalidade/escolhas/ações da pessoa em vida (distorcidas pelo Outro Lado). Não há regra fixa; o mestre define caso a caso.', 70
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'Derretido', 80,
  'Massa amorfa de carne gelatinosa, órgãos e restos mortais cozinhando num ácido borbulhante — absorve, derrete e expande sem forma fixa nem empatia. Consegue assumir silhuetas temporárias do que já absorveu. Move-se por frestas e encanamentos, surpreendendo vítimas.',
  '{Sangue,Energia}', 'Enorme', 20, '4d6 mental', 40, '1d20+5 (Percepção às Cegas)', '1d20+5', 23, '4d20+10', '1d20+5', '1d20+5', 140, 70, 'Sangue 20', 'Morte, fogo e químico',
  '{"agi":1,"for":4,"int":0,"pre":1,"vig":4}', 'Enganação +1d20, Furtividade +1d20', '9m | 6 · Escalada 9m | 6',
  '[{"nome":"Amorfo","descricao":"Atravessa qualquer fresta por onde água passaria (fica lento enquanto espreme); não é restringido por obstáculos físicos."},{"nome":"Liberdade de Espaço","descricao":"Invade quadrados ocupados por outras criaturas; criaturas passam pelo espaço dele mas é terreno difícil."},{"nome":"Matéria Nociva","descricao":"Quem entra ou começa turno na área dele sofre 6d6 dano de Sangue + lento e enjoado 1 rodada (Fortitude DT 20 reduz à metade e evita a condição), 1x/rodada por criatura."},{"nome":"Imunidades","descricao":"Balístico, corte, impacto e perfuração."}]',
  '[{"tipo":"Padrão","nome":"Arrastar Repulsivo","dano":"4d6 Sangue + caído","descricao":"Até o próximo turno, ao se mover, arrasta seres/objetos da área à escolha (Atletismo DT 20 evita)."},{"tipo":"Padrão","nome":"Rastro Corrosivo","dano":"1d6 ácido (1x/rodada por criatura)","descricao":"Até o próximo turno, deixa rastro ácido (terreno difícil) por onde passa; quem entra/começa turno na área sofre o dano."},{"tipo":"Padrão","nome":"Simular Corpo","descricao":"Molda silhueta de pessoa/animal/objeto; em penumbra/escuridão, +10 Furtividade pra esconder e Enganação pra disfarce."},{"tipo":"Completa","nome":"Consumir","descricao":"Consome ser em sua área, inconsciente com 0 PV; recupera 20 PV e dissolve a vítima por completo."},{"tipo":"Completa","nome":"Deslizar Nojento","descricao":"Fora de espaço apertado, percorre o triplo do deslocamento."}]',
  null, 71
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'O Uivar', 100,
  'Anomalia climática paranormal mais que uma criatura convencional — nevasca incontrolável que transforma vítimas em esculturas de gelo disformes, roubando seu calor e "essência". Presença sentida pelo vazio (invisível), silhueta desenhada pela distorção da neve ao redor; som como dezenas de gritos misturados ao vento.',
  '{Energia}', 'Médio', 20, '4d6 mental', 45, '3d20+10 (Percepção às Cegas)', '3d20+10', 20, '1d20+5', '3d20+10', '3d20+10', 100, 50, null, null,
  '{"agi":3,"for":null,"int":3,"pre":3,"vig":1}', null, 'Voo 12m | 8',
  '[{"nome":"Alterações Climáticas","descricao":"Altera o clima num raio de 90m ao redor (frio extremo, neblina, neve, vento forte)."},{"nome":"Vibrações Térmicas","descricao":"Invisível e incorpóreo, sons só como assovio de vento."},{"nome":"Imunidades","descricao":"Dano."}]',
  '[{"tipo":"Movimento","nome":"Granizo Perfurante","dano":"+2d8 perfuração (Reflexos DT 20 reduz à metade)","descricao":"Gera granizo; usando Congelar na mesma rodada, todos sem cobertura na área sofrem o dano; coberturas frágeis são destruídas."},{"tipo":"Padrão","nome":"Congelar","dano":"2d8 frio (Fortitude DT 20 reduz à metade)","descricao":"Raio 90m, todos sofrem o dano; afeta o cenário (nuvens escurecem, gelo cobre objetos = -1d20 em testes de manipular itens, gera granizo/chuva/vendaval); dura até o fim da cena ou missão."},{"tipo":"Padrão","nome":"Beijo Gélido","dano":"6d6 Energia + lenta (Fortitude DT 20 reduz à metade)","descricao":"Corpo a corpo, suga temperatura; reduzir a 0 PV (ou já estar em 0) transforma em \"estátua de gelo\" — petrificado até destruir a camada (20 PV, RD 20/fogo); não recupera PV mas não morre enquanto congelado; dano não-fogo na estátua também fere quem está dentro; Uivar recupera 20 PV ao petrificar; destruir a estátua tira 10 PV do Uivar, e se o congelado morrer, quem o matou sofre 6d6 dano mental (Vontade DT 20 reduz à metade)."}]',
  null, 72
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'Melancolia', 140,
  'Parasita invisível e incorpóreo que escala uma pessoa sem ser sentido, infectando-a com uma depressão paranormal progressiva. Cresce devagar como uma infecção, incapacitando a vítima até deformar seu rosto numa expressão permanente de tristeza exagerada. Sua presença é percebida por marcas na pele parecidas com tatuagens que se espalham quanto mais consome. Ao esgotar o hospedeiro, migra pra outro.',
  '{Conhecimento,Sangue,Morte}', 'Minúsculo (cresce)', 25, '4d8 mental', 50, '3d20+5 (Visão no Escuro)', '4d20+5', 29, '1d20+5', '4d20+5', '3d20+5', 200, 100, null, null,
  '{"agi":4,"for":null,"int":4,"pre":3,"vig":1}', 'Furtividade +4d20+5', '9m | 6',
  '[{"nome":"Parasita Invisível","descricao":"Invisível e incorpóreo; escala sem ser sentido; infectar exige a vítima passar em Vontade DT 25 no momento da tentativa (passando, nem percebe que foi alvo)."},{"nome":"Imunidades","descricao":"Dano."},{"nome":"Parasitose Melancólica","descricao":"Segue regras de doença (contaminação por contato, Vontade DT crescente por estágio). Estágio I (Medo, DT 25, parasita Minúsculo): fica abalado permanentemente (mesmo imune a medo). Estágio II (Sangue, DT 30, Pequeno): alquebrado e frustrado (mesmo imune a efeitos mentais). Estágio III (Morte, DT 35, Médio): esmorecido (mesmo imune a efeitos mentais). Estágio IV (Conhecimento, DT 40, Grande): todas as ações da vítima devem visar tirar a própria vida. Recuperar-se: 1 dia por estágio regredido (Estágio IV = 4 dias); curada, o parasita abandona e procura outra vítima. Parasitas Poderosos: já consumiu outros hospedeiros — DT do Estágio I equivale à dificuldade do tamanho do parasita (até Grande, DT 40)."}]',
  '[]',
  'A vítima precisa perceber o parasita primeiro (evento narrativo, ou falhar por 5 ou menos no teste de Vontade). Outros podem notar com Intuição/Medicina/Ocultismo/Profissão (psicólogo) na DT atual de resistência. Ajuda em forma de pequenos rituais (Ocultismo, mesma DT) reduz a DT de resistência em -5 por vez bem-sucedida. DT chegando a 0: Melancolia perde invisibilidade/incorporeidade/imunidade a dano, fica vulnerável a todo dano não-paranormal, e tenta fugir ou infectar outra vítima.', 73
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'Quibungo', 160,
  'Lenda do oeste africano que cresceu no folclore nordestino brasileiro, distorcida pelo Sangue. Criatura bestial peluda de mais de 3m, quatro braços, boca frontal com múltiplas mandíbulas para triturar, e uma bocarra enorme que se abre por todo o dorso pra engolir vítimas vivas — que podem levar dias sendo digeridas lentamente. Sem lógica por trás da crueldade; só devora.',
  '{Sangue}', 'Grande', 25, '4d8 mental', 55, '3d20+10 (Faro, Visão no Escuro)', '4d20+10', 34, '4d20+10', '4d20+10', '3d20+5', 320, 160, 'Balístico, impacto, perfuração e Sangue 20', 'Morte',
  '{"agi":4,"for":4,"int":1,"pre":3,"vig":4}', 'Atletismo +4d20+10, Furtividade +4d20+8, Sobrevivência +1d20+20', '15m | 10 · Escalada 15m | 10 · Natação 15m | 10',
  '[{"nome":"Besta da Mata","descricao":"Em mata fechada, +10 Furtividade e camuflagem total além de 9m."},{"nome":"Regeneração Acelerada","descricao":"Cura Acelerada 10/Morte."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Garras, corpo a corpo x4)","teste":"4d20+20","dano":"2d6+10 corte"},{"tipo":"Padrão","nome":"Agredir (Mordida, corpo a corpo)","teste":"4d20+20","dano":"3d12+10 perfuração"},{"tipo":"Reação","nome":"Agarrão","teste":"4d20+22","descricao":"Ao acertar garras, tenta agarrar."},{"tipo":"Livre","nome":"Dilacerar","dano":"+1d12+10 perfuração","descricao":"1x/rodada, acertando 2 garras no mesmo alvo."},{"tipo":"Reação","nome":"Instintos Bestiais","descricao":"1x/rodada, esquiva completamente de ataque à distância ou efeito de área."},{"tipo":"Completa","nome":"Bocarra Torturadora","dano":"1d12+10 Sangue no início de cada turno do Quibungo","descricao":"Coloca um agarrado na bocarra dorsal — continua agarrado, tem cobertura mútua com o exterior; escapa vencendo teste de agarrar/Acrobacia ou causando 25+ dano ao Quibungo (aí fica caído adjacente); só mantém 1 por vez; se reduzido a 0 PV lá dentro, não morre nem fica inconsciente, só grita, até o Quibungo gastar ação completa pra engolir e matar (recupera 25 PV); outros podem libertar vencendo teste de agarrar (falhando, sofrem 1d12+10 perfuração); libertado com 0 PV fica inconsciente e morrendo normalmente; testemunhas de alguém mantido com 0 PV na bocarra sofrem 4d8 dano mental por turno (Vontade DT 25 reduz à metade)."},{"tipo":"Completa","nome":"Investida Brutal","descricao":"Percorre o dobro do deslocamento (mesmo não em linha reta) até o alvo; conta como investida (+1d20 ataques, -5 Defesa até o próximo turno); ao final, 2 ataques de garra."}]',
  null, 74
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'Profundo', 200,
  'Habita as profundezas oceânicas abissais — mergulhadores desaparecidos frequentemente o confundem com uma lula rara (Magnapinna) antes de perceber que são a presa. Pele esverdeada transparente/gelatinosa, corpo humanoide alongado de ~2m com "cabeça de lula" sem rosto, tentáculos finíssimos de até 8m. Sistema nervoso bioluminescente vermelho visível através da pele, que se intensifica antes de atacar, quando o corpo se abre revelando fileiras de dentes pontiagudos. Dilacera e dissolve vítimas rapidamente, deixando só uma mancha vermelha no abismo.',
  '{Energia,Sangue}', 'Enorme', 30, '6d6 mental', 65, '2d20+10 (Percepção às Cegas, Visão no Escuro)', '4d20+15', 34, '2d20+10', '4d20+15', '2d20+10', 380, 190, 'Balístico, corte, impacto, perfuração, Energia e Sangue 20', 'Conhecimento',
  '{"agi":4,"for":4,"int":2,"pre":2,"vig":2}', 'Furtividade +4d20+10', '6m | 4 · Natação 15m | 10',
  '[{"nome":"Camuflagem Submersa","descricao":"Submerso, camuflagem contra seres a 1,5m e total além disso, +10 Furtividade."},{"nome":"Regeneração Acelerada","descricao":"Cura Acelerada 20/Morte e fogo."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Mordida, corpo a corpo)","teste":"4d20+25","dano":"4d10+20 perfuração"},{"tipo":"Padrão","nome":"Agredir (Tentáculos, corpo a corpo x6, máx. 2 no mesmo alvo por ação)","teste":"4d20+25","dano":"2d10+10 impacto"},{"tipo":"Reação","nome":"Agarrão","teste":"4d20+30","descricao":"Ao acertar tentáculo, tenta agarrar; só 1 agarrado por vez, mas não perde os ataques de tentáculo ao fazer isso."},{"tipo":"Livre","nome":"Mastigar","descricao":"1x/rodada, acertando 2 tentáculos no mesmo alvo na mesma rodada, +1 ataque de mordida."},{"tipo":"Completa","nome":"Engolir","teste":"4d20+30","dano":"2d10 Sangue + 2d10 perfuração no início de cada turno do Profundo","descricao":"Começando o turno agarrando alguém, testa agarrar pra engolir; engolido fica agarrado + cego + cobertura total mútua; escapa vencendo agarrar/Acrobacia ou causando 30+ dano (é regurgitado, cai adjacente); só 1 engolido por vez; ajuda externa exige ação de movimento + Percepção DT 25 pra achar o ponto certo."},{"tipo":"Completa","nome":"Onda Energética","descricao":"Raio 90m, enlouquece sistemas eletrônicos (desligam, piscam, curto, explodem — critério do mestre); item portado pode ser protegido com Vontade DT 25 do portador."}]',
  null, 75
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'Memento Mori', 260,
  'Presságio da morte, com raízes em lendas históricas humanas (associada aos médicos da peste do século XIV). Humanoide encapuzado com crânio de pássaro apodrecido no lugar do rosto, Lodo preto escorrendo dos olhos; manto que se mescla a penas negras; carrega a Ampulheta da Morte preenchida por cinzas. Move-se devagar mas é implacável: quem é escolhido nunca escapa de fato, só ganha tempo.',
  '{Morte,Conhecimento}', 'Médio', 35, '8d6 mental', 80, '3d20+20 (Visão no Escuro)', '1d20+15', 44, '3d20+20', '1d20+15', '3d20+20', 650, 325, 'Balístico, corte, impacto, perfuração e Morte 20', 'Energia',
  '{"agi":1,"for":1,"int":3,"pre":3,"vig":3}', 'Furtividade +1d20+30', '9m | 6',
  '[{"nome":"A Ampulheta da Morte","descricao":"Surge já vinculado a um alvo (normalmente pessoa), cujo tempo de vida é contado pela areia da ampulheta; nas mãos de alguém, conta como item amaldiçoado de Morte indestrutível, empunhado com 1 mão, 1 espaço; portador gasta ação padrão + 2 PE + 2 Sanidade pra descobrir o nome do vinculado e uma estimativa (não exata) do tempo restante."},{"nome":"Ininterrupto","descricao":"Só usa 1 ação por rodada pra se mover, mas nunca é afetado por condições/efeitos que reduzam ou impeçam deslocamento."},{"nome":"Inevitável Fim","descricao":"Reduzido a 0 PV, não morre: desaparece em cinzas/sombras até o fim da cena, podendo reaparecer depois pra continuar perseguindo."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Garras, corpo a corpo x2)","teste":"5d20+30","dano":"4d10+30 corte"},{"tipo":"Movimento","nome":"Visagem","descricao":"Até 3x/cena, teletransporta pra espaço desocupado em alcance extremo; alternativamente, gasta um uso pra ficar invisível até fazer uma ação que não seja se mover."},{"tipo":"Padrão","nome":"Encarar o Abismo","dano":"4d10+30 Morte (Vontade DT 35 reduz o dano à metade e evita a revelação)","descricao":"Alvo em alcance curto sofre o dano e revela memórias/pensamentos; costuma usar pra localizar a ampulheta perdida."},{"tipo":"Padrão","nome":"Revelar a Ampulheta","dano":"8d6 mental (Vontade DT 35 reduz à metade)","descricao":"Todos em 36m que veem a ampulheta testemunham presságios de mortes."},{"tipo":"Completa","nome":"Atrair a Ampulheta","descricao":"Em alcance curto dela (mesmo sem ver), teletransporta a ampulheta pras próprias mãos."}]',
  'Sem a ampulheta, o Memento Mori para de perseguir o alvo e passa a perseguir o item até recuperá-lo. Existem mitos sobre um ritual capaz de destruir a ampulheta, matando o Memento Mori de vez e libertando o alvo — mas sem informações concretas sobre como (a critério do mestre).', 76
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'Rascunho', 300,
  'Manifestação de um horror esquecido — uma memória apagada que cresce como tumor mental, o vazio do esquecimento tomando forma. Contornos negros mutantes rasgando o ar. Não pode ser vista diretamente — só percebida pelo canto do olho, sombras que se movem, silhuetas nos cantos do quarto.',
  '{Conhecimento,Energia}', 'Médio', 35, '7d8 mental', 90, '5d20+25 (Percepção às Cegas, Visão no Escuro)', '2d20+15', 48, '5d20+20', '2d20+15', '5d20+25', 750, 375, 'Balístico, corte, impacto, perfuração, Conhecimento e Energia 20', 'Sangue',
  '{"agi":2,"for":2,"int":5,"pre":5,"vig":2}', null, '15m | 10',
  '[{"nome":"Ele Não Existe","descricao":"Invisível, inaudível e incorpóreo (sucesso automático em Furtividade) enquanto ninguém a observa diretamente (mesmo por reflexo); sendo observada, perde essas 3 características; combater sem olhar diretamente pra ela dá as mesmas penalidades de estar cego."},{"nome":"Vulnerabilidade à Luz","descricao":"Em ambiente totalmente iluminado, -10 Defesa, perde resistências a dano, tenta fugir."}]',
  '[{"tipo":"Movimento","nome":"Possuir Objeto","dano":"4d6 impacto (Reflexos DT 35 reduz à metade; dobra se o objeto for muito pesado)","descricao":"Não sendo observada, 1x/rodada, telecinesia arremessa objeto em alcance médio."},{"tipo":"Padrão","nome":"Aterrorizar","dano":"7d8 mental (Vontade DT 35 reduz à metade)","descricao":"Todos em 9m à escolha."},{"tipo":"Completa","nome":"Piscar","descricao":"Até 3x/cena, teletransporta pra espaço desocupado em alcance extremo (mesmo sem linha de visão); surgindo adjacente a alguém, pode usar Aterrorizar como ação livre nele."}]',
  null, 77
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'Medusa', 320,
  'Mito grego distorcido pelo Outro Lado — versão ainda mais cruel da górgona que petrifica com o olhar. Forma feminina serpentina, sombria, corpo esquelético perturbador, só os olhos penetrantes visíveis nas sombras. Territorial: mantém um covil/templo esculpido pelos corpos de vítimas que sucumbiram à tentação de contemplá-la — cada uma paralisada, eternamente acordada e fitando sua algoz.',
  '{Conhecimento,Morte}', 'Grande', 40, '9d6 mental', 95, '5d20+25 (Faro, Visão no Escuro)', '4d20+20', 50, '4d20+20', '4d20+20', '5d20+25', 380, 190, 'Corte, impacto, perfuração e Morte 20', 'Sangue',
  '{"agi":5,"for":5,"int":4,"pre":5,"vig":3}', null, '12m | 8 · Escalada 12m | 8 · Natação 12m | 8',
  '[{"nome":"Imunidades","descricao":"Conhecimento."},{"nome":"Camuflagem Sombria","descricao":"Em penumbra/escuridão, camuflagem + 10 Furtividade."},{"nome":"Conhecimento de Eras","descricao":"Expert em toda perícia não listada (+4d20+20); comunica-se normalmente."},{"nome":"Olhar Petrificante","descricao":"Quem olha nos olhos dela testa Reflexos DT 40 ou fica petrificado (paralisia temporal, não física — dano não revela passagem de tempo); só salva matando a Medusa; lutar sem olhar dá penalidades de cego."},{"nome":"Recuperação Acelerada","descricao":"Cura Acelerada 20, mas não recupera dano crítico ou corte no pescoço (Defesa 60 nesse alvo específico)."},{"nome":"Veneno Mortal","descricao":"Garra/jato venenoso envenena; Fortitude DT 40 no início de cada turno ou 4d10 dano de Morte (passar cura)."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Garras, corpo a corpo x2)","teste":"5d20+35","dano":"8d8+20 corte"},{"tipo":"Padrão","nome":"Agredir (Cauda, distância curto)","teste":"5d20+35","dano":"8d8+40 impacto"},{"tipo":"Padrão","nome":"Agredir (Jato Venenoso, distância longo)","teste":"5d20+35","dano":"8d12 Morte"},{"tipo":"Reação","nome":"Agarrão","teste":"5d20+37","descricao":"Ao acertar cauda, tenta agarrar."},{"tipo":"Livre","nome":"Dilacerar","dano":"+8d8 corte","descricao":"Acertando as 2 garras."},{"tipo":"Padrão","nome":"Sussurrar Maléfico","dano":"6d10 mental (Vontade DT 40 reduz à metade)","descricao":"Alvo em alcance médio."},{"tipo":"Padrão","nome":"Sugestões Irresistíveis","descricao":"Alvo em alcance médio testa Vontade DT 40 ou não consegue evitar olhar pra ela até o início do próprio próximo turno."},{"tipo":"Completa","nome":"Rastejar Imparável","descricao":"Percorre o dobro do deslocamento ignorando terreno difícil; terminando adjacente a alguém, ataca com garras/cauda como ação livre."}]',
  null, 78
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'Amigo Imaginário', 360,
  'Obra de arte perfeita tomada forma — resultado do delírio coletivo de uma civilização isolada na ilha de Tipora, intensificado por um composto gerado por Sangue e Morte através do "Sino de Tenebris". Ser encapuzado de mais de 2,5m, alongado e curvado, tentáculos sob um manto marrom irreconhecível escondendo braços apodrecidos com dedos esqueléticos. Uma cascata de tinta vermelho-ocre jorra de onde deveria ser o rosto. Alimenta-se do medo de quem teve seus segredos manipulados. Originada no "Incidente da Ilha" — a manifestação original foi contida, mas o trauma dos sobreviventes segue alimentando sua força através de "quadros" ligados ao Medo.',
  '{Morte,Sangue}', 'Grande', 40, '8d8 mental (sem imunidade por NEX)', null, '5d20+30 (Percepção às Cegas, alcance extremo)', '5d20+30', 56, '4d20+20', '5d20+30', '5d20+30', 1000, 500, 'Balístico, corte, impacto e perfuração 20', 'Energia',
  '{"agi":5,"for":5,"int":3,"pre":5,"vig":4}', 'Furtividade +5d20+28 (+5d20+48 se em um quadro)', '12m | 8',
  '[{"nome":"Imunidades","descricao":"Morte, Sangue."},{"nome":"Quadros","descricao":"Existem 7 pinturas ligadas à criatura; observar uma delas por um tempo exige Vontade DT 40 — falhando, \"Entra no Quadro\": revive memórias/traumas/ilusões (a critério do mestre) e sofre 8d8 dano mental (passar evita o dano); cada vez que alguém entra num quadro, a Membrana na região se deteriora mais, \"alimentando\" o Medo local."},{"nome":"O Sino","descricao":"Ao aparecer, todos em alcance extremo capazes de ouvir ficam pasmos 1 rodada (Vontade DT 40 evita e imuniza até o fim da cena); quem falhou E \"Entrou num Quadro\" fica impedido de se afastar até o fim da cena; repete no início de cada turno da criatura."},{"nome":"Frenesi de Sangue (ao ficar machucado)","descricao":"Vigor vira 5, Fortitude vira 5d20+30, ganha escalada 15m/10, 2 ações padrão + 2 de movimento; O Sino passa a forçar a pessoa que falha a atacar/morder o ser vivo mais próximo (ou a si mesma) em vez de ficar pasma; quem já resistiu à versão anterior do Sino precisa testar de novo contra a nova versão."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Garras, corpo a corpo x2)","teste":"5d20+40","dano":"4d10+10 corte"},{"tipo":"Padrão","nome":"Agredir (Tentáculos, distância médio)","teste":"5d20+40","dano":"4d10+20 impacto"},{"tipo":"Reação","nome":"Agarrão","teste":"5d20+42","descricao":"Ao acertar tentáculos, tenta agarrar; agarrado liberta-se destruindo o tentáculo (Defesa 30, PV 50, imune a Morte e Sangue, vulnerável a Energia); destruir um tentáculo tira 50 PV da criatura."},{"tipo":"Completa","nome":"Derreter","dano":"4d10+10 Morte + 4d10+10 Sangue (Fortitude DT 40 reduz à metade)","descricao":"Puxa agarrado até o rosto e despeja tinta corrosiva."},{"tipo":"Completa","nome":"Dissolver","dano":"4d10+20 químico (Fortitude DT 40 reduz à metade)","descricao":"Envolve agarrado com mais tentáculos tentando consumi-lo; recupera PV igual ao dano causado."}]',
  null, 79
);


-- ===================== 0044_bestiario_sh_mundanas.sql =====================

-- Bestiário Sobrevivendo ao Horror — Ameaças da Realidade (Mundanas): 9 pessoas
-- (incluindo 2 variantes de Serial Killer) + 8 animais. Fecha o bestiário do livro.

insert into creatures (source_id, categoria, tipo_criatura, name, vd, flavor_text, tamanho, percepcao, iniciativa, defesa, fortitude, reflexos, vontade, pv_maximo, pv_machucado, resistencias, atributos, pericias, deslocamento, habilidades, acoes, sort_order)
values
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Pessoa', 'Bêbado Local', 10,
  'Sujeito simpático e falante, fonte de causos e fofocas locais — pode ser informante valioso ou espião involuntário.',
  'Médio', '-2d20+5', '+1d20', 12, '+1d20+5', '+1d20', '-2d20', 6, 3, 'Químico 1',
  '{"agi":1,"for":1,"int":0,"pre":0,"vig":1}', 'Diplomacia +1d20+5', '6m | 4',
  '[{"nome":"Causos e Histórias","descricao":"+5 Investigação pra interrogá-lo, se a DT da informação for 20 ou menos."},{"nome":"Espião Involuntário","descricao":"Quem interage com ele testa Intuição ou Vontade DT 15; falhando, revela info relevante ao NPC que o usa de espião — cada revelação dá +5 que o mestre usa pra subir a DT de um teste de investigação depois."},{"nome":"Invisibilidade Social","descricao":"Sem ação chamativa, outros precisam de Percepção DT 15 pra notá-lo."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Soco, corpo a corpo)","teste":"+1d20","dano":"1d3+1 impacto"}]',
  80
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Pessoa', 'Burocrata', 10,
  'Encarregado de trâmites organizacionais — um mal necessário, especialmente quando o tempo é fator crítico.',
  'Médio', '+2d20+5', '+1d20', 11, '+1d20', '+1d20', '+2d20+5', 6, 3, null,
  '{"agi":1,"for":1,"int":2,"pre":2,"vig":1}', 'Diplomacia +2d20+5, Profissão (burocrata) +2d20+10', '9m | 6',
  '[{"nome":"Atendimento Protocolar","descricao":"Atitude inicial sempre indiferente; enquanto indiferente ou pior, -5 em testes de Int/Pre contra ele."},{"nome":"Burocracia Frustrante","descricao":"Falhar em teste de Int/Pre contra ele custa 1 Sanidade."},{"nome":"Morosidade","descricao":"Cena com urgência, ao encontrá-lo, Diplomacia DT 15 ou perde 1 rodada."},{"nome":"Preencha o Formulário","descricao":"Interrogá-lo exige a perícia certa (definida pelo mestre conforme sua área); perícia errada falha automaticamente."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Soco, corpo a corpo)","teste":"+1d20","dano":"1d3+1 impacto"}]',
  81
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Pessoa', 'Fazendeiro Isolado', 20,
  'Vida no campo torna as pessoas autossuficientes, desconfiadas de estranhos, acostumadas a resolver tudo com as próprias mãos.',
  'Médio', '+2d20+5', '+1d20', 16, '+2d20+5', '+1d20', '+2d20+5', 16, 8, null,
  '{"agi":1,"for":2,"int":1,"pre":2,"vig":2}', 'Profissão (fazendeiro) +1d20+10', '9m | 6',
  '[{"nome":"De Sol a Sol","descricao":"Não fica inconsciente ao ser reduzido a 0 PV."},{"nome":"Histórias de Pescador","descricao":"Compartilhar a investigação com ele permite teste de revisar caso com Profissão (fazendeiro), a critério do mestre."},{"nome":"Resiliência do Campo","descricao":"Usa Profissão (fazendeiro) no lugar de perícias baseadas em Força ou Presença."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Peixeira, corpo a corpo)","teste":"+2d20+5, crítico 19","dano":"1d8+5 corte"},{"tipo":"Padrão","nome":"Agredir (Espingarda, distância curto)","teste":"+1d20+5, crítico x3","dano":"4d6 balístico"},{"tipo":"Movimento","nome":"Atiçar os Cães","descricao":"Próximo ataque acertado causa +1d8 dano de perfuração + alvo caído (Luta DT 15 evita)."}]',
  82
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Pessoa', 'Investigador', 40,
  'Agente da lei especializado em trabalho de campo — escrivão, polícia civil, investigador privado ou detetive; pode trabalhar a favor ou contra os agentes.',
  'Médio', '+2d20+5', '+2d20+5', 18, '+2d20', '+2d20+5', '+1d20+5', 68, 34, null,
  '{"agi":2,"for":1,"int":2,"pre":1,"vig":2}', 'Crime +2d20+5, Diplomacia +1d20+5, Furtividade +2d20+5, Intuição +1d20+5, Investigação +2d20+5', '9m | 6',
  '[{"nome":"Fonte de Informações","descricao":"Amigável (atitude amistosa/prestativa), 1x/interlúdio dá +5 numa ação de revisar caso."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Soco, corpo a corpo)","teste":"+1d20+10","dano":"1d3+1 impacto"},{"tipo":"Padrão","nome":"Agredir (Revólver, distância curto)","teste":"+2d20+10, crítico 19/x3","dano":"2d6+6 balístico"},{"tipo":"Movimento","nome":"Olhar do Investigador","descricao":"Investigação DT 15 num alvo em alcance médio; passando, +1d6 dano contra ele até o fim da cena."}]',
  83
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Pessoa', 'Médico', 20,
  'Treinado pra socorrer — mas nas mãos erradas, o mesmo conhecimento causa dor ou morte.',
  'Médio', '+2d20+5', '+1d20', 13, '+1d20+5', '+1d20', '+2d20+5', 14, 7, null,
  '{"agi":1,"for":1,"int":2,"pre":2,"vig":1}', 'Ciências +2d20+5, Medicina +2d20+10', '9m | 6',
  '[{"nome":"Conhecimento Anatômico","descricao":"Bisturi acertado deixa atordoado 1 rodada + sangrando (Fortitude DT 15 evita); 1x/cena por pessoa."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Bisturi, corpo a corpo)","teste":"+2d20+5, crítico 18","dano":"1d4+1 corte"},{"tipo":"Padrão","nome":"Tratar Ferimentos","dano":"Cura 2d10+2 PV","descricao":"Cura si/adjacente; 1x/dia por pessoa."}]',
  84
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Pessoa', 'Religioso', 40,
  'Líder de fé carismático — pode genuinamente ajudar sua congregação ou manipulá-la em busca de poder/riqueza/acesso ao paranormal.',
  'Médio', '+3d20+5', '+1d20+5', 15, '+1d20', '+1d20', '+3d20+5', 32, 16, null,
  '{"agi":1,"for":1,"int":2,"pre":3,"vig":1}', 'Diplomacia +3d20+5, Intuição +3d20+5, Religião +3d20+5', '9m | 6',
  '[{"nome":"Fé Inabalável","descricao":"+10 Vontade contra efeitos paranormais (inclusive rituais)."},{"nome":"Potência da Voz","descricao":"Com microfone, alcance das habilidades +1 passo, DT de resistência +5."},{"nome":"Seguidores","descricao":"Acompanhado de 1d4+1 devotos fiéis (ficha de Iniciado) dispostos a protegê-lo."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Pancada, corpo a corpo)","teste":"+1d20+5","dano":"1d3+1 impacto"},{"tipo":"Padrão","nome":"Voz Guia","descricao":"Pessoa em alcance curto que ouça recebe +1d20 no próximo teste de perícia até o fim da próxima rodada."},{"tipo":"Padrão","nome":"Voz Acusadora","dano":"3d6 mental + alquebrado (Vontade DT 15 reduz à metade e evita)","descricao":"Alvo em alcance curto."},{"tipo":"Reação","nome":"Sacrifício Sagrado","descricao":"1x/rodada, ao sofrer dano, troca de lugar com seguidor adjacente que sofre o dano no lugar."}]',
  85
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Pessoa', 'Predador Sofisticado', 60,
  'Serial killer — assassino de alta classe social — vive no topo de arranha-céus, prefere mortes limpas e discretas mas é brutal quando tem a chance; usa status pra encobrir crimes.',
  'Médio', '+3d20+10', '+3d20+5', 21, '+1d20+5', '+3d20+10', '+3d20+10', 60, 30, null,
  '{"agi":3,"for":3,"int":2,"pre":3,"vig":1}', 'Diplomacia +3d20+10, Enganação +3d20+10, Intimidação +3d20+10', '9m | 6',
  '[{"nome":"Escondido em Plena Vista","descricao":"Em ambientes movimentados, usa Enganação no lugar de Furtividade, sem penalidade/redução de deslocamento por ações chamativas em furtividade."},{"nome":"Recursos Abundantes","descricao":"Acessa locais/documentos restritos, comete crimes menores sem punição; crimes graves podem ter um \"bode expiatório\" (a critério do mestre)."},{"nome":"Sorriso Sedutor","descricao":"Quem não sabe que é assassino fica desprevenido contra ele, -1d20 em testes contra ele."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Navalha, corpo a corpo x2)","teste":"+3d20+10, crítico 19/x3","dano":"1d8+13 corte"},{"tipo":"Padrão","nome":"Agredir (Machado, corpo a corpo x2)","teste":"+3d20+10, crítico x3","dano":"2d8+13 corte"},{"tipo":"Padrão","nome":"Agredir (Pistola Silenciada, distância x2 curto)","teste":"+3d20+10, crítico x3","dano":"1d12+13 balístico"},{"tipo":"Livre","nome":"Ataque Furtivo","descricao":"1x/rodada, +3d6 dano contra desprevenido/flanqueado (corpo a corpo ou distância curta)."},{"tipo":"Padrão","nome":"Guarda-Costas","descricao":"1x/cena, chama 1d4+1 capangas que chegam na próxima rodada."}]',
  86
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Pessoa', 'Caçador de Gente', 80,
  'Serial killer — além da convivência social, brutal e grotesco, sede de sangue incontrolável — isolado no campo ou prédios abandonados, considerado "monstruoso" mesmo sendo humano.',
  'Médio', '+1d20+5', '+2d20+10', 23, '+3d20+10', '+2d20+10', '+1d20+5', 80, 40, null,
  '{"agi":2,"for":3,"int":1,"pre":1,"vig":3}', 'Atletismo +3d20+10, Sobrevivência +1d20+10', '9m | 6',
  '[{"nome":"Abrutalhado","descricao":"Usa itens de duas mãos com uma só, usa objetos de criatura Grande sem penalidade; resistência a dano 10/paranormal enquanto machucado."},{"nome":"Área de Caça","descricao":"+1d20 em perícia na área onde caça (definida pelo mestre)."},{"nome":"Faro para Humanos","descricao":"+2d20 em Sobrevivência envolvendo pessoas; percebe humanos por faro."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Pancada, corpo a corpo x2)","teste":"3d20+15","dano":"1d4+15 impacto"},{"tipo":"Padrão","nome":"Agredir (Machado, corpo a corpo x2)","teste":"3d20+15, crítico x3","dano":"2d8+15 corte"},{"tipo":"Padrão","nome":"Agredir (Motosserra, corpo a corpo x2)","teste":"3d20+15, crítico x4","dano":"3d6+15 corte"},{"tipo":"Livre","nome":"Ataque Furtivo","descricao":"1x/rodada, +4d6 dano contra desprevenido/flanqueado."},{"tipo":"Movimento","nome":"Imparável","descricao":"Anula qualquer redução de deslocamento (outras consequências do efeito continuam)."},{"tipo":"Padrão","nome":"Assustar","dano":"4d6 mental (Vontade DT 20 reduz à metade)","descricao":"Em quem vê/ouve em alcance curto."},{"tipo":"Padrão","nome":"Fatalidade","descricao":"1 ataque de pancada; acertando, também causa ferimento debilitante; 1x/cena por alvo."}]',
  87
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Pessoa', 'Artista da Morte', 140,
  'Serial killer — pra este assassino, matar é uma arte meticulosa — nem sempre é combatente, muitas vezes tem profissão comum na sociedade; a cena do crime precisa ser "perfeita".',
  'Médio', '+3d20+15', '+3d20+15', 27, '+1d20+5', '+3d20+15', '+3d20+15', 150, 75, null,
  '{"agi":3,"for":1,"int":3,"pre":3,"vig":1}', 'Artes +3d20+15, Enganação +3d20+15, Furtividade +3d20+15', '9m | 6',
  '[{"nome":"Matar É Uma Arte","descricao":"Usa Artes no lugar de qualquer perícia envolvendo mentes/corpos humanos (necropsia, persuadir); com horas pra analisar cena/vítima, substitui Investigação por Artes com +1d20."},{"nome":"Cenas Imprevisíveis","descricao":"Se quis disfarçar como acidente, DT pra achar pistas na cena +5; se quis deixar sua marca, quem vê a cena e não sai imediatamente fica enjoado + 4d8 dano mental (Vontade DT 25 reduz à metade e evita)."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Bisturi, corpo a corpo x2)","teste":"3d20+15, crítico 19/x4","dano":"1d4+17 corte"},{"tipo":"Livre","nome":"Ataque Furtivo","descricao":"1x/rodada, +7d6 dano contra desprevenido/flanqueado."},{"tipo":"Padrão","nome":"Discurso Artístico","dano":"4d8 mental + alquebrado e frustrado (Vontade DT 25 reduz à metade e evita frustrado)","descricao":"Todos em alcance curto que ouvem; 1x/cena por pessoa."}]',
  88
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Animal', 'Ariranha', 20,
  'Predador brincalhão e corajoso do Pantanal/Amazônia, vive em bandos que se protegem mutuamente.',
  'Médio', '+1d20+5 (Faro, Visão na Penumbra)', '+2d20+5', 16, '+2d20', '+2d20+5', '+1d20', 32, 16, null,
  '{"agi":2,"for":1,"int":0,"pre":1,"vig":2}', null, '12m | 8, Natação 9m | 6',
  '[{"nome":"Evasão","descricao":"Ataque que permite Reflexos pra reduzir dano à metade — passando, não sofre dano nenhum."},{"nome":"Táticas Familiares","descricao":"+2 ataque/dano por cada outra ariranha atacando o mesmo alvo na mesma rodada."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Mordida, corpo a corpo)","teste":"2d20+5","dano":"2d4+2 corte"}]',
  89
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Animal', 'Cavalo', 10,
  'Usado por forças policiais, esporte, ou como transporte/tração no campo.',
  'Grande', '+1d20+5 (Faro, Visão na Penumbra)', '+1d20+5', 13, '+2d20', '+1d20+5', '+1d20', 12, 6, null,
  '{"agi":1,"for":3,"int":0,"pre":1,"vig":2}', null, '15m | 10',
  '[{"nome":"Montaria","descricao":"Treinado em Adestramento pode usá-lo como aliado que aumenta deslocamento pra 15m + ação extra por rodada (só pra se deslocar)."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Cascos, corpo a corpo)","teste":"3d20+5","dano":"2d4+3 impacto"}]',
  90
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Animal (Enxame)', 'Enxame de Tocandiras', 20,
  'Formiga-bala amazônica, mordida de dor intensa e debilitante.',
  'Médio', '+1d20+5 (Visão na Penumbra)', '+1d20+5', 16, '-2d20', '+1d20+5', '+1d20', 22, 11, null,
  '{"agi":1,"for":0,"int":0,"pre":1,"vig":0}', null, '6m | 4, Escalar 6m | 4',
  '[{"nome":"Enxame","descricao":"Entra no espaço de outros; 4d4 dano de perfuração automático no fim do turno a quem estiver no espaço; imune a manobras/efeitos de alvo único sem dano; metade do dano de armas; +50% dano de área."},{"nome":"Dor Debilitante","descricao":"Quem sofre dano dele sofre -1d20 em todos os testes (Fortitude DT 20 evita); remove só com dormir ou dose de antídoto."},{"nome":"Por Dentro das Roupas","descricao":"Sair do espaço do enxame ainda carrega formigas — continua sofrendo metade do dano (2d4) até gastar ação de movimento pra se livrar."}]',
  '[]',
  91
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Animal', 'Gorila', 40,
  'Territorialista e imponente, protege seu habitat.',
  'Grande', '+1d20+5 (Faro, Visão na Penumbra)', '+2d20+5', 19, '+3d20+5', '+2d20+5', '+1d20', 70, 35, null,
  '{"agi":2,"for":3,"int":0,"pre":1,"vig":3}', 'Atletismo +3d20+5', '9m | 6, Escalar 9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Pancada, corpo a corpo x2)","teste":"2d20+10","dano":"1d6+3 impacto"},{"tipo":"Livre","nome":"Morder","teste":"2d20+10","dano":"1d6+4 corte","descricao":"Acertando as 2 pancadas no mesmo alvo, ataca também com mordida."}]',
  92
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Animal', 'Leão', 60,
  '"Rei das selvas" — um dos maiores predadores das savanas africanas; no Brasil, encontrado em abrigos/coleções exóticas (geralmente ilegais).',
  'Grande', '+1d20+10 (Faro, Visão na Penumbra)', '+3d20+10', 18, '+2d20+5', '+3d20+10', '+2d20+5', 80, 40, null,
  '{"agi":3,"for":3,"int":0,"pre":2,"vig":2}', 'Atletismo +3d20+10, Furtividade +3d20+8', '15m | 10',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Garras, corpo a corpo x2)","teste":"3d20+10, crítico 19","dano":"1d6+4 corte"},{"tipo":"Padrão","nome":"Agredir (Mordida, corpo a corpo)","teste":"3d20+10","dano":"1d8+4 corte"},{"tipo":"Livre","nome":"Agarrão","teste":"3d20+12","descricao":"Ao acertar mordida em alvo Médio ou menor, tenta agarrar."},{"tipo":"Completa","nome":"Bote","descricao":"Investida + ataca com mordida e as 2 garras (3 ataques, todos com bônus de investida) contra o mesmo alvo."}]',
  93
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Animal', 'Lobo', 20,
  'Caçador habilidoso em grupo — ao ouvir o uivo, nunca está sozinho.',
  'Médio', '+1d20+5 (Faro, Visão na Penumbra)', '+3d20+5', 15, '+2d20+5', '+3d20+5', '+1d20', 18, 9, null,
  '{"agi":3,"for":3,"int":0,"pre":1,"vig":2}', 'Sobrevivência +1d20+10', '12m | 8',
  '[{"nome":"Táticas de Alcateia","descricao":"Flanqueando, +1d20 adicional no ataque (total +2d20 com o bônus normal de flanquear) + 1d6 dano extra na mordida."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Mordida, corpo a corpo)","teste":"3d20+5","dano":"1d6+4 corte"},{"tipo":"Livre","nome":"Derrubar","teste":"3d20+5","descricao":"Acertando mordida, manobra de derrubar."}]',
  94
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Animal', 'Touro', 20,
  'Montanha de músculos de temperamento imprevisível.',
  'Grande', '+1d20+5 (Faro, Visão na Penumbra)', '+1d20', 15, '+2d20+5', '+1d20', '+1d20', 38, 19, null,
  '{"agi":1,"for":3,"int":0,"pre":1,"vig":2}', null, '12m | 8',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Chifres, corpo a corpo)","teste":"3d20+5","dano":"2d6+6 perfuração"},{"tipo":"Completa","nome":"Atropelamento (recarga: movimento)","dano":"2d6+6 impacto + caído (Reflexos DT 15 reduz à metade e evita)","descricao":"Percorre o dobro do deslocamento em linha reta, atravessando espaços de seres menores; quem está na linha sofre o efeito."}]',
  95
),
(
  (select id from sources where slug = 'sobrevivendo_ao_horror'), 'mundana', 'Animal', 'Urso Pardo', 60,
  'Um dos ursos mais perigosos — predador imponente e poderoso.',
  'Grande', '+1d20+5 (Faro, Visão na Penumbra)', '+1d20+5', 19, '+3d20+10', '+1d20+5', '+2d20', 90, 45, 'Balístico, corte, impacto e perfuração 2',
  '{"agi":1,"for":3,"int":0,"pre":2,"vig":3}', 'Atletismo +3d20+10', '12m | 8',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Garras, corpo a corpo x2)","teste":"3d20+10, crítico 19","dano":"1d6+4 corte"},{"tipo":"Padrão","nome":"Agredir (Mordida, corpo a corpo)","teste":"3d20+10","dano":"1d8+4 corte"},{"tipo":"Livre","nome":"Agarrão","teste":"3d20+12","descricao":"Ao acertar mordida em alvo Médio ou menor, tenta agarrar."}]',
  96
);


-- ===================== 0045_bestiario_as01.sql =====================

-- Bestiário Arquivos Secretos 01 — Os Transtornados (culto do Diabo), NPCs bônus do
-- Hexatombe (Cleo Brisa, Cristino) e a criatura paranormal Anulado. Por decisão de
-- Millie: só fichas de personagem/NPC entram aqui — lore/narrativa fica de fora.

insert into creatures (source_id, categoria, tipo_criatura, name, vd, flavor_text, tamanho, percepcao, iniciativa, defesa, fortitude, reflexos, vontade, pv_maximo, pv_machucado, resistencias, atributos, pericias, deslocamento, habilidades, acoes, sort_order)
values
(
  (select id from sources where slug = 'arquivos_secretos_01'), 'mundana', 'Pessoa', 'Assecla', 40,
  'Recém-chegado ao culto Os Transtornados — hierarquia mais baixa.',
  'Médio', '+1d20+5', '+1d20+5', 18, '+2d20+5', '+1d20+5', '+1d20+5', 30, 15, null,
  '{"agi":1,"for":2,"int":2,"pre":1,"vig":2}', 'Atletismo +2d20+5, Intimidação +1d20+5, Ocultismo +2d20+5', '9m | 6',
  '[{"nome":"Rituais (DT 15)","descricao":"Conjura sem pagar PE, até 3 PE por conjuração."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Corrente Farpada, corpo a corpo)","teste":"2d20+5, crítico 19","dano":"1d8+10 corte","descricao":"Corrente alcança 3m, +2 em desarmar/derrubar."},{"tipo":"Padrão","nome":"Ritual Armadura de Sangue (Sangue 1)","descricao":"+5 Defesa até o fim da cena."},{"tipo":"Padrão","nome":"Ritual Esfolar Discente (Sangue 1)","dano":"5d4+5 corte + sangrando (Reflexos DT 15 reduz à metade e evita)","descricao":"Explosão 6m raio, alcance médio."}]',
  97
),
(
  (select id from sources where slug = 'arquivos_secretos_01'), 'mundana', 'Pessoa', 'Investido (Transtornado)', 80,
  'Marcado, executor do culto Os Transtornados — hierarquia intermediária.',
  'Médio', '+2d20+10', '+3d20+5', 23, '+2d20+10', '+1d20+5', '+2d20+10', 90, 45, null,
  '{"agi":1,"for":3,"int":2,"pre":2,"vig":2}', 'Atletismo +3d20+10, Intimidação +2d20+10, Ocultismo +2d20+10', '9m | 6',
  '[{"nome":"Rituais (DT 20)","descricao":"Conjura sem pagar PE, até 6 PE por conjuração."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Cutelo, corpo a corpo x2)","teste":"4d20+15, crítico x3","dano":"1d6+15 corte"},{"tipo":"Padrão","nome":"Ritual Armadura de Sangue Discente (Sangue 1)","descricao":"+10 Defesa + resistência a balístico/corte/impacto/perfuração 5 até o fim da cena."},{"tipo":"Padrão","nome":"Ritual Descarnar Discente (Sangue 2)","dano":"10d8 (metade corte/metade Sangue) + hemorragia (Fortitude DT 20 reduz à metade e evita; hemorragia = 4d8 Sangue por turno até passar 2 testes de Fortitude seguidos)","descricao":"Toque."},{"tipo":"Padrão","nome":"Ritual Esfolar Discente (Sangue 1)","dano":"5d4+5 corte + sangrando (Reflexos DT 20 reduz à metade e evita)","descricao":"Explosão 6m raio, alcance médio."},{"tipo":"Padrão","nome":"Ritual Transfusão Vital (Sangue 2)","descricao":"Perde até 50 PV, toca aliado que recupera o mesmo tanto."}]',
  98
),
(
  (select id from sources where slug = 'arquivos_secretos_01'), 'mundana', 'Pessoa', 'Apóstolo do Sangue', 200,
  'Líder do culto Os Transtornados, deformado pelo paranormal — hierarquia mais alta.',
  'Médio', '+3d20+15 (Percepção às Cegas)', '+2d20+10', 30, '+3d20+15', '+2d20+10', '+3d20+15', 300, 150, null,
  '{"agi":2,"for":4,"int":2,"pre":3,"vig":3}', 'Atletismo +4d20+15, Intimidação +3d20+15, Ocultismo +2d20+15', '9m | 6',
  '[{"nome":"Marreta Transtornada","descricao":"Crítico com a marreta também quebra um osso — alvo fica fraco até cuidados prolongados em interlúdio (Fortitude DT 29 evita); se ficar fraco de novo pela mesma arma, vira debilitado."},{"nome":"Rituais (DT 29)","descricao":"Conjura sem pagar PE, até 10 PE por conjuração."}]',
  '[{"tipo":"Livre","nome":"Rituais Acelerados","descricao":"1x/rodada, ritual de execução até ação completa vira execução livre."},{"tipo":"Padrão","nome":"Agredir (Marreta Sanguinária, corpo a corpo x2)","teste":"4d20+20, crítico x4","dano":"4d10+30 impacto, perfuração ou Sangue (à escolha)"},{"tipo":"Padrão","nome":"Ritual Armadura de Sangue Discente (Sangue 1)","descricao":"+10 Defesa + resistência 5 até o fim da cena."},{"tipo":"Padrão","nome":"Ritual Descarnar Discente (Sangue 2)","dano":"10d8 + hemorragia (Fortitude DT 29, mesma mecânica do Investido)","descricao":"Toque."},{"tipo":"Padrão","nome":"Ritual Esfolar Verdadeiro (Sangue 1)","dano":"10d4+10 corte + sangrando (Reflexos DT 29 reduz à metade e evita)","descricao":"Explosão 6m raio, alcance longo."},{"tipo":"Padrão","nome":"Ritual Hemofagia Discente (Sangue 2)","dano":"+6d6 Sangue","descricao":"Ataque de marreta + ritual; acertando, recupera metade do dano total causado em PV."},{"tipo":"Padrão","nome":"Ritual Transfusão Vital (Sangue 2)","descricao":"Perde até 50 PV, cura aliado no mesmo tanto."},{"tipo":"Padrão","nome":"Ritual Vomitar Pestes Discente (Sangue 3)","dano":"5d12 Sangue + agarrado (Reflexos DT 29 reduz à metade e evita)","descricao":"Vomita enxame Grande (3m) de criaturas de Sangue no fim de cada turno; ação de movimento move o enxame 12m; escapar exige ação padrão + Acrobacia/Atletismo DT 29."}]',
  99
),
(
  (select id from sources where slug = 'arquivos_secretos_01'), 'mundana', 'Pessoa', 'Giovanni Opspor', 80,
  'Empresário que fez um Pacto de Sangue pra salvar sua fortuna; perdeu o filho num incêndio e se tornou um dos membros mais perigosos do culto — manipulador, sem escrúpulos, sempre um passo à frente. Líder da equipe dos Transtornados no Hexatombe.',
  'Médio', '+3d20+10', '+2d20+5', 23, '+1d20+5', '+2d20+5', '+3d20+10', 70, 35, null,
  '{"agi":2,"for":1,"int":4,"pre":3,"vig":1}', 'Crime +2d20+10, Enganação +3d20+10, Furtividade +2d20+10, Ocultismo +4d20+10', '9m | 6',
  '[{"nome":"Rituais (DT 20)","descricao":"Conjura sem pagar PE, até 6 PE por conjuração."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Revólver, distância curto)","teste":"2d20+5, crítico 19","dano":"2d6+10 balístico"},{"tipo":"Padrão","nome":"Agredir (Faca, corpo a corpo)","teste":"2d20+5, crítico 19","dano":"1d4+10 perfuração"},{"tipo":"Padrão","nome":"Ritual Distorcer Aparência (Sangue 1)","descricao":"Muda aparência própria/de outro em alcance curto até o fim da cena; +10 Enganação pra disfarce; resistir/identificar exige Vontade DT 20."},{"tipo":"Padrão","nome":"Ritual Esconder dos Olhos (Conhecimento 2)","descricao":"Invisível (camuflagem total + 15 Furtividade); termina se atacar ou usar habilidade hostil."},{"tipo":"Padrão","nome":"Ritual Espelho (Sangue+Conhecimento 2)","descricao":"Cria cópia de carne/sangue de si mesmo ou de ser já visto (mesmas estatísticas); controla e percebe através dela; fica atordoado enquanto concentrado; identificar exige Intuição/Ocultismo/Percepção/Vontade DT 20."},{"tipo":"Padrão","nome":"Ritual Fortalecimento Sensorial Discente (Sangue 1)","descricao":"+1d20 em Investigação/Luta/Percepção/Pontaria até o fim da cena; inimigos -1d20 pra atacá-lo."},{"tipo":"Padrão","nome":"Ritual Terceiro Olho (Conhecimento 1)","descricao":"Vê auras paranormais em alcance longo por 1 dia; ação de movimento identifica poderes paranormais/rituais de alguém em alcance médio."}]',
  100
),
(
  (select id from sources where slug = 'arquivos_secretos_01'), 'mundana', 'Pessoa', 'Mosto', 60,
  'Ex-segurança de creche, brutamontes silencioso que virou Transtornado após um Pacto pra salvar seu emprego; rosto desfigurado em luta contra Colosso, cobre o rosto com um saco de pão. Guarda-costas leal de Giovanni.',
  'Médio', '+0', '+2d20+5', 20, '+3d20+10', '+1d20+5', '+0', 100, 50, null,
  '{"agi":1,"for":4,"int":1,"pre":1,"vig":3}', 'Atletismo +4d20+10', '9m | 6',
  '[{"nome":"Rosto Desfigurado","descricao":"Sem o saco cobrindo o rosto, fica furioso — +1d8 em rolagens de dano e libera o poder Trocação Justa."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Cutelo, corpo a corpo)","teste":"4d20+10, crítico 19/x3","dano":"1d6+10 corte"},{"tipo":"Padrão","nome":"Agredir (Desarmado, corpo a corpo)","teste":"4d20+10","dano":"1d4+10 impacto"},{"tipo":"Completa","nome":"Surra Brutal","descricao":"2 ataques (cutelo + desarmado); -5 Defesa até o próximo turno."},{"tipo":"Completa","nome":"Trocação Justa (só furioso)","descricao":"Salta no inimigo, golpes ininterruptos — alvo escolhe \"trocar\" (revezam rolando dano um no outro até alguém desistir/cair; dano não pode ser bloqueado) ou \"se defender\" (Fortitude DT 20: passa sofre 1d6+10, falha sofre 1d6+1d4+20 — esses sim podem ser bloqueados normalmente)."}]',
  101
),
(
  (select id from sources where slug = 'arquivos_secretos_01'), 'mundana', 'Pessoa', 'Tarrafa', 60,
  'Pescador simples que vendeu a alma num Pacto pra sobreviver à fome; morto durante o Hexatombe por Aguiar e Jae-Yoon, ressurgiu como Zumbi de Sangue, depois destruído de vez.',
  'Médio', '+1d20+5', '+3d20+10', 21, '+2d20+5', '+3d20+10', '+0', 80, 40, null,
  '{"agi":3,"for":2,"int":1,"pre":1,"vig":2}', 'Acrobacia +3d20+10, Atletismo +2d20+10', '9m | 6',
  '[{"nome":"Perfuração Permanente","descricao":"Acertando o arpão, alvo fica lento até remover com ação padrão + Atletismo/Luta DT 20."},{"nome":"Prazer na Dor","descricao":"Machucado, resistência a dano 5."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Arpão do Pescador, distância curto)","teste":"3d20+10, crítico x3","dano":"1d6+10 perfuração +1d6 Sangue"},{"tipo":"Padrão","nome":"Agredir (Faca, corpo a corpo x2)","teste":"3d20+10, crítico 19","dano":"1d4+10 perfuração"},{"tipo":"Padrão","nome":"Engolir Metal","descricao":"Engole objeto metálico Pequeno ou menor; perde 1d6 PV, +2 em testes de Força/Agilidade (cumulativo, até 3 itens)."}]',
  102
),
(
  (select id from sources where slug = 'arquivos_secretos_01'), 'mundana', 'Pessoa', 'Carrara', 60,
  'Transtornado de meia-idade com pregos cravados ao redor do crânio/pescoço/braços; morto por Kemi antes mesmo do início do ritual Hexatombe.',
  'Médio', '+2d20+5', '+2d20+10', 18, '+0', '+2d20+10', '+2d20+5', 70, 35, null,
  '{"agi":2,"for":1,"int":2,"pre":2,"vig":1}', 'Atletismo +1d20+10, Enganação +2d20+10', '9m | 6',
  '[{"nome":"Sangue Maldito","descricao":"Munição banhada em seu sangue causa +1d6 dano de Sangue (uma única vez)."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Soco com Pregos, corpo a corpo x2)","teste":"1d20+10","dano":"1d4+10 impacto"},{"tipo":"Padrão","nome":"Agredir (Pregador Pneumático, distância x2 curto)","teste":"2d20+10, crítico x4","dano":"3d4+10 perfuração +1d6 Sangue"},{"tipo":"Completa","nome":"Pregos de Sangue","descricao":"Remove pregos do corpo e recarrega o pregador, aplicando Sangue Maldito."}]',
  103
),
(
  (select id from sources where slug = 'arquivos_secretos_01'), 'mundana', 'Pessoa', 'Nando Salles', 20,
  '"Criptobro" arrogante, influenciador de finanças; era o sacrifício da equipe dos Transtornados no Hexatombe, carregando o Estigma da Coroa de Espinhos (Orgulho/Desprezo/Arrogância). Morto por Kemi após tentar matar Henri pelas costas.',
  'Médio', '+2d20+5', '+2d20+5', 16, '+2d20+5', '+2d20+5', '+2d20+5', 35, 17, null,
  '{"agi":2,"for":1,"int":2,"pre":2,"vig":2}', 'Enganação +2d20+5', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Pistola, distância curto)","teste":"2d20+5, crítico 18","dano":"1d12+5 balístico"},{"tipo":"Completa","nome":"Arrogância Diabólica","dano":"2d6 dano mental inevitável (sem redução/resistência) se recusar","descricao":"Pessoa em alcance longo testa Vontade DT 25; falhando, faz uma ação imprudente no próximo turno (atacar alguém mais forte, saltar de um lugar alto)."}]',
  104
),
(
  (select id from sources where slug = 'arquivos_secretos_01'), 'mundana', 'Pessoa', 'Cleo Brisa', 60,
  'Policial civil de Inquisidor do Vale (norte do Paraná), investigava clandestinamente seu próprio delegado (o serial killer "Mutilador Noturno"). Capturada pelos Transtornados e jogada num portal pro Hexatombe pra preencher a vaga de Carrara. Morta pelos Vampiros de forma brutal. Não era cultista de fato.',
  'Médio', '+2d20+5', '+2d20+10', 20, '+2d20+5', '+2d20+5', '+2d20+10', 80, 40, null,
  '{"agi":2,"for":2,"int":2,"pre":2,"vig":2}', 'Atletismo +2d20+5, Crime +2d20+5, Intuição +2d20+10, Investigação +2d20+10, Tática +2d20+5', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Pistola, distância x2 curto)","teste":"2d20+10, crítico 18","dano":"1d12+10 balístico"},{"tipo":"Padrão","nome":"Agredir (Pé de Cabra, corpo a corpo x2)","teste":"2d20+10","dano":"1d8+10 impacto"},{"tipo":"Reação","nome":"Durona","descricao":"1x/cena, dano que reduziria a 0 PV a deixa em 1 PV (não funciona com dano massivo)."},{"tipo":"Completa","nome":"Empurrar e Atirar","descricao":"Empurra alvo 3m com o pé de cabra (Fortitude DT 20 evita) + atira; empurrando com sucesso, +1d20 no ataque e +1d12 dano se acertar."}]',
  105
),
(
  (select id from sources where slug = 'arquivos_secretos_01'), 'mundana', 'Pessoa', 'Cristino', 180,
  'Cangaceiro enigmático que chegou à Coroa de Espinhos a pé (não cruzou portal). Caçador do Quibungo (recuperou um medalhão de Tenebris de dentro da criatura). Frio e metódico, cumpria promessas com brutalidade. Morto por Henri (Juan), que usou o ritual Descarnar pra removê-lo pele. Não era cultista de fato.',
  'Médio', '+2d20+5', '+2d20+15', 36, '+3d20+15', '+3d20+15', '+2d20+10', 240, 120, null,
  '{"agi":3,"for":3,"int":2,"pre":2,"vig":3}', 'Atletismo +3d20+15, Furtividade +3d20+15, Medicina +2d20+15, Sobrevivência +2d20+15', '9m | 6',
  '[{"nome":"Combinação Cruel","descricao":"2 ataques por rodada combinando tipos diferentes (ex.: disparo + coronhada)."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Peixeira, corpo a corpo x2)","teste":"3d20+20, crítico 19","dano":"3d8+30 corte"},{"tipo":"Padrão","nome":"Agredir (Coronha da Espingarda, corpo a corpo x2)","teste":"3d20+20, crítico x3","dano":"3d6+30 perfuração"},{"tipo":"Padrão","nome":"Agredir (Espingarda, distância x2 curto)","teste":"3d20+20, crítico x3","dano":"4d6+30 balístico"},{"tipo":"Padrão","nome":"Luzernas","dano":"6d6 fogo + em chamas (Reflexos DT 28 reduz à metade e evita)","descricao":"Posiciona lamparina, iluminando alcance curto — percebe automaticamente quem for iluminado por ela, qualquer distância; atirando na lamparina, explode causando o dano a todos em alcance curto."},{"tipo":"Completa","nome":"Emboscada do Cangaço","descricao":"Escondido, inimigos testam Percepção DT 30; se ninguém passar, faz 2 disparos de espingarda + 1 coronhada (3 ataques na mesma ação); alvos ficam desprevenidos (-5 Defesa, -1d20 Reflexos) e sem reações."}]',
  106
);

insert into creatures (source_id, categoria, name, vd, flavor_text, descritores, tamanho, presenca_dt, presenca_dano, presenca_nex_imune, percepcao, iniciativa, defesa, fortitude, reflexos, vontade, pv_maximo, pv_machucado, resistencias, vulnerabilidades, atributos, deslocamento, habilidades, acoes, sort_order)
values
(
  (select id from sources where slug = 'arquivos_secretos_01'), 'paranormal', 'Anulado', 100,
  '"O corpo abandonado por tempo demais se torna a manifestação física do fracasso e da incompletude" — criatura de Sangue/Conhecimento que se forma quando um caixão do ritual Passagem de Conhecimento Expandido é aberto antes da hora (1d6+1 dias). Humanoide retorcido e visceral, textura gosmenta, pescoço longo e quebrado, braços desproporcionais terminados em garras; raios vermelhos percorrem seu corpo instável (falha na Membrana). Amálgama errante de carne/órgãos/memórias sem vida, consciência ou alma — um "quase ser" preso em formação e agonia eterna. Ataca com agressividade desesperada, tentando absorver tecido/ossos/órgãos pra se completar.',
  '{Sangue,Conhecimento}', 'Médio', 20, '4d6 mental', 45, '1d20+10', '2d20+10, Visão no Escuro', 25, '3d20+10', '2d20+5', '1d20+10', 190, 95, 'Balístico, impacto e perfuração 5, Conhecimento e Sangue 10', 'Morte',
  '{"agi":2,"for":3,"int":1,"pre":1,"vig":3}', '9m | 6',
  '[{"nome":"Corpo Oscilante","descricao":"Na 1ª vez que alguém olha diretamente pra ele, sofre 2d6 dano mental; qualquer ação visando o Anulado conta como \"olhar diretamente\" (evitar isso dá -1d20 nos testes contra ele, mas evita o dano)."},{"nome":"Golpes Anulados","descricao":"Distribui os ataques entre até 3 alvos diferentes."},{"nome":"Quero o Seu Corpo","descricao":"Ao errar um ataque contra ele, testa Reflexos DT 25 ou fica agarrado; começando o turno agarrando alguém, suga órgãos: 4d10 dano de Sangue, recupera metade do dano em PV."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Braços Grotescos, corpo a corpo x2)","teste":"3d20+15","dano":"1d8+10 impacto"},{"tipo":"Padrão","nome":"Agredir (Mordida Asquerosa, corpo a corpo)","teste":"3d20+15","dano":"1d10+10 Sangue"}]',
  107
);


-- ===================== 0046_bestiario_as02.sql =====================

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


-- ===================== 0047_bestiario_as03.sql =====================

-- Bestiário Arquivos Secretos 03 — Os Psikolera (banda, 6 fichas), Os Couraças
-- (culto de Escarlata, 6 fichas), Os Pássaros (5 fichas) + Suellen (1 ficha).

insert into creatures (source_id, categoria, tipo_criatura, name, vd, flavor_text, tamanho, percepcao, iniciativa, defesa, fortitude, reflexos, vontade, pv_maximo, pv_machucado, resistencias, vulnerabilidades, atributos, pericias, deslocamento, habilidades, acoes, sort_order)
values
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Alê', 80,
  'Tecladista do PSIKOLERA, neta de uma cartomante; canaliza Morte e Conhecimento através do teclado. Percepção sinestésica de sons desde criança. Mecânica compartilhada da banda — Música do Diabo: ação livre, só usável se o personagem já estiver de máscara (Hora do Show ativa); todos os membros do PSIKOLERA (mascarados ou não) recebem bônus de dano que escala com quantos membros estão tocando simultaneamente, na ordem: 1º Franco (guitarra) +1d4, 2º Cindy (baixo) +1d6, 3º Alê (teclado) +1d8, 4º Eloy (bateria) +1d10, 5º Caio (vocal, todos tocando) +1d12.',
  'Médio', '+3d20+10', '+3d20+5', 18, '+0', '+3d20+5', '+3d20+10', 45, 22, null, null,
  '{"agi":3,"for":1,"int":3,"pre":3,"vig":1}', 'Artes +3d20+10, Ocultismo +3d20+10', '9m | 6',
  '[{"nome":"Rituais (DT 20)","descricao":"Conjura sem pagar PE, até 6 PE por conjuração."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Cortar com Teclado, corpo a corpo x2)","teste":"1d20+10, crítico 19","dano":"2d6+10 corte"},{"tipo":"Padrão","nome":"Desfazer Sinapses","dano":"3d10+10 Conhecimento + confuso 1 rodada (Vontade DT 20 reduz à metade e evita a condição)","descricao":"Notas dissonantes; alvo em alcance médio."},{"tipo":"Padrão","nome":"Hora do Show (coloca a máscara)","descricao":"+5 ataque, +10 Defesa (total 26), +20 PV atuais/máximos (total 90), DT das habilidades +5, causando dano também causa +2 dados do mesmo tipo, libera Música do Diabo. Arrancar a máscara: perder numa manobra de desarmar (Teste +10) remove a habilidade. Destruir: perder numa manobra de quebrar (Teste +10) causa dano à máscara (RD 10, PV 5); quebrando, remove Hora do Show."},{"tipo":"Padrão","nome":"Ritual Cicatrização Discente (Morte 1)","descricao":"Ser adjacente recupera 5d8+5 PV, mas envelhece 1 ano automaticamente."},{"tipo":"Padrão","nome":"Ritual Proteção Sigilosa (Conhecimento 2)","descricao":"Área de 3m de raio em alcance de toque, sigilos até o fim da cena; ela e aliados na área recebem +5 Defesa, testes de resistência e Furtividade."}]',
  126
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Caio', 80,
  'Vocalista do PSIKOLERA, subserviente e sem vontade própria — encontrou sentido na banda depois de uma vida de irrelevância. Empunha uma espada-microfone.',
  'Médio', '+2d20', '+2d20+5', 17, '+2d20+10', '+2d20+5', '+2d20', 60, 30, null, null,
  '{"agi":2,"for":2,"int":1,"pre":2,"vig":2}', 'Artes +2d20+10, Atletismo +2d20+10', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Espada, corpo a corpo x2)","teste":"2d20+10, crítico 19","dano":"2d8+10 corte"},{"tipo":"Padrão","nome":"Berrão","dano":"4d8 impacto + surdo 1 rodada + solta o que segura","descricao":"Finca a espada e grita no ouvido de alvo em alcance de toque; alvo pode largar o item pra tapar os ouvidos (reduz dano à metade e evita a condição)."},{"tipo":"Padrão","nome":"Corte na Jugular","dano":"2d8+10 corte + sangrando (Reflexos DT 20 reduz à metade e evita a condição)","descricao":"Gira a espada-microfone na garganta de adjacente."},{"tipo":"Padrão","nome":"Hora do Show","descricao":"+5 ataque, +10 Defesa (27), +20 PV atuais/máximos (80), DT +5, +2 dados de dano do mesmo tipo, libera Música do Diabo. Arrancar/Destruir a máscara: mesma mecânica de Alê (Teste 2d20+10 pra desarmar; RD 10/PV 5 pra quebrar)."}]',
  127
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Eloy Furtado', 80,
  'Baterista do PSIKOLERA, apartador de discussões, buscou conforto no silêncio da bateria. Máscara em formato de focinheira.',
  'Médio', '+1d20', '+2d20+5', 16, '+3d20+10', '+2d20+5', '+1d20', 70, 35, null, null,
  '{"agi":1,"for":3,"int":1,"pre":1,"vig":3}', 'Artes +1d20+10, Atletismo +3d20+10', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Pancada, corpo a corpo x2)","teste":"3d20+10, crítico 19","dano":"4d4+10 impacto"},{"tipo":"Padrão","nome":"Hora do Show","descricao":"Mesmos bônus dos outros (+5 ataque, +10 Defesa [26], +20 PV [90], DT +5, +2 dados de dano, libera Música do Diabo); arrancar/destruir com Teste 3d20+10."},{"tipo":"Padrão","nome":"Moeller Method","dano":"passando Fortitude DT 20: 2d4+5 impacto; falhando: 4d4+10 impacto + atordoado","descricao":"Ataca adjacente como se fosse um tambor; falhando, permite que Eloy continue batendo (novo teste, mesmo resultado se passar/falhar); repete até o alvo passar ou falhar 3x seguidas."}]',
  128
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Franco', 80,
  'Guitarrista do PSIKOLERA, criança introspectiva de infância negligenciada, fascinado por fogo desde cedo; empunha guitarra que dispara chamas.',
  'Médio', '+1d20', '+2d20+5', 16, '+2d20+5', '+2d20+10', '+1d20', 55, 27, null, null,
  '{"agi":2,"for":2,"int":1,"pre":1,"vig":2}', 'Acrobacia +2d20+10, Artes +1d20+10', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Bater com Guitarra, corpo a corpo x2)","teste":"2d20+5","dano":"1d10+5 impacto"},{"tipo":"Padrão","nome":"Hora do Show","descricao":"Mesmos bônus (+5 ataque, +10 Defesa [26], +20 PV [75], DT +5, +2 dados de dano, libera Música do Diabo); arrancar/destruir com Teste 2d20+5."},{"tipo":"Padrão","nome":"Imolar","dano":"10+ no 1d20: 8d6+10 fogo + em chamas (Reflexos DT 20 reduz à metade e evita); 9 ou menos: 4d6 fogo + em chamas no próprio Franco","descricao":"Dispara chamas ao máximo num alvo em alcance curto."},{"tipo":"Padrão","nome":"Incinerar","dano":"6d6+5 fogo + em chamas (Reflexos DT 20 reduz à metade e evita)","descricao":"Dispara chamas da guitarra num alvo em alcance curto."}]',
  129
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Cindy Lopes', 80,
  'Baixista e líder de fato do PSIKOLERA; fez um Pacto de Sangue com Giovanni pra assumir o controle da banda depois de eliminar o antigo vocalista Andrei.',
  'Médio', '+3d20+5', '+3d20+10', 17, '+0', '+3d20+10', '+3d20+5', 50, 25, null, null,
  '{"agi":3,"for":1,"int":2,"pre":3,"vig":1}', 'Artes +3d20+10, Enganação +3d20+10', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Pancada com Baixo, corpo a corpo x2)","teste":"1d20+10","dano":"1d6+10 impacto"},{"tipo":"Padrão","nome":"Agredir (Disparo com Baixo, distância x2 médio)","teste":"3d20+10, crítico 19/x3","dano":"2d8+10 balístico"},{"tipo":"Padrão","nome":"Hora do Show","descricao":"Mesmos bônus (+5 ataque, +10 Defesa [27], +20 PV [70], DT +5, +2 dados de dano, libera Música do Diabo); arrancar/destruir com Teste +10."},{"tipo":"Padrão","nome":"Silenciar","dano":"2d6 mental + trêmulo 3 rodadas (Vontade DT 20 reduz à metade e reduz duração pra 1 rodada)","descricao":"Sinal de silêncio pra alvo em alcance médio."}]',
  130
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Caíto Rocha', 20,
  'Fã obcecado/rival do PSIKOLERA, mente amargurada que culpa os outros por suas próprias falhas; não é membro oficial da banda, mas ligado à órbita dela pela influência do Sangue.',
  'Médio', '+1d20+5', '+2d20+5', 17, '+0', '+2d20+5', '+1d20+5', 20, 10, null, null,
  '{"agi":2,"for":1,"int":2,"pre":1,"vig":1}', 'Furtividade +2d20+5', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Disparo de Pistola, distância x2 curto)","teste":"2d20+5, crítico 18","dano":"1d12+5 balístico"},{"tipo":"Completa","nome":"Ódio Suprimido","dano":"falhando Fortitude: caído + 1d4+6 impacto (chute/mordida); falhando Reflexos: 1d12+5 balístico (disparo)","descricao":"Explode de raiva, corre/salta em quem estiver no caminho; todos em alcance curto testam Fortitude E Reflexos (ambos DT 20). Depois da explosão, Caíto cai chorando e trêmulo (fica exausto até o fim da cena)."}]',
  131
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Ana', 100,
  'Enfermeira que teve o coração partido na juventude e jurou nunca mais amar de um jeito "normal" — encontrou em Escarlata (Camila, líder de Os Couraças) uma forma de amor absoluto e obsessivo. Ana é uma seguidora apaixonada, não a líder do culto.',
  'Médio', '+1d20+5', '+2d20+5', 27, '+3d20+10', '+2d20+5', '+1d20+5', 90, 45, 'Balístico, impacto, perfuração 5, Sangue 10', 'Morte',
  '{"agi":2,"for":3,"int":1,"pre":1,"vig":3}', 'Atletismo +3d20+10', '9m | 6',
  '[{"nome":"Fúria Apaixonada","descricao":"Se Escarlata morrer, 1x/cena até o fim do combate, Ana pode gastar ação padrão pra 3 ataques (2 de maça + 1 de espada) contra quem a matou, cada um +1d10 dano do mesmo tipo."},{"nome":"Paixão Servil","descricao":"Se Ana estiver em alcance curto de Escarlata, +1d6 em todos os testes/rolagens; se Escarlata foi atacada desde a última rodada, bônus sobe pra +1d10."},{"nome":"Rituais (DT 20)","descricao":"Conjura sem pagar PE, até 6 PE por conjuração."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Maça, corpo a corpo)","teste":"3d20+15, crítico x3","dano":"6d4+10 perfuração"},{"tipo":"Padrão","nome":"Agredir (Espada, corpo a corpo)","teste":"3d20+15, crítico 19","dano":"4d6+10 corte"},{"tipo":"Padrão","nome":"Ritual Hemofagia (Sangue 2)","dano":"6d6 Sangue (Fortitude reduz à metade)","descricao":"Toque; recupera PV = metade do dano causado."}]',
  132
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Torvo (Tadeo)', 20,
  'Ex-marido de Camila/Escarlata; administrador de museu que a traiu com Ana e tentou controlar a relação poliamorosa através de manipulação. Punido — preso numa armadura antiga (a mesma que aprisionou seu bisavô, o professor Boris Fausto, há um século), agora é praticamente um cadáver animado usado como fonte viva de sangue pra rituais.',
  'Médio', '+0', '+0', 21, '+2d20+5', '+0', '+1d20+10', 30, 15, 'Balístico, impacto, perfuração 5, Sangue 10', 'Morte',
  '{"agi":1,"for":1,"int":1,"pre":1,"vig":2}', null, '0m | 0',
  '[{"nome":"Fonte de Rituais","descricao":"Se Torvo estiver em alcance curto de Escarlata, ela pode arrancar a vida dele sempre que causar dano com um ritual — o ritual dela causa +2d6 dano do mesmo tipo, e Torvo perde 2d6 PV."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Manopla Espinhenta, corpo a corpo)","teste":"1d20+10","dano":"1d6+5 perfuração"}]',
  133
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Escarlata (Camila Perez)', null,
  'Líder verdadeira do culto Os Couraças — ex-bailarina que descobriu prazer em ser desejada por múltiplas pessoas; ao vestir uma das Armaduras de Guevara, ganhou poder de sedução/dominação absoluto sobre seus "asseclas". Traída pelo marido Tadeo, o transformou em Torvo — uma fonte viva de componentes ritualísticos. Nota de extração: o VD dela não aparece explícito no trecho processado (a ficha segue direto da descrição sem o cabeçalho "— VD N" — provável falha de OCR/diagramação); os demais membros do culto vão de VD 20 a 100, então provavelmente fica na faixa 120-160, mas não confirmado no texto.',
  'Médio', '+4d20+10', '+3d20+10', 28, '+2d20+5', '+3d20+5', '+4d20+10', 100, 50, 'Balístico, impacto, perfuração 5, Sangue 10', 'Morte',
  '{"agi":3,"for":2,"int":3,"pre":4,"vig":2}', 'Atletismo +2d20+5, Enganação +4d20+10, Ocultismo +3d20+10', '9m | 6',
  '[{"nome":"Dar o Fora","descricao":"Quem já foi seduzido (habilidade Sedução) pode tentar terminar com ela — testa Vontade (DT 23 + penalidade de 1d8 ou 2d8 de Dominação); passando, os efeitos de Sedução terminam (perde os PE temporários, não afetado por Dominação); falhando, não consegue se livrar dos sentimentos e ainda fica na \"bad\" mental (1d6 dano mental, mais a cada nova tentativa falha)."},{"nome":"Rituais (DT 23)","descricao":"Conjura sem pagar PE, até 7 PE por conjuração."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Rasgar com Garras, corpo a corpo x2)","teste":"3d20+15, crítico 19","dano":"4d10+10 corte"},{"tipo":"Padrão","nome":"Dominação","descricao":"Ordem a um ser afetado por Sedução; testa Vontade DT 23 — falhando, obedece a ordem da melhor forma possível (se durar mais de 1 rodada, novo teste a cada rodada, +1 cumulativo por teste já feito); passando, anula esse uso; toda vez que falha o teste de resistência, rola 1d8 (\"um pouco a fim\") ou 2d8 (\"muito a fim\") e aplica o resultado como penalidade nesse teste de resistência."},{"tipo":"Padrão","nome":"Ritual Descarnar Discente (Sangue 2)","dano":"10d8 (metade corte/metade Sangue) + hemorragia (Fortitude DT 29 reduz à metade e evita; hemorragia = teste Fortitude DT 23 no início de cada turno, falhar = 4d8 Sangue, 2 sucessos seguidos estanca)","descricao":"Toque."},{"tipo":"Padrão","nome":"Ritual Flagelo de Sangue Discente (Sangue 2)","descricao":"Toque em ser (exceto criaturas de Sangue), grava marca com uma ordem (\"não ataque a mim/meus aliados\", \"siga-me\", \"não saia desta sala\"); dura até o fim da cena; a cada rodada que o alvo desobedece, a marca causa 10d6 dano de Sangue + enjoado 1 rodada (Fortitude DT 23 reduz o dano à metade e evita a condição); 2 sucessos seguidos faz a marca desaparecer."},{"tipo":"Padrão","nome":"Ritual Hemofagia Discente (Sangue 2)","dano":"+6d6 Sangue","descricao":"Ataque de garras como parte da execução; acertando, recupera PV = metade do dano total causado."},{"tipo":"Padrão","nome":"Sedução","descricao":"\"Você parece forte...\"; o alvo decide como se sente — não ficou a fim (nenhum efeito); ficou um pouco a fim (+1d8 PE temporários, mas suscetível a Dominação); ficou muito a fim (+2d8 PE temporários, mesma suscetibilidade); efeitos duram até o alvo usar Dar o Fora."}]',
  134
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Argano (Zacarías)', 100,
  'Rico e arrogante jogador de MMORPG que se apaixonou obsessivamente por Escarlata; usa uma armadura pesada de guerreiro medieval que ele mesmo criou/programou, virando seu "guardião" fanático.',
  'Médio', '-2d20', '+1d20+5', 26, '+4d20+10', '+1d20+5', '-2d20', 120, 60, 'Balístico, impacto, perfuração 5, Sangue 10', 'Morte',
  '{"agi":1,"for":4,"int":1,"pre":0,"vig":4}', 'Atletismo +4d20+10', '9m | 6',
  '[{"nome":"Guardião","descricao":"1x/rodada, se estiver em alcance curto de Escarlata, sofre um dano direcionado a ela (redireciona pra si)."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Maça Pesada, corpo a corpo)","teste":"4d20+15, crítico x3","dano":"4d8+20 perfuração"},{"tipo":"Padrão","nome":"Erguer Maça","descricao":"Não faz nada por si só, mas libera Golpe Arrasador."},{"tipo":"Padrão","nome":"Golpe Arrasador (após Erguer Maça)","dano":"4d12+20 perfuração (Fortitude DT 21 reduz à metade)","descricao":"Golpe de cima pra baixo num adjacente."},{"tipo":"Completa","nome":"Esmagar Ossos","dano":"4d10+20 perfuração + fraco por 1 dia (Reflexos DT 21 reduz à metade e evita a condição)","descricao":"Passa por cima de um ser em alcance curto usando o peso da armadura; só usável em alvo caído ou atordoado."}]',
  135
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Chispa', 100,
  'Mecânico mexicano que perdeu as pernas e o irmão num acidente de carro; reconstruiu-se com um triciclo motorizado alimentado por combustível paranormal, seduzido por Escarlata numa competição de corridas.',
  'Médio', '+1d20+10', '+3d20+5', 26, '+1d20+5', '+3d20+10', '+1d20+10', 90, 45, 'Balístico, impacto, perfuração 5, Sangue 10', 'Morte',
  '{"agi":3,"for":1,"int":4,"pre":1,"vig":1}', 'Pilotagem +3d20+10, Tecnologia +4d20+10', '15m | 10',
  '[{"nome":"Motor Frágil","descricao":"O motor traseiro do triciclo pode ser atacado separadamente — ataques contra ele sofrem -1d20 (alvo pequeno e em movimento constante); Defesa 26, RD 5, PV 20; destruído, explode em nuvem de fumaça, 4d6 dano (metade perfuração/metade fogo) em Chispa, que fica imóvel + desprevenido + perde Acelerar e Investida com Lança até consertar (1d4+1 horas)."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Tiro de Escopeta, distância curto)","teste":"3d20+15, crítico x3","dano":"6d6+20 balístico"},{"tipo":"Reação","nome":"Acelerar","descricao":"1x/rodada, esquiva com o triciclo: +5 Defesa e testes de resistência contra um ataque/efeito."},{"tipo":"Padrão","nome":"Granada Flamejante","dano":"6d6 fogo + em chamas (Reflexos DT 21 reduz à metade e evita)","descricao":"Dispositivo explosivo em alcance curto, 3m de raio."},{"tipo":"Completa","nome":"Investida com Lança","dano":"6d8+20 perfuração se trespassado","descricao":"Acelera até alvo em alcance médio pra atravessá-lo; alvo escolhe saltar pra fora (Reflexos DT 21 — passa e escapa; falha = trespassado) ou resistir (pode atacar/agir contra Chispa antes de ser trespassado — atacando, resolve o ataque normalmente e depois sofre o dano; tentando outra ação como subir no triciclo, testa perícia DT 21 — passando consegue o que queria mas ainda é trespassado; falhando, só é trespassado)."}]',
  136
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Miasma', 40,
  'Ex-estudante de medicina que descobriu prazer sádico em dissecação e depois em causar dor real; expulso de vários lugares por ultrapassar limites, encontrou em Escarlata uma figura que finalmente o dominou de volta.',
  'Médio', '+1d20', '+2d20+5', 18, '+2d20+5', '+2d20', '+1d20', 30, 15, null, null,
  '{"agi":2,"for":2,"int":1,"pre":1,"vig":2}', null, '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Golpe com Correntes, corpo a corpo)","teste":"2d20+5","dano":"2d8+5 impacto"},{"tipo":"Padrão","nome":"Despertar Obsessão","descricao":"Encara alguém em alcance curto — alvo escolhe desviar o olhar (Miasma dá correntada mesmo à distância: 2d8+5 dano de impacto) ou encarar (testa Vontade DT 25; passando, nada acontece; falhando, gasta 1 rodada de ações se aproximando de Escarlata pra adorá-la, ou — se recusar — deve atacar a si mesmo uma vez, encerrando o efeito)."}]',
  137
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Coruja (Cecília Clemm)', 40,
  'De família simples de Catalão-GO, do grupo Os Pássaros; cuidou da mãe doente na adolescência. Pesquisadora que trouxe rumos inesperados ao grupo com seus estudos de rituais.',
  'Médio', '+2d20+10', '+3d20+10', 19, '+0', '+3d20+10', '+2d20+5', 50, 25, null, null,
  '{"agi":3,"for":1,"int":3,"pre":2,"vig":1}', 'Adestramento +2d20+10, Atualidades +3d20+10, Ciências +3d20+10, Furtividade +3d20+10, Sobrevivência +3d20+10', '9m | 6',
  '[{"nome":"Validação de Hipótese","descricao":"Acerto crítico dá +1d10 em testes contra o mesmo alvo."},{"nome":"Rituais (DT 20)","descricao":"Conjura sem pagar PE, até 4 PE por conjuração."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Tiro de Zarabatana, distância curto)","teste":"3d20+10, crítico 19","dano":"1d4+1 perfuração + sedativo","descricao":"Dardos Sedativos: alvo atingido fica sedado/inconsciente até acordar ou fim da cena (Fortitude DT 20 evita)."},{"tipo":"Padrão","nome":"Ritual Aprimorar Físico (Sangue 2)","descricao":"Toque, alvo +1 Agilidade ou Força (à escolha dele) até o fim da cena."},{"tipo":"Padrão","nome":"Ritual Aprimorar Mente (Conhecimento 2)","descricao":"Toque, alvo +1 Intelecto ou Presença (à escolha dele) até o fim da cena."}]',
  138
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Corvo', 40,
  'Nascido em Recreio-RJ, do grupo Os Pássaros; ilusionista/ocultista discreto, ligado à morte simbolicamente mesmo em vida.',
  'Médio', '+2d20+10', '+3d20+10', 18, '+1d20+5', '+2d20+5', '+3d20+10', 60, 30, null, null,
  '{"agi":2,"for":1,"int":3,"pre":3,"vig":1}', 'Adestramento +3d20+10, Atualidades +3d20+10, Furtividade +3d20+10, Ocultismo +3d20+10, Sobrevivência +3d20+10', '9m | 6',
  '[{"nome":"Silêncio Fúnebre","descricao":"Quando morto, o corpo recebe 30 PV temporários e vira mau agouro — testes contra aliados de Corvo num raio de 30m do corpo sofrem -2d20; dura até o fim da cena ou os PV temporários zerarem."},{"nome":"Rituais (DT 20)","descricao":"Conjura sem pagar PE, até 4 PE por conjuração."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Pancada, corpo a corpo)","teste":"1d20+5","dano":"1d4+5 impacto"},{"tipo":"Livre","nome":"Ritual Esconder os Olhos (Conhecimento 1)","descricao":"Fica invisível 1 rodada (com equipamento), camuflagem total + 15 Furtividade; termina ao atacar/usar habilidade hostil."},{"tipo":"Padrão","nome":"Ritual Cicatrização Discente (Morte 1)","descricao":"Adjacente recupera 5d8+5 PV, envelhece 1 ano."},{"tipo":"Padrão","nome":"Ritual Definhar Discente (Morte 1)","descricao":"Rajada de cinzas em alvo de alcance curto: exausto até o fim da cena (Fortitude DT 15 reduz pra fatigado)."},{"tipo":"Padrão","nome":"Ritual Tecer Ilusão Discente (Conhecimento 1)","descricao":"Ilusão em alcance médio, até 8 cubos de 1,5m, até o fim da cena; visual/sonora/tátil/térmica/olfativa simples (sem sons complexos como música/diálogo); dissipa se sair do alcance."}]',
  139
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Papagaio (Rogério José)', 40,
  'Nascido e criado no Rio de Janeiro, do grupo Os Pássaros; carismático líder de fato do grupo, guiava com palavras e conexões.',
  'Médio', '+3d20+10', '+2d20+10', 21, '+1d20+5', '+2d20+5', '+3d20+10', 60, 30, null, null,
  '{"agi":2,"for":2,"int":1,"pre":3,"vig":2}', 'Adestramento +3d20+10, Artes +3d20+5, Crime +2d20+10, Diplomacia +3d20+10, Enganação +3d20+10', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Garrafada, corpo a corpo x2)","teste":"2d20+10","dano":"1d4+10 impacto"},{"tipo":"Padrão","nome":"Cachimbo do Capeta","descricao":"Sopra fumaça num adjacente: asfixiado, gasta ação padrão pra recuperar o fôlego (Fortitude DT 20 evita)."},{"tipo":"Livre","nome":"Desarmar","teste":"2d20+15","descricao":"Acertando ataque de garrafa, tenta desarmar o alvo."}]',
  140
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Pomba', 40,
  'Cartógrafa/navegadora do grupo Os Pássaros, desenhava mapas com cuidado extremo pra garantir que ninguém se perdesse.',
  'Médio', '+2d20+10', '+2d20+5', 20, '+2d20+5', '+2d20+5', '+2d20+10', 50, 25, null, null,
  '{"agi":2,"for":1,"int":3,"pre":3,"vig":1}', 'Percepção +2d20+10, Intuição +2d20+10, Atletismo +1d20+15, Investigação +2d20+10, Sobrevivência +2d20+5, Pilotagem +2d20+5, Furtividade +2d20+5, Ciências +2d20+10', '9m | 6',
  '[{"nome":"Ensinamentos do Ninho","descricao":"Ao presenciar a morte de um aliado, até o fim da cena pode usar qualquer habilidade conhecida por ele 1x."},{"nome":"Voe para Longe","descricao":"Na 1ª rodada de combate, pode se mover até o dobro do deslocamento com uma única ação de movimento."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Canivete, corpo a corpo x2)","teste":"2d20+10","dano":"1d4+5 corte"}]',
  141
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Harpia (Santiago Luis Borges)', 80,
  'Uruguaio de origem humilde, do grupo Os Pássaros, treinado em colégio militar; adestrador de aves de rapina, o "músculo" tático do grupo.',
  'Médio', '+2d20+10', '+3d20+10', 22, '+3d20+10', '+3d20+10', '+2d20+5', 100, 50, null, null,
  '{"agi":3,"for":3,"int":2,"pre":2,"vig":3}', 'Adestramento +2d20+10, Atletismo +3d20+10, Furtividade +3d20+10, Sobrevivência +2d20+10, Tática +2d20+10', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Garra do Harpia, corpo a corpo x2)","teste":"3d20+10, crítico 19","dano":"2d8+10 corte"},{"tipo":"Padrão","nome":"Agredir (Pistola, distância x2 curto)","teste":"3d20+10, crítico 18","dano":"1d12+10 balístico"},{"tipo":"Livre","nome":"Agarrar","teste":"3d20+15","descricao":"Acertando garra, tenta agarrar."},{"tipo":"Livre","nome":"Assobio do Harpia","descricao":"1x/rodada, aves adestradas avançam num alvo em alcance longo — escolhe um efeito: Cegar (3d6 dano de perfuração + cego 1 rodada, Reflexos DT 20 reduz à metade e evita); Distrair (pasmo 1 rodada, Vontade DT 20 evita, só 1x/cena por alvo); Sangrar (5d6 dano de perfuração + sangrando, Fortitude DT 20 reduz à metade e evita)."}]',
  142
),
(
  (select id from sources where slug = 'arquivos_secretos_03'), 'mundana', 'Pessoa', 'Suellen', 20,
  'Antagonista ligada à história de Os Pássaros — cria dependência através de prazer/hedonismo induzido; usa "matrizes" (mães mantidas em cativeiro) pra fins não detalhados nesta extração.',
  'Médio', '+2d20+5', '+1d20+5', 15, '+2d20+5', '+2d20+5', '+2d20+5', 30, 15, null, null,
  '{"agi":1,"for":2,"int":2,"pre":2,"vig":2}', 'Adestramento +2d20+10, Atualidades +2d20+10, Enganação +2d20+10', '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Agredir (Golpe com Cutelo, corpo a corpo)","teste":"2d20+5","dano":"1d8+5 corte"},{"tipo":"Padrão","nome":"Estimular Hedonismo","descricao":"Pessoa em alcance curto tomada por onda de prazer insano; Vontade DT 20 evita; falhando, todos os sentidos/alertas biológicos (reflexo de urgência, dor) só transmitem prazer/euforia — perde autopreservação, fica indefeso 1 rodada."}]',
  143
);


-- ===================== 0048_bestiario_as04.sql =====================

-- Bestiário Arquivos Secretos 04 — "O Anfitrião" (jogo/game show paranormal): NPCs
-- Produtor e Diretor + a criatura de Energia Simulacro (4 estágios de evolução:
-- Troyan, Krypto, Vvorm, Botnetz). PDF-fonte é rascunho com trechos placeholder —
-- só o mecanicamente completo foi catalogado.

insert into creatures (source_id, categoria, tipo_criatura, name, vd, flavor_text, tamanho, percepcao, iniciativa, defesa, fortitude, reflexos, vontade, pv_maximo, pv_machucado, atributos, pericias, deslocamento, habilidades, acoes, sort_order)
values
(
  (select id from sources where slug = 'arquivos_secretos_04'), 'mundana', 'Pessoa', 'Produtor', 80,
  'NPC do Jogo do Anfitrião.',
  'Médio', '+1d20+5', '+2d20+10', 20, '+3d20+10', '+2d20+10', '+1d20+5', 100, 50,
  '{"agi":2,"for":2,"int":2,"pre":1,"vig":3}', 'Atletismo +2d20+10, Crime +2d20+10, Ocultismo +2d20+5', '9m | 6',
  '[{"nome":"Item — Martelo Meteoro USB","descricao":"Arma corpo a corpo alcance 6m, +2 manobras de combate, dano impacto ou Energia à escolha."},{"nome":"Máscara de Gás","descricao":"+10 Fortitude vs. respiração."},{"nome":"Rituais (DT 20)","descricao":"Grátis até 6 PE/conjuração."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Martelo, corpo a corpo x2)","teste":"2d20+10, crítico x3","dano":"1d12+10 impacto/Energia"},{"tipo":"Padrão","nome":"Ritual Chamas do Caos (Energia 2)","descricao":"Escolhe efeito (comum: Chamejar, arma +1d6 fogo)."},{"tipo":"Padrão","nome":"Ritual Eletrocussão Discente (Energia 1)","dano":"6d6 Energia (Fortitude reduz à metade)","descricao":"Linha 30m."},{"tipo":"Padrão","nome":"Ritual Tela de Ruído Discente (Energia 2)","descricao":"60 PV temporários (só vs. balístico/corte/impacto/perfuração) até fim da cena, ou reação pra RD 30 num único dano; 3x/cena."}]',
  144
),
(
  (select id from sources where slug = 'arquivos_secretos_04'), 'mundana', 'Pessoa', 'Diretor', 200,
  'NPC do Jogo do Anfitrião.',
  'Médio', '+4d20+15', '+3d20+10', 28, '+3d20+15', '+3d20+10', '+4d20+15', 280, 140,
  '{"agi":3,"for":3,"int":3,"pre":4,"vig":3}', 'Atletismo +3d20+15, Crime +3d20+10, Enganação +4d20+15, Intimidação +4d20+15, Ocultismo +3d20+10, Tecnologia +3d20+10', '9m | 6',
  '[{"nome":"Máscara de Gás","descricao":"Mesma regra do Produtor."},{"nome":"Rituais (DT 29)","descricao":"Grátis até 10 PE/conjuração."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Murro Eletrificado, corpo a corpo x3)","teste":"3d20+20","dano":"4d8+20 eletricidade"},{"tipo":"Padrão","nome":"Agredir (Carga Eletrificada, distância x3 curto)","teste":"3d20+20","dano":"4d8+20 eletricidade"},{"tipo":"Padrão","nome":"Ritual Coincidência Forçada Verdadeiro (Energia 1)","descricao":"Aliados em alcance curto +5 perícias até fim da cena."},{"tipo":"Padrão","nome":"Ritual Dissonância Acústica (Energia 2)","descricao":"Esfera 6m raio, alcance médio; alvos ficam surdos + sem conjurar rituais."},{"tipo":"Padrão","nome":"Ritual Eletrocussão Verdadeiro (Energia 1)","dano":"8d6 Energia em cada ser escolhido em alcance curto (Fortitude reduz à metade)"},{"tipo":"Padrão","nome":"Ritual Salto Fantasma (Energia 3)","descricao":"Teleporte alcance médio, sem precisar de linha de visão (só já ter visto o local)."},{"tipo":"Padrão","nome":"Ritual Tela de Ruído Discente (Energia 2)","descricao":"Mesma de Produtor."}]',
  145
);

insert into creatures (source_id, categoria, name, vd, flavor_text, descritores, tamanho, presenca_dt, presenca_dano, presenca_nex_imune, percepcao, iniciativa, defesa, fortitude, reflexos, vontade, pv_maximo, pv_machucado, resistencias, vulnerabilidades, atributos, deslocamento, habilidades, acoes, sort_order)
values
(
  (select id from sources where slug = 'arquivos_secretos_04'), 'paranormal', 'Simulacro (Troyan)', 32,
  'Consciências de vítimas do Jogo do Anfitrião presas em telas; evolui em 4 estágios (Troyan → Krypto → Vvorm → Botnetz).',
  '{Energia,Conhecimento}', 'Minúsculo', 15, '2d6 mental', 30, '1d20+5', '1d20+5', 10, '1d20+5', '1d20+5', '1d20+5', 70, 35, 'Dano (exceto Conhecimento)', 'Conhecimento',
  '{"agi":1,"for":null,"int":1,"pre":1,"vig":1}', '0m | 0',
  '[{"nome":"Intangibilidade Digital","descricao":"Incorpóreo, só afetado por Conhecimento; perceber exige Ocultismo DT 4d10."},{"nome":"Exorcismo Digital","descricao":"2+ personagens treinados em Ocultismo/Religião fazem liturgia (teste estendido Ocultismo DT 4d10, 3 sucessos) pra prender o simulacro num objeto analógico (precisa de sigilos de Conhecimento escritos em raio de 9m e nenhum outro aparelho ligado no raio); destruir o objeto o destrói. Falha total = escapa pra internet."}]',
  '[{"tipo":"Movimento","nome":"Saltar","descricao":"Teleporta pra aparelho eletrônico em alcance curto."},{"tipo":"Padrão","nome":"Perturbação Digital","dano":"2d6 mental (Vontade DT 3d10 reduz à metade)","descricao":"Pessoa olhando pra tela; enlouquecer = 50% morre, 50% é levado ao Jogo do Anfitrião (Sanidade 1)."}]',
  146
),
(
  (select id from sources where slug = 'arquivos_secretos_04'), 'paranormal', 'Simulacro (Krypto)', 64,
  'Evolução do Simulacro — 2º estágio.',
  '{Energia,Conhecimento}', 'Pequeno', 15, '2d6 mental', 30, '1d20+10', '1d20+10', 20, '1d20+10', '1d20+10', '1d20+10', 100, 50, 'Dano (exceto Conhecimento)', 'Conhecimento',
  '{"agi":1,"for":null,"int":1,"pre":1,"vig":1}', '0m | 0',
  '[{"nome":"Intangibilidade Digital","descricao":"Mesma regra do Troyan."},{"nome":"Exorcismo Digital","descricao":"Mesma regra do Troyan."}]',
  '[{"tipo":"Movimento","nome":"Saltar","descricao":"Teleporta pra aparelho eletrônico em alcance médio."},{"tipo":"Padrão","nome":"Perturbação Digital","dano":"3d6 mental (Vontade DT 4d10 reduz à metade)","descricao":"Até 2 pessoas olhando pra tela."}]',
  147
),
(
  (select id from sources where slug = 'arquivos_secretos_04'), 'paranormal', 'Simulacro (Vvorm)', 128,
  'Evolução do Simulacro — 3º estágio.',
  '{Energia,Conhecimento}', 'Médio', 15, '2d6 mental', 30, '2d20+15', '2d20+15', 30, '2d20+15', '2d20+15', '2d20+15', 200, 100, 'Dano (exceto Conhecimento)', 'Conhecimento',
  '{"agi":2,"for":null,"int":2,"pre":2,"vig":2}', '0m | 0',
  '[{"nome":"Intangibilidade Digital","descricao":"Mesma regra do Troyan."},{"nome":"Exorcismo Digital","descricao":"Mesma regra do Troyan."}]',
  '[{"tipo":"Movimento","nome":"Saltar","descricao":"Teleporta pra aparelho eletrônico em alcance longo."},{"tipo":"Padrão","nome":"Perturbação Digital","dano":"4d6 mental (Vontade DT 5d10 reduz à metade)","descricao":"Até 3 pessoas olhando pra tela."}]',
  148
),
(
  (select id from sources where slug = 'arquivos_secretos_04'), 'paranormal', 'Simulacro (Botnetz)', 256,
  'Evolução final do Simulacro — 4º estágio.',
  '{Energia,Conhecimento}', 'Grande', 15, '2d6 mental', 30, '3d20+20', '3d20+20', 40, '3d20+20', '3d20+20', '3d20+20', 500, 250, 'Dano (exceto Conhecimento)', 'Conhecimento',
  '{"agi":3,"for":null,"int":3,"pre":3,"vig":3}', '0m | 0',
  '[{"nome":"Intangibilidade Digital","descricao":"Mesma regra do Troyan."},{"nome":"Exorcismo Digital","descricao":"Mesma regra do Troyan."}]',
  '[{"tipo":"Movimento","nome":"Saltar","descricao":"Teleporta pra aparelho eletrônico em alcance extremo."},{"tipo":"Padrão","nome":"Perturbação Digital","dano":"6d8 mental (Vontade DT 6d10 reduz à metade)","descricao":"Até 4 pessoas olhando pra tela."}]',
  149
);


-- ===================== 0049_bestiario_as05.sql =====================

-- Bestiário Arquivos Secretos 05 — Os Alheios (criaturas de Transmissão, elemento
-- combinado Energia+Conhemento, tema TV Varminho): Hospedeiro Parasitado/Aflorado,
-- Interflorado, Fummu, Doppelganger (3 variantes), Bilu, Rastropoda, Memoflígico.

insert into creatures (source_id, categoria, name, vd, flavor_text, descritores, tamanho, presenca_dt, presenca_dano, presenca_nex_imune, percepcao, iniciativa, defesa, fortitude, reflexos, vontade, pv_maximo, pv_machucado, resistencias, vulnerabilidades, atributos, pericias, deslocamento, habilidades, acoes, sort_order)
values
(
  (select id from sources where slug = 'arquivos_secretos_05'), 'paranormal', 'Hospedeiro Parasitado', 20,
  'Pessoa infectada por um Interflorado — sangue vira plasma verde, dificuldade com cores, pisca um olho por vez. Expelir o parasita sem sofrer dano exige choque térmico forte (aquecer + água gelada); aí "afloroa" e vira um Hospedeiro Aflorado. 4 variantes possíveis: Acólito (INT/PRE 2, Ocultismo/Percepção/Religião/Vontade 2d20+5, conjura 2 rituais de 1º círculo grátis até 3 PE, DT 15); Faz-Tudo (+1 em 2 atributos, +5 em 4 perícias escolhidas, 1 perícia rola 2x e fica com o melhor resultado); Guerrilheiro (AGI/FOR/VIG 2, PV 20/10, Atletismo/Fortitude/Iniciativa/Reflexos 2d20+5, pancada 2d20+10/1d4+10, pistola 2d20+10/1d12+10); Socorrista (INT/PRE 2, Medicina/Percepção/Vontade 2d20+5, 1x/cena cura 1d8+1 PV).',
  '{Energia,Conhecimento}', 'Médio', null, null, null, '+1d20+5', '+1d20+5', 15, '+1d20+5', '+1d20+5', '+1d20+5', 10, 5, null, null,
  '{"agi":1,"for":1,"int":1,"pre":1,"vig":1}', null, '9m | 6',
  '[{"nome":"Parasitado","descricao":"Infectado por interflorado; ver flavor_text pra variantes disponíveis (Acólito, Faz-Tudo, Guerrilheiro, Socorrista)."}]',
  '[{"tipo":"Padrão","nome":"Pancada, corpo a corpo","teste":"1d20+5","dano":"1d4+5 impacto"}]',
  150
),
(
  (select id from sources where slug = 'arquivos_secretos_05'), 'paranormal', 'Hospedeiro Aflorado', 60,
  'Estágio seguinte do Hospedeiro Parasitado, após "aflorar".',
  '{Energia,Conhecimento}', 'Médio', 19, '3d6 mental', 35, '2d20 (Percepção às Cegas, Visão no Escuro)', '2d20+5', 25, '3d20+10', '2d20+5', '2d20', 100, 50, 'Balístico, corte, impacto e perfuração 5, Conhecimento/Energia/químico 10', 'Fogo, frio e Sangue',
  '{"agi":2,"for":2,"int":1,"pre":2,"vig":3}', null, '9m | 6',
  '[]',
  '[{"tipo":"Padrão","nome":"Pancada, corpo a corpo x2","teste":"2d20+10","dano":"1d6+5 impacto + 2d6 químico"},{"tipo":"Movimento","nome":"Disparada Errante","descricao":"2x deslocamento, Acrobacia DT 20 ou cai."},{"tipo":"Padrão","nome":"Guinchou Gutural","dano":"5d10 (metade Conhecimento/metade Energia)","descricao":"9m raio; tapar ouvidos = metade dano + surdo 1 rodada; não tapar = dano cheio + surdo 1d4+1 rodadas."}]',
  151
),
(
  (select id from sources where slug = 'arquivos_secretos_05'), 'paranormal', 'Interflorado', 40,
  'Forma que incuba dentro de hospedeiros e os transforma.',
  '{Energia,Conhecimento}', 'Pequeno', 15, '2d8 mental', 30, '+1d20+5 (Visão no Escuro)', '2d20+5', 19, '+0', '2d20+5', '+1d20+5', 70, 35, 'Balístico, corte, impacto e perfuração 5, Conhecimento/Energia/químico 10', 'Fogo, frio e Sangue',
  '{"agi":2,"for":2,"int":1,"pre":1,"vig":null}', 'Acrobacia/Atletismo 2d20+5, Furtividade 2d20+10', null,
  '[]',
  '[{"tipo":"Movimento","nome":"Contorcer Perturbador","dano":"2d8 mental + apavorado + trêmulo (Vontade DT 15 reduz à metade/evita, mas fica abalado)","descricao":"Imune 1 dia se passar."},{"tipo":"Padrão","nome":"Guincho Gutural","descricao":"Igual ao do Aflorado."},{"tipo":"Completa","nome":"Incubar","descricao":"Após 1 dia num hospedeiro, 1x/dia, incuba 1 ovo (máx 2d4/hospedeiro, -1d6 Sanidade máx permanente por ovo); estourar mata o hospedeiro, gera novos interflorados."},{"tipo":"Completa","nome":"Investida Sufocante","teste":"2d20+10","descricao":"2x deslocamento + agarrar; vitorioso deixa o alvo agarrado/cego/surdo/asfixiado; inconsciente = vira Hospedeiro Parasitado."}]',
  152
),
(
  (select id from sources where slug = 'arquivos_secretos_05'), 'paranormal', 'Fummu', 100,
  'Criatura de Transmissão dos Alheios.',
  '{Energia,Conhecimento}', 'Médio', 21, '4d6 mental', 45, '2d20+5 (Visão no Escuro)', '3d20+10', 25, '2d20', '3d20+10', '2d20+5', 200, 100, 'Balístico, corte, impacto e perfuração 10, Conhecimento/Energia/químico 20; imune a fogo', 'Sangue',
  '{"agi":3,"for":2,"int":2,"pre":2,"vig":2}', 'Atletismo 2d20+10, Furtividade 3d20+10', null,
  '[{"nome":"Camuflagem Alheia","descricao":"Invisível, +15 Furtividade vs. ouvir, quem não vê fica desprevenido; +2d20 ataques vs. não-cegos (cegos -5 Defesa); perde invisibilidade em gás/fumaça (fica camuflagem leve)."},{"nome":"Chamas Ferventes","descricao":"Quem agarra sofre 2d10 fogo/rodada."}]',
  '[{"tipo":"Padrão","nome":"Toque Ácido, corpo a corpo x2","teste":"3d20+15","dano":"2d10+10 químico"},{"tipo":"Movimento","nome":"Cintilação Estelar","descricao":"1x/rodada se não agarrado, teleporta 9m."},{"tipo":"Padrão","nome":"Acionar Explosão","dano":"Minúsculo = 2d6 fogo + chamas raio 3m, +2d6/+1,5m por categoria de tamanho acima","descricao":"Combustão de objeto inflamável em alcance médio."},{"tipo":"Padrão","nome":"Chama Viridente","dano":"4d10+20 fogo + chamas (Reflexos DT 21 reduz à metade/evita)","descricao":"1 ser em alcance médio."}]',
  153
),
(
  (select id from sources where slug = 'arquivos_secretos_05'), 'paranormal', 'Doppelganger (Civil)', 20,
  'Um dos Alheios disfarçado de humano — 3 variantes de "nível" (Civil, Combatente, Cultista) + uma forma Monstruosa que qualquer um pode assumir quando ameaçado. "Somos Todos Um": sabem a localização uns dos outros, sacrificam-se pelo objetivo comum. Assumir Forma Monstruosa (ação): +10 PV, +2 Defesa, +5 testes, +5 dano, +2 DT.',
  '{Energia,Conhecimento}', 'Médio', null, null, null, '2d20+5', '+0', 14, null, null, null, 14, 7, null, null,
  '{"agi":1,"for":1,"int":3,"pre":2,"vig":1}', null, null,
  '[{"nome":"Disfarce Alheio","descricao":"Enganação: rola 2x e fica com o melhor resultado."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Pancada, corpo a corpo)","teste":"1d20+5","dano":"1d4+2 impacto"},{"tipo":"Padrão","nome":"Agredir (Pistola Plasma, distância)","teste":"1d20+5, crítico 18","dano":"2d6+2 Energia"}]',
  154
),
(
  (select id from sources where slug = 'arquivos_secretos_05'), 'paranormal', 'Doppelganger (Combatente)', 60,
  'Variante de combate do Doppelganger.',
  '{Energia,Conhecimento}', 'Médio', null, null, null, '2d20+5', '2d20+5', 19, null, null, null, 70, 35, null, null,
  '{"agi":2,"for":2,"int":3,"pre":2,"vig":1}', null, null,
  '[{"nome":"Close Quarter Combat","descricao":"+1d20 ataque corpo a corpo e manobras; mira/recarrega/saca como ação livre."},{"nome":"Especialista em Manobras","descricao":"Agarrar/derrubar/desarmar como ação livre (Teste 2d20+12)."}]',
  '[{"tipo":"Padrão","nome":"Agredir (Pancada, corpo a corpo x2)","teste":"2d20+10","dano":"1d10+5 impacto"},{"tipo":"Padrão","nome":"Agredir (Pistola, distância x2)","teste":"2d20+10, crítico 18","dano":"2d6+5 Energia"},{"tipo":"Reação","nome":"Proteger","descricao":"Vira alvo no lugar de aliado adjacente."}]',
  155
),
(
  (select id from sources where slug = 'arquivos_secretos_05'), 'paranormal', 'Doppelganger (Cultista)', 160,
  'Variante ritualística do Doppelganger.',
  '{Energia,Conhecimento}', 'Médio', null, null, null, '4d20+10', '3d20+10', 28, null, null, null, 240, 120, null, null,
  '{"agi":3,"for":2,"int":3,"pre":4,"vig":2}', null, null,
  '[{"nome":"Rituais (DT 23)","descricao":"Grátis até 6 PE por conjuração."}]',
  '[{"tipo":"Padrão","nome":"Ritual Enfeitiçar (Conhecimento 1)","descricao":"Vontade anula, alvo prestativo pela cena, doppelganger +10 Diplomacia; versão Discente = sugestão de ação."},{"tipo":"Padrão","nome":"Ritual Invadir Mente Discente (Conhecimento 2)","descricao":"Rajada 10d6 + atordoado 1 rodada, ou Ligação Telepática por 1 dia."},{"tipo":"Padrão","nome":"Ritual Perturbação Discente (Conhecimento 1)","descricao":"Ordem — Fuja/Largue/Pare/Sente-se/Venha/Sofra (Sofra = 3d8 + abalado)."},{"tipo":"Padrão","nome":"Ritual Tela de Ruído Discente (Energia 1)","descricao":"60 PV temporários vs. físico, ou reação para RD 30; 3x/cena."}]',
  156
),
(
  (select id from sources where slug = 'arquivos_secretos_05'), 'paranormal', 'Bilu', 42,
  'Alheio não-hostil, mas causa dano quando ameaçado ou assustado.',
  '{Energia,Conhecimento}', 'Médio', 15, '1d4 mental', 30, '3d20+10', '3d20+10', 12, null, null, null, 42, 21, 'Balístico, corte, impacto e perfuração 5, Conhecimento/Energia/químico 10', 'Sangue',
  '{"agi":3,"for":2,"int":3,"pre":4,"vig":2}', 'Artes, Ciências, Furtividade, Ocultismo, Religião e Tecnologia 3d20+10', null,
  '[]',
  '[{"tipo":"Reação","nome":"Até Breve","descricao":"Machucado = teleporta extradimensional (mestre decide retorno)."},{"tipo":"Reação","nome":"Embaralhamento Mental","dano":"4d10 mental + esmorecido (Vontade DT 20 reduz à metade/muda pra frustrado)","descricao":"Se ameaçado."},{"tipo":"Movimento","nome":"Comer Cimento","descricao":"Cura 10 PV."},{"tipo":"Movimento","nome":"Salto pra Frente","dano":"1ª revelação: 4d4 mental + abalado (Vontade DT 15)","descricao":"12m."},{"tipo":"Padrão","nome":"Fala Enigmática","dano":"3d6 mental + frustrado (Vontade DT 15)","descricao":"1 pessoa."},{"tipo":"Padrão","nome":"Luz Própria","descricao":"Liga/desliga eletrônicos num raio de 9m, ou emite luz verde."}]',
  157
),
(
  (select id from sources where slug = 'arquivos_secretos_05'), 'paranormal', 'Rastropoda', 140,
  'Criatura de Transmissão dos Alheios.',
  '{Energia,Conhecimento}', 'Médio', 24, '4d8 mental', 70, '3d20+10', '2d20+5', 31, null, null, null, 200, 100, 'Balístico, corte, impacto e perfuração 10, Conhecimento/Energia/fogo/químico 20; imune a gases', 'Sangue',
  '{"agi":2,"for":2,"int":1,"pre":3,"vig":4}', null, null,
  '[{"nome":"Camuflagem Alheia","descricao":"Igual ao Fummu, mas fica visível em câmeras — tenta destruí-las."}]',
  '[{"tipo":"Padrão","nome":"Toque Ácido, corpo a corpo x2","teste":"2d20+15","dano":"5d8+15 químico"},{"tipo":"Padrão","nome":"Gosma Plasmática, distância x2 curto","teste":"2d20+15","dano":"4d10+15 Energia"},{"tipo":"Livre","nome":"Agarrão Corrosivo","teste":"2d20+17","dano":"2d10 químico/rodada"},{"tipo":"Livre","nome":"Rastro Pestilento","dano":"2d10 químico/rodada em quem toca"},{"tipo":"Movimento","nome":"Rastro Deslizante","descricao":"2x deslocamento em linha reta."},{"tipo":"Padrão","nome":"Fumocinese","dano":"4d8 dano de Sanidade + confuso (Fortitude DT 24)","descricao":"Absorve gás num raio de 9m, libera alucinógeno."},{"tipo":"Padrão","nome":"Telecinese de Plasma","descricao":"Move alvo Médio ou menor 6m/rodada (Vontade DT 24 anula)."}]',
  158
),
(
  (select id from sources where slug = 'arquivos_secretos_05'), 'paranormal', 'Memoflígico', 200,
  'Criatura de Transmissão dos Alheios.',
  '{Energia,Conhecimento}', 'Médio', 29, '6d6 mental', 130, '4d20+15', '3d20+15', 38, null, null, null, 400, 200, 'Balístico, corte, impacto e perfuração 10, Conhecimento/Energia 20', 'Sangue',
  '{"agi":3,"for":null,"int":3,"pre":4,"vig":2}', null, null,
  '[{"nome":"Camuflagem Alheia + Incorpóreo","descricao":"Só é afetado por dano paranormal."},{"nome":"Círculo de Transmissão","descricao":"Num raio de 10m de eletrônicos ligados, remove sua invisibilidade/incorporeidade."}]',
  '[{"tipo":"Padrão","nome":"Toque Psicônico / Raio Psicônico (distância curto), ambos x2","teste":"3d20+25","dano":"6d6 mental"},{"tipo":"Movimento","nome":"Teletransporte Psicônico","descricao":"18m, se incorpóreo e invisível."},{"tipo":"Padrão","nome":"Manipulação Psicônica","dano":"6d6 mental base (Vontade DT 29) + condição escolhida","descricao":"Escolhe efeito: Abater Mente (alquebrado), Afetar Sentidos (cego + surdo), Causar Pesadelo (apavorado), Confundir Sinapses (confuso), Comunicação Alheia (1d6 só), Destruir Ânimos (esmorecido), Fazer Alianças (pasmo), Ler Pensamentos (-5 Vontade contra outros efeitos dela)."}]',
  159
);
