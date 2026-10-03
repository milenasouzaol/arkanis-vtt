-- Homebrew de ameaças (KAN-50, pedido da Millie em 05/10).
--
-- O mestre cria a ameaça do zero (ou duplica uma do bestiário e edita). Ela fica no livro
-- "Homebrew", é do mestre (owner_id) e serve em todas as campanhas dele.
-- Quem vê: o próprio mestre e os jogadores das campanhas dele (o nome e a imagem aparecem na
-- mesa; a ficha e a vida a mesa já esconde dos jogadores). Quem mexe: só o dono.

insert into sources (slug, name, sort_order)
select 'homebrew', 'Homebrew', 999
where not exists (select 1 from sources where slug = 'homebrew');

alter table creatures add column if not exists owner_id uuid references auth.users(id) on delete cascade;

create index if not exists creatures_dono on creatures (owner_id) where owner_id is not null;

drop policy if exists "creatures: leitura pública" on creatures;

create policy "creatures: bestiário e homebrew de quem joga comigo" on creatures for select using (
  owner_id is null
  or owner_id = auth.uid()
  or exists (
    select 1 from campaigns c
    join campaign_members m on m.campaign_id = c.id
    where c.owner_id = creatures.owner_id and m.user_id = auth.uid()
  )
);

create policy "creatures: mestre cria homebrew" on creatures for insert with check (
  owner_id = auth.uid() and source_id = (select id from sources where slug = 'homebrew')
);

create policy "creatures: dono edita" on creatures for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and source_id = (select id from sources where slug = 'homebrew'));

create policy "creatures: dono exclui" on creatures for delete using (owner_id = auth.uid());

grant insert, update, delete on creatures to authenticated;
