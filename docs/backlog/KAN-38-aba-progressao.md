---
id: KAN-38
titulo: Aba Progressão: linha do NEX e planejamento por nível
status: concluído
camada: front
depende_de: []
---

## Contexto

A aba de Progressão era um formulário cru (selects e uma tabela sem estilo). A Millie não
tinha referência visual e pediu a melhor forma de explorar a aba.

## Como ficou

- **Cabeçalho:** NEX atual grande com setas pra subir/descer (Experiência quando a regra de
  NEX por experiência está ligada), classe e trilha, e Vida/Sanidade/PE no NEX atual com
  quanto sobe no próximo (Vida/PD em "Jogando sem Sanidade").
- **Linha do NEX** de 5% a 99%: o trecho já alcançado aceso na cor da afinidade, o tipo de
  ganho embaixo de cada nível, o atual com um halo e os níveis planejados sublinhados.
- **Detalhe do nível** (clicando na linha): cada ganho da tabela da classe vira um bloco:
  - Poder: lista com busca dos poderes da classe **e dos poderes gerais** (pedido da
    Millie, vale pra todas as classes), em grupos, sem as habilidades base. Transcender
    pede o poder paranormal, e a Sanidade daquele NEX some das contas.
  - Habilidade de trilha: a da trilha escolhida; sem trilha, a lista pra escolher.
  - Aumento de atributo: os 5 atributos com o valor e o "→ +1".
  - Grau de treinamento: as perícias, com o limite da classe (Combatente 2 + Int,
    Especialista 5 + Int, Ocultista 3 + Int).
  - Versatilidade: poder (classe ou geral) ou a 1ª habilidade de outra trilha.
  - Melhorias automáticas (Ataque especial, Perito, Escolhido pelo Outro Lado...): a
    descrição da habilidade base.
  - NEX 50%: lembrete da afinidade.
  - Vida/Sanidade/PE daquele NEX e quanto subiu; nota livre (salva ao sair do campo).
- **Caminho planejado:** todos os níveis com escolhas, clicáveis. **Lembrete geral** embaixo.
- Mundano, Sobrevivente e classe própria não têm tabela de NEX: aviso no lugar da linha.
- Visual: o mesmo vidro na cor do elemento da página de afinidade; fontes e botões da ficha.

Sem migration: o plano continua em `character_progression_picks` (o `picks` é jsonb).
