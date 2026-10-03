-- Tokens (KAN-49, ajuste da Millie em 04/10):
-- * o token entra com o formato da imagem (largura de um quadrado, altura proporcional),
--   não mais quadrado;
-- * trocar a variação mantém a largura e ajusta a altura à nova imagem (sem distorcer);
-- * o dono do token também redimensiona e gira (12.8), pela função transformar_objeto.

drop function if exists public.colocar_token(uuid, uuid, numeric, numeric, numeric);

create function public.colocar_token(p_actor_id uuid, p_scene_id uuid, p_x numeric, p_y numeric, p_largura numeric, p_altura numeric)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ator campaign_actors%rowtype;
  v_url text;
  v_id uuid;
begin
  select * into v_ator from campaign_actors where id = p_actor_id;
  if v_ator.id is null or acesso_ao_ator(p_actor_id) <> 'dono' then
    raise exception 'Você não pode colocar este personagem na mesa';
  end if;
  if not exists (select 1 from scenes s where s.id = p_scene_id and s.campaign_id = v_ator.campaign_id) then
    raise exception 'Cena inválida';
  end if;
  select coalesce(v_ator.token_url, c.avatar_url, cr.image_url) into v_url
  from (select 1) _ left join characters c on c.id = v_ator.character_id left join creatures cr on cr.id = v_ator.creature_id;
  if v_url is null then
    raise exception 'Configure o token deste personagem primeiro';
  end if;
  insert into scene_tokens (scene_id, campaign_id, actor_id, character_id, name, image_url, x, y, width, height, layer, sort, created_by)
  values (p_scene_id, v_ator.campaign_id, v_ator.id, v_ator.character_id, v_ator.name, v_url,
          p_x - p_largura / 2, p_y - p_altura / 2, greatest(p_largura, 1), greatest(p_altura, 1), 'token',
          (extract(epoch from now()) * 1000)::bigint % 2147483647, auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;

drop function if exists public.trocar_variacao(uuid, text);

-- Com p_altura, o token mantém a largura e o centro, e a altura acompanha a nova imagem.
create function public.trocar_variacao(p_token_id uuid, p_url text, p_altura numeric default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not pode_mover_objeto(p_token_id) then
    raise exception 'Você não pode mexer neste token';
  end if;
  if not exists (
    select 1 from scene_tokens t join campaign_actors a on a.id = t.actor_id
    where t.id = p_token_id and (a.token_url = p_url or a.token_variacoes @> jsonb_build_array(jsonb_build_object('url', p_url)))
  ) then
    raise exception 'Essa imagem não é uma variação deste token';
  end if;
  update scene_tokens
  set image_url = p_url,
      y = case when p_altura is null then y else y + (height - p_altura) / 2 end,
      height = coalesce(greatest(p_altura, 1), height)
  where id = p_token_id;
end;
$$;

-- Redimensionar e girar (12.8): o mestre e o dono do token. Só mexe na caixa e no giro.
create function public.transformar_objeto(p_id uuid, p_x numeric, p_y numeric, p_largura numeric, p_altura numeric, p_rotacao numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not pode_mover_objeto(p_id) then
    raise exception 'Você não pode mexer neste token';
  end if;
  update scene_tokens
  set x = p_x, y = p_y, width = greatest(p_largura, 1), height = greatest(p_altura, 1), rotation = mod(mod(p_rotacao, 360) + 360, 360)
  where id = p_id;
end;
$$;

grant execute on function public.colocar_token(uuid, uuid, numeric, numeric, numeric, numeric) to authenticated;
grant execute on function public.trocar_variacao(uuid, text, numeric) to authenticated;
grant execute on function public.transformar_objeto(uuid, numeric, numeric, numeric, numeric, numeric) to authenticated;
