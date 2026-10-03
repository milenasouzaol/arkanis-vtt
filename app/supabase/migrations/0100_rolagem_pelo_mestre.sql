-- Iniciativa no chat e no Histórico de Rolagens (KAN-50, pedido da Millie em 04/10): quando o
-- mestre inicia o combate, o teste de iniciativa de cada personagem de jogador aparece como
-- rolagem daquele personagem — com o nome do jogador e no modo de envio dele.
--
-- Agora quem pode editar a ficha (o dono, o mestre da campanha…) registra rolagem dela, mas
-- sempre em nome do dono. Isso também fecha uma brecha antiga: qualquer pessoa conseguia
-- registrar rolagem na ficha de outra, desde que no próprio nome.

drop policy if exists "character_rolls: dono insere" on character_rolls;
create policy "character_rolls: quem edita a ficha insere, em nome do dono" on character_rolls for insert with check (
  pode_editar_ficha(character_id)
  and user_id = (select c.user_id from characters c where c.id = character_id)
);
