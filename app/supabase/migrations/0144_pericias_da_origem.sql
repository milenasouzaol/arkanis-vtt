-- A criação de ficha não gravava as duas perícias da origem como treinadas (bug relatado pela
-- Millie, 07/10). As fichas que já existem recebem agora: quem estava sem treino na perícia da
-- origem passa a treinado; o que já estava treinado ou acima fica como está.
insert into public.character_skills (character_id, skill_id, training)
select distinct c.id, s.skill_id, 'treinado'::skill_training
  from public.characters c
  left join public.origins o on o.id = c.origin_id
  cross join lateral (values
    (coalesce(o.skill_1_id, nullif(c.custom_origin->>'skill1Id', '')::uuid)),
    (coalesce(o.skill_2_id, nullif(c.custom_origin->>'skill2Id', '')::uuid))
  ) s(skill_id)
 where s.skill_id is not null
on conflict (character_id, skill_id) do update
   set training = 'treinado'
 where public.character_skills.training = 'nenhum';
