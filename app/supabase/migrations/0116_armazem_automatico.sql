-- Posicionáveis (KAN-53, pedido da Millie): todo desenho feito com as Ferramentas de Desenho
-- (de qualquer pessoa) e todo Som Ambiente criado na mesa ficam registrados sozinhos no
-- armazém do mestre, nas abas Desenhos e Sons Ambientes. Mudou a forma/texto/som na mesa, o
-- registro acompanha. Apagar da mesa não apaga do armazém. O que foi colocado a partir do
-- armazém (posicionavel_id preenchido) não se registra de novo.

alter table posicionaveis add column origem_id uuid; -- desenho/som da mesa que gerou o registro
create unique index posicionaveis_origem on posicionaveis (origem_id) where origem_id is not null;

alter table scene_drawings add column posicionavel_id uuid references posicionaveis(id) on delete set null;
alter table scene_sounds add column posicionavel_id uuid references posicionaveis(id) on delete set null;

create function nome_do_desenho(p_tipo text, p_texto text) returns text language sql immutable as $$
  select case
    when p_tipo = 'texto' and coalesce(trim(p_texto), '') <> '' then left(trim(p_texto), 40)
    else case p_tipo when 'retangulo' then 'Retângulo' when 'elipse' then 'Elipse' when 'poligono' then 'Polígono' when 'livre' then 'Mão Livre' else 'Texto' end
  end
$$;

create function dados_do_desenho(d scene_drawings) returns jsonb language sql immutable as $$
  select jsonb_build_object('desenho', jsonb_build_object(
    'tipo', d.tipo, 'width', d.width, 'height', d.height, 'rotation', d.rotation,
    'pontos', d.pontos, 'texto', d.texto, 'estilo', d.estilo))
$$;

create function registrar_desenho_no_armazem() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.posicionavel_id is null then
      insert into posicionaveis (campaign_id, categoria, name, dados, origem_id)
      values (new.campaign_id, 'desenho', nome_do_desenho(new.tipo, new.texto), dados_do_desenho(new), new.id)
      on conflict do nothing;
    end if;
  else
    update posicionaveis set dados = dados_do_desenho(new) where origem_id = new.id;
  end if;
  return new;
end $$;

create trigger desenho_no_armazem after insert on scene_drawings
  for each row execute function registrar_desenho_no_armazem();
create trigger desenho_no_armazem_muda after update of tipo, width, height, rotation, pontos, texto, estilo on scene_drawings
  for each row execute function registrar_desenho_no_armazem();

create function dados_do_som(s scene_sounds) returns jsonb language sql immutable as $$
  select jsonb_build_object('largura', s.width, 'altura', s.height, 'volume', s.volume, 'suavizar', s.suavizar)
$$;

create function registrar_som_no_armazem() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.posicionavel_id is null then
      insert into posicionaveis (campaign_id, categoria, name, url, dados, origem_id)
      values (new.campaign_id, 'som', coalesce(nullif(trim(new.name), ''), 'Som Ambiente'), new.url, dados_do_som(new), new.id)
      on conflict do nothing;
    end if;
  else
    update posicionaveis set url = new.url, dados = dados_do_som(new),
      name = case when new.name is distinct from old.name then coalesce(nullif(trim(new.name), ''), name) else name end
    where origem_id = new.id;
  end if;
  return new;
end $$;

create trigger som_no_armazem after insert on scene_sounds
  for each row execute function registrar_som_no_armazem();
create trigger som_no_armazem_muda after update of name, url, width, height, volume, suavizar on scene_sounds
  for each row execute function registrar_som_no_armazem();

-- O que já está nas mesas entra no armazém agora.
insert into posicionaveis (campaign_id, categoria, name, dados, origem_id, created_at)
select d.campaign_id, 'desenho', nome_do_desenho(d.tipo, d.texto), dados_do_desenho(d), d.id, d.created_at from scene_drawings d
on conflict do nothing;

insert into posicionaveis (campaign_id, categoria, name, url, dados, origem_id, created_at)
select s.campaign_id, 'som', coalesce(nullif(trim(s.name), ''), 'Som Ambiente'), s.url, dados_do_som(s), s.id, s.created_at from scene_sounds s
on conflict do nothing;
