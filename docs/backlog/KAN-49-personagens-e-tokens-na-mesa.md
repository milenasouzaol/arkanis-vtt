---
id: KAN-49
titulo: "Mesa: Personagens e Tokens na mesa"
status: em andamento
camada: back + front
spec: docs/VTT_Mesa.md (12.7, 12.8)
---

## Parte 1 — controles dos tokens/objetos no mapa (03/10, pedido da Millie com print)

- Migration `0094_tokens_controles.sql` (testada num Postgres local com RLS de verdade):
  `group_id` (Agrupar), `move_permission`/`movable_by` (Configurar Propriedade) e as funções
  `pode_mover_objeto` e `mover_objetos` — jogador move só a posição, e só do próprio
  personagem ou do que o mestre liberou; travado não move; grupo anda junto.
- Seleção no visual do print: caixa com 8 alças (redimensiona sempre proporcional, com o
  lado oposto parado) e a bolinha de girar 360° (Shift encaixa de 15 em 15°). Shift+clique
  seleciona vários; Shift/Ctrl+rodinha gira o selecionado (12.13).
- Mover arrastando ou pelas setas (um quadrado da grade); todo mundo vê o arrasto ao vivo
  (broadcast), e a posição fica gravada ao soltar.
- Botão direito no token, menu claro como no print, só com o que está no doc: Ping Todos,
  Ping de Foco (mestre), Copiar, Colar, Desfazer, Refazer, Configurar Propriedade (Somente
  Eu / Todos os Jogadores / cada jogador), Alterar Camada (Tokens / Mestre (DM) / Mapa),
  Trazer para a Frente, Enviar para Trás, Travar/Desbloquear Posição, Transformação Avançada
  (Agrupar, Desagrupar, Virar Horizontalmente/Verticalmente) e Eliminar.
  Fora (doc): Definir Grupo, Local Grupo, Colocar alfinete, Adicionar turno, Respostas.
- Botão direito no mapa: Ping Todos, Ping de Foco, Colar, Desfazer, Refazer.
- Ping: anel pulsando com o nome de quem pingou, pra todos; o de foco leva a câmera de todos.
- Atalhos: Delete apaga, Ctrl+C/Ctrl+V, Ctrl+Z / Ctrl+Y (ou Ctrl+Shift+Z), Esc solta.
- Regras puras em `src/pages/Mesa/tokens.ts`, testadas em `tokens.test.ts`.

## Falta (parte 2)

- Aba Personagens (12.7): lista com jogadores automáticos, NPC e Ameaça, ficha portátil,
  Configurar Propriedade da ficha, Configurar Token (principal + variáveis), arrastar o
  personagem pro mapa.
- No menu do token de personagem: Ficha de Personagem e Variação de Token.
- Dono do personagem configurando a propriedade do próprio token.

## Ajuste da Millie (03/10)

- O fundo não se mexe mais com o botão esquerdo: arrastar no vazio faz a caixa de seleção
  (12.13), Shift soma à seleção. Mover a visão do mapa é com o botão direito, como no Foundry.
- Arrasto que começa dentro da própria página (texto, a imagem de fundo, imagens do chat)
  não mostra mais "Solte pra colocar…" nem "Isso não é uma imagem".
