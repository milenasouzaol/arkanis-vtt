-- Itens da mesa (KAN-53, spec 12.10 + prints do Foundry da Millie): itens/objetos interagíveis
-- da campanha, em pastas. Categoria (Item Lootável, Contêiner, Documento/Pista, Artefato
-- Amaldiçoado, Armadilha), raridade, quantidade, carga, descrição, detalhes (tipo, teste de
-- interação, usos), atividades (Ataque, Castar Ritual, Checar, Dano, Cura, Sumonar,
-- Transformar) e efeitos (vai pro inventário, documento, imagem).
-- Quem vê: como os personagens da mesa (Configurar Propriedade): Nenhum, Limitado (só o nome),
-- Observador (lê a ficha) ou Dono (edita).

create table item_folders (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  parent_id uuid references item_folders(id) on delete cascade,
  name text not null,
  color text,
  sort_mode text not null default 'alfabetica' check (sort_mode in ('alfabetica', 'manual')),
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table campaign_items (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  folder_id uuid references item_folders(id) on delete set null,
  name text not null,
  categoria text not null default 'lootavel' check (categoria in ('lootavel', 'conteiner', 'documento', 'amaldicoado', 'armadilha')),
  image_url text,
  raridade text check (raridade in ('comum', 'incomum', 'raro', 'muito_raro', 'lendario', 'amaldicoado')),
  quantidade int not null default 1 check (quantidade >= 0),
  carga numeric not null default 0 check (carga >= 0),
  descricao text,
  detalhes jsonb not null default '{}',
  atividades jsonb not null default '[]',
  efeitos jsonb not null default '{}',
  acesso_padrao text not null default 'nenhum' check (acesso_padrao in ('nenhum', 'limitado', 'observador', 'dono')),
  acesso_jogadores jsonb not null default '{}',
  mostrar_mestres boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create index campaign_items_campanha on campaign_items (campaign_id);
create index item_folders_campanha on item_folders (campaign_id);

create function public.acesso_ao_item(p_item_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select case
    when is_campaign_owner(i.campaign_id) then 'dono'
    when not is_campaign_member(i.campaign_id) then 'nenhum'
    else coalesce(i.acesso_jogadores ->> auth.uid()::text, i.acesso_padrao)
  end
  from campaign_items i
  where i.id = p_item_id;
$$;

grant execute on function public.acesso_ao_item(uuid) to authenticated;

alter table item_folders enable row level security;
alter table campaign_items enable row level security;

create policy "item_folders: membros leem" on item_folders for select using (is_campaign_member(campaign_id) or is_campaign_owner(campaign_id));
create policy "item_folders: mestre cria" on item_folders for insert with check (is_campaign_owner(campaign_id));
create policy "item_folders: mestre edita" on item_folders for update using (is_campaign_owner(campaign_id));
create policy "item_folders: mestre exclui" on item_folders for delete using (is_campaign_owner(campaign_id));

create policy "campaign_items: quem pode ver" on campaign_items for select using (
  is_campaign_owner(campaign_id)
  or (is_campaign_member(campaign_id) and coalesce(acesso_jogadores ->> auth.uid()::text, acesso_padrao) <> 'nenhum')
);
create policy "campaign_items: mestre cria" on campaign_items for insert with check (is_campaign_owner(campaign_id));
create policy "campaign_items: mestre ou dono edita" on campaign_items for update using (
  is_campaign_owner(campaign_id)
  or (is_campaign_member(campaign_id) and coalesce(acesso_jogadores ->> auth.uid()::text, acesso_padrao) = 'dono')
);
create policy "campaign_items: mestre exclui" on campaign_items for delete using (is_campaign_owner(campaign_id));

-- Jogador dono edita o item, mas não muda quem acessa nem a pasta.
create function public.item_so_conteudo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_campaign_owner(old.campaign_id) then
    if new.campaign_id <> old.campaign_id or new.acesso_padrao <> old.acesso_padrao
       or new.acesso_jogadores <> old.acesso_jogadores or new.mostrar_mestres <> old.mostrar_mestres
       or new.folder_id is distinct from old.folder_id then
      raise exception 'Só o mestre muda isso';
    end if;
  end if;
  return new;
end;
$$;

create trigger item_so_conteudo before update on campaign_items
  for each row execute function item_so_conteudo();

alter publication supabase_realtime add table item_folders;
alter publication supabase_realtime add table campaign_items;

-- Imagens dos itens.
insert into storage.buckets (id, name, public)
values ('item_images', 'item_images', true)
on conflict (id) do nothing;

create policy "item_images: leitura pública" on storage.objects for select using (bucket_id = 'item_images');
create policy "item_images: dono escreve" on storage.objects for insert with check (bucket_id = 'item_images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "item_images: dono remove" on storage.objects for delete using (bucket_id = 'item_images' and (storage.foldername(name))[1] = auth.uid()::text);
