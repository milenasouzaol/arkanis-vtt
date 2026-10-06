-- Marcas de morte pelo turno (pedido da Millie, 06/10): quando chega a vez de um jogador com 0
-- de vida (morrendo), a ficha ganha mais uma caveira (as 3 do pv_death_marks, as mesmas da barra
-- de vida da ficha). Na 3ª, morreu de vez. O carrossel de turno mostra as três embaixo do card.
-- Voltar o turno não marca nem desmarca (o mestre ajusta na ficha se precisar).

create or replace function public.passar_turno(p_combat_id uuid, p_voltar boolean default false)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_combate combats%rowtype;
  v_ordem uuid[];
  v_pos int;
  v_mestre boolean;
  v_dono boolean;
  v_proximo uuid;
begin
  select * into v_combate from combats where id = p_combat_id;
  if v_combate.id is null or not v_combate.ativo then
    raise exception 'Combate não está rodando';
  end if;
  v_mestre := is_campaign_owner(v_combate.campaign_id);
  select exists (
    select 1 from combatants cb join characters c on c.id = cb.character_id
    where cb.id = v_combate.turno_atual and c.user_id = auth.uid()
  ) into v_dono;
  if not v_mestre and (p_voltar or not v_dono) then
    raise exception 'Não é a sua vez';
  end if;

  select array_agg(id order by iniciativa desc, desempate desc, created_at) into v_ordem
  from combatants where combat_id = p_combat_id;
  if v_ordem is null then
    return;
  end if;
  v_pos := coalesce(array_position(v_ordem, v_combate.turno_atual), 0);

  if p_voltar then
    if v_pos <= 1 then
      update combats set turno_atual = v_ordem[array_length(v_ordem, 1)], rodada = greatest(1, rodada - 1) where id = p_combat_id;
    else
      update combats set turno_atual = v_ordem[v_pos - 1] where id = p_combat_id;
    end if;
    return;
  end if;

  if v_pos >= array_length(v_ordem, 1) then
    v_proximo := v_ordem[1];
    update combats set turno_atual = v_proximo, rodada = rodada + 1 where id = p_combat_id;
  else
    v_proximo := v_ordem[v_pos + 1];
    update combats set turno_atual = v_proximo where id = p_combat_id;
  end if;

  -- Começou a vez de um jogador morrendo: mais uma caveira (até 3).
  update characters c
     set pv_death_marks = (1 << least(3, bit_count(coalesce(c.pv_death_marks, 0)::bit(3))::int + 1)) - 1
    from combatants cb
   where cb.id = v_proximo
     and cb.tipo = 'jogador'
     and c.id = cb.character_id
     and coalesce(c.current_pv, 1) <= 0;
end;
$$;
