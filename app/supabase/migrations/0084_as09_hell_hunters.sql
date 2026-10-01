-- Arquivos Secretos 09 (Hell Hunters), KAN-41/42/43.
-- Origens, poderes de combatente, trilhas Incursor e Piloto de Drone, 11 itens (10 com
-- imagem), aliados (os Hell Hunters e os 7 tipos de aliado drone), fichas dos Hell Hunters
-- no bestiario, regalias de veiculo, uso novo da pericia Tatica e dicas do mestre.
-- Imagens: servidas pelo proprio app em /conteudo/as09/ (pasta public do front).
-- O "O" do livro (glifo do d20) foi escrito como d20.

-- ===================== Estrutura nova =====================

insert into sources (slug, name, sort_order)
values ('arquivos_secretos_09', 'Arquivos Secretos 09', 11)
on conflict (slug) do nothing;

-- Imagem dos itens do catalogo e das criaturas (antes so itens criados na ficha tinham).
alter table equipment_items add column if not exists image_url text;
alter table creatures add column if not exists image_url text;

-- Aliados (OPRPG p. 171): bonus passivo + habilidade. Tipo "drone" sao os aliados drone do
-- Drone de Combate Tatico; cada modificacao do drone soma o efeito de outro tipo.
create table if not exists allies (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id),
  tipo text not null default 'pessoa' check (tipo in ('pessoa', 'drone')),
  name text not null,
  descricao text,
  bonus text not null,
  habilidade_nome text not null,
  habilidade text not null,
  image_url text,
  sort_order int not null default 0
);

alter table allies enable row level security;
drop policy if exists "allies: leitura pública" on allies;
create policy "allies: leitura pública" on allies for select using (true);

-- Aliado na ficha: entra pela aba Habilidades, como os poderes.
alter table character_abilities add column if not exists ally_id uuid references allies(id) on delete cascade;

-- ===================== Origens =====================

insert into origins (source_id, name, skill_1_id, skill_2_id, skills_text, power_name, power_description, description, sort_order)
values
((select id from sources where slug = 'arquivos_secretos_09'), 'Veterano de Conflito Armado',
 (select id from skills where name = 'Luta'), (select id from skills where name = 'Pontaria'), null,
 'Full Metal Jacket',
 'Independentemente da humanidade em seu interior, por fora você tem um metafórico invólucro duro como metal — nada vai te impedir de continuar socando ou apertando o gatilho. Quando faz um teste de Luta ou Pontaria com alguma penalidade, você pode gastar 2 PE para ignorar a penalidade nesse teste.',
 'Você já vivenciou muitos conflitos armados na sua vida. Seja participando de tiroteios como um membro da SWAT ou mesmo tendo vivido a sua juventude em zonas de conflito, isso marcou a sua forma de ver o mundo. A constante exposição à violência te tornou um sobrevivente calejado, capaz de suportar a dor e seguir em frente, mesmo que o peso dos amigos caídos pelo caminho fique ao seu lado.', 1),
((select id from sources where slug = 'arquivos_secretos_09'), 'Treinado pela Hell Hunters',
 null, null, 'Escolha entre Luta e Fortitude ou Pontaria e Reflexos',
 'Resistência do Treinamento',
 'O maior rendimento do seu treinamento foi a carga extra de resistência que você adquiriu para continuar na briga. Se escolheu treinamento em Luta e Fortitude, você recebe +2 PV no NEX 5% e +1 PV para cada 10% de NEX. Se escolheu treinamento em Pontaria e Reflexos, você recebe +1 PE no NEX 5% e +1 PE para cada 10% de NEX.',
 'Você foi treinado pela organização Hell Hunters no combate contra o paranormal. Foi árduo, doloroso, cruel, mas nenhuma outra organização poderia te preparar melhor.', 2);

-- ===================== Poderes de Combatente =====================

insert into class_powers (class_id, name, description, prerequisites, sort_order)
select (select id from classes where slug = 'combatente'), v.name, v.description, v.prereq, v.ord from (values
  ('Municiador Ambulante', 'Você se especializou em carregar munição das formas mais criativas e engenhosas possíveis. Você recebe uma nova ação de interlúdio: municiar. Prepare uma quantidade de pacotes de munição que está com você equivalente a 1d6 para cada ponto em Intelecto que tiver. Você pode carregar esses pacotes preparados sem que eles ocupem espaço.', 'Int 2', 41),
  ('Ripostar Ousado', 'Você tem um estilo de combate perigoso, afinal, quem não arrisca não petisca. Quando for alvo de um ataque corpo a corpo, mas antes de saber se foi atingido ou não, você pode gastar sua reação especial de defesa e 2 PE para usar esse poder e fazer um contra-ataque. Você recebe +5 na Defesa contra o ataque para o qual está reagindo. Se o atacante errar, você recebe +5 no teste de ataque ao contra-atacar.', 'Agi 2, treinado em Luta', 42),
  ('Tiro Intuitivo', 'Alguns preferem mirar, mas você prefere confiar nos seus instintos. Quando faz um ataque à distância sem fazer a ação mirar, você pode gastar 2 PE para receber +2 na margem de ameaça desse ataque.', 'Veterano em Pontaria', 43),
  ('Tática de Abordagem', E'Você prefere ir para a ação com um plano de abordagem. Você recebe uma nova ação de interlúdio: tática de abordagem. Você propõe um plano de como você e seus aliados vão lidar com uma ameaça específica futura (cena de combate, furtividade, perseguição ou similar, a critério do mestre). Em seguida, faz um teste de Tática (DT 10). Você recebe 1 dado de tática (d6) se passar no teste e +1 para cada 5 pontos acima da DT. Quando você e seu grupo estiverem lidando com a ameaça relacionada ao plano, você pode gastar dados de tática para:\n- Fornecer +1d6 em um teste;\n- Fornecer +1d6 pontos de dano extra em uma rolagem de dano;\n- Fornecer +1d6 pontos de cura extra em uma rolagem de cura.\nVocê pode gastar quantos dados de tática quiser como reação, inclusive acumulando-os. Além disso, eles podem ser gastos com você ou com qualquer aliado que participou do planejamento, independentemente da distância entre você e ele. Dados de tática não gastos são perdidos no início da próxima cena de interlúdio. Você só pode fazer essa ação de interlúdio uma vez por cena.', 'Int 1, veterano em Tática', 44)
) as v(name, description, prereq, ord);

-- ===================== Trilhas =====================

insert into class_tracks (class_id, slug, name, description, sort_order)
values
((select id from classes where slug = 'combatente'), 'incursor', 'Incursor',
 'Você treinou para invadir complexos, combater ameaças encasteladas entre paredes e escombros, além de realizar uma série de ações disruptivas para cumprir sua missão. Quando a precisão e velocidade tática são necessárias, é você quem é chamado!', 9),
((select id from classes where slug = 'especialista'), 'piloto_de_drone', 'Piloto de Drone',
 'Você é um expert em uso de drones para todo tipo de função. Conseguiu transformar o que muitos consideram um brinquedo em uma ferramenta.', 12);

insert into class_track_tiers (track_id, nex_percent, name, description)
select (select id from class_tracks where slug = 'incursor' and class_id = (select id from classes where slug = 'combatente')), v.nex, v.name, v.description from (values
  (10, 'CQB', 'Você treinou técnicas para usar suas armas de fogo em ambientes confinados e neutralizar ameaças ao mesmo tempo que evita baixas acidentais. Você recebe treinamento em Pontaria. Se já for treinado, em vez disso, recebe treinamento em Luta. Se já for treinado em ambas, alternativamente, recebe +2 nas duas perícias. Além disso, você pode gastar 1 PE para anular a penalidade de –5 em testes de Pontaria contra um alvo que esteja engajado em combate corpo a corpo.'),
  (40, 'Entrada Explosiva', 'Você aprendeu a utilizar explosivos de forma rápida e efetiva. Você recebe +5 em testes para implantar/utilizar explosivos (por exemplo, em testes de Tática para posicionar cargas de C4 ou em testes de ataque com granadas). Além disso, você pode gastar 1 PE para implantar uma mina antipessoal ou carga de arrombamento com uma ação de movimento, em vez de ação completa.'),
  (65, 'Proteger Reféns', 'Não basta tirar o civil do perigo iminente, é preciso levá-lo até uma área segura. Se estiver a até 3m de um refém que está protegendo e ele for alvo de qualquer efeito negativo, você pode gastar 2 PE como reação para se tornar o alvo do efeito negativo, no lugar do refém. Se o efeito negativo for dano, você também pode gastar 2 PE para reduzir o dano que vai sofrer à metade. Você consegue usar essa habilidade várias vezes por rodada, mas apenas com até três reféns diferentes.'),
  (99, 'Alvo-prioritário', 'Com a experiência do campo de batalha você aprendeu a identificar as ameaças e eliminá-las antes que seja tarde. Sempre que um inimigo estiver na sua linha de visão, o mestre deve informar qual o VD dele. Você pode gastar 5 PE para determinar um inimigo que possa ver como alvo-prioritário. Se ele tiver VD 200 ou menos, qualquer dano que você causar nele imediatamente reduz os PV dele para 0. Se ele tiver VD 201 ou mais, você recebe +5 nas margens de ameaça contra ele. Esses efeitos duram até o inimigo ser eliminado ou até você determinar outro inimigo como alvo-prioritário.')
) as v(nex, name, description);

insert into class_track_tiers (track_id, nex_percent, name, description)
select (select id from class_tracks where slug = 'piloto_de_drone' and class_id = (select id from classes where slug = 'especialista')), v.nex, v.name, v.description from (values
  (10, 'Companheiro Drone', 'Você recebe um drone de combate tático como companheiro. Ele segue as regras de aliados (OPRPG, p. 170) de um tipo à sua escolha entre as opções descritas no item. Se o seu drone se quebrar, você pode gastar 1 ação de interlúdio para consertá-lo (precisa ter as peças quebradas) ou 2 ações para adquirir um novo.'),
  (40, 'Protetor dos Drones', 'Você pode aplicar uma modificação no seu drone. Ela não conta para o limite de categoria de itens. Além disso, quando seu drone sofre um efeito negativo (como dano ou algo similar narrativamente), você pode gastar 3 PE para evitar que ele sofra o efeito.'),
  (65, 'Ás dos Drones', 'Você pode aplicar duas modificações no seu drone (para um total de 3 modificações). Elas não contam para o limite de categoria de itens. Além disso, você domina o uso de drones como poucos. Quando falhar em um teste feito a partir do uso de um drone, você pode gastar 3 PE para tentar novamente, mas apenas mais uma vez.'),
  (99, 'Mestre dos Drones', 'Você pode aplicar três modificações no seu drone (para um total de 6 modificações). Elas não contam para o limite de categoria de itens. Alternativamente, você pode receber um segundo drone com 3 modificações. Além disso, o custo em PE para evitar que seu drone sofra um efeito negativo é reduzido para apenas 1 PE.')
) as v(nex, name, description);

-- ===================== Itens =====================

insert into equipment_items (source_id, type, name, category, spaces, description, stats, image_url)
values
((select id from sources where slug = 'arquivos_secretos_09'), 'geral', 'Aríete Portátil', 'I', 2,
 'Item operacional. Um cilindro pesado de aço, dotado de empunhaduras laterais, usado para romper portas, fechaduras e barricadas pela força bruta. Empunhar esse item operacional exige as duas mãos. Quando fizer um teste para arrombar um objeto usando o aríete portátil, você recebe +10 nesse teste.',
 '{}', '/conteudo/as09/itens/ariete-portatil.webp'),
((select id from sources where slug = 'arquivos_secretos_09'), 'protecao', 'Capacete Tático', 'II', 1,
 'Proteção especial, produzida com liga leve, feita para garantir a segurança do crânio. Esse capacete é um item vestido do tipo proteção pesada. Você recebe 25% de chance (1 em 1d4) de ignorar o dano adicional de um acerto crítico ou ataque furtivo.',
 '{}', '/conteudo/as09/itens/capacete-tatico.webp'),
((select id from sources where slug = 'arquivos_secretos_09'), 'geral', 'Boroscópio Articulado', 'I', 1,
 'Item operacional. Um visor e uma câmera instalada na ponta de um cabo flexível, usada para observar através de frestas. Empunhar esse item operacional exige as duas mãos. Seu uso garante a visualização de ambientes sem adentrá-los, permitindo inclusive testes de Investigação e Percepção através da câmera, que conta com visão no escuro. O cabo flexível tem alcance de 3m.',
 '{}', '/conteudo/as09/itens/boroscopio-articulado.webp'),
((select id from sources where slug = 'arquivos_secretos_09'), 'arma', 'Designated Marksman Rifle (DMR)', 'III', 3,
 'Também conhecido como Rifle de Atirador Designado, a DMR foi projetada para permitir uma maior precisão em confrontos de longo alcance, mas mantendo algum nível de combatividade em confrontos próximos. A DMR é uma arma de fogo tática, de duas mãos, com alcance médio, que causa 2d10 pontos de dano balístico e tem crítico 19/x3. A DMR permite que a habilidade Ataque Furtivo seja usada até alcance médio. Se for veterano em Pontaria e mirar com uma DMR (OPRPG, p. 87), você recebe +5 na margem de ameaça de seu ataque. A DMR usa balas longas como munição.',
 '{"dano":"2d10","alcance":"medio","critico":"19/x3","natureza":"fogo","tipo_dano":"B","empunhadura":"duas_maos","proficiencia":"taticas","tipo_municao":"Balas longas"}',
 '/conteudo/as09/itens/dmr.webp'),
((select id from sources where slug = 'arquivos_secretos_09'), 'geral', 'Drone de Combate Tático', 'III', 2,
 E'Item operacional. Um pequeno veículo aéreo não tripulado, com inteligência artificial adaptada para combate, equipado com câmera e controle remoto. Operar este item operacional exige as duas mãos. Em termos de regras, o drone de combate tático é um aliado (OPRPG, p. 171) com uma câmera filmadora (garante a visualização de ambientes sem adentrá-los, permitindo inclusive testes de Investigação e Percepção através da câmera). Ao adquiri-lo, escolha um dos tipos especiais de aliado drone (Atirador, Espião, Hacker, Inteligente, Médico, Protetor ou Utilitário) e adicione-o na aba Habilidades, em Aliados.\n\nAliado drone: o bônus funciona normalmente, como um efeito passivo. A habilidade só pode ser usada se o usuário estiver operando o item com as duas mãos; o uso dela continua sendo uma ação livre. A critério do mestre, o drone pode ficar danificado ou quebrar conforme a lógica da narrativa. Recomendações para grupos apegados a movimentação: deslocamento 6m e voo 12m; uma única ação de movimento por rodada, só para se deslocar; precisa ficar num raio de 5km do controle remoto ou perde o sinal.\n\nModificações: quando o drone é modificado, ele recebe um novo efeito de aliado drone (por exemplo, um drone espião com a modificação drone inteligente passa a fornecer os bônus e as habilidades dos dois tipos). Cada modificação aumenta a categoria do drone em I (até o limite de IV). Modificações com efeitos semelhantes não se acumulam.',
 '{}', '/conteudo/as09/itens/drone-de-combate-tatico.webp'),
((select id from sources where slug = 'arquivos_secretos_09'), 'arma', 'Espingarda Serrada', 'I', 1,
 'Um modelo portátil de escopeta, muito usado em arrombamentos. Seu nome vem de uma prática antiga de serrar o cano de uma espingarda. Apesar de mais leve e compacta, ela não tem muito alcance e faz menos estrago. A espingarda serrada é uma arma de fogo tática, de uma mão, com alcance curto, que causa 3d6 pontos de dano balístico e tem crítico 20/x3. Ela causa apenas metade do dano em alcance médio ou maior. Usa cartuchos como munição.',
 '{"dano":"3d6","alcance":"curto","critico":"x3","natureza":"fogo","tipo_dano":"B","empunhadura":"uma_mao","proficiencia":"taticas","tipo_municao":"Cartuchos"}',
 '/conteudo/as09/itens/espingarda-serrada.webp'),
((select id from sources where slug = 'arquivos_secretos_09'), 'protecao', 'Escudo Balístico LED', 'II', 2,
 'Escudos largos e reforçados, feitos para cobrir a maior parte do corpo do operador contra projéteis, além de ter uma lanterna frontal. Esse escudo especial é um item do tipo proteção pesada. Precisa ser empunhado em uma mão e fornece +2 na Defesa e resistência a balístico 10. Além disso, você pode gastar uma ação de movimento para fornecer cobertura leve para si e qualquer ser Médio ou menor atrás de você, mas você anula esse efeito quando se deslocar. Finalmente, o escudo conta com uma lanterna tática ativada por um gatilho na empunhadura. Ela ilumina um cone de 9m e você pode gastar uma ação de movimento para mirar a luz nos olhos de um ser em alcance curto. Ele fica ofuscado por 1 rodada, mas imune à lanterna pelo resto da cena.',
 '{"defesa":2,"resistencia":{"balistico":10}}', '/conteudo/as09/itens/escudo-balistico-led.webp'),
((select id from sources where slug = 'arquivos_secretos_09'), 'arma', 'Lançador de Granadas Portátil', 'II', 1,
 'Uma versão compacta, popular em forças militares que precisam marchar longas distâncias. Essa granadeira portátil funciona como um lançador de granadas (AS #04, p. 71), mas só comporta uma única granada por vez.',
 '{"alcance":"longo","natureza":"fogo","empunhadura":"duas_maos","proficiencia":"pesadas"}', '/conteudo/as09/itens/lancador-de-granadas-portatil.webp'),
((select id from sources where slug = 'arquivos_secretos_09'), 'arma', 'Machado Tático', 'II', 1,
 'Essa arma, além de ferramenta, é feita para combate. Sua estrutura interna é feita completamente de aço, o que o torna mais resistente e pesado. O machado tático é uma arma corpo a corpo tática, de uma mão, que causa 1d8 pontos de dano de corte e tem crítico 20/x3. É balanceado para contra-ataques rápidos e bloqueios. Se usado na ação especial contra-ataque, fornece +2 no teste de ataque para contra-atacar. Se usado na ação especial bloqueio, você pode gastar 2 PE e sacrificar o machado tático para aumentar a RD do bloqueio em +20. O machado tático é uma arma ágil e pode ser arremessado em alcance curto.',
 '{"dano":"1d8","alcance":"curto","critico":"x3","natureza":"corpo_a_corpo","tipo_dano":"C","empunhadura":"uma_mao","proficiencia":"taticas"}',
 '/conteudo/as09/itens/machado-tatico.webp'),
((select id from sources where slug = 'arquivos_secretos_09'), 'municao', 'Dardos Condutores', 'I', 1,
 'Dardos metálicos de alta tecnologia, também chamados de sondas ou eletrodos, acoplados a fios condutores finos conectados à arma que os dispara. Se estiver usando a regra opcional de contagem de munição (OPRPG, p. 174), cada pacote de munição de dardos condutores contém munição para 20 ataques. Além disso, a capacidade de armazenamento de uma pistola taser é de 10 dardos.',
 '{"duracao_pacote":"20 ataques"}', null),
((select id from sources where slug = 'arquivos_secretos_09'), 'arma', 'Pistola Taser', 'II', 1,
 'Também conhecida como pistola atordoante, esse dispositivo dispara dardos ligados por fios de cobre que descarregam uma alta tensão elétrica, sendo mais letal do que sua versão como item operacional. A pistola taser é uma arma de disparo, de uma mão, com alcance curto, que causa 2d6 pontos de dano de eletricidade e tem crítico 20/x3. Um ser atingido fica atordoado por uma rodada (Fortitude DT Agi evita). Um mesmo alvo só pode ficar atordoado por este item uma vez por cena (é uma questão de balanceamento; o grupo pode decidir aplicar essa limitação também ao taser operacional ou remover essa limitação da pistola taser). Usa dardos condutores como munição.',
 '{"dano":"2d6","alcance":"curto","critico":"x3","natureza":"disparo","tipo_dano":"eletricidade","empunhadura":"uma_mao","proficiencia":"simples","tipo_municao":"Dardos condutores"}',
 '/conteudo/as09/itens/pistola-taser.webp');

-- ===================== Aliados =====================

insert into allies (source_id, tipo, name, descricao, bonus, habilidade_nome, habilidade, image_url, sort_order)
select (select id from sources where slug = 'arquivos_secretos_09'), v.tipo, v.name, v.descricao, v.bonus, v.hab_nome, v.hab, v.img, v.ord from (values
  ('pessoa', 'Ryder Staten', 'Líder dos Hell Hunters. Comandante de campo extremamente eficiente que extrai o melhor de quem acompanha.',
   'Você recebe +1d20 em 2 perícias à sua escolha. Uma vez escolhidas, não podem ser trocadas até o final da missão.',
   'Comando de Ryder', E'Você pode gastar uma ação de movimento e 2 PE para usar a habilidade Formação! de Ryder como se fosse sua.\n\nFormação!: você e todos os aliados em alcance médio que possam ouvi-lo recebem bônus conforme a formação, até o início do seu próximo turno. Cunha: +5 em testes de ataque e na Defesa. Coluna: +3m de deslocamento e +5 em Furtividade. Linha: +5 em testes de ataque e em rolagens de dano.',
   '/conteudo/as09/aliados/ryder-staten.webp', 1),
  ('pessoa', 'Jason Bloom', 'Jason é um protetor confiável.',
   'Você recebe +1d20 em Fortitude.',
   'Proteção de Jason', 'Quando sofre dano, você pode gastar 2 PE como reação para reduzir o dano em 10 pontos.',
   '/conteudo/as09/aliados/jason-bloom.webp', 2),
  ('pessoa', 'Karen Brown', 'Karen é uma atiradora infalível.',
   'Você recebe +1d20 em Pontaria.',
   'Disparo de Karen', 'Quando causa dano, você pode gastar 2 PE para causar +3d6 pontos de dano extra.',
   '/conteudo/as09/aliados/karen-brown.webp', 3),
  ('pessoa', 'Troy Walker', 'Troy é um combatente pronto para fazer estrago.',
   'Você recebe +1d20 em Luta.',
   'Investida do Troy', 'Quando faz um ataque, você pode gastar 5 PE como reação para fazer um ataque adicional.',
   '/conteudo/as09/aliados/troy-walker.webp', 4),
  ('pessoa', 'Roy Stevens', 'Roy é um médico de campo capaz de operar milagres.',
   'Você é considerado treinado em Medicina. Se já for treinado, em vez disso, recebe +1d20 em testes de Medicina.',
   'Medicina do Roy', 'Você cura 3d10 PV ou remove uma condição negativa (exceto morrendo) de si ou de um aliado adjacente.',
   '/conteudo/as09/aliados/roy-stevens.webp', 5),
  ('pessoa', 'Stella Green', 'Stella é uma motorista com habilidades inquestionáveis.',
   'Você recebe +1d20 em Pilotagem.',
   'Direção da Stella', 'Quando falha em um teste de Pilotagem, você pode gastar 2 PE para tentar o mesmo teste mais uma vez.',
   '/conteudo/as09/aliados/stella-green.webp', 6),
  ('pessoa', 'Arnold Strolley', 'Arnold é um especialista em explosivos cruel.',
   'Você recebe +1d20 em testes envolvendo explosivos (como Pontaria para arremessar uma granada ou Reflexos para evitar uma explosão).',
   'Explosão do Arnold', 'Uma vez por cena, você pode gastar 2 PE para receber um explosivo à sua escolha de Arnold.',
   '/conteudo/as09/aliados/arnold-strolley.webp', 7),
  ('pessoa', 'Chloe Grey', 'Chloe domina documentação como ninguém e foi tocada pela Morte.',
   'Você recebe +1d20 em Investigação.',
   'Morte em Chloe', 'Você pode conjurar o ritual Nuvem de Cinzas como se o conhecesse. Se já o conhece, em vez disso, o custo para lançá-lo diminui em –1 PE.',
   '/conteudo/as09/aliados/chloe-grey.webp', 8),
  ('drone', 'Drone Atirador', 'Drone modificado para comportar arma de fogo e auxiliar em disparos.',
   'Você recebe +1d20 em testes de ataque.',
   'Metralhar Tudo', 'Quando ataca, você pode gastar 2 PE. Se acertar o ataque, causa +2d8 pontos de dano balístico.',
   '/conteudo/as09/itens/drone-de-combate-tatico.webp', 101),
  ('drone', 'Drone Espião', 'Drone modificado para ser mais eficiente com espionagem.',
   'Você recebe +1d20 em testes de Investigação e Percepção em que o drone possa ajudar. Além disso, a câmera do drone passa a ter visão no escuro.',
   'Captação Térmica e de Áudio', 'Você pode gastar 2 PE para ativar as funções que consomem mais energia do drone até o final da cena: a câmera passa a ter visão térmica (ignora camuflagem) e você pode fazer testes de Tecnologia através do drone para captar ondas de rádio (como ouvir uma ligação em tempo real; dificuldade do teste a critério do mestre).',
   '/conteudo/as09/itens/drone-de-combate-tatico.webp', 102),
  ('drone', 'Drone Hacker', 'Drone modificado para ser mais eficiente com hacking.',
   'Você recebe +1d20 em testes de Tecnologia em que o drone possa ajudar. Além disso, você pode usar o drone para hackear tanto wireless quanto localmente, enquanto se mantém em uma distância segura.',
   'Acelerar e Ocultar', 'Quando hackeia como ação completa, pode gastar 2 PE para evitar a penalidade. Além disso, se falhar em um teste de hackear e quiser tentar novamente com a mesma informação, pode fazê-lo (não precisa de uma informação nova), mas apenas mais uma vez (veja hackear em OPRPG, p. 49). Finalmente, quando falhar por 5 ou mais, pode gastar 3 PE para evitar ser rastreado.',
   '/conteudo/as09/itens/drone-de-combate-tatico.webp', 103),
  ('drone', 'Drone Inteligente', 'Drone modificado para ser ainda mais inteligente.',
   'O drone funciona por comandos de voz dados a partir do controle, não sendo necessário usar as mãos para operá-lo.',
   'Braços Articulados', 'Você pode gastar 2 PE para que, até o fim da cena, o drone ative a função de braços articulados. Isso permite que o drone carregue até 5 espaços de itens, além de poder usar esses braços para trabalhos manuais simples e lentos (ele não consegue folhear um livro, por exemplo, mas consegue pegá-lo com calma e trazê-lo até você).',
   '/conteudo/as09/itens/drone-de-combate-tatico.webp', 104),
  ('drone', 'Drone Médico', 'Drone modificado para executar funções médicas de primeiros socorros.',
   'Você é considerado treinado em Medicina. Se já for treinado, em vez disso, recebe +1d20 em testes de Medicina.',
   'Robô ao Resgate', 'Você pode gastar 2 PE para recuperar 2d8+2 PV de um alvo adjacente ao drone.',
   '/conteudo/as09/itens/drone-de-combate-tatico.webp', 105),
  ('drone', 'Drone Protetor', 'Drone modificado para proteger.',
   'Você recebe +5 na Defesa.',
   'Alerta de Ameaça', 'Quando faz um teste de resistência, você pode gastar 2 PE para receber +5 nesse teste.',
   '/conteudo/as09/itens/drone-de-combate-tatico.webp', 106),
  ('drone', 'Drone Utilitário', 'Drone modificado para tornar a vida mais fácil em um aspecto específico.',
   'Escolha uma perícia (exceto Fortitude, Luta, Pontaria, Reflexos ou Vontade). Você recebe +1d20 em testes da perícia escolhida. Uma vez escolhida, a perícia não pode ser mais trocada.',
   'Meu Amigo Drone', 'Quando falha em um teste da perícia escolhida, você pode gastar 3 PE para tentar novamente, mas apenas mais uma vez.',
   '/conteudo/as09/itens/drone-de-combate-tatico.webp', 107)
) as v(tipo, name, descricao, bonus, hab_nome, hab, img, ord);

-- ===================== Bestiario: os Hell Hunters como NPC =====================

insert into creatures (source_id, name, vd, flavor_text, descritores, tamanho, percepcao, iniciativa, defesa, fortitude, reflexos, vontade, pv_maximo, pv_machucado, resistencias, atributos, pericias, deslocamento, habilidades, acoes, image_url, sort_order)
values
((select id from sources where slug = 'arquivos_secretos_09'), 'Ryder Staten', 200,
 'Líder e fundador dos Hell Hunters. Ex-Ranger, comandou o esquadrão tático Hell Hounds e treinou a SWAT do Texas antes de enfrentar o paranormal no USS Nexington. Repetição, disciplina e compromisso.',
 '{Pessoa}', 'Médio', '2d20+10', '4d20+10', 34, '3d20+15', '4d20+15', '2d20+10', 320, 160, null,
 '{"agi":4,"for":3,"int":2,"pre":2,"vig":3}', 'Atletismo 3d20+15, Furtividade 4d20+10, Intimidação 2d20+15, Intuição 2d20+10, Pilotagem 4d20+10, Tática 2d20+15', '9m | 6',
 '[{"nome":"Treinamento Tático","descricao":"+5 em testes de ataque, testes de resistência, rolagens de dano e na Defesa (já contabilizado). Pode fazer três ações agredir pelo custo de uma única ação padrão."}]',
 '[{"tipo":"Padrão","nome":"Pistola Modificada, à distância (curto)","teste":"4d20+25, crítico 14","dano":"2d10+22 balístico"},{"tipo":"Padrão","nome":"Fuzil de Assalto Modificado, à distância (médio)","teste":"4d20+25, crítico 17/x3","dano":"3d10+22 balístico"},{"tipo":"Reação","nome":"Cuidado!","descricao":"Uma vez por rodada, quando um aliado em alcance médio falha em um teste, Ryder pode fazer o mesmo teste. Se ele passar, troca a falha do aliado por um sucesso."},{"tipo":"Livre","nome":"Luta Tática","descricao":"Uma vez por rodada, faz uma manobra de combate como ação livre."},{"tipo":"Movimento","nome":"Formação!","descricao":"Ele e todos os aliados em alcance médio que possam ouvi-lo recebem bônus conforme a formação, até o início do próximo turno de Ryder. Cunha: +5 em testes de ataque e na Defesa. Coluna: +3m de deslocamento e +5 em Furtividade. Linha: +5 em testes de ataque e em rolagens de dano."},{"tipo":"Padrão","nome":"Fragmentação","dano":"8d6 perfuração (Reflexos DT 23 reduz à metade)","descricao":"Uma vez por cena, arremessa uma granada de fragmentação em alcance curto; raio de 6m."},{"tipo":"Padrão","nome":"Vai, Vai, Vai!","descricao":"Acelera a si mesmo e todos os aliados em alcance médio. Todos que quiserem se mover deslocam 9m para a mesma direção apontada por Ryder."}]',
 '/conteudo/as09/aliados/ryder-staten.webp', 111),
((select id from sources where slug = 'arquivos_secretos_09'), 'Jason Bloom', 140,
 'Um guardião: protege os seus quebrando quantos ossos dos lobos forem necessários. Ex-SWAT, sobrevivente do USS Nexington.',
 '{Pessoa}', 'Médio', '2d20', '2d20+5', 30, '3d20+15', '2d20+10', '2d20+5', 200, 100, 'RD 10 (Blindado)',
 '{"agi":2,"for":3,"int":1,"pre":2,"vig":3}', 'Atletismo 3d20+10, Intimidação 2d20+5, Pilotagem 2d20+10, Tática 1d20+5', '9m | 6',
 '[{"nome":"Blindado","descricao":"Devido ao seu uso eficiente do aparato tático e escudo, tem RD 10. Além disso, não sofre penalidade de deslocamento pelo equipamento pesado."},{"nome":"Treinamento Tático","descricao":"+5 em testes de ataque, testes de resistência, rolagens de dano e na Defesa (já contabilizado). Pode fazer duas ações agredir pelo custo de uma única ação padrão."}]',
 '[{"tipo":"Padrão","nome":"Escudada, corpo a corpo","teste":"3d20+20","dano":"2d8+15 impacto"},{"tipo":"Padrão","nome":"Pistola Modificada, à distância (curto)","teste":"2d20+20, crítico 16","dano":"2d10+17 balístico"},{"tipo":"Reação","nome":"Proteger","descricao":"Uma vez por rodada, redireciona danos, ou quaisquer outros efeitos negativos, que tenham como alvo um aliado adjacente, para si."},{"tipo":"Livre","nome":"Luta Tática","descricao":"Uma vez por rodada, faz uma manobra de combate como ação livre."},{"tipo":"Padrão","nome":"Atrás de Mim!","descricao":"Assume uma postura que fornece cobertura. Aliados adjacentes recebem RD 10 e podem considerá-lo uma cobertura (+5 na Defesa) até o início do próximo turno dele."},{"tipo":"Completa","nome":"Empurrar e Atirar","dano":"4d12+24 balístico (Fortitude ou Reflexos DT 22 reduz à metade e evita o empurrão)","descricao":"Carga com escudo, empurrando um alvo adjacente uma quantidade de metros igual ao deslocamento de Jason enquanto avança disparando com a pistola."}]',
 '/conteudo/as09/aliados/jason-bloom.webp', 112),
((select id from sources where slug = 'arquivos_secretos_09'), 'Karen Brown', 160,
 'Exímia atiradora, treinada pelo avô desde a infância; apreciadora de rifles de precisão. Chefe do setor de Confronto dos Hell Hunters.',
 '{Pessoa}', 'Médio', '3d20+15', '4d20+10', 33, '2d20+10', '4d20+15', '3d20+15', 240, 120, null,
 '{"agi":4,"for":2,"int":2,"pre":3,"vig":2}', 'Acrobacia 4d20+10, Atletismo 2d20+10, Furtividade 4d20+10, Intimidação 3d20+15, Pilotagem 4d20+10, Tática 2d20+10', '9m | 6',
 '[{"nome":"Olhos de Águia","descricao":"Precisão e capacidade de observação superior: +5 em Percepção e +2 em margem de ameaça com ataques à distância (já contabilizado)."},{"nome":"Treinamento Tático","descricao":"+5 em testes de ataque, testes de resistência, rolagens de dano e na Defesa (já contabilizado). Pode fazer duas ações agredir pelo custo de uma única ação padrão."}]',
 '[{"tipo":"Padrão","nome":"Pistola Modificada, à distância (curto)","teste":"4d20+20, crítico 14","dano":"2d12+17 balístico"},{"tipo":"Padrão","nome":"Fuzil de Precisão Modificado, à distância (longo)","teste":"4d20+20, crítico 15/x3","dano":"3d12+17 balístico"},{"tipo":"Livre","nome":"Luta Tática","descricao":"Uma vez por rodada, faz uma manobra de combate como ação livre."},{"tipo":"Movimento","nome":"Buscar Cobertura","descricao":"Se houver uma cobertura na linha de visão, percorre o dobro do deslocamento na direção da cobertura."},{"tipo":"Completa","nome":"Fogo de Supressão","descricao":"Uma vez por rodada, prepara ataques à distância contra quaisquer alvos em uma área (cone com alcance da arma). Espera até que qualquer alvo faça algo para atirar nele como reação; limite de tiros igual a sua AGI, no máximo 1 por alvo. Atingido ou não, o alvo testa Vontade (DT 25; 30 se foi atingido): se falhar, fica intimidado e perde a ação. Dura até o início do próximo turno de Karen."}]',
 '/conteudo/as09/aliados/karen-brown.webp', 113),
((select id from sources where slug = 'arquivos_secretos_09'), 'Troy Walker', 140,
 'Especialista em combate de curto alcance; irreverente, forte, destemido e muito teimoso. "Hold my beer."',
 '{Pessoa}', 'Médio', '2d20', '2d20+5', 29, '3d20+15', '2d20+10', '2d20+5', 180, 90, null,
 '{"agi":2,"for":3,"int":1,"pre":2,"vig":3}', 'Atletismo 3d20+10, Intimidação 2d20+10, Pilotagem 2d20+10, Tática 1d20+5', '9m | 6',
 '[{"nome":"Adrenalina de Pancadaria","descricao":"Quanto mais se machuca, mais se empolga. Entre 135 e 90 PV: RD 5 e +5 de dano extra. Entre 90 e 45 PV: RD 10 e +10. Entre 45 e 0 PV: RD 15 e +15."},{"nome":"Pé na Porta","descricao":"Especializado em destruir objetos: causa +4d8 pontos de dano extra em itens."},{"nome":"Treinamento Tático","descricao":"+5 em testes de ataque, testes de resistência, rolagens de dano e na Defesa (já contabilizado). Pode fazer duas ações agredir pelo custo de uma única ação padrão."}]',
 '[{"tipo":"Padrão","nome":"Coronhada, corpo a corpo","teste":"3d20+20","dano":"3d6+15 impacto"},{"tipo":"Padrão","nome":"Espingarda Modificada, à distância (curto)","teste":"2d20+20, crítico 18/x3","dano":"4d6+17 balístico"},{"tipo":"Reação","nome":"Revidar","descricao":"Uma vez por rodada, quando é alvo de um ataque corpo a corpo, faz um teste de ataque corpo a corpo para se defender. Se vencer o teste oposto, evita o ataque e causa seu dano corpo a corpo ao oponente; se perder, é atingido normalmente."},{"tipo":"Livre","nome":"Luta Tática","descricao":"Uma vez por rodada, faz uma manobra de combate como ação livre."},{"tipo":"Padrão","nome":"Pra Cima Deles!","descricao":"Faz um ataque qualquer contra um alvo no alcance (ou mais, se o ataque permitir). Se acertar, causa dano máximo. Se errar, sofre –10 na Defesa por 1 rodada."}]',
 '/conteudo/as09/aliados/troy-walker.webp', 114),
((select id from sources where slug = 'arquivos_secretos_09'), 'Roy Stevens', 160,
 'Médico exímio e calmo sob situações extremas; responsável pelo setor Médico e melhor amigo de Ryder desde a Guerra do Golfo.',
 '{Pessoa}', 'Médio', '4d20+10', '2d20+10', 32, '3d20+15', '2d20+10', '4d20+15', 250, 125, null,
 '{"agi":2,"for":3,"int":3,"pre":4,"vig":3}', 'Atletismo 2d20+10, Diplomacia 4d20+10, Intimidação 4d20+10, Medicina 3d20+15, Pilotagem 2d20+10, Tática 3d20+10', '9m | 6',
 '[{"nome":"Técnicas de Resgate","descricao":"Carrega até dois corpos humanos sem sofrer penalidade de deslocamento, desde que esteja com as mãos livres para carregá-los."},{"nome":"Treinamento Tático","descricao":"+5 em testes de ataque, testes de resistência, rolagens de dano e na Defesa (já contabilizado). Pode fazer duas ações agredir pelo custo de uma única ação padrão."}]',
 '[{"tipo":"Padrão","nome":"Pistola Modificada, à distância (curto)","teste":"2d20+20, crítico 14","dano":"2d8+17 balístico"},{"tipo":"Padrão","nome":"Submetralhadora Modificada, à distância (curto)","teste":"2d20+20, crítico 17/x3","dano":"3d6+17 balístico"},{"tipo":"Livre","nome":"Luta Tática","descricao":"Uma vez por rodada, faz uma manobra de combate como ação livre."},{"tipo":"Movimento","nome":"Ao Resgate","descricao":"Se houver um aliado ferido na linha de visão, percorre o dobro do deslocamento na direção dele."},{"tipo":"Padrão","nome":"Prestar Socorro","descricao":"Cura 3d10 PV ou remove uma condição negativa (exceto morrendo) de si ou de um aliado adjacente."}]',
 '/conteudo/as09/aliados/roy-stevens.webp', 115),
((select id from sources where slug = 'arquivos_secretos_09'), 'Stella Green', 140,
 'Pilota as máquinas dos Hell Hunters com mãos firmes e um imenso sorriso. Ex-mecânica do exército no Iraque. "Loud Music, Louder Racing."',
 '{Pessoa}', 'Médio', '2d20+5', '3d20+10', 29, '2d20+5', '3d20+15', '2d20+10', 190, 95, null,
 '{"agi":3,"for":2,"int":3,"pre":2,"vig":2}', 'Atletismo 2d20+10, Intimidação 2d20+10, Pilotagem 3d20+15, Profissão (engenheira mecânica) 3d20+15, Tática 3d20+5', '9m | 6',
 '[{"nome":"Por Água, Céu e Terra","descricao":"Sabe pilotar todos os veículos desenvolvidos pela humanidade, com exceção de veículos muito exóticos (como um foguete espacial)."},{"nome":"Treinamento Tático","descricao":"+5 em testes de ataque, testes de resistência, rolagens de dano e na Defesa (já contabilizado). Pode fazer duas ações agredir pelo custo de uma única ação padrão."}]',
 '[{"tipo":"Padrão","nome":"Pistola Modificada, à distância (curto)","teste":"3d20+20, crítico 16","dano":"2d10+17 balístico"},{"tipo":"Padrão","nome":"Fuzil de Assalto Modificado, à distância (médio)","teste":"3d20+20, crítico 17/x3","dano":"2d12+17 balístico"},{"tipo":"Reação","nome":"Direção Defensiva","descricao":"Uma vez por rodada, quando faz um teste para garantir a integridade de um veículo que está pilotando e/ou de seus ocupantes, recebe +1d20+5 nesse teste."},{"tipo":"Livre","nome":"Direção Ofensiva","descricao":"Uma vez por rodada, quando faz um teste para agredir alguém ou algo com um veículo que está pilotando, recebe +1d20+5 nesse teste."},{"tipo":"Livre","nome":"Luta Tática","descricao":"Uma vez por rodada, faz uma manobra de combate como ação livre."},{"tipo":"Padrão","nome":"Conserto de Campo","descricao":"Conserta um objeto danificado adjacente, garantindo que funcione normalmente até o final da cena. Não funciona mais de uma vez no mesmo objeto."}]',
 '/conteudo/as09/aliados/stella-green.webp', 116),
((select id from sources where slug = 'arquivos_secretos_09'), 'Arnold Strolley', 140,
 'Especialista em explosivos e engenheiro químico do grupo; chefe do Almoxarifado. Cínico, frio e cruelmente bem-humorado.',
 '{Pessoa}', 'Médio', '2d20+5', '2d20', 30, '3d20+15', '2d20+5', '2d20+10', 200, 100, 'Eletricidade, fogo, frio e químico 5',
 '{"agi":2,"for":2,"int":4,"pre":2,"vig":3}', 'Atletismo 2d20+10, Intimidação 2d20+10, Pilotagem 2d20+10, Profissão (engenheiro químico) 4d20+15, Tática 4d20+10', '9m | 6',
 '[{"nome":"Quimicamente Alterado","descricao":"Já passou por muita coisa, inclusive acidentes químicos: tem RD 5 contra eletricidade, fogo, frio e químico."},{"nome":"Treinamento Tático","descricao":"+5 em testes de ataque, testes de resistência, rolagens de dano e na Defesa (já contabilizado). Pode fazer duas ações agredir pelo custo de uma única ação padrão."}]',
 '[{"tipo":"Padrão","nome":"Pistola Modificada, à distância (curto)","teste":"2d20+20, crítico 16","dano":"2d10+17 balístico"},{"tipo":"Padrão","nome":"Metralhadora Modificada, à distância (médio)","teste":"2d20+20, crítico 17/x3","dano":"3d12+17 balístico"},{"tipo":"Livre","nome":"Luta Tática","descricao":"Uma vez por rodada, faz uma manobra de combate como ação livre."},{"tipo":"Padrão","nome":"Atordoamento","descricao":"Uma vez por cena, arremessa uma granada flashbang em alcance curto. Seres em um raio de 6m ficam atordoados por 1 rodada (Fortitude DT 23 reduz para ofuscado e surdo por 1 rodada)."},{"tipo":"Padrão","nome":"Fragmentação","dano":"8d6 perfuração (Reflexos DT 23 reduz à metade)","descricao":"Uma vez por cena, granada de fragmentação em alcance curto; raio de 6m."},{"tipo":"Padrão","nome":"Gás Lacrimogêneo","dano":"4d6 químico (Fortitude DT 23 reduz à metade e evita enjoado)","descricao":"Uma vez por cena, granada em alcance curto; raio de 6m. Ficam enjoados e asfixiados; após deixarem a área, continuam asfixiados por 1d4 rodadas e enjoados até o fim da cena."},{"tipo":"Padrão","nome":"Incendiária","dano":"6d6 fogo + em chamas (Reflexos DT 23 reduz à metade e evita em chamas)","descricao":"Uma vez por cena, granada incendiária em alcance curto; raio de 6m."}]',
 '/conteudo/as09/aliados/arnold-strolley.webp', 117),
((select id from sources where slug = 'arquivos_secretos_09'), 'Chloe Grey', 140,
 'Administra os bares de fachada dos Hell Hunters e apoia a logística. Ex-detetive, perdeu um braço para uma múmia na mansão Leone e foi tocada pela Morte.',
 '{Pessoa}', 'Médio', '3d20+5', '3d20+10', 29, '2d20+5', '3d20+15', '3d20+10', 170, 85, null,
 '{"agi":3,"for":2,"int":3,"pre":3,"vig":2}', 'Atletismo 2d20+10, Diplomacia 3d20+10, Enganação 3d20+10, Furtividade 3d20+10, Intuição 3d20+10, Investigação 3d20+15, Pilotagem 3d20+10, Tática 3d20+10', '9m | 6',
 '[{"nome":"Braço Amputado","descricao":"Sempre que precisa fazer um teste em que a ausência do braço torna a ação mais difícil, sofre –1d20 no teste."},{"nome":"Esforço e Superação","descricao":"Graças ao treinamento intenso, não sofre a penalidade de Braço Amputado em testes de ataque e testes de resistência."},{"nome":"Tocada pela Morte","descricao":"Pode conjurar o ritual Nuvem de Cinzas sem pagar seu custo de PE, até um limite de 6 PE por conjuração, usando a ação apropriada. A DT para resistir é 21."},{"nome":"Treinamento Tático","descricao":"+5 em testes de ataque, testes de resistência, rolagens de dano e na Defesa (já contabilizado). Pode fazer duas ações agredir pelo custo de uma única ação padrão."}]',
 '[{"tipo":"Padrão","nome":"Combate Desarmado, corpo a corpo","teste":"3d20+20","dano":"2d6+15 impacto"},{"tipo":"Padrão","nome":"Pistola Modificada, à distância (curto)","teste":"3d20+20, crítico 16","dano":"2d10+17 balístico"},{"tipo":"Reação","nome":"Olhos para Documentos","descricao":"Uma vez por rodada, quando faz um teste para encontrar pistas em documentos, pode fazer duas tentativas e ficar com o melhor resultado."},{"tipo":"Livre","nome":"Luta Tática","descricao":"Uma vez por rodada, faz uma manobra de combate como ação livre."},{"tipo":"Padrão","nome":"Ritual: Nuvem de Cinzas (Morte 1)","descricao":"Cria uma nuvem de fuligem em um ponto em alcance curto, com 6m de raio e 6m de altura; dura pela cena e obscurece a visão (seres a até 1,5m têm camuflagem leve; a partir de 3m, camuflagem total). Vento forte dispersa em 4 rodadas; vendaval, em 1. Não funciona sob a água."}]',
 '/conteudo/as09/aliados/chloe-grey.webp', 118);

-- ===================== Pericia Tatica, regalias e dicas =====================

update skills
set description = description || E'\r\n\r\n**Analisar Perigo (Treinado, DT 15).** Você pode gastar uma ação de movimento para analisar a melhor forma de lidar com uma situação de perigo específica. Por exemplo, identificar explosivos próximos a um zumbi de Sangue caminhando num galpão ou encontrar um caminho seguro em meio a um tiroteio. Até o fim do seu próximo turno, você recebe +2 em testes e na Defesa (esse bônus aumenta em +1 para cada 5 pontos acima da DT). Você só pode fazer essa ação uma vez por cena. (Arquivos Secretos 09)'
where name = 'Tática' and description not like '%Analisar Perigo%';

update extra_rules
set content = content || E'\n\nRegalias de assalto (Arquivos Secretos 09):\n- Central de Drones: o veículo tem controles, carregadores e compartimentos de lançamento. Personagens dentro dele recebem +5 em Tecnologia para operar drones. Além disso, uma vez por rodada, um drone pode ser guardado ou pego da central como uma ação livre.\n- Estação de Armas: uma arma de fogo de duas mãos pode ser instalada em um suporte no teto ou na lateral do veículo. Um passageiro pode operá-la normalmente, usando sua Pontaria. O personagem não sofre a penalidade por disparar de um veículo em movimento, mas não recebe cobertura do veículo enquanto estiver operando a arma. A arma e sua munição devem ser requisitadas separadamente e ficam armazenadas na carga do veículo.\n- Lançadores de Fumaça: uma vez por cena, um tripulante pode gastar uma ação de movimento para criar uma nuvem de fumaça ao redor do veículo. Em termos de regras, são os mesmos efeitos de uma granada de fumaça (OPRPG, p. 64).'
where title = 'Veículos Operacionais' and content not like '%Central de Drones%';

insert into extra_rules (source_id, category, title, content, sort_order)
values
((select id from sources where slug = 'arquivos_secretos_09'), 'campanha', 'Operações Táticas',
 E'Dicas dos autores (Arquivos Secretos 09) para mestrar uma operação no estilo Hell Hunters.\n\nAndamento e ritmo:\nSe todas as cenas forem combates, os confrontos perdem impacto e a missão vira uma sequência de rolagens. Organize a operação em quatro momentos:\n- Inserção: a equipe recebe um briefing curto, escolhe seus equipamentos e entra na zona de operação. Apresente o objetivo, as limitações e pelo menos uma informação incompleta. "Resgatar a equipe desaparecida" é um objetivo; "o último sinal veio do convés inferior, mas os sensores indicam movimento no convés superior" é uma decisão.\n- Reconhecimento: os agentes exploram, estabelecem rotas e encontram sinais do que ocorreu. Use cenas comuns, de investigação e de furtividade. Informações obtidas aqui devem produzir vantagens concretas: revelar uma entrada alternativa, desativar um sistema de segurança, descobrir a vulnerabilidade de uma ameaça ou localizar um recurso.\n- Contato: a equipe encontra resistência. Nem todo contato precisa virar um combate até a morte. Uma patrulha pode ser evitada, um inimigo pode recuar para pedir reforços e uma criatura pode perseguir o grupo sem se expor por completo. O importante é que cada contato altere a situação.\n- Extração: depois que o objetivo é cumprido, ainda é preciso sair. Rotas podem estar bloqueadas, o veículo pode ter sido danificado e inimigos sobreviventes podem convergir para a posição dos agentes. A extração transforma recursos preservados em escolhas importantes e evita que o confronto final seja sempre o encerramento da história.\n\nInformação é crucial:\nNo horror tático, torne as cenas de investigação parte da ação, em vez de antecipá-las. Plantas da instalação, gravações de segurança, padrões de patrulha e vestígios paranormais devem modificar a operação. Sempre que os agentes encontrarem uma pista importante, considere fornecer um benefício: +5 em um teste específico, uma rota segura ou a possibilidade de ignorar uma habilidade de uma ameaça. Não esconda toda informação atrás de testes: agentes treinados reconhecem procedimentos militares, sinais de arrombamento e posições defensivas evidentes. Reserve os testes para detalhes incertos ou vantagens adicionais.\n\nPoder e realismo:\nRegras táticas não precisam simular cada detalhe de um confronto real. Contar projéteis, calcular espessuras de blindagem ou diferenciar dezenas de calibres só é útil quando gera decisões interessantes. O objetivo é criar pressão, não burocracia. A sensação de realismo vem principalmente das consequências: disparos alertam inimigos, portas bloqueiam rotas, aliados precisam ser protegidos e recursos gastos não retornam até que a equipe encontre suprimentos. Ao introduzir uma regra, pergunte: "Que escolha esta regra cria?". Se a resposta for apenas "mais uma coisa para anotar", provavelmente ela não é necessária.\n\nPara uma série focada em horror tático, considere as regras opcionais de Contagem de Munição, Lesões e Inspiração Resoluta (OPRPG, p. 174), e cenas de furtividade e perseguição (SaH, pp. 90-92) para variar o ritmo entre os combates.', 12),
((select id from sources where slug = 'arquivos_secretos_09'), 'campanha', 'Gerador de Mercenários',
 E'Tabelas da Hell Hunters (Arquivos Secretos 09), úteis para criar um mercenário ou dar individualidade a um mercenário "genérico". Role 1d10 para escolher a coluna e depois 1d6 duas vezes para definir dois traços de personalidade. Em seguida, role 1d20 duas vezes na tabela de características para a aparência.\n\nTraços, 1d10 = 1-2 (role 1d6):\n1 Inteligência emocional · 2 Pragmatismo · 3 Visão sistêmica · 4 Desprendimento · 5 Humildade · 6 Humor ácido\n\nTraços, 1d10 = 3-4 (role 1d6):\n1 Autodisciplina · 2 Percepção tática · 3 Gestão de risco · 4 Mentoria · 5 Coragem · 6 Prevenido\n\nTraços, 1d10 = 5-6 (role 1d6):\n1 Foco · 2 Decisividade · 3 Lealdade · 4 Hipervigilância · 5 Paciência · 6 Cautela ambiental\n\nTraços, 1d10 = 7-8 (role 1d6):\n1 Calma · 2 Adaptabilidade · 3 Confiança · 4 Senso de dever · 5 Perfeccionismo · 6 Aprendizagem contínua\n\nTraços, 1d10 = 9-10 (role 1d6):\n1 Resiliência · 2 Liderança · 3 Objetividade · 4 Integridade · 5 Presença marcante · 6 Pontualidade\n\nCaracterísticas da aparência (role 1d20):\n1 Porte atlético · 2 Olheiras marcantes · 3 Passada firme · 4 Expressão séria · 5 Cicatrizes discretas · 6 Cabelo curto · 7 Bronzeamento tático · 8 Botas táticas · 9 Óculos esportivos · 10 Cinto de utilidades · 11 Postura ereta · 12 Presença imponente · 13 Olhar atento · 14 Maxilar definido · 15 Barba ou franja alinhada · 16 Asseio impecável · 17 Roupas funcionais · 18 Relógio robusto · 19 Roupas com cores sóbrias · 20 Mãos calejadas', 13);

-- Os Hell Hunters sao pessoas: entram como criaturas mundanas.
update creatures set categoria = 'mundana'
where source_id = (select id from sources where slug = 'arquivos_secretos_09');
