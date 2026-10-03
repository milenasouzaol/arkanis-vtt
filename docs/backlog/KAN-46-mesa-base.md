---
id: KAN-46
titulo: "Mesa: rota, acesso e layout base (barras, palco da cena, painel de sessão)"
status: concluído
camada: back + front
spec: docs/VTT_Mesa.md (12.1, 12.2, 12.14, 12.15)
---

## O que entrou

- Migration `0088_mesa_base.sql`: membros da campanha enxergam os outros membros (o painel
  de sessão precisa) e a campanha guarda o `system` (hoje `ordem_paranormal`).
- Rota `/mesa/:id`, sem a navbar do site. Criar campanha leva direto pra mesa; clicar numa
  campanha abre a mesa; confirmar o personagem no convite também.
- Quem não é dono nem membro vê "Mesa indisponível" e volta pro Jogar.
- Palco central (vazio até as Cenas, KAN-48), barra direita com as 8 abas na ordem da spec,
  barra esquerda com as 3 categorias de ferramentas. Ícones esmaecidos, acendem no hover com
  rótulo; clicar abre o painel da aba.
- Painel de sessão: mestre com latência (ack de broadcast no canal `mesa:<id>`) e FPS, e cada
  jogador conectado como "Personagem (PrimeiroNome)", por presença em tempo real.
- Engrenagem: copiar link de convite (mestre) e Sair.
- Regras puras em `src/pages/Mesa/mesa.ts`, testadas em `mesa.test.ts`.

## Falta (depende da Millie)

- Estética das referências do Foundry que a Millie mandou (02/10): fundo preto e ícones, textos e bordas em cinza claro (o vinho dos prints era só exemplo; ícones Font Awesome, como o Foundry), painel escuro colado na borda direita, Configurações como aba da barra direita, fonte Signika.

## Bugs achados pela Millie (03/10)

- Abrir o link de convite já colocava a pessoa na campanha, mesmo sem personagem. Agora o
  link só mostra a campanha (função `campaign_by_invite`, migration `0091`) e a pessoa vira
  membro quando confirma o personagem.
- Sem personagem: "Criar personagem de Ordem Paranormal" ou adicionar um que já tem. Depois
  de criar, volta pro convite (ou pra mesa) sozinha. Quem não estava logado volta pro
  convite depois de entrar ou criar a conta.
- Jogador que já é da campanha mas sem personagem: clicar na campanha (Minhas Campanhas)
  ou abrir a mesa mostra a janelinha de escolher personagem; só depois entra na mesa.
- "Copiar link de convite" só aparece pro mestre (no card da campanha e na mesa).
