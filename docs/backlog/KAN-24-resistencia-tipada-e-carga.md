---
id: KAN-24
titulo: Resistência tipada do próprio item e penalidade de carga da proteção pesada
status: aprovado
camada: regra
depende_de: [KAN-22]
---

Ver a issue no Jira: https://arkaniss.atlassian.net/browse/KAN-24

## O que eu tinha errado

No KAN-22 eu li só o catálogo de **modificações** e não os **itens**. A informação já
estava no banco: a Proteção Pesada tem, no próprio `stats`,
`{ corte: 2, impacto: 2, balistico: 2, perfuracao: 2 }`, e a descrição diz
*"-5 em perícias com penalidade de carga"*.

Resultado: eu mostrava um "Dano 5" genérico vindo da Blindada, quando na verdade a
resistência é **por tipo de dano** e já existe só de equipar a proteção — a Blindada
apenas **eleva** esses tipos de 2 para 5.

## O que mudou

- Resistência sai de `stats.resistencia` do item equipado, por tipo.
- `RD sobe pra N` eleva os tipos que o item já resiste, em vez de criar um tipo novo.
  Em item que não resiste a nada, aí sim vira resistência geral.
- Nunca rebaixa: modificação mais fraca que o item não diminui a resistência.
- Proteção com `-5 em perícias com penalidade de carga` aplica −5 em **Acrobacia, Crime e
  Furtividade** (as três marcadas com `carga_penalty` no banco), e a penalidade aparece ao
  lado do total em vez de sumir dentro dele.

## Critérios de aceite

- [x] Proteção Pesada equipada mostra Corte 2 · Impacto 2 · Balístico 2 · Perfuração 2.
- [x] Com Blindada, os quatro vão para 5, e não aparece "Dano" solto.
- [x] Resistência de elemento entra além dos tipos do item.
- [x] Acrobacia, Crime e Furtividade levam −5 com a pesada equipada.
- [x] 18 testes, com os dados reais do banco.

## Histórico

- 21/09/2026 criado e concluído
