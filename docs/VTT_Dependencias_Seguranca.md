# Dependências — decisões de segurança

Registro das vulnerabilidades que o `npm audit` aponta e do que foi decidido sobre cada uma,
para não refazer a mesma análise toda vez que o audit rodar.

---

## react-router / react-router-dom — 2 moderadas — **não atualizar (21/09/2026)**

`npm audit` acusa duas CVEs moderadas no `react-router`, que chegam pelo `react-router-dom`:

1. **Open redirect** por barra invertida em `<Link>` e `useNavigate` (bypass do CVE-2025-68470).
2. **Arbitrary Constructor Injection** no `deserializeErrors()` da hidratação SSR.

### Por que ficou como está

**A versão instalada, 6.30.6, já é a última da linha 6.x.** Não existe correção dentro da v6 —
o conserto só veio na **v7**, que é upgrade de major com quebra de API (`RouterProvider`, tipos,
data APIs). Ou seja: a escolha real não é "atualizar ou não", é "migrar de major ou não".

**Nenhuma das duas CVEs é alcançável neste app:**

- **Open redirect** só acontece quando o destino da navegação vem de entrada não confiável
  (ex.: um `?redirect=` na URL). Aqui **todo destino é literal fixo ou um UUID vindo do banco** —
  conferido um a um em `navigate(...)` e `<Link to=...>`. Não há nenhum ponto em que a pessoa
  escolha para onde navegar.
- **Hidratação SSR** não existe: o app é SPA pura, montada com `createRoot` em `src/main.tsx`.
  Não há `hydrateRoot`, `StaticRouter` nem `react-router/server`.

Então migrar para a v7 hoje seria trocar risco zero por risco real de quebrar as rotas, sem
ganho de segurança nenhum.

### O que muda essa decisão

Revisar **se** alguma dessas coisas passar a valer:

- alguma navegação passar a usar valor que vem da URL ou de texto digitado
  (`useSearchParams`, `location.search`, um `?next=`/`?redirect=`);
- o app deixar de ser SPA e ganhar SSR;
- sair uma correção na linha 6.x;
- o Arkanis deixar de ser fechado entre amigas e virar algo aberto na internet.
