-- Diário (KAN-53, spec 12.11 + prints do Foundry da Millie, 06/10): registros da campanha em
-- pastas, cada um com páginas (Texto, Imagem, PDF, Vídeo). O mestre vê todos, inclusive os dos
-- jogadores; o jogador cria os dele (fica dono). Quem vê: como os itens (Configurar Propriedade):
-- Nenhum, Limitado (só o nome), Observador (lê) ou Dono (edita).
-- As páginas ficam em `paginas` (jsonb, em ordem):
--   [{ "id", "nome", "tipo": "texto"|"imagem"|"pdf"|"video", "mostrarTitulo": bool,
--      "texto"?, "url"?, "legenda"?, "video"?: { "controles", "auto", "loop", "volume", "inicio" } }]

create table journal_folders (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  parent_id uuid references journal_folders(id) on delete cascade,
  name text not null,
  color text,
  sort_mode text not null default 'alfabetica' check (sort_mode in ('alfabetica', 'manual')),
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  folder_id uuid references journal_folders(id) on delete set null,
  author_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  paginas jsonb not null default '[]',
  acesso_padrao text not null default 'nenhum' check (acesso_padrao in ('nenhum', 'limitado', 'observador', 'dono')),
  acesso_jogadores jsonb not null default '{}',
  mostrar_mestres boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create index journal_entries_campanha on journal_entries (campaign_id);
create index journal_folders_campanha on journal_folders (campaign_id);

alter table journal_folders enable row level security;
alter table journal_entries enable row level security;

create policy "journal_folders: membros leem" on journal_folders for select using (is_campaign_member(campaign_id) or is_campaign_owner(campaign_id));
create policy "journal_folders: mestre cria" on journal_folders for insert with check (is_campaign_owner(campaign_id));
create policy "journal_folders: mestre edita" on journal_folders for update using (is_campaign_owner(campaign_id));
create policy "journal_folders: mestre exclui" on journal_folders for delete using (is_campaign_owner(campaign_id));

create policy "journal_entries: quem pode ver" on journal_entries for select using (
  is_campaign_owner(campaign_id)
  or author_id = auth.uid()
  or (is_campaign_member(campaign_id) and coalesce(acesso_jogadores ->> auth.uid()::text, acesso_padrao) <> 'nenhum')
);
create policy "journal_entries: membros criam os seus" on journal_entries for insert with check (
  is_campaign_owner(campaign_id) or (is_campaign_member(campaign_id) and author_id = auth.uid())
);
create policy "journal_entries: mestre, autor ou dono edita" on journal_entries for update using (
  is_campaign_owner(campaign_id)
  or author_id = auth.uid()
  or (is_campaign_member(campaign_id) and coalesce(acesso_jogadores ->> auth.uid()::text, acesso_padrao) = 'dono')
);
create policy "journal_entries: mestre ou autor exclui" on journal_entries for delete using (
  is_campaign_owner(campaign_id) or author_id = auth.uid()
);

-- Jogador edita as páginas e o nome, mas quem acessa e a pasta só o mestre muda.
create function public.diario_so_conteudo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_campaign_owner(old.campaign_id) then
    if new.campaign_id <> old.campaign_id or new.author_id <> old.author_id
       or new.acesso_padrao <> old.acesso_padrao or new.acesso_jogadores <> old.acesso_jogadores
       or new.mostrar_mestres <> old.mostrar_mestres or new.folder_id is distinct from old.folder_id then
      raise exception 'Só o mestre muda isso';
    end if;
  end if;
  return new;
end;
$$;

create trigger diario_so_conteudo before update on journal_entries
  for each row execute function diario_so_conteudo();

alter publication supabase_realtime add table journal_folders;
alter publication supabase_realtime add table journal_entries;

-- Arquivos das páginas (imagem, PDF, vídeo).
insert into storage.buckets (id, name, public)
values ('diario', 'diario', true)
on conflict (id) do nothing;

create policy "diario: leitura pública" on storage.objects for select using (bucket_id = 'diario');
create policy "diario: dono escreve" on storage.objects for insert with check (bucket_id = 'diario' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "diario: dono remove" on storage.objects for delete using (bucket_id = 'diario' and (storage.foldername(name))[1] = auth.uid()::text);
