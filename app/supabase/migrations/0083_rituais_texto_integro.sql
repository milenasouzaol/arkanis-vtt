-- Texto integro dos 23 rituais que ainda estavam resumidos.
--
-- O seed original pegou esses rituais dos documentos de conteudo (docs/VTT_Conteudo_*.md),
-- que sao resumos. Aqui eles sao reescritos com o texto dos PDFs oficiais: 16 do
-- Sobrevivendo ao Horror e 7 dos Arquivos Secretos (1, 2, 4 e 6).
--
-- So mexe em effect, discente_effect e verdadeiro_effect: execucao, alcance, alvo,
-- duracao, resistencia e custos ja estavam certos e foram conferidos contra os PDFs.
--
-- ATENCAO, um caso a decidir: no PDF do Arquivos Secretos 02, o efeito de
-- "Capturar Momento" esta impresso com o texto do "Mapa Sanguineo" -- e um erro de
-- diagramacao do proprio livro, nao da extracao. O texto vai aqui como esta impresso.
-- Os aprimoramentos Discente e Verdadeiro dele sao coerentes com um ritual de Morte que
-- capta seres num simbolo, entao o efeito base impresso esta claramente trocado.
--
-- Nota: "Passagem de Conhecimento" e um ritual de Sangue E Conhecimento, mas a tabela
-- guarda um elemento so e ele esta como 'sangue'. Nao foi alterado aqui.

update rituals set
  effect = 'Você usa seu corpo como passagem para o Sangue, projetando agulhas e lâminas rubras praticamente imperceptíveis que se projetam contra o alvo. O ser sofre 3d4+3 pontos de dano de corte e fica sangrando. Se passar no teste de resistência, sofre apenas metade do dano e evita a condição.',
  discente_effect = 'muda o alcance para médio, o dano para 5d4+5 e o alvo para explosão com 6m de raio. Requer 2º círculo.',
  verdadeiro_effect = 'muda o alcance para longo, o dano para 10d4+10 e o alvo para explosão com 6m de raio. Passar no teste de resistência não evita a condição. Requer 3º círculo.'
where name = 'Esfolar' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Ninguém se surpreende com os feitos impossíveis de um cultista de Sangue. Trocar racionalidade por um físico sobrenatural é entorpecente e viciante, e permite viver experiências que inundam a mente de adrenalina.

Quando você falha em um teste de Acrobacia ou Atletismo, pode conjurar esse ritual para repetir esse teste, usando Presença no lugar do atributo base daquela perícia. Alternativamente, quando sofre dano de impacto, você pode usar esse ritual para reduzir esse dano em 20. Em qualquer caso, você só pode usar este ritual uma vez por rodada.

Quando conjura esse ritual você entra em um transe de Sangue momentâneo enquanto seu corpo extrapola seus limites, suas veias pulsando, os olhos arregalados, a língua para fora, saindo completamente do seu estado racional. Se usá-lo para reduzir dano, mesmo que reduza o dano a 0, logo após o impacto o Sangue retorce seus ossos e tendões, fazendo com que você passe 1 rodada atordoado enquanto se contorce em ângulos impossíveis.',
  discente_effect = 'muda a redução de dano de impacto para 40.',
  verdadeiro_effect = 'muda a redução de dano de impacto para 70. Requer 4º círculo e afinidade.'
where name = 'Sede de Adrenalina' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Qualquer um com um livro de biologia sabe que emoções são feitas de hormônios e feromônios. Para a natureza, ferramentas importantíssimas, mas para a entidade de Sangue, pontos fracos que ela pode explorar para devorar as frágeis espécies da Realidade. Sendo um ocultista com alguma experiência, você também é capaz de se aproveitar dessa fragilidade.

Enquanto estiver sob efeito desse ritual seu nariz enruga, suas pupilas dilatam e os odores ao seu redor se intensificam. Você recebe faro (OPRPG, p. 179). Além disso, essa nova camada de percepção inunda seu corpo com capacidades que você desconhecia. Em uma cena de perseguição (p. 90) você recebe +5 nos testes de Atletismo e não perde PV pela ação de esforço extra, desde que o caçador que está o perseguindo, ou a presa que você está caçando, emita odores.

Todo esse consumo do seu corpo tem um preço. Na próxima cena, você está sob efeito de fome e sede (OPRPG, p. 292) como se tivesse falhado no teste de Fortitude do primeiro dia e precisa suprir essa necessidade ou continuará sofrendo com os efeitos como descrito na regra.',
  discente_effect = 'muda o alcance para toque e o alvo para 1 ser.',
  verdadeiro_effect = 'muda o alcance para curto e o alvo para até 5 seres. Requer afinidade.'
where name = 'Odor da Caçada' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Você faz o sacrifício supremo e se entrega ao Sangue, sendo devorado em uma monstruosidade bestial por completo. Você fica mais forte, rápido e resistente, em troca de uma mente nublada pela raiva e uma aparência animalesca, sentindo os músculos rasgando, os ossos ficando protuberantes e a sua pele endurecendo em uma estrutura de couro rubro.

Você recebe faro, visão no escuro, cura acelerada 10, +10 em testes de ataque e rolagens de dano corpo a corpo e na Defesa, 30 PV temporários e seus ataques desarmados causam 1 dado de dano adicional e são considerados letais (sendo de corte, impacto ou perfuração à sua escolha no momento em que atacar). Após invocar o ritual, você não pode mais fazer ações que demandem foco e concentração (como conjurar um ritual). Além disso, devido a sua aparência e estado violento, você sofre –3d20 em testes de perícias para interação social, como Diplomacia e Enganação.

Diferente de outros rituais, este não possui fim. A cada rodada, você sente um pedaço da sua mente sendo devorado. Todas as suas memórias, pensamentos e existência sendo mastigados e consumidos pela intensidade do Sangue. As palavras fazem cada vez menos sentido, assim como falar e compreender os outros se torna cada vez mais impossível no meio da tormenta dos sentimentos. Suas emoções se convertem em um oceano de Sangue, tudo é tão intenso, todo toque é dor extrema, todo ataque é euforia, todo movimento é adrenalina… e finalmente, quando a cena em que conjurou o ritual acaba, o mínimo controle que você tinha de suas ações também se vai e você se torna, permanentemente, uma criatura de Sangue, sacrificando seu personagem para o Outro Lado e o perdendo para sempre.',
  discente_effect = 'muda os bônus para +20 e os PV temporários para 50. Requer afinidade.',
  verdadeiro_effect = null
where name = 'Martírio de Sangue' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Poéticos são os textos que associam a Morte com a luz no fim do túnel. Entretanto, qualquer ocultista sabe que isso é um engodo. A Morte é fria, úmida, nojenta e escura. Estar acostumado à escuridão faz parte daqueles que escolhem abrir seus corpos para a Morte.

Ao conjurar esse ritual, qualquer fonte de luz em alcance curto de você, natural ou paranormal, se apaga (criando um ambiente de penumbra ou escuridão, o que fizer mais sentido com a cena). A forma como isso acontece se assemelha às obras mais dramáticas de terror (lâmpadas estouram, janelas se fecham, nuvens densas bloqueiam a luz do sol, velas se dissipam, etc.). O efeito é instantâneo, mas no caso de eventos temporários, como nuvens cobrindo o sol em uma direção específica ou janelas que podem ser abertas, eles permanecem mantendo a escuridão, pelo menos, até o fim da cena (o vento não move a nuvem e a janela fica sobrenaturalmente impossível de ser aberta).

Você, por outro lado, recebe visão no escuro, até o fim da cena.',
  discente_effect = 'muda o alcance para determinar fontes de luz afetadas para longo. Requer 2º círculo.',
  verdadeiro_effect = 'como Discente, e além de você, até cinco outros seres dentro desse alcance recebem visão no escuro. Requer 3º círculo.'
where name = 'Apagar as Luzes' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Todos sabem que mortos não falam, e ocultistas experientes sabem: “Nada que é levado pela Morte pode voltar ao que era antes”. Contudo, isso não significa que cadáveres não tenham mais nada a dizer. E você sabe como conversar com a Morte. Ao preparar um cadáver humano e conjurar esse ritual, o Lodo da Morte se espalha por dentro do cadáver, reanimando-o forçadamente. Não se engane, ele ainda está morto, mas o seu passado está te observando agora, permitindo que ele responda algumas perguntas sobre sua vida de maneiras diferentes.

O cadáver é capaz de responder uma pergunta por rodada em que você mantém o ritual sustentado, até o limite de três rodadas. Se finalizar o ritual antes da terceira pergunta, o cadáver se desmancha em Lodo preto. Porém, ao final da terceira resposta, o cadáver é consumido pela Morte e se transforma em um esqueleto de Lodo (OPRPG, p. 217).

Não há necessidade de testes para tirar as respostas do cadáver, mas a clareza e objetividade delas ficam a critério do mestre e dependem do estado do cadáver.

Por exemplo, se está investigando um assassinato, falar o nome de um suspeito em voz alta pode resultar em uma série de espasmos violentos, simulando os movimentos das facadas que o corpo tomou para morrer. Ou se decidir mostrar algumas fotos de diferentes suspeitos, o crânio pode se virar lentamente para encarar seu assassino uma última vez.

Se o corpo não estiver em um estado de decomposição avançada, e ainda conter os órgãos responsáveis pela fala, é possível até tentar discernir uma palavra invertida ou outra que será vomitada em resposta junto com o Lodo.

Se necessário, os jogadores podem listar as perguntas que pretendem fazer e dar algum tempo para o mestre bolar as respostas, antes do jogo continuar.',
  discente_effect = 'aumenta o limite para quatro rodadas. Ao final da quarta rodada, ao invés de um esqueleto de Lodo, o cadáver se transforma em um enraizado (OPRPG, p. 214).',
  verdadeiro_effect = 'aumenta o limite para cinco rodadas. Requer 4º círculo e afinidade. Ao final da quinta rodada, ao invés de um enraizado, o cadáver se transforma em uma marionete (OPRPG, p. 218).'
where name = 'Língua Morta' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Por mais assustadora que seja a morte, você sabe que a melhor maneira de lidar com ela é aceitando o que ela tem a oferecer. Ao conjurar este ritual, você cobre o seu corpo com o fedor da Morte, parando suas funções biológicas e passando a cheirar como um cadáver apodrecendo. Seu coração para de bater, seus pulmões deixam de inflar, seu sangue cessa de fluir. Tudo fica, temporariamente, sendo sustentado pelo Lodo da Morte.

Nesse estado, qualquer animal se afasta de você instintivamente, como se você fosse uma fonte de doenças pútridas, e você sofre –3d20 em Diplomacia. Além disso, você recebe +5 em Furtividade, por se parecer com um corpo qualquer no cenário, e +10 em testes de Enganação para se fingir de morto. Em uma cena de furtividade (p. 92), enquanto você ficar parado, sua visibilidade é considerada 1 ponto menor.

Na prática, você não está morto nem é um morto-vivo, não está imune a doenças ou outros efeitos biológicos, ainda precisa dormir etc. Ter seu corpo sustentado pelo Lodo é terrível; para cada rodada em que mantém esse ritual, você sofre 1d4 pontos de dano de Morte que ignora resistências.',
  discente_effect = 'muda o alcance para toque e o alvo para 1 ser voluntário.',
  verdadeiro_effect = 'muda o alcance para curto e o alvo para até 5 seres voluntários. Requer afinidade.'
where name = 'Fedor Pútrido' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Você distorce a Realidade em espirais capazes de alterar as condições temporais de um objeto para avançá-lo no tempo, fazendo com que ele atinja o estado de decomposição mais avançado que um objeto do seu tipo poderia alcançar.

A definição exata do estado que o alvo pode alcançar depende da natureza do objeto e está sujeita a interpretação do mestre. Uma maçã, por exemplo, ficaria completamente apodrecida e decomposta, enquanto um diamante poderia não sofrer nenhum efeito. O pneu de um veículo poderia ressecar e rasgar (potencialmente fazendo seu motorista perder o controle). Em termos de regras, dependendo da natureza do objeto ele pode ficar danificado (o que impõe penalidades em seu uso, como –5 em testes em que ele seja empregado) ou pode ser completamente destruído.

Um objeto em uso por alguém ainda pode ser afetado, mas o ser pode fazer um teste de Fortitude para proteger o objeto do ritual.',
  discente_effect = 'muda o tamanho do objeto afetado para Grande.',
  verdadeiro_effect = 'muda o tamanho do objeto afetado para Enorme.'
where name = 'Singularidade Temporal' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Enganam-se aqueles que pensam que o Conhecimento Paranormal é incapaz de causar dano físico; inexistir é um dos processos mais terríveis que podem acontecer com alguém. A entidade do Conhecimento inexiste bilhões de neurônios de dentro do cérebro do alvo, causando a angústia inexplicável do vazio. O alvo sofre 2d6+2 pontos de dano de Conhecimento e fica frustrado por uma rodada. Se passar no teste de resistência, sofre apenas metade do dano e evita a condição. O alvo precisa ter um cérebro; o efeito se reflete como uma dor de cabeça severa que faz sangrar levemente pelos olhos, narinas, orelhas e boca.',
  discente_effect = 'muda o alcance para longo, o dano para 3d6+3 e o alvo para até 5 seres a sua escolha. Requer 2º círculo.',
  verdadeiro_effect = 'muda o alcance para extremo, o dano para 8d6+8 e a condição para esmorecido. Se passar no teste de resistência, em vez de esmorecido, fica frustrado. Requer 3º círculo.'
where name = 'Desfazer Sinapses' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Diante do Conhecimento Paranormal, ninguém pode manter seus segredos por muito tempo. Uma luz espectral como ondas de uma aurora boreal dourada surge na área do ritual, e qualquer ser dentro dessa área é obrigado a falar apenas a verdade, inclusive o conjurador. Se passar no teste de resistência, o ser pode mentir (o que ainda pode ser percebido com testes de Intuição). Além disso, qualquer ser que tente se esconder, obter camuflagem ou ficar invisível dentro da luz é imediatamente revelado por minúsculos sigilos que brilham ao seu redor.',
  discente_effect = 'muda o alcance para médio e a área para esfera com 9m de raio e o conjurador não é mais afetado pelo efeito.',
  verdadeiro_effect = 'como discente, mas muda o alcance para longo e a duração para cena. Além disso, independentemente da distância, você pode ouvir tudo que é falado na área, como se estivesse nela. Requer 4º círculo e afinidade.'
where name = 'Aurora da Verdade' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Você toca um objeto que, por alguma razão, está ilegível ou incompreensível por ter sido danificado pelo tempo ou outro fator. O objeto precisa ser uma fonte de conhecimento escrito, como um livro, caderno, papel, pergaminho ou outro texto impresso, e você só precisa ter um pedacinho do texto equivalente a um dedo mindinho para conseguir restaurá-lo.

Após a conjuração, o objeto é completamente restaurado para o momento em que recebeu sua última anotação e permanece assim enquanto o conjurador tocá-lo. Se o conjurador soltá-lo, o objeto retorna ao seu estado danificado. O Conhecimento não consegue relembrar objetos destruídos por meios paranormais.',
  discente_effect = 'o objeto permanece restaurado até o fim da missão.',
  verdadeiro_effect = 'em vez da descrição original, o ritual pode ser usado para alterar o objeto de forma imperceptível, conforme a vontade do conjurador (transformando uma folha com um texto qualquer em um documento de permissão de porte de armas “legítimo”, por exemplo). Além disso, o objeto permanece alterado até o fim da missão. Requer afinidade.'
where name = 'Relembrar Fragmento' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Você profana a Realidade, pronunciando um dos Sigilos do Conhecimento em voz alta, deturpando a natureza de um ser com o poder do Outro Lado. O sigilo é um som indescritível nunca escutado antes, e impossível de ser gravado ou lembrado. Ele causa um dos efeitos abaixo, à sua escolha:

Esquecer: o alvo esquece quem é ou o que está fazendo e fica atordoado por 1d4+1 rodadas (apenas uma vez por cena). Se passar no teste de resistência, ou se já foi atordoado por este ritual, fica desprevenido por 1d4 rodadas.

Cegar: o alvo fica cego. Se passar no teste de resistência, fica ofuscado por 1d4 rodadas.

Inexistir: o alvo "desaparece" da Realidade brevemente, retornando após alguns instantes. Para todos os efeitos, ele deixa de existir por 1d4+1 rodadas, ou 1 rodada, se passar no teste de resistência. Ao final desse período, o alvo retorna para o espaço onde estava (ou um espaço adjacente, se o local original estiver ocupado). Se o alvo for uma criatura, em vez disso ela retorna para um ponto qualquer a escolha dela em um raio de 18m do espaço onde estava. Um ser só pode ser inexistido desta forma uma vez por cena.',
  discente_effect = 'muda o alcance para extremo.',
  verdadeiro_effect = 'muda o alvo para até cinco seres. Requer afinidade.'
where name = 'Pronunciar Sigilo' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Até mesmo o caos proposto pela Energia pode ser um recurso. Ao fazer um teste de Tecnologia para lidar com um objeto eletrônico, você pode, após saber se passou no teste ou não, conjurar este ritual para receber as informações que buscava de outra forma, usando descargas de Energia para forçar o aparelho a seguir suas vontades.

Esta outra forma precisa que o mestre tenha acesso a uma música, pois o jogador será desafiado em um jogo de “estátua”. Se não conhece o jogo, saiba que enquanto a música durar você deve mover os dedos no ar como se estivesse usando um teclado invisível — ou se mover aleatoriamente — mas quando o mestre interrompê-la, deve ficar completamente imóvel. O mínimo movimento errado, a critério do mestre, resulta em falha na aquisição da informação. O mestre pode interromper a música conforme preferir, mas se você não falhar até o fim dela, é bem-sucedido e descobre o que queria do aparelho eletrônico. O jogo de estátua pode ser substituído por outro jogo analógico de preferência da mesa.

Contudo, após receber as informações — ou não — o objeto é tomado por flickering, chiados, sons de impressora, cores contrastantes, imagens invertidas e janelas aleatórias fazendo perguntas sem sentido, que tornam seu uso impossível, como se ele estivesse sob ataque de um vírus paranormal.',
  discente_effect = 'você só falha no teste se errar duas vezes no jogo de estátua. Requer 2º círculo.',
  verdadeiro_effect = 'você só falha no teste se errar três vezes no jogo de estátua. Requer 3º círculo.'
where name = 'Overclock' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Permitindo que a Energia corra pelo seu corpo, você reorganiza suas moléculas até que se deformem em fótons, fazendo sua matéria piscar como a de um monitor com a imagem oscilando. Enquanto estiver nesse estado, você e todo objeto que estiver carregando são capazes de atravessar objetos sólidos.

Esse ritual não deixa você incorpóreo, pois ele depende da sua intenção ativa para funcionar. Para se mover através de cada objeto sólido, por menor que seja, você deve primeiro gastar uma ação de movimento. Sempre que fizer isso, há 25% (1 em 1d4) de você não atravessar, dando de cara com o objeto.

Se usado em uma cena de perseguição (p. 90), permite que você use a ação de cortar caminho sem sofrer penalidade em Atletismo.

Existir nesse estado de flickering é prejudicial para seu corpo. Para cada rodada em que esse ritual estiver ativo, a Energia desfragmenta sua matéria, fazendo com que sofra 1d4 pontos de dano de Energia que ignoram resistência. Se terminar sua rodada com parte do corpo, ou todo ele, em um objeto sólido, você sofre 1d4 pontos de dano de Energia adicional.',
  discente_effect = 'muda o alcance para toque e o alvo para 1 ser voluntário.',
  verdadeiro_effect = 'muda o alcance para curto e o alvo para até 5 seres voluntários. Requer 4º círculo.'
where name = 'Tremeluzir' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Deixando que a Energia distorça as ondas ao seu redor, você inibe a emissão de qualquer som a partir de você. É como se a entidade isolasse você das frequências sonoras do universo. Por exemplo, seus passos não emitem mais barulho, uma arma disparada por você não tem estampido, o som da sua voz é emudecido. Por outro lado, esse isolamento também impede que qualquer som alcance você.

Esse ritual concede +10 em testes de Furtividade e reduz qualquer ganho de visibilidade em cenas de furtividade (p. 92) em 1, a critério do mestre.

Um jogador que tenha seu personagem sob efeito desse ritual só pode falar na mesa se tiver permissão do mestre (mesmo pra descrever suas ações). Caso contrário, deve tentar se comunicar sem usar a voz, como por mímica ou mensagens de celular. Se falar sem permissão, o ritual se esvai.',
  discente_effect = 'muda o alcance para toque e o alvo para 1 ser.',
  verdadeiro_effect = 'muda o alcance para curto e o alvo para até 5 seres. Requer afinidade com Energia.'
where name = 'Mutar' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Muitos assumem que a radiação só existe para trazer destruição, sem fazer ideia de que grande parte dos tratamentos de saúde atuais dependem dessa assustadora forma de energia. A mesma alteração molecular que pode ser usada para desfragmentar a matéria também pode ser usada para devolvê-la ao seu estado natural.

Como um ocultista experiente, você usa de todo seu esforço para que o caos embaralhe a Realidade com o intuito de destruir apenas uma estrutura maligna habitando um corpo. Você pode curar o ser de uma condição entre abalado, apavorado, alquebrado, atordoado, cego, confuso, debilitado, enjoado, envenenado, esmorecido, exausto, fascinado, fatigado, fraco, frustrado, lento, ofuscado, paralisado, pasmo ou surdo, ou uma doença ou um veneno, a sua escolha. Este ritual afeta efeitos paranormais, exceto aqueles causados pela entidade de Energia e condições permanentes.

Por mais caridosa que seja sua ação, a Energia do Outro Lado nunca vai deixar de pregar peças, e o caos é inevitável. Após curar o ser, este deve fazer um teste de Fortitude (DT 30). Se falhar, é incubado pelo vírus do infectcídio (OPRPG, p. 292).',
  discente_effect = null,
  verdadeiro_effect = null
where name = 'Milagre Ionizante' and source_id = (select id from sources where slug = 'sobrevivendo_ao_horror');

update rituals set
  effect = 'Você transfere sua consciência para o corpo do alvo.

Quando conjura este ritual, você deve escolher entre habitar o corpo do alvo e tentar sobrepor a mente dele ou fazer uma transferência completa, em que as consciências são trocadas e o alvo passa a habitar o seu corpo.

No primeiro caso, se o alvo falhar no teste de resistência, você passa a controlar o corpo dele (o seu próprio corpo cai inconsciente). Você continua usando sua ficha, mas substitui seus atributos físicos (Força, Agilidade e Vigor) pelos do alvo. De acordo com o mestre, você pode usar outras características inatas do corpo do alvo. No início de cada turno do alvo, ele pode repetir o teste de resistência para tentar recuperar o controle de seu corpo. Além disso, a critério do mestre (conforme a história e a sua relação com a pessoa), o alvo pode tentar recuperar o controle mais de uma vez por rodada. Se ele passar, você retorna para seu próprio corpo, que desperta na hora. Se o corpo do alvo morrer enquanto você o está ocupando, você também morre. Se o seu corpo morrer, você fica permanentemente preso no corpo do alvo e, se o alvo conseguir recuperar o controle do corpo, você morre.

No segundo caso, se o alvo falhar no teste de resistência, você passa a controlar o corpo dele e ele o seu. Ambos continuam usando suas fichas, mas substituem seus atributos físicos (Força, Agilidade e Vigor) pelos do outro. De acordo com o mestre, ambos podem usar outras características inatas do outro corpo. Nesse caso, o alvo não pode tentar se libertar novamente. A única maneira de reaver seu corpo é com o fim da duração do ritual ou conjurando este ritual contra aquele que tomou seu corpo de você. Se um dos corpos morrer, quem está ocupando ele também morre e é impossível retornar para um corpo morto.',
  discente_effect = 'O alcance muda para curto e a duração para 1 dia. No primeiro caso, o alvo só pode tentar recuperar o controle do corpo uma vez por dia ou uma vez por cena (o que for maior), em vez de uma vez por rodada.',
  verdadeiro_effect = 'O alcance muda para médio e a duração para permanente. No primeiro caso, o alvo só pode tentar recuperar o controle do corpo uma vez por ano, em vez de uma vez por rodada. Requer 4º círculo e afinidade.'
where name = 'Passagem de Conhecimento' and source_id = (select id from sources where slug = 'arquivos_secretos_01');

update rituals set
  effect = 'Você toca em uma superfície e desenha um mapa com gotas de sangue que sinalizam em tempo real a localização de todos os seres em um raio de 1 km a partir da superfície tocada. Os seres podem fazer um teste de resistência para evitar este efeito.',
  discente_effect = 'o ritual também revela a condição de saúde dos seres que falharem no teste de resistência, conforme seus PV: ileso (PV em 100%); ferido (PV entre 99% e 51%); machucado (PV entre 50% e 1%); morrendo (PV em 0% e/ou condição morrendo).',
  verdadeiro_effect = null
where name = 'Mapa Sanguíneo' and source_id = (select id from sources where slug = 'arquivos_secretos_02');

update rituals set
  effect = 'Você prende a mente de uma pessoa em um labirinto. Pela duração do ritual, o alvo é obrigado a gastar suas ações para se mover em uma direção aleatória. No início de cada um de seus turnos, o alvo pode repetir o teste de resistência. Se passar, se liberta do ritual.',
  discente_effect = 'muda o alcance para longo.',
  verdadeiro_effect = 'muda o alcance para longo e a duração para cena, mas o alvo ainda pode tentar se libertar no início de seus turnos. Requer 3º Círculo.'
where name = 'Labirinto Mental' and source_id = (select id from sources where slug = 'arquivos_secretos_02');

update rituals set
  effect = 'Você toca em uma superfície e desenha um mapa com gotas de sangue que sinalizam em tempo real a localização de todos os seres em um raio de 1 km a partir da superfície tocada. Os seres podem fazer um teste de resistência para evitar este efeito.',
  discente_effect = 'acrescenta ao efeito a opção de gastar uma ação padrão para fazer o símbolo explodir em energias entrópicas, que causam 4d8 pontos de dano de Morte em todos os seres captados por ele no momento da explosão (um teste de resistência de Fortitude contra a DT do ritual reduz o dano à metade).',
  verdadeiro_effect = 'como discente, mas muda o dano para 8d8 pontos de dano de Morte. Requer 3º Círculo.'
where name = 'Capturar Momento' and source_id = (select id from sources where slug = 'arquivos_secretos_02');

update rituals set
  effect = 'Você concentra a estática caótica da Energia e a projeta contra o alvo, disparando um raio que causa 8d6 pontos de dano de Energia.',
  discente_effect = 'o dano muda para 8d8 pontos de dano de Energia.',
  verdadeiro_effect = 'o efeito muda para a descrição a seguir: “Você canaliza relâmpagos. Em seguida, dispara um raio que causa 8d10 pontos de dano de Energia em um ser em dentro do alcance. Nos seus próximos turnos, até o fim da cena, você pode gastar uma ação padrão para disparar outro raio com o mesmo efeito”. Requer 3º Círculo.'
where name = 'Rajada Caótica' and source_id = (select id from sources where slug = 'arquivos_secretos_02');

update rituals set
  effect = 'Ao conjurar esse ritual, você cria um chamariz com a sua aparência em um espaço vazio dentro do alcance. A cópia de Energia realiza movimentos simples em repetição e pode pronunciar uma única frase à sua escolha. Essa cópia tem uma conexão estabelecida com você com um raio de 50km. Enquanto se mantiver dentro da área de conexão do ritual, a qualquer momento, você pode gastar uma reação para trocar de lugar com o chamariz, perdendo 2d4 SAN ao fazer isso. O ritual se dissipa se qualquer dano for causado a cópia ou se você deixar a área de conexão do ritual.',
  discente_effect = 'muda a duração para permanente. Gastando uma ação padrão, você pode cobrir seus olhos e ouvidos para alternar seus sentidos entre o seu corpo original e a cópia. Você passa a ver e ouvir através dos olhos e ouvidos da cópia até descobrir seus olhos ou ouvidos. Enquanto faz isso, você fica cego, surdo e pasmo. Requer 2º círculo.',
  verdadeiro_effect = 'Como na versão discente, mas quando cobre olhos e ouvidos, você também pode falar através da cópia e escolher a aparência dela com base em alguém que já tenha visto e saiba descrever. Além disso, quando você optar por trocar de lugar com a cópia, pode escolher dissipar o ritual, causando 6d6 pontos de dano de Energia (Reflexos reduz o dano à metade) em todos os seres em alcance curto de onde seu corpo saiu e de onde ele aparece. Requer 3º círculo.'
where name = 'Backup' and source_id = (select id from sources where slug = 'arquivos_secretos_04');

update rituals set
  effect = 'Em conexão com o Conhecimento, você invade a mente da pessoa com fragmentos de dúvidas e inseguranças que já existiam em seu subconsciente. Todas elas são expandidas ao extremo sob uma influência menor do Sangue, fazendo com que cada decisão pareça ser a errada. Enquanto o ritual estiver ativo, o alvo deve fazer um teste de Vontade no início de cada um de seus turnos. Se falhar, ele deverá rolar novamente o maior dado de qualquer teste feito até o fim de seu turno. Se o alvo passar no teste de resistência duas vezes seguidas, o efeito termina.',
  discente_effect = 'muda o alvo para “1 ser”. Além do normal, um alvo que não tenha resistido ao ritual não pode realizar ações hostis contra o conjurador. Quando usado em criaturas, o ritual não desperta inseguranças (elas não possuem nada disso). Mas seus movimentos são reescritos através do Conhecimento, resultando em efeitos similares. Requer 2º círculo.',
  verdadeiro_effect = 'muda a resistência para “Vontade anula”. O efeito muda: em vez de alimentar dúvidas, o ritual fortalece as convicções, qualidades e certezas do alvo até extremos absurdos. Ele se torna extremamente confiante em suas próprias capacidades, convencido de que pode superar qualquer obstáculo ou proteger aqueles ao seu redor. Enquanto o ritual estiver ativo, o alvo rola novamente o menor dado de qualquer teste realizado, mantendo o novo resultado. Além disso, sempre que um aliado adjacente do alvo sofrer um ataque, aquele sobre o efeito do ritual deve gastar uma reação para se colocar no caminho do golpe, tornando-se o novo alvo do ataque (e acreditando ser invencível). Um alvo involuntário afetado ainda pode resistir ao ritual com um teste de Vontade no início de seus turnos. Requer 3º círculo e afinidade.'
where name = 'Hesitação Forçada' and source_id = (select id from sources where slug = 'arquivos_secretos_06');
