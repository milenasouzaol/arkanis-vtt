-- Encontros de Combate (KAN-50, spec 12.4).
--
-- combats: os combates montados pelo mestre (nome + ameaças escolhidas do bestiário) e,
-- quando iniciado, a rodada e de quem é o turno.
-- combatants: a ordem de iniciativa do combate rodando (jogadores + ameaças).
-- combatant_vida: a vida das ameaças, que só o mestre vê (12.4: jogador não vê a vida nem a
-- ficha dos monstros; a vida dos jogadores vem da ficha deles).

create table combats (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  ameacas uuid[] not null default '{}', -- criaturas escolhidas (pode repetir)
  ativo boolean not null default false,
  rodada int not null default 1,
  turno_atual uuid, -- combatants.id
  created_at timestamptz not null default now()
);

create table combatants (
  id uuid primary key default gen_random_uuid(),
  combat_id uuid not null references combats(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  tipo text not null check (tipo in ('jogador', 'ameaca')),
  character_id uuid references characters(id) on delete cascade,
  creature_id uuid references creatures(id) on delete set null,
  name text not null,
  image_url text,
  iniciativa int not null default 0,
  desempate int not null default 0, -- bônus de iniciativa, pra desempatar
  created_at timestamptz not null default now()
);

create table combatant_vida (
  combatant_id uuid primary key references combatants(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  pv_atual int not null,
  pv_max int not null
);

create index combats_campanha on combats (campaign_id);
create index combatants_combate on combatants (combat_id);

alter table combats enable row level security;
alter table combatants enable row level security;
alter table combatant_vida enable row level security;

-- Combate e ordem: todo mundo da campanha vê (o indicador de turno fica no mapa pra todos).
create policy "combats: membros leem" on combats for select using (is_campaign_member(campaign_id) or is_campaign_owner(campaign_id));
create policy "combats: mestre cria" on combats for insert with check (is_campaign_owner(campaign_id));
create policy "combats: mestre edita" on combats for update using (is_campaign_owner(campaign_id));
create policy "combats: mestre exclui" on combats for delete using (is_campaign_owner(campaign_id));

create policy "combatants: membros leem" on combatants for select using (is_campaign_member(campaign_id) or is_campaign_owner(campaign_id));
create policy "combatants: mestre cria" on combatants for insert with check (is_campaign_owner(campaign_id));
create policy "combatants: mestre edita" on combatants for update using (is_campaign_owner(campaign_id));
create policy "combatants: mestre exclui" on combatants for delete using (is_campaign_owner(campaign_id));

-- Vida dos monstros: só o mestre.
create policy "combatant_vida: só o mestre" on combatant_vida for all using (is_campaign_owner(campaign_id)) with check (is_campaign_owner(campaign_id));

-- Passar o turno (12.4): quem está na vez clica na própria foto; o mestre pode sempre.
-- p_voltar = true volta um turno (só o mestre).
create function public.passar_turno(p_combat_id uuid, p_voltar boolean default false)
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
  elsif v_pos >= array_length(v_ordem, 1) then
    update combats set turno_atual = v_ordem[1], rodada = rodada + 1 where id = p_combat_id;
  else
    update combats set turno_atual = v_ordem[v_pos + 1] where id = p_combat_id;
  end if;
end;
$$;

grant execute on function public.passar_turno(uuid, boolean) to authenticated;

alter publication supabase_realtime add table combats;
alter publication supabase_realtime add table combatants;
alter publication supabase_realtime add table combatant_vida;
-- As barrinhas de Vida/PE/Sanidade dos jogadores acompanham a ficha.
alter publication supabase_realtime add table characters;
