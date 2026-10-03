-- Pastas de variações de token (KAN-49, pedido da Millie em 04/10): organizar os tokens
-- variáveis em grupos ("Roupas pretas", "Emoções"…). Cada variação guarda a pasta dela
-- em token_variacoes[].pasta; aqui ficam as pastas (inclusive as ainda vazias).

alter table campaign_actors add column if not exists token_pastas jsonb not null default '[]'; -- [{ "id", "nome" }]
