---
id: KAN-36
titulo: Afinidade — Teste de Personalidade
status: em revisão da Millie
camada: front
depende_de: [KAN-32, KAN-33]
---

## O que foi feito

Caminho **Destino** da aba Afinidade, a partir dos prints da referência:

- **Atenção!**: o texto de introdução, com Voltar e Transcender.
- **Perguntas**: até 6 opções em duas colunas (número ímpar deixa a última centrada),
  "N/total" em cima, Desistir no canto.
- **Luz que segue o mouse** dentro do botão, em cinza (na referência é azul).
- **Escolhida** em cinza, com o mesmo claro/escuro medido no print azul.
- **Voltar / Continuar**: Continuar só libera depois de escolher; a primeira não tem
  Voltar; voltar mantém a resposta.
- **Bolinhas**: X nas respondidas, espiral girando na atual, vazia nas próximas.
- **Extra**: a pergunta de honestidade, sem ponto, com Terminar.
- O resultado abre a tela final do elemento; o Voltar dali leva pros três cartões.
- Cantos decorados: a imagem de decoração foi recortada em três peças, cada uma presa no
  seu canto da tela.

Cores medidas nos prints: página `#191a21`, botão `#1e1c1a` com borda `#424242`,
Continuar ativo `#d6d6d8`.

## Pontuação

Cada resposta vale 2 pontos (2 num elemento, ou 1+1 em dois). O total de cada elemento é
dividido pelo que ele ganharia **em média respondendo ao acaso**. Sem isso, Energia saía
em 16% e Morte em 32% nas respostas ao acaso, porque aparecem em quantidades diferentes
de opções. Com a divisão: 23,7% a 26,1% cada, e quem responde no estilo de um elemento
cai nele. Empate: sorte entre os empatados.

A tabela completa está em `docs/afinidade-teste-de-personalidade.md`, gerada do código.

## Achado de passagem

A `Optima.ttf` do projeto tem a tabela de caracteres errada e troca acentos por letras
cirílicas ("você" vira "vock"). Toda a Afinidade passou pra `Optima Nova LT Pro`, a mesma
família. Só código meu usava a `.ttf`.

## Pendente

- **Pergunta 17**: não veio nos prints. O contador mostra "N/29" até ela chegar.
- **Enfeite do título** (`title__arrow`, 204×27, espelhado): é uma imagem que não está
  na pasta. Por enquanto, uma linha fina.
- Revisão da Millie dos pesos de cada resposta.

## Critérios de aceite

- [x] Tela de Atenção, perguntas e Extra com o visual da referência.
- [x] Hover e escolhida em cinza.
- [x] Bolinhas nos três estados, a atual girando.
- [x] O resultado leva pra tela final do elemento certo.

21 testes novos (199 no total). Fluxo testado clicando no navegador: respondendo tudo no
estilo de Energia, cai em "O caos é inevitável.".

## Histórico

- 30/09/2026 criado — https://arkaniss.atlassian.net/browse/KAN-36
