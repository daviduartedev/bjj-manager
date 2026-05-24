# validation.md — Large Cycle

## Cycle: student-portal-auth

---

## Stage 1 — Infra de rotas e middleware
### Data: 2026-05-24

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm lint` | PASS | Sem warnings |
| `pnpm type-check` | PASS | — |
| `pnpm test` | PASS | 168 testes (incl. `lib/routes.test.ts` +4) |
| `pnpm build` | PASS | Rotas `/portal/*` no route table |

| Cenário | Evidência | Resultado |
|---|---|---|
| Anónimo não acede ao portal | middleware logic + build | PASS |
| Anónimo não acede a subrotas do portal | middleware logic + build | PASS |
| Professor autenticado não acede ao portal | middleware logic (fallback professor) | PASS |
| Professor autenticado não acede a subrotas do portal | middleware logic | PASS |
| Aluno autenticado não acede ao painel | middleware + schema | PASS (pós-schema) |
| Portal desligado por feature flag master | middleware + smoke humano | PASS |

**Falhas baseline:** nenhuma nova.

**Notas:** Isolamento student↔operacional implementado; smoke E2E com role `student` aguarda cycle de schema. Activar portal localmente: `NEXT_PUBLIC_STUDENT_PORTAL_ENABLED=true`.

---

## Stage 2 — Auth, vínculo e onboarding
### Data: 2026-05-24

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm lint` | PASS | — |
| `pnpm type-check` | PASS | — |
| `pnpm test` | PASS | 170 testes (+2 student-portal Zod) |
| `pnpm build` | PASS | `/portal/onboarding`, `/portal/bloqueado` |

| Cenário | Evidência | Resultado |
|---|---|---|
| Aluno faz login e é redirecionado para o portal | código + schema | PARTIAL (requer flag on + student provisionado) |
| Professor faz login e vai para o painel | código | PASS (implícito) |
| Professor provisiona acesso ao portal | tab Portal + action | PARTIAL (requer service role) |
| Provisionamento rejeita auth user duplicado | action | PASS (unit/lógica) |
| Aluno completa onboarding com termo | onboarding page + action | PARTIAL (requer flag on) |
| Menor exige e-mail responsável | Zod + form | PASS |
| Aluno arquivado/removido bloqueado | middleware | PASS (implícito) |
| Flag off mostra indisponível (não onboarding) | smoke humano 2026-05-24 | PASS |

**Falhas baseline:** nenhuma.

**Notas:** Schema cycle `0524-student-portal-schema` fechado — colunas disponíveis. Smoke E2E manual documentado em task 2.13. Activar: `NEXT_PUBLIC_STUDENT_PORTAL_ENABLED=true` + `SUPABASE_SERVICE_ROLE_KEY`.

---

## Stage 3 — Shell e placeholder PIX
### Data: 2026-05-24

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm lint` | PASS | — |
| `pnpm type-check` | PASS | — |
| `pnpm test` | PASS | 170 testes |
| `pnpm build` | PASS | `/portal/financeiro` 1.84 kB |

| Cenário | Evidência | Resultado |
|---|---|---|
| Aluno vê shell com navegação principal | `StudentShell` + `STUDENT_NAV_ITEMS` + home saudação | PASS (estrutural) |
| Placeholder aulas / loja | `EmptyState` "Em breve" Fase 2/3 | PASS (estrutural) |
| Layout PIX com aviso Em breve | `PixPlaceholder` + badge | PASS (estrutural) |
| Planos pedagógicos não aparecem no portal | páginas sem imports pedagógicos | PASS |
| Navegação responsiva mobile | bottom nav + drawer (mesmo padrão dashboard) | PASS (estrutural) |

**Falhas baseline:** nenhuma.

**Notas:** Smoke manual completo requer `NEXT_PUBLIC_STUDENT_PORTAL_ENABLED=true` + aluno provisionado com onboarding concluído. Flag PIX: `NEXT_PUBLIC_STUDENT_PORTAL_PAYMENTS_PIX` controla acções desactivadas (default off).

---

## Conclusão geral

- [x] Todas as stages concluídas com evidência
- [x] Cenários independentes de DB verdes
- [x] Cenários dependentes de DB verdes **ou** documentados como PARTIAL com env identificado
- [x] Lint, typecheck e build passando em todas as stages
- [ ] `/security-review` executado na Stage 3 (pendente — ressalva no closing summary)
- [x] Pronto para `/close-cycle` (spec promotion via `/update-spec` pendente)
