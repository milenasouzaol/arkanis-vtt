---
id: KAN-37
titulo: Fundo animado de Sangue: coágulos passando na veia
status: concluído
camada: front
depende_de: [KAN-33]
---

## Contexto

A Millie quer o fundo de Sangue como se estivesse dentro de uma veia, passando da esquerda
pra direita, com aspecto de coágulos (print da tela final de Sangue).

## Critérios de aceite

- Cores medidas do print: fundo `#69120b`, coágulos `#51120a`.
- Coágulos ovais de borda irregular andando da esquerda pra direita, em duas camadas.
- Vale em tudo: fundo da ficha, página de afinidade, tela final, empate e resultado.
- Respeita o "fundo sem animação" da ficha e o "menos movimento" do sistema.

## Como ficou

`VeiaSangue.tsx`, no mesmo `FundoShader` do ouro, da gota e do caos de Energia. Os
coágulos são células de Voronoi esticadas na horizontal e entortadas por ruído, com o
miolo manchado mais escuro; a camada de trás é menor, mais lenta e mais apagada, o que dá
a profundidade do tubo, e as paredes da veia (em cima e embaixo) ficam um pouco mais
escuras. A página de afinidade de Sangue perdeu a imagem própria e mostra o fundo da
ficha. Agora só Medo continua com imagem parada.
