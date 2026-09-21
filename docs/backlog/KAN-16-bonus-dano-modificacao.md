---
id: KAN-16
titulo: Bônus de dano da modificação não entra na rolagem nem aparece no card
status: aprovado
camada: regra
depende_de: [KAN-13]
---

Ver a issue no Jira: https://arkaniss.atlassian.net/browse/KAN-16

## Causa

O parser procurava exatamente "em rolagens de dano", que é como o catálogo escreve em
"Cruel". Modificação criada à mão, escrita como "+2 de dano" ou "+2 no dano", virava zero
em silêncio.

E o card mostrava a fórmula crua: mesmo quando o bônus era entendido, a caixa DANO exibia
"1d10" enquanto a rolagem somava +2, então não dava para conferir olhando.

## Critérios de aceite

- [x] "+2 em rolagens de dano", "+2 de dano", "+2 no dano" e "+2 em dano" são entendidos.
- [x] "+1 dado de dano" transforma 1d10 em 2d10 (Calibre Grosso, que era ignorado).
- [x] A caixa DANO mostra o dano já modificado.
- [x] O bônus aparece no card mas não é somado duas vezes na rolagem.

## Histórico

- 21/09/2026 criado e concluído
