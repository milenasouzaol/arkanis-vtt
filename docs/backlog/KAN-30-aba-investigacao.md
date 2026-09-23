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

## Pendente de referência

- O **clipe de papel** que aparece no topo da fichinha não veio nos arquivos.
- A cor da **aba aberta** (`#ece9e4`) foi lida do print, não medida no DevTools.

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
