# request.md — Medium Cycle

## Cycle
- **Path:** `cycles/Q22026/0524-student-portal-schema/`
- **Tipo:** Medium
- **Data:** 2026-05-24
- **Autor:** {nome}

---

## Contexto

O cycle **`0524-student-portal-auth`** (Fase 1) implementou rotas `/portal`, middleware por role e código de onboarding/provisionamento **sem DDL**. O schema actual **não tem** `profiles.role`, `students.user_id` nem campos de onboarding — `resolveAuthRole()` faz fallback para `professor`, bloqueando validação E2E da Stage 2.

Este cycle entrega **apenas migrations e RLS mínimos** para desbloquear auth/onboarding do portal (**SPT-2.3**, **SPT-2.4**, **AUTH-8**, **SEC-3.7** parcial).

Contrato: `spec/features/student-portal/readme.md` (**SPT-10.3–10.4**), `spec/features/rls-security/readme.md` (**SEC-3.7**).

Cycle de aplicação relacionado: `cycles/Q22026/0524-student-portal-auth/` (Stage 1 concluída; Stages 2–3 aguardam schema).

---

## O que precisa ser feito

DDL + policies + validação RLS para **Fase 1 do portal** (não tabelas de aulas/loja):

### 1. `profiles.role`

- Coluna `role` em `public.profiles`: valores `professor` | `student` (enum ou text com CHECK).
- Default **`professor`** — utilizadores existentes inalterados em comportamento.
- Índice/constraints conforme padrão do projeto.

### 2. `students.user_id`

- Coluna nullable `user_id uuid REFERENCES auth.users(id)` em `public.students` (**SPT-2.3**, **SPT-10.3**).
- Unicidade: **no máximo um** `students` por par `(account_id, user_id)` quando `user_id IS NOT NULL`.
- FK coerente com cascade documentado no projeto.

### 3. Campos de onboarding (Fase 1)

- Campos em `students` (ou tabela dedicada se `/refine-request` justificar): p.ex. `portal_terms_accepted_at timestamptz`, `guardian_email text` (**SPT-2.4**).
- Menores / `kind = kids`: `guardian_email` obrigatório no contrato de onboarding (validação app na Stage 2 do auth cycle).

### 4. RLS mínima — papel `student` (**SEC-3.7** parcial)

Políticas para **Fase 1** (tabelas que já existem e o portal precisa agora):

- **`profiles`:** aluno lê/atualiza a própria linha (`user_id = auth.uid()`); demais regras operacionais preservadas.
- **`students`:** aluno com `students.user_id = auth.uid()` lê **apenas** a própria linha; professor mantém acesso via `account_id = current_account_id()` (**SEC-3.3**).
- Garantir que aluno **não** lê `students` de outro aluno na mesma conta.

> Políticas para `class_*`, `check_ins`, `products`, etc. ficam para cycles Fase 2–3 quando essas tabelas existirem.

### 5. Artefactos de base de dados

- Migration(s) idempotentes alinhadas a `db/schema.sql`, `db/policies.sql`.
- Actualizar **`scripts/validate-rls.cjs`** (ou equivalente) com novos cenários do papel `student`.
- Documentar procedimento de provisionamento manual se necessário (`docs/security/rls.md` quando aplicável).

### 6. Aplicação das migrations

- Executar `pnpm db:apply` (ou fluxo documentado do projeto) **apenas com pedido explícito** durante `/execute-cycle`.
- Evidência em `validation.md`: `pnpm db:validate-rls` verde.

---

## Motivação / valor

Desbloqueia validação completa da **Stage 2** do `student-portal-auth` (login → `/portal`, isolamento student↔professor, provisionamento `user_id`, onboarding persistido). Reduz risco de implementar app contra schema inexistente.

---

## Critérios de aceite

- [ ] Migration aplicável adiciona `profiles.role` com default `professor`
- [ ] Migration adiciona `students.user_id` nullable + constraint de unicidade por conta
- [ ] Campos de onboarding Fase 1 presentes e documentados no `spec-delta.md`
- [ ] RLS: aluno acede só ao próprio `students`; professor inalterado em dados operacionais
- [ ] `pnpm db:validate-rls` passa com cenários student incluídos
- [ ] Utilizador existente (sem role explícita) continua como operacional após migration
- [ ] Nenhuma tabela Fase 2–3 (`classes`, `class_sessions`, `check_ins`, `products`, …) criada neste cycle

---

## Restrições e riscos conhecidos

- **Escopo DDL only** — sem alterar UI, middleware ou server actions (auth cycle).
- **Regressão RLS:** alterar `profiles`/`students` pode afectar painel professor — validar **SEC-4.1** com dois utilizadores/contas.
- **Dados existentes:** default `professor` obrigatório; `students.user_id` NULL para todos os alunos até provisionamento.
- **Auth users:** FK para `auth.users` — orphan links e ON DELETE behavior devem seguir padrão do repo.
- **Ordem de deploy:** migration antes de activar `NEXT_PUBLIC_STUDENT_PORTAL_ENABLED=true` em produção.

---

## Fora de escopo

- Tabelas novas Fase 2–3: `classes`, `class_recurring_schedules`, `class_sessions`, `check_ins`, `attendances`, `products`, `reservations`, `student_class_enrollments`
- RLS completa **SEC-3.7** para tabelas ainda inexistentes
- Código de aplicação (rotas, onboarding UI, provisionamento) — cycle `student-portal-auth`
- Pagamento PIX, shell, feature flags de app
- Seed de dados de teste em produção
- Convite Supabase / Admin API (app layer)

---

## Specs relevantes

- `spec/database.md`
- `spec/security.md`
- `spec/features/student-portal/readme.md` (**SPT-2**, **SPT-10**)
- `spec/features/rls-security/readme.md` (**SEC-3.7**)
- `spec/features/authentication/readme.md` (**AUTH-8**)
- `spec/features/students-crud/readme.md` (**STU-**, **ENT-4**)
- `spec/features/supabase-schema/readme.md` (se existir)
- `docs/security/rls.md`

---

## Referências

- Cycle auth (dependente): `cycles/Q22026/0524-student-portal-auth/`
- Dependência documentada: `plan.md` secção "Dependência externa (cycle futuro)"
- Foundation: `cycles/Q22026/0524-student-portal-foundation/`
- Roadmap: `ROADMAP_PORTAL_ALUNO.md`

---

## Open questions (resolver em `/refine-request`)

1. **Onboarding fields:** colunas em `students` vs tabela `student_portal_profiles`?
2. **Enum `profile_role`:** novo tipo Postgres ou `text` + CHECK?
3. **UPDATE `students` pelo aluno:** só onboarding fields ou read-only excepto termo/responsável?
4. **Rollback:** migration down necessária ou forward-only como cycles anteriores?
