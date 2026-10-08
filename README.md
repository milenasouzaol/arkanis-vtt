<div align="center">

# ✦ Arkanis

**Mesa virtual e ficha de personagem para _Ordem Paranormal RPG_, feita para jogar com os amigos.**

Ficha completa, criação de personagem guiada e uma mesa de jogo inteira no navegador:<br>
mapas, tokens, combate, chat com rolagens, sons, clima e calendário, tudo em tempo real.

![React](https://img.shields.io/badge/React_19-20232a?style=for-the-badge&logo=react&logoColor=61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646cff?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-1c1c1c?style=for-the-badge&logo=supabase&logoColor=3ecf8e)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6e9f18?style=for-the-badge&logo=vitest&logoColor=white)

</div>

---

## 📖 Sobre

O **Arkanis** nasceu para que o grupo pudesse jogar _Ordem Paranormal_ sem depender de várias ferramentas soltas: a ficha calcula as regras sozinha, a mesa mostra o mapa e os tokens para todo mundo ao mesmo tempo e o mestre controla o que cada jogador vê.

É um site fechado: só entra quem tem o acesso aprovado.

<table>
<tr>
<td align="center"><b>631+</b><br><sub>commits</sub></td>
<td align="center"><b>155</b><br><sub>migrations no banco</sub></td>
<td align="center"><b>546</b><br><sub>testes automatizados</sub></td>
<td align="center"><b>695</b><br><sub>tokens e imagens na biblioteca</sub></td>
</tr>
</table>

---

## ✨ O que dá pra fazer

### 🧾 Ficha de personagem
- **Criação guiada** em etapas: atributos, origem (com perícias e poder da origem indo direto pra ficha) e classe.
- Abas **Agente, Combate, Habilidades, Rituais, Inventário, Investigação, Afinidade, Progressão, Interlúdio e Regras Extras**.
- **Regras automáticas:** Defesa, Esquiva e Bloqueio calculados com itens, maldições, modificações e poderes (como _Reflexos Defensivos_); carga com bônus de mochila; penalidade de proteção pesada.
- **Condições que mexem na ficha sozinhas** (Abalado, Apavorado, Fraco, Cego…), tirando dados dos testes certos e alterando a Defesa.
- **Personalizados de verdade:** condições, maldições e modificações criadas na mão, escolhendo o que mexem (Defesa, uma perícia, testes de resistência, dano…), em valor ou em dados, e se só valem quando ligadas.
- **De onde vem cada bônus:** passar o mouse no bônus mostra a origem (_Item tal_, _Poder tal_, _Condição tal_).
- Itens com tipo, modificações e maldições do catálogo, munição, ataques e rituais com custo calculado.
- **Dados 3D**, histórico de rolagens e modo de edição/modo de jogo.

### 🗺️ Mesa de jogo
- **Cenas e mapas** com pastas (arrastar e soltar), grade configurável, escuridão, luz e visibilidade por jogador ("quem pode ver").
- **Tokens** com variações, luz própria, configuração e propriedade: o mestre pode dar uma ficha para um jogador como dono.
- **Biblioteca de tokens** com busca por nome, código ou família (espada → katanas), usada nos tokens, objetos e itens.
- **Combate** com iniciativa automática, turnos, e o **sistema de mira**: ataque, dano e cura com reações do alvo (esquivar, bloquear, contra-atacar).
- **Chat** com rolagens, imagens, GIFs e ações clicáveis.
- **Itens no mapa:** o mestre transforma um objeto em item e os jogadores coletam direto pro inventário.
- **Diário**, **lista de reprodução** com sons e músicas, **desenhos** e efeitos no palco.
- **Clima e atmosfera:** chuva com cor ajustável (chuva de sangue), fumaça, filtro de iluminação colorido.
- **Tempo e calendário:** relógio e calendário próprios ou tradicionais, estações com cores, fases da lua, clima do dia e anotações por dia.

### 🏰 Campanhas e conta
- Criar, **editar** (nome, descrição, capa e cor) e **excluir** campanhas.
- Entrar com uma ficha ou **sem ficha**, e o mestre entrega uma depois.
- Bestiário com as ameaças do sistema e suas formas, campanha pronta de exemplo.
- Perfil com foto, banner e cores.
- **Recorte de imagem** em todo envio: arrastar, dar zoom, escolher o formato ou usar a imagem inteira, sem perder qualidade.
- Aviso de **versão nova** do site com botão de atualizar.

---

## 🛠️ Tecnologias

| Camada | O que usa |
|---|---|
| **Interface** | React 19, TypeScript, Vite, React Router, Font Awesome |
| **Dados 3D** | `@3d-dice/dice-box-threejs` |
| **Back-end** | Supabase: Postgres, Row Level Security, funções RPC, Realtime e Storage |
| **Hospedagem** | Vercel |
| **Qualidade** | Vitest, Testing Library, oxlint |

### Como é montado
- **Tudo em tempo real:** chat, tokens, combate e cenas sincronizam pelo Realtime do Supabase.
- **Segurança no banco:** cada tabela tem regras de acesso (RLS). Só aprovados entram, só quem controla a ficha mexe nela, e o jogador nunca vê o que é só do mestre (como a DT dos testes).
- **Regras como funções puras e testadas:** Defesa, condições, dano, recorte de imagem, calendário… cada conta tem seu arquivo e seus testes.

---

## 🚀 Rodando localmente

```bash
cd app
npm install
cp .env.example .env   # preencha com as chaves do seu projeto Supabase
npm run dev
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o site em `http://localhost:5173` |
| `npm test` | Roda os testes |
| `npm run build` | Checa os tipos e gera a versão de produção |
| `npm run lint` | Procura problemas no código |

Variáveis do `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e, para os GIFs do chat, `VITE_GIPHY_API_KEY`.

---

## 📁 Estrutura

```
app/
├── src/
│   ├── pages/
│   │   ├── CharacterCreate/   criação de personagem em etapas
│   │   ├── CharacterSheet/    ficha e as regras (defesa, condições, itens…)
│   │   └── Mesa/              mesa de jogo: cenas, tokens, combate, chat…
│   ├── components/            peças compartilhadas (recorte de imagem, aviso de versão…)
│   └── lib/                   Supabase, regras, sons, rolagens
├── public/                    biblioteca de tokens, sons, texturas dos dados
└── supabase/migrations/       o banco inteiro, migration por migration
docs/                          especificação, mesa e conteúdo do sistema
```

---

<div align="center">

Feito com carinho por **Millie** para as sessões com os amigos. 🎲

<sub>Projeto de fã, sem fins lucrativos. <i>Ordem Paranormal RPG</i> pertence aos seus criadores; o Arkanis não tem ligação oficial com eles.</sub>

</div>
