-- Token da ficha que o mestre deu como Dono (Configurar Propriedade): o jogador move, gira, vira,
-- liga a lanterna e troca a variação. Antes só valia pra quem criou a ficha (bug relatado pela
-- Millie, 07/10).
create or replace function public.pode_mover_objeto(p_id uuid)
 returns boolean
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select acesso_aprovado() and exists (
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
            or (c.id is not null and c.npc and pode_editar_ficha(c.id))
            or t.move_permission = 'todos'
            or (t.move_permission = 'jogadores' and auth.uid() = any (t.movable_by))
          )
        )
      )
  );
$function$;
