-- Efeitos animados (pedido da Millie, 06/10): fogo, fumaça, água, nuvem, veneno e faíscas
-- saindo de um objeto da cena, na direção e na cor escolhidas. Fica no objeto:
--   { "tipo": "fogo" | "fumaca" | "agua" | "nuvem" | "veneno" | "faiscas",
--     "cor": "#rrggbb", "tamanho": quadrados, "quantidade": 0.2..2, "velocidade": 0.3..2,
--     "direcao": graus (-90 = pra cima), "abertura": graus de espalhamento }
-- Só o mestre mexe (as políticas de scene_tokens já cuidam disso).

alter table scene_tokens add column efeito jsonb;
