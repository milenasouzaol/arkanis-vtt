---
description: Roda uma demanda do Arkanis pelo fluxo completo — cards, arquitetura, back, front e QA — sem deixar nada passar com erro.
argument-hint: <descrição da demanda, e o caminho das referências visuais se houver>
allowed-tools: Agent, Read, Write, Edit, Glob, Grep, Bash
---

Demanda da Millie: **$ARGUMENTS**

Conduza essa demanda pelo fluxo de desenvolvimento do projeto. Você é o condutor: chama cada agente na ordem, lê o que ele devolveu e só avança quando aquela etapa fechou de verdade.

## Ordem

1. **`jira-manager`** — quebra a demanda em cards em `docs/backlog/`, com critérios de aceite verificáveis.
   - Se algum card de tela ficar sem referência visual, **pare e peça a referência à Millie** antes de seguir. A estética nunca é inventada neste projeto.

2. **`architect`** — lê os cards e o código, decide o desenho, escreve o `## Plano técnico` em cada card e diz o que é do back, o que é do front e em que ordem.

3. **`backend-developer`** — executa a parte de dados (schema, migration, RLS, queries). Vem antes do front quando a tela depende de coluna nova.

4. **`frontend-developer`** — executa a parte de tela, com as referências em mãos.

5. **`qa-engineer`** — testa e revisa. Ele é o último portão.
   - **REPROVADO:** devolva ao dev responsável com o relatório do QA e volte ao passo 5 quando ele corrigir. Repita até aprovar. Não siga em frente com problema conhecido.
   - **APROVADO:** siga.

Back e front podem rodar em paralelo quando um não depende do outro — o plano do architect diz se dependem.

## Fechamento (só depois do APROVADO)

- Atualize o status dos cards para `aprovado` e o `docs/backlog/INDEX.md`.
- Faça **um commit** com mensagem em português explicando **o porquê** da mudança, não só o quê, e termine com a linha de atribuição usada no projeto.
- Dê push.
- Se houve migration, **entregue o arquivo `.sql` para a Millie com `SendUserFile`** — ela roda à mão no SQL Editor do Supabase, e sem isso a funcionalidade não sobe.

## O que você reporta no final

Em português, direto:
- o que foi entregue, por card;
- o resultado real dos portões do QA;
- o que ficou de fora e por quê;
- o que depende de ação dela (migration para rodar, referência visual faltando).

Nada é dado como pronto sem o QA ter aprovado.
