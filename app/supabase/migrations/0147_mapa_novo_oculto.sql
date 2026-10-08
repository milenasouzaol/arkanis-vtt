-- Mapa novo nasce só pro mestre (pedido da Millie, 07/10): os jogadores veem a cena ativa e as que
-- o mestre liberar em "Quem pode ver" (botão direito no mapa). Sem spoiler.
alter table public.scenes alter column visibility set default 'mestre';

-- Tormentos da Arena Macabra: todas as cenas ficam só pro mestre (a ativa todo mundo vê igual).
update public.scenes set visibility = 'mestre', visible_to = '{}'
 where campaign_id = '26743a7a-6e35-4560-8be4-da3a53650661';
