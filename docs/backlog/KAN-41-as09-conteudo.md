---
id: KAN-41
titulo: Arquivos Secretos 09 (Hell Hunters): conteúdo no banco
status: concluído
camada: back
depende_de: []
---

## Contexto

A Millie pediu tudo do AS09 na ficha. O zip de extras (Elite) só traz arte, tokens, mapas,
músicas e um conto; as regras estão em `Arquivos-Secretos-09-v1.0.pdf`. O AS08 não entra
(a Millie confirmou que não tem nada adicionável). O AS09 não tem monstros: as fichas de
criatura são os próprios Hell Hunters. As páginas finais (prévia do Ordem 2) não entram.

## O que entrou (migration `0084_as09_hell_hunters.sql`)

- Fonte Arquivos Secretos 09.
- Origens: Veterano de Conflito Armado (Luta, Pontaria; Full Metal Jacket) e Treinado
  pela Hell Hunters (Luta e Fortitude ou Pontaria e Reflexos; Resistência do Treinamento).
- Poderes de Combatente: Municiador Ambulante, Ripostar Ousado, Tiro Intuitivo, Tática de
  Abordagem.
- Trilhas: Incursor (Combatente: CQB, Entrada Explosiva, Proteger Reféns,
  Alvo-prioritário) e Piloto de Drone (Especialista: Companheiro Drone, Protetor dos
  Drones, Ás dos Drones, Mestre dos Drones).
- 11 itens com o texto do livro e estatísticas: Aríete Portátil, Capacete Tático,
  Boroscópio Articulado, DMR, Drone de Combate Tático, Espingarda Serrada, Escudo Balístico
  LED, Lançador de Granadas Portátil, Machado Tático, Dardos Condutores, Pistola Taser.
- Aliados (tabela nova `allies`): os 8 Hell Hunters ("como aliado") e os 7 tipos de aliado
  drone.
- Bestiário: fichas completas dos 8 Hell Hunters (categoria mundana), com token.
- Perícia Tática: novo uso Analisar Perigo.
- Regras Extras: regalias de assalto em Veículos Operacionais; novas regras "Operações
  Táticas" (dicas dos autores) e "Gerador de Mercenários".
- O glifo "O" do livro (d20) foi escrito como d20. SQL validado com o parser do Postgres.
