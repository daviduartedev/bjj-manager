# Plano do ciclo — Cibersegurança (E2E/API) + specs

**Ciclo:** `22-0430-cibersegurança`  
**Tipo:** delta sobre specs canónicas existentes (**AUTH-**, **SEC-**, **SHELL-**, **SPEC-11.x**).

## Decisões do produto (consolidado)

- Escopo além de rotas privadas, APIs, IDOR e payloads inválidos: **XSS** (refletido e armazenado em formulários), **CSRF** em ações sensíveis com sessão por cookie, **cabeçalhos de segurança**, **mass assignment**, **vazamento de dados sensíveis**, **validação de cookies de sessão**, **rate limiting** só como verificação exploratória se não houver implementação clara.
- Entregáveis: testes automatizados (Playwright + camadas API acordadas), **specs atualizadas**, **relatório curto** (riscos, lacunas, recomendações), **checklist manual** do que não foi automatizado.
- Ferramentas: **Playwright** para E2E/API HTTP; **Vitest** permanece para unit/integration.
- Ambiente: projeto Supabase **dedicado** a testes/staging; credenciais **`E2E_*`** (nunca `.env.local` por defeito em CI); seed SQL + utilizadores A/B fixos + fixtures/teardown quando seguro.
- Contratos: páginas privadas sem sessão → **redirect para `/login`**; Route Handlers privados → **401 / 403 / 404 / 405 / 400|422** conforme caso; **500 em entrada inválida é bug**; HTML/redirect em API privada é comportamento a corrigir salvo excepção documentada; Server Actions não podem vazar dados nem permitir acção indevida.
- Flash / SSR: critério **estrito** para HTML inicial e dados sensíveis; **pragmático** pós-navegação estável; falha se dado privado for observável antes do redirect.
- CI: **GitHub Actions** em **PR** + **`workflow_dispatch`**; nightly opcional mais tarde. Falhas de **IDOR**, **auth bypass** ou **vazamento sensível** são **bloqueantes**; cenários exploratórios/flaky marcados como não bloqueantes até estabilizar.
- RLS: executar **`pnpm db:validate-rls`** no pipeline **se** o comando existir (já existe); **não** inventar validação RLS superficial se faltar ferramenta — documentar lacuna.

## Estado actual do código (inspecção)

| Área | Observação |
|------|------------|
| Route Handlers | **Nenhum** `app/api/**/route.ts` no repositório; superfície HTTP “API” prevista é sobretudo **Server Actions** (`actions/*.ts`, `app/(dashboard)/actions.ts`) e navegação de páginas. |
| Middleware | `middleware.ts` delega a `updateSession`; **não** corre em `api/*` (matcher exclui `api`). Quando existirem Route Handlers, devem aplicar-se os mesmos princípios **SECE2E-4** ou o matcher deve ser revisto. |
| Rotas | Constantes em `lib/routes.ts`; área autenticada: `/painel`, `/alunos`, `/mensalidades`, `/configuracoes`, `/perfil`; legado `/dashboard` → `/painel`; `/register` → `/login` (307). Detalhe mensalidades: **`/mensalidades/[studentId]`** (não `[id]` genérico). |
| Validação RLS | `pnpm db:validate-rls` existe (`scripts/validate-rls.cjs`); hoje lê `.env.local` / `.env` — o ciclo deve alinhar **CI** com variáveis de teste (ver **SECE2E-3**). |

## Delta na especificação (o que muda)

1. Nova feature canónica **`spec/features/security-e2e/readme.md`** com prefixo **SECE2E-**: escopo de verificação automatizada, prioridade de camadas HTTP, variáveis de ambiente, critérios de merge e relação com **AUTH-**, **SEC-**, **SHELL-**.
2. **`spec/README.md`**: entrada na tabela “Features rastreadas” e linha na convenção de IDs (**SECE2E-**).
3. Referências cruzadas ligeiras em **`spec/features/authentication/readme.md`** e **`spec/features/rls-security/readme.md`** para **SECE2E-** (sem duplicar regras).
4. Opcional mínimo em **`spec/features/app-shell/readme.md`**: nota de que o inventário de rotas para testes inclui **`/`**, **`/login`**, **`/register`** e mapeamento dinâmico (`/alunos/[id]`, etc.) alinhado a **SHELL-2**.

## Ordem de implementação sugerida

1. Configurar Playwright (`playwright.config.ts`, script `pnpm test:e2e`, `.env.test.example` com `E2E_*`).
2. Inventário versionado de rotas (gerado ou mantido em doc sob `spec/` ou `docs/security/`) + classificação pública/privada/API.
3. Helpers: login A/B, fixture de aluno por conta, asserts de leak (lista de padrões acordada).
4. Suíte bloqueante: auth em páginas, IDOR (UI + actions), respostas sem vazamento.
5. Camadas adicionais: headers, CSRF (se aplicável), XSS em campos escolhidos, mass assignment.
6. Integração CI + `db:validate-rls` com secrets.
7. Relatório + checklist manual no folder do ciclo.

## Riscos e dependências

- **Server Actions** não são Route Handlers: testes “API” podem precisar de **request interception** ou chamadas POST ao endpoint interno do Next; validar abordagem estável na versão Next 15 do projeto.
- **CSRF**: Next.js + Server Actions tem modelo próprio; testes devem reflectir **comportamento real** e documentar gaps na checklist manual se não for reproduzível via browser automation alone.
- **validate-rls** usa emails fixos no script (`maikon@...`, `rls-validation-b@...`) — alinhar com **E2E_USER_*** ou documentar duplicação temporária até refactor do script.

## Artefactos deste ciclo (ficheiros)

| Ficheiro | Função |
|----------|--------|
| `plan.md` | Este delta |
| `tasks.md` | Checklist executável |
| `scenarios.feature` | Critérios Gherkin (nível negócio) |
| `manual-checklist.md` | Checklist humana (não automatizada) |
| `audit-report.md` | Relatório curto (preencher após execução dos testes) |
