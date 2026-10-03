---
id: KAN-49
titulo: "Mesa: Personagens e Tokens na mesa"
status: em análise
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

## Parte 2 — aba Personagens (03/10)

- Migration `0095_personagens_mesa.sql` (testada num Postgres local com RLS de verdade):
  `campaign_actors` (jogador / NPC / Ameaça, tokens principal + variáveis, acesso por
  jogador), `actor_folders`, `characters.npc`, `scene_tokens.actor_id`; personagem de
  jogador entra e sai da lista sozinho (trigger) e o nome acompanha a ficha; Nenhum esconde
  da lista; o dono configura os tokens do próprio personagem mas não mexe no acesso;
  `colocar_token` (mestre, ou o dono com o próprio personagem) e `trocar_variacao` (só
  imagens cadastradas no personagem); bucket `token_images`.
- Aba Personagens no visual do print "Atores" do Foundry, com "Personagem" no lugar de
  "Ator": Criar Personagem e Criar Pasta, pastas/subpastas, linhas com a miniatura do token.
- Criar Personagem: NPC (abre a ficha completa de Ordem Paranormal numa janela flutuante e
  redimensionável, sem as 5 etapas) ou Ameaça/Monstro (escolhida do bestiário, com busca).
- Botão direito: Editar, Configurar Propriedade (Mostrar Usuários Mestres; Todos os Jogadores
  + cada jogador; Nenhum / Limitado / Observador / Dono), Configurar Token (principal +
  variáveis, botão direito renomeia), Duplicar, Excluir (com o texto da spec, Sim / Não).
- Arrastar o personagem da lista pro mapa coloca o token principal onde soltar (o jogador
  também, com o próprio). No token: duplo clique ou "Ficha de Personagem" abre a ficha;
  "Variação de Token" troca a imagem.
- Personagem de jogador segue os toggles da ficha (5.8): oculta → os outros só veem o card.
- Ficha de Ameaça (Status / Combate / Descrição, Vida com as setas); a versão com rolagens no
  turno vem com os Encontros de Combate (KAN-50).
- NPCs não aparecem em "Meus Personagens" nem na escolha de personagem do convite.

## Falta

- Edição por jogador com nível "Dono" num NPC: hoje a ficha abre, mas o banco só deixa o
  mestre salvar (precisa liberar nas tabelas da ficha).
- Duplicar NPC copia a ficha principal, não perícias/inventário/rituais.

## Ajuste da Millie (03/10)

- O fundo não se mexe mais com o botão esquerdo: arrastar no vazio faz a caixa de seleção
  (12.13), Shift soma à seleção. Mover a visão do mapa é com o botão direito, como no Foundry.
- Arrasto que começa dentro da própria página (texto, a imagem de fundo, imagens do chat)
  não mostra mais "Solte pra colocar…" nem "Isso não é uma imagem".

## Ajuste da Millie (04/10)

- Token entra com o formato da imagem (largura de um quadrado da grade, altura proporcional),
  não mais quadrado. Trocar a variação mantém a largura e acompanha o formato da nova imagem.
- Dono do token também redimensiona e gira (12.8), pela função `transformar_objeto`
  (migration `0096_token_proporcional.sql`).
- Seleção discreta: linha fina tracejada cinza-clara, alças pequenas e redondas, sem azul.

## Ajuste da Millie (04/10): muitas variações e pastas de variações

- "Variação de Token" virou um painel lateral (como a spec descreve, 12.8): miniaturas
  separadas por pasta, rola quando tem muita coisa e fica aberto pra trocar rápido.
- Configurar Token ganhou pastas ("Roupas pretas", "Emoções"…): Criar Pasta, arrastar a
  variação pra outra pasta, "+" dentro da pasta adiciona nela, botão direito na variação
  (Renomear, Mover para a pasta, Usar como Token Principal, Tirar) e na pasta (Renomear,
  Excluir — as variações vão pra "Sem pasta"). Migration `0097_pastas_de_variacoes.sql`.
- Janelas nunca passam do fim da tela; submenus compridos rolam.
