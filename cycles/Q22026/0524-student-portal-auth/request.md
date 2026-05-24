# request.md — Large Cycle

## Cycle
- **Path:** `cycles/Q22026/0524-student-portal-auth/`
- **Tipo:** Large
- **Data:** 2026-05-24
- **Autor:** {nome}

---

## Contexto

A **Fase 0** (`cycles/Q22026/0524-student-portal-foundation/`) fechou o contrato **SPT-**, decisões D1–D7 e o roadmap do Portal do Aluno. O sistema continua sendo um painel operacional para professor/academia; **não existe** área do aluno na aplicação.

Esta é a **Fase 1** do roadmap: primeira entrega com **código** — rotas `(student)/portal`, autenticação por role, vínculo `students.user_id`, shell inicial do portal e layout placeholder de pagamento PIX com aviso **"Em breve"**.

Contrato canónico: `spec/features/student-portal/readme.md` (**SPT-2**, **SPT-9**, **AUTH-8**, **SHELL-2**). Roadmap: `ROADMAP_PORTAL_ALUNO.md`.

---

## O que precisa ser feito

Implementação da **Fase 1 — Auth e onboarding** do Portal do Aluno:

### 1. Rotas e shell `(student)/portal`

- Grupo App Router `app/(student)/` com prefixo canónico **`/portal`** (**SHELL-2**).
- Layout inicial do portal (navegação, header, área de conteúdo) alinhado ao design system existente.
- Páginas mínimas da shell (entrada `/portal` e subrotas declaradas no contrato, mesmo que com conteúdo placeholder onde a funcionalidade pertence a fases futuras):
  - `/portal` — home do aluno
  - `/portal/aulas` — placeholder até Fase 2
  - `/portal/loja` — placeholder até Fase 3
  - `/portal/financeiro` — layout PIX (ver item 4)

### 2. Auth por role (**AUTH-8**)

- Após login, redirect por `profiles.role`:
  - `student` → **`/portal`**
  - operacional (`professor` ou equivalente) → **`/painel`**
- Middleware/guards: prefixos `/portal` protegidos; aluno não acede ao painel operacional; operacional não acede ao portal do aluno (salvo decisão explícita em `/refine-request`).
- Aluno arquivado/removido (**STU-3.4**, **SPT-2.5**) não acede ao portal.

### 3. Vínculo `students.user_id`

- Modelo contratual: `students.user_id` (nullable) → `auth.users.id`; no máximo um `students` por auth user por conta (**SPT-2.3**).
- Fluxo de provisionamento pelo professor: associar conta Auth existente ou convidar por e-mail (**AUTH-8.3**).
- Onboarding Fase 1: aceite de termo de uso; menores com e-mail de responsável obrigatório (**SPT-2.4**).

### 4. Placeholder PIX "Em breve" (**SPT-9**)

- **`/portal/financeiro`**: secção estática com layout para área de QR code, campo de chave PIX (dados fictícios ou vazios) e badge/aviso visível **"Em breve"**.
- Flag `student-portal.payments.pix`: quando `false` (default), secção visível mas ações desabilitadas; copy explica indisponibilidade.
- Sem gateway, sem PCI, sem processamento real.

### 5. Feature flag master

- `student-portal.enabled` — gate da área do aluno (detalhe de rollout em `/refine-request`).

---

## Motivação / valor

Desbloquear a experiência do aluno na aplicação com fundação segura (auth, roles, shell, onboarding) antes das fases de aulas/check-in e loja. Entregar valor visível (portal acessível, área financeira reservada) sem antecipar domínios das Fases 2–3.

---

## Critérios de aceite (alto nível)

- [ ] Rotas `(student)/portal` existem e respondem conforme **SHELL-2** (`/portal`, `/portal/aulas`, `/portal/loja`, `/portal/financeiro`)
- [ ] Shell do portal com navegação consistente e layout reutilizando padrões do projeto
- [ ] Login redireciona por role: `student` → `/portal`; operacional → `/painel` (**AUTH-8**)
- [ ] Middleware protege `/portal` e isola papéis conforme contrato
- [ ] Vínculo `students.user_id` implementado no fluxo de provisionamento/onboarding (**SPT-2.3**, **AUTH-8.3**)
- [ ] Onboarding inclui aceite de termo; menores exigem e-mail responsável (**SPT-2.4**)
- [ ] Aluno arquivado/removido bloqueado no portal (**SPT-2.5**)
- [ ] `/portal/financeiro` exibe layout QR + chave PIX com aviso **"Em breve"**; sem pagamento funcional (**SPT-9**)
- [ ] Flag `student-portal.enabled` controla acesso à área do aluno
- [ ] Cenários Gherkin da Fase 1 passam após validação (`/validate-cycle`)

---

## Stages previstas (estimativa inicial)

> Refinamento real ocorre em `/refine-request`.

1. **Stage 1 — Infra de rotas e middleware** — grupo `(student)`, prefixos `/portal`, guards por role, flag master
2. **Stage 2 — Auth, vínculo e onboarding** — `students.user_id`, provisionamento professor, termo de uso, menores
3. **Stage 3 — Shell e placeholder PIX** — layout portal, navegação, `/portal/financeiro` com layout "Em breve"

---

## Restrições e riscos conhecidos

**Restrições obrigatórias (deste cycle):**

- **Sem SQL / migrations / DDL** — alterações de schema (`students.user_id`, novas tabelas, RLS) ficam para **cycle dedicado** a pedido explícito do humano. Este cycle implementa código de aplicação assumindo contrato **SPT-**; onde o schema ainda não existir, usar stubs/mocks documentados ou aguardar o cycle de DB.
- Reutilizar stack: Supabase Auth, App Router, server actions, Zod, shadcn/ui, padrão RLS existente (**SEC-**).
- Mesmo domínio e instância Supabase que o painel professor (**SPT-2.1**).
- Sem gateway de pagamento / PCI (**SPT-9.4**).

**Riscos:**

- Dependência do cycle de migrations para vínculo `students.user_id` e RLS de aluno — mitigar com stage ordering e documentação clara do que fica bloqueado até o cycle de DB.
- Confundir rotas `/portal/aulas` (SPT) com `/pedagogico/planos` (PED-) — manter domínios separados.
- Auth subestimada — seguir **AUTH-8** e **SEC-3.7** no plano de stages.

---

## Fora de escopo

**Neste cycle (Fase 1):**

- Migrations, SQL, alterações DDL, policies RLS novas (cycle dedicado, sob demanda)
- Listagem funcional de aulas e check-in (**SPT-5**, **SPT-7**) — Fase 2
- Loja e reservas (**SPT-8**) — Fase 3
- Pagamento PIX/QR **funcional** (gateway, confirmação automática) — cycle futuro
- Reconhecimento facial, biometria, QR de presença, GPS
- Notificações push/e-mail — Fase 4
- Refatoração ampla do painel professor fora do necessário para provisionar aluno

---

## Specs relevantes

- `spec/features/student-portal/readme.md` (**SPT-2**, **SPT-9**, **SPT-12**)
- `spec/features/authentication/readme.md` (**AUTH-8**)
- `spec/features/app-shell/readme.md` (**SHELL-2**, **SHELL-5**)
- `spec/features/students-crud/readme.md` (**STU-**, **ENT-4**)
- `spec/features/student-profile/readme.md` (**SPR-**)
- `spec/features/rls-security/readme.md` (**SEC-3.7**)
- `spec/security.md`
- `spec/frontend.md`
- `spec/backend.md`

---

## Referências

- Cycle Fase 0: `cycles/Q22026/0524-student-portal-foundation/`
- Roadmap: `ROADMAP_PORTAL_ALUNO.md`
- Contrato **SPT-** promovido via `/update-spec` após Fase 0
