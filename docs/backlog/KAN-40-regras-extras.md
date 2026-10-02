---
id: KAN-40
titulo: Aba Regras Extras: compêndio de consulta
status: concluído
camada: front
depende_de: []
---

## Contexto

A aba era uma lista crua de botões que abriam o texto puro do banco (`extra_rules`). A
Millie pediu pra fazer a aba, sem arte.

## Como ficou

- **Lista à esquerda**, agrupada por categoria (Mecânicas de Cena, Combate Alternativo,
  Equipamento Especial, Campanha), com busca no título e no texto, sem diferença de acento.
- **Leitura à direita**: categoria, título grande e o texto formatado a partir do texto
  puro (`regrasExtras.ts`): linha que termina em ":" vira subtítulo, "- " vira lista, o
  termo antes dos dois-pontos fica em negrito ("Colidir: ..."), e as tabelas "a · b · c"
  (DT→velocidade, DT→reparo...) viram bloquinhos lado a lado. Linha de leitura limitada
  (78 caracteres) pra não cansar.
- Cada lado rola sozinho; a aba não rola inteira. Abre na primeira regra.
- Mesmo vidro na cor do elemento das outras abas.
- Celular: a lista vai pra cima (38% da altura) e a leitura embaixo.
