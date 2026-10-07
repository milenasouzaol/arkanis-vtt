-- Imagem de ritual: quem pode editar a ficha pode enviar (antes só quem criou a ficha; a ficha que
-- o mestre deu como Dono a um jogador não conseguia). A pasta continua sendo o id da ficha.
create or replace function public.pasta_de_ficha_editavel(p_nome text)
 returns boolean
 language sql
 stable security definer
 set search_path to 'public'
as $$
  select acesso_aprovado() and coalesce(
    (select pode_editar_ficha(f::uuid) from (select (storage.foldername(p_nome))[1] f) x
      where f ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    false);
$$;

drop policy if exists "ritual_images: dono escreve" on storage.objects;
drop policy if exists "ritual_images: dono atualiza" on storage.objects;
drop policy if exists "ritual_images: dono remove" on storage.objects;

create policy "ritual_images: quem edita a ficha escreve" on storage.objects for insert
  with check (bucket_id = 'ritual_images' and public.pasta_de_ficha_editavel(name));
create policy "ritual_images: quem edita a ficha atualiza" on storage.objects for update
  using (bucket_id = 'ritual_images' and public.pasta_de_ficha_editavel(name));
create policy "ritual_images: quem edita a ficha remove" on storage.objects for delete
  using (bucket_id = 'ritual_images' and public.pasta_de_ficha_editavel(name));
