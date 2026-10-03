---
id: KAN-48
titulo: "Mesa: Cenas e Mapas"
status: concluído
camada: back + front
spec: docs/VTT_Mesa.md (12.5)
---

## O que entrou

- Migration `0092_cenas.sql` (testada num Postgres local com RLS de verdade):
  - `scene_folders` (pastas e subpastas, cor, modo alfabético/manual) e `scenes` com os campos
    da spec: permissões, imagem e cor de fundo, grade (formato, tamanho, distância, unidade,
    estilo, espessura, cor, opacidade), escuridão, efeito climático e ambiente;
  - `campaigns.active_scene_id`: a cena ativa, que aparece no centro da mesa pra todos;
  - só o mestre cria, edita, exclui e troca a cena ativa; jogador lê a cena ativa e as
    marcadas "Mostrar na Navegação" pra ele (todos, ou o jogador escolhido);
  - bucket `scene_images`; Realtime em cenas, pastas e campanha.
- Aba Cenas no visual dos prints do Foundry, só com o que a spec manda:
  - Criar Cena (Nome + Pasta) e Criar Pasta (Nome, Cor, Modo de Organização), em janelas
    flutuantes arrastáveis;
  - pastas com os dois ícones (Criar Pasta e Criar Cena dentro dela) e subpastas;
  - cartões com a miniatura da imagem de fundo e o nome no meio; ✓ na cena ativa;
  - botão direito na cena: Editar, Trazer todos pra cá, Excluir, Duplicar;
  - botão direito na pasta: Editar Pasta, Remover Pasta (cenas ficam soltas), Excluir Todas.
- Editor da cena: abas Básicos, Grade, Ambiente e Diversos (Andares e Visibilidade fora).
  "Andar Inicial" virou "Imagem de Fundo"; sem "Nome na Navegação". Diversos traz a seção
  Áudio, que liga quando a Lista de Reprodução (KAN-53) existir.
- Palco: imagem ajustada à tela, arrastar move o mapa, rodinha dá zoom no ponto do mouse;
  grade quadrada ou hexagonal com estilo/cor/opacidade; escuridão; ambiente (luminosidade,
  saturação, sombras); efeitos climáticos com partículas (Folhas, Chuva, Tempestade com raios,
  Névoa, Neve, Nebulosa).
- Mestre clica numa cena = ativa pra todos. Jogador clica = olha (só ele); quando o mestre
  troca a cena ou usa "Trazer todos pra cá", todo mundo pula pra ela.
- Arrastar uma imagem (do computador ou de outra aba) pra mesa vira o fundo da cena ativa;
  sem cena, cria uma nova com ela e ativa.
- Regras puras em `src/pages/Mesa/cenas.ts`, testadas em `cenas.test.ts`.

## Fica de fora (não está na spec)

- Busca, ordenação e "recolher todas" do painel; Exportar/Importar; Pré-carregar.

## Ajuste da Millie (03/10): imagem arrastada pra cena com fundo

- Antes, arrastar uma imagem trocava o fundo inteiro. Agora: sem cena → cena nova com a
  imagem de fundo; cena sem fundo → vira o fundo; cena com fundo → a imagem entra por cima
  do mapa, no ponto onde foi solta (no máximo 40% do mapa, sem distorcer).
- Migration `0093_objetos_da_cena.sql`: tabela `scene_tokens` (camadas mapa/token/mestre,
  posição, tamanho, giro, travar, espelhar, personagem) — a mesma que os tokens do KAN-49
  vão usar. Jogador não vê a camada do mestre; só o mestre cria/move/apaga (por enquanto).
- Mestre clica na imagem pra selecionar, arrasta pra mover, puxa o canto pra redimensionar
  (proporcional) e apaga com Delete.
- Imagem de outra aba: usa o `<img>` de verdade (não o link da página em volta) e guarda
  uma cópia no nosso bucket; se o site não deixa copiar, usa o endereço dele.
- Aviso no palco: "Enviando imagem…" e quando o que foi arrastado não é imagem.
