---
id: KAN-25
titulo: Automatizar os bônus incondicionais dos itens e corrigir o Escudo
status: aprovado
camada: regra
depende_de: [KAN-24]
---

Ver a issue no Jira: https://arkaniss.atlassian.net/browse/KAN-25

## O que entrou

Bônus que valem sempre que o item está equipado, sem "se":

- Traje Hazmat / de mergulho / espacial → resistência a químico 10 / 5 / 20
- Amuleto sagrado → +2 Religião e Vontade
- Pé de Morto → +5 Furtividade
- Câmera Filmadora → +2 Investigação/Percepção
- Medidor de Condição Vertebral → +2 Fortitude

A resistência passou a aceitar tipo qualquer, não só os cinco elementos.

## O bug do Escudo

O Escudo diz *"Defesa +2 (acumula com proteção)"*, mas é do tipo proteção e o app forçava
uma proteção equipada por vez — equipar o escudo **desequipava a armadura**, e a pessoa
perdia 10 de Defesa em vez de ganhar 2. Agora o escudo é exceção à regra, e a Defesa soma
todas as proteções equipadas em vez de usar só a primeira encontrada.

## Critérios de aceite

- [x] Traje Hazmat equipado mostra "Químico 10".
- [x] Pé de Morto dá +5 em Furtividade; Amuleto dá +2 em Religião e em Vontade.
- [x] Equipar Escudo não desequipa a proteção, e a Defesa soma os dois.
- [x] O bônus de item aparece ao lado do total da perícia, em verde.
- [x] 10 testes novos, com as descrições reais do catálogo.

## Histórico

- 21/09/2026 criado e concluído
