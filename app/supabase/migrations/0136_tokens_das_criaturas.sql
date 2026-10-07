-- Biblioteca de Tokens (pedido da Millie, 07/10): as ameaças do bestiário que têm token na biblioteca
-- ganham o token (principal = o primeiro) e todas as formas como variações; quem cria a ameaça na mesa
-- já recebe tudo. As ameaças que já estavam nas mesas recebem também.

alter table public.creatures add column if not exists token_variacoes jsonb not null default '[]'::jsonb;

with tokens(nome, variacoes) as (values
  ('Aberração de Carne', '[{"nome":"Aberração de carne","url":"/biblioteca/img/307.webp"}]'::jsonb),
  ('Anárquico', '[{"nome":"Anárquico","url":"/biblioteca/img/281.webp"},{"nome":"Anárquico 2","url":"/biblioteca/img/092.webp"}]'::jsonb),
  ('Anárquico Descontrolado', '[{"nome":"Anárquico Descontrolado","url":"/biblioteca/img/280.webp"}]'::jsonb),
  ('Anfitrião', '[{"nome":"Anfitrião 1","url":"/biblioteca/img/286.webp"},{"nome":"Anfitrião 2","url":"/biblioteca/img/282.webp"},{"nome":"Anfitrião 3","url":"/biblioteca/img/283.webp"},{"nome":"Anfitrião 4","url":"/biblioteca/img/284.webp"},{"nome":"Anfitrião 5","url":"/biblioteca/img/287.webp"},{"nome":"Anfitrião 6","url":"/biblioteca/img/285.webp"}]'::jsonb),
  ('Aniquilação', '[{"nome":"Aniquilação","url":"/biblioteca/img/308.webp"}]'::jsonb),
  ('Anomiático', '[{"nome":"Anomiático","url":"/biblioteca/img/288.webp"}]'::jsonb),
  ('Aracnasita', '[{"nome":"Aracnasita","url":"/biblioteca/img/295.webp"}]'::jsonb),
  ('Bicho-Papão', '[{"nome":"Bicho-Papão","url":"/biblioteca/img/265.webp"}]'::jsonb),
  ('Carente', '[{"nome":"Carente","url":"/biblioteca/img/309.webp"}]'::jsonb),
  ('Carniçal Preto da Morte', '[{"nome":"Carniçal preto da morte","url":"/biblioteca/img/296.webp"}]'::jsonb),
  ('Ceifador Espiral', '[{"nome":"Ceifador espiral","url":"/biblioteca/img/297.webp"}]'::jsonb),
  ('Ciborgue', '[{"nome":"Ciborgue","url":"/biblioteca/img/289.webp"}]'::jsonb),
  ('Degolificada', '[{"nome":"Degolificada","url":"/biblioteca/img/279.webp"},{"nome":"Degolificada Conturbada","url":"/biblioteca/img/275.webp"},{"nome":"Degolificada Decrépita","url":"/biblioteca/img/276.webp"},{"nome":"Degolificada Devorada","url":"/biblioteca/img/277.webp"},{"nome":"Degolificada Gnóstica","url":"/biblioteca/img/278.webp"}]'::jsonb),
  ('Enpap-X', '[{"nome":"Enpap-X","url":"/biblioteca/img/312.webp"}]'::jsonb),
  ('Enraizado', '[{"nome":"Enraizado","url":"/biblioteca/img/299.webp"}]'::jsonb),
  ('Escutado', '[{"nome":"Escutado","url":"/biblioteca/img/300.webp"}]'::jsonb),
  ('Espreitador', '[{"nome":"Espreitador","url":"/biblioteca/img/266.webp"}]'::jsonb),
  ('Esqueleto de Lodo', '[{"nome":"Esqueleto de lodo","url":"/biblioteca/img/301.webp"}]'::jsonb),
  ('Estrangeiro', '[{"nome":"Estrangeiro","url":"/biblioteca/img/267.webp"}]'::jsonb),
  ('Existido', '[{"nome":"Existido","url":"/biblioteca/img/268.webp"}]'::jsonb),
  ('Infecticídio', '[{"nome":"Infecticídio","url":"/biblioteca/img/290.webp"}]'::jsonb),
  ('Kerberos', '[{"nome":"Kerberos","url":"/biblioteca/img/313.webp"}]'::jsonb),
  ('Lembrado', '[{"nome":"Lembrado","url":"/biblioteca/img/269.webp"}]'::jsonb),
  ('Marionete', '[{"nome":"Marionete","url":"/biblioteca/img/302.webp"}]'::jsonb),
  ('Máscara do Desespero', '[{"nome":"Máscara do Desespero","url":"/biblioteca/img/270.webp"}]'::jsonb),
  ('Minotauro', '[{"nome":"Minotauro","url":"/biblioteca/img/314.webp"}]'::jsonb),
  ('Mulher Afogada', '[{"nome":"Mulher afogada","url":"/biblioteca/img/315.webp"}]'::jsonb),
  ('Múmia Xipófaga', '[{"nome":"Múmia Xipófaga","url":"/biblioteca/img/303.webp"}]'::jsonb),
  ('Nidere', '[{"nome":"Nidere","url":"/biblioteca/img/304.webp"},{"nome":"Nidere 2","url":"/biblioteca/img/137.webp"}]'::jsonb),
  ('O Deus da Morte', '[{"nome":"O Deus da Morte","url":"/biblioteca/img/298.webp"}]'::jsonb),
  ('O Diabo', '[{"nome":"O Diabo","url":"/biblioteca/img/311.webp"}]'::jsonb),
  ('Ocioso', '[{"nome":"Ocioso","url":"/biblioteca/img/271.webp"}]'::jsonb),
  ('Parasita de Culpa', '[{"nome":"Parasita de culpa","url":"/biblioteca/img/272.webp"},{"nome":"Parasita de Culpa 2","url":"/biblioteca/img/138.webp"}]'::jsonb),
  ('Perturbado de Energia', '[{"nome":"Perturbado de Energia","url":"/biblioteca/img/291.webp"}]'::jsonb),
  ('Sempiternal', '[{"nome":"Sempiternal","url":"/biblioteca/img/305.webp"}]'::jsonb),
  ('Silhueta', '[{"nome":"Silhueta","url":"/biblioteca/img/273.webp"}]'::jsonb),
  ('Succ', '[{"nome":"Succ","url":"/biblioteca/img/306.webp"}]'::jsonb),
  ('Sukkalgir', '[{"nome":"Sukkalgir","url":"/biblioteca/img/292.webp"}]'::jsonb),
  ('Telopsia', '[{"nome":"Telopsia","url":"/biblioteca/img/293.webp"}]'::jsonb),
  ('Titã de Sangue', '[{"nome":"Titã de sangue","url":"/biblioteca/img/316.webp"}]'::jsonb),
  ('Viajante', '[{"nome":"Viajante","url":"/biblioteca/img/294.webp"}]'::jsonb),
  ('Vulto', '[{"nome":"Vulto","url":"/biblioteca/img/274.webp"}]'::jsonb),
  ('Zumbi de Sangue', '[{"nome":"Zumbi de sangue","url":"/biblioteca/img/318.webp"}]'::jsonb),
  ('Zumbi de Sangue Bestial', '[{"nome":"Zumbi de sangue bestial","url":"/biblioteca/img/317.webp"}]'::jsonb)
)
update public.creatures c
   set token_variacoes = t.variacoes,
       image_url = coalesce(nullif(c.image_url, ''), t.variacoes->0->>'url')
  from tokens t
 where c.name = t.nome and c.owner_id is null;

-- Ameaças já colocadas nas mesas: token principal (se não tinha) e as variações que faltam.
update public.campaign_actors a
   set token_url = coalesce(a.token_url, c.image_url),
       token_variacoes = a.token_variacoes || coalesce((
         select jsonb_agg(jsonb_build_object('id', gen_random_uuid(), 'nome', v->>'nome', 'url', v->>'url', 'pasta', null))
           from jsonb_array_elements(c.token_variacoes) v
          where not exists (select 1 from jsonb_array_elements(a.token_variacoes) x where x->>'url' = v->>'url')
       ), '[]'::jsonb)
  from public.creatures c
 where a.creature_id = c.id and jsonb_array_length(c.token_variacoes) > 0;
