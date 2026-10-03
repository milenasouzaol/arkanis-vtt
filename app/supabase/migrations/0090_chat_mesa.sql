-- Mensagens de Chat da mesa (KAN-47, spec 12.3).
--
-- Cada mensagem guarda o modo de envio escolhido na hora, que decide quem lê:
--   publico_usuario / publico_personagem -> todo mundo da campanha
--   privado_mestres -> quem enviou e o mestre (até o mestre "Revelar para Todos")
--   cego_mestres    -> quem enviou e os jogadores; o mestre não vê
--   somente_si      -> só quem enviou
-- O mestre destaca, revela e exclui. As rolagens da ficha entram no chat por trigger,
-- usando o modo que a pessoa tem selecionado no chat da mesa (campaign_members.chat_mode).

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  character_id uuid references characters(id) on delete set null,
  modo text not null check (modo in ('publico_usuario', 'privado_mestres', 'cego_mestres', 'somente_si', 'publico_personagem')),
  autor_nome text not null,
  autor_foto text,
  conteudo text,
  rolagem jsonb,
  destacada boolean not null default false,
  revelada boolean not null default false,
  created_at timestamptz not null default now()
);

create index chat_messages_campanha on chat_messages (campaign_id, created_at);

alter table chat_messages enable row level security;

create policy "chat_messages: quem pode ler" on chat_messages for select using (
  auth.uid() = user_id
  or (
    (is_campaign_member(campaign_id) or is_campaign_owner(campaign_id))
    and (
      modo in ('publico_usuario', 'publico_personagem')
      or revelada
      or (modo = 'privado_mestres' and is_campaign_owner(campaign_id))
      or (modo = 'cego_mestres' and not is_campaign_owner(campaign_id))
    )
  )
);

create policy "chat_messages: membro envia" on chat_messages for insert with check (
  auth.uid() = user_id and (is_campaign_member(campaign_id) or is_campaign_owner(campaign_id))
);

-- Destacar e Revelar para Todos são do mestre.
create policy "chat_messages: mestre edita" on chat_messages for update using (is_campaign_owner(campaign_id));
create policy "chat_messages: mestre exclui" on chat_messages for delete using (is_campaign_owner(campaign_id));

alter publication supabase_realtime add table chat_messages;

-- Modo de envio selecionado por cada pessoa na mesa; vale também pras rolagens da ficha.
alter table campaign_members add column chat_mode text not null default 'publico_personagem'
  check (chat_mode in ('publico_usuario', 'privado_mestres', 'cego_mestres', 'somente_si', 'publico_personagem'));

create policy "campaign_members: membro muda o próprio modo" on campaign_members for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Toda rolagem da ficha numa campanha vira mensagem no chat da mesa.
create function public.rolagem_no_chat()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_modo text;
  v_foto text;
  v_conta text;
begin
  if new.campaign_id is null then
    return new;
  end if;
  select chat_mode into v_modo from campaign_members where campaign_id = new.campaign_id and user_id = new.user_id;
  select avatar_url into v_foto from characters where id = new.character_id;
  if v_modo = 'publico_usuario' then
    select display_name, avatar_url into v_conta, v_foto from profiles where id = new.user_id;
  end if;
  insert into chat_messages (campaign_id, user_id, character_id, modo, autor_nome, autor_foto, rolagem)
  values (
    new.campaign_id, new.user_id, new.character_id, coalesce(v_modo, 'publico_personagem'),
    coalesce(case when v_modo = 'publico_usuario' then v_conta end, new.character_name, 'Sem nome'),
    v_foto,
    jsonb_build_object('label', new.label, 'total', new.total, 'detail', new.detail, 'dice', new.dice, 'bonus', new.bonus)
  );
  return new;
end;
$$;

create trigger character_rolls_no_chat after insert on character_rolls
  for each row execute function public.rolagem_no_chat();

-- Imagens coladas ou arrastadas no chat.
insert into storage.buckets (id, name, public)
values ('chat_images', 'chat_images', true)
on conflict (id) do nothing;

create policy "chat_images: leitura pública" on storage.objects for select using (bucket_id = 'chat_images');
create policy "chat_images: dono escreve" on storage.objects for insert with check (bucket_id = 'chat_images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "chat_images: dono remove" on storage.objects for delete using (bucket_id = 'chat_images' and (storage.foldername(name))[1] = auth.uid()::text);
