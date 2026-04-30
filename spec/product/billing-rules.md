# Regras de planos e cobrança — BJJ Manager

**Sem gateway de pagamento no MVP.** Valores em **centavos** e **BRL**; exibição **pt-BR**.

---

## BR-1. Planos

**BR-1.1.** Cada conta mantém planos do tipo **Kids** ou **Adulto** (**ENT-6.1**).

**BR-1.2.** Cada plano tem **valor padrão** configurável pelo professor (**price** em centavos).

**BR-1.3.** Planos inativos não devem ser ofertados para **novos** vínculos; vínculos existentes podem seguir regra do ciclo de dados.

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

**BR-4.1.** O professor define **manualmente** o status de cada aluno para cada mês de referência relevante.

**BR-4.2.** Estados permitidos:

| Estado | Significado operacional |
|--------|-------------------------|
| **Pago** | Professor confirma que a mensalidade daquele mês foi quitada (conforme acordo da academia). |
| **Não pago** | Professor marca explicitamente como não quitada. |
| **Pendente** | Ainda não classificado ou aguardando conferência (estado padrão sugerido para meses novos até revisão). |
| **Outro** | Situação que não se encaixa nos anteriores (isento, cortesia, acordo paralelo); recomenda-se **observação** textual (**ENT-8.2**). |

**BR-4.3.** **Atrasado** não é um quarto rótulo obrigatório no MVP: pode ser derivado na UI como combinação de **Não pago** + data atual posterior ao vencimento (**BR-2.3**), se o ciclo de UI implementar esse indicador.

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
