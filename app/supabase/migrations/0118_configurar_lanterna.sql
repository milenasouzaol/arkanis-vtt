-- Configurar Lanterna (pedido da Millie, 05/10): a pessoa desenha uma seta partindo da
-- lanterna do token, na direção da luz. Fica guardado no desenho do token (antes de virar e
-- girar), então acompanha quando ele anda, vira e gira:
--   { "ox": 0..1, "oy": 0..1, "angulo": graus }  (ox/oy: fração da largura/altura a partir do
--   canto de cima à esquerda; angulo: 0 = pra direita da imagem, sentido horário)

alter table scene_tokens add column lanterna_ajuste jsonb;

create function public.ajustar_lanterna(p_id uuid, p_ajuste jsonb, p_lanterna text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not pode_mover_objeto(p_id) then
    raise exception 'Você não pode mexer neste token';
  end if;
  update scene_tokens set lanterna_ajuste = p_ajuste, lanterna = p_lanterna where id = p_id;
end;
$$;

grant execute on function public.ajustar_lanterna(uuid, jsonb, text) to authenticated;
