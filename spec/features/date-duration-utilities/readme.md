# Feature: Datas e durações (pt-BR, São Paulo)

Contrato canónico para **SPEC-2.4** (cálculos derivados de datas): funções **puras** em `lib/dates/`, com **locale pt-BR** e **calendário** ancorado em **`America/Sao_Paulo`**. Consumidores incluem lista de alunos (**STU-7.4**), perfil e graduação (ciclos dedicados).

## Relação com outras specs

- Produto: [`spec/product/spec.md`](../../product/spec.md) (**SPEC-2.4**).
- Alunos (idade na lista): [`spec/features/students-crud/readme.md`](../students-crud/readme.md) (**STU-7.4**).
- Perfil do aluno (durações, formatos): [`spec/features/student-profile/readme.md`](../student-profile/readme.md) (**SPR-6**, **SPR-7**, **SPR-8**).
- Entidades (campos `date`): [`spec/product/entities.md`](../../product/entities.md) (**ENT-4**, **ENT-5**).

## Implementação (referência)

| Área | Artefatos típicos |
|------|-------------------|
| Núcleo | `lib/dates/` , parsing de dia civil, `humanizeDuration`, idade, formatadores |
| TZ | `date-fns` v4 + `@date-fns/tz` (`TZDate`, opção `in: tz(...)`) |
| Testes | Vitest, `today` sempre injetado nos casos de teste |

---

## DATE-1. Fuso e locale

**DATE-1.1.** O fuso canónico da aplicação para **datas de negócio** é **`America/Sao_Paulo`**. Idade, diferenças de calendário e formatadores que dependem do “dia civil” usam esse contexto.

**DATE-1.2.** Textos gerados pelos helpers devem estar em **português do Brasil** (pluralização: “1 mês” / “2 meses”, “1 dia” / “2 dias”, “1 semana” / “2 semanas”, “1 ano” / “2 anos”).

**DATE-1.3.** As funções são **puras**: não leem `Date.now()` nem dependem de estado global. Quando o resultado depende de “hoje”, o chamador passa **`today`** explicitamente (tipo alinhado ao núcleo: normalmente **`YYYY-MM-DD`** ou valor já interpretado no fuso canónico, conforme API exportada).

---

## DATE-2. Entradas e parsing de `date` SQL

**DATE-2.1.** A forma preferida para campos **`date`** do Postgres é **`YYYY-MM-DD`**. O parsing deve **preservar o dia civil** (não interpretar a string como meia-noite UTC que desloca o dia).

**DATE-2.2.** Pode aceitar-se **`Date`** como entrada secundária, documentada: interpretação como **meia-noite no dia civil em `America/Sao_Paulo`** correspondente ao instante (comportamento definido na implementação, mas sempre consistente com **DATE-1.1**). Novo código da app deve preferir **`YYYY-MM-DD`** vindo do servidor.

**DATE-2.3.** Entradas **nulas**, strings vazias ou não parseáveis: funções devolvem **`null`** (a UI traduz em **","** ou equivalente, como em **STU-7.4**).

---

## DATE-3. `humanizeDuration`

**DATE-3.1.** `humanizeDuration({ from, to })` recebe **dois extremos de intervalo** em calendário São Paulo. Se **`to`** for anterior a **`from`** no calendário, o resultado é **`null`**.

**DATE-3.2.** **Não** incluir unidades abaixo do **dia** (sem horas, minutos ou segundos).

**DATE-3.3.** Decomposição por **calendário** quando há **≥ 1 mês** cumulativo: **anos** completos, depois **meses** completos remanescentes, depois **dias** remanescentes. Partes zero omitidas; partes não zero concatenadas com **" e "** (ex.: **"1 ano e 2 meses e 5 dias"**, **"3 meses e 1 dia"**).

**DATE-3.4.** Quando **não** há ainda **1 mês** completo entre os extremos: expressar com **semanas** (blocos de **7 dias**) e **dias** restantes quando aplicável (ex.: **"2 semanas e 3 dias"**); se **&lt; 7 dias** e **≥ 1 dia**, usar só **"N dias"**. Para **0 dias** de diferença civil, usar **"menos de 1 dia"**.

**DATE-3.5.** A função é **reutilizada** por `timeSinceJoined`, `timeAtCurrentBelt` e `timeAtCurrentDegree` (mesmas regras de intervalo e texto).

---

## DATE-4. Idade

**DATE-4.1.** `calculateAge(birthDate, today)` devolve **anos completos** entre a data de nascimento e **`today`**, ambas tratadas como **dias civis em São Paulo**. Se `birthDate` for inválida ou ausente → **`null`**.

**DATE-4.2.** Na UI, a idade é tipicamente mostrada como **`"{n} anos"`** quando `n` não é `null`; quando `null`, usa-se o placeholder acordado na feature de apresentação (**","** na lista , **STU-7.4**).

---

## DATE-5. Atalhos de domínio

**DATE-5.1.** `timeSinceJoined(joinedAt, today)`, `timeAtCurrentBelt(startedAt, today)` e `timeAtCurrentDegree(startedAt, today)` devolvem **`string | null`**, aplicando **DATE-3** ao intervalo `[from, to]`.

**DATE-5.2.** Valores de origem ausentes → **`null`** (sem excepções lançadas para fluxo normal de UI).

---

## DATE-6. `formatDateBR`

**DATE-6.1.** Formato de referência: **`{dia} {mês abreviado minúsculo} {ano}`** , exemplo **"12 abr 2024"** (sem ponto obrigatório após o mês).

**DATE-6.2.** Usa locale **pt-BR** do `date-fns`; se o runtime capitalizar o mês, normalizar para o padrão acordado (**DATE-6.1**).

---

## DATE-7. `formatRelativeBR`

**DATE-7.1.** Descreve **quão no passado** está uma **data civil** em relação a **`today`**, no fuso **DATE-1.1**, com formulários do tipo **"há N dias"**, **"há N semanas"**, **"há N meses"**, **"há N anos"**, com limiares coerentes com **DATE-3.4** (sem horas).

**DATE-7.2.** Para o **mesmo dia civil** que `today`, usar **"hoje"**.

**DATE-7.3.** Datas **futuras** em relação a `today`: comportamento por defeito **`null`** até haver necessidade de produto explícita (ex.: “daqui a N dias”) noutro ciclo.

---

## DATE-8. Dependências

**DATE-8.1.** **date-fns** (v4) é a base; **`@date-fns/tz`** é obrigatório para construção consistente de instantes em **`America/Sao_Paulo`**.

**DATE-8.2.** **Proibido** introduzir **dayjs** ou **moment** para este domínio.
