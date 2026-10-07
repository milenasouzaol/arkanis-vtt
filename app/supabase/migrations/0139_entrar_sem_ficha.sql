-- Entrar sem ficha (pedido da Millie, 07/10): o jogador entra na mesa sem escolher personagem;
-- o mestre cria a ficha na mesa e, em Configurar Propriedade, dá "Dono" a ele.
alter table public.campaign_members add column if not exists sem_ficha boolean not null default false;
