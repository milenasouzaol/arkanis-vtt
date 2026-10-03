-- Criar Campanha (página nova): bucket pra imagem de capa da campanha.
-- Cada pessoa sobe a capa numa pasta com o próprio id.

insert into storage.buckets (id, name, public)
values ('campaign_covers', 'campaign_covers', true)
on conflict (id) do nothing;

create policy "campaign_covers: leitura pública" on storage.objects for select using (bucket_id = 'campaign_covers');
create policy "campaign_covers: dono escreve" on storage.objects for insert with check (bucket_id = 'campaign_covers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "campaign_covers: dono atualiza" on storage.objects for update using (bucket_id = 'campaign_covers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "campaign_covers: dono remove" on storage.objects for delete using (bucket_id = 'campaign_covers' and (storage.foldername(name))[1] = auth.uid()::text);
