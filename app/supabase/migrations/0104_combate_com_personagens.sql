-- Combate ligado à aba Personagens (pedido da Millie em 05/10).
--
-- Antes a ameaça do combate era só "uma criatura do bestiário" com uma vida própria
-- (combatant_vida), sem token e sem ficha na aba Personagens. Agora toda ameaça do combate
-- é um personagem da mesa (campaign_actors): a vida fica nele, então o combate, o token e a
-- ficha mexem na mesma vida.
--
-- combats.atores: os personagens da aba Personagens que lutam nesse combate (ameaças e NPCs).
--   As ameaças escolhidas do bestiário (combats.ameacas) viram personagens em
--   uma pasta com o nome do combate quando o combate começa, e passam pra cá.
-- combatants.actor_id: o personagem por trás de cada linha da ordem de iniciativa.

alter table combats add column if not exists atores uuid[] not null default '{}';

alter table combatants add column if not exists actor_id uuid references campaign_actors(id) on delete cascade;

alter table combatants drop constraint if exists combatants_tipo_check;
alter table combatants add constraint combatants_tipo_check check (tipo in ('jogador', 'ameaca', 'npc'));
