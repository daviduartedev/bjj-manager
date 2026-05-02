# Tasks — Cibersegurança (E2E/API)

Marcar `[ ]` → `[x]` conforme conclusão. Ordem sugerida respeita dependências.

## Specs canónicas (obrigatório)

- [x] Ler `plan.md` e `scenarios.feature` deste ciclo.
- [x] Garantir que **`spec/features/security-e2e/readme.md`** (**SECE2E-**) está completo e alinhado ao comportamento implementado.
- [x] Atualizar **`spec/README.md`** (feature + convenção **SECE2E-**).
- [x] Acrescentar referências **SECE2E-** em **`spec/features/authentication/readme.md`** e **`spec/features/rls-security/readme.md`** (secção “Relação com outras specs”).
- [x] Opcional: nota breve em **`spec/features/app-shell/readme.md`** sobre inventário de rotas para testes (`/`, `/login`, `/register`, dinâmicas).

## Inventário e baseline

- [x] Mapear todas as rotas `app/**/page.tsx` e segmentos dinâmicos; classificar (pública, privada, dinâmica privada, legado, API futura).
- [x] Confirmar ausência ou lista de **`app/api/**/route.ts`**; se vazio, documentar em **SECE2E-** que a superfície “API” é Server Actions + páginas.
- [x] Documentar no relatório qualquer discrepância entre inventário e **SHELL-2** / `lib/routes.ts`.

## Playwright e ambiente

- [x] Adicionar Playwright como devDependency; criar `playwright.config.ts` (projeto separado do Vitest).
- [x] Scripts em `package.json`: ex. `test:e2e`, `test:e2e:ui` (opcional), sem remover `test` (Vitest).
- [x] Criar `.env.test.example` com `E2E_USER_A_EMAIL`, `E2E_USER_A_PASSWORD`, `E2E_USER_B_EMAIL`, `E2E_USER_B_PASSWORD`, `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`, `E2E_SUPABASE_SERVICE_ROLE_KEY` (+ URLs da app se necessário).
- [x] Documentar que **CI/execução padrão** não usa `.env.local` de desenvolvimento (`.env.test.example` + **SECE2E-2**).
- [x] Seed SQL dedicado + utilizadores A e B no projeto Supabase de teste; helpers/fixtures para dados por teste e teardown seguro. *(Ver `pnpm db:validate-rls` + `db/e2e-seed-notes.md` + `e2e/global-setup.ts`.)*

## Suíte bloqueante (merge)

- [x] Páginas privadas (**SHELL-2** + lista acordada): sem sessão, sessão inválida, após logout → redirect **`/login`**; sem flash nem dado de negócio no HTML inicial nem após estabilização.
- [x] `/`, `/login`, `/register` (redirect esperado), `/dashboard` → `/painel`.
- [x] IDOR: utilizador A não lê/edita/apaga/lista dados da conta B (UI + Server Actions + URLs dinâmicas, ex. `/alunos/[id]`, `/mensalidades/[studentId]`). *(Requer `studentIdB` resolvido após `db:validate-rls`.)*
- [x] Payloads inválidos / campos proibidos / mass assignment: rejeição segura sem 500 indevido e sem vazamento. *(Login inválido + verificação de vazamento; mass assignment documentado como lacuna parcial.)*
- [x] Assertivas de **não vazamento** (lista **SECE2E-6**) em respostas e corpo de página em cenários de erro.

## Suíte complementar

- [x] XSS: entradas maliciosas em campos de formulário seleccionados (refletido/armazenado conforme superfície real). *(Nome em novo aluno.)*
- [x] CSRF / sessão cookie: cenários para acções sensíveis, conforme modelo Next + Supabase SSR (documentar limitações na checklist manual).
- [x] Cabeçalhos de segurança básicos nas respostas relevantes (documentar baseline esperado em **SECE2E-**).
- [x] Cookies de sessão: `HttpOnly`, `Secure` em produção, `SameSite` coerente (onde aplicável ao stack).
- [x] Rate limiting: teste exploratório marcado como não bloqueante se não houver implementação clara. *(Tag `@exploratory`; excluído do `grep` por defeito.)*

## Route Handlers (quando existirem)

- [x] Para cada `app/api/**`: não autenticado → **401**; sem permissão → **403** ou **404**; recurso inexistente → **404**; método inválido → **405** quando aplicável; payload inválido → **400** ou **422**; sem HTML de erro verboso nem redirect “silencioso” substituindo 401/403 em API privada (salvo documentado). *(Placeholder skip até existirem handlers.)*

## Supabase / RLS

- [x] Se front usar cliente Supabase com JWT: testes adicionais que **RLS** impede leitura/escrita cruzada (camada extra, sem auditoria completa REST genérica).
- [x] CI: executar **`pnpm db:validate-rls`** com variáveis apontando ao projeto de teste; se variáveis do script divergirem de `E2E_*`, documentar ou refactorizar o script num ciclo de seguimento. *(Script aceita `E2E_*` como fallback.)*

## CI (GitHub Actions)

- [x] Workflow em `.github/workflows/` para PR + `workflow_dispatch`; secrets `E2E_*` (+ `DATABASE_URL` / chaves que `validate-rls` exige).
- [x] Jobs: instalar deps, Playwright browsers cache, `test:e2e` (bloqueante), `db:validate-rls` (bloqueante se existir).
- [x] Marcar jobs exploratórios/flaky como não obrigatórios até estabilização (**SECE2E-7**).

## Entregáveis finais do ciclo

- [x] Preencher **`audit-report.md`** (riscos, lacunas, recomendações).
- [x] Completar **`manual-checklist.md`** com itens não cobertos por automação.
- [x] Referenciar em commit/PR os IDs **SECE2E-** tocados.
