# Entidades de domínio , Casca - Gestão de Academias de BJJ

Conceito orientador: modelo **multi-tenant** (`account_id` onde aplicável). Campos detalhados de banco podem evoluir no ciclo de schema; aqui está o **contrato de produto**.

---

## E1. Conta (Academia)

**ENT-1.1.** Representa a academia no SaaS.

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Nome da academia | Sim | |
| Identificador da conta | Sim | Impl.: UUID |
| Configurações gerais | Não | Evoluem em settings |

---

## E2. Perfil de usuário

**ENT-2.1.** Liga `auth.users` à conta (**1:1** com usuário autenticado no MVP).

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Conta | Sim | Pertencimento à academia |
| Nome de exibição | Sim | |
| E-mail | Sim | Via auth |
| Telefone | Não | Contato opcional do professor (**CFG-**) |

**ENT-2.2.** **Sessão de autenticação** é infraestrutura (Supabase), não entidade de negócio nomeada no modelo relacional do MVP.

**ENT-2.3.** Enquanto não existir **autocadastro** na aplicação (**SPEC-3.7**), o vínculo inicial entre utilizador em **Auth**, **`accounts`** e **`profiles`** é feito por **provisionamento manual** (dashboard Supabase + SQL), conforme [`docs/security/rls.md`](../../docs/security/rls.md) e **AUTH-7.1**.

---

## E3. Faixa (catálogo)

**ENT-3.1.** Catálogo **global** de faixas: tipo **adulto** ou **kids**, nome, ordem (**ordinal**).

**ENT-3.2.** Graus na faixa (**0–4** para faixas coloridas adulto; **0–4** por faixa kids; **preta** adulto usa graus **1–6** conforme [`graduation-rules.md`](graduation-rules.md)) são propriedade do **estado atual do aluno**, não linhas separadas de “faixa” no catálogo.

**ENT-3.3.** O valor persistido como nome técnico em `belts` pode usar **identificador estável** (ex.: inglês no seed SQL) desde que o **ordinal** e o **kind** reproduzam **GR-1** e **GR-2**; rótulos em **português** na UI devem seguir **GR-2.1** / **GR-1.1** (ciclo schema).

---

## E4. Aluno

**ENT-4.1.** Pessoa matriculada na academia.

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Conta | Sim | |
| Tipo | Sim | Adulto ou kids |
| Nome | Sim | |
| Faixa atual | Sim | FK para faixa |
| Grau atual | Sim | Limites por tipo/faixa , ver **GR-** |
| Status do aluno | Sim | Enum no schema: **ativo**, **inativo**, **trial**, **pausado** (trial pode designar período curto, ex. um dia, definido operacionalmente na UI , sem cron obrigatório no MVP salvo ciclo dedicado). Na UI do ciclo de alunos (**STU-3**), **trial** não é exposto; **ativo**, **inativo** e **pausado** sim. |
| Data de nascimento | Recomendado | Idade e transição kids/adulto |
| Data de início na academia | Recomendado | Tempo de treino |
| Documento, telefone, e-mail, observações | Não | LGPD / minimização |

---

## E5. Graduação (histórico)

**ENT-5.1.** Registro imutável de cada promoção (grau ou faixa).

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Aluno | Sim | |
| Faixa resultante | Sim | |
| Grau resultante | Sim | |
| Data da graduação | Sim | |
| Foi pulo de ordem | Sim | Boolean |
| Motivo do pulo | Condicional | Obrigatório se pulo , ver **GR-** |

---

## E6. Plano

**ENT-6.1.** Plano comercial da conta: tipo técnico **`kids_1`**, **`kids_2`** ou **`adult`**, **nome editável** (`plans.name`), valor padrão em centavos, ativo/inativo. Rótulos por defeito na provisão: **Kid 1**, **Juvenil**, **Adulto**. A função principal no MVP é **organizar cobrança e segmentação** por **idade/turma**; o professor **associa manualmente** cada aluno a um desses planos (**BR-1.1**).

**ENT-6.2.** Valores por defeito na provisão automática da conta e no seed de desenvolvimento: ver **BR-1.4** e **BLM-2**.

---

## E7. Vínculo aluno–plano

**ENT-7.1.** Associa aluno a um plano.

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Aluno | Sim | |
| Plano | Sim | |
| Preço personalizado | Não | Centavos; se nulo, usa preço do plano |
| Dia de vencimento | Sim | **1–28** (recomendado produto); meses curtos ajustam ao último dia válido |

**ENT-7.2.** No MVP, há no máximo **um vínculo aberto** por aluno (`ended_at` nulo no vínculo aluno–plano); troca de plano fecha o vínculo anterior (`ended_at`) e abre outro (`started_at`). A regra é **reforçada no banco** (índice único parcial) no ciclo schema.

**ENT-7.3.** Qualquer operação de nova vigência via **`setStudentPlan`** (incluindo **mesmo** `plan_id` que o vínculo aberto) **insere** nova linha em `student_plans` e define `ended_at` na linha anterior com a **mesma data civil** que `started_at` da nova linha, em referência **America/São_Paulo** (**BLM-5**). Não se usa atualização in-place da linha aberta para esse efeito.

---

## E8. Mensalidade / referência de cobrança

**ENT-8.1.** Unidade de cobrança: **mês de referência** (data representando o dia **1** daquele mês).

**ENT-8.2.** Por par (**aluno**, **mês de referência**), o professor define:

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Status manual | Sim | **Pago**, **Não pago**, **Pendente**, **Bolsista**, **Outro** , ver **BR-** |
| Valor efetivo cobrado | Não | Útil para histórico; default do vínculo |
| Data/hora do pagamento | Não | Informação opcional quando **Pago** |
| Observação | Não | Especialmente para **Outro** |
| Método de pagamento (texto livre) | Não | Ex.: PIX, dinheiro; campo opcional na UI (**BUI-4**) |

**ENT-8.3.** Registro pode mapear para tabela `payments` no Supabase; ausência de linha é tratada como **Pendente** na experiência (**BR-4.4**), com transição automática para **Não pago** conforme **BR-4.5**. Estorno simples no MVP (**PBS-5**) remove a linha, voltando à semântica de ausência.

---

## E9. Relações (resumo)

```
Account 1 : N Profile (MVP: tipicamente 1 professor por conta)
Account 1 : N Student
Account 1 : N Plan
Belt (global) : N Student (current_belt)
Student 1 : N StudentGraduation
Student N : 1 Plan (via vínculo aluno–plano)
Student 1 : N Payment (por reference_month)
```

---

## E10. Fora do MVP

**ENT-10.1.** Turmas, chamadas, fichas médicas, contratos, ledger contábil completo, gateway de pagamento.
