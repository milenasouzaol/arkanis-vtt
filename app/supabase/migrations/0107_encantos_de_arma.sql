-- Rituais que encantam uma arma (pedido da Millie em 05/10): Amaldiçoar Arma, Arma Atroz e
-- Chamas do Caos (Chamejar). Quem conjura escolhe a arma — a própria ou a de um aliado da
-- campanha — e o efeito entra sozinho nos ataques feitos com ela até alguém encerrar
-- (a duração é cena/sustentada, então quem encerra é a mesa).
--
-- character_inventory.encantos: [{ id, ritual, nome, por, por_ficha, dano: {formula, tipo},
--   ataque, margem, multiplicador }]

alter table character_inventory add column if not exists encantos jsonb not null default '[]';

-- Armas e munições de quem está na campanha, pra escolher qual encantar.
create function public.armas_da_campanha(p_campaign_id uuid)
returns table (inventario_id uuid, character_id uuid, personagem text, item text, tipo text, natureza text, encantos jsonb)
language sql
security definer
set search_path = public
stable
as $$
  select i.id, c.id, coalesce(nullif(c.name, ''), 'Sem nome'),
         coalesce(e.name, i.custom_item ->> 'name', 'Item'),
         coalesce(e.type::text, i.custom_item ->> 'type'),
         coalesce(e.stats ->> 'natureza', i.custom_item -> 'stats' ->> 'natureza'),
         i.encantos
  from characters c
  join character_inventory i on i.character_id = c.id
  left join equipment_items e on e.id = i.equipment_item_id
  where c.campaign_id = p_campaign_id
    and (is_campaign_member(p_campaign_id) or is_campaign_owner(p_campaign_id))
    and (not c.npc or is_campaign_owner(p_campaign_id) or pode_ver_ficha(c.id))
    and coalesce(e.type::text, i.custom_item ->> 'type') in ('arma', 'municao')
  order by c.name, 4;
$$;

-- Encanta a arma. Conjurar de novo o mesmo ritual na mesma arma troca o anterior (não acumula).
create function public.encantar_arma(p_inventario_id uuid, p_conjurador uuid, p_encanto jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dono characters%rowtype;
  v_conjurador characters%rowtype;
begin
  select c.* into v_dono from character_inventory i join characters c on c.id = i.character_id where i.id = p_inventario_id;
  select * into v_conjurador from characters where id = p_conjurador;
  if v_dono.id is null or v_conjurador.id is null or not pode_editar_ficha(p_conjurador) then
    raise exception 'Você não pode conjurar com este personagem';
  end if;
  if v_dono.id <> v_conjurador.id and (v_dono.campaign_id is null or v_dono.campaign_id is distinct from v_conjurador.campaign_id) then
    raise exception 'Essa arma não é de alguém da sua campanha';
  end if;
  if coalesce(p_encanto ->> 'ritual', '') = '' then
    raise exception 'Encanto inválido';
  end if;
  update character_inventory
  set encantos = coalesce((
        select jsonb_agg(x) from jsonb_array_elements(encantos) x where x ->> 'ritual' is distinct from p_encanto ->> 'ritual'
      ), '[]'::jsonb)
      || jsonb_build_array(p_encanto || jsonb_build_object('id', gen_random_uuid(), 'por', coalesce(nullif(v_conjurador.name, ''), 'Sem nome'), 'por_ficha', v_conjurador.id))
  where id = p_inventario_id;
end;
$$;

-- Encerrar: quem tem a arma, quem conjurou ou o mestre.
create function public.encerrar_encanto(p_inventario_id uuid, p_encanto_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv character_inventory%rowtype;
  v_campanha uuid;
  v_por uuid;
begin
  select * into v_inv from character_inventory where id = p_inventario_id;
  if v_inv.id is null then
    raise exception 'Item não encontrado';
  end if;
  select campaign_id into v_campanha from characters where id = v_inv.character_id;
  select (x ->> 'por_ficha')::uuid into v_por from jsonb_array_elements(v_inv.encantos) x where x ->> 'id' = p_encanto_id;
  if not (pode_editar_ficha(v_inv.character_id)
          or (v_por is not null and pode_editar_ficha(v_por))
          or (v_campanha is not null and is_campaign_owner(v_campanha))) then
    raise exception 'Você não pode encerrar este efeito';
  end if;
  update character_inventory
  set encantos = coalesce((select jsonb_agg(x) from jsonb_array_elements(encantos) x where x ->> 'id' is distinct from p_encanto_id), '[]'::jsonb)
  where id = p_inventario_id;
end;
$$;

grant execute on function public.armas_da_campanha(uuid) to authenticated;
grant execute on function public.encantar_arma(uuid, uuid, jsonb) to authenticated;
grant execute on function public.encerrar_encanto(uuid, text) to authenticated;
