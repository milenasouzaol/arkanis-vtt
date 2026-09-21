---
id: KAN-21
titulo: Automatizar espaço, defesa, alcance e dados extras das modificações
status: aprovado
camada: regra
depende_de: [KAN-16]
---

Ver a issue no Jira: https://arkaniss.atlassian.net/browse/KAN-21

## Levantamento do catálogo

61 entradas únicas entre modificações e maldições: 32 têm algum número automatizável,
29 são puramente narrativas.

| Efeito | Entradas | Situação |
| --- | --- | --- |
| ataque / dano fixo / margem / multiplicador | 8 | já era automatizado |
| espaço ±N | 5 | **entrou agora** |
| Defesa +N | 5 | **entrou agora** |
| +NdX de dano | 4 | **entrou agora** (antes só pelo nome "Explosiva") |
| categoria de alcance | 2 | **entrou agora** |
| RD / resistência | 8 | KAN-22 — não há onde mostrar |
| atributo / PV / PE / perícia | 9 | KAN-23 — mexe na ficha inteira |

## Critérios de aceite

- [x] `espaço +1` aumenta a Carga; `espaço -1` diminui; nunca fica negativo.
- [x] `Defesa +2` na proteção equipada soma na Defesa do Combate.
- [x] `+2d6 de dano` vira linha extra, sem depender do nome.
- [x] `+1 categoria de alcance` sobe um degrau, parando em extremo.
- [x] 24 testes novos, com os textos reais do catálogo.

## Histórico

- 21/09/2026 criado e concluído
