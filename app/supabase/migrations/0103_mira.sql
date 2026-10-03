-- Sistema de Mira (KAN-51, spec 12.9): ataque com alvo marcado vira uma mensagem no chat
-- ("[Atacante] está atacando [Alvo]") com os botões Ataque e Dano. O Ataque rola e diz se
-- passou da Defesa de cada alvo; o Dano rola e desconta da Vida de quem foi atingido.
--
-- chat_messages.acao guarda a ação inteira:
--   { tipo: 'ataque', atacante, ataque: {nome, dados, bonus, margem, multiplicador, partes, bonus_dano},
--     alvos: [{ token_id, nome }],
--     estado: { ataque: {...rolagem, acertos}, bloqueios: {token: valor}, dano: {...}, aplicado: {token: {pv, san}} } }
-- Cada passo é gravado uma vez só (não dá pra rolar de novo até sair o resultado que se quer).

alter table chat_messages add column if not exists acao jsonb;

-- Rolagem feita pelos botões do chat entra no Histórico da ficha sem virar outra mensagem.
alter table character_rolls add column if not exists sem_chat boolean not null default false;

create or replace function public.rolagem_no_chat()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_modo text;
  v_foto text;
  v_conta text;
begin
  if new.campaign_id is null or new.sem_chat then
    return new;
  end if;
  select chat_mode into v_modo from campaign_members where campaign_id = new.campaign_id and user_id = new.user_id;
  select avatar_url into v_foto from characters where id = new.character_id;
  if v_modo = 'publico_usuario' then
    select display_name, avatar_url into v_conta, v_foto from profiles where id = new.user_id;
  end if;
  insert into chat_messages (campaign_id, user_id, character_id, modo, autor_nome, autor_foto, rolagem)
  values (
    new.campaign_id, new.user_id, new.character_id, coalesce(v_modo, 'publico_personagem'),
    coalesce(case when v_modo = 'publico_usuario' then v_conta end, new.character_name, 'Sem nome'),
    v_foto,
    jsonb_build_object('label', new.label, 'total', new.total, 'detail', new.detail, 'dice', new.dice, 'bonus', new.bonus,
                       'nota', new.nota, 'sem_rolagem', new.sem_rolagem)
  );
  return new;
end;
$$;

-- O que o atacante precisa saber do alvo pra conferir a Defesa e descontar as resistências.
-- Personagem (jogador ou NPC): Agilidade, condições, bônus de Defesa, Bloqueio e os itens
-- equipados (a conta da Defesa e das resistências é a mesma da ficha, feita no navegador).
-- Ameaça: Defesa, resistências e vulnerabilidades do bestiário.
create function public.dados_do_alvo(p_token_id uuid)
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
      )
    );
  end if;
  if v_ator.creature_id is not null then
    select * into v_criatura from creatures where id = v_ator.creature_id;
    return jsonb_build_object(
      'tipo', 'criatura',
      'nome', coalesce(nullif(v_token.name, ''), v_ator.name),
      'defesa', coalesce(v_criatura.defesa, 10),
      'resistencias', v_criatura.resistencias,
      'vulnerabilidades', v_criatura.vulnerabilidades
    );
  end if;
  return jsonb_build_object('tipo', 'nenhum', 'nome', coalesce(v_token.name, 'Token'));
end;
$$;

-- Manda a ação pro chat. Da ficha: quem pode mexer nela (o dono, o mestre…), e a mensagem sai
-- com o nome/foto do personagem (ou da conta, no modo "Público como Usuário"), igual às rolagens.
-- Sem ficha (ameaça): só o mestre, com o nome/foto que ele mandou.
create function public.postar_acao(p_campaign_id uuid, p_character_id uuid, p_autor_nome text, p_autor_foto text, p_acao jsonb)
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
  if p_acao ->> 'tipo' is distinct from 'ataque' or jsonb_typeof(p_acao -> 'alvos') is distinct from 'array' then
    raise exception 'Ação inválida';
  end if;
  if p_character_id is not null then
    if not pode_editar_ficha(p_character_id)
       or not exists (select 1 from characters where id = p_character_id and campaign_id = p_campaign_id) then
      raise exception 'Você não pode atacar com este personagem';
    end if;
    select coalesce(nullif(name, ''), 'Sem nome'), avatar_url into v_nome, v_foto from characters where id = p_character_id;
  elsif not is_campaign_owner(p_campaign_id) then
    raise exception 'Só o mestre ataca com ameaças';
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

-- Quem conduz a ação: quem mandou ela pro chat, ou o mestre.
create function public.pode_conduzir_acao(p_msg chat_messages)
returns boolean
language sql
stable
as $$
  select p_msg.user_id = auth.uid() or is_campaign_owner(p_msg.campaign_id);
$$;

-- Grava a rolagem do Ataque ou do Dano (uma vez só; o Dano só depois do Ataque).
create function public.registrar_na_acao(p_msg_id uuid, p_chave text, p_valor jsonb)
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
  if p_chave not in ('ataque', 'dano') then
    raise exception 'Passo inválido';
  end if;
  if v_msg.acao -> 'estado' ? p_chave then
    raise exception 'Isso já foi rolado';
  end if;
  if p_chave = 'dano' and not (v_msg.acao -> 'estado' ? 'ataque') then
    raise exception 'Role o ataque primeiro';
  end if;
  update chat_messages set acao = jsonb_set(acao, array['estado', p_chave], p_valor) where id = p_msg_id;
end;
$$;

-- Bloqueio (reação do alvo): quem controla a ficha do alvo bloqueia antes do Dano ser rolado,
-- e ganha resistência a dano igual ao Bloqueio da ficha contra este ataque.
create function public.bloquear_na_acao(p_msg_id uuid, p_token_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_msg chat_messages%rowtype;
  v_ficha characters%rowtype;
begin
  select * into v_msg from chat_messages where id = p_msg_id for update;
  if v_msg.id is null or v_msg.acao is null
     or not exists (select 1 from jsonb_array_elements(v_msg.acao -> 'alvos') a where a ->> 'token_id' = p_token_id::text) then
    raise exception 'Este token não é alvo do ataque';
  end if;
  if v_msg.acao -> 'estado' ? 'dano' then
    raise exception 'O dano já foi rolado';
  end if;
  select c.* into v_ficha
  from scene_tokens t
  left join campaign_actors a on a.id = t.actor_id
  join characters c on c.id = coalesce(a.character_id, t.character_id)
  where t.id = p_token_id;
  if v_ficha.id is null or not pode_editar_ficha(v_ficha.id) then
    raise exception 'Só quem controla o alvo pode bloquear';
  end if;
  update chat_messages
  set acao = jsonb_set(acao, '{estado,bloqueios}',
                       coalesce(acao #> '{estado,bloqueios}', '{}'::jsonb) || jsonb_build_object(p_token_id::text, greatest(0, v_ficha.bloqueio_bonus)))
  where id = p_msg_id;
end;
$$;

-- Desconta o dano (já com resistências) da Vida do alvo — e da Sanidade, se for dano mental.
-- PV temporário vai primeiro. Ameaça: Vida dela na mesa (começa no máximo do bestiário).
-- Uma vez por alvo.
create function public.aplicar_dano_da_acao(p_msg_id uuid, p_token_id uuid, p_pv int, p_san int)
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
  v_pv int := greatest(0, coalesce(p_pv, 0));
  v_san int := greatest(0, coalesce(p_san, 0));
  v_temp int;
begin
  select * into v_msg from chat_messages where id = p_msg_id for update;
  if v_msg.id is null or v_msg.acao is null or not pode_conduzir_acao(v_msg) then
    raise exception 'Você não pode aplicar este dano';
  end if;
  if not (v_msg.acao -> 'estado' ? 'dano') then
    raise exception 'Role o dano primeiro';
  end if;
  if not exists (select 1 from jsonb_array_elements(v_msg.acao -> 'alvos') a where a ->> 'token_id' = p_token_id::text) then
    raise exception 'Este token não é alvo do ataque';
  end if;
  if v_msg.acao #> array['estado', 'aplicado', p_token_id::text] is not null then
    raise exception 'O dano já foi aplicado';
  end if;

  select * into v_token from scene_tokens where id = p_token_id and campaign_id = v_msg.campaign_id;
  if v_token.id is null then
    raise exception 'O alvo saiu da mesa';
  end if;
  if v_token.actor_id is not null then
    select * into v_ator from campaign_actors where id = v_token.actor_id;
  end if;
  select * into v_ficha from characters where id = coalesce(v_ator.character_id, v_token.character_id);

  if v_ficha.id is not null then
    v_temp := least(coalesce(v_ficha.temp_pv, 0), v_pv);
    update characters set
      temp_pv = coalesce(temp_pv, 0) - v_temp,
      current_pv = greatest(0, coalesce(current_pv, 0) - (v_pv - v_temp))
    where id = v_ficha.id;
    v_temp := least(coalesce(v_ficha.temp_sanity, 0), v_san);
    update characters set
      temp_sanity = coalesce(temp_sanity, 0) - v_temp,
      current_sanity = greatest(0, coalesce(current_sanity, 0) - (v_san - v_temp))
    where id = v_ficha.id;
  elsif v_ator.creature_id is not null then
    -- A trava de "só o mestre muda a vida" (ator_so_tokens) deixa passar o dano do ataque.
    perform set_config('arkanis.dano_da_acao', 'on', true);
    update campaign_actors set
      pv_atual = greatest(0, coalesce(pv_atual, (select pv_maximo from creatures where id = v_ator.creature_id), 0) - v_pv - v_san)
    where id = v_ator.id;
    perform set_config('arkanis.dano_da_acao', 'off', true);
  else
    raise exception 'Este token não tem ficha';
  end if;

  update chat_messages
  set acao = jsonb_set(acao, '{estado,aplicado}',
                       coalesce(acao #> '{estado,aplicado}', '{}'::jsonb) || jsonb_build_object(p_token_id::text, jsonb_build_object('pv', v_pv, 'san', v_san)))
  where id = p_msg_id;
end;
$$;

create or replace function public.ator_so_tokens()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_campaign_owner(old.campaign_id) and coalesce(current_setting('arkanis.dano_da_acao', true), 'off') <> 'on' then
    if new.tipo <> old.tipo or new.campaign_id <> old.campaign_id or new.character_id is distinct from old.character_id
       or new.acesso_padrao <> old.acesso_padrao or new.acesso_jogadores <> old.acesso_jogadores
       or new.folder_id is distinct from old.folder_id or new.pv_atual is distinct from old.pv_atual then
      raise exception 'Só o mestre muda isso';
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.pode_conduzir_acao(chat_messages) from public;
grant execute on function public.dados_do_alvo(uuid) to authenticated;
grant execute on function public.postar_acao(uuid, uuid, text, text, jsonb) to authenticated;
grant execute on function public.registrar_na_acao(uuid, text, jsonb) to authenticated;
grant execute on function public.bloquear_na_acao(uuid, uuid) to authenticated;
grant execute on function public.aplicar_dano_da_acao(uuid, uuid, int, int) to authenticated;
