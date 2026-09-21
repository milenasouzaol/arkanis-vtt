---
id: KAN-5
titulo: Modal centralizado de Modificações e Maldições do item
status: aprovado
camada: front
depende_de: []
---

## Contexto

Aplicar modificação ou maldição num item já adicionado abria um bloco cru dentro do card,
sem estilo. Virou um modal centralizado, no mesmo desenho das outras telas.

## Escopo

- Modal centralizado com busca, abas Modificações | Maldições, lista do catálogo real e
  rodapé com Voltar / Criar nova.
- Lista das já aplicadas, com remover.

## Fora de escopo

- "Ir à Loja" e o aviso de precisar do livro.

## Critérios de aceite

- [x] Abre centralizado.
- [x] As abas trocam a lista entre modificações e maldições.
- [x] Lista do catálogo real (`weapon_mods` / `cursed_afflictions`), filtrada pelo tipo do item.
- [x] Sem "Ir à Loja" e sem aviso de livro.
- [x] Botões com forma, no lugar do visual cru.
- [x] tsc, lint, 30 testes e build limpos.

## Referências visuais

Print da Millie, 21/09/2026.

## Histórico

- 21/09/2026 criado — https://arkaniss.atlassian.net/browse/KAN-5
- 21/09/2026 concluído
