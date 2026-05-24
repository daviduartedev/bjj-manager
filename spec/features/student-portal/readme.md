# Feature: Portal do aluno

Contrato canónico para a **área do aluno** complementar ao painel do professor: aulas, check-in, loja com reserva e placeholder de pagamento PIX. Prefixo de regras: **SPT-**.

**Estado:** Fases 1–2 implementadas (cycles `0524-student-portal-auth`, `0524-student-portal-classes-checkin`). Rotas `/portal`, **AUTH-8**, shell, placeholder PIX, aulas e check-in activos quando as flags correspondentes estão ligadas. Loja (Fase 3) permanece placeholder.

Roadmap estratégico: [`ROADMAP_PORTAL_ALUNO.md`](../../../ROADMAP_PORTAL_ALUNO.md).

## Relação com outras specs

- Autenticação: [`spec/features/authentication/readme.md`](../authentication/readme.md) (**AUTH-8**).
- Shell e URLs: [`spec/features/app-shell/readme.md`](../app-shell/readme.md) (**SHELL-2** — rotas `/portal`).
- Alunos (entidade): [`spec/features/students-crud/readme.md`](../students-crud/readme.md) (**STU-**, **ENT-4**).
- Perfil aluno (professor): [`spec/features/student-profile/readme.md`](../student-profile/readme.md) (**SPR-**).
- RLS: [`spec/features/rls-security/readme.md`](../rls-security/readme.md) (**SEC-3.7**).
- Indicador financeiro: [`spec/features/payments-billing-status/readme.md`](../payments-billing-status/readme.md) (**PBS-3** — alerta ao professor, não bloqueio v1).
- Planos pedagógicos (**domínio distinto**): [`spec/features/lesson-plans/readme.md`](../lesson-plans/readme.md) (**PED-**).

## Implementação (referência)

| Área | Artefactos típicos |
|------|-------------------|
| Rotas | `app/(student)/portal/...` |
| Layout | `app/(student)/layout.tsx`, `components/student/` |
| Actions | `actions/check-ins.ts`, `actions/class-sessions.ts`, `actions/reservations.ts`, `actions/products.ts` |
| Actions (Fase 2) | `actions/student-portal/check-in.ts`, `actions/classes.ts` |
| Auth / onboarding (Fase 1) | `lib/auth/roles.ts`, `lib/auth/student-context.ts`, `actions/student-portal/` |
| Validação | `lib/validations/student-portal.ts`, `lib/validations/classes.ts` |
| Domínio | `lib/classes/`, `lib/shop/` |
| Domínio (Fase 2) | `lib/classes/checkin-window.ts`, `lib/classes/session-generator.ts`, `lib/data/student-class-sessions.ts`, `lib/data/classes-page.ts`, `lib/data/class-session-check-ins.ts` |
| Shell (Fase 1) | `components/student/student-shell.tsx`, `student-nav.tsx`, `pix-placeholder.tsx` |
| Painel professor (Fase 2) | `components/classes/*`, `app/(dashboard)/aulas/**` |
| Flags | `lib/feature-flags/student-portal.ts` — `student-portal.enabled`, `.classes.checkin`, `.shop`, `.payments.pix` |

---

## SPT-0. Glossário e domínios distintos

**SPT-0.1.** **Check-in** = intenção do aluno antes da aula. **Não** é presença oficial.

**SPT-0.2.** **Presença (`attendance`)** = registro consolidado pelo professor após a aula.

**SPT-0.3.** **Aula agendada (`class_session`)** ≠ **plano pedagógico (`lesson_plan`, PED-)**. Nunca misturar listagens.

**SPT-0.4.** Nomes de tabela canónicos em inglês no schema: `classes`, `class_recurring_schedules`, `class_sessions`, `check_ins`, `attendances`, `products`, `reservations`, `student_class_enrollments`.

---

## SPT-1. Escopo da v1 (portal)

**SPT-1.1.** Capacidades centrais (flags independentes após master `student-portal.enabled`):

1. Listagem de aulas da(s) turma(s) do aluno.
2. Check-in com botão **"Estou presente"** — sem QR, GPS ou biometria.
3. Loja: vitrine + reserva com pagamento presencial na academia.

**SPT-1.2.** Capacidade **placeholder**: área financeira com layout QR/chave PIX e aviso **"Em breve"** (**SPT-9**). Sem gateway, sem PCI, sem confirmação automática.

**SPT-1.3.** Fora da v1: pagamento online funcional; reconhecimento facial; QR para check-in; notificações push/e-mail (Fase 4).

---

## SPT-2. Auth, roles e onboarding

**SPT-2.1.** Mesmo domínio e instância Supabase que o painel professor.

**SPT-2.2.** Após login, redirect por role: `student` → **`/portal`**; operacional → **`/painel`** (**AUTH-8**).

**SPT-2.3.** Vínculo: `students.user_id` (nullable) → `auth.users.id`. Um auth user liga a no máximo um `students` por conta.

**SPT-2.4.** Onboarding Fase 1: aceite de termo de uso. Menores: campo e-mail responsável obrigatório no cadastro/onboarding.

**SPT-2.5.** Aluno arquivado/removido (**STU-3.4**) não acede ao portal.

---

## SPT-3. Turmas e inscrições

**SPT-3.1.** Tabela **`classes`** (turma): nome, modalidade (`adult`/`kids`), professor responsável, `account_id`.

**SPT-3.2.** **`student_class_enrollments`**: N:N entre `students` e `classes`.

**SPT-3.3.** Aluno vê aulas apenas das turmas em que está inscrito.

---

## SPT-4. Aulas recorrentes e instâncias

**SPT-4.1.** **`class_recurring_schedules`**: `class_id`, dia da semana, `start_time`, `end_time` (recorrência semanal).

**SPT-4.2.** **`class_sessions`**: instância concreta (`session_date`, horários, `class_id`, `capacity` nullable).

**SPT-4.3.** Geração rolante: expandir instâncias para janela futura (14 dias). Job ou trigger na Fase 2.

**SPT-4.4.** **`capacity`**: nullable na v1; bloqueio por lotação adiado para pós-v1.

---

## SPT-5. Check-in

**SPT-5.1.** Janela: abre **6 horas** antes de `start_time`; fecha no **início** da aula (timezone **America/Sao_Paulo**).

**SPT-5.2.** Ação do aluno: botão **"Estou presente"** → insert em **`check_ins`** (`class_session_id`, `student_id`, `created_at`).

**SPT-5.3.** Cancelamento permitido até fechamento da janela.

**SPT-5.4.** Check-in **não** cria `attendance` automaticamente.

**SPT-5.5.** Aptidão financeira (v1): check-in **permitido** mesmo inadimplente; professor vê indicador **PBS-3** na lista de check-ins.

**SPT-5.6.** Validações server-side: aluno inscrito na turma; janela aberta; sessão pertence à conta do aluno; flag `student-portal.classes.checkin` ativa.

---

## SPT-6. Presença (professor)

**SPT-6.1.** Professor abre sessão no painel e vê lista de check-ins em tempo real.

> **Fase 2 (`0524-student-portal-classes-checkin`):** implementado **apenas** visualização de check-ins (`/aulas/sessao/[sessionId]`, polling 30s). Conversão em lote (**SPT-6.2**), presença manual (**SPT-6.3**) e exclusão da lista final (**SPT-6.4**) ficam para cycle futuro.

**SPT-6.2.** Ao encerrar chamada: conversão em lote check-ins → **`attendances`** com `origin = checkin_student`.

**SPT-6.3.** Presença manual: `origin = manual_instructor`.

**SPT-6.4.** Professor pode excluir da lista final quem fez check-in mas faltou; check-in permanece para métricas.

---

## SPT-7. Listagem no portal

**SPT-7.1.** **`/portal/aulas`**: próximos 7 dias (configurável) de `class_sessions` das turmas inscritas; mostra horário, turma, professor.

**SPT-7.2.** Estado visual: check-in aberto / fechado / já confirmado / cancelável.

---

## SPT-8. Loja e reservas

**SPT-8.1.** **`products`**: nome, descrição, preço, estoque, `active`, `account_id`.

**SPT-8.2.** Vitrine: apenas `active = true` e `stock > 0`.

**SPT-8.3.** Reserva: transação atómica decrementa estoque (`UPDATE ... WHERE stock > 0`); cria **`reservations`** com `status = pending_payment`.

**SPT-8.4.** TTL de expiração (valor na Fase 3); job marca `expired` e repõe estoque.

**SPT-8.5.** Professor confirma pagamento presencial → `status = paid`.

**SPT-8.6.** Flag: `student-portal.shop`.

---

## SPT-9. Placeholder PIX

**SPT-9.1.** **`/portal/financeiro`**: secção estática com área QR code, campo chave PIX (dados fictícios ou vazios) e badge **"Em breve"**.

**SPT-9.2.** Flag `student-portal.payments.pix`: quando `false` (default), secção visível mas ações desabilitadas; copy explica indisponibilidade.

**SPT-9.3.** Pagamento PIX funcional substitui o placeholder num cycle futuro — fora do roadmap v1.

**SPT-9.4.** Nenhuma integração gateway; nenhum dado PCI.

---

## SPT-10. Modelo de dados (resumo)

```
students (existente)
  + user_id → auth.users (nullable até onboarding)
  └── student_class_enrollments → classes

classes
  ├── class_recurring_schedules
  └── class_sessions
        ├── check_ins (student_id, class_session_id)
        └── attendances (student_id, class_session_id, origin, recorded_by)

products
  └── reservations (student_id, product_id, status, expires_at)
```

**SPT-10.1.** Todas as tabelas novas: `account_id` + RLS (**SEC-3.7**).

**SPT-10.2.** `check_ins` e `attendances` são entidades separadas — nunca unificar.

**SPT-10.3.** Extensão de `students`: **`user_id`** nullable (sem alterar recorte mensal **ENT-4.2**). Alunos com `archived_at` / `removed_at` não acedem ao portal.

**SPT-10.4.** `profiles.role = student` exige políticas RLS distintas (**SEC-3.7**) — com DDL nas Fases 1–3.

**SPT-10.5.** Domínio **PED-** (`lesson_plans`) permanece independente; zero FK cruzada com `class_sessions`.

---

## SPT-11. Feature flags

| Flag | Default |
|------|---------|
| `student-portal.enabled` | `false` |
| `student-portal.classes.checkin` | `false` |
| `student-portal.shop` | `false` |
| `student-portal.payments.pix` | `false` |

Master desligada ⇒ portal inacessível ou mensagem de indisponibilidade documentada.

---

## SPT-12. Fases de implementação

| Fase | Cycle slug | Entrega principal | Estado |
|------|------------|-------------------|--------|
| 0 | `0524-student-portal-foundation` | Contrato **SPT-**, decisões, cenários | ✅ Aprovado |
| 1 | `0524-student-portal-auth` | Auth, shell, onboarding, PIX layout | ✅ Implementado |
| 2 | `0524-student-portal-classes-checkin` | Turmas, sessões, check-in, visão professor | ✅ Implementado |
| 3 | `student-portal-shop` | Produtos, reservas | Pendente |
| 4 | `student-portal-refinements` | Histórico, métricas, E2E | Pendente |

---

## Manutenção

Alterações em janela de check-in, RLS ou flags devem actualizar este readme, cenários nos cycles de implementação, e **`scripts/validate-rls.cjs`** quando políticas existirem.
