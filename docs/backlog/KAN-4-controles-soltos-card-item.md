---
id: KAN-4
titulo: Dar forma aos controles soltos dentro do card de item do Inventário
status: aberto
camada: front
depende_de: []
---

## Contexto

Os cards de item do Inventário ficaram prontos seguindo as referências da Millie. Mas a ficha
tem quatro controles que não aparecem em nenhuma dessas referências e que, se fossem
simplesmente removidos, quebrariam funcionalidade: rastrear usos/munição, munição vinculada à
arma, equipar/desequipar e as modificações/maldições.

Eles estão hoje num bloco solto dentro do card aberto (`.inv-item-extras`, em
`app/src/pages/CharacterSheet/InventarioTab.tsx`), sem estilo, só para não perder a função
enquanto o desenho não vem.

## Escopo

- Dar forma a esses quatro controles dentro do card aberto, seguindo a estética do resto da aba.

## Fora de escopo

- Mudar o comportamento deles. A lógica já funciona; o que falta é a aparência.

## Critérios de aceite

- [ ] Nenhum dos quatro controles some: rastrear usos, munição vinculada, equipar/desequipar e modificações continuam acessíveis.
- [ ] Proteção equipada continua somando Defesa na ficha.
- [ ] Arma continua conseguindo vincular munição do inventário.
- [ ] Os controles seguem a mesma estética dos cards (fonte, moldura, cantos retos).
- [ ] `tsc`, `lint`, `npm test` e `build` limpos.

## Referências visuais

**PENDENTE — aguardando a Millie.** O front está bloqueado até chegarem os prints de como
esses controles devem aparecer.

## Histórico

- 21/09/2026 criado — https://arkaniss.atlassian.net/browse/KAN-4
