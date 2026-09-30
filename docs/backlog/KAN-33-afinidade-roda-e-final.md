---
id: KAN-33
titulo: Afinidade — roda ritual de escolher o elemento e tela final
status: em revisão da Millie
camada: front
depende_de: [KAN-32]
---

## Contexto

Caminho **Liberdade** ("Escolha seu Elemento") da aba Afinidade, a partir dos prints da
referência que a Millie mandou.

## Roda ritual

- Arte de fundo (`fundo-decoracao.webp`) em tela cheia, apagada pra cinza.
- **Os orbes caem dentro dos círculos da própria arte.** As posições não são chutadas nem
  copiadas do print: saíram de análise da imagem, procurando o ponto mais longe de
  qualquer traço perto de cada círculo. O mesmo pro círculo do meio, onde entra o
  triângulo.
- A arte é um elemento que imita `background-size: cover` via container query
  (`width: max(100%, 178.71cqh)`), e os orbes são filhos dela em %. Por isso ficam
  grudados nos círculos em qualquer proporção de tela.
- `--zoom: 1.45` ampliando a arte, calibrado pra os tamanhos baterem com a referência:
  **orbe de 161px e triângulo de 420px** numa tela de 1918, iguais aos do print.
- Os textos (nome, descrição, botão) ficam numa camada separada, **fora** do zoom — senão
  a Westsac de 36px viraria 52px.
- Hover: brilho na cor do elemento atrás do orbe.
- Escolher: o orbe some, o símbolo entra no triângulo, aparece o nome (Westsac 36px, como
  no DevTools da referência) com a descrição embaixo, e "Aceitar o meu destino".
- O fundo assume um tom escuro do elemento, amostrado dos prints: sangue `#281518`,
  energia `#21192a`, conhecimento `#2c261e`, sem elemento `#17181f`.

## Tela final

- Fundo do elemento (o `bg-*.webp` que a ficha já usa) borrado até virar só cor, com uma
  "correnteza" de manchas mais escuras andando pra direita em 26s. Para com
  `prefers-reduced-motion`.
- A frase de cada elemento, tirada dos prints, e **Finalizar**.
- Finalizar grava `afinidade_elemento`; a ficha recarrega e já troca o fundo (com a
  animação que existia) e mostra o nome embaixo da foto.

## Onde a Millie mexe

Bloco `MEXA AQUI (roda de afinidade)` em `.afin-arte`: `--zoom` e `--forca-arte`.

## Valores que foram estimados, não medidos

- **Cores do brilho** (`#c8202b`, `#e8e8e8`, `#7b2fd6`, `#d9a227`): o brilho no print é
  borrado sobre fundo escuro, então só deu pra tirar o tom, não o hex cheio.
- **Tom escuro da Morte** (`#212124`): não havia print desse estado.

## Fora de escopo

- A aba depois de finalizar (o "Afinidade: X" com rituais e poderes) continua sem estilo.
- Premonição e Destino continuam nas telas provisórias.

## Achado de passagem

O commit do KAN-32 levou o `sharp` pro `package.json` por acidente (usado só pra converter
as artes). Removido neste.

## Ajustes depois do primeiro print

- Triângulo maior (15,1% → 17% da arte, 420 → 473px numa tela de 1918) e orbes maiores
  (5,8% → 6,4%, 161 → 178px), ainda dentro dos círculos da arte.
- **Tela travada.** A regra genérica das abas (`.sheet-root > *`) põe `overflow-y: auto`
  e é mais específica que o `overflow: hidden` da roda, então a tela rolava. A roda e a
  tela final ganharam a classe `aba-travada`, com `overflow: clip` — não `hidden`,
  que ainda deixava rolar por foco de teclado ou script. Medido: 0px rolados por script,
  por foco + rodinha, e na página.
- `--tamanho-orbe` e `--tamanho-triangulo` entraram no bloco MEXA AQUI.

## Terceira rodada

- Os orbes ganharam a textura granulada que a Millie mandou (`textura-orbe.webp`),
  ampliada 380% e com um recorte diferente em cada orbe.
- O símbolo dentro do triângulo foi de 27% pra 39% da largura dele — a proporção do
  print de referência. Vale na roda e na tela final. Variável `--tamanho-simbolo-meio`.

## Escolha por Mim

O cartão Premonição sorteia um dos quatro elementos (25% cada, `sortearElemento`) e já
abre a tela final dele, sem passar pela roda. O Voltar dali leva pros três cartões; na roda,
o Voltar da tela final continua levando pra roda. A tela provisória do sorteio e a lista
crua antiga saíram da aba.

Conferido clicando: 24 sorteios seguidos mostraram os quatro elementos; em 40 mil sorteios
no teste, cada um fica a menos de 2 pontos de 25%.

## Ouro derretido de Conhecimento

O fundo de Conhecimento (tela final, Decida seu Destino e resultado do teste) ficava laranja:
era o `bg-conhecimento` borrado com saturação forte. Virou um mármore dourado gerado no
navegador (`FundoElemento.tsx`): ruído torcido por um segundo ruído largo, pintado em
faixas com os tons medidos no print da referência. Duas camadas escorrem devagar em
sentidos opostos; o filtro é desenhado uma vez só e o movimento é por transform, que roda
na placa de vídeo. Mediana medida: `#765927` contra `#6d5524` da referência.

O filtro precisa de `color-interpolation-filters: sRGB`: no padrão (espaço linear) o ouro
saía cor de areia.

## Critérios de aceite

- [x] Orbes dentro dos círculos da arte em qualquer tamanho de tela.
- [x] Hover com o brilho de cada elemento.
- [x] Escolher, aceitar e finalizar gravam a afinidade.

12 testes novos (167 no total).

## Histórico

- 23/09/2026 criado — https://arkaniss.atlassian.net/browse/KAN-33
