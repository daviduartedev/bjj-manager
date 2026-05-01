# Regras de planos e cobrança , Casca - Gestão de Academias de BJJ

**Sem gateway de pagamento no MVP.** Valores em **centavos** e **BRL**; exibição **pt-BR**.

---

## BR-1. Planos

**BR-1.1.** Cada conta mantém planos dos tipos **`kids_1`**, **`kids_2`** e **`adult`** (**ENT-6.1**). Na linguagem de produto usam-se por defeito os rótulos **Kid 1**, **Juvenil** e **Adulto** ( **`kids_2`** = Juvenil). O professor associa manualmente cada aluno a uma dessas categorias para refletir **faixa etária / turma** da operação da academia (não há automação por idade no MVP).

**BR-1.2.** Cada plano tem **valor padrão** configurável pelo professor (**price** em centavos).

**BR-1.3.** Planos inativos não devem ser ofertados para **novos** vínculos; vínculos existentes podem seguir regra do ciclo de dados.

**BR-1.4.** No **seed** de desenvolvimento, criam-se os **três** planos por conta de exemplo com nomes alinhados a **BR-1.1** e valores por defeito **10000** centavos (Kid 1) e **12000** centavos (Juvenil e Adulto) , referência para integração futura; o professor pode alterar **`price_cents`** e o **nome de exibição** (`plans.name`) nas Configurações. Em **produção**, na primeira carga do layout da área autenticada **(dashboard)**, a aplicação garante **idempotentemente** os mesmos três tipos de plano para a conta com esses valores iniciais (**BLM-2**).

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

**BR-4.6.** **Derivação sem job:** até a rotina **BR-4.5** estar em produção, a aplicação pode calcular **sob demanda** o indicador **atrasado** (e **pendente** no mesmo mês até e inclusive o dia de vencimento civil) conforme **PBS-** em [`spec/features/payments-billing-status/readme.md`](../features/payments-billing-status/readme.md), sem exigir linha **`unpaid`** persistida. Quando o job existir, ambos os modelos coexistem: linha **`unpaid`** e derivados continuam coerentes com **PBS-3**.

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
