-- Abalado, Apavorado, Agarrado e Enredado agora tiram os dados direto pela regra das condições
-- (condicoes.ts), em todo tipo de teste. Os modificadores que a ficha criava pra elas saem, senão
-- a penalidade contaria duas vezes.
delete from public.character_modifiers
 where name in ('Abalado', 'Apavorado', 'Agarrado', 'Enredado')
   and ((name in ('Abalado', 'Apavorado') and scope = 'teste') or (name in ('Agarrado', 'Enredado') and scope = 'ataque'));
