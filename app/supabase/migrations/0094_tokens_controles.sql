-- Tokens na mesa (KAN-49, spec 12.8): o que faltava nos objetos da cena.
--
-- * Agrupar: objetos com o mesmo group_id se movem juntos.
-- * Configurar Propriedade: quem, além do mestre, pode mover o token — Somente Eu
--   (o dono: o jogador do personagem, ou só o mestre), Todos os Jogadores, ou jogadores
--   escolhidos. Jogador move pela função mover_objetos, que só mexe na posição.

alter table scene_tokens add column group_id uuid;
alter table scene_tokens add column move_permission text not null default 'dono'
  check (move_permission in ('dono', 'todos', 'jogadores'));
alter table scene_tokens add column movable_by uuid[] not null default '{}';

-- Jogador pode mover este objeto?
create function public.pode_mover_objeto(p_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from scene_tokens t
    left join characters c on c.id = t.character_id
    where t.id = p_id
      and (
        is_campaign_owner(t.campaign_id)
        or (
          is_campaign_member(t.campaign_id)
          and not t.locked
          and t.layer <> 'mestre'
          and (
            c.user_id = auth.uid()
            or t.move_permission = 'todos'
            or (t.move_permission = 'jogadores' and auth.uid() = any (t.movable_by))
          )
        )
      )
  );
$$;

-- Move um ou mais objetos (e quem estiver no mesmo grupo junto) pelo mesmo deslocamento.
-- Só a posição muda; o resto continua sendo só do mestre.
create function public.mover_objetos(p_ids uuid[], p_dx numeric, p_dy numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  foreach v_id in array p_ids loop
    if not pode_mover_objeto(v_id) then
      raise exception 'Você não pode mover este token';
    end if;
  end loop;

  update scene_tokens t
  set x = t.x + p_dx, y = t.y + p_dy
  where (t.id = any (p_ids)
     or (t.group_id is not null and t.group_id in (select g.group_id from scene_tokens g where g.id = any (p_ids) and g.group_id is not null)))
    and pode_mover_objeto(t.id);
end;
$$;

grant execute on function public.pode_mover_objeto(uuid) to authenticated;
grant execute on function public.mover_objetos(uuid[], numeric, numeric) to authenticated;
