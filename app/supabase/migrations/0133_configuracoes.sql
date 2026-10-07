-- Configurações da mesa (KAN-54, print do Foundry da Millie, 06/10).
-- 1) Dado 3D de cada pessoa (cor, número, contorno, material, textura): todo mundo vê os dados
--    de quem rolou do jeito que essa pessoa escolheu (como no Dice So Nice).
-- 2) Permissões dos jogadores na campanha (Configuração do Mundo):
--    { "criarDiario": bool, "pingar": bool, "medir": bool } (ausente = liberado).
-- 3) Usuários: o mestre tira alguém da campanha.

alter table profiles add column dados3d jsonb;

alter table campaigns add column permissoes jsonb not null default '{}';

drop policy "journal_entries: membros criam os seus" on journal_entries;
create policy "journal_entries: membros criam os seus" on journal_entries for insert with check (
  is_campaign_owner(campaign_id)
  or (
    is_campaign_member(campaign_id) and author_id = auth.uid()
    and coalesce((select (c.permissoes ->> 'criarDiario')::boolean from campaigns c where c.id = campaign_id), true)
  )
);

create policy "campaign_members: mestre remove" on campaign_members for delete using (is_campaign_owner(campaign_id));

-- 4) Configurações da campanha (mestre): fontes adicionais e o Monitor de Combate.
--    { "fontes": [{ "nome", "url", "peso", "estilo" }],
--      "combate": { "vidaNoCarrossel": bool, "caveirasAutomaticas": bool } }
alter table campaigns add column configuracoes jsonb not null default '{}';

-- As caveiras automáticas do passar_turno (0130) respeitam o Monitor de Combate.
-- (aplicado junto: ver o corpo novo de passar_turno abaixo)

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
     and coalesce(c.current_pv, 1) <= 0
     and coalesce((select (cp.configuracoes -> 'combate' ->> 'caveirasAutomaticas')::boolean from campaigns cp where cp.id = v_combate.campaign_id), true);
end;
$$;

-- Fontes adicionais (arquivos .ttf/.otf/.woff que o mestre envia).
insert into storage.buckets (id, name, public)
values ('fontes', 'fontes', true)
on conflict (id) do nothing;

create policy "fontes: leitura pública" on storage.objects for select using (bucket_id = 'fontes');
create policy "fontes: dono escreve" on storage.objects for insert with check (bucket_id = 'fontes' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fontes: dono remove" on storage.objects for delete using (bucket_id = 'fontes' and (storage.foldername(name))[1] = auth.uid()::text);

-- Tempo real: o dado de cada um (profiles) e as configurações da campanha chegam na hora.
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'profiles') then
    alter publication supabase_realtime add table profiles;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'campaigns') then
    alter publication supabase_realtime add table campaigns;
  end if;
end $$;
