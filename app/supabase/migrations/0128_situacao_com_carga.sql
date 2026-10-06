-- Vitrine da Loja (pedido da Millie, 06/10): a situação de quem compra também traz a carga —
-- quanto carrega (espaço dos itens × quantidade) e quanto aguenta (Força × 5, mínimo 2, como na
-- ficha).

create or replace function public.situacao_de_compra(p_character_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_ch characters%rowtype;
  v_carga numeric;
begin
  if not pode_editar_ficha(p_character_id) then
    raise exception 'Você não pode ver isso';
  end if;
  select * into v_ch from characters where id = p_character_id;
  select coalesce(sum(coalesce(e.spaces, nullif(ci.custom_item ->> 'spaces', '')::numeric, 0) * greatest(1, ci.quantity)), 0)
    into v_carga
    from character_inventory ci left join equipment_items e on e.id = ci.equipment_item_id
   where ci.character_id = p_character_id;
  return jsonb_build_object(
    'dinheiro', v_ch.dinheiro,
    'patente', v_ch.patente,
    'carga', v_carga,
    'carga_maxima', greatest(2, coalesce(nullif(v_ch.attributes ->> 'forca', '')::int, 0) * 5),
    'categorias', (select jsonb_object_agg(cat, jsonb_build_object('atual', itens_da_categoria(p_character_id, cat), 'limite', limite_da_categoria(p_character_id, cat)))
                     from unnest(array['I', 'II', 'III', 'IV']) cat)
  );
end;
$$;
