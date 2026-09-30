# Teste de Personalidade — o que cada resposta vale

Gerado a partir de `app/src/pages/CharacterSheet/testeAfinidade.ts`. Cada resposta vale **2 pontos**: ou os 2 num elemento, ou 1 em cada de dois elementos.

## Como eu entendi cada elemento

- **Sangue** — a emoção no extremo: ódio extremo, amor extremo. Instinto, brutalidade, rebeldia, ser direto. O corpo e o desejo.
- **Morte** — o tempo. Solidão, calma, melancolia, introspecção. Analisa antes de agir e acredita que o tempo resolve. Familiaridade, aceitação, o mundo dos sonhos e dos medos.
- **Conhecimento** — curiosidade, informação, investigação. Responsabilidade pelos próprios atos, moralidade, vida em sociedade. Pode ser seco, mas não se desvincula da verdade.
- **Energia** — o caos. Aleatoriedade, instabilidade, relações voláteis. Não se importa com os outros nem com o fluxo da vida.

A regra oficial do livro base (**Sangue > Conhecimento > Energia > Morte > Sangue**) fecha com isso: a emoção atropela a razão, a razão doma o caos, o caos quebra o fluxo do tempo, e o tempo apaga a intensidade.

## Como o resultado é calculado

Somo os pontos de cada elemento e divido pelo que ele ganharia **em média respondendo ao acaso**. Morte e Conhecimento aparecem em mais respostas que Energia; sem essa divisão, quem responde meio no chute cairia mais neles (testei: Energia saía em 16% e Morte em 32%). Com a divisão, ao acaso cada um sai perto de 25%, e quem responde no estilo de um elemento cai nele. Empate é decidido na sorte entre os empatados.

## As respostas

### 1. O que você sente em relação às figuras de autoridade?

| resposta | vale |
| --- | --- |
| Desgosto | Energia 2 |
| Necessidade | Conhecimento 2 |
| Receio | Morte 2 |
| Inveja | Sangue 2 |
| Revolta | Sangue 1 + Energia 1 |
| Respeito | Conhecimento 1 + Morte 1 |

### 2. O Outro Lado te oferece um único desejo a ser realizado, o mentalize. Qual sentimento motiva o seu desejo?

| resposta | vale |
| --- | --- |
| Paixão | Sangue 2 |
| Prazer | Sangue 1 + Energia 1 |
| Saudades | Morte 2 |
| Ambição | Energia 2 |
| Arrependimento | Morte 1 + Conhecimento 1 |
| Justiça | Conhecimento 2 |

### 3. Quando você está em uma equipe, em qual posição você prefere estar?

| resposta | vale |
| --- | --- |
| Estrategista | Conhecimento 1 + Morte 1 |
| Liderança | Sangue 1 + Energia 1 |
| Linha de frente | Sangue 2 |
| Suporte | Energia 2 |
| Retaguarda | Morte 2 |
| Pesquisador | Conhecimento 2 |

### 4. Até o fim da sua vida, o que você mais quer conquistar?

| resposta | vale |
| --- | --- |
| Reconhecimento | Conhecimento 2 |
| Riquezas | Energia 1 + Conhecimento 1 |
| Bons relacionamentos | Sangue 1 + Morte 1 |
| Poder | Sangue 2 |
| Satisfação | Energia 2 |
| Paz | Morte 2 |

### 5. Ao conhecer uma nova pessoa, qual é o seu maior medo diante dessa relação?

| resposta | vale |
| --- | --- |
| Descobrir sua má índole | Conhecimento 2 |
| Decepcioná-la futuramente | Morte 1 + Sangue 1 |
| Não conseguir conquistar a sua aprovação | Sangue 1 + Conhecimento 1 |
| A timidez não deixar vocês se aproximarem | Morte 2 |
| Falta de honestidade | Conhecimento 2 |
| Nenhum | Energia 2 |

### 6. Qual sua maior qualidade?

| resposta | vale |
| --- | --- |
| Esperteza | Conhecimento 2 |
| Criatividade | Energia 2 |
| Carisma | Sangue 2 |
| Determinação | Sangue 1 + Conhecimento 1 |
| Empatia | Morte 1 + Sangue 1 |
| Não consigo definir | Morte 1 + Energia 1 |

### 7. Qual seu maior defeito?

| resposta | vale |
| --- | --- |
| Tato social | Conhecimento 2 |
| Impaciência | Sangue 2 |
| Dissimulação | Energia 1 + Conhecimento 1 |
| Teimosia | Sangue 1 + Conhecimento 1 |
| Procrastinação | Morte 2 |
| Não consigo definir | Energia 2 |

### 8. O que você sente em relação à mudança?

| resposta | vale |
| --- | --- |
| Ansiedade | Conhecimento 1 + Morte 1 |
| Empolgação | Energia 2 |
| Necessidade | Conhecimento 2 |
| Aversão | Morte 2 |
| Desafio | Sangue 2 |
| Luto | Morte 1 + Sangue 1 |

### 9. O que você sente em relação a punições?

| resposta | vale |
| --- | --- |
| Aversão | Energia 2 |
| Culpa | Morte 1 + Conhecimento 1 |
| Medo | Morte 2 |
| Justiça | Conhecimento 2 |
| Necessidade | Conhecimento 1 + Sangue 1 |
| Satisfação | Sangue 2 |

### 10. O que você sente em relação ao ato de matar?

| resposta | vale |
| --- | --- |
| Sou contra em qualquer circunstância. | Conhecimento 2 |
| Sou contra, mas é necessário. | Conhecimento 1 + Morte 1 |
| É algo que deve ser usado somente como último recurso. | Morte 2 |
| Sou indiferente. | Energia 2 |
| Existem maus no mundo que só podem ser resolvidos através da morte. | Sangue 1 + Conhecimento 1 |
| Faz parte da nossa natureza. | Sangue 2 |

### 11. O que mantém os seus pés no chão?

| resposta | vale |
| --- | --- |
| Esperança | Conhecimento 1 + Morte 1 |
| Relacionamentos | Sangue 2 |
| Sonhos | Morte 2 |
| Medos | Morte 1 + Sangue 1 |
| Pendências | Conhecimento 2 |
| Prazeres | Energia 2 |

### 12. O que ou quem é responsável pelos problemas da sua vida?

| resposta | vale |
| --- | --- |
| Minha dificuldade em buscar soluções. | Conhecimento 2 |
| Obstáculos que surgem sem parar. | Energia 2 |
| Azar ou destino. | Energia 1 + Morte 1 |
| Meus sentimentos e ações. | Sangue 1 + Conhecimento 1 |
| Pessoas má intencionadas. | Sangue 2 |
| Nada deve ser culpabilizado. | Morte 2 |

### 13. O que você sente em relação à morte?

| resposta | vale |
| --- | --- |
| Medo | Sangue 1 + Conhecimento 1 |
| Melancolia | Morte 2 |
| Revolta | Sangue 2 |
| Curiosidade | Conhecimento 2 |
| Familiaridade | Morte 2 |
| Conforto | Morte 1 + Energia 1 |

### 14. O quanto a visão dos outros sobre ti é importante para você?

| resposta | vale |
| --- | --- |
| Só me importo com a visão de algumas pessoas | Sangue 1 + Morte 1 |
| De extrema importância | Conhecimento 2 |
| Há alguma importância | Conhecimento 1 + Morte 1 |
| Um pouco | Morte 2 |
| A minha visão é mais importante | Sangue 1 + Energia 1 |
| Nem um pouco | Energia 2 |

### 15. O que você sente sobre a possibilidade de existir uma força maior?

| resposta | vale |
| --- | --- |
| Medo | Conhecimento 1 + Morte 1 |
| Raiva | Sangue 2 |
| Curiosidade | Conhecimento 2 |
| Esperança | Sangue 1 + Morte 1 |
| Conforto | Morte 2 |
| Indiferença | Energia 2 |

### 16. Os fins podem justificar os meios?

| resposta | vale |
| --- | --- |
| Sim, em todos os casos. | Sangue 2 |
| Somente se os fins me beneficiarem. | Energia 2 |
| Somente se os fins tiverem um peso maior do que os meios. | Morte 1 + Conhecimento 1 |
| Somente se os meios não ferirem os meus ideais. | Conhecimento 2 |
| Somente se os meios não me prejudicarem | Energia 1 + Morte 1 |
| Não, em nenhuma circunstância. | Conhecimento 1 + Morte 1 |

### 17. *(ainda não chegou)*

### 18. Se você tivesse poder suficiente para alterar a realidade, o usaria para modificar quem você é, mesmo que isso tenha consequências?

| resposta | vale |
| --- | --- |
| Sim, focando na minha aparência física. | Sangue 2 |
| Sim, focando na minha personalidade. | Energia 2 |
| Sim, focando na minha história. | Morte 2 |
| Sim, focando no jeito que as pessoas me veem. | Conhecimento 2 |
| Sim, focando nas minhas habilidades e talentos. | Sangue 1 + Conhecimento 1 |
| Não faria nenhuma alteração. | Morte 1 + Conhecimento 1 |

### 19. Qual desses aspectos da sua vida você seria capaz de abdicar em prol de uma vida em paz?

| resposta | vale |
| --- | --- |
| Formas de arte. | Sangue 1 + Conhecimento 1 |
| Bens materiais. | Morte 2 |
| Crenças e ideais. | Energia 2 |
| Ambições e sonhos. | Conhecimento 1 + Morte 1 |
| Prazeres carnais. | Conhecimento 2 |
| Relacionamentos. | Energia 1 + Morte 1 |

### 20. Você guardaria um segredo para proteger alguém, mesmo que seja algo que essa pessoa deveria saber?

| resposta | vale |
| --- | --- |
| Sim, o bem estar do outro é o que vale. | Sangue 1 + Morte 1 |
| Sim, algumas situações devem ser evitadas. | Morte 2 |
| Depende do peso desse segredo. | Conhecimento 1 + Morte 1 |
| Depende de quem é este segredo. | Energia 2 |
| Não, honestidade é um dos pilares de uma relação. | Conhecimento 2 |
| Não, cabe aos outros aguentar a verdade. | Sangue 2 |

### 21. Como você lida com impulsos e pensamentos violentos?

| resposta | vale |
| --- | --- |
| Eu constantemente os extravaso. | Sangue 2 |
| Às vezes eu os deixo escapar. | Sangue 1 + Energia 1 |
| Eu desconto em outras coisas ou pessoas. | Energia 2 |
| Eu busco me acalmar e me distrair. | Morte 2 |
| Eu consigo os reprimir. | Conhecimento 2 |
| Eu não sinto esses impulsos. | Morte 1 + Conhecimento 1 |

### 22. Você acredita que o mundo pode ser “corrigido” somente pelo uso de uma força maior como o paranormal ou o divino?

| resposta | vale |
| --- | --- |
| Sim, o mundo sempre será imperfeito. | Morte 1 + Energia 1 |
| Sim, os humanos não conseguem se ajudar. | Conhecimento 1 + Energia 1 |
| Sim, há maus intrínsecos no mundo. | Sangue 2 |
| Não, devemos ter a responsabilidade do nosso destino. | Conhecimento 2 |
| Não, há esperança no futuro. | Morte 2 |
| Não, o mundo não precisa ser corrigido. | Energia 2 |

### 23. Com que frequência você mascara quem você realmente é?

| resposta | vale |
| --- | --- |
| Sempre. | Energia 2 |
| Com uma certa frequência. | Morte 1 + Conhecimento 1 |
| Depende do grupo que estou inserido. | Conhecimento 2 |
| Depende do que eu estou sentindo. | Sangue 1 + Energia 1 |
| Raramente. | Morte 1 + Sangue 1 |
| Nunca. | Sangue 2 |

### 24. Em uma discussão, qual o seu principal objetivo?

| resposta | vale |
| --- | --- |
| Provar o seu ponto. | Sangue 1 + Conhecimento 1 |
| Tentar não magoar o outro. | Morte 2 |
| Tentar compreender outros pontos de vista. | Conhecimento 2 |
| Tentar transformar a visão do outro na sua. | Sangue 2 |
| Provocar o outro até ele desistir da discussão. | Energia 2 |
| Encerrar a discussão o mais rápido possível. | Morte 1 + Energia 1 |

### 25. O que há de mais obscuro dentro de ti?

| resposta | vale |
| --- | --- |
| Desejos. | Sangue 1 + Energia 1 |
| Segredos. | Conhecimento 2 |
| Rancores. | Sangue 2 |
| Sentimentos. | Morte 1 + Sangue 1 |
| Intenções. | Energia 2 |
| Dores. | Morte 2 |

### 26. O que te faz sofrer mais: O passado, o presente ou o futuro?

| resposta | vale |
| --- | --- |
| O passado. | Morte 2 |
| O presente. | Sangue 1 + Energia 1 |
| O futuro. | Conhecimento 1 + Energia 1 |

### 27. Se você pudesse, reverteria o seu maior arrependimento, mesmo que isso viesse com consequência?

| resposta | vale |
| --- | --- |
| Sim. | Sangue 2 |
| Não. | Morte 1 + Conhecimento 1 |
| Não possuo arrependimentos. | Energia 2 |

### 28. Você acredita que podemos entrar em paz uns com os outros a partir da compreensão do motivo das suas atitudes?

| resposta | vale |
| --- | --- |
| Sim. | Conhecimento 1 + Morte 1 |
| Não. | Sangue 1 + Energia 1 |

### 29. Um mundo que recai somente pela razão, é um mundo inclinado a ser injusto/infeliz?

| resposta | vale |
| --- | --- |
| Sim | Sangue 1 + Energia 1 |
| Não | Conhecimento 2 |

### 30. Você é uma boa pessoa?

| resposta | vale |
| --- | --- |
| Sim | Conhecimento 2 |
| Não | Sangue 1 + Energia 1 |
| Não cabe a mim definir. | Morte 2 |
