# validation.md — 0524-visual-mobile-attendance-onboarding

> **Cycle fechado:** 2026-05-27 — ver `closing-summary.md`.

## Fechamento do cycle

| Item | Status |
|------|--------|
| Migration 011 aplicada | ✅ (2026-05-27, ambiente remoto) |
| Lint + type-check | ✅ |
| Build (`pnpm build`) | ✅ (2026-05-27) |
| Specs promovidas | ✅ |
| QA manual browser | ⚠️ checklists §1.12, §2.14, §3.10, §4.8 pendentes de sign-off |

---

## Stage 1 — Melhoria visual UX/UI

### 1.1 Inventário rotas D-R1

| Área | Rota | Componentes visuais | Status |
|------|------|---------------------|--------|
| Auth | `/login` | `login-form.tsx` | ✅ tokens |
| Shell | layout partilhado | `dashboard-shell`, `student-shell`, `shell-nav-link` | ✅ pré-existente + canvas wash |
| Painel | `/painel` | `painel-dashboard`, `painel/page` | ✅ |
| Alunos | `/alunos` | `alunos/page`, `students-list` | ✅ |
| Alunos | `/alunos/novo` | hero + panel (shared) | ✅ via shared |
| Alunos | `/alunos/[id]` | `student-profile-client` | ✅ alertas tokenizados |
| Alunos | `/alunos/[id]/editar` | alerta sem plano | ✅ |
| Alunos | `/alunos/[id]/graduacoes` | hero + panel (shared) | ✅ via shared |
| Mensalidades | `/mensalidades` | `mensalidades-client` | ✅ |
| Mensalidades | `/mensalidades/[studentId]` | `mensalidades-detail-client` | ✅ |
| Aulas | `/aulas` | hub sessões | ✅ |
| Aulas | `/aulas/turmas/*` | hero + panel (shared) | ✅ via shared |
| Aulas | `/aulas/sessao/[sessionId]` | `session-check-ins-panel` | ✅ |
| Portal | `/portal` | hero | ✅ via shared |
| Portal | `/portal/aulas` | `class-session-card` | ✅ |
| Portal | `/portal/onboarding` | hero + panel | ✅ |
| Portal | `/portal/loja`, `/portal/financeiro` | hero + empty/pix | ✅ |
| Portal | `indisponivel`, `bloqueado` | hero + empty | ✅ |

### 1.10 Contraste tema claro + escuro

| Superfície | Claro | Escuro | Notas |
|------------|-------|--------|-------|
| `dashboard-main-surface` | ✅ off-white + acento 3.5% | ✅ cinza escuro + acento 3.5% | tokens paritários |
| `dashboard-hero-badge` | ✅ primary sobre off-white | ✅ primary 50% sobre fundo escuro | legível |
| `DashboardPanel` header | ✅ muted/35 + primary icon | ✅ idem com tokens `.dark` | WCAG AA texto |
| KPI `--status-*` | ✅ foreground dedicado | ✅ foreground claro em `.dark` | badges existentes |
| Login card | ✅ card/95 sobre preto | N/A (auth layout fixo escuro) | contraste OK |

Validação por inspecção de tokens em `globals.css` `:root` e `.dark` — ambos os temas mantêm pares de foreground para status.

### 1.11 CI local

```
pnpm lint     → ✔ No ESLint warnings or errors
pnpm type-check → ✔ tsc --noEmit (exit 0)
```

### 1.12 Checklist visual manual (Stage 1)

> Implementação verificada por review de código + tokens. Sign-off browser recomendado antes do merge.

- [ ] `/login` — card sem branco puro; botão primary visível sobre layout escuro
- [ ] `/painel` — KPIs com lavagens verde/amarelo/vermelho via status; hero badge primary
- [ ] `/alunos` — lista com header chrome; stat tile com acento
- [ ] `/mensalidades` — painel financeiro verde via `--status-paid`
- [ ] `/aulas` — sessões com hover primary; check-ins com borda esquerda
- [ ] `/portal/aulas` — cards com acento; coerente com painel professor
- [ ] `/portal/onboarding` — hero + panel alinhados ao dashboard
- [ ] Tema escuro — alternar e rever painel + portal (sem regressão legibilidade)

### 1.13 Cenários Gherkin → evidências (Stage 1)

| Cenário | Evidência | Status |
|---------|-----------|--------|
| Núcleo operacional usa acentos BJJ em vez de excesso de branco | Layouts partilhados + rotas D-R1 em `validation.md` §1.1; tokens em `globals.css` | PASS (código) |
| Portal do aluno mantém coerência visual com o painel | `student-shell` + `class-session-card` + portal pages; mesmos componentes layout | PASS (código) |

### 1.14 Build

- Não executado nesta stage (fora do scope tasks 1.11).

---

## Stage 2 — Mobile robusto + presença (SPT-6.2–6.4)

### 2.11 SPT-5.4 — zero auto-create attendance no check-in

```
grep attendances insert em actions/student-portal → 0 matches
grep attendances em check-in.ts → 0 matches
```

Check-in (`createCheckIn`) insere **apenas** em `check_ins`. Únicos writes em `attendances` estão em `actions/attendances.ts` (professor).

### 2.12 Security review (writes `attendances`)

| Controlo | Evidência | Status |
|----------|-----------|--------|
| RLS professor-only | `attendances_operational_all` em `db/policies.sql` — role `professor` + `account_id` | PASS (existente) |
| Aluno sem write | `validate-rls.cjs` bloqueia INSERT student em attendances | PASS (existente) |
| Server-side role gate | `requireProfessor()` em todas as acções `actions/attendances.ts` | PASS |
| Validação inscrição (manual) | `student_class_enrollments` + `class_id` da sessão | PASS |
| Validação check-in ausente (manual) | rejeita se `check_ins` existe | PASS |
| Validação conversão | só alunos com check-in pendente (sem attendance) | PASS |
| Exclusão | delete só `attendances`; check-in intacto por design | PASS |
| `recorded_by` | sempre `ctx.profile.id` do professor autenticado | PASS |
| Revalidação cache | `routeAulasSessao` + `ROUTES.aulas` após mutações | PASS |

**Risco residual:** duplicata race — unique `(class_session_id, student_id)` no DB; erro mapeado para mensagem amigável.

### 2.13 CI local

```
pnpm lint       → ✔ (após fix imports loading.tsx)
pnpm type-check → ✔ tsc --noEmit (exit 0)
```

### 2.8–2.9 Responsividade (código)

| Viewport | Rota | Ajustes | Status |
|----------|------|---------|--------|
| 320–768 | `/portal/aulas` | `px-1`, cards `break-words`, botões `w-full sm:w-auto`, `min-h-11` | PASS (código) |
| 320–768 | `/aulas/sessao/[sessionId]` | secções empilhadas, listas flex-col→row, botões full-width mobile | PASS (código) |

### 2.14 Checklist manual Stage 2

> Sign-off browser recomendado (matriz D-R6: 320, 375, 414, 768 px).

- [ ] `/portal/aulas` — check-in/cancelamento com toast; sem scroll horizontal em 320px
- [ ] `/aulas/sessao/[sessionId]` — converter check-ins (seleccionados + todos)
- [ ] Presença manual — aluno inscrito sem check-in
- [ ] Remover presença — check-in permanece visível na lista de check-ins
- [ ] Toasts Sonner cantos rectos em todas as acções
- [ ] Bottom nav portal — sem regressão (**SHELL-1.3**)

### 2.15 Cenários Gherkin → evidências (Stage 2)

| Cenário | Evidência | Status |
|---------|-----------|--------|
| Viewports mobile legíveis | §2.8–2.9; `class-session-card`, `session-check-ins-panel` | PASS (código) |
| Professor converte check-ins | `convertCheckInsToAttendances` + UI | PASS (código) |
| Presença manual inscrito | `recordManualAttendance` + select UI | PASS (código) |
| Exclusão mantém check-in | `removeSessionAttendance` delete só attendances | PASS (código) |
| Check-in ≠ attendance auto | §2.11 grep | PASS |
| Toasts em acções principais | sonner em panel + `class-session-card` | PASS (código) |

---

## Stage 3 — Histórico de presença (SPR-12, SPT-13)

### 3.7 RLS aluno SELECT attendances

| Controlo | Evidência | Status |
|----------|-----------|--------|
| Política `attendances_student_select` | `db/policies.sql` + migration `011` | PASS (DDL) |
| Aluno sem INSERT/UPDATE/DELETE | política professor `FOR ALL` + student só SELECT | PASS |
| Professor lê attendances da conta | `attendances_operational_all` inalterada | PASS |

> Migration `011_attendances_student_select.sql` — **aplicada** em ambiente remoto (2026-05-27).

### 3.9 CI local

```
pnpm lint       → ✔ No ESLint warnings or errors
pnpm type-check → ✔ tsc --noEmit (exit 0)
```

### 3.10 Checklist manual Stage 3

> Sign-off browser recomendado (professor + aluno, mobile).

- [ ] `/alunos/[id]?tab=presenca` — total + listagem com campos D-R11
- [ ] Paginação «Anterior» / «Próxima» com >20 registos
- [ ] Empty state professor («Ainda não há presenças registadas»)
- [ ] `/portal/presenca` — histórico próprio do aluno
- [ ] Empty state aluno («Ainda não há aulas frequentadas registadas»)
- [ ] Nav bottom bar com item **Presença** (**SHELL-9.2**)
- [ ] Aluno não vê presenças de outros (RLS)

### 3.11 Cenários Gherkin → evidências (Stage 3)

| Cenário | Evidência | Status |
|---------|-----------|--------|
| Professor vê total + histórico no perfil | `StudentAttendanceTab` + `listStudentAttendancesForProfessor` | PASS (código) |
| Empty state sem presenças (professor) | `AttendanceHistoryPanel` | PASS (código) |
| Paginação mobile | `AttendanceHistoryPanel` botões `min-h-11` | PASS (código) |
| Aluno consulta `/portal/presenca` | `portal/presenca/page.tsx` | PASS (código) |
| Aluno empty state | mensagem SPT-13.4 | PASS (código) |
| Só attendances oficiais | query `.from('attendances')` | PASS (código) |

---

## Stage 4 — Criar aluno + provisionar login (STU-12.5+, AUTH-8.4+)

### 4.9 Security review (Admin API / provisionamento)

| Controlo | Evidência | Status |
|----------|-----------|--------|
| Service role só servidor | `lib/supabase/admin.ts` + `server-only` | PASS |
| Professor gate | `getCurrentAccount()` role professor | PASS |
| Aluno arquivado/removido bloqueado | `assertStudentEligible` | PASS |
| Unicidade auth → student | `assertAuthNotLinkedToOtherStudent` | PASS |
| Perfil operacional rejeitado | `ensureStudentProfile` role check | PASS |
| Senha temporária nunca persistida | retorno action → UI one-shot | PASS |
| Create/invite rejeita e-mail Auth existente | redirect para modo associar | PASS |

**Risco residual:** rollback parcial se `students.user_id` falhar após createUser — orphan Auth user; mitigação manual Supabase.

### 4.10 CI local

```
pnpm lint       → ✔
pnpm type-check → ✔
pnpm test lib/validations/student-portal.test.ts → ✔ 11 passed
```

### 4.8 Checklist smoke manual Stage 4

> Requer `SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_APP_URL` configurados.

- [ ] Professor: `/alunos/[id]` → tab Portal → modo **Convite por e-mail**
- [ ] Professor: modo **Criar com senha temporária** → bloco copiável → fechar → senha não reaparece
- [ ] Professor: modo **Associar Auth existente** (regressão STU-12.1)
- [ ] Aluno arquivado: provisionamento bloqueado
- [ ] Aluno provisionado: `/login` → redirect `/portal` + toast sucesso

### 4.11 Cenários Gherkin → evidências (Stage 4)

| Cenário | Evidência | Status |
|---------|-----------|--------|
| Professor cria acesso portal | 3 modos UI + action | PASS (código) |
| Senha temporária ou convite | `PasswordReveal` + `inviteAuthUserByEmail` | PASS (código) |
| Aluno provisionado login → portal | login-form + AUTH-8.1 (existente) | PASS (código) |
| Aluno arquivado bloqueado | UI + action | PASS (código) |
| Erros comunicados | toasts + fieldErrors | PASS (código) |
