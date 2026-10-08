-- Quem o mestre marcou como Dono do personagem (Configurar Propriedade) também salva o Configurar
-- Token dele. O gatilho ator_so_tokens continua impedindo que o jogador mude o resto (tipo,
-- propriedade, pasta, vida).
drop policy if exists "campaign_actors: mestre ou dono edita" on public.campaign_actors;
create policy "campaign_actors: mestre ou dono edita" on public.campaign_actors for update
  using (
    is_campaign_owner(campaign_id)
    or exists (select 1 from characters c where c.id = campaign_actors.character_id and c.user_id = (select auth.uid()))
    or (is_campaign_member(campaign_id) and acesso_jogadores ->> (select auth.uid())::text = 'dono')
  );
