---
id: KAN-51
titulo: "Mesa: Sistema de Mira"
status: em análise
spec: docs/VTT_Mesa.md (12.9)
---

Ver a seção 12.9 de docs/VTT_Mesa.md.

## Parte 1 — mira e ataque (entregue)

- **Marcar alvo:** tecla **M** com o mouse em cima do token (ou com tokens selecionados);
  de novo desmarca. Também pela ferramenta **Selecionar Alvos** da barra esquerda (clicar no
  token). Qualquer um mira tokens alheios. **Esc** sem nada selecionado limpa os alvos.
  A mira aparece em cima do token pra todo mundo (a própria mais forte, a dos outros mais
  apagada, com o nome no "title"). Trocar de cena limpa os alvos.
- **Ataque:** com alvo marcado, o ataque da ficha (aba Combate) — ou o teste de uma ação com
  dano na ficha de ameaça (mestre) — manda pro chat "[Atacante] está atacando [Alvo]" com o
  botão **Ataque**. A ficha mostra "Mirando: …".
  - Ataque rola (com condições, modificadores e margem de ameaça já calculados na ficha) e
    compara com a Defesa de cada alvo: Acertou / Errou. Crítico aparece se acertou.
  - **Bloquear:** quem controla a ficha do alvo atingido pode bloquear antes do dano
    (resistência igual ao Bloqueio da ficha contra esse ataque).
  - **Dano** rola (crítico multiplica os dados) e desconta sozinho da Vida de quem foi
    atingido: PV temporário primeiro; dano mental vai pra Sanidade; resistências por tipo
    (proteções equipadas na ficha; texto do bestiário nas ameaças), imunidade e
    vulnerabilidade (dobra). O chat mostra "−7 PV (resistência 5)".
  - Cada passo é gravado uma vez só (não dá pra rolar de novo). Só quem mandou (ou o mestre)
    clica em Ataque e Dano. As rolagens entram no Histórico da ficha.
- Banco: migration 0103 (chat_messages.acao; funções dados_do_alvo, postar_acao,
  registrar_na_acao, bloquear_na_acao, aplicar_dano_da_acao), testada no PGlite.
- Regras em `src/pages/Mesa/mira.ts` (testadas).

## Falta (parte 2)

- **Cura** (ex.: Cicatrização em outro personagem, com Normal / Discente / Verdadeiro).
- Outros efeitos (debuffs) — a spec diz "detalhar depois".
- A vida das ameaças do combate (painel de Combate) é separada da vida do token da ameaça.
