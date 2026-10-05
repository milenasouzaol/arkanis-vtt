-- Lista de Reprodução (KAN-53, spec 12.12 + prints do Foundry da Millie).
--
-- O mestre monta playlists (em pastas) com sons; cada som toca de um arquivo, de um link ou do
-- YouTube. O que está tocando fica no banco (tocando + iniciado_em), então todo mundo ouve a
-- mesma coisa, no mesmo ponto. Cada pessoa ajusta o próprio volume (Música/Ambiente/Efeitos),
-- guardado no navegador dela. Só o mestre vê a lista; os jogadores só ouvem.

create table playlist_folders (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  parent_id uuid references playlist_folders(id) on delete cascade,
  name text not null,
  color text,
  sort_mode text not null default 'alfabetica' check (sort_mode in ('alfabetica', 'manual')),
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table playlists (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  folder_id uuid references playlist_folders(id) on delete set null,
  name text not null,
  modo text not null default 'sequencial' check (modo in ('sequencial', 'embaralhar', 'repetir')),
  canal text not null default 'musica' check (canal in ('musica', 'ambiente', 'efeitos')),
  descricao text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table playlist_sounds (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references playlists(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  url text not null,
  canal text check (canal in ('musica', 'ambiente', 'efeitos')), -- vazio = o da playlist
  volume numeric not null default 0.5 check (volume between 0 and 1),
  repetir boolean not null default false,
  descricao text,
  sort int not null default 0,
  tocando boolean not null default false,
  iniciado_em timestamptz,
  created_at timestamptz not null default now()
);

create index playlists_campanha on playlists (campaign_id);
create index playlist_sounds_playlist on playlist_sounds (playlist_id);
create index playlist_sounds_tocando on playlist_sounds (campaign_id) where tocando;

alter table playlist_folders enable row level security;
alter table playlists enable row level security;
alter table playlist_sounds enable row level security;

-- Os jogadores leem (o navegador deles precisa do link pra tocar); só o mestre mexe.
create policy "playlist_folders: mestre" on playlist_folders for all using (is_campaign_owner(campaign_id)) with check (is_campaign_owner(campaign_id));

create policy "playlists: campanha lê" on playlists for select using (is_campaign_owner(campaign_id) or is_campaign_member(campaign_id));
create policy "playlists: mestre cria" on playlists for insert with check (is_campaign_owner(campaign_id));
create policy "playlists: mestre edita" on playlists for update using (is_campaign_owner(campaign_id));
create policy "playlists: mestre apaga" on playlists for delete using (is_campaign_owner(campaign_id));

create policy "playlist_sounds: campanha lê" on playlist_sounds for select using (is_campaign_owner(campaign_id) or is_campaign_member(campaign_id));
create policy "playlist_sounds: mestre cria" on playlist_sounds for insert with check (
  is_campaign_owner(campaign_id) and exists (select 1 from playlists p where p.id = playlist_id and p.campaign_id = playlist_sounds.campaign_id)
);
create policy "playlist_sounds: mestre edita" on playlist_sounds for update using (is_campaign_owner(campaign_id));
create policy "playlist_sounds: mestre apaga" on playlist_sounds for delete using (is_campaign_owner(campaign_id));

alter publication supabase_realtime add table playlist_folders;
alter publication supabase_realtime add table playlists;
alter publication supabase_realtime add table playlist_sounds;
