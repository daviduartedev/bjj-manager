# Date and Duration Utilities

## Context
O app fala constantemente em "tempo": idade do aluno, tempo desde a
entrada na academia, tempo na faixa atual, tempo no grau atual. Sem
helpers centrais e testáveis, cada tela calcula do seu jeito e logo
divergem. Este ciclo cria a base de utilitários de data/duração em
pt-BR para ser consumida por Profile, Dashboard e Graduation.

## Intent
- Helpers em `lib/dates/`:
  - `calculateAge(birthDate, today?)` — anos completos.
  - `timeSinceJoined(joinedAt, today?)` — string "1 ano e 3 meses".
  - `timeAtCurrentBelt(currentBeltStartedAt, today?)`.
  - `timeAtCurrentDegree(currentDegreeStartedAt, today?)`.
  - `formatDateBR(date)` — "12 abr 2024".
  - `formatRelativeBR(date)` — "há 6 meses".
- Tudo construído sobre `date-fns` com `pt-BR` locale.
- Função única `humanizeDuration({ from, to? })` reusável internamente.
- Considerar fuso `America/Sao_Paulo` no formatador (default do app).

## Taste / Constraints
- 100% puras (sem `Date.now()` interno — receber `today` injetável
  para facilitar testes).
- Sem alocação de timezone errado (não converter `birth_date` que é
  `date` SQL para `Date` UTC e perder o dia).
- Strings em pt-BR consistentes:
  - "menos de 1 mês" para durações curtas;
  - "1 mês", "2 meses", "1 ano", "1 ano e 2 meses".
- Sem dependência de `dayjs` ou `moment`.

## References
- `cycles/Q22026/02-0430-product-specification/request.md`
- `cycles/Q22026/10-0430-student-profile/request.md`
- `cycles/Q22026/11-0430-graduation-engine/request.md`
- Docs do `date-fns` (locale `pt-BR`).

## Attachments
- (nenhum)
