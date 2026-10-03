-- Ficha aberta de dentro da mesa (KAN-49, bug achado pela Millie em 04/10): o mestre não
-- conseguia salvar nada na ficha de um jogador (e nem ler perícias, inventário etc.), porque
-- tudo da ficha só valia pro dono.
--
-- Quem VÊ a ficha inteira: o dono; o mestre da campanha; os outros membros, se a ficha não
-- estiver "Oculta para outros jogadores" (5.8) — num NPC, se o nível dele for Observador ou Dono.
-- Quem EDITA: o dono; o mestre; os outros membros com "Editável para outros jogadores" ligado
-- — num NPC, com nível Dono (Configurar Propriedade, 12.7).

create function public.pode_ver_ficha(p_character_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from characters c
    left join campaign_actors a on a.character_id = c.id
    where c.id = p_character_id
      and (
        c.user_id = auth.uid()
        or (c.campaign_id is not null and is_campaign_owner(c.campaign_id))
        or (
          c.campaign_id is not null and is_campaign_member(c.campaign_id)
          and case
            when c.npc then coalesce(a.acesso_jogadores ->> auth.uid()::text, a.acesso_padrao, 'nenhum') in ('observador', 'dono')
            else not c.hidden_from_others
          end
        )
      )
  );
$$;

create function public.pode_editar_ficha(p_character_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from characters c
    left join campaign_actors a on a.character_id = c.id
    where c.id = p_character_id
      and (
        c.user_id = auth.uid()
        or (c.campaign_id is not null and is_campaign_owner(c.campaign_id))
        or (
          c.campaign_id is not null and is_campaign_member(c.campaign_id)
          and case
            when c.npc then coalesce(a.acesso_jogadores ->> auth.uid()::text, a.acesso_padrao, 'nenhum') = 'dono'
            else c.editable_by_others
          end
        )
      )
  );
$$;

grant execute on function public.pode_ver_ficha(uuid) to authenticated;
grant execute on function public.pode_editar_ficha(uuid) to authenticated;

-- A ficha em si.
drop policy if exists "characters: dono edita" on characters;
create policy "characters: quem pode editar" on characters for update using (pode_editar_ficha(id));

-- Quem edita a ficha de outra pessoa não troca o dono, a campanha nem os toggles de privacidade.
create function public.ficha_so_o_dono_muda()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
    raise exception 'Só o dono da ficha muda isso';
  end if;
  return new;
end;
$$;

create trigger characters_so_o_dono_muda before update on characters
  for each row execute function public.ficha_so_o_dono_muda();

-- Tudo que pendura na ficha segue as mesmas duas regras.
do $$
declare
  t text;
begin
  foreach t in array array[
    'character_abilities', 'character_attacks', 'character_effects', 'character_inventory',
    'character_investigation_pages', 'character_modifiers', 'character_progression_picks',
    'character_rituals', 'character_skills', 'character_temp_bonuses'
  ] loop
    execute format('drop policy if exists %I on %I', t || ': segue o personagem', t);
    execute format('create policy %I on %I for select using (pode_ver_ficha(character_id))', t || ': quem pode ver', t);
    execute format('create policy %I on %I for insert with check (pode_editar_ficha(character_id))', t || ': quem pode editar cria', t);
    execute format('create policy %I on %I for update using (pode_editar_ficha(character_id))', t || ': quem pode editar altera', t);
    execute format('create policy %I on %I for delete using (pode_editar_ficha(character_id))', t || ': quem pode editar apaga', t);
  end loop;
end;
$$;
