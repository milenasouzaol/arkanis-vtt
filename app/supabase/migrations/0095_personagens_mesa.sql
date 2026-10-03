-- Personagens da mesa (KAN-49 parte 2, spec 12.7 e 12.8).
--
-- campaign_actors: o que aparece na aba Personagens. Personagem de jogador entra sozinho
-- quando ele leva o personagem pra campanha; NPC (ficha completa de Ordem Paranormal) e
-- Ameaça (do bestiário) o mestre cria. Cada um tem os tokens (principal + variáveis) e o
-- nível de acesso dos jogadores (Configurar Propriedade).

alter table characters add column if not exists npc boolean not null default false;

create table actor_folders (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  parent_id uuid references actor_folders(id) on delete cascade,
  name text not null,
  color text,
  sort_mode text not null default 'alfabetica' check (sort_mode in ('alfabetica', 'manual')),
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table campaign_actors (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  folder_id uuid references actor_folders(id) on delete set null,
  tipo text not null check (tipo in ('jogador', 'npc', 'ameaca')),
  character_id uuid unique references characters(id) on delete cascade,
  creature_id uuid references creatures(id) on delete set null,
  name text not null,
  token_url text,
  token_variacoes jsonb not null default '[]', -- [{ "id", "nome", "url" }]
  acesso_padrao text not null default 'nenhum' check (acesso_padrao in ('nenhum', 'limitado', 'observador', 'dono')),
  acesso_jogadores jsonb not null default '{}', -- { "<user_id>": "observador", ... }
  mostrar_mestres boolean not null default true,
  pv_atual int,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  check (tipo = 'ameaca' or character_id is not null)
);

create index campaign_actors_campanha on campaign_actors (campaign_id);

alter table scene_tokens add column if not exists actor_id uuid references campaign_actors(id) on delete cascade;

-- Nível de acesso desta pessoa ao personagem da mesa.
create function public.acesso_ao_ator(p_actor_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select case
    when is_campaign_owner(a.campaign_id) then 'dono'
    when c.user_id = auth.uid() then 'dono'
    when not is_campaign_member(a.campaign_id) then 'nenhum'
    -- Personagem de jogador: os outros sempre veem o card (5.8); a ficha segue os toggles dela.
    when a.tipo = 'jogador' then case when c.hidden_from_others then 'limitado' when c.editable_by_others then 'dono' else 'observador' end
    else coalesce(a.acesso_jogadores ->> auth.uid()::text, a.acesso_padrao)
  end
  from campaign_actors a
  left join characters c on c.id = a.character_id
  where a.id = p_actor_id;
$$;

alter table actor_folders enable row level security;
alter table campaign_actors enable row level security;

create policy "actor_folders: membros leem" on actor_folders for select using (is_campaign_member(campaign_id) or is_campaign_owner(campaign_id));
create policy "actor_folders: mestre cria" on actor_folders for insert with check (is_campaign_owner(campaign_id));
create policy "actor_folders: mestre edita" on actor_folders for update using (is_campaign_owner(campaign_id));
create policy "actor_folders: mestre exclui" on actor_folders for delete using (is_campaign_owner(campaign_id));

-- Nível "Nenhum" esconde o personagem da lista do jogador.
create policy "campaign_actors: quem pode ver" on campaign_actors for select using (
  is_campaign_owner(campaign_id)
  or (is_campaign_member(campaign_id) and (tipo = 'jogador' or coalesce(acesso_jogadores ->> auth.uid()::text, acesso_padrao) <> 'nenhum'))
);
create policy "campaign_actors: mestre cria" on campaign_actors for insert with check (is_campaign_owner(campaign_id) and tipo <> 'jogador');
-- Mestre edita tudo; o dono do personagem configura os tokens dele.
create policy "campaign_actors: mestre ou dono edita" on campaign_actors for update using (
  is_campaign_owner(campaign_id) or exists (select 1 from characters c where c.id = character_id and c.user_id = auth.uid())
);
create policy "campaign_actors: mestre exclui NPC e ameaça" on campaign_actors for delete using (is_campaign_owner(campaign_id) and tipo <> 'jogador');

-- O dono do personagem não pode mudar quem acessa nem o tipo; só os tokens.
create function public.ator_so_tokens()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_campaign_owner(old.campaign_id) then
    if new.tipo <> old.tipo or new.campaign_id <> old.campaign_id or new.character_id is distinct from old.character_id
       or new.acesso_padrao <> old.acesso_padrao or new.acesso_jogadores <> old.acesso_jogadores
       or new.folder_id is distinct from old.folder_id or new.pv_atual is distinct from old.pv_atual then
      raise exception 'Só o mestre muda isso';
    end if;
  end if;
  return new;
end;
$$;

create trigger campaign_actors_so_tokens before update on campaign_actors
  for each row execute function public.ator_so_tokens();

-- Personagem de jogador entra (e sai) da aba Personagens sozinho.
create function public.ator_do_jogador()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.campaign_id is distinct from new.campaign_id and old.campaign_id is not null then
    delete from campaign_actors where character_id = new.id and tipo = 'jogador';
  end if;
  if new.campaign_id is not null and not new.npc
     and not exists (select 1 from campaign_actors where character_id = new.id) then
    insert into campaign_actors (campaign_id, tipo, character_id, name, token_url)
    values (new.campaign_id, 'jogador', new.id, coalesce(nullif(new.name, ''), 'Sem nome'), new.avatar_url);
  end if;
  return new;
end;
$$;

create trigger characters_ator_do_jogador after insert or update of campaign_id on characters
  for each row execute function public.ator_do_jogador();

-- O nome do personagem acompanha a ficha.
create function public.ator_acompanha_nome()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update campaign_actors set name = coalesce(nullif(new.name, ''), 'Sem nome') where character_id = new.id and name is distinct from coalesce(nullif(new.name, ''), 'Sem nome');
  return new;
end;
$$;

create trigger characters_ator_nome after update of name on characters
  for each row execute function public.ator_acompanha_nome();

-- Quem já estava em campanha entra na lista.
insert into campaign_actors (campaign_id, tipo, character_id, name, token_url)
select c.campaign_id, 'jogador', c.id, coalesce(nullif(c.name, ''), 'Sem nome'), c.avatar_url
from characters c
where c.campaign_id is not null and not c.npc
  and not exists (select 1 from campaign_actors a where a.character_id = c.id);

-- Arrastar o personagem pro mapa (12.8): o mestre, ou o dono com o próprio personagem.
create function public.colocar_token(p_actor_id uuid, p_scene_id uuid, p_x numeric, p_y numeric, p_tamanho numeric)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ator campaign_actors%rowtype;
  v_url text;
  v_id uuid;
begin
  select * into v_ator from campaign_actors where id = p_actor_id;
  if v_ator.id is null or acesso_ao_ator(p_actor_id) <> 'dono' then
    raise exception 'Você não pode colocar este personagem na mesa';
  end if;
  if not exists (select 1 from scenes s where s.id = p_scene_id and s.campaign_id = v_ator.campaign_id) then
    raise exception 'Cena inválida';
  end if;
  select coalesce(v_ator.token_url, c.avatar_url, cr.image_url) into v_url
  from (select 1) _ left join characters c on c.id = v_ator.character_id left join creatures cr on cr.id = v_ator.creature_id;
  if v_url is null then
    raise exception 'Configure o token deste personagem primeiro';
  end if;
  insert into scene_tokens (scene_id, campaign_id, actor_id, character_id, name, image_url, x, y, width, height, layer, sort, created_by)
  values (p_scene_id, v_ator.campaign_id, v_ator.id, v_ator.character_id, v_ator.name, v_url,
          p_x - p_tamanho / 2, p_y - p_tamanho / 2, p_tamanho, p_tamanho, 'token', (extract(epoch from now()) * 1000)::bigint % 2147483647, auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;

-- Variação de Token (12.8): troca a imagem do token por uma das variações do personagem.
create function public.trocar_variacao(p_token_id uuid, p_url text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not pode_mover_objeto(p_token_id) then
    raise exception 'Você não pode mexer neste token';
  end if;
  if not exists (
    select 1 from scene_tokens t join campaign_actors a on a.id = t.actor_id
    where t.id = p_token_id and (a.token_url = p_url or a.token_variacoes @> jsonb_build_array(jsonb_build_object('url', p_url)))
  ) then
    raise exception 'Essa imagem não é uma variação deste token';
  end if;
  update scene_tokens set image_url = p_url where id = p_token_id;
end;
$$;

grant execute on function public.acesso_ao_ator(uuid) to authenticated;
grant execute on function public.colocar_token(uuid, uuid, numeric, numeric, numeric) to authenticated;
grant execute on function public.trocar_variacao(uuid, text) to authenticated;

alter publication supabase_realtime add table campaign_actors;
alter publication supabase_realtime add table actor_folders;

-- Imagens de token.
insert into storage.buckets (id, name, public)
values ('token_images', 'token_images', true)
on conflict (id) do nothing;

create policy "token_images: leitura pública" on storage.objects for select using (bucket_id = 'token_images');
create policy "token_images: dono escreve" on storage.objects for insert with check (bucket_id = 'token_images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "token_images: dono remove" on storage.objects for delete using (bucket_id = 'token_images' and (storage.foldername(name))[1] = auth.uid()::text);
