-- Virar o token (12.8, Transformação Avançada): o dono do token também vira na horizontal e
-- na vertical, como já move, redimensiona e gira (pedido da Millie em 05/10, a amiga dela
-- jogando não conseguia). Só mexe no espelhamento; o resto continua com o mestre.

create function public.virar_objeto(p_id uuid, p_flip_h boolean, p_flip_v boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not pode_mover_objeto(p_id) then
    raise exception 'Você não pode mexer neste token';
  end if;
  update scene_tokens set flip_h = p_flip_h, flip_v = p_flip_v where id = p_id;
end;
$$;

grant execute on function public.virar_objeto(uuid, boolean, boolean) to authenticated;
