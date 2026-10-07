-- Efeitos de cena coloridos (pedido da Millie, 07/10): cor do efeito climático (chuva de sangue,
-- névoa vermelha…), o clima novo "fumaca" (lua de sangue) e o filtro de iluminação colorido.
alter table public.scenes add column if not exists weather_cor text check (weather_cor is null or weather_cor ~ '^#[0-9a-fA-F]{6}$');
alter table public.scenes add column if not exists filtro_cor text check (filtro_cor is null or filtro_cor ~ '^#[0-9a-fA-F]{6}$');
alter table public.scenes add column if not exists filtro_intensidade numeric not null default 0.3 check (filtro_intensidade between 0 and 1);
alter table public.scenes drop constraint if exists scenes_weather_check;
alter table public.scenes add constraint scenes_weather_check check (weather = any (array['folhas', 'chuva', 'tempestade', 'nevoa', 'neve', 'nebulosa', 'fumaca']));
