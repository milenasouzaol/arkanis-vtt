-- Som Ambiente (KAN-52, spec 12.13 + prints do Foundry da Millie): áreas retangulares no mapa
-- com um áudio que toca pra quem tem token dentro. Volume máximo no centro (com suavização, vai
-- baixando até a borda). Clique direito liga/desliga. Só o mestre cria e mexe; os jogadores só
-- recebem o som (não veem as áreas).

create table scene_sounds (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references scenes(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text,
  url text not null,
  x numeric not null default 0,
  y numeric not null default 0,
  width numeric not null default 100 check (width > 0),
  height numeric not null default 100 check (height > 0),
  volume numeric not null default 1 check (volume between 0 and 1),
  suavizar boolean not null default true,
  escondido boolean not null default false,
  ligado boolean not null default true,
  created_at timestamptz not null default now()
);

create index scene_sounds_cena on scene_sounds (scene_id);

alter table scene_sounds enable row level security;

create policy "scene_sounds: quem pode ouvir" on scene_sounds for select using (
  is_campaign_owner(campaign_id)
  or (is_campaign_member(campaign_id) and exists (select 1 from scenes s where s.id = scene_id))
);
create policy "scene_sounds: mestre cria" on scene_sounds for insert with check (is_campaign_owner(campaign_id));
create policy "scene_sounds: mestre edita" on scene_sounds for update using (is_campaign_owner(campaign_id));
create policy "scene_sounds: mestre apaga" on scene_sounds for delete using (is_campaign_owner(campaign_id));

alter publication supabase_realtime add table scene_sounds;

-- Arquivos de áudio enviados pelo mestre.
insert into storage.buckets (id, name, public)
values ('sons_ambiente', 'sons_ambiente', true)
on conflict (id) do nothing;

create policy "sons_ambiente: leitura pública" on storage.objects for select using (bucket_id = 'sons_ambiente');
create policy "sons_ambiente: dono escreve" on storage.objects for insert with check (bucket_id = 'sons_ambiente' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "sons_ambiente: dono remove" on storage.objects for delete using (bucket_id = 'sons_ambiente' and (storage.foldername(name))[1] = auth.uid()::text);
