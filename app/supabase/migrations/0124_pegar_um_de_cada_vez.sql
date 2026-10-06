-- Pegar do contêiner (bug achado pela Millie, 06/10): pegar 1 item apagava os outros. Entradas
-- do compêndio não têm item_id (e as da campanha não têm compendio_id); a comparação com NULL
-- virava NULL e o filtro descartava essas entradas. Agora compara com coalesce, e dá pra pegar
-- mais de uma unidade de uma vez (p_quantidade).

create or replace function public.pegar_do_conteiner(p_token_id uuid, p_ref uuid, p_character_id uuid, p_quantidade int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cont campaign_items%rowtype;
  v_obj campaign_items%rowtype;
  v_qtd int := greatest(1, coalesce(p_quantidade, 1));
  v_tem int;
  v_equip uuid;
  v_ref text := p_ref::text;
begin
  if not pode_interagir(p_token_id) then
    raise exception 'Você não pode interagir com isto';
  end if;
  select i.* into v_cont from campaign_items i join scene_tokens t on t.item_id = i.id where t.id = p_token_id for update of i;
  if not pode_editar_ficha(p_character_id)
     or not exists (select 1 from characters where id = p_character_id and campaign_id = v_cont.campaign_id) then
    raise exception 'Você não pode pôr itens nesta ficha';
  end if;
  select coalesce(sum((c ->> 'quantidade')::int), 0) into v_tem
    from jsonb_array_elements(v_cont.conteudo) c
   where coalesce(c ->> 'item_id', '') = v_ref or coalesce(c ->> 'compendio_id', '') = v_ref;
  if v_tem < v_qtd then
    raise exception 'Isso não está mais aí';
  end if;

  select * into v_obj from campaign_items where id = p_ref and campaign_id = v_cont.campaign_id;
  if v_obj.id is not null then
    v_equip := v_obj.compendio_id;
  elsif exists (select 1 from equipment_items where id = p_ref) then
    v_equip := p_ref;
  else
    raise exception 'Item não encontrado';
  end if;

  -- Tira só o que foi pego; o resto fica (a entrada some quando chega a zero).
  update campaign_items set conteudo = coalesce((
    select jsonb_agg(case when coalesce(c ->> 'item_id', '') = v_ref or coalesce(c ->> 'compendio_id', '') = v_ref
                          then jsonb_set(c, '{quantidade}', to_jsonb((c ->> 'quantidade')::int - v_qtd)) else c end)
      from jsonb_array_elements(v_cont.conteudo) c
     where not ((coalesce(c ->> 'item_id', '') = v_ref or coalesce(c ->> 'compendio_id', '') = v_ref)
                and (c ->> 'quantidade')::int - v_qtd <= 0)), '[]')
  where id = v_cont.id;

  if v_equip is not null then
    insert into character_inventory (character_id, equipment_item_id, quantity) values (p_character_id, v_equip, v_qtd);
  else
    insert into character_inventory (character_id, custom_item, quantity)
    values (p_character_id, jsonb_build_object(
      'name', v_obj.name,
      'type', coalesce(v_obj.detalhes ->> 'tipo', 'geral'),
      'category', coalesce(nullif(v_obj.detalhes ->> 'categoriaSistema', ''), '0'),
      'spaces', v_obj.carga,
      'description', trim(regexp_replace(coalesce(v_obj.descricao, ''), '<[^>]+>', ' ', 'g')),
      'stats', '{}'::jsonb,
      'image_url', v_obj.image_url), v_qtd);
  end if;
end;
$$;
