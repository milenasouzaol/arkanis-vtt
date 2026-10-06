-- Itens interativos (KAN-53, pedido da Millie, 06/10):
-- * conteudo: o que tem dentro de um Contêiner (baú, gaveta…): [{ "item_id": uuid, "quantidade": n }].
-- * scene_tokens.item_id: o item que este token/objeto da mesa representa (um baú colocado no
--   mapa, ou um NPC vendedor ligado a uma Loja). Clicar nele abre a interação.

alter table campaign_items add column conteudo jsonb not null default '[]';
alter table scene_tokens add column item_id uuid references campaign_items(id) on delete set null;
