---
id: KAN-45
titulo: Extras do AS05, AS06 e AS07: arte, tokens, fichas que faltavam e itens amaldiçoados especiais
status: concluído
camada: back + front
depende_de: [KAN-42, KAN-43]
---

## Contexto

A Millie mandou os zips de extras (Elite) do AS05, AS06 e AS07 para entrarem na ficha como
o AS09. Cruzando com o banco e os livros, apareceram buracos além das imagens.

## O que entrou (migration `0087_extras_as05_as06_as07.sql`)

- Gerada por `supabase/scripts/gera0087.cjs` a partir de dados estruturados (JSON e aspas
  sempre válidos) e testada num Postgres local (PGlite) no mesmo estado do banco: nenhum
  erro, cada update acertou o registro (170 → 187 criaturas, 15 → 19 aliados, +1 ritual).
- Arte de 14 itens (6 do AS05, 3 do AS06, 5 do AS07) e símbolos dos rituais Hesitação
  Forçada e Vampirismo. Coluna `image_url` nova em `cursed_items_special`.
- Tokens (hexagonais corrigidos, que vieram no zip do AS07) das 13 criaturas que já estavam
  no bestiário. Doppelganger: Civil = 02, Combatente = 01, Cultista = 04 (versões
  monstruosas); Hospedeiro Parasitado/Aflorado = Infectado 01 normal/infectado.
- Fichas que faltavam: 11 do AS06 (Alice Cruzes, Ketan Arjuna, Laila Verdante, Dr. Neruda,
  Cientista, Manda-Chuva e Segurança da Panacea, Hikikomori, Marca-Passo, Estímulo,
  Experimento Ssabáka) e os 6 NPCs do AS07 (Raziel, O Verdadeiro Raziel, Alvira, Sabara,
  Velisar, Zéfero), todos com token.
- Aliados do AS06: Alice Cruzes, Ketan Arjuna, Laila Verdante e Dr. Neruda.
- AS07: ritual Vampirismo (Sangue 2, com Discente e Verdadeiro) e o uso Resguardar
  Espírito da perícia Religião.
- Os Hell Hunters (AS09) passam a ser criaturas mundanas (pessoa), como as outras pessoas.
- O AS05 já estava completo; o token "Estrangeiro" não tem ficha no livro.

## Front

- **69 itens amaldiçoados especiais** (28 do Livro Base, 19 do SaH, 22 dos ASs) estavam no
  banco mas não apareciam em lugar nenhum. Agora entram em Itens Amaldiçoados no Adicionar
  Equipamento (19 → 88 itens) e, como não existem em `equipment_items`, vão para a ficha
  como cópia (com a arte).
- Não entraram: mapas, músicas, wallpapers, HQs e os PSDs de sinais do AS05.
