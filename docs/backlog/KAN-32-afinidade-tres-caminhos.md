---
id: KAN-32
titulo: Aba Afinidade — tela de escolher como descobrir o elemento
status: em revisão da Millie
camada: front
depende_de: []
---

## Contexto

A aba era um esqueleto de 90 linhas com uma única `className` no arquivo inteiro. Os
dados já funcionavam (`characters.afinidade_elemento`, rituais e poderes por elemento).

## O que foi feito

Três cartões sobre o fundo decorado:

| rótulo | título | detalhe |
| --- | --- | --- |
| LIBERDADE | Escolha seu Elemento | Seleção direta \| Sem julgamento |
| DESTINO | Teste de Personalidade | 30 perguntas \| Revelação completa |
| PREMONIÇÃO | Escolha por Mim | Caos \| Aleatoriedade completa |

Medidas do DevTools da referência: título **32px Optima `#EFE9DD`**, texto pequeno
**13px Raleway `#EFE9DD`**. Cartão `#1c1a19` → `#181614` com borda `#444242`, amostrados
do print pixel a pixel. Cartão de 350×545.

## Artes

Importadas de `fts vtt/afinidade` e convertidas pra webp (3000×3000 → 900px):
`escolher-simbolo`, `teste-simbolo`, `aleatorio-simbolo`, `fundo-decoracao`,
`fundo-perguntas` e `simbolo-transcender`. De 2,4 MB para 950 KB no total.

## Fora de escopo (as telas de destino)

- **Liberdade** leva pra lista de elementos que já existia, ainda sem estilo.
- **Premonição** sorteia entre os 4 elementos e pede confirmação; tela sem estilo.
- **Destino** mostra um aviso de que as 30 perguntas ainda não existem — não inventei
  nenhuma pergunta.

## Critérios de aceite

- [x] Os três cartões com o visual da referência.
- [x] Clicar em cada um leva pro caminho correspondente.
- [x] A escolha continua salvando em `characters.afinidade_elemento`.

Conferido na página: cartão 350×545, título `Optima 32px rgb(239,233,221)`, pequeno
`Raleway 13px rgb(239,233,221)`. 5 testes novos (155 no total).

## Pendente

- As 30 perguntas do teste de personalidade e o mapeamento resposta → elemento.
- O fundo customizado que a Millie ainda está tentando extrair do site de referência.
- Medo entra como afinidade? Hoje só há 4 elementos no código.

## Histórico

- 23/09/2026 criado — https://arkaniss.atlassian.net/browse/KAN-32
