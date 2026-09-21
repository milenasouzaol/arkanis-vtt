---
id: KAN-12
titulo: Modal de Modificações abre atrás do modal de editar item
status: aprovado
camada: front
depende_de: [KAN-10]
---

Ver a issue no Jira: https://arkaniss.atlassian.net/browse/KAN-12

## Causa

O modal de modificações usava `z-index: 50` (camada dos pickers) e o de editar item usa
`z-index: 90` (camada do modal de ataque). Como um abre de dentro do outro, o de dentro
tem que ficar por cima.

Junto disso havia um segundo problema, que ainda não tinha aparecido: o modal de
modificações era renderizado dentro da `div` de fundo do modal de edição. Mesmo saindo por
portal no DOM, o clique sobe pela árvore do React — então clicar dentro dele dispararia o
`onClose` do fundo e fecharia o modal de edição junto.

## Critérios de aceite

- [x] O modal de modificações abre por cima do de editar item.
- [x] Clicar dentro dele não fecha o modal de edição atrás.
- [x] Fechar o de modificações volta para o de edição com o que estava preenchido.

## Histórico

- 21/09/2026 criado e concluído
