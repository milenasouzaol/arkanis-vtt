---
id: KAN-8
titulo: Refazer o card de ataque da aba de Combate e permitir editar o ataque
status: aprovado
camada: front
depende_de: []
---

## Contexto

A lista de ataques da aba de Combate tinha ficado para trás: usava o card genérico antigo
(`.vtt-attack-card`, cantos arredondados, ícone de espada em emoji, tudo numa linha só).
Não mostrava as características do ataque, não expandia e não dava para editar.

Isso aparecia principalmente ao mandar uma arma do Inventário para o combate: a arma chega
com tipo, alcance e empunhadura preenchidos, mas o card não mostrava nada disso.

## Critérios de aceite

- [x] O card mostra as características que o ataque tem e omite as que não tem.
- [x] Rolar ataque, dano e crítico continua funcionando, com o card aberto ou fechado.
- [x] Editar abre o modal preenchido, inclusive ataques alternativos e modificações.
- [x] Salvar a edição atualiza o ataque existente, não cria outro.
- [x] Munição vinculada continua aparecendo no card.
- [x] tsc, lint, 40 testes e build limpos.

## Referências visuais

Prints da Millie, 21/09/2026.

## Histórico

- 21/09/2026 criado — https://arkaniss.atlassian.net/browse/KAN-8
- 21/09/2026 concluído
