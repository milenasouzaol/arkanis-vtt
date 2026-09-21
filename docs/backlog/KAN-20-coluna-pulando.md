---
id: KAN-20
titulo: Coluna da direita mudava de largura ao expandir um item
status: aprovado
camada: front
depende_de: []
---

Ver a issue no Jira: https://arkaniss.atlassian.net/browse/KAN-20

## Causa

As colunas rolam por conta própria (`overflow-y: auto`) e a barra de rolagem só existia
quando o conteúdo passava da altura. Expandir o card fazia a barra aparecer e comer a
largura; recolher fazia ela sumir e a largura voltar.

Medido: sem a correção a largura interna ia de **440px para 431px** ao aparecer a barra —
9px de pulo a cada abre/fecha.

## Critérios de aceite

- [x] Expandir e recolher não muda a largura (medido: 431px nos dois estados).
- [x] Vale para as três colunas.

## Histórico

- 21/09/2026 criado e concluído
