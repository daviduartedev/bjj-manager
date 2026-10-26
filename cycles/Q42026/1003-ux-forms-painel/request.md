# request.md — Large Cycle

## Cycle
- **Path:** `cycles/Q42026/1003-ux-forms-painel/`
- **Tipo:** Large
- **Data:** 2026-10-03
- **Autor:** grill-with-docs

---

## Contexto

O professor encontra formulários longos, CTAs e checkboxes inconsistentes, erros duplicados (toast + campo), o cartão de alertas de graduação misturado com aniversários, e um toast «A data da graduação não pode ser no futuro» ao editar aluno faixa branca — causado por default de data em UTC e pelo ano visível esconder o dia gravado. O painel não mostra previsão de mensalidades versus o que já entrou, e o critério de alerta de graduação é uma heurística fixa (120/365) em vez da política da academia.

---

## O que precisa ser feito

Padronizar o design system da área autenticada; cadastro e edição completa de aluno em quatro passos com barra visual; erros de preenchimento só debaixo do campo; pizza de previsão de receita no painel; personalizar blocos do painel por professor; cartão de aniversariantes do mês em Alunos; confirmação ao marcar isento; critério de prontidão em Configurações; corrigir o relógio da faixa branca e o toast do print.

Protótipo local (throwaway) em `/prototype/ux-ajustes?variant=A` — validar visualmente cadastro em passos, pizza e personalizar **antes** de promover para produção.

---

## Motivação / valor

Menos erro ao cadastrar e editar, números de caixa do mês legíveis num relance, alerta de graduação alinhado à casa, e o print de produção deixa de bloquear um salvar válido.

---

## Critérios de aceite (alto nível)

- [ ] Erro de preenchimento aparece uma vez, debaixo do campo; toast só para sucesso e falha sem campo.
- [ ] CTAs no fim à direita, mesma altura e largura mínima; formulários da área autenticada com largura máxima (inputs `h-10`, não esticam a viewport).
- [ ] Checkbox de formulário com quadrado `sm` e alvo de toque no conjunto ≥ 44px; mensalidades mantêm `dense`.
- [ ] Modais: overlay com blur; três larguras (confirmação / formulário curto / formulário largo em duas colunas no desktop). Cadastro e edição completa continuam página.
- [ ] Cadastro (`/alunos/novo`) e edição completa (`/alunos/[id]/editar`) em 4 trechos — Identificação, Faixa, Mensalidade, Contactos — barra sem «Passo 01»; voltar conserva valores; não avança inválido; gravar só no último.
- [ ] Ao marcar isento (página e edição rápida): diálogo «Este aluno sai da cobrança de todas as mensalidades. Tem certeza?»; cancelar desfaz; desmarcar não pede; bolsista do mês não entra.
- [ ] «Hoje» e defaults de data em `America/Sao_Paulo`. Faixa branca: ano = 1 de janeiro desse ano; ano futuro inválido no campo. Salvar peso não cria graduação futura.
- [ ] Pizza no painel: círculo = previsão do mês; fatias recebido e a receber; centro = %; vazio se não houver previsão; se recebido > previsão, 100% recebido + «Acima da previsão». Previsão = mensalidades de alunos activos com vínculo, fora isento e fora bolsista do mês.
- [ ] Personalizar no cabeçalho do Painel: modal estreito; blocos Atrasados, Alunos ativos, Recebido, Alertas de graduação, Previsão de receita, Atenção, Faixas, Aulas de hoje; tudo ligado por defeito; grava por professor.
- [ ] Em Alunos, ao lado de Total na conta: Aniversariantes do mês (nome + dia/mês, todos, sem clique). Chip de aniversário sai do cartão de alertas.
- [ ] Configurações: critério de prontidão da academia, só para o alerta, não bloqueia promover. Kids 3/4/1 mês por grau (faixa = 4×). Adulto azul/roxa/marrom: mínimos IBJJF de faixa, grau = ÷4. Adulto branca: só grau aos 4 meses. Preta/coral fora. Até gravar: 4 meses no grau ou 12 na faixa. Primeira gravação pede confirmação.
- [ ] QA dos fluxos desta série após as fatias; dvd-tests no fim. QA de todos os fluxos do sistema fica depois destas fatias, não no lugar delas.

---

## Stages previstas (estimativa inicial)

> Refinamento real ocorre em `/refine-request`.

1. Stage 1 — Design system: CTAs, largura de formulário, checkbox, modais + blur, erros só no campo.
2. Stage 2 — Cadastro/edição em passos, isento com confirmação, correção faixa branca / print.
3. Stage 3 — Pizza e personalizar no painel, aniversariantes em Alunos, critério de prontidão.
4. Stage 4 — Validação humana + dvd-tests dos fluxos desta série.

---

## Restrições e riscos conhecidos

- Spec do painel ainda diz «sem gráficos pesados»; esta série autoriza **só** esta pizza.
- DS-1.3 pede toque ≥ 44px; o quadrado do checkbox encolhe, o alvo é o conjunto.
- Default UTC à noite em São Paulo grava o dia seguinte; a correção tem de usar o dia civil da app.
- Critério de prontidão é da academia; personalizar painel é por professor — não misturar persistência.

---

## Fora de escopo

- Stepper em edição rápida, pagamento, produto, horários, configurações (excepto o bloco do critério) e portal.
- Número de aulas no critério de prontidão.
- Alertas para faixa preta e coral.
- Landing / marketing.
- Instalar biblioteca de gráficos.
- QA de todos os fluxos do produto (depois desta série).

---

## Specs relevantes

- `spec/features/design-system/readme.md`
- `spec/features/students-crud/readme.md`
- `spec/features/dashboard/readme.md`
- `spec/features/graduation-engine/readme.md`
- `spec/features/settings/readme.md`
- `spec/product/graduation-rules.md`
- `spec/product/billing-rules.md`
- `GLOSSARY.md`
- `docs/adr/0001-criterio-prontidao-nao-bloqueia-promocao.md`

---

## Referências

- Grill-with-docs (2026-10-03), decisões Q1–Q22.
- Protótipo: `/prototype/ux-ajustes?variant=A` (dev). `pnpm proto:ux`
