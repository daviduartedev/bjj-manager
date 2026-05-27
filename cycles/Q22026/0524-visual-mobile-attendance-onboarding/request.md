# request.md — Large Cycle

## Cycle
- **Path:** `cycles/Q22026/0524-visual-mobile-attendance-onboarding/`
- **Tipo:** Large
- **Data:** 2026-05-24
- **Autor:** {nome}

---

## Contexto

O sistema operacional e o portal do aluno estão funcionalmente maduros (check-in Fase 2 implementado em `0524-student-portal-classes-checkin`), mas a interface transmite sensação de **excesso de branco** e pouca vida cromática — apesar da paleta BJJ e dos tokens já existirem no design system.

A maioria dos utilizadores acede pelo **telemóvel**; os fluxos de check-in e presença são o núcleo operacional diário. Paralelamente, faltam visibilidade de **histórico de aulas por aluno** no perfil do professor e um fluxo integrado para o professor **criar aluno e provisionar login** ao portal (hoje **STU-12** só associa utilizador Auth existente).

Este cycle entrega progressivamente: refresh visual global, validação mobile robusta, histórico de presença e onboarding com credenciais — **uma stage por vez**, com aprovação humana entre stages.

---

## O que precisa ser feito

Cycle Large em **4 stages sequenciais**:

1. **Stage 1 — Melhoria visual UX/UI** — reduzir interface branca; aplicar paleta BJJ e tokens existentes em todo o núcleo operacional (shell, painel, alunos, mensalidades, aulas, portal, login). Sem novas features de negócio.

2. **Stage 2 — Mobile robusto + UX viva** — validar funcionalidade mobile em todos os tamanhos relevantes (ex.: 320px, 375px, 414px+); fluxos prioritários de check-in (portal aluno) e presença (professor); toques ≥ 44px; estados loading/empty/error; toasts Sonner; incluir **SPT-6.2–6.4** (conversão check-in → attendance, presença manual, exclusão de faltosos) se necessário para dados reais de presença.

3. **Stage 3 — Histórico de presença por aluno** — perfil `/alunos/[id]` mostra **total de aulas frequentadas** e listagem cronológica de `attendances` (spec-delta **SPR-**).

4. **Stage 4 — Criar aluno + provisionar login** — professor cria aluno e gera acesso ao portal; aluno acede a `/portal`; feedbacks visuais com toasts em criação, provisionamento e login (spec-delta **STU-12** / **AUTH-8**).

O detalhamento por stage vem no `plan.md` após `/refine-request`.

---

## Motivação / valor

Tornar o sistema **mais moderno, colorido e confiável no mobile** — canal principal —; dar ao professor visibilidade de frequência por aluno; e eliminar fricção no onboarding de alunos com login ao portal, com feedback claro em cada passo.

---

## Critérios de aceite (alto nível)

- [ ] **Stage 1:** interface menos branca; acentos BJJ visíveis via tokens em shell, painel, alunos, mensalidades, aulas, portal e login; sem hex arbitrários fora do design system
- [ ] **Stage 2:** fluxos de check-in (portal) e presença (professor) funcionam e são legíveis em 320px–414px+; UX viva com cores; toasts em acções principais; toque ≥ 44px nos controlos críticos
- [ ] **Stage 2 (presença):** professor converte check-ins em presença oficial (**SPT-6.2–6.4**) quando incluído no plano da stage
- [ ] **Stage 3:** perfil do aluno mostra total de aulas e histórico de `attendances`; empty state quando vazio; mobile legível
- [ ] **Stage 4:** professor cria aluno e provisiona login; aluno autentica e acede a `/portal`; toasts de sucesso/erro em criação, provisionamento e login
- [ ] **Stage 4:** aluno arquivado/removido não recebe provisionamento (**STU-12.3**)
- [ ] RLS e isolamento por tenant inalterados (**SEC-3.3**); separação check-in ≠ attendance mantida (**SPT-10.2**)
- [ ] Fases anteriores do portal e painel professor permanecem funcionais — sem regressão

---

## Stages previstas (estimativa inicial)

> Refinamento real ocorre em `/refine-request`. Executar uma stage por vez (`/map-stage` → `/execute-stage` → `/close-stage`).

1. **Stage 1 — Melhoria visual UX/UI** — aplicar tokens BJJ (`--content-wash-*`, `--primary`, `--status-*`), lavagens, cartões e hierarquia visual; reduzir sensação de branco em todo o núcleo operacional; Sonner conforme **DS-1.8**.
2. **Stage 2 — Mobile robusto + UX viva** — validar e corrigir em múltiplos viewports; fluxos `/portal/aulas`, `/aulas/sessao/[sessionId]`, navegação mobile (**SHELL-1.3**); completar **SPT-6.2–6.4** se necessário; estados loading/empty/error.
3. **Stage 3 — Histórico de presença por aluno** — separador ou rota no perfil; total + listagem de `attendances`; spec-delta **SPR-**.
4. **Stage 4 — Criar aluno + provisionar login** — extensão **STU-12**; Admin API só servidor; toasts; spec-delta **STU-12** / **AUTH-8**.

---

## Restrições e riscos conhecidos

**Restrições:**

- Usar paleta e tokens BJJ existentes — sem cores fora do design system (**DS-1.2**)
- Toasts via **Sonner**, cantos rectos (**DS-1.8**)
- Mobile-first; validar múltiplos viewports na Stage 2
- `check_ins` ≠ `attendances` — nunca unificar (**SPT-10.2**)
- `account_id` nunca aceite do cliente (**SEC-3.3**, **STU-2.1**)
- Provisionamento Auth: Admin API / service role **apenas no servidor**, nunca no browser (**AUTH-7.1**)
- Uma stage por vez; não avançar sem aprovação humana explícita

**Riscos:**

- Stage 1 crescer para redesign infinito — mitigar com lista fechada de rotas no `plan.md`
- Stage 3 sem dados se **SPT-6.2** não estiver concluído na Stage 2 — incluir conversão na Stage 2
- Provisionamento inseguro na Stage 4 — review `/security-review` antes de fechar
- Cores vivas comprometerem legibilidade — validar contraste WCAG AA (**DS-1.12**)

**Open questions (resolvidas em `/refine-request`):**

- [x] Stage 1: **núcleo operacional diário** (D-R1) — ver `plan.md`
- [x] Stage 3: aba **Presença** em `/alunos/[id]` (**SPR-12**)
- [x] Stage 4: convite por e-mail **+** senha temporária fallback (**STU-12.6**, **AUTH-8.5**)
- [x] Contagem: **só `attendances` oficiais**
- [x] Portal aluno: **`/portal/presenca`** (**SPT-13**)

---

## Fora de escopo

- Redesign de módulos pedagógicos/documentos além do mínimo para coerência visual
- Loja do portal (**SPT-8**), PIX funcional (**SPT-9**)
- QR code, GPS ou biometria para check-in
- App nativo (apenas web responsiva)
- Autocadastro público (**AUTH-1.2**)
- Portal do aluno ver o próprio histórico de presença — **incluído Stage 3** (`/portal/presenca`, **SPT-13**)
- Notificações push/e-mail transaccionais avançadas

---

## Specs relevantes

- `spec/frontend.md`
- `spec/security.md`
- `spec/features/design-system/readme.md` (**DS-**)
- `spec/features/app-shell/readme.md` (**SHELL-**)
- `spec/features/student-portal/readme.md` (**SPT-**)
- `spec/features/students-crud/readme.md` (**STU-**, **STU-12**)
- `spec/features/student-profile/readme.md` (**SPR-**)
- `spec/features/authentication/readme.md` (**AUTH-7**, **AUTH-8**)
- `spec/features/billing-ui/readme.md` (**BUI-8**)
- `spec/features/rls-security/readme.md` (**SEC-3.7**)

---

## Referências

- `docs/design/style-guide.md`
- Cycle anterior: `cycles/Q22026/0524-student-portal-classes-checkin/`
- Cycle anterior: `cycles/Q22026/0524-student-portal-auth/`
- Cycle design system: `cycles/Q22026/03-0430-design-system/`
