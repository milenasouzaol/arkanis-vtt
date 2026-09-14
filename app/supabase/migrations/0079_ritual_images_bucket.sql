-- Bucket de Storage pras imagens de rituais criados pelo jogador (Homebrew), no modal
-- de Adicionar Ritual (botao "Alterar" imagem). Mesmo padrao de character_photos/attack_images.

insert into storage.buckets (id, name, public)
values ('ritual_images', 'ritual_images', true)
on conflict (id) do nothing;

create policy "ritual_images: leitura pública" on storage.objects for select using (bucket_id = 'ritual_images');
create policy "ritual_images: dono escreve" on storage.objects for insert with check (bucket_id = 'ritual_images' and (storage.foldername(name))[1] in (select id::text from characters where user_id = auth.uid()));
create policy "ritual_images: dono atualiza" on storage.objects for update using (bucket_id = 'ritual_images' and (storage.foldername(name))[1] in (select id::text from characters where user_id = auth.uid()));
create policy "ritual_images: dono remove" on storage.objects for delete using (bucket_id = 'ritual_images' and (storage.foldername(name))[1] in (select id::text from characters where user_id = auth.uid()));
