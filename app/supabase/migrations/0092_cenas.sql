-- Cenas / Mapas da mesa (KAN-48, spec 12.5).
--
-- O mestre organiza as cenas em pastas (com subpastas) e escolhe a cena ativa da
-- campanha, que é o que aparece no centro da mesa pra todo mundo. Jogador só lê as cenas
-- que pode ver: a ativa, ou as marcadas "Mostrar na Navegação" pra ele.

create table scene_folders (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  parent_id uuid references scene_folders(id) on delete cascade,
  name text not null,
  color text,
  sort_mode text not null default 'alfabetica' check (sort_mode in ('alfabetica', 'manual')),
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table scenes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  folder_id uuid references scene_folders(id) on delete set null,
  name text not null,
  sort int not null default 0,

  -- Básicos: permissões
  show_in_nav boolean not null default false,
  visibility text not null default 'todos' check (visibility in ('mestre', 'todos', 'jogadores')),
  visible_to uuid[] not null default '{}', -- quando visibility = 'jogadores'

  -- Básicos: imagem e cor de fundo
  background_url text,
  background_color text not null default '#000000',

  -- Grade
  grid_type text not null default 'quadrado' check (grid_type in ('quadrado', 'sem', 'hexagono')),
  grid_size int not null default 100 check (grid_size between 20 and 500),
  grid_distance numeric not null default 1.5,
  grid_units text not null default 'm',
  grid_style text not null default 'solida' check (grid_style in ('solida', 'tracejada', 'pontilhada')),
  grid_thickness numeric not null default 1,
  grid_color text not null default '#000000',
  grid_opacity numeric not null default 0.25 check (grid_opacity between 0 and 1),

  -- Básicos: clima
  darkness numeric not null default 0 check (darkness between 0 and 1),
  weather text check (weather in ('folhas', 'chuva', 'tempestade', 'nevoa', 'neve', 'nebulosa')),

  -- Ambiente
  luminosity numeric not null default 0 check (luminosity between -1 and 1),
  saturation numeric not null default 0 check (saturation between -1 and 1),
  shadows numeric not null default 0 check (shadows between 0 and 1),

  created_at timestamptz not null default now()
);

create index scenes_campanha on scenes (campaign_id);
create index scene_folders_campanha on scene_folders (campaign_id);

alter table campaigns add column if not exists active_scene_id uuid references scenes(id) on delete set null;

alter table scene_folders enable row level security;
alter table scenes enable row level security;

-- Pastas: o mestre organiza; jogadores só leem (pra montar a navegação).
create policy "scene_folders: membros leem" on scene_folders for select using (is_campaign_member(campaign_id) or is_campaign_owner(campaign_id));
create policy "scene_folders: mestre cria" on scene_folders for insert with check (is_campaign_owner(campaign_id));
create policy "scene_folders: mestre edita" on scene_folders for update using (is_campaign_owner(campaign_id));
create policy "scene_folders: mestre exclui" on scene_folders for delete using (is_campaign_owner(campaign_id));

create function public.cena_ativa(p_scene_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from campaigns c join scenes s on s.campaign_id = c.id where s.id = p_scene_id and c.active_scene_id = s.id);
$$;

create policy "scenes: quem pode ver" on scenes for select using (
  is_campaign_owner(campaign_id)
  or (
    is_campaign_member(campaign_id)
    and (
      cena_ativa(id)
      or (show_in_nav and (visibility = 'todos' or (visibility = 'jogadores' and auth.uid() = any (visible_to))))
    )
  )
);
create policy "scenes: mestre cria" on scenes for insert with check (is_campaign_owner(campaign_id));
create policy "scenes: mestre edita" on scenes for update using (is_campaign_owner(campaign_id));
create policy "scenes: mestre exclui" on scenes for delete using (is_campaign_owner(campaign_id));

alter publication supabase_realtime add table scenes;
alter publication supabase_realtime add table scene_folders;
alter publication supabase_realtime add table campaigns;

-- Imagens de fundo das cenas.
insert into storage.buckets (id, name, public)
values ('scene_images', 'scene_images', true)
on conflict (id) do nothing;

create policy "scene_images: leitura pública" on storage.objects for select using (bucket_id = 'scene_images');
create policy "scene_images: dono escreve" on storage.objects for insert with check (bucket_id = 'scene_images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "scene_images: dono remove" on storage.objects for delete using (bucket_id = 'scene_images' and (storage.foldername(name))[1] = auth.uid()::text);
