# spec-delta.md — Large Cycle

## Cycle: 0524-student-portal-classes-checkin
## Status: PROMOVIDO (2026-05-24)

> ⚠️ Este arquivo é uma PROPOSTA. Só é promovido para `spec/` via `/update-spec` após todas as stages validadas.

---

## Specs afetadas

### `spec/features/supabase-schema/readme.md`

**Seção:** Tabelas portal Fase 2

**Mudança proposta:**

```diff
+| **Portal Fase 2** | |
+| `classes` | Turma: `account_id`, `name`, `kind` (`student_kind`), `instructor_profile_id` → `profiles` |
+| `class_recurring_schedules` | Recorrência semanal: `class_id`, `day_of_week` (ISO 1–7), `start_time`, `end_time`, `account_id` |
+| `class_sessions` | Instância: `class_id`, `session_date`, `start_time`, `end_time`, `capacity` nullable, `account_id` |
+| `student_class_enrollments` | N:N `students` ↔ `classes`; unique `(student_id, class_id)` |
+| `check_ins` | Intenção pré-aula: `class_session_id`, `student_id`, `created_at`, `account_id`; unique `(class_session_id, student_id)` |
+| `attendances` | Presença oficial (preparatória Fase 2): `class_session_id`, `student_id`, `recorded_at`, `recorded_by`, `origin` (`checkin_student` \| `manual_instructor`), `account_id` |
+| Enum | `attendance_origin` |
```

**Motivo:** Concretizar **SPT-10** e modelo preliminar do ROADMAP.

---

### `spec/features/rls-security/readme.md`

**Seção:** SEC-3.7 — implementação Fase 2

**Mudança proposta:**

```diff
-> DDL e políticas concretas entram nos cycles `student-portal-auth` (Fase 1) e seguintes. Até lá, **SEC-3.1–3.6** cobrem o schema actual.
+> **Fase 2 (`0524-student-portal-classes-checkin`):** políticas para `classes`, `class_recurring_schedules`, `class_sessions`, `student_class_enrollments`, `check_ins`, `attendances`:
+>
+> - **Professor** (`current_profile_role() = 'professor'`): CRUD em turmas/sessões/inscrições e leitura de check-ins/attendances quando `account_id = current_account_id()`.
+> - **Aluno** (`student`): `SELECT` em sessões/turmas das inscrições próprias; `INSERT`/`DELETE` em `check_ins` apenas com `student_id` ligado a `students.user_id = auth.uid()`; **sem** `INSERT`/`UPDATE`/`DELETE` em `attendances`.
+> - Isolamento entre alunos: aluno A não lê/escreve check-ins do aluno B.
```

**Motivo:** Promover **SEC-3.7** de contrato para comportamento implementado nas tabelas Fase 2.

---

### `spec/features/student-portal/readme.md`

**Seção:** SPT-12 (estado Fase 2) + referências de implementação

**Mudança proposta:**

```diff
-| 2 | `student-portal-classes-checkin` | Turmas, sessões, check-in, presença | Pendente |
+| 2 | `0524-student-portal-classes-checkin` | Turmas, sessões, check-in, visão professor | Implementado (validar) |
```

```diff
 | Actions | `actions/check-ins.ts`, `actions/class-sessions.ts`, ... |
+| Actions (Fase 2) | `actions/student-portal/check-in.ts` |
+| Domínio (Fase 2) | `lib/classes/checkin-window.ts`, `lib/classes/session-generator.ts`, `lib/data/student-class-sessions.ts` |
```

**Seção:** SPT-6 — limitar escopo Fase 2

```diff
 **SPT-6.1.** Professor abre sessão no painel e vê lista de check-ins em tempo real.
+
+> **Fase 2 (`0524-student-portal-classes-checkin`):** implementado **apenas** visualização de check-ins (`/aulas/[sessionId]`). Conversão em lote (**SPT-6.2**), presença manual (**SPT-6.3**) e exclusão da lista final (**SPT-6.4**) ficam para cycle futuro.
```

**Motivo:** Reflectir entrega parcial de **SPT-6** conforme request (visibilidade sem conversão).

---

### `spec/features/app-shell/readme.md`

**Seção:** Rotas operacionais — aulas professor

**Mudança proposta:**

```diff
+| `/aulas` | Sessões próximas (7 dias) — entrada da sidebar **Aulas** |
+| `/aulas/turmas` | Lista e gestão de turmas |
+| `/aulas/turmas/nova` | Criar turma |
+| `/aulas/turmas/[classId]` | Editar turma, recorrência, inscrições |
+| `/aulas/sessao/[sessionId]` | Check-ins da sessão (polling 30s) |
```

Adicionar **Aulas** a `MAIN_NAV_ITEMS` em `dashboard-nav-config.tsx`.

**Motivo:** Documentar rotas e nav confirmados pelo humano.

---

### `docs/security/rls.md`

**Seção:** Políticas Fase 2 + bootstrap turma

**Mudança proposta:** Adicionar linhas na tabela resumo para cada tabela `class_*`, `check_ins`, `attendances`, `student_class_enrollments`; subsecção SQL para criar turma de teste, recorrência, gerar sessões e inscrever aluno.

**Motivo:** Procedimento operacional alinhado a **SEC-4** e E2E.

---

## Comportamento por stage (para promoção)

### Stage 1 — Schema e RLS
- DDL Fase 2 aplicável via migration `010_*`.
- RLS validada com `pnpm db:validate-rls`.

### Stage 2 — Portal do aluno
- `/portal/aulas` lista sessões e permite check-in/cancelamento na janela **D3**.
- Flag `student-portal.classes.checkin` controla disponibilidade.

### Stage 3 — Painel professor
- CRUD turmas, recorrência, inscrições via `/aulas/turmas/*`.
- Check-ins em `/aulas/sessao/[sessionId]` com polling 30s e **PBS-3**.
- Item **Aulas** na sidebar.
- Nenhuma escrita em `attendances` pela aplicação.

---

## Checklist antes de promover

- [ ] Todas as stages concluídas e validadas
- [ ] Comportamento descrito é o implementado (não intenção)
- [ ] Revisão humana confirmada
- [ ] `/security-review` executado na Stage 3
- [ ] Pronto para `/update-spec`
