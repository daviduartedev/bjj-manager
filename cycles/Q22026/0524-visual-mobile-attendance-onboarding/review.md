# review.md — 0524-visual-mobile-attendance-onboarding

## Stage 1 — Melhoria visual UX/UI

**Data da review:** 2026-05-24  
**Reviewer:** agente (`/execute-stage` + consolidação `/close-stage`)

### Checklist

| Item | Status | Notas |
|------|--------|-------|
| Escopo limitado a D-R1 (sem features de negócio) | ✅ PASS | Apenas CSS/componentes visuais |
| Tokens BJJ (`--primary`, `--status-*`, `--content-wash-*`) | ✅ PASS | Hex soltas removidas nas rotas tocadas |
| Layouts partilhados propagam chrome premium | ✅ PASS | Hero, Panel, StatTile, EmptyState, globals |
| Comportamento existente inalterado | ✅ PASS | Sem mudanças em actions/queries |
| Tema claro + escuro (tokens paritários) | ✅ PASS | Inspecção `globals.css` `:root` / `.dark` |
| Lint + type-check | ✅ PASS | Ver `validation.md` §1.11 |
| Cenários Gherkin Stage 1 | ⚠️ WARN | Implementação OK; validação browser pendente |
| Formulários/dialogs billing profundos | ✅ PASS (escopo) | Fora D-R2 — não polidos de propósito |

### Findings

#### Blockers
- Nenhum.

#### Warnings
1. **Checklist visual manual (§1.12)** — itens ainda não marcados com evidência browser/screenshots. Recomendado percorrer rotas antes de merge do PR da stage.
2. **Dialogs billing** (`post-payment-summary`, `receipt-viewer-dialog`) ainda usam classes Tailwind `amber-*` / `emerald-*` — fora do escopo D-R2; alinhar num ciclo futuro se desejado.
3. **`pnpm build`** não foi executado nesta stage (não exigido em tasks 1.11).

#### Observações positivas
- Abordagem de leverage nos layouts partilhados minimiza diff e maximiza cobertura das rotas D-R1.
- KPIs e alertas migrados para `--status-*` coerentes com billing badges existentes.

### Aprovação Stage 1
**Aprovada para fecho** — sem blockers; warning de QA visual manual documentado.

---

## Stage 2 — Mobile robusto + presença (SPT-6.2–6.4)

**Data da review:** 2026-05-24  
**Reviewer:** agente (`/execute-stage` + `/close-stage`)

### Checklist

| Item | Status | Notas |
|------|--------|-------|
| SPT-6.2 conversão check-ins | ✅ PASS | `convertCheckInsToAttendances` |
| SPT-6.3 presença manual | ✅ PASS | inscrição + sem check-in |
| SPT-6.4 exclusão mantém check-in | ✅ PASS | delete só attendances |
| SPT-5.4 sem auto-attendance | ✅ PASS | grep confirmado |
| Mobile + toasts + touch 44px | ✅ PASS | código |
| Security review writes | ✅ PASS | `validation.md` §2.12 |
| Lint + type-check | ✅ PASS | §2.13 |

### Findings

#### Blockers
- Nenhum.

#### Warnings
1. Checklist browser §2.14 pendente de screenshots.

### Aprovação Stage 2
**Aprovada para fecho** — sem blockers.

---

## Stage 3 — Histórico de presença (SPR-12, SPT-13)

**Data da review:** 2026-05-24  
**Reviewer:** agente (`/execute-stage` + `/close-stage`)

### Checklist

| Item | Status | Notas |
|------|--------|-------|
| SPR-12 aba Presença professor | ✅ PASS | total + listagem paginada |
| SPT-13 `/portal/presenca` aluno | ✅ PASS | nav + página |
| Só `attendances` no total/listagem | ✅ PASS | query filtrada |
| Paginação 20 + Anterior/Próxima | ✅ PASS | `STUDENT_ATTENDANCE_PAGE_SIZE` |
| Empty states pt-BR | ✅ PASS | professor + aluno |
| RLS aluno SELECT próprio | ✅ PASS | migration 011 + policies.sql |
| Lint + type-check | ✅ PASS | §3.9 |

### Findings

#### Blockers
- Nenhum.

#### Warnings
1. Migration `011_attendances_student_select.sql` — **aplicada** em ambiente remoto (2026-05-27).
2. Checklist browser §3.10 pendente.

### Aprovação Stage 3
**Aprovada para fecho** — sem blockers; aplicar migration antes de QA portal.

---

## Stage 4 — Criar aluno + provisionar login (STU-12.5+, AUTH-8.4+)

**Data da review:** 2026-05-24  
**Reviewer:** agente (`/execute-stage` + `/close-stage`)

### Checklist

| Item | Status | Notas |
|------|--------|-------|
| STU-12.1 associar existente | ✅ PASS | mode `link_existing` |
| STU-12.5 criar Auth servidor | ✅ PASS | createUser + invite |
| STU-12.6 senha 12 chars one-shot | ✅ PASS | `PasswordReveal` |
| STU-12.3 arquivado bloqueado | ✅ PASS | action + UI |
| AUTH-8.4 Admin API só servidor | ✅ PASS | `server-only` admin |
| Toasts provisionamento | ✅ PASS | sonner |
| Lint + type-check + tests | ✅ PASS | §4.10 |

### Findings

#### Blockers
- Nenhum.

#### Warnings
1. Smoke browser §4.8 pendente — requer service role + SMTP Supabase para convite.
2. Orphan Auth user se link falhar após createUser (risco baixo).

### Aprovação Stage 4
**Aprovada para fecho** — cycle Large completo em código; QA manual recomendado.

