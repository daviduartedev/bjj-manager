# spec-delta.md — Medium Cycle

## Cycle: student-portal-foundation
## Status: PROMOVIDA (2026-05-24)

> Promovido para `spec/` via `/update-spec`. Comportamento de runtime entra conforme **SPT-12**; contrato e decisões da Fase 0 são canónicos.

---

## Specs afetadas

### `spec/features/app-shell/readme.md`

**Seção:** SHELL-2 (rotas canónicas)

**Mudança proposta:**

```diff
+ | `/portal` | Portal do aluno (**SPT-**) — área autenticada com role `student` |
+ | `/portal/aulas` | Listagem de aulas e check-in (**SPT-4**, **SPT-5**) |
+ | `/portal/loja` | Vitrine e reservas (**SPT-8**) |
+ | `/portal/financeiro` | Área financeira incl. placeholder PIX (**SPT-9**) |
```

**Motivo:** Registrar novo grupo de rotas paralelo ao painel do professor. Implementação na Fase 1+.

---

### `spec/features/authentication/readme.md`

**Seção:** AUTH-1 / AUTH-2 (evolução futura)

**Mudança proposta:**

```diff
+ **AUTH-8. Portal do aluno (Fase 1+).**
+ **AUTH-8.1.** Utilizadores com `profiles.role = student` autenticam-se pelo mesmo fluxo `/login` e são redirecionados para **`/portal`** (**SPT-2.2**).
+ **AUTH-8.2.** Utilizadores com role `professor` (ou equivalente operacional) continuam a ir para **`/painel`** (**AUTH-2.1**).
+ **AUTH-8.3.** Provisionamento de conta aluno: professor associa `students.user_id` a utilizador Auth existente ou convida por e-mail (detalhe na Fase 1).
```

**Motivo:** Auth atual cobre só professor; portal exige evolução documentada antes de implementar.

---

### `spec/features/rls-security/readme.md`

**Seção:** SEC-3 (novas políticas — Fases 1–3)

**Mudança proposta:**

```diff
+ **SEC-3.7. Papel `student`:** políticas em tabelas `class_*`, `check_ins`, `attendances`, `products`, `reservations` garantem:
+ - Aluno (`students.user_id = auth.uid()`) lê/escreve **apenas** linhas do próprio `student_id`.
+ - Professor mantém acesso via `account_id = current_account_id()` como hoje em `students`.
+ - Nenhuma política permite aluno ler `students` de outro aluno.
```

**Motivo:** RLS é requisito central; deve ser planejada na fundação.

---

### `spec/features/student-portal/readme.md` _(novo arquivo)_

**Conteúdo proposto:**

```markdown
# Feature: Portal do aluno

Contrato canónico para a **área do aluno** complementar ao painel do professor: aulas, check-in, loja com reserva e placeholder de pagamento PIX. Prefixo de regras: **SPT-**.

## Relação com outras specs

- Autenticação: [`spec/features/authentication/readme.md`](../authentication/readme.md) (**AUTH-8** proposto).
- Shell e URLs: [`spec/features/app-shell/readme.md`](../app-shell/readme.md) (**SHELL-2** — rotas `/portal`).
- Alunos (entidade): [`spec/features/students-crud/readme.md`](../students-crud/readme.md) (**STU-**, **ENT-4**).
- Perfil aluno (professor): [`spec/features/student-profile/readme.md`](../student-profile/readme.md) (**SPR-**).
- RLS: [`spec/features/rls-security/readme.md`](../rls-security/readme.md) (**SEC-3.7** proposto).
- Indicador financeiro: [`spec/features/payments-billing-status/readme.md`](../payments-billing-status/readme.md) (**PBS-3** — alerta ao professor, não bloqueio v1).
- Planos pedagógicos (**domínio distinto**): [`spec/features/lesson-plans/readme.md`](../lesson-plans/readme.md) (**PED-**).

## Implementação (referência — cycles futuros)

| Área | Artefactos típicos |
|------|-------------------|
| Rotas | `app/(student)/portal/...` |
| Layout | `app/(student)/layout.tsx`, `components/student/` |
| Actions | `actions/check-ins.ts`, `actions/class-sessions.ts`, `actions/reservations.ts`, `actions/products.ts` |
| Validação | `lib/validations/student-portal.ts` |
| Domínio | `lib/classes/`, `lib/shop/` |
| Flags | Harness: `student-portal.enabled`, `.classes.checkin`, `.shop`, `.payments.pix` |

---

## SPT-0. Glossário e domínios distintos

**SPT-0.1.** **Check-in** = intenção do aluno antes da aula. **Não** é presença oficial.

**SPT-0.2.** **Presença (`attendance`)** = registro consolidado pelo professor após a aula.

**SPT-0.3.** **Aula agendada (`class_session`)** ≠ **plano pedagógico (`lesson_plan`, PED-)**. Nunca misturar listagens.

**SPT-0.4.** Nomes de tabela sugeridos em inglês no schema: `classes`, `class_recurring_schedules`, `class_sessions`, `check_ins`, `attendances`, `products`, `reservations`, `student_class_enrollments`.

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

**SPT-2.1.** Mesmo domínio e instância Supabase que o painel professor (**D1**).

**SPT-2.2.** Após login, redirect por role: `student` → **`/portal`**; operacional → **`/painel`**.

**SPT-2.3.** Vínculo: `students.user_id` (nullable) → `auth.users.id`. Um auth user liga a no máximo um `students` por conta.

**SPT-2.4.** Onboarding Fase 1: aceite de termo de uso. Menores: campo e-mail responsável obrigatório no cadastro/onboarding (**Q2**).

**SPT-2.5.** Aluno arquivado/removido (**STU-3.4**) não acede ao portal.

---

## SPT-3. Turmas e inscrições

**SPT-3.1.** Tabela **`classes`** (turma): nome, modalidade (`adult`/`kids`), professor responsável, `account_id`.

**SPT-3.2.** **`student_class_enrollments`**: N:N entre `students` e `classes`.

**SPT-3.3.** Aluno vê aulas apenas das turmas em que está inscrito.

---

## SPT-4. Aulas recorrentes e instâncias

**SPT-4.1.** **`class_recurring_schedules`**: `class_id`, dia da semana, `start_time`, `end_time` (**D7** — recorrência semanal).

**SPT-4.2.** **`class_sessions`**: instância concreta (`session_date`, horários, `class_id`, `capacity` nullable).

**SPT-4.3.** Geração rolante: expandir instâncias para janela futura (ex.: 14 dias). Job ou trigger na Fase 2.

**SPT-4.4.** **`capacity`**: nullable na v1; bloqueio por lotação **adiado** (**D6**).

---

## SPT-5. Check-in

**SPT-5.1.** Janela: abre **6 horas** antes de `start_time`; fecha no **início** da aula (**D3**, timezone **America/Sao_Paulo**).

**SPT-5.2.** Ação do aluno: botão **"Estou presente"** → insert em **`check_ins`** (`class_session_id`, `student_id`, `created_at`).

**SPT-5.3.** Cancelamento permitido até fechamento da janela (**D5**).

**SPT-5.4.** Check-in **não** cria `attendance` automaticamente.

**SPT-5.5.** Aptidão financeira (**Q1**, v1): check-in **permitido** mesmo inadimplente; professor vê indicador **PBS-3** na lista de check-ins.

**SPT-5.6.** Validações server-side: aluno inscrito na turma; janela aberta; sessão pertence à conta do aluno; flag `student-portal.classes.checkin` ativa.

---

## SPT-6. Presença (professor)

**SPT-6.1.** Professor abre sessão no painel e vê lista de check-ins em tempo real.

**SPT-6.2.** Ao encerrar chamada: conversão em lote check-ins → **`attendances`** com `origin = checkin_student`.

**SPT-6.3.** Presença manual: `origin = manual_instructor` (**D4**).

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

**SPT-9.3.** Quando flag futura `true` + cycle de pagamento implementado, substituir placeholder — fora deste roadmap v1.

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

**SPT-10.3.** Validação contra schema existente (**ENT-4**, **SEC-3.3**): `students` já tem `account_id`; extensão proposta é **`user_id`** nullable (sem alterar recorte mensal **ENT-4.2**). Alunos `archived_at` / `removed_at` preenchidos não acedem ao portal (**SPT-2.5**).

**SPT-10.4.** `profiles` mantém isolamento por `account_id`; novo valor de role `student` exige políticas RLS distintas (**SEC-3.7**) — a implementar na Fase 1+, não neste cycle.

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

## SPT-12. Fases de implementação (cycles futuros)

| Fase | Cycle slug sugerido | Entrega principal |
|------|---------------------|-------------------|
| 1 | `student-portal-auth` | Auth, shell, onboarding, placeholder home + PIX layout |
| 2 | `student-portal-classes-checkin` | Turmas, sessões, check-in, presença professor |
| 3 | `student-portal-shop` | Produtos, reservas, confirmação presencial |
| 4 | `student-portal-refinements` | Histórico, métricas, E2E, notificações |

---

## Manutenção

Alterações em janela de check-in, RLS ou flags devem atualizar este readme, cenários em `cycles/.../scenarios.feature` dos cycles de implementação, e **`scripts/validate-rls.cjs`** quando políticas existirem.
```

**Motivo:** Criar contrato único **SPT-** antes de qualquer implementação; promover após validação da fundação.

---

## Checklist antes de promover

- [x] Validação documental concluída (`validation.md` 2026-05-24)
- [x] Decisões D1–D7 fechadas ou adiadas com owner (`plan.md`, `ROADMAP_PORTAL_ALUNO.md`)
- [x] Cenários em `scenarios.feature` revisados e mapeados
- [x] Revisão humana confirmada (checkpoint task 8)
- [x] Promovido via `/update-spec` (2026-05-24)
