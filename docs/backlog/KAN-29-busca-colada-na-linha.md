---
id: KAN-29
titulo: Colar o texto dos campos de busca no tracejado, em todas as abas
status: aprovado
camada: front
depende_de: [KAN-9]
---

## Contexto

O "Buscar Ataques" do Combate flutuava acima da linha tracejada. A Millie pediu o
mesmo pra todos os campos de busca do app, não só o do Combate.

## Causa

`.combat-search-field` é irmão do botão "Adicionar" dentro de `.combat-search-row`, que
estica os filhos. Com `align-items: center`, o texto ficava centralizado na altura do
botão — 12,67px de folga até o tracejado. O `padding-bottom: 0.4em` do campo era só
uma parte menor do problema.

Os overrides que já existiam (`.inv-search-row`, `.rituais-search`, `.ability-picker-shell`)
cada um chutava um valor diferente de padding pra compensar; todos foram removidos e a
regra base resolve os cinco lugares de uma vez.

## Solução

Em `.combat-search-field`: `align-items: flex-end` e `padding-bottom: 0`.
Em `.combat-search-input`: `line-height: 1.1` e `padding-bottom: 1px`.

## Critérios de aceite

- [x] Combate / Habilidades colados na linha.
- [x] Inventário colado na linha.
- [x] Rituais colado na linha.
- [x] Picker de habilidade (e os outros pickers, que usam a mesma classe) colados.

Medido carregando o `index.css` de verdade: texto e lupa a 1px do tracejado nos quatro
casos, contra 12,67px do Combate e do Inventário antes.

## Referências visuais

Print da Millie, 23/09/2026.

## Histórico

- 23/09/2026 criado — https://arkaniss.atlassian.net/browse/KAN-29
- 23/09/2026 concluído
