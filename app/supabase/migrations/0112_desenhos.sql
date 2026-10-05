-- Ferramentas de Desenho (KAN-52, spec 12.13): retângulo, elipse, polígono, mão livre e texto
-- desenhados em cima do mapa. Todo mundo da campanha vê e desenha; cada um mexe nos próprios
-- desenhos e o mestre mexe em todos.
--
-- x, y, width, height: caixa do desenho em pixels do mapa. pontos: [[x, y], …] relativos à caixa
-- (polígono e mão livre). estilo: { linha: {largura, cor, opacidade}, preenchimento: {tipo, cor,
-- opacidade}, texto: {fonte, tamanho, cor, opacidade} }.

create table scene_drawings (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references scenes(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  tipo text not null check (tipo in ('retangulo', 'elipse', 'poligono', 'livre', 'texto')),
  x numeric not null default 0,
  y numeric not null default 0,
  width numeric not null default 0,
  height numeric not null default 0,
  rotation numeric not null default 0,
  pontos jsonb not null default '[]',
  texto text,
  estilo jsonb not null default '{}',
  sort bigint not null default 0,
  created_at timestamptz not null default now()
);

create index scene_drawings_cena on scene_drawings (scene_id);

alter table scene_drawings enable row level security;

create policy "scene_drawings: quem pode ver" on scene_drawings for select using (
  is_campaign_owner(campaign_id)
  or (is_campaign_member(campaign_id) and exists (select 1 from scenes s where s.id = scene_id))
);
create policy "scene_drawings: membro desenha" on scene_drawings for insert with check (
  author_id = auth.uid()
  and (is_campaign_owner(campaign_id) or is_campaign_member(campaign_id))
  and exists (select 1 from scenes s where s.id = scene_id and s.campaign_id = scene_drawings.campaign_id)
);
create policy "scene_drawings: autor ou mestre edita" on scene_drawings for update
  using (author_id = auth.uid() or is_campaign_owner(campaign_id))
  with check (author_id = auth.uid() or is_campaign_owner(campaign_id));
create policy "scene_drawings: autor ou mestre apaga" on scene_drawings for delete
  using (author_id = auth.uid() or is_campaign_owner(campaign_id));

alter publication supabase_realtime add table scene_drawings;
