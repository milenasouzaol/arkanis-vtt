-- Loja (KAN-53, pedido da Millie, 06/10): item de categoria "Loja" (ou um NPC ligado a ela) com um
-- estoque. Cada loja escolhe como cobra: Requisição (a patente do agente limita quantos itens de
-- cada categoria I–IV ele carrega; categoria 0 é livre), Dinheiro (paga com o dinheiro da ficha)
-- ou os dois (quem compra escolhe). O dinheiro do personagem fica na ficha (topo do Inventário).
--
-- Estoque (campaign_items.conteudo, como no Contêiner): [{ item_id | compendio_id, nome,
-- quantidade, ilimitado, preco }]. Modo da loja: detalhes.loja.modo = requisicao | dinheiro | ambos.

alter table characters add column dinheiro numeric not null default 0;

alter table campaign_items drop constraint campaign_items_categoria_check;
alter table campaign_items add constraint campaign_items_categoria_check
  check (categoria in ('lootavel', 'conteiner', 'documento', 'amaldicoado', 'armadilha', 'loja'));

-- Limite de itens da categoria (I–IV) pela patente, ou o ajuste manual da ficha.
-- (pela ordem da patente: sem patente, recruta, operador, agente especial, oficial, elite)
create function public.limite_da_categoria(p_character_id uuid, p_cat text)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    nullif(c.item_limit_override ->> p_cat, '')::int,
    (array[
      array[1, 0, 0, 0], array[2, 1, 0, 0], array[3, 2, 1, 0],
      array[4, 3, 2, 1], array[5, 4, 3, 2], array[6, 5, 4, 3]
    ])[coalesce(array_position(enum_range(null::patente), c.patente), 1)][array_position(array['I', 'II', 'III', 'IV'], p_cat)]
  )
  from characters c where c.id = p_character_id;
$$;

-- Quantos itens da categoria o personagem já carrega (cada item conta 1, como na ficha).
create function public.itens_da_categoria(p_character_id uuid, p_cat text)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int
    from character_inventory ci
    left join equipment_items e on e.id = ci.equipment_item_id
   where ci.character_id = p_character_id
     and coalesce(ci.category_override::text, e.category::text, ci.custom_item ->> 'category') = p_cat;
$$;

-- Situação de quem vai comprar: dinheiro, patente e cada categoria (atual / limite).
create function public.situacao_de_compra(p_character_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_ch characters%rowtype;
begin
  if not pode_editar_ficha(p_character_id) then
    raise exception 'Você não pode ver isso';
  end if;
  select * into v_ch from characters where id = p_character_id;
  return jsonb_build_object(
    'dinheiro', v_ch.dinheiro,
    'patente', v_ch.patente,
    'categorias', (select jsonb_object_agg(cat, jsonb_build_object('atual', itens_da_categoria(p_character_id, cat), 'limite', limite_da_categoria(p_character_id, cat)))
                     from unnest(array['I', 'II', 'III', 'IV']) cat)
  );
end;
$$;

-- O que o item da mesa mostra: agora também preço, categoria e estoque ilimitado (Loja).
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
  v_atividades jsonb;
begin
  if not pode_interagir(p_token_id) then
    raise exception 'Você não pode interagir com isto';
  end if;
  select i.* into v_item from campaign_items i join scene_tokens t on t.item_id = i.id where t.id = p_token_id;
  select coalesce(jsonb_agg(jsonb_build_object(
           'item_id', c.item_id, 'compendio_id', c.compendio_id, 'quantidade', c.quantidade, 'ilimitado', coalesce(c.ilimitado, false),
           'name', coalesce(o.name, e.name, c.nome), 'image_url', coalesce(o.image_url, e.image_url),
           'carga', coalesce(o.carga, e.spaces), 'raridade', o.raridade,
           'preco', coalesce(c.preco, nullif(o.detalhes ->> 'preco', '')::numeric),
           'categoria', coalesce(nullif(o.detalhes ->> 'categoriaSistema', ''), e.category::text, '0'))), '[]')
    into v_conteudo
    from jsonb_to_recordset(v_item.conteudo) as c(item_id uuid, compendio_id uuid, nome text, quantidade int, ilimitado boolean, preco numeric)
    left join campaign_items o on o.id = c.item_id
    left join equipment_items e on e.id = c.compendio_id
   where (coalesce(c.ilimitado, false) or c.quantidade > 0) and (o.id is not null or e.id is not null);

  v_atividades := v_item.atividades;
  if not is_campaign_owner(v_item.campaign_id) then
    select coalesce(jsonb_agg(a #- '{checar,dt}' #- '{ritual,evitar,dt}' #- '{ativacao,teste,dt}'), '[]')
      into v_atividades from jsonb_array_elements(v_item.atividades) a;
    v_item.detalhes := v_item.detalhes #- '{teste,dt}';
  end if;

  return (to_jsonb(v_item) - 'acesso_jogadores' - 'acesso_padrao' - 'mostrar_mestres')
         || jsonb_build_object('atividades', v_atividades, 'conteudo_detalhado', v_conteudo);
end;
$$;

-- Comprar (dinheiro) ou requisitar (patente) um item do estoque da loja.
create function public.comprar_da_loja(p_token_id uuid, p_ref uuid, p_character_id uuid, p_quantidade int, p_forma text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loja campaign_items%rowtype;
  v_entrada jsonb;
  v_obj campaign_items%rowtype;
  v_equip uuid;
  v_qtd int := greatest(1, coalesce(p_quantidade, 1));
  v_ref text := p_ref::text;
  v_modo text;
  v_preco numeric;
  v_cat text;
  v_dinheiro numeric;
  v_limite int;
  v_atual int;
begin
  if not pode_interagir(p_token_id) then
    raise exception 'Você não pode interagir com isto';
  end if;
  select i.* into v_loja from campaign_items i join scene_tokens t on t.item_id = i.id where t.id = p_token_id for update of i;
  if v_loja.categoria <> 'loja' then
    raise exception 'Isto não é uma loja';
  end if;
  if not pode_editar_ficha(p_character_id)
     or not exists (select 1 from characters where id = p_character_id and campaign_id = v_loja.campaign_id) then
    raise exception 'Você não pode pôr itens nesta ficha';
  end if;

  select c into v_entrada from jsonb_array_elements(v_loja.conteudo) c
   where coalesce(c ->> 'item_id', '') = v_ref or coalesce(c ->> 'compendio_id', '') = v_ref limit 1;
  if v_entrada is null then
    raise exception 'Isso não está à venda';
  end if;
  if not coalesce((v_entrada ->> 'ilimitado')::boolean, false) and coalesce((v_entrada ->> 'quantidade')::int, 0) < v_qtd then
    raise exception 'Não tem tudo isso no estoque';
  end if;

  select * into v_obj from campaign_items where id = p_ref and campaign_id = v_loja.campaign_id;
  if v_obj.id is not null then
    v_equip := v_obj.compendio_id;
    v_cat := coalesce(nullif(v_obj.detalhes ->> 'categoriaSistema', ''), (select category::text from equipment_items where id = v_obj.compendio_id), '0');
  elsif exists (select 1 from equipment_items where id = p_ref) then
    v_equip := p_ref;
    v_cat := (select category::text from equipment_items where id = p_ref);
  else
    raise exception 'Item não encontrado';
  end if;
  v_preco := coalesce(nullif(v_entrada ->> 'preco', '')::numeric, nullif(v_obj.detalhes ->> 'preco', '')::numeric);

  v_modo := coalesce(v_loja.detalhes #>> '{loja,modo}', 'ambos');
  if p_forma not in ('requisicao', 'dinheiro') or (v_modo <> 'ambos' and v_modo <> p_forma) then
    raise exception 'Esta loja não trabalha assim';
  end if;

  if p_forma = 'dinheiro' then
    if v_preco is null then
      raise exception 'Esse item não tem preço';
    end if;
    select dinheiro into v_dinheiro from characters where id = p_character_id for update;
    if v_dinheiro < v_preco * v_qtd then
      raise exception 'Dinheiro insuficiente';
    end if;
    update characters set dinheiro = dinheiro - v_preco * v_qtd where id = p_character_id;
  elsif v_cat in ('I', 'II', 'III', 'IV') then
    v_limite := limite_da_categoria(p_character_id, v_cat);
    v_atual := itens_da_categoria(p_character_id, v_cat);
    if v_atual + v_qtd > v_limite then
      raise exception 'Sua patente não libera mais itens de categoria % (% de %)', v_cat, v_atual, v_limite;
    end if;
  end if;

  -- Tira do estoque (o ilimitado não acaba).
  if not coalesce((v_entrada ->> 'ilimitado')::boolean, false) then
    update campaign_items set conteudo = coalesce((
      select jsonb_agg(case when coalesce(c ->> 'item_id', '') = v_ref or coalesce(c ->> 'compendio_id', '') = v_ref
                            then jsonb_set(c, '{quantidade}', to_jsonb((c ->> 'quantidade')::int - v_qtd)) else c end)
        from jsonb_array_elements(v_loja.conteudo) c
       where not ((coalesce(c ->> 'item_id', '') = v_ref or coalesce(c ->> 'compendio_id', '') = v_ref)
                  and (c ->> 'quantidade')::int - v_qtd <= 0)), '[]')
    where id = v_loja.id;
  end if;

  if v_equip is not null then
    insert into character_inventory (character_id, equipment_item_id, quantity) values (p_character_id, v_equip, v_qtd);
  else
    insert into character_inventory (character_id, custom_item, quantity)
    values (p_character_id, jsonb_build_object(
      'name', v_obj.name,
      'type', coalesce(v_obj.detalhes ->> 'tipo', 'geral'),
      'category', v_cat,
      'spaces', v_obj.carga,
      'description', trim(regexp_replace(coalesce(v_obj.descricao, ''), '<[^>]+>', ' ', 'g')),
      'stats', '{}'::jsonb,
      'image_url', v_obj.image_url), v_qtd);
  end if;
end;
$$;

grant execute on function public.limite_da_categoria(uuid, text) to authenticated;
grant execute on function public.itens_da_categoria(uuid, text) to authenticated;
grant execute on function public.situacao_de_compra(uuid) to authenticated;
grant execute on function public.comprar_da_loja(uuid, uuid, uuid, int, text) to authenticated;
