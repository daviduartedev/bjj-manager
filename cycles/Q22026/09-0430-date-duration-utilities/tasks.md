# Tarefas — Date and Duration Utilities (09-0430)

Checklist executável; citar **DATE-**, **SPEC-2.4** nos commits quando aplicável.

## Spec e documentação (obrigatório)

- [x] Garantir que `spec/features/date-duration-utilities/readme.md` reflete o contrato (**DATE-**).
- [x] Atualizar `spec/README.md` (entrada da feature e prefixo **DATE-** na convenção de IDs).
- [x] Atualizar **SPEC-2.4** em `spec/product/spec.md` e espelho em `docs/product/spec.md` (referência a **DATE-**).
- [x] Em `spec/features/students-crud/readme.md`, referenciar **DATE-** onde a idade na lista é descrita (**STU-7.4**).
- [x] Revisar `cycles/Q22026/09-0430-date-duration-utilities/request.md` se o texto de “menos de 1 mês” divergir do refino — alinhar ou apontar para `plan.md`.

## Dependências e testes

- [x] Adicionar `@date-fns/tz` e **Vitest** (dev); script `pnpm test` (e opcionalmente `pnpm test:watch`).
- [x] Configurar Vitest para TypeScript (mínimo: `vitest.config.ts` ou bloco em config existente).

## `lib/dates/`

- [x] Constante de fuso canónica **`America/Sao_Paulo`** (exportada ou interna única, conforme **DATE-1.1**).
- [x] `parseCalendarDate` (nome conforme spec): aceita `YYYY-MM-DD` → instância de calendário no fuso SP sem erro de UTC (**DATE-2**).
- [x] `humanizeDuration({ from, to })`: pura; decomposição de calendário; granularidade até dias e semanas quando &lt; 1 mês (**DATE-3**).
- [x] `calculateAge(birthDate, today)` → `number | null` (**DATE-4**).
- [x] `timeSinceJoined`, `timeAtCurrentBelt`, `timeAtCurrentDegree` → `string | null`, delegando em `humanizeDuration` (**DATE-5**).
- [x] `formatDateBR` → `string | null`; padrão visual **"12 abr 2024"** (**DATE-6**).
- [x] `formatRelativeBR(date, today)` → `string | null`; passado em relação a `today` no fuso SP; granularidade dia/semana/mês/ano conforme **DATE-7** (sem horas).
- [x] Reexport limpo em `lib/dates/index.ts`.

## Migração de consumidores

- [x] Refatorar `components/students/student-age.tsx` para usar `calculateAge` + `today` injetado no componente (prop opcional para testes Storybook/dev) ou data vinda do servidor quando aplicável — **sem** `parseISO` + `new Date()` implícito para `birth_date`.

## Qualidade

- [x] Testes unitários com casos: aniversário no dia civil, `birth_date` string sem drift UTC, intervalo &lt; 7 dias, semanas + dias, ano/mês/dia combinados, entradas nulas → `null`.
- [x] `pnpm lint` e `pnpm type-check` sem erros.
- [x] `pnpm test` verde.
