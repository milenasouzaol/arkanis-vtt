---
id: KAN-50
titulo: "Mesa: Encontros de Combate, iniciativa e Homebrew"
status: em análise
camada: back + front
spec: docs/VTT_Mesa.md (12.4)
---

## Parte 1 — combate (04/10)

- Migration `0099_combates.sql` (testada no Postgres local e aplicada pelo conector):
  `combats` (nome, ameaças, rodada, turno), `combatants` (ordem de iniciativa) e
  `combatant_vida` (vida dos monstros, só o mestre lê); `passar_turno` (quem está na vez
  passa o próprio turno; o mestre passa ou volta; a rodada avança na virada). Realtime nas
  três e em `characters` (as barrinhas acompanham a ficha).
- Aba Combate: "Sem Combates" + "+ Criar Combate"; combates salvos como cards (Nome + VD +
  Iniciar, com editar e excluir pro mestre).
- Criar Combate: Nome*, VD Total somando sozinho (repetidas contam), filtro por livro (os do
  bestiário — os compêndios da comunidade e "Comunidade" entram quando existirem), por
  elemento (Todos / Conhecimento / Energia / Morte / Sangue / Medo / Realidade; criatura com
  dois elementos aparece nos dois), busca sem acento, Ficha e Adicionar; Ameaças Selecionadas
  com Remover na cor do elemento; Salvar / Sair sem salvar.
- Iniciar: iniciativa rolada pra todos os personagens de jogador (Agilidade em dados +
  treino em Iniciativa) e pras ameaças (o "+5 (2d20)" delas); ameaça repetida vira "Bandido 1",
  "Bandido 2". Ordem do maior pro menor, empate pelo bônus.
- Rodando: foto, nome, barrinhas de Vida (vermelho) / PE (dourado) / Sanidade (roxo) dos
  jogadores, iniciativa grande sublinhada; Voltar Turno / Próximo turno / Rodada Atual;
  Adicionar (ameaças no meio da luta) e Encerrar; X pra tirar ameaça com 0 de vida. Clicar no
  jogador abre a ficha dele; na ameaça, a ficha completa (só o mestre).
- Jogador não vê a vida nem abre a ficha dos monstros.
- Indicador de turno no topo do mapa pra todos, com animação; quem está na vez clica na
  própria foto pra passar.
- Ficha de Ameaça completa: Status (atributos, Defesa, Deslocamento, perícias com o dado,
  elementos, resistências, vulnerabilidades), Combate (Presença Perturbadora; Ações / Poderes
  com Teste e Dano roláveis), Descrição (+ Enigma do Medo). Os dados só rolam com a ameaça
  num combate rodando e na vez dela, e o resultado vai pro chat.

## Falta (parte 2)

- Homebrew global de ameaças (limite 50) e as abas Habilidades / Rituais / Itens.
- "Configurações" do combate (a spec cita o botão, mas não diz o que ele faz).

## Bugs achados pela Millie (04/10)

- Iniciativa errada: o bestiário escreve os testes de vários jeitos ("+5 (2d20)", "1d20+15",
  "+2d20+10", "2d20+10, Visão no Escuro"…) e só o primeiro era entendido — o Memento Mori
  ("1d20+15") virava d20+1. Agora todos os formatos do banco são lidos (testados um a um).
- Foto cortada/vazando na linha do combate (e nas outras listas com miniatura): a imagem
  fica presa no quadrado dela.

## Pedido da Millie (04/10): iniciativa dos jogadores no chat e no histórico

- Ao iniciar o combate, o Teste de Iniciativa de cada personagem de jogador é registrado como
  rolagem dele: aparece no chat (no modo de envio do jogador) e no Histórico de Rolagens.
- Migration `0100_rolagem_pelo_mestre.sql` (aplicada): quem pode editar a ficha registra
  rolagem dela, sempre em nome do dono. Fecha uma brecha antiga (qualquer um registrava
  rolagem na ficha alheia no próprio nome). A ficha agora sempre grava a rolagem no nome do
  dono — inclusive quando o mestre rola na ficha do jogador pela mesa.
