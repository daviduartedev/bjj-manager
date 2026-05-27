# implementation-notes.md — Stage 4

## Decisões técnicas

### Validação (`lib/validations/student-portal.ts`)
- `provisionPortalAccessSchema` como **discriminated union** por `mode`: `link_existing`, `create_invite`, `create_password`.

### Admin API (`lib/supabase/admin.ts`)
- `createAuthUserWithPassword`, `inviteAuthUserByEmail`, `generateTemporaryPassword` (12 chars, charset sem ambíguos).
- `findAuthUserIdByEmail` passa a receber `admin` explícito.
- Convite usa `NEXT_PUBLIC_APP_URL/login` como `redirectTo`.

### Action (`provision-access.ts`)
- `finalizeProvision`: profile student + `students.user_id` em sequência (**STU-12.6**).
- Create modes rejeitam e-mail já existente no Auth (orienta para associar).
- Resultado tipado: `{ outcome: linked | invited | password_created }`.

### UI (`provision-portal-access.tsx`)
- Select de modo; e-mail pré-preenchido do cadastro do aluno.
- `PasswordReveal` dismissível — senha não persiste após fechar (**STU-12.6**).

## Desvios do plano
- Nenhum.

## Tech debt
- Rollback automático de Auth user se link falhar — não implementado (MVP).
- Smoke §4.8 pendente sign-off humano (recomendado pós-deploy).

## Rollback
- Reverter action + UI + admin helpers; utilizadores Auth criados permanecem no Supabase.

---

# implementation-notes.md — Stage 3

## Decisões técnicas

### Data layer (`lib/data/student-attendances.ts`)
- Duas entradas: `listStudentAttendancesForProfessor(studentId, page)` e `listStudentAttendancesForPortal(page)`.
- Paginação server-side com `{ count: 'exact' }` e `.range()`; page size **20** em `lib/constants/classes.ts`.
- Ordenação: `session_date` / `start_time` (foreignTable) + `recorded_at` DESC (**D-R11**).
- Joins: sessão → turma → instrutor; `recorded_by` → `display_name`.

### UI partilhada
- `AttendanceHistoryPanel` — cartões mobile-first, total, paginação via Link (`?tab=presenca&page=N` no perfil).
- Professor: aba **Presença** em `student-profile-client.tsx`; `defaultTab` via `searchParams.tab`.
- Portal: `/portal/presenca` com flags alinhadas a `/portal/aulas`.

### RLS
- Nova política `attendances_student_select` — aluno SELECT só `student_id = current_student_id()`.
- Migration forward-only `011_attendances_student_select.sql`.

### Spec
- SPR-12, SPT-13, SHELL-9.2 marcados implementados nos readmes.

## Desvios do plano
- Nenhum.

## Tech debt
- Migration 011 aplicada em ambiente remoto (2026-05-27).
- Checklist browser §3.10 pendente de sign-off humano.

## Rollback
- Reverter UI + data layer; remover política student SELECT se necessário; dados attendances intactos.

---

# implementation-notes.md — Stage 2

## Decisões técnicas

### Server actions (`actions/attendances.ts`)
- Três acções separadas alinhadas a **SPT-6.2**, **6.3**, **6.4** com validação Zod em `lib/validations/attendances.ts`.
- `requireProfessor()` + RLS existente — sem Admin API.
- Conversão: filtra check-ins sem attendance; `studentIds` opcional (vazio = todos pendentes).
- Manual: exige inscrição na turma da sessão **e** ausência de check-in (**SPT-6.3**).
- Exclusão: delete em `attendances` apenas; check-ins intocados (**SPT-6.4**).

### Data layer
- `listSessionPresence` em `lib/data/class-session-check-ins.ts` — uma query paralela para check-ins, attendances e enrollments; deriva `manualEligible` (inscrito, sem check-in, sem attendance).
- `SessionCheckInRow.hasAttendance` para UI de selecção/conversão.

### UI professor (`session-check-ins-panel.tsx`)
- Três secções: check-ins (checkbox + confirmar), presença confirmada (remover), manual (select).
- Polling 30s mantido (**SPT-6.1**); toasts Sonner (**D-R7**, **DS-1.8**).
- Touch targets `min-h-11` e checkbox `size-11` default (**DS-1.3**).

### Mobile portal
- `class-session-card`: botões full-width em mobile; `break-words` no título.
- `loading.tsx` para `/portal/aulas` e `/aulas/sessao/[sessionId]`.

### Spec
- `spec/features/student-portal/readme.md` — nota SPT-6.2–6.4 marcada como implementada.

## Desvios do plano
- Nenhum desvio funcional.

## Tech debt
- Checklist browser §2.14 pendente de sign-off humano.
- Testes automatizados para `actions/attendances.ts` — candidato a cycle futuro (D-R8: validação manual nesta stage).

## Rollback
- Reverter `actions/attendances.ts`, validações, panel e data layer; dados em `attendances` criados permanecem (sem migration).

---

# implementation-notes.md — Stage 1

## Decisões técnicas

### Abordagem (D-R2)
- **Leverage máximo nos layouts partilhados** (`DashboardPageHero`, `DashboardPanel`, `DashboardStatTile`, `EmptyState`, `globals.css`) para propagar chrome premium a todas as rotas D-R1 sem polir cada formulário.
- **Tokens sem hex soltas:** acentos via `--primary`, `--status-*`, `--content-wash-*`; removido `bg-white` do login; substituídos `amber-*` / `emerald-*` / `rose-*` por tokens de status nas rotas tocadas.

### globals.css
- Novo token `--content-wash-start` (claro + escuro).
- Gradiente `dashboard-main-surface` enriquecido com acento `--content-wash-accent` a ~52%.
- Classes utilitárias: `.dashboard-hero-badge`, `.dashboard-kpi-card--*`, `.dashboard-empty-state`.
- `dashboard-top-bar` com sombra sutil primary.

### Componentes partilhados
- **DashboardPageHero:** badge tokenizado; linha de acento gradiente no rodapé.
- **DashboardPanel:** borda esquerda primary; header com lavagem; ícone com tint primary.
- **DashboardStatTile:** prop `accent` (`default | primary | paid | pending | overdue | info`).
- **EmptyState:** lavagem `--status-info` no container e ícone.

### Páginas tocadas directamente
- `/login` — card com `bg-card/95` em vez de branco puro.
- `/painel` — KPIs com classes `dashboard-kpi-card--*`; aside hero com primary.
- `/alunos/**` — lista com chrome alinhado ao panel; stat tile `accent="primary"`; alertas pending tokenizados.
- `/mensalidades/**` — painel financeiro e labels «Sem plano» com `--status-*`.
- `/aulas/**` — hover de sessões e lista check-ins com acento primary.
- `/portal/**` — onboarding com hero+panel; indisponível/bloqueado com EmptyState; cards aulas/PIX com borda primary.

### Fora de alteração intencional
- Sidebar/drawer/bottom nav: `bg-white/[0.06]` sobre fundo `#050505` é glass intencional (**BUI-8**), não «excesso de branco».
- Formulários internos (campos, dialogs de billing) — mínimo necessário (**D-R2**).

## Desvios do plano
- Nenhum desvio funcional; escopo visual mantido na lista fechada D-R1.

## Tech debt identificado
- Dialogs de billing (`post-payment-summary.tsx`, `receipt-viewer-dialog.tsx`) mantêm classes `amber-*` / `emerald-*` — candidatos a migração para `--status-*` num ciclo futuro (fora D-R2).
- Checklist visual browser (§1.12) pendente de sign-off humano com screenshots.

## Rollback / mitigação
- Alterações são exclusivamente CSS/componentes de apresentação; rollback = revert do diff Stage 1 sem impacto em dados ou RLS.
- Layouts partilhados centralizam o risco — reverter `globals.css` + `components/layout/*` restaura baseline visual anterior em cascata.
