-- Objetos da cena (KAN-48 → base dos tokens do KAN-49, spec 12.8).
--
-- Imagem arrastada pra uma cena que já tem fundo entra por cima do mapa, na posição em
-- que foi solta, em vez de trocar o fundo. A mesma tabela guarda os tokens depois.
-- Camadas (12.8): mapa, token e mestre (só o mestre vê).

create table scene_tokens (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references scenes(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text,
  image_url text not null,
  x numeric not null default 0,      -- canto superior esquerdo, em pixels do mapa
  y numeric not null default 0,
  width numeric not null default 100 check (width > 0),
  height numeric not null default 100 check (height > 0),
  rotation numeric not null default 0,
  layer text not null default 'token' check (layer in ('mapa', 'token', 'mestre')),
  sort int not null default 0,
  locked boolean not null default false,
  flip_h boolean not null default false,
  flip_v boolean not null default false,
  character_id uuid references characters(id) on delete cascade,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index scene_tokens_cena on scene_tokens (scene_id);

alter table scene_tokens enable row level security;

-- Jogador vê o que está nas camadas Mapa e Token das cenas que ele pode ver;
-- a camada do Mestre é só do mestre. (O select em scenes respeita o RLS de scenes.)
create policy "scene_tokens: quem pode ver" on scene_tokens for select using (
  is_campaign_owner(campaign_id)
  or (
    is_campaign_member(campaign_id)
    and layer <> 'mestre'
    and exists (select 1 from scenes s where s.id = scene_id)
  )
);
create policy "scene_tokens: mestre cria" on scene_tokens for insert with check (is_campaign_owner(campaign_id));
create policy "scene_tokens: mestre edita" on scene_tokens for update using (is_campaign_owner(campaign_id));
create policy "scene_tokens: mestre exclui" on scene_tokens for delete using (is_campaign_owner(campaign_id));

alter publication supabase_realtime add table scene_tokens;
