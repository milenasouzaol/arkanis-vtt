-- Grade pela quantidade de quadrados (pedido da Millie em 05/10): em vez do tamanho em pixels,
-- o mestre diz quantos quadrados a grade tem na largura e na altura, e ela cobre a imagem
-- inteira, sem cortar a última linha/coluna. Sem os dois (cenas antigas), vale o grid_size.

alter table scenes add column if not exists grid_colunas int check (grid_colunas between 1 and 400);
alter table scenes add column if not exists grid_linhas int check (grid_linhas between 1 and 400);
