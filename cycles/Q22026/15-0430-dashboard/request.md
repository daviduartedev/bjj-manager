# Dashboard

## Context
A página inicial do app autenticado. Quando o professor entra, ele
quer ver, em segundos: quantos alunos ativos, quem está atrasado, quem
faz aniversário e o que precisa de atenção hoje. **Limpo**, sem
poluição visual. Esta é a tela que dá a sensação de controle.

## Intent
- Rota `app/(dashboard)/dashboard/page.tsx`.
- Cards principais (KPIs):
  - Alunos ativos (total).
  - Mensalidades atrasadas (contagem + atalho para Billing filtrado).
  - Aniversariantes do mês.
  - Alertas de graduação (ex.: alunos com tempo elevado no grau —
    heurística simples, configurável depois).
- Seção **Atenção hoje**:
  - aniversariantes do dia,
  - vencimentos no dia,
  - alunos atrasados há mais de X dias (parametrizado simples).
- Seção **Distribuição por faixa**:
  - lista compacta com contagem por faixa (separar adulto e kids).
- Ações rápidas: "Cadastrar aluno", "Registrar pagamento".

## Taste / Constraints
- Sem gráficos pesados. No máximo barras simples para distribuição.
- Mobile: cards empilhados, KPIs em grid 2x2.
- Tudo Server Component buscando dados em paralelo.
- Cada card linka para a tela detalhada (alunos, billing, etc.).
- Loading com skeletons; nada de spinners gigantes.

## References
- `cycles/Q22026/08-0430-students-crud/request.md`
- `cycles/Q22026/11-0430-graduation-engine/request.md`
- `cycles/Q22026/13-0430-payments-billing-status/request.md`
- `cycles/Q22026/09-0430-date-duration-utilities/request.md`

## Attachments
- (nenhum)
