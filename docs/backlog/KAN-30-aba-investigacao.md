---
id: KAN-30
titulo: Aba Investigação — pasta com sub-aba Pessoal e páginas de Investigação
status: aprovado
camada: front
depende_de: []
---

## Contexto

A aba era um esqueleto de 130 linhas sem nenhuma classe de CSS. Os dados já existiam
desde a migration `0012_investigacao.sql`, então nada de banco foi preciso.

## Estética

Pasta de papel sobre o fundo de elemento que a pessoa já escolheu — a pasta é feita no
CSS, não é imagem. Valores tirados do DevTools da referência que a Millie mandou:

| o quê | valor |
| --- | --- |
| pasta (marrom) | `#b1865c`, padding 18px |
| papel | `#d9d9d9`, padding 12px, radius 2px |
| textura de papel | `opacity: .2`, `cover` |
| post-it | `#ffe59e`, padding `12px 12px 44px`, 173px |
| dobra do post-it | `#b29c5f`, 32×32 |
| título do post-it | Freehand 20px |
| corpo do post-it | Secret Service Typewriter 12px |

Fontes: **Secret Service Typewriter** nos títulos, **Raleway** no que a pessoa digita.
A Freehand entrou no `index.html` junto da Barlow, que o projeto já carrega do Google.

## O que foi feito

- Sub-aba **Pessoal**: fichinha do agente (foto, nome, Agente Nº, origem, classe, brasão
  de marca d'água) + Aparência na coluna 1; Personalidade e Objetivo na 2; Histórico na 3.
- Post-it **Lembrete**, que fecha no X e fica fechado (`lembrete_fechado`).
- Sub-aba **Investigação**: Título/Identificador (invertido), Objetivo e Resumo na coluna 1;
  Perguntas na 2; Pistas na 3.
- **Adicionar nova página**, e clicar na aba já aberta abre o modal de renomear.
- **Lixeira** que abre no hover (mesmo par de PNGs do Combate) com modal de confirmação.
- A primeira página é criada sozinha, com um guard pra não criar duas no StrictMode.

## Decisões que valem registro

- A foto base sem avatar segue a regra que o resto do app já usa: a cor sorteada por
  `fallbackAvatarColor(character.id)` com a logo do Arkanis por cima.
- Com o lembrete aberto, a pasta abre uma calha de 205px na direita pro post-it ficar
  nela, em vez de cobrir a coluna do Histórico.
- A textura de 1,5 MB virou webp de 15 KB.

## Ajustes depois do primeiro print (mesmo card)

- Abas: fechada `#835e39`, aberta na cor da pasta `#b1865c` — não branca.
- A pasta passou a ocupar a altura toda da tela, e as duas sub-abas ficam do mesmo
  tamanho (medido: 701px nas duas, e os títulos no mesmo 12,75px/700).
- Títulos dos quadros em negrito.
- Fichinha refeita como **quadrado** (294×294 na referência, `aspect-ratio: 1` aqui),
  foto menor, fontes maiores, rótulo colado no valor, brasão centralizado e mais fraco.
- O "Agente Nº" perdeu o número: é só o rótulo, com a barra preta em cima.
- Entraram o **clipe de papel** (SVG que a Millie mandou, preso a -35px do topo e 224px
  da esquerda, em %) e os **tracinhos** da lateral direita, que no original são o texto
  `/////////////////` de pé.
- Pra o clipe poder passar da borda, quem recorta agora é o `.inv-ficha-fundo`, não o
  cartão.

## Segunda rodada de ajustes

- **O negrito não aparecia**: a raiz do app tem `font-synthesis: none` e a Secret Service
  Typewriter só tem o arquivo Regular, então `font-weight: 700` não fazia nada. Religado
  com `font-synthesis: weight` dentro de `.inv-pasta`. Vale pros títulos dos quadros, pro
  nome do agente e pros valores de origem e classe.
- Nome do agente menor (1,35em → 1,05em) e em negrito.
- A foto virou absoluta e caiu **em cima do círculo do brasão**. O círculo do capacete
  mede 49,2% da largura da imagem e o centro dele fica a 33,96% da altura, então com a
  foto em 40% do cartão o brasão precisa de 81,3% de largura e `top: -0.3%`. Medido:
  131px de diâmetro nos dois e 0px de desalinho em x e y.
- Clipe desceu (`top: -11.9%` → `-7.5%`) pra parecer preso no papel.
- **A calha do post-it foi removida.** Ela estreitava só a sub-aba Pessoal, e era essa a
  diferença de tamanho entre as duas. Agora o post-it flutua por cima do papel e as duas
  medem igual: papel 1319×701 e pasta 1355×737 num viewport de 1500×860, sem sobra de
  rolagem.

## Onde a Millie mexe sozinha

Bloco `MEXA AQUI` no começo de `.inv-pasta`, em `app/src/index.css`:

| variável | o que faz |
| --- | --- |
| `--pasta-largura` | largura da pasta marrom (1184px na referência) |
| `--pasta-altura` | altura máxima dela (851px) |
| `--foto-tamanho` | diâmetro da foto, em % da largura do cartão |
| `--foto-altura` | altura do centro da foto dentro do cartão |

O brasão **não** acompanha a foto: ele fica parado em `81.3%` / `-0.3%`, que é o
encaixe que a Millie aprovou. Chegou a ser derivado da foto por `calc()`, mas ela pediu
o contrário — quer mover só a foto. Conferido com a foto em 33%, 44% e 60%: o brasão
ficou em 267px de largura e topo 70px nos três, e só a foto mudou (108, 144 e 197px).

## Critérios de aceite

- [x] As duas sub-abas com o visual da referência.
- [x] Renomear página salva e aparece na aba.
- [x] Adicionar e deletar página funcionam, com confirmação antes de deletar.
- [x] Tudo salva no Supabase enquanto digita.

8 testes novos (150 no total). Conferido carregando o `index.css` de verdade.

## Referências visuais

Prints e DevTools da Millie, 23/09/2026. Arte em `fts vtt/investigacao`.

## Histórico

- 23/09/2026 criado — https://arkaniss.atlassian.net/browse/KAN-30
- 23/09/2026 concluído
