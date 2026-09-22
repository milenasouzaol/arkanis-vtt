---
id: KAN-27
titulo: Alinhar o marcador de bônus/penalidade na coluna de total das perícias
status: aprovado
camada: front
depende_de: [KAN-23, KAN-24]
---

## Contexto

O `+5` verde de item equipado (KAN-23/25) e o `-5` de penalidade de carga (KAN-24)
eram spans no fluxo da célula de total. Como a célula centraliza o conteúdo, o número
saía do centro nas linhas que tinham marcador e ficava desalinhado das demais.

## Solução

Os dois marcadores viraram um único `.pericias-marcadores` posicionado absolutamente
a partir do centro da célula, com `pointer-events: none`. O número do total volta a ser
o único conteúdo no fluxo.

## Critérios de aceite

- [x] Total centralizado sem marcador.
- [x] Total centralizado com só o bônus verde.
- [x] Total centralizado com penalidade e bônus ao mesmo tempo.

Medido com `getBoundingClientRect()` nos três casos: centro do número igual ao centro
da célula (diferença máxima de 0,008px).

## Referências visuais

Print da Millie, 22/09/2026.

## Histórico

- 22/09/2026 criado — https://arkaniss.atlassian.net/browse/KAN-27
- 22/09/2026 concluído
- 22/09/2026 reaberto: o CSS não tinha entrado no arquivo (o script de edição não casou o
  trecho e falhou em silêncio). A verificação da primeira vez foi numa página isolada com o
  CSS escrito à mão, então provou a técnica e não o arquivo. Refeito e conferido carregando
  o  de verdade.
