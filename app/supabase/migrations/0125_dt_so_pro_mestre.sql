-- A DT nunca chega no jogador (pedido da Millie, 06/10: "o player não pode ver a DT em nenhuma
-- hipótese; só o mestre"). item_do_token tira as DTs das atividades pra quem não é o mestre, e
-- quem decide se passou é esta função, que responde só passou/falhou.

create or replace function public.item_do_token(p_token_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_item campaign_items%rowtype;
  v_conteudo jsonb;
  v_atividades jsonb;
begin
  if not pode_interagir(p_token_id) then
    raise exception 'Você não pode interagir com isto';
  end if;
  select i.* into v_item from campaign_items i join scene_tokens t on t.item_id = i.id where t.id = p_token_id;
  select coalesce(jsonb_agg(jsonb_build_object(
           'item_id', c.item_id, 'compendio_id', c.compendio_id, 'quantidade', c.quantidade,
           'name', coalesce(o.name, e.name, c.nome), 'image_url', coalesce(o.image_url, e.image_url),
           'carga', coalesce(o.carga, e.spaces), 'raridade', o.raridade)), '[]')
    into v_conteudo
    from jsonb_to_recordset(v_item.conteudo) as c(item_id uuid, compendio_id uuid, nome text, quantidade int)
    left join campaign_items o on o.id = c.item_id
    left join equipment_items e on e.id = c.compendio_id
   where c.quantidade > 0 and (o.id is not null or e.id is not null);

  v_atividades := v_item.atividades;
  if not is_campaign_owner(v_item.campaign_id) then
    select coalesce(jsonb_agg(a #- '{checar,dt}' #- '{ritual,evitar,dt}' #- '{ativacao,teste,dt}'), '[]')
      into v_atividades from jsonb_array_elements(v_item.atividades) a;
    v_item.detalhes := v_item.detalhes #- '{teste,dt}';
  end if;

  return (to_jsonb(v_item) - 'acesso_jogadores' - 'acesso_padrao' - 'mostrar_mestres')
         || jsonb_build_object('atividades', v_atividades, 'conteudo_detalhado', v_conteudo);
end;
$$;

-- Passou no teste da atividade? (o de "Ao Passar no Teste", o do Checar, ou o pra evitar do Ritual)
create function public.passou_no_teste(p_token_id uuid, p_atividade_id text, p_total int)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_at jsonb;
  v_dt int;
begin
  if not pode_interagir(p_token_id) then
    raise exception 'Você não pode interagir com isto';
  end if;
  select a into v_at
    from campaign_items i join scene_tokens t on t.item_id = i.id, jsonb_array_elements(i.atividades) a
   where t.id = p_token_id and a ->> 'id' = p_atividade_id;
  if v_at is null then
    raise exception 'Essa atividade não existe mais';
  end if;
  v_dt := nullif(case
    when v_at #>> '{ativacao,quando}' = 'teste' then v_at #>> '{ativacao,teste,dt}'
    when v_at ->> 'tipo' = 'checar' then v_at #>> '{checar,dt}'
    when v_at ->> 'tipo' = 'ritual' then v_at #>> '{ritual,evitar,dt}'
  end, '')::int;
  return v_dt is null or coalesce(p_total, 0) >= v_dt;
end;
$$;

grant execute on function public.passou_no_teste(uuid, text, int) to authenticated;
