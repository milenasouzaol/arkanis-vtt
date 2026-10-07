-- Tempo e Calendário (pedido da Millie, 07/10): anotações por dia do calendário da campanha.
-- O tempo em si fica em campaigns.configuracoes.tempo (só o mestre muda). Cada anotação é de quem
-- escreveu; "compartilhada" a mesa toda vê. dia = dia da campanha (0 = o dia em que começou).
create table if not exists public.calendario_notas (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  author_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  dia integer not null,
  texto text not null check (char_length(texto) between 1 and 4000),
  compartilhada boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists calendario_notas_campanha_dia on public.calendario_notas (campaign_id, dia);

alter table public.calendario_notas enable row level security;

create policy "acesso: so aprovados" on public.calendario_notas as restrictive for all to public
  using ((select public.acesso_aprovado())) with check ((select public.acesso_aprovado()));

create policy "calendario_notas: ve as suas e as compartilhadas" on public.calendario_notas for select
  using (author_id = (select auth.uid()) or (compartilhada and (is_campaign_member(campaign_id) or is_campaign_owner(campaign_id))));

create policy "calendario_notas: membro escreve" on public.calendario_notas for insert
  with check (author_id = (select auth.uid()) and (is_campaign_member(campaign_id) or is_campaign_owner(campaign_id)));

create policy "calendario_notas: autor muda" on public.calendario_notas for update
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));

create policy "calendario_notas: autor ou mestre apaga" on public.calendario_notas for delete
  using (author_id = (select auth.uid()) or is_campaign_owner(campaign_id));

alter publication supabase_realtime add table public.calendario_notas;
