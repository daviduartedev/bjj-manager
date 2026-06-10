# Política de migrations — vínculos aluno–plano (Kids 1 / Kids 2)

## Regra

Migrations e scripts SQL **não podem** alterar em massa vínculos abertos (`student_plans` com `ended_at IS NULL`) entre planos **`kids_1`** e **`kids_2`**.

Motivo: a segmentação Kids 1 | Kids 2 | Adulto é decisão operacional do professor; reaplicar `pnpm db:apply` ou migrations não deve “zerar” alunos em Kids 2.

## Proibido

- Loops ou `UPDATE`/`INSERT` em `student_plans` que fechem vínculos `kids_2` e abram `kids_1` (ou o inverso) para todos os alunos afectados.
- Qualquer migration que trate `student_plans` como dados derivados de `plans.kind` a normalizar automaticamente.

## Permitido

- `UPDATE` em `plans` (nome, preço, activo) sem tocar em `student_plans`.
- Migrations de schema (colunas, índices, constraints) sem mass-update de vínculos.

## Verificação

```bash
pnpm db:validate-plans          # análise estática das migrations (+ snapshot DB se DATABASE_URL)
pnpm db:apply                   # corre guardrail automaticamente no fim
```

Query manual (produção / operação):

```sql
SELECT COUNT(*) AS kids_2_abertos
FROM public.student_plans sp
INNER JOIN public.plans p ON p.id = sp.plan_id
WHERE sp.ended_at IS NULL
  AND p.kind = 'kids_2';
```

Opcional: definir `PLAN_GUARD_KIDS2_MIN_COUNT` no ambiente para falhar o guardrail se a contagem ficar abaixo do mínimo esperado (ex.: `22`).

## Histórico

- `db/migrations/001_juvenil_plans_to_kids.sql` incluía mass-update destrutivo; **neutralizado** no cycle `0609-graduation-edit-kids-protect-isento` (Stage 1).
