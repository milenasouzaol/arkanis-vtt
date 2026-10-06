-- Pegar item do chão (pedido da Millie, 06/10): item lootável (ou artefato, ou marcado "vai pro
-- inventário") colocado no mapa já pode ser pego, sem precisar criar atividade. Vai pro
-- inventário da ficha (o equipamento de verdade, se veio do compêndio) com a quantidade dele, e
-- o token some do mapa. O item da aba Itens (o modelo) fica como estava.

create function public.pegar_item_do_chao(p_token_id uuid, p_character_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item campaign_items%rowtype;
begin
  if not pode_interagir(p_token_id) then
    raise exception 'Você não pode interagir com isto';
  end if;
  select i.* into v_item from campaign_items i join scene_tokens t on t.item_id = i.id where t.id = p_token_id for update of i;
  if not (v_item.categoria in ('lootavel', 'amaldicoado') or coalesce((v_item.efeitos ->> 'inventario')::boolean, false)) then
    raise exception 'Isso não dá pra pegar';
  end if;
  if not pode_editar_ficha(p_character_id)
     or not exists (select 1 from characters where id = p_character_id and campaign_id = v_item.campaign_id) then
    raise exception 'Você não pode pôr itens nesta ficha';
  end if;

  if v_item.compendio_id is not null then
    insert into character_inventory (character_id, equipment_item_id, quantity)
    values (p_character_id, v_item.compendio_id, greatest(1, v_item.quantidade));
  else
    insert into character_inventory (character_id, custom_item, quantity)
    values (p_character_id, jsonb_build_object(
      'name', v_item.name,
      'type', coalesce(v_item.detalhes ->> 'tipo', 'geral'),
      'category', coalesce(nullif(v_item.detalhes ->> 'categoriaSistema', ''), '0'),
      'spaces', v_item.carga,
      'description', trim(regexp_replace(coalesce(v_item.descricao, ''), '<[^>]+>', ' ', 'g')),
      'stats', '{}'::jsonb,
      'image_url', v_item.image_url), greatest(1, v_item.quantidade));
  end if;

  delete from scene_tokens where id = p_token_id;
end;
$$;

grant execute on function public.pegar_item_do_chao(uuid, uuid) to authenticated;
