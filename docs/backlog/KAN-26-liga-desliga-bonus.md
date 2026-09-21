---
id: KAN-26
titulo: Ligar e desligar os bônus condicionais dos itens
status: aprovado
camada: regra
depende_de: [KAN-25]
---

Ver a issue no Jira: https://arkaniss.atlassian.net/browse/KAN-26

## Como ficou

Cada bônus condicional vira uma linha no card aberto, com uma chave e a condição escrita
do lado. Ligado, entra no total da perícia; desligado, não. O estado fica guardado por
item (migration 0082, coluna `active_bonuses`).

O que decide se um bônus é condicional é a frase: "+5 Furtividade" vale sempre,
"+5 em Percepção **pra** observar coisas distantes" não. A leitura é por frase, não pelo
item inteiro — o Pé de Morto tem um bônus fixo e uma regra condicional na mesma descrição.

## Critérios de aceite

- [x] Binóculos mostram "+5 Percepção" com a condição do lado e uma chave.
- [x] Ligando, a Percepção sobe 5; desligando, volta.
- [x] O estado sobrevive ao recarregar, porque fica no banco.
- [x] Item com vários bônus mostra um por linha.
- [x] Item sem bônus condicional não mostra a seção.
- [x] 4 testes cobrindo a conta que a ficha faz.

## Histórico

- 21/09/2026 criado e concluído
