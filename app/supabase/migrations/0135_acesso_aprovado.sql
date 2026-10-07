-- Acesso só pra quem a Millie aprovar (pedido dela, 07/10): o site vai ser passado pros amigos e
-- quem receber o link de outra pessoa não pode entrar. Qualquer um ainda cria conta, mas fica
-- "pendente" e não lê nem grava nada até ela aprovar (ou recusar / bloquear) um por um.
-- O bloqueio é no banco: uma regra RESTRITIVA em todas as tabelas, nas funções de campanha
-- (is_campaign_member / is_campaign_owner, que as ações da mesa usam), no convite e no envio de
-- arquivos. Tabela nova no futuro precisa ganhar a mesma regra (ver o fim deste arquivo).

create table acesso_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table acesso_usuarios (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'recusado', 'bloqueado')),
  email text,
  nome text,
  criado_em timestamptz not null default now(),
  decidido_em timestamptz
);

-- A Millie (dona das campanhas) administra.
insert into acesso_admins (user_id) values ('0e159832-3c75-43b2-9f67-ec0145831c41');

-- Quem já tinha conta continua entrando.
insert into acesso_usuarios (user_id, status, email, nome, decidido_em)
select u.id, 'aprovado', u.email, coalesce(p.display_name, u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'), now()
from auth.users u left join profiles p on p.id = u.id;

create function public.acesso_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from acesso_admins a where a.user_id = auth.uid());
$$;

create function public.acesso_aprovado()
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and (
    exists (select 1 from acesso_admins a where a.user_id = auth.uid())
    or exists (select 1 from acesso_usuarios u where u.user_id = auth.uid() and u.status = 'aprovado')
  );
$$;

grant execute on function public.acesso_admin() to authenticated;
grant execute on function public.acesso_aprovado() to authenticated;

-- Conta nova entra como pendente (com o e-mail e o nome, pra Millie saber quem é).
create function public.acesso_conta_nova()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into acesso_usuarios (user_id, status, email, nome)
  values (new.id, 'pendente', new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger acesso_conta_nova after insert on auth.users
  for each row execute function public.acesso_conta_nova();

alter table acesso_admins enable row level security;
alter table acesso_usuarios enable row level security;

create policy "acesso_admins: a pessoa ve se e admin" on acesso_admins for select using (user_id = auth.uid());
create policy "acesso_usuarios: a pessoa ve o seu, o admin ve todos" on acesso_usuarios for select using (user_id = auth.uid() or acesso_admin());

-- Aprovar / recusar / bloquear: só o admin, e ele não se tranca pra fora.
create function public.decidir_acesso(p_user_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not acesso_admin() then
    raise exception 'Só a administradora decide';
  end if;
  if p_status not in ('pendente', 'aprovado', 'recusado', 'bloqueado') then
    raise exception 'Situação inválida';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Você não pode mudar o seu próprio acesso';
  end if;
  update acesso_usuarios set status = p_status, decidido_em = now() where user_id = p_user_id;
end;
$$;

grant execute on function public.decidir_acesso(uuid, text) to authenticated;

-- As funções de campanha (usadas pelas regras e por todas as ações da mesa) exigem aprovação.
create or replace function public.is_campaign_member(p_campaign_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select acesso_aprovado() and exists (select 1 from campaign_members m where m.campaign_id = p_campaign_id and m.user_id = auth.uid());
$$;

create or replace function public.is_campaign_owner(p_campaign_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select acesso_aprovado() and exists (select 1 from campaigns c where c.id = p_campaign_id and c.owner_id = auth.uid());
$$;

-- Regra restritiva em todas as tabelas do app: soma (E) com as regras que já existem.
do $$
declare
  t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' and tablename not in ('acesso_admins', 'acesso_usuarios') loop
    execute format('create policy "acesso: so aprovados" on public.%I as restrictive for all to public using ((select public.acesso_aprovado())) with check ((select public.acesso_aprovado()))', t.tablename);
  end loop;
end $$;

-- Arquivos: enviar, trocar e apagar só aprovado (ler continua pelo link público das imagens).
create policy "acesso: so aprovados enviam" on storage.objects as restrictive for insert to public with check ((select public.acesso_aprovado()));
create policy "acesso: so aprovados trocam" on storage.objects as restrictive for update to public using ((select public.acesso_aprovado()));
create policy "acesso: so aprovados apagam" on storage.objects as restrictive for delete to public using ((select public.acesso_aprovado()));

alter publication supabase_realtime add table acesso_usuarios;

-- Funções que rodam por fora das regras (security definer) e não passam por is_campaign_*:
-- também exigem aprovação.
create or replace function public.join_campaign_by_code(p_invite_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_campaign_id uuid;
begin
  if not acesso_aprovado() then
    raise exception 'Seu acesso ainda não foi aprovado';
  end if;
  select id into v_campaign_id from campaigns where invite_code = p_invite_code;
  if v_campaign_id is null then
    raise exception 'Código de convite inválido';
  end if;
  insert into campaign_members (campaign_id, user_id)
  values (v_campaign_id, auth.uid())
  on conflict (campaign_id, user_id) do nothing;
  return v_campaign_id;
end;
$$;

create or replace function public.campaign_by_invite(p_invite_code text)
returns table(id uuid, name text, cover_image_url text, owner_name text, ja_membro boolean)
language sql stable security definer set search_path = public as $$
  select c.id, c.name, c.cover_image_url, p.display_name,
         exists (select 1 from campaign_members m where m.campaign_id = c.id and m.user_id = auth.uid())
  from campaigns c
  left join profiles p on p.id = c.owner_id
  where c.invite_code = p_invite_code and acesso_aprovado();
$$;

create or replace function public.pode_editar_ficha(p_character_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select acesso_aprovado() and exists (
    select 1
    from characters c
    left join campaign_actors a on a.character_id = c.id
    where c.id = p_character_id
      and (
        c.user_id = auth.uid()
        or (c.campaign_id is not null and is_campaign_owner(c.campaign_id))
        or (
          c.campaign_id is not null and is_campaign_member(c.campaign_id)
          and case
            when c.npc then coalesce(a.acesso_jogadores ->> auth.uid()::text, a.acesso_padrao, 'nenhum') = 'dono'
            else c.editable_by_others
          end
        )
      )
  );
$$;

create or replace function public.pode_ver_ficha(p_character_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select acesso_aprovado() and exists (
    select 1
    from characters c
    left join campaign_actors a on a.character_id = c.id
    where c.id = p_character_id
      and (
        c.user_id = auth.uid()
        or (c.campaign_id is not null and is_campaign_owner(c.campaign_id))
        or (
          c.campaign_id is not null and is_campaign_member(c.campaign_id)
          and case
            when c.npc then coalesce(a.acesso_jogadores ->> auth.uid()::text, a.acesso_padrao, 'nenhum') in ('observador', 'dono')
            else not c.hidden_from_others
          end
        )
      )
  );
$$;

create or replace function public.acesso_ao_ator(p_actor_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select case
    when not acesso_aprovado() then 'nenhum'
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

-- duplicate_character: confere aprovação antes de copiar.
do $$
declare
  d text;
begin
  select pg_get_functiondef('public.duplicate_character(uuid)'::regprocedure) into d;
  d := replace(d, E'begin\r\n  select user_id into v_owner', E'begin\r\n  if not acesso_aprovado() then\r\n    raise exception ''not allowed'';\r\n  end if;\r\n  select user_id into v_owner');
  if position('acesso_aprovado' in d) = 0 then
    raise exception 'duplicate_character: não achei onde pôr a checagem';
  end if;
  execute d;
end $$;

-- LEMBRETE pra tabela nova no futuro:
--   create policy "acesso: so aprovados" on public.<tabela> as restrictive for all to public
--     using ((select public.acesso_aprovado())) with check ((select public.acesso_aprovado()));
