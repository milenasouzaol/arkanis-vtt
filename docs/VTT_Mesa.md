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

**Rolagem digitada e bandeja de dados (feito, print da Millie 06/10):** `/r 1d20+5` (ou `/roll`) rola e vai pro chat como rolagem (com os dados 3D). Aceita d4…d100 (`d%`), vários termos com + e −, `kh`/`kl` (manter maiores/menores: `2d20kh1`) e rótulo depois de `#` (`/r 2d6+2 # Dano`). Fórmula que não dá pra ler avisa com exemplos. Embaixo do campo, a **bandeja**: d4 d6 d8 d10 d12 d20 d100 (clique põe um, botão direito tira, a contagem aparece em cima), − / modificador / +, **ADV/DIS** (vantagem: mais um dado e fica com o maior; no d20 fica com 1, como em Ordem) e **Roll**. O código vai aparecendo no campo enquanto clica.

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
Imagem (token, objeto, luz, desenho em imagem) entra na mesa sempre no tamanho original dela, sem redimensionar.
- Tokens: importar PNG (botão ou arrastar) registra; nome = nome do arquivo; botão direito → Renomear; arrastar pra mesa insere. Uso: NPC sem ficha, árvore, carro.
- Desenhos: PNG, PDF ou documento; e tudo que for feito com as Ferramentas de Desenho (de qualquer pessoa) fica registrado aqui sozinho.
- Luzes Ambientes: efeitos de luz, aceita GIF.
  - **Luz Ambiente de verdade (feito, migration 0129):** a luz clareia a escuridão em volta, no mesmo sistema da lanterna. **Configurar Luz** (duplo clique na luz, ou botão direito → Luz Ambiente → Configurar Luz): acesa, raio (quadrados; vazio = metade do objeto), luz forte, intensidade, cor, abertura (360 = em volta; menos vira cone, com direção que gira com o objeto) e animação (Tremular p/ fogo e vela, Pulsar). Mexe e vê na hora; fechar sem salvar volta. Botão direito em **qualquer** objeto/token → Acender/Apagar Luz. Na aba, o botão da lâmpada cria uma **luz sem imagem** (a lâmpada só o mestre vê). Guardar da mesa pra aba leva a configuração junto. **Forma:** Círculo ou **Feixe** (abertura e direção, como a lanterna).
  - **Efeitos animados (feito, migration 0131 scene_tokens.efeito):** Fogo, Fumaça, Água, Nuvem/Névoa, Veneno e Faíscas, em partículas, saindo do objeto. Botão direito → **Efeito Animado** → Criar/Configurar Efeito (tipo, cor, tamanho, quantidade, velocidade, direção, abertura; vê na hora). Cor clara brilha (fogo de verdade); escura pinta por cima (fogo preto). Na aba Luzes Ambientes, o botão de chama cria um **efeito sem imagem** (a chama só o mestre vê). Duplo clique no efeito abre a configuração. Dá pra juntar com Luz Ambiente no mesmo objeto (fogueira que clareia).
- Sons Ambientes: áudios rápidos (porta batendo, vento); todo Som Ambiente criado na mesa fica registrado aqui sozinho.
- Objetos (os "Tiles" do Foundry): imagem solta por cima do mapa e por baixo dos tokens (árvore, carro, mesa); sem ficha.
- Notas: notas soltas.

Sem regra de negócio complexa — repositório de conveniência.

### 12.7 Barra Direita — Personagens (5º ícone, silhueta)
Conecta a mesa genérica com a ficha do sistema. Rótulo "Personagem"/"Criar Personagem" (nunca "Ator").
- Começa vazia. Cada jogador que entra pelo convite aparece automaticamente, vinculado à ficha dele.
- **Entrar sem ficha** (feito; migration 0139, `campaign_members.sem_ficha`): na tela de escolher personagem, o jogador pode entrar sem ficha. Só o mestre cria personagens na mesa (NPC com ficha); em **Configurar Propriedade → Dono** pra um jogador, aquela ficha vira o personagem dele na mesa (rola, coleta itens, move o token, fala no chat como ele) e ele edita tudo. A ficha continua do mestre (não entra em Meus Personagens do jogador); personagem próprio na campanha tem preferência. Muda ao vivo, sem recarregar.
- Tormentos da Arena Macabra: as 4 fichas da missão (Angelo, Jéssica Moreira, Rafael Alvarenga, Sam Ávila) já estão criadas na pasta Sobreviventes, prontas pra dar.
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

**Criar Item a partir de um objeto do mapa** (feito; migration 0138): o mestre arrasta a imagem (documento, papel, arma…) pra mesa, botão direito → **Criar Item** → Nome, Tipo (Documento/Pista, Item Lootável, Artefato Amaldiçoado), **Quantos podem pegar** (número, ou **Infinito**) e **Peso** (espaços). O objeto vira o item e a ficha do item abre pra completar. Jogador: botão direito → **Coletar Item** (ou Interagir → Pegar; precisa estar encostado). Com número, cada pessoa pega 1 e o botão mostra quantos restam; acabou, o objeto some. Infinito: todo mundo pega 1 e o objeto fica. A mesma ficha não pega o mesmo item duas vezes. No inventário, item com imagem tem **Ver imagem** (documento pra ler de novo). Itens antigos, sem esse modo, continuam como eram (pega tudo de uma vez).

Formulário: Imagem; Nome; Raridade (Comum, Incomum, Raro, Muito Raro, Lendário, Artefato Amaldiçoado); Quantidade; Peso = Carga.
- **Descrição:** editor rico do chat.
- **Detalhes:** Tipo (Arma/Munição/Proteção/Geral); Teste de interação (Perícia, Atributo, DT); Usos (limite 1–∞; quem pode usar: pessoa específica, todos, ou uso único compartilhado).
- **Atividades** (padrão: Checar; "+" adiciona): **Ataque** (nome, ícone, Corpo a corpo / À Distância, Arma Física / Arma de Alcance Longo / Ataque Desarmado); **Castar Ritual** (ritual do catálogo, pessoa/área/local, teste pra evitar; área calculada pelos quadrados da grade); **Checar** (testes contra Valor Testado); **Dano** (sem teste); **Cura**; **Sumonar** (ameaça do catálogo); **Transformar** (troca o token por tempo/condição). Cada uma com editar, lixeira e ⋮ (Editar/Duplicar/Deletar). Fora: Enchant, Forward, Save, Use.
- **Ativação** comum: quando dispara (clicar, teste, início/fim de turno, início/fim de descanso, nenhuma), Consumo, Alvos (quem tocou, todos, ninguém, todos os jogadores, os marcados pela mira).
- **Efeitos:** Item (vai pro Inventário, soma Carga), Documento (abre página de texto), Imagem.

Uso: arrastar da lista pra mesa; clicar dispara a interação e manda pro chat ("Você encontrou [nome]").

**Motor de interatividade (pedido da Millie, 06/10).** Itens e tokens interativos servem pra qualquer sistema de jogo: o que é do sistema (perícias, atributos, alcances, tipos de dano, recursos, nome da magia, categorias de requisição, como rolar um teste pela ficha) fica num adaptador em `app/src/sistemas` (hoje: Ordem Paranormal). Mesa de outro jogo = adaptador novo.
- **Ao Passar no Teste** (pedido da Millie, 06/10): em Ativação → Tempo, escolher "Ao Passar no Teste" mostra Perícia, Atributo e DT ali mesmo. A pessoa faz esse teste antes; passou, a atividade acontece (ex.: Abrir Contêiner com Teste de Crime DT 20); falhou, roda o Se Falhar (ex.: armadilha). Não precisa de um Checar separado.
- Atividades encadeadas: as que têm teste (Checar, Ataque, Ritual) têm **Se passar → …** e **Se falhar → …**; as outras, **Em seguida → …**. Atividade com Quando Dispara = Nenhuma só roda pelo encadeamento. Ex.: Baú: Checar Crime DT 20 → passou: Abrir Contêiner; falhou: Dano (armadilha).
- Tipos novos: **Abrir Contêiner** (mostra o Conteúdo do item pra pegar e ir pro inventário) e **Mostrar Documento** (documento/imagem da aba Efeitos).
- **Conteúdo** (Contêiner): itens da campanha + quantidade.
- **Requisição**: categoria do sistema (OP: 0, I–IV, limitada pela patente) e/ou preço em dinheiro (os dois valem na Loja).
- Na mesa: um token/objeto pode representar um item (baú no mapa, NPC vendedor ligado a uma Loja); clicar abre a janela de interação; só interage quem tiver um token dentro do alcance da atividade (o mestre sempre).
- Ordem de construção: base + baú com teste → loja → efeitos visuais.
- **Na mesa (feito):** arrastar o item da aba Itens pra mesa (entra no tamanho da imagem; sem imagem, uma maleta). Botão direito num token/objeto (mestre) → **Vincular Item** liga qualquer token a um item (ex.: NPC vendedor). Jogador **clica** no item pra interagir; o mestre usa **botão direito → Interagir**. **Duplo clique abre a configuração** do que foi clicado: item (loja, contêiner, documento…) → ficha do item (mestre ou jogador dono do item; os outros jogadores interagem); token de personagem → ficha; objeto comum (mestre) → Configurar Propriedade. O botão direito também tem **Editar Item / Loja / Contêiner / Documento**.
- **Janela de interação:** imagem, descrição e um botão por atividade que dispara Ao Clicar. Atividade com teste mostra o teste no botão ("Arrombar · Teste de Crime") e, ao clicar, **pergunta antes de rolar** ("Pra Arrombar, você precisa fazer um Teste de Crime" → Rolar / Cancelar; a DT só aparece pro mestre). Cancelar não gasta uso nem dispara nada; vale também pros testes encadeados. Botão trava se o token do jogador estiver longe (alcance da atividade, pelos quadrados da grade) ou se acabaram os usos. Os testes rolam pela ficha (adaptador do sistema); o encadeamento roda sozinho; Abrir Contêiner mostra o conteúdo com **Pegar** (vai pro inventário da ficha como item próprio); Dano/Cura/Ataque aplicam nos alvos (resistências e máximos da ficha); Mostrar Documento abre o texto/imagem; cada passo vira um cartão no chat (nome do teste, resultado e PASSOU/FALHOU; a DT nunca aparece pros jogadores, nem na janela nem no chat; o banco nem manda a DT pro jogador: quem decide se passou é a função passou_no_teste, que só responde passou/falhou; só o mestre vê a DT).
- **Compêndio** (pedido da Millie, 06/10): o adaptador do sistema expõe o compêndio de equipamentos dos livros (OP: equipment_items). **Criar Item → Do Compêndio** busca e cria o item já preenchido (nome, descrição, tipo, categoria, espaço, imagem) e ligado ao equipamento (compendio_id). No **Conteúdo** do contêiner dá pra pôr item da campanha ou **equipamento do compêndio** direto. Ao pegar, equipamento do livro (ou item ligado a um) entra no inventário como o equipamento de verdade (com as estatísticas da ficha); item próprio entra como item personalizado.
- **Pegar do chão** (pedido da Millie, 06/10): item Lootável, Artefato Amaldiçoado ou marcado "Vai pro Inventário" colocado no mapa já tem o botão **Pegar** na janela (sem precisar criar atividade), com alcance Toque. Vai pro inventário com a quantidade dele (equipamento de verdade, se veio do compêndio) e o token some do mapa; o item da aba Itens (modelo) continua. Pra exigir teste, crie uma atividade com "Ao Passar no Teste".
- **Loja** (pedido da Millie, 06/10): categoria de item "Loja" (ou um NPC ligado a ela pelo Vincular Item). Em Detalhes: **Cobra Por** Requisição / Dinheiro / Os Dois e o **Estoque** (no "Do Compêndio" dá pra marcar vários de uma vez, ou "Marcar todos" de um filtro — Tipo e/ou Categoria, ex.: todas as Armas de categoria I —; o que já está no estoque não duplica) (item da campanha ou do compêndio, quantidade ou ∞, preço — vazio usa o do item). Na mesa: **Abrir Loja** (alcance Curto) mostra a vitrine com o dinheiro e os limites da patente (atual/limite por categoria I–IV). **Requisitar**: o banco confere a patente (ou o ajuste manual da ficha); categoria 0 é livre. **Comprar**: confere e desconta o dinheiro da ficha (compra com dinheiro não conta no limite da patente). Estoque baixa (∞ não acaba); o item vai pro inventário (equipamento de verdade se for do compêndio); cada compra vai pro chat. **Dinheiro** do personagem: na ficha, topo do Inventário, embaixo do Prestígio.
- Sumonar só avisa no chat (o mestre coloca a ameaça); Transformar troca a imagem do token de quem interagiu.

### 12.11 Barra Direita — Diário (7º ícone, livro)
**Feito (migration 0132: journal_entries, journal_folders, bucket diario):** aba com Criar Entrada (todos; jogador fica dono do que cria), Criar Pasta (mestre), busca e ordem. Janela no visual dos prints: índice numerado à esquerda (cadeado — desbloqueado arrasta pra reordenar —, Página Única/Múltiplas Páginas, Procurar Páginas por nome ou conteúdo, recolher a barra), página à direita com o nome do registro em cima (duplo clique renomeia), pena pra editar a página, Adicionar Página (Nome + Tipo: Texto, Imagem, PDF, Vídeo) e setas. Vídeo: link do YouTube ou arquivo, Mostrar Controles, Auto-Reproduzir (sem som), Loop, Volume, Tempo de Início. Menu: Editar/Ver, Configurar Propriedade, Exportar/Importar Dados (JSON), Duplicar, Excluir (mestre ou autor). Tipos do D&D (Class Summary, Spell List etc.) ficaram de fora. Fonte dos títulos: Roboto Condensed (a Modesto Condensed do Foundry não está no projeto).

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
- Selecionar Tokens — clique / arrastar seleção / Shift+clique; arrastar move; Shift ou Ctrl+rolagem gira; clique direito HUD; duplo clique abre ficha; DELETE exclui (o mestre, qualquer token; o jogador, só o próprio — o do personagem dele ou de um personagem de que é dono —, também pelo botão direito → Excluir Token); Ctrl+clique waypoint.
- Selecionar Alvos — mira com **M**; qualquer um mira tokens alheios.
- Medir Distância — em **metros**; Ctrl+clique waypoint.

**Ferramentas de Desenho:** Selecionar, Retângulo, Elipse (ALT = proporcional), Polígono, Mão Livre, Texto. Paleta: Linhas (largura, cor, opacidade), Preenchimento (tipo, cor, opacidade), Texto (fonte, tamanho, cor, opacidade).

**Controles de Som Ambiente:** Selecionar, Desenhar (área **retangular**; duplo clique edita; clique direito liga/desliga), Pré-visualizar, Paleta (Volume Máximo, Escondido), Limpar Sons. Formulário: Nome, Fonte (arquivo ou link), Volume. Falloff pelo centro; toca pra quem tiver token dentro.

**Áreas de Escuridão** (só o mestre; pedido da Millie, 05/10): Selecionar, Desenhar Área (retângulo, fica preto pros jogadores), Limpar. A lanterna dos tokens ilumina dentro delas e dentro do Nível de Escuridão da cena.

**Lanterna do token** (botão direito → Lanterna; o dono do token e o mestre mexem). Antes de configurar, só **Configurar Lanterna**: a pessoa arrasta uma seta partindo da lanterna do token, na direção da luz; o comprimento da seta é até onde a luz vai, guardado em proporção ao token (a UV vai 80% disso). Enquanto arrasta, aparece a prévia da luz. Esc cancela; fica guardada no desenho do token e acompanha quando ele anda, vira e gira. Depois: **Editar Lanterna**, Desligada / Comum / UV. Sem configurar: cone saindo da altura do peito do token pra frente dele (direita da imagem; virar o token na horizontal vira a lanterna; girar gira junto). Comum: 5 quadrados, 60°. UV: 4 quadrados, 50°, roxa, clareia menos e revela objetos marcados "Só Aparece na Luz UV" (o mestre marca no botão direito do objeto).

Fora: Paredes.

### 12.13b Dados 3D (pedido da Millie, 06/10)
Toda rolagem nova que chega no chat (ficha, Ataque/Dano da mira, teste e cura, interação com item) cai na tela como dados 3D, pra todo mundo que vê a mensagem, parando no mesmo resultado do chat. Biblioteca dice-box-threejs (MIT). Cada dado na cor do tipo (as mesmas dos dadinhos do chat: d20 roxo, d6 verde…). Mensagens que já estavam no chat ao abrir a mesa não rolam de novo. **Sonoplastia** (arquivos da Millie, em app/public/sons; volume de Efeitos Sonoros): **som da arma no ataque**: quando o dado de ataque cai na mesa (botão Ataque da mira ou rolagem "Ataque: [arma]" da ficha), toca o som da arma pra todos (katana, espada, machado, arco, pistola, revólver, escopeta, escopeta estrondosa, fuzil, submetralhadora, metralhadora, sniper, lança-chamas; pelo nome da arma do livro, ou pelo tipo de dano se o nome for próprio; arquivos longos cortam em ~3 s); **na mesa só tocam o dado rolando e o som da arma; os sons de interface abaixo são só da ficha (/personagem/…, sozinha ou dentro da mesa)**: todo clique em botão faz a máquina de escrever (diminuir/aumentar vida, adicionar…), a não ser que o clique já tenha um som próprio; toda janelinha que abre (ficha ou mesa) faz "abrir" e ao fechar "fechar" (desligando áudio); Investigação: página nova/virar página e deletar página; dado (dados 3D caindo; na ficha fora da mesa, ao rolar), virar o cartão de rolagem, trocar aba (ficha e barra direita), abrir/fechar janelas, marcar caixinhas, parar som da Lista de Reprodução, mandar mensagem/salvar nota (escrevendo), criar item/nota/pasta (página nova), excluir (item, nota, mensagem, token) e usar ritual pelo elemento (Sangue, Morte, Conhecimento, Energia, Medo).

### 12.14 Rodapé Esquerdo — Painel de Sessão
Nome da conta do mestre + latência + FPS. Abaixo, um item por jogador conectado: "Nome do Personagem (PrimeiroNome)".

### 12.15 Configurações da Mesa (engrenagem)
- **Configuração de Campanha:** Nome, Imagem, Data da próxima sessão (visível no site), Descrição (texto rico).
- **Usuários:** lista; Kickar (temporário) ou Banir (permanente).
- **Sair:** volta pro site.
- **Link de Convite:** gerar/copiar.

### Configurações (KAN-54, feito; migration 0133)
Aba Configurações no formato do print do Foundry da Millie: Arkanis, Sistema de Jogo, **Ajustes e Configuração** (Configurações, Controles; mestre: Configuração do Mundo e Usuários) e **Acesso ao Jogo** (Links de Convite, Sair = desloga, Voltar às Campanhas).
- **Configurações do Jogo** (busca + seções, cada uma abre a sua janela com Redefinir / Salvar Alterações): Interface de Usuário (escala, no navegador), Som (Música, Ambiente, Efeitos), **Dados** (mostrar os dados 3D, tamanho, tempo na tela; aparência dos SEUS dados: uma cor por tipo ou todos iguais, cor do número, contorno, material Plástico/Metal/Metal Polido/Madeira/Vidro, textura; Rolar de Teste; fica no perfil (profiles.dados3d) e todo mundo vê os seus assim), Chat (nome da conta), e do mestre: **Permissões de Usuários** (Criar Diário — vale no banco —, Pingar o Mapa, Usar a Régua), **Fontes Adicionais** (envia .ttf/.otf/.woff, nome, peso e estilo; carrega pra todo mundo e entra no menu de fontes do chat; com o nome Modesto Condensed vira a fonte dos títulos do Diário) e **Monitor de Combate** (vida no carrossel; caveiras automáticas — vale no passar_turno).
- **Controles**: lista dos atalhos. **Configuração do Mundo**: nome e cor da mesa. **Usuários**: quem está na campanha; o mestre tira alguém.

### Tempo e Calendário (feito; migrations 0140 e 0141; modelo: Mini Calendar, referência da Millie)
- **Ligar:** Configurações do Jogo → Tempo e Calendário (mestre). Relógio, calendário ou os dois; jogadores veem ou não; **Tradicional** (365 dias, 24h de 60min, domingo a sábado) ou **Personalizado** (horas no dia, minutos na hora, dias da semana, meses com quantos dias, nome do ano). Começo da campanha (data e hora). Formato 24h/12h, segundos, velocidade do ▶, horas do amanhecer e do pôr do sol, fase da lua (ciclo no personalizado), estações (começo e as duas cores da barra), clima (bioma: temperado, tropical, deserto, polar), tom da cena pela hora. Fica em `campaigns.configuracoes.tempo`; o tempo é minutos desde o começo (com ▶, cada um calcula o agora a partir de quando começou a correr).
- **Janelinha:** arrastável (cada um guarda a posição), minimiza; barra de cima com o sol/lua do período e a estação (com as cores dela; sem estação, a cor da mesa). Compacto: lua, anotar hoje, anotações de hoje, data, amanhecer de amanhã e pôr do sol (mestre); −1h, −10min, clima, hora (clique: acertar data e hora), ▶/⏸, +10min, +1h; faixa do dia com a bolinha do sol que o mestre arrasta. Duplo clique na barra: o mês (grade com lua em cada dia, clima até depois de amanhã, anotações, hoje marcado, dias vividos na cor da mesa; Hoje, Amanhecer, Pôr do sol, engrenagem). Sem calendário: Dia 1, Dia 2… Só o mestre mexe no tempo.
- **Anotações por dia** (`calendario_notas`): título e texto; só de quem escreveu ou compartilhadas com a mesa (olho); o mestre apaga qualquer uma e troca o clima do dia, e pode levar o tempo pra um dia.

### Biblioteca de Tokens (feito; migrations 0136 e 0137)
Tokens prontos dos pacotes da Millie (JipeX, O Speedrun na Floresta, Tokens Personagens, Ameaças do Outro Lado) e as armas/equipáveis do pacote de partes, servidos junto com o site em `app/public/biblioteca` (webp + miniatura + `indice.json`; 502 imagens, cada uma com código de 3 dígitos). Sem crédito de artista (site fechado, só amigos).
- **Onde abre:** Posicionáveis → Tokens e Objetos (botão do livro: clique guarda na aba, ou arraste direto pra mesa, entra como token no tamanho da imagem) e Configurar Token (Da Biblioteca: escolhe o Token Principal ou soma Tokens Variáveis).
- **Busca:** código (#042 ou 42), nome, coleção, grupo, ou palavras: mulher/homem, monstro/ameaça, pessoa/npc, item/equipamento, sangue/morte/energia/conhecimento. Todas as palavras têm que bater. Filtro por coleção.
- **Ameaças do bestiário:** as 44 que têm token na biblioteca guardam todas as formas em `creatures.token_variacoes` (ex.: Anfitrião 1–6, as 5 Degolificadas); a imagem vira a do bestiário, e criar a ameaça na mesa (aba Personagens ou combate) já traz todas como variações, prontas no botão direito → Variação de Token. As que já estavam nas mesas também receberam.
- **Itens do sistema:** 41 itens sem imagem (armas, granadas, Lanterna Tática, Celular, Mochila Militar, Capacete Tático…) ganharam a do pacote.
- Fundo branco dos JPG é tirado ao montar; rostos e partes de corpo ficam pro montador de tokens.
- **Atlas** (sem os mapas, que ficaram de fora por enquanto pelo tamanho): objetos, hospital, As Mãos que nos Acolhem, carros de Carga Mortal, criaturas, documentos das missões e itens amaldiçoados (Severum, Megrama, Coletora, Estimulante de Energia). Total da biblioteca: 695 imagens.
- **Famílias na busca:** procurar uma coisa acha as parentes ("espada" acha katana, sabre e montante; "pistola" acha as armas de fogo; "faca" acha punhal e machete; "granada" acha os explosivos; "mochila" acha as bolsas…).
- **Na ficha:** Editar item → Imagem → **Escolher da Biblioteca**. Já abre procurando o que o item é (Katana → todas as espadas), só com itens, e a imagem escolhida fica só naquele item do personagem. Item novo do catálogo já vem com a imagem base.

## D. Pendências da mesa (spec 9)
- Fora do escopo por enquanto: Paredes e Iluminação.
- Definir implementação técnica dos Efeitos Climáticos (12.5) e do áudio por link/upload (12.5, 12.12, 12.13).
- Aplicar os toggles de privacidade da ficha (5.8) na aba Personagens.
- Regras Extras (5.10): já implementada como aba da ficha; falta decidir se a mesa também a mostra.
