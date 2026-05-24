# spec-delta.md — Large Cycle

## Cycle: student-portal-auth
## Status: PROMOVIDO (2026-05-24)

> ⚠️ Este arquivo é uma PROPOSTA. Só é promovido para `spec/` via `/update-spec` após todas as stages validadas.

---

## Specs afetadas

### `spec/features/student-portal/readme.md`

**Seção:** Cabeçalho / **SPT-12**

**Mudança proposta:**

```diff
- **Estado:** contrato aprovado na **Fase 0** (...). Implementação incremental — ver **SPT-12**. Até conclusão da Fase 1, rotas `/portal` e fluxos **AUTH-8** **não** existem na aplicação.
+ **Estado:** Fase 1 implementada (cycle `Q22026/0524-student-portal-auth`). Rotas `/portal`, **AUTH-8**, shell e placeholder PIX activos quando `student-portal.enabled=true`. Aulas, check-in e loja permanecem Fases 2–3.
```

```diff
  | Fase | Cycle slug | Entrega principal | Estado |
  | 1 | `student-portal-auth` | Auth, shell, onboarding, PIX layout | Pendente |
+ | 1 | `student-portal-auth` | Auth, shell, onboarding, PIX layout | ✅ Implementado |
```

**Seção:** Implementação (referência)

```diff
  | Rotas | `app/(student)/portal/...` |
+ | Auth / onboarding | `lib/auth/roles.ts`, `lib/auth/student-context.ts`, `actions/student-portal/` |
+ | Flags | `lib/feature-flags/student-portal.ts` |
+ | Shell | `components/student/student-shell.tsx`, `student-nav.tsx`, `pix-placeholder.tsx` |
```

**Motivo:** Reflectir estado pós-Fase 1 e artefactos reais.

---

### `spec/features/authentication/readme.md`

**Seção:** AUTH-2. Destinos e navegação

**Mudança proposta:**

```diff
- **AUTH-2.1.** Após autenticação bem-sucedida, o utilizador deve ser levado ao **`/painel`** (área operacional).
+ **AUTH-2.1.** Após autenticação bem-sucedida, utilizadores com role **operacional** (`professor` ou equivalente) vão para **`/painel`**. Utilizadores com `profiles.role = student` vão para **`/portal`** (**AUTH-8.1**).

- **AUTH-2.2.** Utilizador **com sessão válida** que abre **`/login`** deve ser **redirecionado para `/painel`**.
+ **AUTH-2.2.** Utilizador **com sessão válida** que abre **`/login`** é redirecionado para **`/portal`** (role `student`) ou **`/painel`** (operacional).
```

**Seção:** AUTH-8

**Mudança proposta:**

```diff
-> Implementação prevista no cycle `student-portal-auth`. Enquanto não entregue, **AUTH-2.x** aplica-se a todos os utilizadores autenticados (destino **`/painel`**).
+> Implementado no cycle `Q22026/0524-student-portal-auth`.
```

```diff
- **AUTH-8.3.** Provisionamento de conta aluno: professor associa `students.user_id` a utilizador Auth existente ou convida por e-mail (detalhe na Fase 1).
+ **AUTH-8.3.** Provisionamento: professor, na ficha do aluno, associa `students.user_id` a utilizador Auth existente (e-mail). Convite por e-mail quando suportado pelo ambiente Supabase. Unicidade: um auth user → no máximo um `students` por `account_id` (**SPT-2.3**).
```

**Motivo:** AUTH-8 deixa de ser contrato futuro; redirects por role passam a regra activa.

---

### `spec/features/app-shell/readme.md`

**Seção:** SHELL-2 — Área do aluno

**Mudança proposta:**

```diff
-> Rotas abaixo definidas em **SPT-**; implementação no cycle `student-portal-auth`. Enquanto não entregues, o middleware **não** as expõe.
+> Rotas activas desde Fase 1 (`student-portal-auth`). Middleware protege sessão e isola papéis (**SHELL-9**).
```

**Seção nova:** SHELL-9. Shell do aluno

**Conteúdo proposto:**

```markdown
## SHELL-9. Shell do aluno

**SHELL-9.1.** Layout partilhado em `app/(student)/layout.tsx` com **`StudentShell`**: cabeçalho, navegação e área de conteúdo.

**SHELL-9.2.** Navegação principal (pt-BR): **Início** (`/portal`), **Aulas** (`/portal/aulas`), **Loja** (`/portal/loja`), **Financeiro** (`/portal/financeiro`).

**SHELL-9.3.** Responsividade: sidebar em desktop (`lg+`); bottom nav ou drawer em mobile — espelhar padrões **SHELL-1.x** / **DS-**.

**SHELL-9.4.** Isolamento: middleware impede `student` em prefixos operacionais e operacional em `/portal` (**AUTH-8**).

**SHELL-9.5.** Flag `student-portal.enabled=false`: página de indisponibilidade; subrotas não expõem conteúdo funcional.
```

**Motivo:** Documentar chrome do portal separado do dashboard professor.

---

### `spec/features/students-crud/readme.md`

**Seção nova:** STU-12. Provisionamento portal (Fase 1)

**Conteúdo proposto:**

```markdown
## STU-12. Provisionamento de acesso ao portal

**STU-12.1.** Na ficha/perfil do aluno (**SPR-** / edição), professor pode **associar acesso ao portal** ligando `students.user_id` a um utilizador Auth existente (por e-mail).

**STU-12.2.** Não permitir associar o mesmo auth user a dois `students` na mesma conta (**SPT-2.3**).

**STU-12.3.** Aluno arquivado ou removido (**STU-3.4**) não deve receber novo provisionamento enquanto nesse estado.

**STU-12.4.** UI indica claramente se o aluno já tem acesso (`user_id` preenchido) ou pendente.
```

**Motivo:** AUTH-8.3 precisa de contrato na área de gestão de alunos.

---

### `spec/features/security-e2e/route-inventory.md`

**Mudança proposta:**

```diff
+ | `/portal` | Privada (student) | Home aluno (**SPT-**, **AUTH-8**). |
+ | `/portal/aulas` | Privada (student) | Placeholder Fase 2. |
+ | `/portal/loja` | Privada (student) | Placeholder Fase 3. |
+ | `/portal/financeiro` | Privada (student) | PIX placeholder (**SPT-9**). |
+ | `/portal/onboarding` | Privada (student) | Onboarding Fase 1. |
```

**Motivo:** Inventário SECE2E deve incluir novas rotas.

---

### `spec/features/rls-security/readme.md`

**Nota (sem alteração de políticas neste cycle):**

Manter **SEC-3.7** como contrato. DDL e policies concretas permanecem no **cycle dedicado de schema** — não promover alterações de RLS até migrations aplicadas e `pnpm db:validate-rls` verde.

---

## Checklist antes de promover

- [ ] Todas as stages concluídas e validadas
- [ ] Comportamento descrito é o implementado (não intenção)
- [ ] Cycle de schema aplicado e E2E de provisionamento verde (task 2.13)
- [ ] Revisão humana confirmada
- [ ] Pronto para `/update-spec`
