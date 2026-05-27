# plan.md — Large Cycle

## Cycle: 0524-visual-mobile-attendance-onboarding
## Gerado em: 2026-05-24

---

## Resumo do plano

Cycle **Large** em **4 stages** sequenciais (checkpoint humano entre cada uma):

1. **Melhoria visual UX/UI** — reduzir sensação de branco no **núcleo operacional diário** via tokens BJJ existentes (`--content-wash-*`, `--primary`, `--status-*`), lavagens e hierarquia de cartões; **sem novas features de negócio** e **sem redesign de formulários** além do necessário para coerência.
2. **Mobile robusto + presença oficial** — validar fluxos prioritários em viewports mobile; implementar **SPT-6.2–6.4** (conversão check-in → `attendances`, presença manual, exclusão de faltosos); estados loading/empty/error; toasts Sonner nos fluxos tocados.
3. **Histórico de presença** — aba **Presença** em `/alunos/[id]` (professor) + rota **`/portal/presenca`** (aluno); total e listagem só de **`attendances`** oficiais; paginação **20** registos/página.
4. **Criar aluno + provisionar login** — estender **STU-12** / **AUTH-8**: professor cria utilizador Auth no servidor (Admin API); convite por e-mail quando houver e-mail; senha temporária como fallback; manter associação a Auth existente; toasts em cada passo.

**Pré-requisitos:** Fases 1–2 do portal (`0524-student-portal-auth`, `0524-student-portal-classes-checkin`) concluídas; design system e tokens BJJ em produção (**DS-1.11**, **DS-1.12**, **BUI-8**).

---

## Decisões tomadas no refine

| # | Tema | Decisão | Fonte |
|---|---|---|---|
| D-R1 | Stage 1 — rotas | **Núcleo operacional diário:** `/login`, shell dashboard + student, `/painel`, `/alunos` (+ subrotas), `/mensalidades`, `/aulas` (+ subrotas), `/portal` (+ subrotas activas). **Fora:** `/configuracoes`, `/perfil`, `/documentos`, `/pedagogico/*`, `/produtos`. | Humano **1.1-A** |
| D-R2 | Stage 1 — profundidade | **Mínimo necessário:** layouts partilhados (`DashboardShell`, `StudentShell`, hero/painéis, `globals.css`) + páginas listadas em D-R1; **não** polir cada formulário/campo salvo incoerência visual óbvia. Sem alterar comportamento existente. | Humano 1.2 + agente |
| D-R3 | Stage 1 — temas | Ao tocar tokens/superfícies, validar **tema claro e escuro** (**DS-1.7**, **DS-1.12**); contraste WCAG AA onde aplicável. | Humano + **DS-1.7** |
| D-R4 | Stage 1 — referência cromática | Lavagens `--content-wash-*` + acentos `--primary` / `--status-*`; **equilíbrio** (menos agressivo que graduation engine). | Agente (**7.1-C**) |
| D-R5 | Stage 2 — SPT-6.2–6.4 | **Obrigatório** na Stage 2 (pré-requisito de dados para Stage 3). | Humano **2.1-A** |
| D-R6 | Stage 2 — viewports | Matriz de validação manual: **320**, **375**, **414**, **768** px (largura); fluxos prioritários: `/portal/aulas`, `/aulas/sessao/[sessionId]`, navegação mobile (**SHELL-1.3**, **SHELL-9.3**). | Agente (**2.2**) |
| D-R7 | Stage 2 — toasts | **Sim** — Sonner com cantos rectos (**DS-1.8**) nos fluxos de check-in, presença e acções principais das páginas tocadas na stage. | Humano **2.3** |
| D-R8 | Stage 2 — testes | **Validação manual** documentada em `validation.md`; lint + type-check obrigatórios; **`/security-review`** antes de fechar Stage 2 (writes em `attendances`). | Humano **2.4** + agente |
| D-R9 | Stage 3 — navegação professor | Nova aba **Presença** em `/alunos/[id]` (**SPR-12**). | Humano **3.1-A** |
| D-R10 | Stage 3 — contagem | **Só `attendances` oficiais** (aulas em que o professor confirmou presença). `check_ins` não entram no total nem na listagem. | Humano **3.2** |
| D-R11 | Stage 3 — campos listagem | Por registo: **data da sessão**, **horário** (início–fim), **turma**, **professor**, **origem** (check-in do aluno / manual), **registado por** (nome do perfil `recorded_by`), **data/hora do registo** (`recorded_at`). Ordem cronológica **mais recente primeiro**. | Agente (**3.3**) |
| D-R12 | Stage 3 — paginação | **20 registos por página**; controlos «Anterior» / «Próxima»; mobile-first (cartões empilhados). | Humano **3.4** + agente |
| D-R13 | Stage 3 — portal aluno | **Sim** — rota **`/portal/presenca`** com item **Presença** na nav do aluno; aluno vê **apenas** os próprios `attendances`; mesma paginação e empty state. | Humano **3.5** |
| D-R14 | Stage 4 — fluxo UI | Cadastro em **`/alunos/novo`** (comportamento actual); provisionamento no **perfil** `/alunos/[id]` (secção existente `ProvisionPortalAccess` estendida). Após criar aluno, toast + CTA opcional «Provisionar acesso» no perfil. | Agente (**4.1-B**) |
| D-R15 | Stage 4 — credenciais | **Convite por e-mail** Supabase quando o aluno tem e-mail; **senha temporária** gerada no servidor (12 caracteres, mostrada **uma vez** na UI copiável) como fallback ou quando professor escolhe «Gerar senha»; **sem** troca obrigatória no 1.º login neste MVP. | Agente (**4.2-C**, **5.2**) |
| D-R16 | Stage 4 — e-mail | E-mail **obrigatório** para fluxo de convite; opcional para cadastro sem portal; senha temporária exige identificador (e-mail) para login. | Agente (**4.3-C**) |
| D-R17 | Stage 4 — coexistência | Manter **associar Auth existente** (**STU-12.1** actual) **e** novo fluxo **criar utilizador** (**STU-12.5**). | Agente (**4.6-A**) |
| D-R18 | Stage 4 — pós-provisionamento | Aluno autentica em `/login` → **`/portal`** (onboarding/termos se pendente, **SPT-2.4**). | Agente (**4.5-A**) |
| D-R19 | Rollout | **Um PR por stage**; sem novas feature flags além das existentes (`student-portal.*`); capacidades activas quando merged. | Agente (**6.x**) |
| D-R20 | Invariantes | RLS inalterado (**SEC-3.3**); `check_ins` ≠ `attendances` (**SPT-10.2**); Admin API só servidor (**AUTH-7.1**); aluno arquivado/removido sem provisionamento (**STU-12.3**). | Request |

---

## Stages

### Stage 1 — Melhoria visual UX/UI

- **Objetivo:** Interface menos branca no núcleo operacional; acentos BJJ via tokens; Sonner já conforme **DS-1.8** onde existir.
- **Rotas fechadas (D-R1):** ver tabela abaixo.
- **Tasks:** `tasks.md` — Stage 1
- **Arquivos principais:** `app/globals.css`, `components/layout/dashboard-shell.tsx`, `components/layout/dashboard-page-hero.tsx`, `components/layout/dashboard-panel.tsx`, `components/student/student-shell.tsx`, páginas listadas em D-R1.
- **Critério de saída:** Rotas listadas usam lavagens/cartões/acentos sem hex arbitrários; tema claro + escuro legíveis; lint + type-check; checklist visual manual em `validation.md`.

#### Rotas Stage 1 (lista fechada)

| Área | Rotas |
|------|--------|
| Auth | `/login` |
| Dashboard shell | Layout partilhado (sidebar, bottom nav, drawer) |
| Painel | `/painel` |
| Alunos | `/alunos`, `/alunos/novo`, `/alunos/[id]`, `/alunos/[id]/editar`, `/alunos/[id]/graduacoes` |
| Mensalidades | `/mensalidades`, `/mensalidades/[studentId]` |
| Aulas | `/aulas`, `/aulas/turmas`, `/aulas/turmas/nova`, `/aulas/turmas/[classId]`, `/aulas/sessao/[sessionId]` |
| Portal | `/portal`, `/portal/aulas`, `/portal/onboarding`, `/portal/loja`, `/portal/financeiro`, stubs `indisponivel`/`bloqueado` |

### Stage 2 — Mobile robusto + presença (SPT-6.2–6.4)

- **Objetivo:** Fluxos check-in (portal) e presença (professor) legíveis e funcionais em 320–768px; implementar conversão em lote, presença manual e exclusão de faltosos; estados loading/empty/error; toasts.
- **Tasks:** `tasks.md` — Stage 2
- **Arquivos principais:** `app/(dashboard)/aulas/sessao/[sessionId]/**`, `components/classes/session-check-ins-panel.tsx`, `actions/classes.ts` (ou `actions/attendances.ts`), `lib/data/class-session-check-ins.ts`, `components/student/**`, `app/(student)/portal/aulas/**`.
- **Critério de saída:** Professor converte check-ins, regista manual e exclui faltosos; aluno check-in/cancelamento OK em viewports D-R6; separação check-in ≠ attendance mantida; `/security-review` registado; validação manual em `validation.md`.

**SPT-6.2 (conversão):** acção «Confirmar presença» na sessão — insert em `attendances` para check-ins seleccionados ou todos, `origin = checkin_student`, `recorded_by` = professor actual.

**SPT-6.3 (manual):** adicionar aluno inscrito na turma sem check-in, `origin = manual_instructor`.

**SPT-6.4 (exclusão):** remover aluno da lista final de presença da sessão (delete `attendance`); check-in permanece.

### Stage 3 — Histórico de presença (SPR-12, SPT-13)

- **Objetivo:** Professor vê total + histórico paginado na aba **Presença**; aluno vê histórico próprio em **`/portal/presenca`**.
- **Tasks:** `tasks.md` — Stage 3
- **Arquivos principais:** `app/(dashboard)/alunos/[id]/page.tsx`, `components/students/student-profile-client.tsx`, `components/students/student-attendance-tab.tsx`, `app/(student)/portal/presenca/page.tsx`, `lib/data/student-attendances.ts`, `components/student/student-attendance-list.tsx`, `components/student/student-nav.tsx`, `lib/routes.ts`.
- **Critério de saída:** Total = count(`attendances`); listagem com campos D-R11; empty state quando zero; paginação 20; mobile legível; RLS aluno só vê próprios registos; validação manual.

### Stage 4 — Criar aluno + provisionar login (STU-12.5+, AUTH-8.4+)

- **Objetivo:** Professor provisiona login criando Auth (não só associar existente); convite e/ou senha temporária; toasts; bloqueio para arquivado/removido.
- **Tasks:** `tasks.md` — Stage 4
- **Arquivos principais:** `actions/student-portal/provision-access.ts`, `components/students/provision-portal-access.tsx`, `lib/supabase/admin.ts`, `lib/validations/student-portal.ts`, `app/(auth)/login/**`.
- **Critério de saída:** Professor cria utilizador + liga `students.user_id`; aluno login → `/portal`; toasts sucesso/erro; `/security-review` antes de fechar; validação manual provisionamento + login.

---

## Arquivos afetados (visão geral)

| Arquivo / área | Stage(s) | Tipo |
|---|---|---|
| `app/globals.css`, layout components | 1 | edit |
| Páginas núcleo D-R1 | 1 | edit |
| `components/classes/session-check-ins-panel.tsx` | 2 | edit — presença |
| `actions/*` attendances | 2 | create/edit |
| `components/student/*`, portal aulas | 2 | edit — mobile |
| `components/students/student-attendance-tab.tsx` | 3 | create |
| `app/(student)/portal/presenca/page.tsx` | 3 | create |
| `lib/data/student-attendances.ts` | 3 | create |
| `components/students/provision-portal-access.tsx` | 4 | edit |
| `actions/student-portal/provision-access.ts` | 4 | edit |
| `spec/features/*` | 1–4 | edit (por stage) |

---

## Specs afetadas

| Spec | Alteração |
|------|-----------|
| `spec/features/design-system/readme.md` | Cross-ref ciclo visual (opcional mínimo) |
| `spec/features/app-shell/readme.md` | **SHELL-2**, **SHELL-9** — `/portal/presenca` |
| `spec/features/student-portal/readme.md` | **SPT-6.2–6.4** implementados; **SPT-13** histórico aluno |
| `spec/features/student-profile/readme.md` | **SPR-12** aba Presença |
| `spec/features/students-crud/readme.md` | **STU-12.5–12.7** criar Auth |
| `spec/features/authentication/readme.md` | **AUTH-8.4–8.6** provisionamento |
| `spec/frontend.md` | Viewports de referência (nota) |

---

## Riscos globais

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Stage 1 scope creep (redesign infinito) | Alta | Lista fechada D-R1; profundidade D-R2 |
| Stage 3 sem dados | Baixa (D-R5) | SPT-6.2 obrigatório na Stage 2 |
| Provisionamento inseguro | Média | Admin API só servidor; `/security-review` Stage 4 |
| Cores comprometem legibilidade | Média | WCAG AA; validar ambos temas |
| Regressão portal/painel | Média | Smoke manual por stage; lint + type-check |

---

## Fora de escopo (confirmado)

- Redesign profundo de `/documentos`, `/pedagogico`, `/configuracoes`, `/produtos`
- Loja funcional, PIX funcional, QR/GPS/biometria
- Autocadastro público (**AUTH-1.2**)
- Troca obrigatória de senha no 1.º login
- Notificações push/e-mail transaccionais avançadas
- Unificar `check_ins` e `attendances`

---

## Dependências entre stages

- **Stage 2** pode iniciar após Stage 1 (visual independente de presença, mas recomendado sequencial).
- **Stage 3** depende de Stage 2 (**SPT-6.2** gera `attendances`).
- **Stage 4** independente de Stage 3 (pode paralelizar após Stage 1 se aprovado — **sequência recomendada:** 1 → 2 → 3 → 4).

---

## Perguntas abertas (resolvidas)

- [x] Rotas Stage 1 — **D-R1**
- [x] SPT-6.2–6.4 — **obrigatório Stage 2**
- [x] Histórico professor — aba **Presença**
- [x] Contagem — só **`attendances`**
- [x] Portal aluno — **`/portal/presenca`**
- [x] Stage 4 — defaults **D-R14–D-R18** (não contestados)

---

## Próximo passo

Após aprovação humana deste refine: **`/map-stage`** para Stage 1, depois **`/execute-stage`**.
