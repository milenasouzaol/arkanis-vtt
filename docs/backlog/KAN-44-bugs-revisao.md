---
id: KAN-44
titulo: Bugs da revisão geral: NEX a mais nos máximos, descanso sem limite e erros calados
status: em revisão da Millie
camada: regra + front
depende_de: []
---

## Contexto

Revisão geral antes de ir para a mesa. A Millie pediu para corrigir os bugs achados.
Na mesma revisão saiu a `0086_bestiario_pendente.sql` (bestiário que nunca entrou no
banco porque a 0040 não tinha rodado) e o KAN-4 foi dado como resolvido.

## O que mudou

- **Máximos por NEX** (`rules.ts`, `nexAumentos`): no NEX 5% só os valores iniciais da
  classe; cada NEX seguinte soma um aumento (99% = 19). Antes a ficha somava um aumento a
  mais em Vida, PE, Sanidade e PD (Combatente Vig 2 no NEX 5%: 28 → 22). Vale para a aba
  Agente e a Progressão. Valor atual que ficar acima do novo máximo não é mexido.
- **Descanso do Interlúdio** (`recuperarAteMaximo`): Dormir e Relaxar param no máximo que
  a ficha mostra (com os ajustes à mão de máximo). Quem já está acima não perde nada. O
  vínculo da Regra da Paixão continua somando por cima, porque aumenta o máximo também. A
  classe do personagem saiu da aba Agente para `useClasseDaFicha`, usada pelos dois.
- **Erros calados** (`avisoErro.ts` + `AvisoErroBanco`): o cliente do Supabase usa um fetch
  vigiado; gravação que falha ou leitura que quebra mostra um aviso no canto da tela (some
  em 7s, sem repetir o mesmo erro). Leitura `.single()` sem linha (406) e o login ficam de
  fora. Pega as 109 chamadas sem mexer em cada uma.
- Aviso do verificador no modal de ataque resolvido (parâmetro sem uso).

Testes: `rules.test.ts` e `avisoErro.test.ts`. Aviso conferido no navegador com uma leitura
quebrada de verdade.
