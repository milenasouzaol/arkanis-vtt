---
id: KAN-55
titulo: "Ficha: gasto automático de PE/PD ao conjurar ritual, com o gasto no chat"
status: em análise
camada: back + front
---

## O que entrou

- Os botões Normal / Discente / Verdadeiro do ritual conjuram: descontam o custo e, se o ritual
  tem dados, rolam. Custo do livro: 1 / 3 / 6 / 10 PE (1º ao 4º círculo) + o "+X PE" da
  variação. Com "Jogando sem Sanidade", o gasto sai da Determinação (PD).
- Cada botão mostra o custo ("Discente · 3 PE"); ritual sem dados mostra "Conjurar".
- Sem PE suficiente, a ficha avisa e pergunta se quer conjurar mesmo assim (fica em 0).
- O gasto ("Gastou 3 PE (12 → 9)") aparece embaixo da rolagem: na janelinha da ficha, no chat
  da mesa e no Histórico de Rolagens. Ritual sem dados aparece no chat só com o nome e o gasto.
- Migration `0101_gasto_na_rolagem.sql` (aplicada): `character_rolls.nota` e `sem_rolagem`,
  levados pro chat pelo gatilho das rolagens.
- Regras em `src/pages/CharacterSheet/ritualCusto.ts`, testadas.

## Fora

- Reduções de custo de poderes/trilhas (Ritual Predileto, Tatuagem Ritualística, Flagelador
  pagando com PV) e o limite de PE por turno: hoje o mestre/jogador ajusta na mão.
