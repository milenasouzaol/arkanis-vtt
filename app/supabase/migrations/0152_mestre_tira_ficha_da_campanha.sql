-- O mestre pode tirar a ficha de um jogador da campanha dele (ao excluir a campanha ou remover o
-- jogador): só o campaign_id vira vazio, nada mais da ficha muda. O resto continua só do dono.
create or replace function public.ficha_so_o_dono_muda()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'O dono da ficha não muda';
  end if;
  -- (auth.uid() nulo = manutenção direto no banco, que pode tudo)
  if auth.uid() is not null and old.user_id is distinct from auth.uid() and (
    new.campaign_id is distinct from old.campaign_id
    or new.npc is distinct from old.npc
    or new.hidden_from_others is distinct from old.hidden_from_others
    or new.editable_by_others is distinct from old.editable_by_others
  ) then
    if not (
      new.campaign_id is null and old.campaign_id is not null and is_campaign_owner(old.campaign_id)
      and new.npc is not distinct from old.npc
      and new.hidden_from_others is not distinct from old.hidden_from_others
      and new.editable_by_others is not distinct from old.editable_by_others
    ) then
      raise exception 'Só o dono da ficha muda isso';
    end if;
  end if;
  return new;
end;
$function$;
