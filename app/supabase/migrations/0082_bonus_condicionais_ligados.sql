-- Quais bonus condicionais de um item estao ligados.
--
-- Varios itens dao bonus que so valem em certa situacao: os Binoculos dao +5 em Percepcao
-- "pra observar coisas distantes", a Corda da +5 em Atletismo "pra descer buracos". Somar
-- isso direto deixaria a pericia inflada o tempo todo, entao a pessoa liga na hora em que
-- o bonus vale. O mesmo vale pras maldicoes que "ativam apos 1 dia de uso", que o app nao
-- tem como medir sozinho.
--
-- Guarda a chave de cada bonus ligado, como um vetor de texto. A chave descreve a origem
-- do bonus (de qual modificacao ou de que trecho da descricao ele veio), e nao a posicao
-- na lista: se a ordem mudar, o que estava ligado continua sendo o mesmo bonus.
-- Vazio = nenhum ligado, que e o padrao.

alter table character_inventory
  add column active_bonuses jsonb not null default '[]'::jsonb;
