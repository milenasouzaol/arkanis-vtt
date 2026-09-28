---
id: KAN-34
titulo: Afinidade — página do elemento escolhido
status: em revisão da Millie
camada: front
depende_de: [KAN-33]
---

## Contexto

Depois do "Finalizar", a aba mostrava uma lista crua com `<ul>` e `<li>`. A Millie mandou
as artes de Morte em `fts vtt/afinidade/morte`.

## Artes

| arquivo original | virou | tamanho |
| --- | --- | --- |
| `dsds` (PNG sem extensão, igual ao `sasasa`) | `morte/fundo.webp` | 239 KB |
| `Imagem do Codex…png` (o título "MORTE") | `morte/titulo.webp` | 304 KB |
| `Arte_de_Aeternus…webp` | `morte/aeternus.webp` | 169 KB |

De 7,6 MB para 710 KB. O Aeternus tem fundo transparente de verdade (alfa 0 nos cantos).

## O que foi feito

- Fundo do elemento parado atrás (`position: fixed`), escurecido pra leitura.
- Título em arte, com a frase do elemento embaixo em Westsac.
- Aeternus grudado na lateral (`sticky`), acompanhando a rolagem; some em tela estreita.
- Tabelas no estilo da ficha (painel com `dark-plaster-texture`, títulos em Keyes,
  texto em Raleway):
  - **Rituais**, agrupados por círculo: Ritual, Execução, Alcance, Duração, Resistência.
    `table-layout: fixed` pra as colunas alinharem entre os círculos — medido: coluna
    "Execução" em x=689 nos quatro.
  - **Poderes**: Poder (com pré-requisito embaixo), Efeito e **Com afinidade** — o campo
    `affinity_description`, que existia no banco mas não aparecia em lugar nenhum.
- A página busca os próprios dados; o estado duplicado que ficou na aba saiu.

Conferido com os dados reais: 23 rituais em 4 círculos, 10 poderes, os 10 com texto de
afinidade.

## Estrutura pros outros elementos

`ARTES` em `AfinidadePagina.tsx` guarda fundo, título e figura por elemento. Só Morte tem
por enquanto; Sangue, Energia e Conhecimento caem no título em texto (Westsac) até
chegarem as artes deles.

## Os outros elementos

A Millie mandou título e símbolo de **Sangue**, **Conhecimento** e **Medo**. Sem fundo
novo nem figura: usam o `bg-*.webp` que a ficha já tinha, e o símbolo entra no lugar do
Aeternus.

As seis imagens vieram com **fundo branco sólido** (alfa 255 nos cantos), que viraria um
retângulo branco na página escura:

- **Sangue e Conhecimento**: "color to alpha" a partir do branco — desfaz a composição
  da arte sobre o papel, então o brilho dourado e os respingos viram semitransparentes
  em vez de serrilhados.
- **Medo**: esse método apagava as próprias letras, que são tinta branca sobre papel
  branco. Aqui só o papel quase puro some (acima de 242); a tinta e a fumaça, um pouco
  mais escuras, ficam. O símbolo vinha cortado reto na direita do arquivo, então os
  símbolos ganharam um degradê radial na borda.

Conferido com os dados reais: Sangue 24 rituais e 13 poderes, Conhecimento 24 e 10,
Medo 9 e 0, Energia 24 e 13.

**Energia** não veio arte: continua no título em texto.

**Medo** tem página, mas não está na roda de escolha — só aparece se o personagem já tiver
Medo como afinidade. Também não tem frase, porque não havia print dela.

## Pendente

- O "Remover afinidade" continua, mas a tela de escolha diz que a escolha é definitiva.
  Um dos dois precisa sair — pergunta ainda sem resposta da Millie.

## Histórico

- 23/09/2026 criado — https://arkaniss.atlassian.net/browse/KAN-34
