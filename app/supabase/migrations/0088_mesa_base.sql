-- Mesa (KAN-46): base pra abrir a mesa de uma campanha.
--
-- 1. Membros da campanha passam a enxergar os outros membros (antes cada um só via
--    a própria linha, e o painel de sessão da mesa precisa listar todo mundo).
-- 2. A campanha guarda o sistema que está sendo mestrado (hoje só Ordem Paranormal),
--    porque a mesa é genérica e a ficha é o módulo que muda por sistema.

drop policy if exists "campaign_members: membros leem" on campaign_members;
create policy "campaign_members: membros leem" on campaign_members for select using (
  auth.uid() = user_id or is_campaign_owner(campaign_id) or is_campaign_member(campaign_id)
);

alter table campaigns add column if not exists system text not null default 'ordem_paranormal';
