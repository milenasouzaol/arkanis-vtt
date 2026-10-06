-- Luz Ambiente (KAN-53, pedido da Millie, 06/10): uma luz parada no mapa (lâmpada, poste,
-- fogueira, vela) que clareia a escuridão em volta, no mesmo sistema da lanterna. Fica no
-- objeto da cena (o da aba Luzes Ambientes já nasce como luz; o mestre pode acender qualquer
-- objeto/token pelo botão direito):
--   { "ligada": bool, "raio": quadrados (null = metade do tamanho do objeto),
--     "forte": 0..1 (parte do raio com luz cheia), "cor": "#rrggbb", "intensidade": 0..1,
--     "angulo": graus de abertura (360 = em volta toda), "direcao": graus (0 = direita),
--     "animacao": "nenhuma" | "tremular" | "pulsar" }
-- Só o mestre mexe (as políticas de scene_tokens já cuidam disso).

alter table scene_tokens add column luz_ajuste jsonb;
