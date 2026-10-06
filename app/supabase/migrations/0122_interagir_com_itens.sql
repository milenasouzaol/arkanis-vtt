-- Interagir com itens na mesa (KAN-53, parte 2; pedido da Millie, 06/10). Um token/objeto da
-- mesa com item_id é um item interativo: clicar abre a janela de interação, que roda as
-- atividades do item (teste pela ficha, encadeamento Se passar / Se falhar). Cada passo passa
-- por uma função daqui, que confere quem pode o quê:
--   item_do_token        lê o item (mesmo com acesso "Nenhum" na aba Itens) e o conteúdo
--   usar_atividade       gasta os usos e a quantidade da atividade
--   pegar_do_conteiner   tira do baú e põe no inventário da ficha
--   postar_interacao     registra no chat
--   aplicar_por_item     dano/cura de uma atividade num alvo

-- Pode interagir com este token? (membro da campanha; token escondido só pro mestre)
create function public.pode_interagir(p_token_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from scene_tokens t
    where t.id = p_token_id and t.item_id is not null
      and (is_campaign_owner(t.campaign_id) or (is_campaign_member(t.campaign_id) and t.layer <> 'mestre'))
  );
$$;

create function public.item_do_token(p_token_id uuid)
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
           'item_id', c.item_id, 'quantidade', c.quantidade,
           'name', o.name, 'image_url', o.image_url, 'carga', o.carga, 'raridade', o.raridade)), '[]')
    into v_conteudo
    from jsonb_to_recordset(v_item.conteudo) as c(item_id uuid, quantidade int)
    join campaign_items o on o.id = c.item_id
   where c.quantidade > 0;
  return to_jsonb(v_item) - 'acesso_jogadores' - 'acesso_padrao' - 'mostrar_mestres' || jsonb_build_object('conteudo_detalhado', v_conteudo);
end;
$$;

-- Gasta 1 uso da atividade (e do item, se tiver limite) e o que ela consome. Sem usos: erro.
create function public.usar_atividade(p_token_id uuid, p_atividade_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item campaign_items%rowtype;
  v_idx int;
  v_at jsonb;
  v_max int;
  v_gastos int;
  v_consumo text;
  v_quanto int;
begin
  if not pode_interagir(p_token_id) then
    raise exception 'Você não pode interagir com isto';
  end if;
  select i.* into v_item from campaign_items i join scene_tokens t on t.item_id = i.id where t.id = p_token_id for update of i;
  select (o.n - 1)::int, o.a into v_idx, v_at
    from jsonb_array_elements(v_item.atividades) with ordinality as o(a, n)
   where o.a ->> 'id' = p_atividade_id;
  if v_at is null then
    raise exception 'Essa atividade não existe mais';
  end if;

  -- Usos da atividade
  v_max := nullif(v_at #>> '{ativacao,usos,max}', '')::int;
  v_gastos := coalesce(nullif(v_at #>> '{ativacao,usos,gastos}', '')::int, 0);
  if v_max is not null and v_gastos >= v_max then
    raise exception 'Essa atividade não tem mais usos';
  end if;
  if v_max is not null then
    v_item.atividades := jsonb_set(v_item.atividades, array[v_idx::text, 'ativacao', 'usos', 'gastos'], to_jsonb(v_gastos + 1));
  end if;

  -- Consumo: usos do item ou quantidade do item
  v_consumo := coalesce(v_at #>> '{ativacao,consumo,tipo}', 'nada');
  v_quanto := greatest(1, coalesce(nullif(v_at #>> '{ativacao,consumo,quanto}', '')::int, 1));
  if v_consumo = 'quantidade' then
    if v_item.quantidade < v_quanto then
      raise exception 'Não sobrou o bastante';
    end if;
    v_item.quantidade := v_item.quantidade - v_quanto;
  elsif v_consumo = 'usos' then
    v_max := nullif(v_item.detalhes #>> '{usos,max}', '')::int;
    v_gastos := coalesce(nullif(v_item.detalhes #>> '{usos,gastos}', '')::int, 0);
    if v_max is not null and v_gastos + v_quanto > v_max then
      raise exception 'O item não tem mais usos';
    end if;
    v_item.detalhes := jsonb_set(v_item.detalhes, '{usos,gastos}', to_jsonb(v_gastos + v_quanto), true);
  end if;

  update campaign_items set atividades = v_item.atividades, quantidade = v_item.quantidade, detalhes = v_item.detalhes where id = v_item.id;
end;
$$;

-- Tira do contêiner e põe no inventário da ficha (como item próprio, com nome, tipo, categoria,
-- espaço, descrição e imagem do item da mesa).
create function public.pegar_do_conteiner(p_token_id uuid, p_item_id uuid, p_character_id uuid, p_quantidade int)
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
    from jsonb_array_elements(v_cont.conteudo) c where c ->> 'item_id' = p_item_id::text;
  if v_tem < v_qtd then
    raise exception 'Isso não está mais aí';
  end if;
  select * into v_obj from campaign_items where id = p_item_id and campaign_id = v_cont.campaign_id;
  if v_obj.id is null then
    raise exception 'Item não encontrado';
  end if;

  -- Tira do contêiner (some quando chega a zero).
  update campaign_items set conteudo = coalesce((
    select jsonb_agg(case when c ->> 'item_id' = p_item_id::text
                          then jsonb_set(c, '{quantidade}', to_jsonb((c ->> 'quantidade')::int - v_qtd)) else c end)
      from jsonb_array_elements(v_cont.conteudo) c
     where not (c ->> 'item_id' = p_item_id::text and (c ->> 'quantidade')::int - v_qtd <= 0)), '[]')
  where id = v_cont.id;

  insert into character_inventory (character_id, custom_item, quantity)
  values (p_character_id, jsonb_build_object(
    'name', v_obj.name,
    'type', coalesce(v_obj.detalhes ->> 'tipo', 'geral'),
    'category', coalesce(nullif(v_obj.detalhes ->> 'categoriaSistema', ''), '0'),
    'spaces', v_obj.carga,
    'description', coalesce(v_obj.descricao, ''),
    'stats', '{}'::jsonb,
    'image_url', v_obj.image_url), v_qtd);
end;
$$;

-- Registra a interação no chat (cartão próprio: item, atividade, rolagem, resultado).
create function public.postar_interacao(p_token_id uuid, p_character_id uuid, p_acao jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token scene_tokens%rowtype;
  v_nome text;
  v_foto text;
  v_modo text;
  v_id uuid;
begin
  if not pode_interagir(p_token_id) then
    raise exception 'Você não pode interagir com isto';
  end if;
  select * into v_token from scene_tokens where id = p_token_id;
  if p_character_id is not null then
    if not pode_editar_ficha(p_character_id)
       or not exists (select 1 from characters where id = p_character_id and campaign_id = v_token.campaign_id) then
      raise exception 'Você não pode agir com este personagem';
    end if;
    select coalesce(nullif(name, ''), 'Sem nome'), avatar_url into v_nome, v_foto from characters where id = p_character_id;
  else
    select display_name, avatar_url into v_nome, v_foto from profiles where id = auth.uid();
  end if;
  select chat_mode into v_modo from campaign_members where campaign_id = v_token.campaign_id and user_id = auth.uid();
  insert into chat_messages (campaign_id, user_id, character_id, modo, autor_nome, autor_foto, acao)
  values (v_token.campaign_id, auth.uid(), p_character_id, coalesce(v_modo, 'publico_personagem'), coalesce(v_nome, 'Alguém'), v_foto,
          (p_acao - 'estado') || jsonb_build_object('tipo', 'interacao', 'estado', '{}'::jsonb))
  returning id into v_id;
  return v_id;
end;
$$;

-- Dano (valor > 0) ou cura (valor < 0, sem passar do máximo) de uma atividade do item num alvo.
-- O jogador só atinge outros tokens se a atividade mirar mais gente (Todos, Jogadores, Mira).
create function public.aplicar_por_item(p_token_id uuid, p_atividade_id text, p_alvo_token uuid, p_recurso text, p_valor int, p_maximo int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item campaign_items%rowtype;
  v_at jsonb;
  v_alvo scene_tokens%rowtype;
  v_ator campaign_actors%rowtype;
  v_ficha characters%rowtype;
  v_valor int := coalesce(p_valor, 0);
  v_temp int;
begin
  if not pode_interagir(p_token_id) then
    raise exception 'Você não pode interagir com isto';
  end if;
  if p_recurso not in ('pv', 'san', 'pe') then
    raise exception 'Recurso inválido';
  end if;
  select i.* into v_item from campaign_items i join scene_tokens t on t.item_id = i.id where t.id = p_token_id;
  select a into v_at from jsonb_array_elements(v_item.atividades) a where a ->> 'id' = p_atividade_id;
  if v_at is null or v_at ->> 'tipo' not in ('dano', 'cura', 'ataque') then
    raise exception 'Atividade inválida';
  end if;
  select * into v_alvo from scene_tokens where id = p_alvo_token and campaign_id = v_item.campaign_id;
  if v_alvo.id is null then
    raise exception 'O alvo saiu da mesa';
  end if;
  if not is_campaign_owner(v_item.campaign_id) and not pode_mover_objeto(p_alvo_token)
     and coalesce(v_at #>> '{ativacao,alvos}', 'quem_tocou') not in ('todos', 'jogadores', 'mira') then
    raise exception 'Essa atividade só atinge quem interagiu';
  end if;

  if v_alvo.actor_id is not null then
    select * into v_ator from campaign_actors where id = v_alvo.actor_id;
  end if;
  select * into v_ficha from characters where id = coalesce(v_ator.character_id, v_alvo.character_id);

  if v_ficha.id is not null then
    if v_valor > 0 and p_recurso = 'pv' then
      v_temp := least(coalesce(v_ficha.temp_pv, 0), v_valor);
      update characters set temp_pv = coalesce(temp_pv, 0) - v_temp, current_pv = greatest(0, coalesce(current_pv, 0) - (v_valor - v_temp)) where id = v_ficha.id;
    elsif v_valor > 0 and p_recurso = 'san' then
      v_temp := least(coalesce(v_ficha.temp_sanity, 0), v_valor);
      update characters set temp_sanity = coalesce(temp_sanity, 0) - v_temp, current_sanity = greatest(0, coalesce(current_sanity, 0) - (v_valor - v_temp)) where id = v_ficha.id;
    elsif v_valor > 0 then
      update characters set current_pe = greatest(0, coalesce(current_pe, 0) - v_valor) where id = v_ficha.id;
    elsif p_recurso = 'pv' then
      update characters set current_pv = greatest(coalesce(current_pv, 0), least(coalesce(current_pv, 0) - v_valor, coalesce(p_maximo, coalesce(current_pv, 0) - v_valor))) where id = v_ficha.id;
    elsif p_recurso = 'san' then
      update characters set current_sanity = greatest(coalesce(current_sanity, 0), least(coalesce(current_sanity, 0) - v_valor, coalesce(p_maximo, coalesce(current_sanity, 0) - v_valor))) where id = v_ficha.id;
    else
      update characters set current_pe = greatest(coalesce(current_pe, 0), least(coalesce(current_pe, 0) - v_valor, coalesce(p_maximo, coalesce(current_pe, 0) - v_valor))) where id = v_ficha.id;
    end if;
  elsif v_ator.creature_id is not null then
    perform set_config('arkanis.dano_da_acao', 'on', true);
    update campaign_actors set pv_atual = greatest(0, least(
      coalesce(pv_atual, (select pv_maximo from creatures where id = v_ator.creature_id), 0) - v_valor,
      coalesce(p_maximo, (select pv_maximo from creatures where id = v_ator.creature_id), 2147483647)))
    where id = v_ator.id;
    perform set_config('arkanis.dano_da_acao', 'off', true);
  else
    raise exception 'Este token não tem ficha';
  end if;
end;
$$;

grant execute on function public.pode_interagir(uuid) to authenticated;
grant execute on function public.item_do_token(uuid) to authenticated;
grant execute on function public.usar_atividade(uuid, text) to authenticated;
grant execute on function public.pegar_do_conteiner(uuid, uuid, uuid, int) to authenticated;
grant execute on function public.postar_interacao(uuid, uuid, jsonb) to authenticated;
grant execute on function public.aplicar_por_item(uuid, text, uuid, text, int, int) to authenticated;
