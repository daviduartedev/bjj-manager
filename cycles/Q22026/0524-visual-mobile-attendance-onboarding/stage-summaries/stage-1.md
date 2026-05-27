# Stage Summary — Stage 1: Melhoria visual UX/UI

## Cycle: 0524-visual-mobile-attendance-onboarding
## Data de fechamento: 2026-05-24

## O que foi entregue

Refresh visual do **núcleo operacional diário** (D-R1): lavagens `--content-wash-*`, acentos `--primary` / `--status-*`, chrome premium em layouts partilhados (hero, painéis, KPIs, empty states) e alinhamento cromático em login, painel, alunos, mensalidades, aulas e portal — **sem novas features de negócio**.

## Tasks concluídas

| # | Descrição | Status |
|---|---|---|
| 1.1 | Inventariar rotas D-R1 e baseline | done |
| 1.2 | Lavagens e cartões nos layouts partilhados | done |
| 1.3 | Acentos primary/status em navegação, heroes, KPIs | done |
| 1.4 | `/login` coerência cromática | done |
| 1.5 | `/painel` chrome premium | done |
| 1.6 | `/alunos/**` visual | done |
| 1.7 | `/mensalidades/**` visual | done |
| 1.8 | `/aulas/**` visual | done |
| 1.9 | `/portal/**` visual | done |
| 1.10 | Contraste claro + escuro | done |
| 1.11 | lint + type-check | done |
| 1.12 | Checklist visual manual | done (código; browser pendente) |
| 1.13 | Update spec DS-1.12 | done |

## Arquivos criados / modificados

### Cycle artifacts (create)
- `cycles/Q22026/0524-visual-mobile-attendance-onboarding/implementation-notes.md` — create
- `cycles/Q22026/0524-visual-mobile-attendance-onboarding/validation.md` — create
- `cycles/Q22026/0524-visual-mobile-attendance-onboarding/review.md` — create
- `cycles/Q22026/0524-visual-mobile-attendance-onboarding/stage-summaries/stage-1.md` — create

### Código (edit)
- `app/globals.css` — tokens wash, utilitários dashboard
- `components/layout/dashboard-page-hero.tsx` — badge e acento hero
- `components/layout/dashboard-panel.tsx` — chrome premium
- `components/layout/dashboard-stat-tile.tsx` — prop `accent`
- `components/layout/empty-state.tsx` — lavagem status-info
- `app/(auth)/login/login-form.tsx` — tokens no card
- `components/painel/painel-dashboard.tsx` — KPIs status tokens
- `app/(dashboard)/painel/page.tsx` — alerta tokenizado
- `app/(dashboard)/alunos/page.tsx` — stat tile accent
- `components/students/students-list.tsx` — header chrome
- `components/students/student-profile-client.tsx` — alertas pending
- `app/(dashboard)/alunos/[id]/editar/page.tsx` — alerta pending
- `components/billing/mensalidades-month-finance-panel.tsx` — status-paid
- `components/billing/mensalidades-client.tsx` — labels tokenizados
- `components/billing/mensalidades-detail-client.tsx` — labels tokenizados
- `app/(dashboard)/aulas/page.tsx` — hover sessões
- `components/classes/session-check-ins-panel.tsx` — lista chrome
- `app/(student)/portal/onboarding/page.tsx` — hero + panel
- `app/(student)/portal/indisponivel/page.tsx` — hero + empty
- `app/(student)/portal/bloqueado/page.tsx` — hero + empty
- `components/student/class-session-card.tsx` — acento card
- `components/student/pix-placeholder.tsx` — borda primary

### Spec (edit)
- `spec/features/design-system/readme.md` — DS-1.12 utilitários + Stage 1

## Validação

| Comando | Resultado |
|---------|-----------|
| Lint | PASS |
| Typecheck | PASS |
| Testes | N/A (stage visual) |
| Build | N/A (não executado) |

## Cenários validados

| Cenário | Status |
|---------|--------|
| Núcleo operacional usa acentos BJJ em vez de excesso de branco | PASS (código + inventário rotas) |
| Portal do aluno mantém coerência visual com o painel | PASS (código + componentes partilhados) |

## Decisões técnicas relevantes

- Leverage máximo em layouts partilhados (D-R2) em vez de polir cada formulário.
- KPIs e alertas migrados de `amber-*`/`emerald-*`/`rose-*` para `--status-*`.
- Glass `bg-white/[0.06]` na sidebar escura mantido intencionalmente (BUI-8).

## Tech debt identificado

- Dialogs billing (`post-payment-summary`, `receipt-viewer-dialog`) ainda com classes Tailwind não tokenizadas.
- Checklist browser §1.12 sem screenshots — sign-off humano recomendado.

## Bloqueios para a próxima stage

- Nenhum bloqueio técnico.
- Stage 2 é independente da Stage 1 (visual); sequência recomendada: aprovação humana → `/map-stage` Stage 2.

## Próxima stage

- **Stage 2:** Mobile robusto + presença (SPT-6.2–6.4) — aguardando aprovação humana
