-- Limite de itens por categoria ajustado a mao no Modo de Edicao da ficha.
--
-- Por padrao o Maximo de cada categoria (I a IV) vem da patente. Quando o mestre ou a
-- pessoa mexe nesse numero na ficha, o valor escolhido fica guardado aqui e passa a
-- valer no lugar do da patente. Cada chave e opcional: o que nao estiver aqui continua
-- vindo da patente normalmente, entao trocar de patente ainda muda as categorias que
-- ninguem alterou.
--
-- Formato: {"I": 3, "III": 1}

alter table characters
  add column item_limit_override jsonb not null default '{}'::jsonb;
