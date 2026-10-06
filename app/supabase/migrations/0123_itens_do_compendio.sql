-- Itens do compêndio (pedido da Millie, 06/10): os equipamentos prontos dos livros
-- (equipment_items) entram nos Itens da mesa.
-- * campaign_items.compendio_id: o item foi criado a partir deste equipamento do livro.
-- * conteudo: além de { item_id }, aceita { compendio_id, nome } (equipamento do livro direto).
-- * Pegar do contêiner: equipamento do livro (ou item ligado a um) entra no inventário como o
--   equipamento de verdade (equipment_item_id), com dano, crítico, alcance… da ficha.

alter table campaign_items add column compendio_id uuid references equipment_items(id) on delete set null;

create or replace function public.item_do_token(p_token_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_item campaign_items%rowtype;
  v_conteudo jsonb;
begin
  if not pode_interagir(p_token_id) then
    raise exception 'Você não pode interagir com isto';
  end if;
  select i.* into v_item from campaign_items i join scene_tokens t on t.item_id = i.id where t.id = p_token_id;
  select coalesce(jsonb_agg(jsonb_build_object(
           'item_id', c.item_id, 'compendio_id', c.compendio_id, 'quantidade', c.quantidade,
           'name', coalesce(o.name, e.name, c.nome), 'image_url', coalesce(o.image_url, e.image_url),
           'carga', coalesce(o.carga, e.spaces), 'raridade', o.raridade)), '[]')
    into v_conteudo
    from jsonb_to_recordset(v_item.conteudo) as c(item_id uuid, compendio_id uuid, nome text, quantidade int)
    left join campaign_items o on o.id = c.item_id
    left join equipment_items e on e.id = c.compendio_id
   where c.quantidade > 0 and (o.id is not null or e.id is not null);
  return to_jsonb(v_item) - 'acesso_jogadores' - 'acesso_padrao' - 'mostrar_mestres' || jsonb_build_object('conteudo_detalhado', v_conteudo);
end;
$$;

drop function public.pegar_do_conteiner(uuid, uuid, uuid, int);

-- p_ref: o item_id (item da campanha) ou o compendio_id (equipamento do livro) da entrada.
create function public.pegar_do_conteiner(p_token_id uuid, p_ref uuid, p_character_id uuid, p_quantidade int)
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
   where c ->> 'item_id' = p_ref::text or c ->> 'compendio_id' = p_ref::text;
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

  -- Tira do contêiner (some quando chega a zero).
  update campaign_items set conteudo = coalesce((
    select jsonb_agg(case when c ->> 'item_id' = p_ref::text or c ->> 'compendio_id' = p_ref::text
                          then jsonb_set(c, '{quantidade}', to_jsonb((c ->> 'quantidade')::int - v_qtd)) else c end)
      from jsonb_array_elements(v_cont.conteudo) c
     where not ((c ->> 'item_id' = p_ref::text or c ->> 'compendio_id' = p_ref::text) and (c ->> 'quantidade')::int - v_qtd <= 0)), '[]')
  where id = v_cont.id;

  if v_equip is not null then
    -- Equipamento do livro: entra o de verdade, com as estatísticas da ficha.
    insert into character_inventory (character_id, equipment_item_id, quantity) values (p_character_id, v_equip, v_qtd);
  else
    insert into character_inventory (character_id, custom_item, quantity)
    values (p_character_id, jsonb_build_object(
      'name', v_obj.name,
      'type', coalesce(v_obj.detalhes ->> 'tipo', 'geral'),
      'category', coalesce(nullif(v_obj.detalhes ->> 'categoriaSistema', ''), '0'),
      'spaces', v_obj.carga,
      'description', trim(regexp_replace(coalesce(v_obj.descricao, ''), '<[^>]+>', ' ', 'g')), -- a ficha guarda texto
      'stats', '{}'::jsonb,
      'image_url', v_obj.image_url), v_qtd);
  end if;
end;
$$;

grant execute on function public.pegar_do_conteiner(uuid, uuid, uuid, int) to authenticated;
