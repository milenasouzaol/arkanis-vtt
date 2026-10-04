-- Cura com alvo (KAN-51 parte 2, spec 12.9): "[Pedro] está usando o ritual [Cicatrização] em
-- [Maria]" no chat, com o botão do teste e depois Curar, que soma na Vida (ou Sanidade/PE) do
-- alvo sem passar do máximo. Vale pra ritual e pra item (Cicatrizante, Alimento energético…).
--
-- chat_messages.acao de cura:
--   { tipo: 'cura', curador, fonte, formula, recurso: 'pv'|'san'|'pe', teste: {nome,dados,bonus}|null,
--     alvos: [{ token_id, nome }], estado: { teste: {...}, cura: {...}, aplicado: {token: {valor}} } }

-- O alvo agora também diz a vida/sanidade/PE atuais e o que precisa pra calcular o máximo.
create or replace function public.dados_do_alvo(p_token_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_token scene_tokens%rowtype;
  v_ator campaign_actors%rowtype;
  v_ficha characters%rowtype;
  v_criatura creatures%rowtype;
begin
  select * into v_token from scene_tokens where id = p_token_id;
  if v_token.id is null or not (is_campaign_member(v_token.campaign_id) or is_campaign_owner(v_token.campaign_id)) then
    return null;
  end if;
  if v_token.layer = 'mestre' and not is_campaign_owner(v_token.campaign_id) then
    return null;
  end if;
  if v_token.actor_id is not null then
    select * into v_ator from campaign_actors where id = v_token.actor_id;
  end if;
  select * into v_ficha from characters where id = coalesce(v_ator.character_id, v_token.character_id);
  if v_ficha.id is not null then
    return jsonb_build_object(
      'tipo', 'ficha',
      'nome', coalesce(nullif(v_token.name, ''), v_ficha.name),
      'agilidade', coalesce((v_ficha.attributes ->> 'agilidade')::int, 0),
      'condicoes', coalesce(v_ficha.conditions, '[]'::jsonb),
      'defesa_outros', v_ficha.defense_other_bonus,
      'bloqueio', v_ficha.bloqueio_bonus,
      'itens', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'tipo', coalesce(e.type::text, i.custom_item ->> 'type'),
          'stats', coalesce(e.stats, i.custom_item -> 'stats', '{}'::jsonb),
          'mods', coalesce(i.applied_modifiers, '[]'::jsonb)
        )), '[]'::jsonb)
        from character_inventory i
        left join equipment_items e on e.id = i.equipment_item_id
        where i.character_id = v_ficha.id and i.is_equipped
      ),
      'atributos', v_ficha.attributes,
      'nex', v_ficha.nex_percent,
      'class_id', v_ficha.class_id,
      'custom_class', v_ficha.custom_class,
      'max_pv_override', v_ficha.max_pv_override,
      'max_sanity_override', v_ficha.max_sanity_override,
      'pv', v_ficha.current_pv,
      'san', v_ficha.current_sanity,
      'pe', v_ficha.current_pe
    );
  end if;
  if v_ator.creature_id is not null then
    select * into v_criatura from creatures where id = v_ator.creature_id;
    return jsonb_build_object(
      'tipo', 'criatura',
      'nome', coalesce(nullif(v_token.name, ''), v_ator.name),
      'defesa', coalesce(v_criatura.defesa, 10),
      'resistencias', v_criatura.resistencias,
      'vulnerabilidades', v_criatura.vulnerabilidades,
      'pv_maximo', v_criatura.pv_maximo
    );
  end if;
  return jsonb_build_object('tipo', 'nenhum', 'nome', coalesce(v_token.name, 'Token'));
end;
$$;

-- Ataque e cura passam pela mesma porta.
create or replace function public.postar_acao(p_campaign_id uuid, p_character_id uuid, p_autor_nome text, p_autor_foto text, p_acao jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_modo text;
  v_nome text := p_autor_nome;
  v_foto text := p_autor_foto;
  v_id uuid;
begin
  if coalesce(p_acao ->> 'tipo', '') not in ('ataque', 'cura') or jsonb_typeof(p_acao -> 'alvos') is distinct from 'array' then
    raise exception 'Ação inválida';
  end if;
  if p_acao ->> 'tipo' = 'cura' and coalesce(p_acao ->> 'recurso', '') not in ('pv', 'san', 'pe') then
    raise exception 'Cura inválida';
  end if;
  if p_character_id is not null then
    if not pode_editar_ficha(p_character_id)
       or not exists (select 1 from characters where id = p_character_id and campaign_id = p_campaign_id) then
      raise exception 'Você não pode agir com este personagem';
    end if;
    select coalesce(nullif(name, ''), 'Sem nome'), avatar_url into v_nome, v_foto from characters where id = p_character_id;
  elsif not is_campaign_owner(p_campaign_id) then
    raise exception 'Só o mestre age com ameaças';
  end if;
  select chat_mode into v_modo from campaign_members where campaign_id = p_campaign_id and user_id = auth.uid();
  if v_modo = 'publico_usuario' then
    select display_name, avatar_url into v_nome, v_foto from profiles where id = auth.uid();
  end if;
  insert into chat_messages (campaign_id, user_id, character_id, modo, autor_nome, autor_foto, acao)
  values (p_campaign_id, auth.uid(), p_character_id, coalesce(v_modo, 'publico_personagem'), coalesce(v_nome, 'Sem nome'), v_foto,
          (p_acao - 'estado') || jsonb_build_object('estado', '{}'::jsonb))
  returning id into v_id;
  return v_id;
end;
$$;

-- Passos: ataque → dano; teste → cura (a cura sem teste, de item, vai direto).
create or replace function public.registrar_na_acao(p_msg_id uuid, p_chave text, p_valor jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_msg chat_messages%rowtype;
begin
  select * into v_msg from chat_messages where id = p_msg_id for update;
  if v_msg.id is null or v_msg.acao is null or not pode_conduzir_acao(v_msg) then
    raise exception 'Você não pode rolar esta ação';
  end if;
  if not ((v_msg.acao ->> 'tipo' = 'ataque' and p_chave in ('ataque', 'dano'))
          or (v_msg.acao ->> 'tipo' = 'cura' and p_chave in ('teste', 'cura'))) then
    raise exception 'Passo inválido';
  end if;
  if v_msg.acao -> 'estado' ? p_chave then
    raise exception 'Isso já foi rolado';
  end if;
  if p_chave = 'dano' and not (v_msg.acao -> 'estado' ? 'ataque') then
    raise exception 'Role o ataque primeiro';
  end if;
  if p_chave = 'cura' and jsonb_typeof(v_msg.acao -> 'teste') = 'object' and not (v_msg.acao -> 'estado' ? 'teste') then
    raise exception 'Role o teste primeiro';
  end if;
  update chat_messages set acao = jsonb_set(acao, array['estado', p_chave], p_valor) where id = p_msg_id;
end;
$$;

-- Soma a cura no alvo (uma vez por alvo), sem passar do máximo. O máximo da ficha vem do
-- navegador (é a mesma conta das barras); o da ameaça é o do bestiário.
create function public.aplicar_cura_da_acao(p_msg_id uuid, p_token_id uuid, p_valor int, p_maximo int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_msg chat_messages%rowtype;
  v_token scene_tokens%rowtype;
  v_ator campaign_actors%rowtype;
  v_ficha characters%rowtype;
  v_valor int := greatest(0, coalesce(p_valor, 0));
  v_teto int := coalesce(p_maximo, 2147483647);
  v_recurso text;
  v_antes int;
  v_depois int;
  v_max_criatura int;
begin
  select * into v_msg from chat_messages where id = p_msg_id for update;
  if v_msg.id is null or v_msg.acao ->> 'tipo' is distinct from 'cura' or not pode_conduzir_acao(v_msg) then
    raise exception 'Você não pode aplicar esta cura';
  end if;
  if not (v_msg.acao -> 'estado' ? 'cura') then
    raise exception 'Role a cura primeiro';
  end if;
  if not exists (select 1 from jsonb_array_elements(v_msg.acao -> 'alvos') a where a ->> 'token_id' = p_token_id::text) then
    raise exception 'Este token não é alvo';
  end if;
  if v_msg.acao #> array['estado', 'aplicado', p_token_id::text] is not null then
    raise exception 'A cura já foi aplicada';
  end if;
  v_recurso := v_msg.acao ->> 'recurso';

  select * into v_token from scene_tokens where id = p_token_id and campaign_id = v_msg.campaign_id;
  if v_token.id is null then
    raise exception 'O alvo saiu da mesa';
  end if;
  if v_token.actor_id is not null then
    select * into v_ator from campaign_actors where id = v_token.actor_id;
  end if;
  select * into v_ficha from characters where id = coalesce(v_ator.character_id, v_token.character_id);

  if v_ficha.id is not null then
    v_antes := coalesce(case v_recurso when 'pv' then v_ficha.current_pv when 'san' then v_ficha.current_sanity else v_ficha.current_pe end, 0);
    v_depois := greatest(v_antes, least(v_antes + v_valor, v_teto));
    if v_recurso = 'pv' then
      update characters set current_pv = v_depois where id = v_ficha.id;
    elsif v_recurso = 'san' then
      update characters set current_sanity = v_depois where id = v_ficha.id;
    else
      update characters set current_pe = v_depois where id = v_ficha.id;
    end if;
  elsif v_ator.creature_id is not null and v_recurso = 'pv' then
    select pv_maximo into v_max_criatura from creatures where id = v_ator.creature_id;
    v_antes := coalesce(v_ator.pv_atual, v_max_criatura, 0);
    v_depois := greatest(v_antes, least(v_antes + v_valor, coalesce(v_max_criatura, 2147483647)));
    -- A trava de "só o mestre muda a vida" (ator_so_tokens) deixa passar a cura da ação.
    perform set_config('arkanis.dano_da_acao', 'on', true);
    update campaign_actors set pv_atual = v_depois where id = v_ator.id;
    perform set_config('arkanis.dano_da_acao', 'off', true);
  else
    raise exception 'Este alvo não tem o que curar';
  end if;

  update chat_messages
  set acao = jsonb_set(acao, '{estado,aplicado}',
                       coalesce(acao #> '{estado,aplicado}', '{}'::jsonb) || jsonb_build_object(p_token_id::text, jsonb_build_object('valor', v_depois - v_antes)))
  where id = p_msg_id;
end;
$$;

grant execute on function public.aplicar_cura_da_acao(uuid, uuid, int, int) to authenticated;
