---
id: KAN-46
titulo: "Mesa: rota, acesso e layout base (barras, palco da cena, painel de sessão)"
status: em análise
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

- Ícones das barras: hoje mostram a sigla da aba. Estética final da mesa a partir das referências dela.
