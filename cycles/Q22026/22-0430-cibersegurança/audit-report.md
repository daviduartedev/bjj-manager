# Relatório curto de auditoria — ciclo 22-0430-cibersegurança

**Estado:** concluído na implementação da suíte **SECE2E-** (Playwright + CI).

## Resumo executivo

- **Alcance da automação:** rotas privadas (redirect + ausência de marcadores de tenant em HTML), rotas públicas e legado (`/`, `/login`, `/register`, `/dashboard`), logout, login inválido sem vazamento de padrões **SECE2E-6**, IDOR em `/alunos/[id]` e `/mensalidades/[studentId]` (quando existe aluno `RLS-V-B`), RLS via cliente Supabase com JWT do utilizador A, cookies `sb-*` com `HttpOnly`, tentativa XSS no nome do novo aluno, anotação CSRF para revisão manual. Testes `@exploratory` (rate limit) **não** bloqueiam o pipeline.
- **Ambiente verificado localmente:** `pnpm test:e2e` com `CI=true` — **9 passed**, **8 skipped** (credenciais E2E / `studentIdB` ausentes ou placeholder API).
- **Commit / PR:** citar **SECE2E-**, **SPEC-11.3**, ficheiros em `e2e/`, `playwright.config.ts`, `.github/workflows/e2e-security.yml`, `scripts/validate-rls.cjs`.

## Riscos identificados

| Risco | Severidade | Evidência | Mitigação recomendada |
|-------|------------|-----------|------------------------|
| Middleware sem Supabase em `.env` não protege rotas | Alta | `lib/supabase/middleware.ts` faz no-op | Garantir sempre `NEXT_PUBLIC_SUPABASE_*` em CI e `.env.test`; não executar E2E sem estas variáveis. |
| Ausência de Route Handlers | Média | zero `app/api/**` | Ao introduzir APIs REST, aplicar **SECE2E-3** e testes por endpoint. |
| Cabeçalhos de segurança não endurecidos | Média | `next.config.mjs` sem CSP/HSTS/etc. | Adicionar headers em `next.config` ou reverse proxy; rever **SECE2E-1.5**. |
| `JWT` completo em HTML | Baixa (falso positivo) | Bundles Next em dev | `assertNoJwtShapeInBody` não é aplicado ao HTML completo de página por decisão implementada. |

## Lacunas (vs especificação)

- Mass assignment: **fechado** no ciclo seguinte com Zod **`.strict()`** nos schemas de `students`, `billing` e `settings`, mais testes Vitest (`lib/validations/*.test.ts`) — ver **SECE2E-3.5**.
- CSRF: coberto por anotação + checklist manual (**Next.js Server Actions**).
- Auditoria completa PostgREST Supabase: fora de âmbito salvo teste pontual **RLS REST** já incluído.
- Graduações em `/alunos/[id]/graduacoes`: mencionado em **SHELL-2** mas rota ausente no código — alinhado em [`spec/features/security-e2e/route-inventory.md`](../../../spec/features/security-e2e/route-inventory.md).

## Recomendações

1. Configurar secrets no GitHub (`E2E_DATABASE_URL`, `E2E_SUPABASE_*`, `E2E_USER_*`) no projeto Supabase de **teste**; alinhar senhas A/B com `VALIDATION_TEST_PASSWORD` / `E2E_USER_A_PASSWORD` como no workflow.
2. Após cada alteração de rotas ou middleware, actualizar [`route-inventory.md`](../../../spec/features/security-e2e/route-inventory.md).
3. Introduzir headers de segurança mínimos (por exemplo `X-Content-Type-Options`, `Referrer-Policy`, política de framing) e voltar a subir expectativas nos testes.

## Conclusão

- **Pronto para merge:** depende de secrets configurados no repositório e de utilizadores de teste com alunos `RLS-V-A` / `RLS-V-B` criados por `pnpm db:validate-rls`.
- Critérios **SECE2E-7.2:** falhas em IDOR / bypass / vazamento nos testes bloqueantes devem impedir merge.
