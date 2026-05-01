# Plano , Date and Duration Utilities (delta)

## Contexto

O produto depende de **idade**, **tempo na academia** e (em ciclos seguintes) **tempo na faixa/grau** com texto **pt-BR** estável (**SPEC-2.4**). Hoje a lista usa cálculo local (`parseISO` + `differenceInYears` + `Date.now()` implícito), o que **desloca o dia civil** em `date` SQL e **não é injetável** em testes. Este ciclo centraliza em `lib/dates/` com fuso **America/Sao_Paulo** e migra consumidores existentes.

## Respostas do refino (consolidado)

| # | Tema | Decisão |
|---|------|---------|
| 1 | Escopo de migração | **Migrar** consumidores existentes na mesma entrega (ex.: `StudentAgeLabel` / lista de alunos). |
| 2 | Entrada nula ou inválida | Funções de domínio devolvem **`null`** (composição e testes); componentes de UI continuam a mostrar **","** onde já era o padrão. Intervalo inválido (`to` antes de `from`, em termos de **data civil**) → `null`. |
| 3 | Tipo de entrada | Contrato preferencial: **`YYYY-MM-DD`** (campos `date` do Postgres). **`Date`** aceite só como escape hatch documentado: interpretado na **data civil em São Paulo** (meia-noite local desse dia); encorajar `YYYY-MM-DD` vindo do API/DB. |
| 4 | `humanizeDuration` | **Datas civis** em **America/Sao_Paulo** (aniversários / `joined_at` / início de faixa como dia de calendário). **`to` opcional**: o **chamador** passa `today` quando quiser pureza total; não há `Date.now()` dentro dos helpers. |
| 5 | Aniversário / “hoje” | Toda a lógica de **idade** e **diferenças de calendário** usa o mesmo contexto de fuso (**meia-noite em São Paulo** para cada dia civil). |
| 6 | Parsing de `YYYY-MM-DD` | **`parseCalendarDateSP(value)`** (ou nome equivalente) **interno/exportado para testes**: parte a string em ano/mês/dia e constrói **`TZDate`** em `America/Sao_Paulo` , **nunca** `parseISO("YYYY-MM-DD")` sozinho (vira UTC e pode mudar o dia). |
| 7 | Granularidade de duração | Até **dias**, **sem horas**. Acima disso: **anos**, **meses** e **dias** restantes (decomposição de calendário). Abaixo de **1 mês** completo: **semanas** (blocos de 7 dias) **e dias** remanescentes, ou só dias se &lt; 7 dias; **sem** “menos de 1 mês” como único patamar. |
| 8 | Dependências | Manter **date-fns ^4**; acrescentar **`@date-fns/tz`** para `TZDate` / opção `in: tz(...)` onde fizer falta. Sem `dayjs` / `moment`. |

## Delta em relação ao estado canônico atual

- **Antes:** **SPEC-2.4** citava implementação genérica nos ciclos; não havia contrato **DATE-** nem pasta em `spec/features/`.
- **Depois:** contrato **DATE-** em [`spec/features/date-duration-utilities/readme.md`](../../../spec/features/date-duration-utilities/readme.md); lista de alunos usa os mesmos helpers que perfil/graduação poderão usar.

## Implementação (referência para o ciclo)

| Área | Artefatos típicos |
|------|-------------------|
| Núcleo | `lib/dates/constants.ts` (`APP_TIME_ZONE`), `parse-calendar-date.ts`, `humanize-duration.ts`, `age.ts`, `format-br.ts`, `index.ts` |
| Consumidor | `components/students/student-age.tsx` delegando em `calculateAge` + formatação `"N anos"` |
| Testes | `lib/dates/*.test.ts` com **Vitest**; matriz de exemplos para bordas (aniversário no dia, DST, intervalos curtos) |
| Deps | `package.json`: `@date-fns/tz`; script `pnpm test` |

## Alinhamento com outros ciclos

- **08-0430-students-crud** (**STU-7.4**): idade na lista passa a obedecer **DATE-**.
- **10-0430-student-profile**, **11-0430-graduation-engine**: consomem os mesmos exports; não são obrigatórios neste ciclo para fechar além da migração já acordada.

## Fora de escopo

- Formatação com **horas/minutos**; **timestamptz** rico em UI (só o necessário para interpretar `Date` como dia civil).
- Portais do aluno ou relatórios exportados.

## Riscos / notas

- Ordem dos argumentos em `date-fns` com tipos mistos: **fixar** `in: tz("America/Sao_Paulo")` nas diferenças de calendário para evitar surpresas.
- **Vitest** é novo no repo , manter configuração mínima alinhada ao Next/TS.

## Referências

- `cycles/Q22026/09-0430-date-duration-utilities/request.md`
- `spec/features/date-duration-utilities/readme.md` (**DATE-**)
- `spec/product/spec.md` (**SPEC-2.4**)
- [`date-fns` v4 time zones](https://blog.date-fns.org/v40-with-time-zone-support/)
