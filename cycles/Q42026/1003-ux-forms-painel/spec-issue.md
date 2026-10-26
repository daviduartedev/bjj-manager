## Problem Statement

O professor perde tempo e confiança na ficha do aluno: os campos ocupam a tela inteira, os botões não têm um sítio fixo, o mesmo erro aparece no toast e outra vez no campo, e ao salvar uma faixa branca à noite o sistema recusa com «A data da graduação não pode ser no futuro» — o ano visível esconde um dia UTC que em São Paulo já é amanhã. No painel, o cartão de alerta de graduação mistura aniversários; clicar nele não mostra quem faz anos; não há como ver a previsão de receita mensal contra o recebido; o alerta usa 120/365 dias para toda a gente, em vez do critério de prontidão da academia.

## Solution

Na área autenticada, formulários estreitos com CTAs iguais à direita; erros de preenchimento só debaixo do campo; cadastro e edição completa de aluno em quatro trechos com barra visual; confirmação ao marcar isento; «hoje» e o ano de entrada sempre em São Paulo (faixa branca = 1 de janeiro desse ano). No painel, uma pizza cuja fatia verde é o recebido e o resto é a receber, e um Personalizar por professor. Em Alunos, aniversariantes do mês ao lado de Total na conta. Em Configurações, o critério de prontidão (kids 3/4/1 mês por grau; adulto nos mínimos IBJJF) alimenta só o alerta — nunca bloqueia promover.

## User Stories

1. As a professor, I want field errors only under the field I missed, so that I am not told the same thing in a toast and in the form.
2. As a professor, I want toasts only for success or failures with no field, so that a network error is still visible.
3. As a professor, I want Cancelar and Salvar the same size at the bottom right, so that every form feels like the same product.
4. As a professor, I want authenticated forms not to stretch across the viewport, so that inputs stop looking oversized.
5. As a professor, I want form checkboxes smaller, so that they do not dominate the row, while still being easy to tap via the label.
6. As a professor, I want dense checkboxes on mensalidades unchanged, so that the month grid stays compact.
7. As a professor, I want modal overlays dimmed and blurred, so that the page behind is clearly inactive.
8. As a professor, I want confirmation dialogs narrow, so that «Tem certeza?» does not look like a form.
9. As a professor, I want short-form dialogs (payment, product) a medium width, so that a handful of fields fit without a tall column.
10. As a professor, I want quick edit and promote dialogs wide with two columns on desktop, so that I stop scrolling a narrow stack.
11. As a professor, I want cadastro and edição completa to stay full pages, so that a long student file is not trapped in a modal.
12. As a professor, I want to register a student in four named chunks (Identificação, Faixa, Mensalidade, Contactos), so that I am not staring at every field at once.
13. As a professor, I want a progress bar without «Passo 01», so that I see how far I am without counting.
14. As a professor, I want Continuar to refuse an invalid chunk, so that I do not discover missing name only at save.
15. As a professor, I want Voltar to keep what I typed, so that going back is not destructive.
16. As a professor, I want Cancelar on the last chunk (and leaving on the first) to return to Alunos without saving, so that abandon is obvious.
17. As a professor, I want Salvar / Registar aluno only on the last chunk, so that a half-filled file is never persisted.
18. As a professor editing a student, I want the same four chunks including optional weight on Faixa, so that edição completa matches cadastro.
19. As a professor on edição rápida, I want a single wide dialog, so that a short adjustment is not a wizard.
20. As a professor, I want a confirm dialog when I tick isento, so that I do not silently take someone out of all billing.
21. As a professor, I want that dialog to say «Este aluno sai da cobrança de todas as mensalidades. Tem certeza?», so that the consequence is explicit.
22. As a professor, I want Cancelar on that dialog to leave isento unticked, so that a mis-tap is undone.
23. As a professor, I want unticking isento to need no confirm, so that restoring billing is one click.
24. As a professor, I want bolsista of a single month to stay out of that confirm, so that a monthly scholarship is not confused with isento.
25. As a professor registering a white belt, I want to type only the ano de entrada, so that I am not inventing a day I do not know.
26. As a professor, I want that year stored as 1 January of that year, so that tempo na faixa has a clock until the first graduação.
27. As a professor, I want a future year rejected on that field, so that I am not blocked later by a hidden date.
28. As a professor, I want «today» and date defaults in America/Sao_Paulo, so that saving at 22:53 does not write tomorrow.
29. As a professor saving optional weight, I want no baseline graduação with a future data da graduação, so that the print error does not come back.
30. As a professor, I want that failure on the entry field, not as a toast, so that I know what to fix.
31. As a professor on the painel, I want a pizza of previsão de receita mensal, so that I see how much of this month’s tuitions is already in.
32. As a professor, I want the whole circle to be previsão and the slices recebido vs a receber, so that I do not read two totals as two pies.
33. As a professor, I want the centre to show percent recebido, so that the glance is one number.
34. As a professor with no previsão this month, I want «Sem mensalidades previstas neste mês», so that an empty academy is not a blank disk.
35. As a professor when recebido exceeds previsão, I want a full circle and «Acima da previsão», so that extra payments are not a broken chart.
36. As a professor, I want previsão to sum effective tuitions of active students with an open plan, excluding isento and excluding bolsista this month, so that the number matches the billing wallet.
37. As a professor, I want recebido on that pizza to be paid tuitions already recorded this civil month in São Paulo, so that it matches the Recebido KPI.
38. As a professor, I want Personalizar on the painel header, so that I can hide blocks I do not use.
39. As a professor, I want that choice stored for me, not for the whole academia, so that a colleague can keep a different layout.
40. As a professor, I want every block on by default: Atrasados, Alunos ativos, Recebido, Alertas de graduação, Previsão de receita, Atenção, Faixas, Aulas de hoje.
41. As a professor, I want aniversariantes of the month listed next to Total na conta on Alunos (name + day/month), so that the «2 aniversários» number has names.
42. As a professor, I want that list complete and not a link, so that I do not click into a dead end.
43. As a professor, I want students without birth date omitted from that list, so that we do not invent a day.
44. As a professor, I want the birthday chip removed from the Alertas de graduação card, so that two ideas stop sharing one tile.
45. As a professor, I want Alertas de graduação to count only students who met the critério de prontidão, so that 120/365 is not a silent academy policy.
46. As a professor, I want to set that critério in Configurações, so that the house rule lives with the other academy settings.
47. As a professor, I want the first save to ask me to confirm the critério for this academia’s alerts, so that I notice I am changing the painel.
48. As a professor, I want later edits of the same critério not to re-ask that aceite, so that tweaking kids cadence is not a ritual.
49. As a professor of kids, I want to pick 3, 4 or 1 month per grau, with faixa at four times that, so that the 0–4 graus of Casca match a cadence I already use.
50. As a professor of adults, I want azul / roxa / marrom faixa alerts at IBJJF minima (2 years / 1.5 years / 1 year) and grau at that time divided by four, so that I am not typing a table.
51. As a professor of adult white belts, I want no faixa alert and a grau alert at 4 months, so that white (no IBJJF faixa minimum) is still watched.
52. As a professor, I want preta and coral out of these alerts, so that we do not pretend to encode black-belt degrees in this series.
53. As a professor who has not saved a critério yet, I want the current fallback (4 months on grau or 12 months on faixa) so that the painel is not empty on day one.
54. As a professor, I want meeting the critério only to raise an alerta de graduação, so that I can still promover early or late.
55. As a professor, I want landing and marketing pages unchanged, so that this series does not restyle the public site.
56. As a professor on mobile, I want the four chunks and the wide dialogs to stack, so that the desktop two-column layout does not break a phone.
57. As a professor, I want Voltar and Continuar the same height as Cancelar and Salvar, so that step chrome matches form chrome.

## Implementation Decisions

- Three testable domain seams, and only these for TDD: (1) civil «today» in São Paulo plus ano de entrada → 1 January and rejection of a future year; (2) previsão / recebido / a receber → pizza slices including empty and over-previsão; (3) critério de prontidão → whether an active student is in alerta de graduação. UI (stepper, dialogs, Personalizar, isento confirm) is exercised with dvd-tests, not by asserting class names.
- Reuse existing date helpers (civil day in America/Sao_Paulo). Add a single «today as YYYY-MM-DD in app TZ» used by create defaults and year validation. Stop using UTC `toISOString().slice(0, 10)` for those defaults.
- White belt year field always writes `YYYY-01-01`. The input must not keep a hidden month-day from a previous default. Colored belts keep a full date; that date must not be after today in São Paulo.
- Saving weight still attaches to the current grau when a matching graduação exists. If none exists, creating a baseline is allowed only when the resolved data da graduação is today or past; otherwise the error maps to the entry field and no toast duplicates it.
- When a server result has field errors, show them on fields and do not also toast the same sentence. Toast remains for success and for errors with no field.
- Form chrome: shared field height stays 10 units; authenticated forms get a max width so they do not span the viewport. Primary and secondary actions share height and min width, grouped at the end, right-aligned. Form checkbox visual size is `sm`; the tap target is the row (checkbox + label) ≥ 44px. Mensalidades keep `dense`.
- Dialog overlay: dim + blur. Three widths only — confirm, short form, wide form (two columns from the `sm` breakpoint up). Cadastro `/alunos/novo` and edição `/alunos/[id]/editar` stay pages. Edição rápida and promover use wide.
- Stepper only on those two pages. Chunks: Identificação (nome, nascimento, tipo); Faixa (ano ou data de entrada, faixa, grau hidden on white, peso on edit); Mensalidade (isento, plano, vencimento); Contactos (CPF, telefone, e-mail, observações). Progress fill = completed chunks / 4. Cannot skip ahead; back keeps in-memory values; persist only on last submit.
- Isento confirm on full page and edição rápida. Copy locked: «Este aluno sai da cobrança de todas as mensalidades. Tem certeza?». Cancel unticks. Unticking does not confirm. Bolsista is untouched.
- Pizza: CSS conic gradient, no new chart library. Circle = previsão; slices recebido vs a receber; centre = percent. Copy for empty and over as in the user stories. Recebido cents reuse the existing month paid total for the operational wallet. Previsão sums effective price (custom or plan) of students in that same wallet who have an open plan and are not bolsista for the reference month.
- Alunos: second tile Aniversariantes do mês next to Total na conta. Universe is PNL-2.1 (active, not archived, not removed) — isento still appears here. Painel student fetch that currently drops isento must not drop them for this count or for alertas. Chip of birthdays leaves the Alertas de graduação KPI.
- Personalizar: header control on Painel, confirm-sized modal, eight blocks listed above, all on by default, persisted on the professor profile (not on the account, not in the browser only).
- Critério de prontidão persisted on the account. Kids: chosen 1 | 3 | 4 months per grau; faixa threshold = 4×. Adult azul/roxa/marrom: faixa due date = start plus 2 years / 18 months / 1 year; grau due = that interval in days divided by 4. Adult white: no faixa alert; grau at 4 calendar months. Preta/coral: never in this alert. Until the account has a confirmed critério, keep 4 months on grau or 12 months on faixa for everyone. First save shows confirm copy; later saves do not. Promoting is unchanged.
- From the local prototype (throwaway), keep these shapes — they are the locked decisions, not the demo UI:

```ts
function academyStartStored(whiteBelt: boolean, year: string, entryDate: string): string {
  if (whiteBelt) return `${year}-01-01`;
  return entryDate;
}

function pieSlices(forecast: number, received: number) {
  if (forecast <= 0) return { kind: "empty" as const, pct: 0, remaining: 0, over: false };
  if (received >= forecast) {
    return { kind: "full" as const, pct: 100, remaining: 0, over: received > forecast };
  }
  const pct = Math.round((received / forecast) * 100);
  return { kind: "split" as const, pct, remaining: forecast - received, over: false };
}
```

- Schema: account columns for kids cadence + confirmed-at; profile column for hidden painel blocks (or equivalent JSON). Follow existing numbered SQL migrations; do not invent a second persistence channel.
- Do not install a chart library. Do not restyle landing. Do not add aula-count to the critério in this spec.

## Testing Decisions

- Good tests assert observable domain results with literals from this spec (1 January, future year rejected, pizza empty/full/split, adult azul faixa at 2 calendar years, kids 4× cadence). They do not snapshot class names or mock the database to re-implement the calculator.
- Modules under test: civil today + white-belt academy start; pizza slices + previsão sum; critério de prontidão evaluator (replacing the hard-coded 120/365 helper).
- Prior art: date tests next to the existing São Paulo calendar helpers; student schema tests next to the current student form schema tests; billing price tests next to effective price; graduation-reference tests that today encode 120/365 must move to the new evaluator.
- UI flows (stepper, isento dialog, Personalizar, painel pizza, aniversariantes tile) are dvd-tests after the tickets land, not committed Playwright unless a later request asks for it.

## Out of Scope

- Stepper on edição rápida, payment, product, schedules, settings (except the critério block), login, or student portal.
- Número de aulas in the critério de prontidão.
- Alertas for preta/coral.
- Landing / marketing.
- Chart libraries.
- Blocking promover based on the critério.
- QA of every product flow (that run is after this series, not instead of it).
- Prototype throwaway route is not production; do not ship it as the real cadastro.

## Further Notes

- Glossary terms to keep: Isento vs Bolsista; Ano de entrada vs Data de entrada vs Data da graduação; Critério de prontidão vs Alerta de graduação; Previsão de receita mensal, Recebido, A receber.
- Painel spec today says no heavy charts; this spec authorizes this one pizza only.
- DS-1.3 still holds: 44px is the tap target, not the checkbox square.
- Cycle folder already exists: `cycles/Q42026/1003-ux-forms-painel/`. Implementation branch: `feat/ux-forms-painel` from updated `main`.
- IBJJF is the source of adult faixa minima and of kids cadence choices; Casca already uses 0–4 graus, not the 11-stripe monthly kids poster. The critério must not invent extra graus.
