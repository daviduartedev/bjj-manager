# Tarefas , Painel operacional (15-0430-dashboard)

## Spec e contratos (obrigatório)

- [x] Actualizar **`spec/features/dashboard/readme.md`** (IDs **PNL-**).
- [x] Actualizar **`spec/README.md`** (entrada do painel na matriz).
- [x] Actualizar **`spec/product/spec.md`** e **`docs/product/spec.md`** (**SPEC-2.7** → referência **PNL-**).
- [x] Actualizar **`spec/features/app-shell/readme.md`** (painel + **PNL-**).
- [x] Actualizar **`spec/features/students-crud/readme.md`** (**STU-7.4** , durações na lista).
- [x] Actualizar **`spec/features/billing-ui/readme.md`** (**BUI-2.6** , query `filtro`).
- [x] Actualizar **`spec/features/payments-billing-status/readme.md`** (referência cruzada **PBS-6.2** ↔ painel).

## Domínio e dados

- [x] Implementar helpers **puros** para: referência de mês SP; contagens por KPI; «atenção hoje» (aniversário dia, vencimento dia, atraso >14 dias); distribuição por faixa (adult/kids); heurística **PNL-4.2** (dias na faixa / no grau) com `today` injectável (**DATE-1.3**).
- [x] Reutilizar **`PBS-6`** / loaders existentes de mensalidades onde possível; evitar duplicar regra **PBS-3**.
- [x] Adicionar testes unitários aos novos helpers (casos limite: sem DOB, sem graduações, mês sem alunos).

## UI , `/painel`

- [x] Substituir placeholder: hero + grelha KPI (2×2 mobile); secção **Atenção hoje** (listas completas); distribuição por faixa; acções rápidas.
- [x] `loading.tsx` com **skeletons** no segmento `painel`.
- [x] Estados vazios com mensagens explícitas por bloco.
- [x] Manter painel **configuração pendente** quando não há `ctx` válido.
- [x] Cards/KPIs clicáveis conforme **PNL-** (incl. `/mensalidades?filtro=atrasado` e `filtro=pendente`).

## UI , `/mensalidades`

- [x] Suportar **`filtro`** na query (**BUI-2.6**): inicializar o selector cliente alinhado ao URL (incl. `atrasado` → `overdue`, etc.).

## UI , `/alunos` (lista)

- [x] Mostrar **tempo na faixa** e **tempo no grau** por linha/card (**STU-7.4**), usando mesma lógica de referência temporal que o painel onde aplicável.

## Verificação

- [x] Percorrer **`cycles/Q22026/15-0430-dashboard/scenarios.feature`** manualmente ou com testes onde já existir infraestrutura.
- [x] `pnpm lint` / typecheck do projecto sem erros novos nas áreas tocadas.
