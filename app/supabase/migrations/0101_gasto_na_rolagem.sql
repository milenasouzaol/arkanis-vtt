-- Gasto de PE/PD dos rituais (pedido da Millie em 04/10): a rolagem guarda uma nota
-- ("Gastou 3 PE (12 → 9)") que aparece embaixo dela no chat e no Histórico de Rolagens.
-- Ritual sem dados também é registrado (sem_rolagem): aparece no chat só com o nome e o gasto.

alter table character_rolls add column if not exists nota text;
alter table character_rolls add column if not exists sem_rolagem boolean not null default false;

create or replace function public.rolagem_no_chat()
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
    jsonb_build_object('label', new.label, 'total', new.total, 'detail', new.detail, 'dice', new.dice, 'bonus', new.bonus,
                       'nota', new.nota, 'sem_rolagem', new.sem_rolagem)
  );
  return new;
end;
$$;
