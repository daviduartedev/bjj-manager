## Parent

Part of #6

## What to build

No painel, um único gráfico pizza (CSS, sem biblioteca): o círculo é a previsão de receita mensal do mês civil actual em São Paulo; fatias recebido e a receber; centro = percentagem recebida. Vazio: «Sem mensalidades previstas neste mês». Se o recebido passar da previsão: círculo 100% recebido + «Acima da previsão». Previsão = soma do preço efectivo dos alunos na carteira operacional com vínculo aberto, fora isento e fora bolsista daquele mês. Recebido = total já marcado como pago nesse mês (o mesmo número do KPI Recebido).

## Acceptance criteria

- [ ] A pizza aparece no painel e usa `pieSlices` (empty / split / full+over) com literais testados no seam de previsão.
- [ ] Previsão exclui isento permanente, bolsista do mês, inactivo, pausado, experimental, arquivado e removido; usa preço personalizado quando existe.
- [ ] Centro mostra %; legendas Previsão, Recebido e A receber (ou Acima da previsão).
- [ ] Sem biblioteca de gráficos nova.

## Blocked by

- None (can start immediately).
