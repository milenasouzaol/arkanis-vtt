---
id: KAN-42
titulo: Imagem nos itens do catálogo e nos aliados
status: em revisão da Millie
camada: back + front
depende_de: [KAN-41]
---

## Como ficou

- Colunas `image_url` em `equipment_items` e `creatures` (e na tabela nova `allies`).
- Arte do AS09 convertida pra webp e servida pelo app em `public/conteudo/as09/`
  (10 itens, até 640px; 8 tokens hexagonais, 256px; ~400 KB no total).
- Card do inventário: a arte ocupa o lugar do ícone de mistério (item sem arte continua
  com o ícone). O catálogo de Adicionar Equipamento mostra a arte no detalhe do item.
- Item do catálogo editado na ficha mantém a arte (o modal de edição já guardava
  `image_url` no item personalizado, mas o card não mostrava).
