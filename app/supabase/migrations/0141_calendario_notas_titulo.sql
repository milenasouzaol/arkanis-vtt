-- Anotação do calendário com título (como no Mini Calendar, referência da Millie).
alter table public.calendario_notas add column if not exists titulo text not null default '' check (char_length(titulo) <= 120);
alter table public.calendario_notas drop constraint if exists calendario_notas_texto_check;
alter table public.calendario_notas add constraint calendario_notas_texto_check check (char_length(texto) <= 4000);
