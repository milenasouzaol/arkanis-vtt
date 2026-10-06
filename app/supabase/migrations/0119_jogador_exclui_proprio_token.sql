-- Jogador exclui o próprio token (pedido da Millie, 05/10): o mestre exclui qualquer um; o jogador
-- só o dele (o token do personagem dele, ou de um personagem de que ele é dono), por exemplo se
-- der algum problema. Passa por esta função, que confere cada um.

create function public.excluir_meus_tokens(p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  foreach v_id in array p_ids loop
    if not exists (
      select 1
      from scene_tokens t
      left join characters c on c.id = t.character_id
      where t.id = v_id
        and (
          is_campaign_owner(t.campaign_id)
          or (
            is_campaign_member(t.campaign_id)
            and (c.user_id = auth.uid() or (t.actor_id is not null and acesso_ao_ator(t.actor_id) = 'dono'))
          )
        )
    ) then
      raise exception 'Você só pode excluir o seu próprio token';
    end if;
  end loop;
  delete from scene_tokens where id = any (p_ids);
end;
$$;

grant execute on function public.excluir_meus_tokens(uuid[]) to authenticated;
