-- Quais bonus condicionais de um item estao ligados.
--
-- Varios itens dao bonus que so valem em certa situacao: os Binoculos dao +5 em Percepcao
-- "pra observar coisas distantes", a Corda da +5 em Atletismo "pra descer buracos". Somar
-- isso direto deixaria a pericia inflada o tempo todo, entao a pessoa liga na hora em que
-- o bonus vale.
--
-- Guarda os indices dos bonus ligados, na ordem em que aparecem na descricao do item:
-- [0] liga o primeiro, [0, 2] liga o primeiro e o terceiro. Vazio = nenhum ligado, que e
-- o padrao.

alter table character_inventory
  add column active_bonuses jsonb not null default '[]'::jsonb;
