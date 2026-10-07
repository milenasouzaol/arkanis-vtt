-- Criar Item a partir de um objeto do mapa (pedido da Millie, 07/10): o mestre diz quantos podem
-- ser pegos ou se é infinito. Em campaign_items.efeitos.coleta:
--   'porPessoa' → cada personagem pega 1; campaign_items.quantidade é quantos ainda restam;
--                 acabou, o objeto some do mapa.
--   'infinito'  → cada personagem pega 1 e o objeto fica no mapa.
-- Nos dois, a mesma ficha não pega o mesmo item duas vezes (custom_item.origem_item).
-- Sem coleta (itens antigos): como era, pega tudo de uma vez e o objeto some.

create or replace function public.pegar_item_do_chao(p_token_id uuid, p_character_id uuid)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_item campaign_items%rowtype;
  v_modo text;
  v_qtd integer;
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

  v_modo := v_item.efeitos ->> 'coleta';
  if v_modo in ('porPessoa', 'infinito') then
    if exists (select 1 from character_inventory where character_id = p_character_id and custom_item ->> 'origem_item' = v_item.id::text) then
      raise exception 'Você já pegou este item';
    end if;
    if v_modo = 'porPessoa' and v_item.quantidade <= 0 then
      raise exception 'Não sobrou nenhum';
    end if;
    v_qtd := 1;
  else
    v_qtd := greatest(1, v_item.quantidade);
  end if;

  if v_item.compendio_id is not null and v_modo is null then
    insert into character_inventory (character_id, equipment_item_id, quantity)
    values (p_character_id, v_item.compendio_id, v_qtd);
  else
    insert into character_inventory (character_id, custom_item, quantity)
    values (p_character_id, jsonb_build_object(
      'name', v_item.name,
      'type', coalesce(v_item.detalhes ->> 'tipo', 'geral'),
      'category', coalesce(nullif(v_item.detalhes ->> 'categoriaSistema', ''), '0'),
      'spaces', v_item.carga,
      'description', trim(regexp_replace(coalesce(v_item.descricao, ''), '<[^>]+>', ' ', 'g')),
      'stats', '{}'::jsonb,
      'image_url', v_item.image_url,
      'origem_item', v_item.id), v_qtd);
  end if;

  if v_modo = 'infinito' then
    return;
  elsif v_modo = 'porPessoa' then
    update campaign_items set quantidade = quantidade - 1 where id = v_item.id;
    if v_item.quantidade - 1 > 0 then
      return;
    end if;
  end if;
  delete from scene_tokens where id = p_token_id;
end;
$function$;
