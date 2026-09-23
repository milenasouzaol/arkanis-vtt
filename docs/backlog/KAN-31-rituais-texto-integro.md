---
id: KAN-31
titulo: Texto íntegro dos 23 rituais que estavam resumidos
status: aprovado
camada: back
depende_de: []
---

## Contexto

Os rituais de fora do Livro Base entraram no seed a partir dos `docs/VTT_Conteudo_*.md`,
que são resumos. Os 82 do Livro Base já tinham sido corrigidos na `0080`; faltavam estes
23. A Millie forneceu os PDFs oficiais.

## O que foi feito

Texto extraído dos PDFs com `pdfjs-dist` e transcrito para a migration `0083`:

| fonte | rituais |
| --- | --- |
| Sobrevivendo ao Horror | 16 |
| Arquivos Secretos 01 | 1 (Passagem de Conhecimento) |
| Arquivos Secretos 02 | 4 (Capturar Momento, Labirinto Mental, Mapa Sanguíneo, Rajada Caótica) |
| Arquivos Secretos 04 | 1 (Backup) |
| Arquivos Secretos 06 | 1 (Hesitação Forçada) |

Só mexe em `effect`, `discente_effect` e `verdadeiro_effect`. Os campos estruturais
(execução, alcance, alvo, duração, resistência, custos, círculo exigido, afinidade) já
estavam corretos no banco e foram conferidos um a um contra os PDFs.

## Achado pra Millie decidir

No PDF do **Arquivos Secretos 02**, o efeito de **Capturar Momento** está impresso com o
texto do **Mapa Sanguíneo** — é erro de diagramação do livro, não da extração. Os
aprimoramentos Discente e Verdadeiro dele falam de um símbolo que capta seres e explode
em energia de Morte, o que não combina com o efeito base impresso. Transcrito como está
no livro, com a ressalva no cabeçalho da migration.

Nota menor: `Passagem de Conhecimento` é de Sangue **e** Conhecimento, mas a tabela guarda
um elemento só e ele está como `sangue`. Não foi alterado.

## Critérios de aceite

- [x] Os 23 rituais resumidos cobertos.
- [x] Cada `where` casa com exatamente uma linha real (nome + slug da fonte), conferido
      contra o banco pela API.
- [x] Os 23 blocos SQL bem formados: aspas balanceadas, 3 campos, terminador.
- [x] Migration rodada pela Millie no SQL Editor.
- [x] Conferido pela API depois de rodar: os 23 estão com o texto do livro no banco.

## Histórico

- 23/09/2026 criado — https://arkaniss.atlassian.net/browse/KAN-31
- 23/09/2026 migration entregue e rodada pela Millie; conferido pela API, 23/23 batendo
  (o banco guardou CRLF em vez de LF nas quebras de parágrafo, o que não muda o texto)
