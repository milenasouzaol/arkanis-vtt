---
id: KAN-39
titulo: Aba Interlúdio: cena clicável do esconderijo
status: em revisão da Millie
camada: front
depende_de: []
---

## Contexto

A Millie gerou no ChatGPT a arte do esconderijo da Ordem à noite (prompt nosso, com um
canto pra cada ação do interlúdio) e escolheu a cena clicável em vez de só fundo.

## Como ficou

- A arte (`assets/interludio/esconderijo.webp`, 1672×941) cobre a aba inteira: é um SVG com
  `preserveAspectRatio="xMidYMid slice"`, então corta igual a um `cover` e os contornos dos
  objetos acompanham a imagem em qualquer tamanho de tela.
- Objetos (`interludioCena.ts`, contornos em pixels da arte): mesa = Alimentar-se, cama =
  Dormir, saco de pancada e halteres = Exercitar-se, poltrona e livros = Ler, bancada =
  Manutenção, sofá e rádio = Relaxar, quadro = Revisar Caso.
- Passar o mouse (ou focar pelo teclado): o objeto acende, o resto do cômodo escurece e o
  nome aparece. Ação escolhida fica acesa; ação travada (limite de 2, ou Relaxar com
  problema de folga) acende sem cor.
- Clicar escolhe a ação e abre o painel do lado com a descrição e os controles dela
  (condição de descanso, Regra da Paixão, prato, item consertado, Revisar Caso com rolagem
  e pista). "Fazer isso" / "Tirar do interlúdio" no rodapé do painel.
- Barra de baixo: as ações escolhidas (clicáveis e removíveis), Bônus guardados, Folga da
  Ordem (com Resolver Problema quando houver) e Resolver interlúdio.
- Avisos no topo: interlúdio resolvido, problema de folga pendente e vínculo romântico.
- A lógica de recuperação (PV/PE/Sanidade/PD, bônus, pistas, folga) é a mesma de antes.

## Ajustes da Millie

- O X de fechar o painel não estava no centro: agora é desenhado (SVG) e centralizado.
- O recorte em volta dos itens estava errado: os contornos foram retraçados rente a cada
  silhueta, sobre a arte ampliada com grade (o exercício virou duas partes: saco e
  halteres), e a borda do recorte é levemente desfocada.
- Ao passar o mouse, o objeto brilha de leve e dá um mini zoom (4%) a partir do centro
  dele; o resto do cômodo escurece pouco.
