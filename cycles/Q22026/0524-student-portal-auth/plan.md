# plan.md — Large Cycle

## Cycle: student-portal-auth
## Gerado em: 2026-05-24

---

## Resumo do plano

Primeira entrega **com código** do Portal do Aluno (Fase 1). Abordagem em **3 stages** com checkpoint humano entre cada uma:

1. **Infra** — rotas `(student)/portal`, constantes em `lib/routes.ts`, middleware com guards por role e feature flag master.
2. **Auth e onboarding** — redirect pós-login (**AUTH-8**), helpers de role, fluxo de provisionamento pelo professor, onboarding do aluno (termo + responsável para menores), bloqueio de aluno arquivado/removido.
3. **Shell e PIX placeholder** — layout do portal espelhando padrões do dashboard, navegação pt-BR, páginas placeholder (aulas/loja), `/portal/financeiro` com layout QR/chave e aviso **"Em breve"**.

**Restrição central do request:** **sem SQL / migrations / DDL** neste cycle. O código assume o contrato **SPT-2.3** (`students.user_id`) e **AUTH-8** (`profiles.role`), mas colunas e RLS (**SEC-3.7**) entram num **cycle dedicado de schema** a pedido explícito. Tasks de validação E2E que dependem de DB ficam `blocked` até esse cycle.

---

## Decisões tomadas no refine

| # | Tema | Decisão |
|---|---|---|
| D-R1 | Isolamento de papéis | **Estrito:** `student` acede só prefixos `/portal`; operacional acede só prefixos operacionais (**SHELL-2** sem `/portal`). Cross-access → redirect para home do papel (`/portal` ou `/painel`). |
| D-R2 | Feature flags | Variáveis de ambiente em `lib/feature-flags/student-portal.ts` (default `false`, alinhado **SPT-11**). Master desligada → página de indisponibilidade em `/portal` (não 404). |
| D-R3 | Flag `student-portal.enabled` desligada | Aluno autenticado vê mensagem de indisponibilidade; operacional inalterado. |
| D-R4 | Provisionamento (AUTH-8.3) | Fase 1: UI no perfil/ficha do aluno (`/alunos/[id]`) — associar e-mail Auth existente **ou** disparar convite (Supabase invite / magic link conforme capacidade atual). Detalhe fino na Stage 2. |
| D-R5 | Onboarding aluno | Rota `/portal/onboarding` (ou step no layout) antes de aceder conteúdo: aceite termo; se `kind = kids` ou menor, e-mail responsável obrigatório (**SPT-2.4**). Persistência depende de cycle DB (campos a definir no cycle de schema). |
| D-R6 | Schema ausente | Código preparado (types, queries, actions); validação runtime **parcial** até cycle de migrations. Documentar em `implementation-notes.md`. |

---

## Stages

### Stage 1 — Infra de rotas e middleware
- **Objetivo:** Grupo `(student)`, rotas `/portal/*` respondendo, middleware protegendo sessão e isolando papéis, feature flag master consultável.
- **Tasks:** ver `tasks.md` — Stage 1
- **Arquivos principais:** `lib/routes.ts`, `lib/supabase/middleware.ts`, `lib/feature-flags/student-portal.ts`, `lib/auth/roles.ts`, `app/(student)/layout.tsx`, `app/(student)/portal/**/page.tsx` (stubs mínimos)
- **Critério de saída:** Anónimo em `/portal` → `/login`; sessão operacional em `/portal` → `/painel`; flag desligada → página indisponibilidade; `pnpm build` passa.

### Stage 2 — Auth, vínculo e onboarding
- **Objetivo:** Redirect pós-login por role; helpers `getStudentForCurrentUser()`; UI de provisionamento professor; fluxo onboarding aluno; guard de aluno arquivado/removido.
- **Tasks:** ver `tasks.md` — Stage 2
- **Arquivos principais:** `app/(auth)/login/login-form.tsx`, `lib/auth.ts`, `lib/auth/student-context.ts`, `actions/student-portal/provision-access.ts`, `actions/student-portal/onboarding.ts`, `lib/validations/student-portal.ts`, `components/student/onboarding-form.tsx`, `components/students/provision-portal-access.tsx`
- **Critério de saída:** Login com role `student` (quando coluna existir) → `/portal`; professor provisiona vínculo na UI; onboarding bloqueia conteúdo até aceite; aluno arquivado bloqueado. *Validação completa depende de cycle DB.*

### Stage 3 — Shell e placeholder PIX
- **Objetivo:** Shell completo do portal (nav, header, responsivo), home com saudação, placeholders aulas/loja, `/portal/financeiro` com layout PIX **"Em breve"**.
- **Tasks:** ver `tasks.md` — Stage 3
- **Arquivos principais:** `components/student/student-shell.tsx`, `components/student/student-nav.tsx`, `components/student/pix-placeholder.tsx`, `app/(student)/portal/page.tsx`, `app/(student)/portal/financeiro/page.tsx`
- **Critério de saída:** Navegação funcional entre rotas `/portal/*`; PIX placeholder visível com ações desabilitadas; flag `student-portal.payments.pix` respeitada; smoke manual documentado.

---

## Arquivos afetados (visão geral)

| Arquivo | Stage(s) | Tipo de mudança |
|---|---|---|
| `lib/routes.ts` | 1 | edit — rotas `/portal`, prefixos autenticados |
| `lib/supabase/middleware.ts` | 1, 2 | edit — guards role + flag |
| `middleware.ts` | 1 | edit (se necessário) |
| `lib/feature-flags/student-portal.ts` | 1, 3 | create |
| `lib/auth/roles.ts` | 1, 2 | create |
| `lib/auth/student-context.ts` | 2 | create |
| `lib/auth.ts` | 2 | edit — role no profile |
| `lib/validations/student-portal.ts` | 2 | create |
| `app/(student)/layout.tsx` | 1, 3 | create |
| `app/(student)/portal/page.tsx` | 1, 3 | create |
| `app/(student)/portal/aulas/page.tsx` | 1, 3 | create |
| `app/(student)/portal/loja/page.tsx` | 1, 3 | create |
| `app/(student)/portal/financeiro/page.tsx` | 1, 3 | create |
| `app/(student)/portal/onboarding/page.tsx` | 2 | create |
| `app/(auth)/login/login-form.tsx` | 2 | edit — redirect por role |
| `actions/student-portal/provision-access.ts` | 2 | create |
| `actions/student-portal/onboarding.ts` | 2 | create |
| `components/student/student-shell.tsx` | 3 | create |
| `components/student/student-nav.tsx` | 3 | create |
| `components/student/pix-placeholder.tsx` | 3 | create |
| `components/student/onboarding-form.tsx` | 2 | create |
| `components/students/provision-portal-access.tsx` | 2 | create |
| `app/(dashboard)/students/[id]/edit/page.tsx` ou perfil SPR | 2 | edit — secção provisionamento |
| `spec/features/security-e2e/route-inventory.md` | 3 | edit (via spec-delta pós-validação) |

---

## Specs afetadas

- `spec/features/student-portal/readme.md` — estado Fase 1 implementada; referências de artefactos
- `spec/features/authentication/readme.md` — **AUTH-8** em vigor; **AUTH-2.1/2.2** evoluídos para redirect por role
- `spec/features/app-shell/readme.md` — **SHELL-9** shell do aluno; remover nota "não expõe"
- `spec/features/students-crud/readme.md` — **STU-12** provisionamento portal (proposta)
- `spec/features/security-e2e/route-inventory.md` — rotas `/portal/*`

---

## Riscos globais

| Risco | Probabilidade | Stage afetada | Mitigação |
|---|---|---|---|
| `profiles.role` e `students.user_id` inexistentes no schema actual | **Alta** | 2 | Código preparado; validação E2E `blocked` até cycle DB; documentar em `implementation-notes.md` |
| Middleware não consegue ler role sem query extra | Média | 1–2 | Helper `resolveAuthRole()` com cache por request; minimizar round-trips |
| Convite Supabase indisponível no plano/host | Média | 2 | Fallback: associar e-mail de Auth existente apenas na v1; convite como enhancement |
| Confusão `/portal/aulas` vs `/pedagogico/planos` | Baixa | 3 | Copy e nav distintos; glossário **SPT-0.3** |
| Flag master desligada em prod bloqueia rollout parcial | Baixa | 1 | Documentar activação em `.env`; default `false` |

---

## Fora de escopo (confirmado)

- Migrations, SQL, DDL, policies RLS novas
- Listagem funcional de aulas, check-in, loja, reservas
- Pagamento PIX funcional
- Notificações, E2E completo de domínios Fase 2–3
- Refactor do dashboard professor além da secção de provisionamento

---

## Dependências entre stages

- **Stage 2** depende de: Stage 1 entregar rotas `/portal`, middleware base e flag master.
- **Stage 3** depende de: Stage 2 entregar redirect por role e guards de onboarding/arquivado (shell assume contexto aluno resolvido).

---

## Dependência externa (cycle futuro)

Cycle dedicado **`student-portal-schema`** (nome sugerido) deve entregar antes da validação completa da Stage 2:

- `profiles.role` (`professor` | `student`, default `professor`)
- `students.user_id` nullable FK → `auth.users`
- Campos onboarding: `terms_accepted_at`, `guardian_email` (ou equivalente)
- Políticas mínimas **SEC-3.7** para leitura do próprio `students`

---

## Perguntas abertas

- [ ] **Convite por e-mail:** Supabase Admin invite disponível no ambiente de deploy? Se não, Fase 1 fica só com "associar conta existente".
- [ ] **Texto do termo de uso:** usar template DOC existente ou copy estática mínima na Fase 1?
- [ ] **Cycle de schema:** abrir imediatamente após Stage 1 ou após fechar Stage 3?
