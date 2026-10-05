# VTT — Construção da Mesa (extrato focado)

Extraído de `VTT_Especificacao_Funcional.md` (última atualização do original: 27/08/2026 às 14:30), enviado pela Millie em 02/10/2026 porque a seção 12 tinha se perdido na cópia do repositório. Reúne tudo que a especificação diz sobre a mesa: conceito, acesso via campanhas, a seção 12 completa, os pontos da ficha que dependem da mesa e as pendências da mesa.

## A. Conceito — Ficha vs. Mesa (spec 1.3)

Não são dois recursos desconectados — a ficha vive dentro da mesa como um módulo:

- **Mesa:** o ambiente de jogo completo e genérico — mapas, música, tokens/bonequinhos movíveis, fotos, documentos, e qualquer outro conteúdo que a pessoa queira trazer pra sessão. A mesa é a mesma tecnologia, independente do sistema de RPG sendo jogado: hoje é Ordem Paranormal, no futuro pode ser D&D ou qualquer outro — a mesa em si não muda.
- **Ficha:** é a parte que muda de sistema pra sistema (cada RPG tem sua própria ficha). É o módulo "plugável" que vive dentro da mesa.
- **Relação entre as duas:** o jogador acessa sua ficha de dentro da mesa, através de uma aba/botão "Fichas". Mas a ficha também existe de forma avulsa, guardada na conta da pessoa, antes/fora de qualquer mesa.
- **Acesso à mesa:** terminar de criar uma ficha não dá acesso automático a uma mesa. Só se entra numa mesa de duas formas: (a) a própria pessoa cria uma campanha — nesse caso ela está mestrando; ou (b) ela recebe um convite (link) pra entrar como jogadora.
- **Papel de mestre:** quem cria uma campanha não precisa ter um personagem pronto — o mestre normalmente conduz vários NPCs. Criar campanha e criar personagem são ações independentes.

**Implicação para Code:** a mesa deve ser um motor genérico/agnóstico de sistema, e cada ficha (Ordem Paranormal, e futuramente outros) um módulo de dados que se conecta a esse motor — não telas hardcoded por sistema.

## B. Campanhas — porta de entrada da mesa (spec 4.3 e 4.4)

**4.3 Minhas Campanhas:** lista das campanhas que o usuário criou; botão "Criar nova campanha".

**4.4 Criar Nova Campanha:** Nome, Descrição, Imagem de capa (customizável), Cor de destaque via seletor RGB (botões/tema daquela campanha), botões "Criar campanha" e "Voltar".

## C. Pontos da ficha que dependem da mesa

- **Contagem de Munição (4.5, Regras Opcionais):** dentro da ficha pronta/mesa, menuzinho de contagem de munição por arma.
- **Dano aplicado via mesa (5.1):** um ataque acertado num token no mapa aplica o dano automaticamente na Vida da ficha correspondente.
- **Limites de Patente / painel do mestre (5.1):** o ajuste manual dos limites fica só no painel do mestre, na mesa. O mestre controla patente/limite de todos os jogadores de uma vez; o limite atualiza na ficha de cada jogador. Provavelmente o mesmo painel serve pra editar XP/NEX.
- **Privacidade da ficha na aba Personagens (5.8):** dois toggles independentes:
  - "Editável para outros jogadores" — ligado permite que outros jogadores da campanha editem a ficha.
  - "Oculta para outros jogadores" — ligado, os outros veem só o card de prévia (foto, classe, antecedente), sem abrir a ficha inteira.
- **Regras Extras (5.10):** localização (só ficha ou painel compartilhado com a mesa) e categorização em aberto.

## 12. A Mesa (Tabuleiro/Sessão de Jogo)

*Referência visual: **Foundry Virtual Tabletop** — referência de layout/UX, como a RPGpédia foi pra ficha. Nada de bloqueio de conteúdo por compra de livro.*

### 12.1 Conceito e Acesso
- O mestre cria uma campanha e escolhe o livro/sistema — hoje só Ordem Paranormal.
- Ao confirmar, é redirecionado direto pra dentro da mesa.
- A mesa é o ambiente onde o mestre constrói tudo da sessão.

### 12.2 Layout Geral
- Botões da esquerda e da direita — colunas de ícones verticais nas laterais, com o mapa/cena no centro.
- Ícones esmaecidos por padrão, pra não competir com o mapa. Ao passar o mouse, o ícone acende e mostra um rótulo com o nome da aba. Clicar abre a aba.
- **Drag-and-drop universal:** arrastar uma imagem de fora do site pra dentro da mesa faz upload/inserção automática, sem passos extras. Vale pro chat e pro mapa — padrão de toda a mesa.

### 12.3 Barra Direita — Mensagens de Chat (1º ícone)
Chat de texto da mesa, onde ficam registradas automaticamente as rolagens feitas na ficha — quando a pessoa abre a ficha de dentro da mesa e rola algo, a rolagem aparece pra todos no chat, junto com uma animação de dado rolando sobre o tabuleiro (aspiracional).

Cada mensagem mostra: foto (da conta ou do personagem, conforme o modo de envio), nome (idem), conteúdo (texto livre ou rolagem com detalhamento), tempo relativo ("4 dias 18h atrás"), menu ⋮ com 3 ações exclusivas do mestre:
- **Destacar Mensagem:** aparece em destaque no meio da mesa pra todos (e continua no histórico).
- **Revelar para Todos:** só em mensagens privadas — torna pública. Mensagens privadas mudam de cor/estilo e mostram "Para: [destinatário]". Não existe "tornar privada" uma mensagem pública.
- **Excluir** (lixeira): remove definitivamente.

Vale pra rolagens e qualquer mensagem — testes de perícia, atributo, ataques, mostrar um item do inventário etc.

**Caixa de mensagem (rodapé):** campo "Digite uma mensagem", Enter envia. Barra de formatação com menu "Parágrafo":
- Tamanho: Pequeno / Normal / Grande / Enorme / Personalizado.
- Fonte: Amiri, Arial, Bruno Ace, Courier, Courier New, Modesto Condensed, Roboto, Roboto Condensed, Roboto Slab, Signika, Times, Times New Roman.
- Formato → Cor: seletor RGB.
- Em Linha: Negrito, Itálico, Código, Sublinhado, Tachado, Sobrescrito, Subscrito.
- Não incluir: Cabeçalhos, Bloco, Alinhamento, Tabela.

Ícones extras: Linha horizontal; Inserir imagem (seletor de arquivos + drag-and-drop no campo); Limpar Formatação. Link sem botão: URL colada vira link clicável ao enviar.

**Modo de envio — 5 ícones acima da formatação:**
- **Público como Usuário** (globo): nome e foto da conta — fora de personagem, visível pra todos.
- **Privado para Mestres** (figura encapuzada): visível só pra quem enviou e pro(s) mestre(s).
- **Cego para Mestres** (olho cortado): visível só pros jogadores; o mestre não vê.
- **Somente para Si** (pessoa): só quem enviou vê.
- **Público como Personagem** (capuz/chapéu pontudo): foto e nome do personagem, visível pra todos.

**Importante:** o modo selecionado também vale como visibilidade padrão das rolagens feitas na ficha enquanto a pessoa está na mesa.

Botões finais: **Exportar Registro de Chat** (disquete — baixa o histórico) e **Limpar Registro de Chat** (lixeira — apaga tudo).

### 12.4 Barra Direita — Encontros de Combate (2º ícone)
Referência adicional: site companion de Ordem Paranormal ("isordemparanormal.com") pro conteúdo — lista de ameaças, fichas de monstro e tela de criação de combate. Aba específica por sistema.

**Criar Combate:**
- Nome* (ex.: "Combate na floresta").
- VD Total: soma automática dos VDs das ameaças selecionadas (começa em 0).
- Fileira de fontes (logos clicáveis, filtro): Ordem Paranormal (livro base), Tocados dos Monstros, Culto da Criação, Marcas Fragmentadas, Grimório Paranormal (compêndios da comunidade) e Comunidade (monstros avulsos). Rodapé: "Conteúdo oficial de Ordem Paranormal. Veja mais aqui" (link).
- Lista de Ameaças: busca por nome; filtros por elemento Todos / Conhecimento / Energia / Morte / Sangue / Medo / Realidade + aba Homebrew. ("Realidade" = ameaças não paranormais: pessoas, cães, animais.) Cada ameaça: imagem, Nome, VD, Tipo - Tamanho, botões **Ficha** e **Adicionar**.

**Ficha de Ameaça** (componente reaproveitado):
- Cabeçalho: imagem, Nome, VD, Tipo - Tamanho.
- Barra de Vida atual/máxima com setas «‹ ›» (só têm efeito em combate ativo).
- Abas **Status / Combate / Descrição**:
  - Status: AGI/FOR/INT/PRE/VIG, Defesa, Deslocamento, Perícias com fórmula pronta ("PERCEPÇÃO 6d20+25") e dado clicável, Sentidos, Elementos secundários, Imunidades, Resistências, Vulnerabilidades.
  - Combate: Presença Perturbadora ("DT 45 - 10d8 mental"); sub-abas Ações / Poderes, lista expansível ("PADRÃO - Agredir", "LIVRE - Explodir em Sangue"). Cada ataque: nome, tipo ("Corpo a corpo"), vezes por turno ("2x"), Teste ("6d20+45"), Dano (fórmula + tipo, mais valor fixo somado — "50 Sangue" + "2d10 Sangue"), Crítico ("x3"). Poderes sem ataque têm descrição. O dado de cada ataque só rola em combate ativo, no turno da criatura.
  - Descrição: lore.
- Rodapé: botão **Adicionar**.

**Ameaças Selecionadas** (lado direito): cada uma com **Remover** na cor do elemento. VD Total soma tudo. Botões **Sair sem salvar / Salvar**.

**Homebrew** (biblioteca global da conta, não da campanha):
- Contador "Homebrew 9/50" (limite de 50) + Adicionar. Lista com engrenagem (editar) e Ficha.
- 4 abas: AMEAÇAS / HABILIDADES / RITUAIS / ITENS. Habilidades, Rituais e Itens reaproveitam exatamente os formulários customizados da ficha (5.1); muda só o destino (biblioteca global, reutilizável em qualquer mesa, por quem criou e por quem a convidar).
- Nota na ficha homebrew: "Nesta ficha você pode editar as Ações e Poderes. Para utilizar a ficha em jogo, é necessário ir para a página da campanha, criar um combate e adicionar a ficha no combate."

**Formulário de Ameaça (Homebrew):** Nome*, Tipo*, Tamanho*, Elemento*, Elementos secundários; VD*, Vida atual*/máxima*; AGI/FOR/INT*/PRE*/VIG* (começam em 1); Defesa*, Deslocamento* + Deslocamentos alternativos; Sentidos; Perícias (Percepção, Iniciativa, Fortitude, Reflexos, Vontade com Dados* e Bônus, + adicionais); Imunidades (+ texto); Resistências numéricas pros 15 tipos (dano, balístico, corte, eletricidade, fogo, frio, impacto, mental, conhecimento, energia, medo, morte, sangue, perfuração, químico); Vulnerabilidades; Presença Perturbadora (DT, Dano); NEX imune; Descrição (texto rico — negrito fica roxo); Enigma do Medo (texto rico); Imagem de Perfil e Imagem Completa; Cancelar / Adicionar.

Exemplo "Bandido" (VD 10, Pessoa - Médio): AGI 2/FOR 2/INT 1/PRE 1/VIG 1, Defesa 14, Deslocamento "9m/6q", "REFLEXOS 2d20+5"; "PADRÃO - Agredir" → "FACA" (Corpo a corpo, 2d20+5, 1d4 + 2 Perfuração); "Ataque Furtivo"; descrição "Um criminoso típico, como um ladrão ou assaltante."

**Lista de combates salvos:** vazio = "Sem Combates" + "+ Criar Combate". Cards: Nome + VD + **Iniciar**.

**Rodando um combate:**
- Iniciar gera iniciativa automaticamente pros personagens jogáveis e pras ameaças.
- Cabeçalho com nome + Configurações / Encerrar / Adicionar.
- Ordem de iniciativa (maior pro menor): foto, nome, 3 barrinhas (Vida vermelho, PE dourado, Sanidade roxo), iniciativa (número grande sublinhado). **Voltar Turno / Próximo turno** + "Rodada Atual: N".
- Clicar num combatente abre a ficha dele à direita.
- **Jogadores não veem vida nem ficha dos monstros** — só a ordem de iniciativa.
- **Indicador de turno no tabuleiro:** retângulo no topo do mapa com a foto de quem age. A pessoa clica na própria imagem pra passar o turno (com animação). O mestre pode forçar com "Próximo turno".
- Ameaça com 0 de vida: o mestre remove pelo "X".
- Encerrar: some o indicador; a lista volta a mostrar os combates.
- Teste de monstro = mesma lógica do jogador (≥ Defesa acerta), fórmula pronta.

### 12.5 Barra Direita — Cenas / Mapas (3º ícone)
A tela central sempre mostra a cena que o mestre tem selecionada. Ao configurar a campanha, o mestre escolhe uma imagem de cena inicial.

Botões **Criar Cena** e **Criar Pasta**.

**Criar Pasta:** Nome, Cor (seletor RGB), Modo de Organização (Alfabética / Manual). Clicar numa pasta: "Criar outra pasta" (subpasta) ou "Criar uma cena" dentro dela. Cena sem pasta fica solta.

**Criar Cena:** modal Nome + Pasta → editor com abas **Básicos, Grade, Ambiente, Diversos** (Andares e Visibilidade fora).

**Básicos:**
- Nome da Cena.
- Permissões: checkbox "Mostrar na Navegação" + dropdown Apenas Mestre / Todos Jogadores / cada jogador individualmente.
- "Imagem de Fundo" (seletor ou drag-and-drop; se ajusta à tela) e Cor de Fundo.
- Grade: tamanho em px + Quadrado / Sem grade / Hexágono.
- Nível de Escuridão: slider 0–1.
- Efeito Climático: Folhas de Outono, Chuva, Tempestade (chuva + raios), Névoa, Neve, Nebulosa (vento + névoa + neve rápida). Implementação a definir em Code.
- Salvar Alterações.

Miniatura na lista reflete ao vivo a imagem de fundo. Menu de contexto da cena: **Editar**, **Trazer todos pra cá** (mestre), **Excluir**, **Duplicar**.

**Grade:** Mecânicas (tamanho, formato); Medidas (Distância e Unidades — calibra Medir Distância, em metros); Aparência (Estilo — não precisa de todos agora —, Espessura, Cor, Opacidade 0–1).

**Ambiente:** só Luminosidade (-1 a 1), Saturação (-1 a 1), Sombras (0 a 1).

**Diversos:** Áudio — Playlist da Cena (toca ao ativar) e Áudio da Playlist. Aceitar links (YouTube, Discord etc.) ou MP3 arrastado — mecanismo a definir. Ligado à Lista de Reprodução (12.12).

### 12.6 Barra Direita — Posicionáveis (4º ícone, peça de quebra-cabeça)
Armazém de assets reutilizáveis do mestre: arrastar pra aba pra guardar, arrastar pra mesa pra usar. Pastas e subpastas. 6 categorias (abas de ícone, como no Foundry): **Tokens, Objetos, Desenhos, Luzes Ambientes, Sons Ambientes, Notas**. Paredes e Regiões ficam de fora.
- Tokens: importar PNG (botão ou arrastar) registra; nome = nome do arquivo; botão direito → Renomear; arrastar pra mesa insere. Uso: NPC sem ficha, árvore, carro.
- Desenhos: PNG, PDF ou documento.
- Luzes Ambientes: efeitos de luz, aceita GIF.
- Sons Ambientes: áudios rápidos (porta batendo, vento).
- Objetos (os "Tiles" do Foundry): imagem solta por cima do mapa e por baixo dos tokens (árvore, carro, mesa); sem ficha.
- Notas: notas soltas.

Sem regra de negócio complexa — repositório de conveniência.

### 12.7 Barra Direita — Personagens (5º ícone, silhueta)
Conecta a mesa genérica com a ficha do sistema. Rótulo "Personagem"/"Criar Personagem" (nunca "Ator").
- Começa vazia. Cada jogador que entra pelo convite aparece automaticamente, vinculado à ficha dele.
- Botões **Criar Personagem** e **Criar Pasta**.
- Tipos pra Ordem Paranormal: **NPC** e **Ameaça/Monstro** (mesma ficha do Homebrew, versão simplificada focada em rolagens). Sem "Objeto" e sem "Player Character".
- **NPC:** abre a ficha completa de Ordem Paranormal numa janela flutuante redimensionável e reposicionável, sem as 5 etapas de criação. Salva em tempo real. Nome aparece na lista.

Menu de contexto: **Editar**; **Configurar Propriedade** (modal "Configuração de Propriedade: [Nome]" — checkbox "Mostrar Usuários Mestres", nível padrão pra "Todos os Jogadores" + nível por jogador; níveis Nenhum / Limitado / Observador / Dono; Salvar Alterações); **Excluir** ("Você Tem Certeza? Este Personagem será excluído permanentemente e não poderá ser recuperado." Sim / Não); **Duplicar**.

**Configurar Token:** várias imagens — **Token Principal** (vai pra mesa e vira miniatura na lista) + **Tokens Variáveis** (quantos quiser, renomeáveis). Troca em jogo via "Variação de Token" (12.8). Token ≠ foto da ficha/chat.

### 12.8 Tokens na Mesa
- Arrastar um personagem da aba Personagens pro mapa insere o token principal onde o mouse soltar. O dono também pode, não só o mestre.
- Só o dono e o mestre movem, a não ser que liberem via Configurar Propriedade do token.
- Mover: setas ou arrastar. Movimento visto em tempo real; posição fixa ao soltar.
- Selecionado: alças pra redimensionar proporcionalmente (dono e mestre, sem limite) e bolinha pra girar 360°.

Menu de contexto do token:
1. **Ping Todos** — qualquer jogador, em qualquer ponto do mapa.
2. **Ping de Foco** — mestre; leva a câmera de todos pro ponto.
3. **Copiar** / **Colar** / **Desfazer** / **Refazer**.
4. **Ficha de Personagem** — abre a ficha ligada (jogador, NPC ou Ameaça).
5. **Configurar Propriedade** — quem mais pode mover: Somente Eu, Todos os Jogadores, cada jogador (mestre sempre pode).
6. **Alterar Camada** — Tokens / DM / Mapa.
7. **Trazer para a Frente** / **Enviar para Trás**.
8. **Travar Posição / Desbloquear Posição**.
9. **Variação de Token** — painel lateral com as imagens cadastradas; clicar troca na hora.
10. **Transformação Avançada** — Agrupar / Desagrupar; Virar Horizontalmente / Verticalmente.
11. **Eliminar** — tira da mesa sem apagar o personagem.

Fora: Definir/Local Grupo, Colocar Alfinete, Adicionar Turno, Respostas, Enumerar Tokens, Desativar encaixe da grade, Desativar menus de token, Dimensões.

**Camadas (3):** **Mapa** (fundo; não clicável quando o foco é token), **Token**, **Mestre/DM** (visível só pro mestre — revela via Alterar Camada).

### 12.9 Sistema de Mira — Ataque, Dano e Cura
Token conectado à ficha: ações aplicam automaticamente no alvo.
- Marcar alvo: clicar no token e apertar **M** — aparece ícone de mira sobre ele.
- **Ataque:** marca o alvo → usa um ataque da ficha → chat "[Atacante] está atacando [Alvo]" com botões **Ataque** e **Dano** → Ataque rola; se ≥ Defesa, libera Dano → Dano rola e desconta da Vida do alvo, considerando Bloqueio/Proteção, resistências a tipos de dano e a elementos.
- **Cura:** ex. Pedro usa Cicatrização em Maria → marca Maria → chat "[Pedro] está usando o ritual [Cicatrização] em [Maria]" com botão do teste → se passar, botão **Curar** aplica. Escolhe Normal / Discente / Verdadeiro, que muda o valor.
- O mesmo vale pra outros efeitos (debuffs) — detalhar depois.

### 12.10 Barra Direita — Itens (6º ícone, maleta)
Itens/objetos interagíveis na mesa. **Criar Item**, **Criar Pasta**, busca "Procurar Itens", ordem alfabética ou de criação.

Categorias: **Item Lootável** (Arma/Munição/Proteção/Geral), **Contêiner**, **Documento/Pista**, **Artefato Amaldiçoado**, **Armadilha**.

Formulário: Imagem; Nome; Raridade (Comum, Incomum, Raro, Muito Raro, Lendário, Artefato Amaldiçoado); Quantidade; Peso = Carga.
- **Descrição:** editor rico do chat.
- **Detalhes:** Tipo (Arma/Munição/Proteção/Geral); Teste de interação (Perícia, Atributo, DT); Usos (limite 1–∞; quem pode usar: pessoa específica, todos, ou uso único compartilhado).
- **Atividades** (padrão: Checar; "+" adiciona): **Ataque** (nome, ícone, Corpo a corpo / À Distância, Arma Física / Arma de Alcance Longo / Ataque Desarmado); **Castar Ritual** (ritual do catálogo, pessoa/área/local, teste pra evitar; área calculada pelos quadrados da grade); **Checar** (testes contra Valor Testado); **Dano** (sem teste); **Cura**; **Sumonar** (ameaça do catálogo); **Transformar** (troca o token por tempo/condição). Cada uma com editar, lixeira e ⋮ (Editar/Duplicar/Deletar). Fora: Enchant, Forward, Save, Use.
- **Ativação** comum: quando dispara (clicar, teste, início/fim de turno, início/fim de descanso, nenhuma), Consumo, Alvos (quem tocou, todos, ninguém, todos os jogadores, os marcados pela mira).
- **Efeitos:** Item (vai pro Inventário, soma Carga), Documento (abre página de texto), Imagem.

Uso: arrastar da lista pra mesa; clicar dispara a interação e manda pro chat ("Você encontrou [nome]").

### 12.11 Barra Direita — Diário (7º ícone, livro)
Anotações/handouts gerais (motor genérico). **Criar Entrada**, **Criar Pasta**, busca "Procurar Registros de Diário", ordem alfabética ou recência. Criar Entrada pede Nome ("Registro de Diário").
- O mestre vê todos os diários, inclusive dos jogadores; libera acesso via Configurar Propriedade.
- Controles: **Diário Desbloqueado / Clique para Bloquear**; **Página Única / Múltiplas Páginas**.
- Múltiplas Páginas: lupa (nome ou conteúdo), nome editável, **Adicionar Página** (Nome + Tipo: Vídeo, Texto, PDF, Imagem).
  - Vídeo: Exibir Título, Caminho (arquivo ou URL/YouTube), Mostrar Controles, Auto-Reproduzir, Loop, Volume, Tempo de Início, Dimensões. "Salvar Registro". Miniplayer.
  - Texto: editor rico do chat.
  - PDF: arquivo.
  - Imagem: arquivo + Legenda.
- Menu de contexto: Editar, Configurar Propriedade (Dono / Observador / Limitado / Nenhum — Nenhum esconde da lista), Exportar Dados, Importar Dados, Excluir, Duplicar.

### 12.12 Barra Direita — Lista de Reprodução (8º ícone, nota musical)
**Criar Playlist**, **Criar Pasta**, busca "Procurar Listas de Reprodução".
- **Controles de Volume de Usuário** (retrátil): Música, Ambiente, Efeitos Sonoros — cada um ajusta o próprio.
- Playlist: Nome; Modo Playback (Sequencial, Embaralhar, Tocar Repetitivamente); Canal (Música / Ambiente / Efeitos Sonoros); Descrição (texto rico). "Criar Playlist" / "Atualizar Playlist". Botões **Adicionar Som** e **Tocar Playlist**.
- Som: Nome; Origem (arquivo local **ou** link YouTube/Spotify/qualquer mídia); Canal; Volume 0–1; Repetir; Descrição. Botões **Repetir Som** e **Tocar Som**.
- Só o mestre vê os nomes e o que está tocando; jogadores só ouvem e ajustam o próprio volume.

### 12.13 Barra Esquerda — Ferramentas de Cena
Categorias no topo, ferramentas embaixo.

**Controles de Token:**
- Selecionar Tokens — clique / arrastar seleção / Shift+clique; arrastar move; Shift ou Ctrl+rolagem gira; clique direito HUD; duplo clique abre ficha; DELETE exclui; Ctrl+clique waypoint.
- Selecionar Alvos — mira com **M**; qualquer um mira tokens alheios.
- Medir Distância — em **metros**; Ctrl+clique waypoint.

**Ferramentas de Desenho:** Selecionar, Retângulo, Elipse (ALT = proporcional), Polígono, Mão Livre, Texto. Paleta: Linhas (largura, cor, opacidade), Preenchimento (tipo, cor, opacidade), Texto (fonte, tamanho, cor, opacidade).

**Controles de Som Ambiente:** Selecionar, Desenhar (área **retangular**; duplo clique edita; clique direito liga/desliga), Pré-visualizar, Paleta (Volume Máximo, Escondido), Limpar Sons. Formulário: Nome, Fonte (arquivo ou link), Volume. Falloff pelo centro; toca pra quem tiver token dentro.

Fora: Paredes e Iluminação.

### 12.14 Rodapé Esquerdo — Painel de Sessão
Nome da conta do mestre + latência + FPS. Abaixo, um item por jogador conectado: "Nome do Personagem (PrimeiroNome)".

### 12.15 Configurações da Mesa (engrenagem)
- **Configuração de Campanha:** Nome, Imagem, Data da próxima sessão (visível no site), Descrição (texto rico).
- **Usuários:** lista; Kickar (temporário) ou Banir (permanente).
- **Sair:** volta pro site.
- **Link de Convite:** gerar/copiar.

## D. Pendências da mesa (spec 9)
- Fora do escopo por enquanto: Paredes e Iluminação.
- Definir implementação técnica dos Efeitos Climáticos (12.5) e do áudio por link/upload (12.5, 12.12, 12.13).
- Aplicar os toggles de privacidade da ficha (5.8) na aba Personagens.
- Regras Extras (5.10): já implementada como aba da ficha; falta decidir se a mesa também a mostra.
