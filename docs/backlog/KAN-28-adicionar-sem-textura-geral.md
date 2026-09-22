---
id: KAN-28
titulo: Tirar a textura de metal dos botões Adicionar Habilidade e Adicionar Ataque
status: aprovado
camada: front
depende_de: [KAN-7]
---

## Contexto

No KAN-7 a textura foi tirada só do "Adicionar Equipamento" e o "Adicionar Ataque"
ficou de propósito com a textura de metal. A Millie reverteu essa decisão: os três
botões "Adicionar" usam o mesmo estilo chapado.

## Solução

Os três botões já compartilham a classe `.combat-add-btn`. O fundo chapado `#1b1a20`
saiu do override `.inv-search-row .combat-add-btn` e virou a regra base, e a textura
de metal foi removida. O override, agora redundante, foi apagado.

## Critérios de aceite

- [x] Adicionar Habilidade sem textura.
- [x] Adicionar Ataque sem textura.
- [x] Adicionar Equipamento continua igual ao que já estava.

Conferido na página rodando: sobrou uma única regra de `.combat-add-btn`, com
`background: rgb(27, 26, 32)` e sem `background-image`.

## Referências visuais

Prints da Millie, 22/09/2026.

## Histórico

- 22/09/2026 criado — https://arkaniss.atlassian.net/browse/KAN-28
- 22/09/2026 concluído
