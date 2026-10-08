-- Token principal e foto da ficha são coisas diferentes (pedido da Millie, 08/10): a foto redonda da
-- ficha (characters.avatar_url) é o retrato (chat, listas); o token só existe quando a pessoa
-- configura em "Configurar Token". Antes, ao entrar na campanha, a foto virava o token principal, e
-- colocar no mapa sem token usava a foto.

create or replace function ator_do_jogador()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.campaign_id is distinct from new.campaign_id and old.campaign_id is not null then
    delete from campaign_actors where character_id = new.id and tipo = 'jogador';
  end if;
  if new.campaign_id is not null and not new.npc
     and not exists (select 1 from campaign_actors where character_id = new.id) then
    -- Sem token: a pessoa escolhe o dela em Configurar Token.
    insert into campaign_actors (campaign_id, tipo, character_id, name, token_url)
    values (new.campaign_id, 'jogador', new.id, coalesce(nullif(new.name, ''), 'Sem nome'), null);
  end if;
  return new;
end;
$$;

create or replace function colocar_token(p_actor_id uuid, p_scene_id uuid, p_x numeric, p_y numeric, p_largura numeric, p_altura numeric)
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
  -- Ficha: só o token configurado. Ameaça do bestiário: a imagem dela serve de token.
  select coalesce(v_ator.token_url, cr.image_url) into v_url
  from (select 1) _ left join creatures cr on cr.id = v_ator.creature_id;
  if v_url is null then
    raise exception 'Configure o token deste personagem primeiro (botão direito › Configurar Token)';
  end if;
  insert into scene_tokens (scene_id, campaign_id, actor_id, character_id, name, image_url, x, y, width, height, layer, sort, created_by)
  values (p_scene_id, v_ator.campaign_id, v_ator.id, v_ator.character_id, v_ator.name, v_url,
          p_x - p_largura / 2, p_y - p_altura / 2, greatest(p_largura, 1), greatest(p_altura, 1), 'token',
          (extract(epoch from now()) * 1000)::bigint % 2147483647, auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;
