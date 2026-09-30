---
id: KAN-35
titulo: Fundo de textura em cada coluna da ficha quando há afinidade
status: em revisão da Millie
camada: front
depende_de: [KAN-33]
---

## Contexto

Com a afinidade escolhida, o fundo da ficha passa a ser o do elemento, e as colunas da aba
Agente ficavam transparentes por cima dele. A Millie quer cada coluna com um fundo próprio,
separado das outras, pra dar contraste.

## O que foi feito

- A textura que ela mandou virou `backgrounds/coluna-afinidade.webp`, com **55% de
  opacidade gravada no arquivo** — fundo de CSS não aceita opacidade própria, e um
  pseudo-elemento rolaria junto com o conteúdo da coluna.
- `.sheet-root` ganha a classe `com-afinidade` quando o personagem tem elemento.
- Com ela, `.vtt-col-side`, `.vtt-col-main` e `.vtt-col-combat` recebem a textura, cada
  uma no seu tamanho. O fundo fica parado enquanto o conteúdo da coluna rola.
- Sem afinidade, continua transparente.

Conferido numa réplica da ficha com fundo de Morte: as três colunas com a textura, e
nenhuma sem a classe.

## Ajuste fino

Se ficar escuro ou claro demais, a opacidade é regravada no arquivo (hoje 55%).

## Histórico

- 30/09/2026 criado — https://arkaniss.atlassian.net/browse/KAN-35
