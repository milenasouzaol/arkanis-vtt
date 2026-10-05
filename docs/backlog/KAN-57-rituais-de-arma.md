---
id: KAN-57
titulo: "Ficha: rituais que encantam arma (Amaldiçoar Arma, Arma Atroz, Chamas do Caos)"
status: em análise
camada: back + front
---

- Conjurar o ritual abre "escolher a arma" (a sua ou a de um aliado da campanha; corpo a corpo,
  e munição no Amaldiçoar Arma) e, no Amaldiçoar Arma, o elemento.
- O efeito fica na arma (`character_inventory.encantos`) e entra sozinho nos ataques com ela:
  Amaldiçoar Arma +1d6/2d6/4d6 do elemento (qualquer arma, inclusive de fogo, ou munição); Arma Atroz +2/+5 no ataque, +1/+2 na margem e +2 no
  multiplicador no Verdadeiro; Chamas do Caos (Chamejar) +1d6 de fogo.
- Aparece no card do ataque e no item do inventário, com "Encerrar" (dono da arma, quem conjurou
  ou o mestre). Conjurar de novo o mesmo ritual na mesma arma troca o anterior.
- Migration 0107; regras em `src/pages/CharacterSheet/encantos.ts` (testadas).
- Falta: Amaldiçoar Tecnologia (modificações à escolha).
