-- Lanterna e escuridão (pedido da Millie, 05/10):
-- * Token com lanterna: desligada (null), comum ou UV. Sai do token em cone, pra onde ele está
--   virado, e ilumina a escuridão. O dono do token e o mestre ligam/desligam.
-- * Objeto "só na luz UV" (sangue, símbolos, pegadas): pros jogadores, só aparece onde a luz
--   UV bate. O mestre marca.
-- * Áreas de escuridão: retângulos que o mestre pinta no mapa; ficam pretas e a lanterna
--   ilumina dentro delas.

alter table scene_tokens add column lanterna text check (lanterna in ('comum', 'uv'));
alter table scene_tokens add column so_uv boolean not null default false;

create function public.lanterna_do_objeto(p_id uuid, p_lanterna text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not pode_mover_objeto(p_id) then
    raise exception 'Você não pode mexer neste token';
  end if;
  update scene_tokens set lanterna = p_lanterna where id = p_id;
end;
$$;

grant execute on function public.lanterna_do_objeto(uuid, text) to authenticated;

create table scene_darkness (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references scenes(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  x numeric not null default 0,
  y numeric not null default 0,
  width numeric not null default 100 check (width > 0),
  height numeric not null default 100 check (height > 0),
  created_at timestamptz not null default now()
);

create index scene_darkness_cena on scene_darkness (scene_id);

alter table scene_darkness enable row level security;

create policy "scene_darkness: quem vê a cena" on scene_darkness for select using (
  is_campaign_owner(campaign_id)
  or (is_campaign_member(campaign_id) and exists (select 1 from scenes s where s.id = scene_id))
);
create policy "scene_darkness: mestre cria" on scene_darkness for insert with check (is_campaign_owner(campaign_id));
create policy "scene_darkness: mestre edita" on scene_darkness for update using (is_campaign_owner(campaign_id));
create policy "scene_darkness: mestre apaga" on scene_darkness for delete using (is_campaign_owner(campaign_id));

alter publication supabase_realtime add table scene_darkness;
