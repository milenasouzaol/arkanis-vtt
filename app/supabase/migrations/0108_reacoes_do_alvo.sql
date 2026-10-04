-- Reações do alvo no ataque com mira (pedido da Millie em 05/10): Esquivar, Bloquear e
-- Contra-atacar. Uma reação por alvo em cada ataque.
--   Esquivar: antes do Ataque ser rolado; soma o bônus de Reflexos na Defesa contra este ataque.
--   Bloquear: até o Dano ser rolado; resistência igual ao Bloqueio da ficha contra este ataque.
--   Contra-atacar: ataque corpo a corpo que errou; o alvo ataca quem errou.
-- Fica em acao.estado.reacoes: { <token>: { tipo: 'esquiva'|'bloqueio'|'contra', valor } }.

-- Bônus de Reflexos da ficha (treino + bônus extra), a mesma conta da tabela de perícias.
create function public.bonus_de_reflexos(p_character_id uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((
    select case cs.training when 'treinado' then 5 when 'veterano' then 10 when 'expert' then 15 else 0 end + coalesce(cs.extra_bonus, 0)
    from character_skills cs join skills s on s.id = cs.skill_id
    where cs.character_id = p_character_id and s.name = 'Reflexos'
    limit 1
  ), 0);
$$;

create function public.reagir_na_acao(p_msg_id uuid, p_token_id uuid, p_reacao text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_msg chat_messages%rowtype;
  v_ficha characters%rowtype;
  v_valor int := 0;
begin
  select * into v_msg from chat_messages where id = p_msg_id for update;
  if v_msg.id is null or v_msg.acao ->> 'tipo' is distinct from 'ataque'
     or not exists (select 1 from jsonb_array_elements(v_msg.acao -> 'alvos') a where a ->> 'token_id' = p_token_id::text) then
    raise exception 'Este token não é alvo do ataque';
  end if;
  if p_reacao not in ('esquiva', 'bloqueio', 'contra') then
    raise exception 'Reação inválida';
  end if;
  if v_msg.acao #> array['estado', 'reacoes', p_token_id::text] is not null
     or v_msg.acao #> array['estado', 'bloqueios', p_token_id::text] is not null then
    raise exception 'Este alvo já reagiu a este ataque';
  end if;

  select c.* into v_ficha
  from scene_tokens t
  left join campaign_actors a on a.id = t.actor_id
  join characters c on c.id = coalesce(a.character_id, t.character_id)
  where t.id = p_token_id;
  if v_ficha.id is null or not pode_editar_ficha(v_ficha.id) then
    raise exception 'Só quem controla o alvo pode reagir';
  end if;

  if p_reacao = 'esquiva' then
    if v_msg.acao -> 'estado' ? 'ataque' then
      raise exception 'O ataque já foi rolado; não dá mais pra esquivar';
    end if;
    v_valor := bonus_de_reflexos(v_ficha.id);
  elsif p_reacao = 'bloqueio' then
    if v_msg.acao -> 'estado' ? 'dano' then
      raise exception 'O dano já foi rolado';
    end if;
    v_valor := greatest(0, v_ficha.bloqueio_bonus);
  else
    if not (v_msg.acao -> 'estado' ? 'ataque') or (v_msg.acao #>> array['estado', 'ataque', 'acertos', p_token_id::text])::boolean then
      raise exception 'Só dá pra contra-atacar um ataque que errou';
    end if;
    if coalesce((v_msg.acao #>> '{ataque,corpo}')::boolean, false) is false then
      raise exception 'Só dá pra contra-atacar ataque corpo a corpo';
    end if;
  end if;

  update chat_messages
  set acao = jsonb_set(acao, '{estado,reacoes}',
                       coalesce(acao #> '{estado,reacoes}', '{}'::jsonb) || jsonb_build_object(p_token_id::text, jsonb_build_object('tipo', p_reacao, 'valor', v_valor)))
  where id = p_msg_id;
end;
$$;

grant execute on function public.bonus_de_reflexos(uuid) to authenticated;
grant execute on function public.reagir_na_acao(uuid, uuid, text) to authenticated;
