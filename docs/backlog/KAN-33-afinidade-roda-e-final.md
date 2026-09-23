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

## Critérios de aceite

- [x] Orbes dentro dos círculos da arte em qualquer tamanho de tela.
- [x] Hover com o brilho de cada elemento.
- [x] Escolher, aceitar e finalizar gravam a afinidade.

12 testes novos (167 no total).

## Histórico

- 23/09/2026 criado — https://arkaniss.atlassian.net/browse/KAN-33
