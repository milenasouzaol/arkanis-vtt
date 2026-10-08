-- Amaldiçoar Arma & cia. (pedido da Millie, 07/10): a ficha que o mestre deu como Dono a um
-- jogador conta como personagem de jogador, e as armas dela aparecem pra mesa toda escolher.
create or replace function public.armas_da_campanha(p_campaign_id uuid)
 returns table(inventario_id uuid, character_id uuid, personagem text, item text, tipo text, natureza text, encantos jsonb)
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select i.id, c.id, coalesce(nullif(c.name, ''), 'Sem nome'),
         coalesce(e.name, i.custom_item ->> 'name', 'Item'),
         coalesce(e.type::text, i.custom_item ->> 'type'),
         coalesce(e.stats ->> 'natureza', i.custom_item -> 'stats' ->> 'natureza'),
         i.encantos
  from characters c
  join character_inventory i on i.character_id = c.id
  left join equipment_items e on e.id = i.equipment_item_id
  where c.campaign_id = p_campaign_id
    and acesso_aprovado()
    and (is_campaign_member(p_campaign_id) or is_campaign_owner(p_campaign_id))
    and (
      not c.npc or is_campaign_owner(p_campaign_id) or pode_ver_ficha(c.id)
      or exists (select 1 from campaign_actors a, jsonb_each_text(a.acesso_jogadores) d
                  where a.character_id = c.id and d.value = 'dono')
    )
    and coalesce(e.type::text, i.custom_item ->> 'type') in ('arma', 'municao')
  order by c.name, 4;
$function$;
