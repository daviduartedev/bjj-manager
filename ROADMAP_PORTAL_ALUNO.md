# Roadmap — Portal do Aluno (Casca BJJ)

> Documento de planejamento estratégico. Antecede o SDD e a configuração de feature flags no Harness.
>
> **Projeto:** casca-gestao-academias-bjj
> **Data:** 24 de maio de 2026 (atualizado)
> **Status:** Fase 0 concluída (cycle `Q22026/0524-student-portal-foundation`) — pronto para Fase 1 após checkpoint humano
> **Contrato SDD:** `cycles/Q22026/0524-student-portal-foundation/spec-delta.md` (**SPT-**)

---

## 1. Sumário executivo

Hoje o sistema é um painel para o **professor/academia** gerir alunos, financeiro (`billing`) e graduações (`graduations`). Este roadmap descreve a criação de um **portal do aluno** complementar, com três capacidades:

1. **Loja com reserva** — aluno vê produtos disponíveis (filtrados por estoque) e reserva para pagamento presencial.
2. **Lista de aulas** — aluno vê as aulas disponíveis (horário, professor, turma).
3. **Check-in de presença** — antes da aula, o aluno confirma "vou hoje" com um clique. O professor abre a aula e já tem a lista de quem confirmou.
4. **Placeholder PIX** — área financeira com layout QR/chave e aviso **"Em breve"** (sem pagamento online na v1).

A complexidade ficou substancialmente menor depois de retirarmos reconhecimento facial: sem dados biométricos, sem LGPD sensível, sem POC de modelo, sem fallback complexo. O foco vira pura experiência de uso e modelagem limpa.

---

## 2. Premissas confirmadas

- O aluno marca presença com **botão "estou presente"** dentro de uma janela antes da aula. Sem QR, código rotativo, GPS ou biometria.
- A marcação é **antes da aula (check-in)**, não durante. Quando a aula começa, o professor já abre a lista pronta.
- A loja é apenas **reserva com pagamento presencial** — sem gateway, sem PCI.
- **Pagamento PIX/QR online** fica fora da v1: apenas layout placeholder com **"Em breve"** em `/portal/financeiro`.
- Prefixo de rotas do aluno: **`/portal`** (grupo `(student)` no App Router).
- **Planos pedagógicos** (`lesson_plans`, módulo PED-) são domínio distinto das **aulas agendadas** (`class_sessions`, SPT-).
- Já existe um **painel do professor/academia** (este projeto), então o portal do aluno é um espaço novo, mas reutiliza Supabase, autenticação e padrões de UI já estabelecidos.
- Alunos podem ser **maiores ou menores de idade** — termo de uso precisa contemplar responsáveis, mas sem a complexidade que biometria traria.

---

## 3. Sistema atual — o que já existe

Análise feita em 23/05/2026 sobre `C:\dev\utopia\cascabjj`:

- **Stack:** Next.js 15 (App Router) + React 19 RC + TypeScript + Tailwind + shadcn/ui + Supabase (auth + Postgres) + Zod + react-hook-form + Vitest + Playwright.
- **Estrutura de rotas:**
  - `app/(auth)/login`, `app/(auth)/register` — autenticação
  - `app/(dashboard)/dashboard` — visão geral do professor/academia
  - `app/(dashboard)/students/[id]/edit`, `students/new`, `students/[id]/graduations` — gestão de alunos
  - `app/(dashboard)/billing/[studentId]` — financeiro por aluno
  - `app/(dashboard)/settings` — configurações
- **Camadas:** `actions/` (server actions), `components/` (UI por domínio), `lib/` (supabase, validações, datas, billing, graduation, hooks), `db/` (migrações/SQL).
- **Sinais importantes:**
  - Já há `scripts/validate-rls.cjs` — RLS é um padrão do projeto. O portal do aluno **precisa** entrar nesse mesmo padrão.
  - Scripts de import de planilha e reset de degrees sugerem que o domínio de aluno/graduação é o core consolidado.
  - **Aulas e produtos não estão modelados ainda** — serão domínios novos.

Conclusão: o portal do aluno se encaixa como um novo grupo de rotas (`app/(student)/...`) que reaproveita Supabase, RLS, padrões de actions/components e o próprio Aluno já existente como entidade.

---

## 4. Decisões (fechadas na Fase 0)

Cycle: `cycles/Q22026/0524-student-portal-foundation/`

| # | Decisão | Status | Resolução |
|---|---|---|---|
| ✅ D1 | Domínio vs subdomínio | **Fechada** | Mesmo domínio; grupo `(student)`; prefixo **`/portal`**; mesma instância Supabase |
| ✅ D2 | Auth: role vs entidade | **Fechada** | `profiles.role = student`; `students.user_id` → Auth; provisionamento pelo professor (Fase 1) |
| ✅ D3 | Janela de check-in | **Fechada** | Abre **6h** antes; fecha no horário de início (**America/Sao_Paulo**) |
| ✅ D4 | Presença sem check-in | **Fechada** | Professor marca manualmente (`origin = manual_instructor`) |
| ✅ D5 | Cancelar check-in | **Fechada** | Sim, até fechamento da janela (D3) |
| ⏸ D6 | Limite de vagas | **Adiada** | `capacity` nullable; bloqueio por lotação fora da v1 |
| ✅ D7 | Recorrência | **Fechada** | Recorrência semanal → instâncias `class_sessions` (janela 14 dias) |

### Decisões complementares

| # | Tema | Status | Resolução |
|---|---|---|---|
| Q1 | Check-in vs financeiro | **Adiada (v1)** | Não bloquear check-in; professor vê indicador **PBS-3** na lista |
| Q2 | Menores | **Fechada** | E-mail responsável + termo na Fase 1 |
| Q3 | Aluno → turma | **Fechada** | N:N via `student_class_enrollments` |
| Q4 | ROADMAP vs spec/ | **Fechada** | ROADMAP estratégico; contrato **SPT-** em `spec/` via `/update-spec` |

---

## 5. Modelo de dados — visão preliminar

Entidades novas ou impactadas. Nomes canónicos em inglês no schema (contrato **SPT-10**). Detalhes de DDL ficam para cycles de implementação — **sem migrations neste cycle**.

```
students (existente — ENT-4)
 ├── + user_id → auth.users (nullable)
 ├── student_class_enrollments (N:N)
 ├── check_ins
 ├── attendances (via sessões)
 └── reservations

classes (turma)
 ├── class_recurring_schedules
 └── class_sessions (instância)
       ├── check_ins
       └── attendances

check_ins
 ├── class_session_id, student_id, created_at
 └── cancelável pelo aluno até fim da janela (D3/D5)

attendances
 ├── class_session_id, student_id, recorded_at, recorded_by
 ├── origin: checkin_student | manual_instructor
 └── registro oficial pós-aula (≠ check_in)

products
 └── reservations (status, expires_at; estoque atómico na reserva)
```

Observação importante: **CheckIn e Presenca são separados**. Check-in é a intenção do aluno antes da aula; presença é o registro oficial confirmado pelo professor ou derivado do check-in. Isso permite que o professor:

- Confirme em lote ("todos que fizeram check-in estavam aqui") com um clique;
- Adicione alunos que não fizeram check-in mas apareceram;
- Remova alunos que fizeram check-in mas faltaram.

---

## 6. Fluxos principais

### 6.1 Check-in do aluno (antes da aula)

```
Aluno abre o portal
       │
       ▼
[Listagem de aulas com janela de check-in aberta]
       │
       ▼
Aluno clica "Estou presente" em uma aula
       │
       ▼
Backend valida:
  - Aluno inscrito na turma da sessão?
  - Janela de check-in aberta (D3)?
  - (v1) Financeiro NÃO bloqueia — professor vê PBS-3 na lista (Q1)
  - (pós-v1) Há vaga se capacity activo (D6 adiada)
       │
       ▼
CheckIn registrado → aluno vê confirmação + opção de cancelar
```

### 6.2 Visualização do professor

```
Professor abre uma aula no painel
       │
       ▼
Vê três blocos:
  1. Check-ins confirmados (lista crescente até o início)
  2. Capacidade (X de Y) — se aplicável
  3. Botão "Iniciar chamada"
       │
       ▼
Ao iniciar chamada (ou após a aula):
  - Confirma a lista (1 clique converte check-ins em presença)
  - Adiciona alunos que vieram sem check-in
  - Remove quem fez check-in mas faltou
```

### 6.3 Reserva na loja

```
Aluno abre a loja
       │
       ▼
Vê produtos com estoque > 0
       │
       ▼
Clica "Reservar"
       │
       ▼
Estoque reduz atomicamente → status "pendente_pagamento"
       │
       ▼
Aluno paga presencial → admin confirma no painel → status "paga"
       │
       ▼
Se expirar sem pagamento → estoque volta automaticamente
```

### 6.4 Placeholder PIX (Fase 1 — layout only)

```
Aluno abre /portal/financeiro
       │
       ▼
Vê secção QR code + chave PIX (placeholder)
       │
       ▼
Badge "Em breve" — acções desactivadas
       │
       ▼
Flag student-portal.payments.pix = false (default)
       │
       ▼
Nenhuma transacção processada
```

---

## 7. Roadmap em fases

### Fase 0 — Fundação ✅ (concluída)

Cycle: `Q22026/0524-student-portal-foundation`

Entregáveis concluídos:

- Decisões D1–D7 fechadas ou adiadas (secção 4)
- Modelo de dados consolidado (**SPT-10**)
- `spec-delta.md`, `scenarios.feature`, `plan.md`, `tasks.md`
- Feature flags planejadas:
  - `student-portal.enabled`
  - `student-portal.classes.checkin`
  - `student-portal.shop`
  - `student-portal.payments.pix` (placeholder "Em breve")
- Padrão RLS documentado (**SEC-3.7** proposto)

**Restrição do cycle:** zero código, zero SQL/migrations, zero alteração de dados.

### Fase 1 — Autenticação e onboarding do aluno (1–2 semanas)

Cycle sugerido: `student-portal-auth` (Large)

Objetivo: aluno consegue autenticar-se e ver shell inicial do portal.

Entregáveis:

- Grupo de rotas `app/(student)/portal/...` com layout separado
- Login partilhado `/login` com redirect por role → `/portal` ou `/painel`
- Onboarding: aceite de termo; menores: e-mail responsável (Q2)
- Vínculo `students.user_id` ↔ Auth
- Middleware: role `student` vs operacional
- Página inicial com saudação
- **`/portal/financeiro`**: layout PIX/QR com **"Em breve"** (SPT-9)

Critério de aceite: aluno provisionado faz login, vê `/portal`; RLS impede ver dados de outro aluno; PIX mostra placeholder sem pagamento real.

### Fase 2 — Aulas e check-in (2 semanas)

Esta é a fase central do roadmap.

Entregáveis:

- Modelagem de `Turma`, `AulaRecorrente`, `Aula`
- Painel do professor: cadastrar turmas, definir aulas recorrentes, gerar instâncias para a semana
- Portal do aluno: listagem de aulas da turma do aluno na próxima semana
- Botão "Estou presente" com:
  - Validação da janela de check-in (D3)
  - Financeiro: alerta ao professor, sem bloqueio na v1 (Q1)
  - Cancelamento dentro da janela (D5)
- Painel do professor: tela da aula com lista de check-ins ao vivo
- Conversão check-in → presença ao final da aula
- Marcação manual de presença pelo professor (D4)

Critério de aceite: aluno faz check-in, professor abre a aula e vê a lista pronta, encerra a chamada com 1 clique. Histórico de presença fica registrado.

### Fase 3 — Loja com reserva (1–2 semanas)

Entregáveis:

- Modelagem de `Produto` e `Reserva`
- Painel do professor/academia: CRUD de produtos com controle de estoque
- Portal do aluno: vitrine filtrando `estoque > 0` e detalhe do produto
- Fluxo de reserva: redução atômica de estoque, status, expiração automática
- Painel do professor: lista de reservas pendentes, confirmação de pagamento (status → "paga"), notas
- Notificações simples ao aluno (reserva criada, prestes a expirar)

Critério de aceite: aluno reserva, professor vê na fila, confirma pagamento presencial, fluxo fecha. Reservas expiradas devolvem estoque sem intervenção manual.

### Fase 4 — Refinamentos e observabilidade (contínuo)

Entregáveis:

- Histórico do aluno: aulas frequentadas, reservas feitas
- Métricas para o professor: taxa de check-in vs. presença real, alunos faltosos
- Notificações por e-mail/push para lembrar do check-in (opcional)
- Testes E2E (Playwright) cobrindo os fluxos críticos
- Auditoria de acessos via RLS validada por `validate-rls.cjs`

---

## 8. Integração com o projeto atual

Tudo encaixa nas convenções já estabelecidas:

- **Rotas:** novo grupo `app/(student)/` paralelo a `(auth)` e `(dashboard)`. Middleware decide para onde mandar o usuário com base na role.
- **Server actions:** novos arquivos em `actions/` por domínio (`actions/checkins.ts`, `actions/reservations.ts`, `actions/classes.ts`).
- **Components:** novas pastas em `components/classes/`, `components/shop/`, `components/student/` seguindo o padrão de `components/students/`, `components/billing/` etc.
- **Validação:** schemas Zod em `lib/validations/`.
- **RLS:** novas tabelas seguem o padrão validado por `scripts/validate-rls.cjs`. Aluno só vê suas próprias aulas, check-ins e reservas; professor vê da academia dele.
- **Migrações:** novas migrações em `db/` aplicadas via `scripts/apply-db.cjs`.
- **Testes:** Vitest para unidade (validações Zod, lógica de janela de check-in), Playwright para E2E.

---

## 9. Riscos e mitigação

| Risco | Impacto | Probabilidade | Mitigação |
|---|---|---|---|
| Check-in vira "marca de casa": aluno marca presente e não vai | Médio | Alta | Professor converte check-in → presença na aula; check-in não vale como presença oficial sozinho |
| Modelagem de aula recorrente fica complexa demais | Médio | Média | Começar com geração simples (script semanal expande próximos N dias); evoluir depois |
| RLS mal configurada vaza dados entre alunos | Alto | Baixa | `validate-rls.cjs` já existe; usar o mesmo padrão e incluir testes |
| Estoque vai negativo em corridas (dois alunos reservam o último) | Médio | Média | Reduzir estoque em transação com lock pessimista ou `update ... where estoque > 0` |
| Aluno menor sem responsável vinculado consegue se cadastrar | Médio | Média | Validação no onboarding + flag visível no painel do professor |

---

## 10. Próximos passos

Em ordem:

1. **Checkpoint humano** — aprovar escopo em `validation.md` (task 8)
2. **`/update-spec`** — promover `spec-delta.md` → `spec/features/student-portal/readme.md`
3. **`/create-cycle`** → `student-portal-auth` (Fase 1)
4. Implementar Fase 1, depois Fase 2 (core), depois Fase 3

---

## 11. Glossário

- **Check-in:** intenção do aluno de comparecer, registrada antes da aula. Não é presença oficial.
- **Presença (`attendance`):** registro consolidado pelo professor após a aula. Pode vir de check-in confirmado ou marcação manual.
- **Janela de check-in:** intervalo em que o aluno pode confirmar (6h antes até horário de início — D3).
- **Aula recorrente (`class_recurring_schedule`):** template semanal que gera `class_sessions`.
- **Plano pedagógico (`lesson_plan`, PED-):** conteúdo mensal do professor — **não** confundir com aulas agendadas (SPT-).
- **SPT-:** prefixo de regras do Portal do Aluno (`spec-delta.md` / futuro `spec/features/student-portal/readme.md`).
- **RLS:** Row-Level Security do Postgres/Supabase. Já é padrão no projeto.
- **SDD:** Spec-Driven Development via Harness (`cycles/` + `spec/`).
