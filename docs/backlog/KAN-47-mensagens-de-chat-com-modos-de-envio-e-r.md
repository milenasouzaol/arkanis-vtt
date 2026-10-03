---
id: KAN-47
titulo: "Mesa: Mensagens de Chat com modos de envio e rolagens da ficha"
status: em análise
camada: back + front
spec: docs/VTT_Mesa.md (12.3)
---

## O que entrou

- Migration `0090_chat_mesa.sql` (testada num Postgres local com RLS de verdade):
  - tabela `chat_messages` com o modo de envio de cada mensagem; o banco decide quem lê:
    público (todos), Privado para Mestres (autor + mestre), Cego para Mestres (autor +
    jogadores), Somente para Si (autor). Revelar para Todos abre a privada pra todos.
  - só o mestre destaca, revela, exclui e limpa; quem não é da campanha não envia;
  - `campaign_members.chat_mode`: o modo escolhido no chat fica salvo e vale também
    pras rolagens da ficha — um trigger em `character_rolls` manda cada rolagem pro chat
    nesse modo, com nome e foto do personagem (ou da conta, em Público como Usuário);
  - bucket `chat_images` pras imagens do chat; Realtime ligado.
- Painel do chat no visual do print do Foundry: cards claros com foto, nome, "Para:" nas
  privadas (tom mais escuro e borda tracejada), tempo relativo ("4 dias 18h atrás") e o ⋮
  do mestre (Destacar / Remover Destaque, Revelar para Todos, Excluir).
- Rolagem no chat: rótulo, fórmula ("2d20 + 3") e total; clicar no total mostra os dados.
- Caixa de mensagem: Enter envia, Shift+Enter quebra linha; menu Formato (Tamanho com
  Personalizado, as 12 fontes, Cor RGB, Negrito/Itálico/Código/Sublinhado/Tachado/
  Sobrescrito/Subscrito), Linha horizontal, Inserir imagem, Limpar Formatação. Imagem
  também entra colando ou arrastando (do computador ou de outra aba). URL vira link ao enviar.
- Os 5 modos de envio + Exportar Registro (baixa um .txt) + Limpar Registro (mestre).
- Com o chat fechado, como no Foundry: modos no pé da barra de ícones e a caixa
  "Digite uma mensagem" flutuando ao lado.
- Mensagem destacada aparece no meio da mesa pra todos.
- Todo HTML passa por um filtro (só a formatação do chat; nada de script, evento ou link perigoso).
- Regras puras em `src/pages/Mesa/chat.ts`, testadas em `chat.test.ts`.

## Fica pra depois

- Animação de dado rolando no tabuleiro (aspiracional na spec).
- Abrir a ficha de dentro da mesa (janela portátil) é do KAN-49; hoje a rolagem feita na
  ficha aberta noutra aba já cai no chat.
- "Modesto Condensed" não é fonte gratuita; no menu ela cai na fonte padrão.

## Ajuste da Millie (02/10): menu Formato em cascata

- Formato abre um menu com Em Linha / Fonte / Tamanho / Formato, cada um com ">" e um
  submenu ao passar o mouse, como no print do Foundry (Cabeçalhos, Bloco, Alinhamento e
  Tabela ficam fora, pela spec; Listas também, por não estar na spec).
- O que se marca fica marcado (✓) e vale pra todas as próximas mensagens até a pessoa
  desmarcar — inclusive depois de recarregar (guardado no navegador). O campo já mostra o
  formato; "Formato" fica sublinhado quando há algo marcado. Limpar Formatação desmarca tudo.
- O submenu abre pra esquerda quando não cabe à direita (o chat fica na borda da tela).
