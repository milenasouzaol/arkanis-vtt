-- Convite (KAN-46, bug achado pela Millie em 03/10): abrir o link já colocava a pessoa
-- na campanha, mesmo sem personagem. Agora o link só mostra a campanha; a entrada
-- (join_campaign_by_code) acontece quando a pessoa confirma o personagem.
--
-- Quem ainda não é membro não pode ler `campaigns` pelo RLS, então a prévia vem por
-- esta função, que devolve só o que o convite precisa mostrar.

create function public.campaign_by_invite(p_invite_code text)
returns table (id uuid, name text, cover_image_url text, owner_name text, ja_membro boolean)
language sql
security definer
set search_path = public
stable
as $$
  select c.id, c.name, c.cover_image_url, p.display_name,
         exists (select 1 from campaign_members m where m.campaign_id = c.id and m.user_id = auth.uid())
  from campaigns c
  left join profiles p on p.id = c.owner_id
  where c.invite_code = p_invite_code;
$$;

grant execute on function public.campaign_by_invite(text) to authenticated;
