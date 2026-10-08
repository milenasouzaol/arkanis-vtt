-- Excluir campanha (pedido da Millie, 08/10). As fichas e as rolagens prendiam a campanha (sem
-- cascata), então apagar dava erro. Só o mestre. As fichas dos jogadores continuam deles (saem da
-- campanha); as fichas que o mestre criou na mesa (NPCs) vão junto; o resto já cai em cascata.
create or replace function public.excluir_campanha(p_campaign_id uuid)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if not acesso_aprovado() or not exists (select 1 from campaigns where id = p_campaign_id and owner_id = auth.uid()) then
    raise exception 'Só o mestre exclui a campanha';
  end if;
  update character_rolls set campaign_id = null where campaign_id = p_campaign_id;
  delete from characters where campaign_id = p_campaign_id and npc;
  update characters set campaign_id = null where campaign_id = p_campaign_id;
  delete from campaigns where id = p_campaign_id;
end;
$function$;

revoke all on function public.excluir_campanha(uuid) from public, anon;
grant execute on function public.excluir_campanha(uuid) to authenticated;
