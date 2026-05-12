# Regras de planos e cobrança , Casca - Gestão de Academias de BJJ

**Sem gateway de pagamento no MVP.** Valores em **centavos** e **BRL**; exibição **pt-BR**.

---

## BR-1. Planos

**BR-1.1.** Cada conta mantém exactamente **três** planos dos tipos **`kids_1`**, **`kids_2`** e **`adult`** (**ENT-6.1**). Na linguagem de produto usam-se por defeito os rótulos **Kids 1**, **Kids 2** e **Adulto** (`kids_1`, `kids_2`, `adult`). **Não** há plano comercial nem rótulo activo **“Juvenil”**. O professor associa manualmente cada aluno a um destes planos para refletir **faixa etária / turma** (não há automação por idade no MVP); alunos com **`student_kind = kids`** podem ser associados ao plano **Adulto** quando treinam na turma ou tabela de preços de adultos (**STU-4.2**). Quando o valor de mesa diverge do default do plano, usa-se **preço personalizado** (**BR-2.2**).

**BR-1.2.** Cada plano tem **valor padrão** configurável pelo professor (**price** em centavos).

**BR-1.3.** Planos inativos não devem ser ofertados para **novos** vínculos; vínculos existentes podem seguir regra do ciclo de dados.

**BR-1.4.** No **seed** de desenvolvimento, criam-se os **três** planos por conta de exemplo com nomes alinhados a **BR-1.1** e valores por defeito **10000** centavos (**Kids 1** e **Kids 2**) e **12000** centavos (**Adulto**), referência para integração futura; o professor pode alterar **`price_cents`** e o **nome de exibição** (`plans.name`) nas Configurações. Em **produção**, na primeira carga do layout da área autenticada **(dashboard)**, a aplicação garante **idempotentemente** os mesmos três tipos de plano para a conta com esses valores iniciais (**BLM-2**), sem sobrescrever personalizações já gravadas (**BLM-2.4**).

---

## BR-2. Vínculo aluno–plano

**BR-2.1.** Todo aluno com mensalidade no modelo deve ter **vínculo** a um plano (**ENT-7.1**).

**BR-2.2.** **Preço personalizado** opcional por aluno: quando definido, **substitui** o valor padrão do plano para fins de cobrança e default do mês.

**BR-2.3.** **Dia de vencimento** é definido **por aluno** (**1–28**). Em meses com menos dias, considera-se o **último dia válido** daquele mês.

**BR-2.4.** Fuso horário de referência para “dia” no MVP: **America/São_Paulo** (ou configurável futuro); até lá, usar o padrão fixo no código.

---

## BR-3. Mês de referência

**BR-3.1.** Cobrança é organizada por **mês de referência** (data no dia **1** do mês), identificando **qual mensalidade** está sendo tratada.

**BR-3.2.** Não há cobrança automática por integração externa; o professor **registra** o que ocorreu na operação real da academia.

---

## BR-4. Status manual (por aluno e mês)

**BR-4.1.** O professor define **manualmente** o status de cada aluno para cada mês de referência relevante, exceto onde **BR-4.5** prevê transição automática para **Não pago**.

**BR-4.2.** Estados permitidos:

| Estado | Significado operacional |
|--------|-------------------------|
| **Pago** | Professor confirma que a mensalidade daquele mês foi quitada (conforme acordo da academia). |
| **Não pago** | Não quitada (marcada pelo professor **ou** resultante da regra automática em **BR-4.5**). |
| **Pendente** | Ainda não classificado ou aguardando conferência (**BR-4.4**). |
| **Bolsista** | Mensalidade daquele mês tratada como bolsa/isento no cadastro financeiro da academia (equivalente operacional a “sem cobrança” para aquele mês). |
| **Outro** | Situação que não se encaixa nos anteriores; recomenda-se **observação** textual (**ENT-8.2**). |

**BR-4.3.** **Atrasado** não é rótulo persistido no MVP: pode ser derivado na UI como combinação de **Não pago** + data atual posterior ao vencimento (**BR-2.3**), se o ciclo de UI implementar esse indicador.

**BR-4.4.** **Semântica de ausência de registro:** se não existir linha em `payments` para o par (**aluno**, **mês de referência**), a UI e relatórios devem tratar como **Pendente** até haver registro explícito. A persistência da linha pode ser sob demanda (primeira interação) ou antecipada por rotina , decisão do ciclo de implementação da área financeira, desde que a semântica acima permaneça.

**BR-4.5.** **Transição automática Pendente → Não pago:** após o **dia de vencimento** do aluno (**BR-2.3**) no **mês de referência** em questão, se o status ainda for **Pendente** (incluindo o caso “sem linha” tratada como Pendente na UI), o sistema **deve** persistir **Não pago** quando a rotina automática (job agendado ou equivalente) executar , salvo se o professor já tiver definido **Pago** ou **Bolsista** (ou **Outro**, se a implementação optar por excluir **Outro** dessa automação; o padrão é **não** alterar **Pago**, **Bolsista** nem **Outro**). **Pago** e **Bolsista** só entram por **ação manual** do professor.

**BR-4.6.** **Derivação sem job:** até a rotina **BR-4.5** estar em produção, a aplicação pode calcular **sob demanda** o indicador **atrasado** (e **pendente** no mesmo mês até e inclusive o dia de vencimento civil) conforme **PBS-** em [`spec/features/payments-billing-status/readme.md`](../../spec/features/payments-billing-status/readme.md), sem exigir linha **`unpaid`** persistida. Quando o job existir, ambos os modelos coexistem: linha **`unpaid`** e derivados continuam coerentes com **PBS-3**.

---

## BR-5. Ações em lote

**BR-5.1.** O professor pode executar **marcar todos como pagos** para um **mês de referência** e um **recorte** de alunos (ex.: todos da lista filtrada ou da conta), para acelerar fechamento mensal.

**BR-5.2.** Ações em lote devem ser **confirmadas** na UI para evitar erro (detalhe de implementação no ciclo de billing UI).

---

## BR-6. Escopo excluído

**BR-6.1.** Conciliação bancária, split de pagamento, nota fiscal, cobrança recorrente automática e integrações PIX/boleto/cartão estão **fora do MVP**.

---

## BR-7. Implementação

**BR-7.1.** Valores monetários persistidos como **inteiros em centavos**.

**BR-7.2.** Índices e unicidade por (**student**, **reference_month**) devem evitar duplicidade de lançamento do mesmo mês (ciclo schema).

**BR-7.3.** Valores de enum persistidos no banco seguem **slugs em inglês** (ex.: `scholarship` para **Bolsista**); rótulos **pt-BR** ficam na camada de apresentação.

---

## BR-8. Recibo automático no `Pagar`

Detalhe contratual em **REC-** ([`spec/features/payment-receipts/readme.md`](../../spec/features/payment-receipts/readme.md)).

**BR-8.1. Gatilho.** Toda Server Action **`recordPayment`** que persistir uma linha em `payments` com `status='paid'` deve **disparar a geração de um recibo formal** (`type='payment_receipt'`) no **mesmo request HTTP** , de forma **síncrona blocking** (**REC-1.1**).

**BR-8.2. Idempotência.** A geração é idempotente por `payment_id`: nova chamada de `recordPayment` para o mesmo (`student_id`, `reference_month`) com **mesmo `amount_cents`** **não duplica** o recibo (devolve o existente , **REC-2.1**, **PBS-4.4**).

**BR-8.3. Resiliência.** Falha na geração do recibo **nunca** invalida o pagamento já gravado: o pagamento permanece em `payments` e o documento fica em `status='failed'` com `failure_reason` preservado, expondo CTA `Tentar gerar novamente` ao utilizador (**REC-7**, **CA-REC-004**).

**BR-8.4. Excepções por status.** Não são gerados recibos automáticos para `status='scholarship'` (sem valor recebido a comprovar , **REC-1.4**) nem `status='other'` (semântica explicitamente atípica , **REC-1.5**). Recibos manuais para esses casos podem ser gerados pelo módulo documental (**DOC-1.1**).

**BR-8.5. Reemissão.** Recibos automáticos podem ser reemitidos com **motivo obrigatório** (**DOC-11**), gerando nova `version` com selo `2ª via`, sem afectar o pagamento.

**BR-8.6. Estorno.** Quando `voidPayment` remove um pagamento (**PBS-5**), o recibo activo correspondente é marcado como `archived` (**REC-12**); permanece consultável no histórico documental do aluno mas deixa de ser o «corrente». Ressecharger requer novo `recordPayment`.

**BR-8.7. Multi-mês.** No MVP, **um recibo por `payment`** (**REC-5.1**); o template visual já comporta lista de meses para evolução futura (recibo agregado manual).

**BR-8.8. Dados do recebedor.** O recibo usa `accounts.legal_name`, `accounts.cnpj` e `accounts.signature_url` (**CFG-6**); ausência destes campos não bloqueia a geração (campos respectivos ficam vazios no PDF) mas a UI de **`/configuracoes`** sinaliza configuração incompleta.

---

## BR-9. Recorte mensal trabalhável (`/mensalidades` e KPI correlatos)

Detalhe também em **ENT-4.2**; semânticas de **inactive**/**paused**/arquivo/remover em **STU-3**, **STU-10**, **STU-11**; consumidores **BUI-2**, **PNL-3** (e afins), **PBS-6.3**.

**BR-9.1.** A **lista trabalhável** em **`/mensalidades`** só inclui estudantes com **`student_status = active`**, **`archived_at`** nulo e **`removed_at`** nulo (colunas adicionadas quando o ciclo de DDL as introduzir).

**BR-9.2.** KPIs do **painel** e leituras **`PBS-6`** que **devem** refletir o **mesmo conjunto** que a lista (ex.: **`PNL-3`**, secções de **`PNL-5`** já alinhadas ao recorte) aplicam o filtro **antes** de derivar **`MonthBillingIndicator`**.

**BR-9.3.** **Totais monetários** na vista de mensalidades que reportam o fecho do mês (**BUI-2.8** quando existir) devem **alinhar-se** ao mesmo universo da lista (não incluir linhas de **`payments`** cujo aluno **já não** satisfaz **BR-9.1**).

**BR-9.4.** **Histórico** de pagamentos já gravados **mantém-se**; apenas o **recorte de operações** muda. Páginas **detalhe**/**perfil** comportam-se segundo **SPR** e **SEC-3.3**.
