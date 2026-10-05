-- Posicionáveis (KAN-53, spec 12.6 + prints do Foundry da Millie): armazém de coisas
-- reutilizáveis do mestre, em pastas, separado em abas: Tokens, Objetos, Desenhos, Luzes
-- Ambientes, Sons Ambientes e Notas. Guarda importando um arquivo ou arrastando da mesa pra
-- aba; usa arrastando da aba pra mesa (entra uma cópia). Vale pra todas as cenas da campanha.
-- Só o mestre vê e mexe.

create table posicionavel_folders (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  categoria text not null check (categoria in ('token', 'objeto', 'desenho', 'luz', 'som', 'nota')),
  parent_id uuid references posicionavel_folders(id) on delete cascade,
  name text not null,
  color text,
  sort_mode text not null default 'alfabetica' check (sort_mode in ('alfabetica', 'manual')),
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table posicionaveis (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  categoria text not null check (categoria in ('token', 'objeto', 'desenho', 'luz', 'som', 'nota')),
  folder_id uuid references posicionavel_folders(id) on delete set null,
  name text not null,
  url text,                                 -- imagem, GIF, áudio, PDF ou documento
  dados jsonb not null default '{}'::jsonb, -- tamanho, desenho guardado da mesa, volume, texto da nota
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create index posicionaveis_campanha on posicionaveis (campaign_id, categoria);
create index posicionavel_folders_campanha on posicionavel_folders (campaign_id, categoria);

alter table posicionavel_folders enable row level security;
alter table posicionaveis enable row level security;

create policy "posicionavel_folders: mestre" on posicionavel_folders for all using (is_campaign_owner(campaign_id)) with check (is_campaign_owner(campaign_id));
create policy "posicionaveis: mestre" on posicionaveis for all using (is_campaign_owner(campaign_id)) with check (is_campaign_owner(campaign_id));

alter publication supabase_realtime add table posicionavel_folders;
alter publication supabase_realtime add table posicionaveis;

-- Luz Ambiente na mesa: imagem/GIF que clareia o que está embaixo (mistura "tela"; o preto some).
alter table scene_tokens add column luz boolean not null default false;

-- Arquivos guardados (imagem, GIF, áudio, PDF, documento).
insert into storage.buckets (id, name, public)
values ('posicionaveis', 'posicionaveis', true)
on conflict (id) do nothing;

create policy "posicionaveis: leitura pública" on storage.objects for select using (bucket_id = 'posicionaveis');
create policy "posicionaveis: dono escreve" on storage.objects for insert with check (bucket_id = 'posicionaveis' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "posicionaveis: dono remove" on storage.objects for delete using (bucket_id = 'posicionaveis' and (storage.foldername(name))[1] = auth.uid()::text);
