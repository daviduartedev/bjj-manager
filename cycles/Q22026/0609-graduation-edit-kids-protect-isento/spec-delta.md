# spec-delta.md — Large Cycle

## Cycle: 0609-graduation-edit-kids-protect-isento
## Status: PROPOSTA (não promovida)

> ⚠️ Este arquivo é uma PROPOSTA. Só é promovido para `spec/` via `/update-spec` após todas as stages validadas.

---

## Decisões de refino incorporadas

| Tema | Decisão |
|------|---------|
| Isento em `/mensalidades` | Fora da carteira (**BR-9** estendido) |
| Isento na ficha | Secção financeira simplificada — só rótulo **Isento** |
| Graduação | Adicionar + editar; **sem apagar** |
| Peso | kg, uma casa decimal, 20,0–250,0, opcional |
| Visual faixa | Adulto + kids bicolores |
| Guardrail Kids | CI + pós-`db:apply` |

---

## Specs afetadas

### `spec/product/entities.md`

**Seção:** ENT-4.1 (Aluno)

**Mudança proposta:**

```diff
 | Observações | Não | LGPD / minimização |
+| Isento (`is_exempt`) | Não (default false) | Quando true, aluno isento de cobrança persistente; fora do recorte **BR-9**; secção financeira simplificada (**SPR-8.5**) |
```

**Seção:** ENT-5.1 (Graduação)

**Mudança proposta:**

```diff
 | Motivo do pulo | Condicional | Obrigatório se pulo , ver **GR-** |
+| Peso (`weight_kg`) | Não | Peso corporal em **kg** na data da graduação; uma casa decimal; intervalo **20,0–250,0** quando preenchido |
```

**Motivo:** Persistir peso opcional; isenção persistente distinta de Bolsista mensal.

---

### `spec/product/billing-rules.md`

**Seção:** BR-9.1

**Mudança proposta:**

```diff
-**BR-9.1.** A **lista trabalhável** em **`/mensalidades`** só inclui estudantes com **`student_status = active`**, **`archived_at`** nulo e **`removed_at`** nulo
+**BR-9.1.** A **lista trabalhável** em **`/mensalidades`** só inclui estudantes com **`student_status = active`**, **`archived_at`** nulo, **`removed_at`** nulo e **`is_exempt = false`** (ou equivalente persistido)
```

**Nova secção BR-9.5:**

```markdown
**BR-9.5.** Alunos com **`is_exempt = true`** estão **fora** da carteira de cobrança mensal em curso (como **inactive**/**paused** em **STU-3.3**), mas **permanecem** visíveis na lista de alunos com rótulo **Isento**. O professor activa/desactiva a isenção na ficha ou edição rápida (**STU-8.4**).
```

**Motivo:** Isento fora de mensalidades sem confundir com Bolsista por mês.

---

### `spec/features/payments-billing-status/readme.md`

**Seção:** PBS-3 (Indicador derivado)

**Mudança proposta:**

```diff
+**PBS-3.0.** Se o aluno tiver **`is_exempt = true`**, o indicador derivado para cobrança é **`exempt`** (UI pt-BR: **Isento**). **Não** aplicar **PBS-3.2**/**PBS-3.3** (sem **`overdue`** nem **`pending`** por calendário). Consumidores que partilham **BR-9** omitam isentos da lista trabalhável.
+
 Valores canónicos (slug inglês, UI pt-BR à parte): **`paid`**, **`pending`**, **`overdue`**, **`scholarship`**, **`other`**, **`exempt`**.
```

**Motivo:** Eliminar “Atrasado” derivado para isentos.

---

### `spec/features/student-profile/readme.md`

**Seção:** SPR-8 (Financeiro)

**Mudança proposta:**

```diff
+**SPR-8.5.** Quando **`students.is_exempt`** é verdadeiro, o separador **Financeiro** mostra **apenas** o rótulo **Isento** e texto breve explicativo; **omitir** plano actual, mês corrente, indicador **Atrasado**, histórico de pagamentos e CTA **Registrar pagamento** (**SPR-9.3**). **Bolsista** mensal (**BR-4.2**) permanece conceito distinto aplicado mês a mês quando o aluno **não** é isento persistente.
```

**Seção:** SPR-7 (Graduação)

**Mudança proposta:**

```diff
+**SPR-7.6.** O separador **Graduação** inclui **ilustração compacta** da faixa actual e graus (**GRD-8.1**), além dos badges existentes. Cada evento no histórico resumido pode mostrar **peso (kg)** quando registado (**ENT-5**).
```

---

### `spec/features/students-crud/readme.md`

**Seção:** STU-8 (Edição rápida)

**Mudança proposta:**

```diff
+**STU-8.4.** A edição rápida e a ficha completa incluem toggle **Isento** (`is_exempt`). Isentos **não** entram em **`/mensalidades`** (**BR-9.5**).
```

**Seção:** STU-3 (Status)

**Mudança proposta:**

```diff
+**STU-3.6.** Na lista de alunos, alunos **Isentos** podem exibir chip **Isento** em complemento ao status operacional (`active`, etc.).
```

---

### `spec/features/billing-ui/readme.md`

**Seção:** BUI-2 (Lista mensalidades)

**Mudança proposta:**

```diff
+**BUI-2.9.** Alunos **`is_exempt`** **não** entram no universo da lista **`/mensalidades`** (**BR-9.1**, **BR-9.5**). Não há filtro «Isentos» nesta vista — consultar lista de alunos.
```

---

### `spec/features/graduation-engine/readme.md`

**Seção:** GRD-6 (Histórico e imutabilidade) — **substituir título e conteúdo parcial**

**Mudança proposta:**

```diff
-## GRD-6. Histórico e imutabilidade
+## GRD-6. Histórico — adicionar, editar (sem apagar)

-**GRD-6.1.** Não há **edição** nem **eliminação** de linhas em `student_graduations` no MVP; apenas **novos** registos via **promoteStudent**.
+**GRD-6.1.** **`promoteStudent`** continua a registar **novas** promoções (fluxo **Promover**). Adicionalmente, **`addGraduation`** e **`updateGraduation`** permitem correcção e registo retroactivo com as mesmas validações **GRD-3**.
+
+**GRD-6.2.** **Não há eliminação** de linhas em `student_graduations` na UI nem nas Server Actions deste ciclo.
+
+**GRD-6.3.** Após **`addGraduation`**, **`updateGraduation`** ou **`promoteStudent`**, **`students.current_belt_id`** e **`students.current_degree`** reflectem o par **(faixa, grau)** do evento com **`graduated_at`** mais recente (desempate estável por `created_at` se necessário).
+
+**GRD-6.4.** **`updateGraduation`** não pode alterar um evento de forma a violar **GRD-3** relativamente ao evento **anterior** e **seguinte** na timeline ordenada por `graduated_at`.
```

**Nova secção GRD-8:**

```markdown
## GRD-8. Peso e ilustração da faixa

**GRD-8.1.** Cada evento pode incluir **`weight_kg`** opcional (**ENT-5**): uma casa decimal, **20,0–250,0 kg** quando preenchido.

**GRD-8.2.** Componente **`BeltIllustration`**: faixa monocromática (adulto) ou bicolor (kids) com **listras** ou equivalente para graus **0–4** (coloridas/kids) ou **1–6** (preta adulto), usando **`belts.color_hex`** e padrão documentado para faixas kids (**GR-2.1**).

**GRD-8.3.** Exibir ilustração no **perfil** (**SPR-7.6**) e no **histórico completo** (**GRD-1.1**), em conjunto com rótulos textuais.
```

**Motivo:** Alinhar produto à correcção de histórico e visualização pedida.

---

### `spec/database.md`

**Nova secção:** Política de migrations de planos

**Conteúdo proposto:**

```markdown
## Migrations — vínculos aluno–plano

- Migrations **não** podem conter `UPDATE`/`INSERT` em massa que mova vínculos abertos (`student_plans.ended_at IS NULL`) entre `plans.kind` **`kids_1`** e **`kids_2`**.
- A migration histórica `001_juvenil_plans_to_kids.sql` foi **neutralizada** (apenas metadados de `plans`).
- `pnpm db:apply` executa **`scripts/validate-plan-assignments.cjs`** ao final; CI executa **`pnpm db:validate-plans`**.
```

---

### `docs/database/migrations-policy.md` _(novo arquivo na promoção)_

**Conteúdo proposto:** espelho operacional da secção acima + query de verificação Kids 2:

```sql
SELECT COUNT(*) FROM student_plans sp
JOIN plans p ON p.id = sp.plan_id
WHERE sp.ended_at IS NULL AND p.kind = 'kids_2';
```

---

## Checklist antes de promover

- [ ] Stage 1 validada (guardrail + Kids 2 estável)
- [ ] Stage 2 validada (Isento UI + PBS + BR-9)
- [ ] Stage 3 validada (graduação + peso + visual)
- [ ] Comportamento descrito é o implementado (não intenção)
- [ ] Revisão humana confirmada
- [ ] Pronto para `/update-spec`
