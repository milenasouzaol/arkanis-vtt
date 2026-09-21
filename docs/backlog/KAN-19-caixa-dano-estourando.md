---
id: KAN-19
titulo: Caixa de dano estourava o card e engolia o nome do ataque
status: aprovado
camada: front
depende_de: [KAN-14]
---

Ver a issue no Jira: https://arkaniss.atlassian.net/browse/KAN-19

## Causa

Duas coisas somadas: as caixas não tinham largura máxima, então cresciam sem limite; e o
texto do dano concatenava a descrição inteira das linhas extras ("2d6 explosão adicional"),
que é descrição, não algo que precise caber numa caixinha.

## Critérios de aceite

- [x] Com dano extra, o nome do ataque continua visível (corta com reticências).
- [x] A caixa DANO não passa da largura máxima.
- [x] Na caixa, linha extra aparece compacta ("+2d6"); o texto completo fica no expandido.

## Histórico

- 21/09/2026 criado e concluído
