-- Os 4 poderes de combatente do AS09 entraram sem fonte (0084): sem ela, aparecem em
-- qualquer filtro de fonte do Adicionar Habilidade, em vez de so em Arquivos Secretos.

update class_powers
set source_id = (select id from sources where slug = 'arquivos_secretos_09')
where source_id is null
  and class_id = (select id from classes where slug = 'combatente')
  and name in ('Municiador Ambulante', 'Ripostar Ousado', 'Tiro Intuitivo', 'Tática de Abordagem');
