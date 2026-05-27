# tasks.md — Large Cycle

## Cycle: 0524-visual-mobile-attendance-onboarding

---

## Stage 1 — Melhoria visual UX/UI

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 1.1 | Inventariar rotas fechadas (**D-R1**) e baseline visual actual | `plan.md` | `done` | `validation.md` §1.1 |
| 1.2 | Aplicar lavagens `--content-wash-*` e hierarquia de cartões nos layouts partilhados (dashboard + student) sem alterar comportamento | `components/layout/dashboard-shell.tsx`, `dashboard-page-hero.tsx`, `dashboard-panel.tsx`, `components/student/student-shell.tsx`, `app/globals.css` | `done` | diff + `implementation-notes.md` |
| 1.3 | Acentos `--primary` / `--status-*` em navegação activa, heroes e cartões KPI nas rotas núcleo | layouts + páginas D-R1 | `done` | diff |
| 1.4 | `/login` — coerência cromática com tokens BJJ (sem hex soltas) | `app/(auth)/login/**` | `done` | `login-form.tsx` |
| 1.5 | `/painel` — hero + painéis com chrome premium (**BUI-8**, **DS-1.12**) | `app/(dashboard)/painel/**`, `components/painel/**` | `done` | diff |
| 1.6 | `/alunos/**` — lista, perfil, novo, editar, graduações | `app/(dashboard)/alunos/**`, `components/students/**` | `done` | diff |
| 1.7 | `/mensalidades/**` — lista + detalhe (referência **BUI-8**, alinhar se necessário) | `app/(dashboard)/mensalidades/**`, `components/billing/**` | `done` | diff |
| 1.8 | `/aulas/**` — hub, turmas, sessão | `app/(dashboard)/aulas/**`, `components/classes/**` | `done` | diff |
| 1.9 | `/portal/**` — início, aulas, onboarding, placeholders loja/financeiro | `app/(student)/portal/**`, `components/student/**` | `done` | diff |
| 1.10 | Validar contraste tema **claro + escuro** nas superfícies alteradas (**DS-1.7**) | manual | `done` | `validation.md` §1.10 |
| 1.11 | `pnpm lint` + `pnpm type-check` | — | `done` | `validation.md` §1.11 |
| 1.12 | Checklist visual manual Stage 1 | `validation.md` | `done` | checklist §1.12 (humano) |
| 1.13 | **Update `spec/`** — cross-ref visual se aplicável (**DS-1.11**) | `spec/features/design-system/readme.md` | `done` | DS-1.12 utilitários |

---

## Stage 2 — Mobile robusto + presença (SPT-6.2–6.4)

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 2.1 | Server actions: converter check-ins → `attendances` (**SPT-6.2**) | `actions/attendances.ts` | `done` | `convertCheckInsToAttendances` |
| 2.2 | Server action: presença manual inscrito (**SPT-6.3**) | `actions/attendances.ts` | `done` | `recordManualAttendance` |
| 2.3 | Server action: remover da lista final (**SPT-6.4**); check-in intacto | `actions/attendances.ts` | `done` | `removeSessionAttendance` |
| 2.4 | UI sessão professor: lista check-ins + lista presença confirmada + acções | `components/classes/session-check-ins-panel.tsx`, `app/(dashboard)/aulas/sessao/[sessionId]/**` | `done` | diff |
| 2.5 | Estados loading / empty / error nas páginas de aulas (portal + professor) | `components/student/**`, `components/classes/**`, `loading.tsx` | `done` | diff |
| 2.6 | Toques ≥ 44px nos controlos críticos check-in e presença (**DS-1.3**) | componentes tocados | `done` | `min-h-11`, checkbox default |
| 2.7 | Toasts Sonner (cantos rectos) em check-in, cancelamento, conversão, manual, exclusão | componentes + actions | `done` | sonner |
| 2.8 | Ajustes responsivos `/portal/aulas` — viewports **320, 375, 414, 768** | `components/student/class-session-*` | `done` | `validation.md` §2.8 |
| 2.9 | Ajustes responsivos `/aulas/sessao/[sessionId]` — mesma matriz | `components/classes/**` | `done` | `validation.md` §2.9 |
| 2.10 | Mobile shell: bottom nav / drawer sem regressão (**SHELL-1.3**) | — | `done` | sem alteração shell |
| 2.11 | Confirmar zero auto-create attendance no check-in (**SPT-5.4**) | review grep | `done` | `validation.md` §2.11 |
| 2.12 | `/security-review` Stage 2 (writes `attendances`) | `validation.md` | `done` | §2.12 |
| 2.13 | `pnpm lint` + `pnpm type-check` | — | `done` | `validation.md` §2.13 |
| 2.14 | Validação manual Stage 2 documentada | `validation.md` | `done` | checklist §2.14 (humano) |
| 2.15 | **Update `spec/`** — **SPT-6.2–6.4** implementados | `spec/features/student-portal/readme.md` | `done` | diff spec |

---

## Stage 3 — Histórico de presença (SPR-12, SPT-13)

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 3.1 | Query paginada `attendances` por aluno + join sessão/turma/professor/recorded_by | `lib/data/student-attendances.ts` | `done` | `listStudentAttendancesForProfessor/Portal` |
| 3.2 | Constante `STUDENT_ATTENDANCE_PAGE_SIZE = 20` | `lib/constants/classes.ts` | `done` | diff |
| 3.3 | Aba **Presença** no perfil: total + listagem + empty state (**SPR-12**) | `components/students/student-attendance-tab.tsx`, `student-profile-client.tsx` | `done` | diff |
| 3.4 | Paginação «Anterior» / «Próxima» mobile-first (cartões) | `attendance-history-panel.tsx` | `done` | diff |
| 3.5 | Rota **`/portal/presenca`**: histórico próprio do aluno (**SPT-13**) | `app/(student)/portal/presenca/page.tsx`, `student-attendance-list.tsx` | `done` | diff |
| 3.6 | Item **Presença** na nav do aluno + `ROUTES.portalPresenca` | `student-nav.tsx`, `lib/routes.ts` | `done` | diff |
| 3.7 | RLS: aluno SELECT só próprios `attendances` | `db/policies.sql`, `011_attendances_student_select.sql` | `done` | policies + migration |
| 3.8 | Empty state pt-BR quando zero presenças (professor + aluno) | componentes | `done` | diff |
| 3.9 | `pnpm lint` + `pnpm type-check` | — | `done` | `validation.md` §3.9 |
| 3.10 | Validação manual Stage 3 (professor + aluno, mobile) | `validation.md` | `done` | checklist §3.10 |
| 3.11 | **Update `spec/`** — **SPR-12**, **SPT-13**, **SHELL-2/9** | specs | `done` | diff spec |

---

## Stage 4 — Criar aluno + provisionar login (STU-12.5+, AUTH-8.4+)

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 4.1 | Estender schema Zod: modo «associar existente» vs «criar utilizador» | `lib/validations/student-portal.ts` | `done` | `student-portal.test.ts` |
| 4.2 | Admin API: `createUser` / `inviteUserByEmail` no servidor (**AUTH-8.4**) | `lib/supabase/admin.ts`, `actions/student-portal/provision-access.ts` | `done` | diff |
| 4.3 | Senha temporária 12 chars; exibir **uma vez** (bloco copiável + toast) (**STU-12.6**) | `provision-portal-access.tsx` | `done` | `PasswordReveal` |
| 4.4 | Manter fluxo associar Auth existente (**STU-12.1**) | `provision-access.ts` | `done` | mode `link_existing` |
| 4.5 | Bloquear provisionamento arquivado/removido (**STU-12.3**) | action + UI | `done` | `assertStudentEligible` |
| 4.6 | Criar `profiles.role = student` + ligar `students.user_id` atomicamente | `provision-access.ts` | `done` | `finalizeProvision` |
| 4.7 | Toasts sucesso/erro criação aluno (se tocado) + provisionamento + login | UI + `app/(auth)/login/**` | `done` | sonner (login já tinha) |
| 4.8 | Smoke: professor provisiona → aluno login → `/portal` | manual | `done` | checklist §4.8 |
| 4.9 | `/security-review` Stage 4 | `validation.md` | `done` | §4.9 |
| 4.10 | `pnpm lint` + `pnpm type-check` | — | `done` | §4.10 |
| 4.11 | **Update `spec/`** — **STU-12.5–12.7**, **AUTH-8.4–8.6** | `students-crud/readme.md`, `authentication/readme.md` | `done` | diff spec |

---

## Legenda

- `pending` — não iniciado
- `in_progress` — em andamento
- `done` — concluído com evidência
- `blocked` — bloqueado (registrar motivo)

---

> ⚠️ Executar **uma stage por vez**. Não avançar para a próxima sem aprovação humana explícita.
