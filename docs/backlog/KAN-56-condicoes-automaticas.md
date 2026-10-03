---
id: KAN-56
titulo: "Ficha: condições aplicadas automaticamente nos testes e na Defesa; coluna da esquerda mais enxuta"
status: em análise
camada: front
---

## O que entrou

- Regras em `src/pages/CharacterSheet/condicoes.ts` (testadas). Já existia a automação das
  quatro genéricas (Abalado, Apavorado, Agarrado, Enredado viram Modificador de Teste/Ataque);
  agora entram também as que dependem do atributo, da perícia ou do tipo de ataque:
  - Frustrado -1d20 / Esmorecido -2d20 em Intelecto e Presença;
  - Fraco/Fatigado -1d20 e Debilitado/Exausto -2d20 em Agilidade, Força e Vigor;
  - Cego -2d20 em Agilidade e Força; Fascinado -2d20 e Ofuscado -1d20 em Percepção;
  - Surdo -2d20 em Iniciativa; Desprevenido (e Agarrado, Cego, Atordoado, Surpreendido) -1d20
    em Reflexos; Caído -2d20 em ataque corpo a corpo; Ofuscado -1d20 em ataque.
  - Defesa: Vulnerável (e Fatigado, Exausto, Enredado) -2; Desprevenido (e Agarrado, Cego,
    Atordoado, Surpreendido) -5; Indefeso (e Inconsciente, Paralisado, Petrificado) -10 no
    lugar do -5. Aparece na Defesa como "-5 Condições".
  - Alquebrado: +1 PE no custo dos rituais.
- Vale no teste de atributo, nas perícias (a contagem de dados da tabela já mostra), no ataque,
  no Ocultismo e na iniciativa do combate. A rolagem diz o porquê ("Teste de Diplomacia
  (Frustrado -1d20)"), no chat e no histórico.
- Fica manual o que depende de turno ou do mestre (dano no início do turno, Confuso, não poder
  agir, deslocamento reduzido).
- Coluna da esquerda: foto 104 px (moldura 150), nome menor, diagrama de atributos menor e
  menos espaço entre os blocos, pra Condições e Efeitos aparecer sem rolar tanto.
