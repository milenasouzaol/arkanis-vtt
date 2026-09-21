---
id: KAN-23
titulo: Item amaldiçoado somando atributo, PV e PE na ficha
status: aprovado
camada: regra
depende_de: [KAN-26]
---

Ver a issue no Jira: https://arkaniss.atlassian.net/browse/KAN-23

## Decisões da Millie

- Só conta com o item **equipado**.
- O bônus aparece **separado**, pequeno e verde, ao lado do número no hexágono — não somado dentro dele.
- As que "ativam após 1 dia de uso" ficam **manuais**: liga e funciona, desliga e para.

## O que entrou

- Pujança +1 Força · Destreza +1 Agilidade · Sagacidade +1 Intelecto · Disposição +1 Vigor · Carisma +1 Presença → valem ao equipar.
- Vitalidade +15 PV · Esforço Adicional +5 PE → entram no liga/desliga, porque "ativa após 1 dia" não é algo que o app saiba medir.
- Lépida +10 Atletismo continua como perícia, não como atributo.

## Refatoração junto

Tudo que um item concede — pela descrição, por modificação ou por maldição — passou por
uma função só (`efeitosDoItem`). Antes o liga/desliga guardava o **índice** do bônus na
lista; agora guarda uma **chave que descreve a origem** (`mod-Vitalidade-ficha-0`). Com
índice, acrescentar uma modificação ao item mudaria a ordem e o que estava ligado viraria
outro bônus, em silêncio.

## Critérios de aceite

- [x] Equipar acessório com Pujança mostra "+1" verdinho ao lado da Força.
- [x] Desequipar tira.
- [x] Vitalidade e Esforço Adicional só valem depois de ligados.
- [x] 10 testes novos, com os textos reais do catálogo.

## Histórico

- 21/09/2026 criado e concluído
