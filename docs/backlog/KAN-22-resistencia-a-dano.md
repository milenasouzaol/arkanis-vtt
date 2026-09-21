---
id: KAN-22
titulo: Resistência a dano na ficha
status: aprovado
camada: regra
depende_de: [KAN-21]
---

Ver a issue no Jira: https://arkaniss.atlassian.net/browse/KAN-22

## Correção da premissa

Eu tinha aberto este card dizendo que o app não tinha lugar para mostrar resistência.
**Estava errado**: a linha existe no Defesa expandido, na aba de Combate — eu procurei por
"RD" e "resistência a dano" e não por "Resistência", e não achei. O valor é que estava
fixo em "Nenhuma".

Então não era preciso desenho novo, e o card deixou de estar bloqueado.

## O que foi feito

As resistências saem do texto dos efeitos dos itens **equipados** e preenchem aquela linha:

- `RD sobe pra 5` → Dano 5
- `Resistência a Energia / Morte / Sangue / Conhecimento N` → por elemento
- `Resistência mental N` → Mental
- `resistência a dano 2 (leve/escudo) ou 5 (pesada)` → mostra o teto (5); a condição
  continua escrita no efeito, à vista

Vale para qualquer item equipado, não só a proteção: acessório amaldiçoado também conta.
Repetindo o mesmo tipo em itens diferentes, vale a maior.

## Critérios de aceite

- [x] Proteção com Blindada mostra "Dano 5" em vez de "Nenhuma".
- [x] Resistência por elemento aparece.
- [x] Dano citado num efeito não vira resistência por engano (Voltaica cita "2d6 dano de Energia").
- [x] Sem item equipado, continua "Nenhuma".
- [x] 18 testes, com os textos reais do catálogo.

## Histórico

- 21/09/2026 criado e concluído
