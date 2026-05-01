# Feature: Motor de graduação (promoções e histórico)

Contrato canónico para **registar graduações**, **validar ordem oficial** (**GR-**), **persistir histórico imutável** (**ENT-5**) e **actualizar** `students.current_belt_id` / `students.current_degree`. Integra com o perfil (**SPR-**) e o schema **Supabase** (`student_graduations`, `belts`).

## Relação com outras specs

- Regras de produto: [`spec/product/graduation-rules.md`](../../product/graduation-rules.md) (**GR-**), [`spec/product/entities.md`](../../product/entities.md) (**ENT-3**, **ENT-4**, **ENT-5**).
- Perfil: [`spec/features/student-profile/readme.md`](../student-profile/readme.md) (**SPR-7**, **SPR-9**).
- Shell e URLs: [`spec/features/app-shell/readme.md`](../app-shell/readme.md) (**SHELL-2**).
- Datas: [`spec/features/date-duration-utilities/readme.md`](../date-duration-utilities/readme.md) (**DATE-**).
- RLS: [`spec/features/rls-security/readme.md`](../rls-security/readme.md) (**SEC-3.3**).
- Design: [`spec/features/design-system/readme.md`](../design-system/readme.md) (**DS-1.11** com realce cromático neste ciclo).

## Implementação (referência)

| Área | Artefactos típicos |
|------|-------------------|
| Histórico completo | `app/(dashboard)/alunos/[id]/graduacoes/page.tsx` |
| Rotas | `lib/routes.ts` , helper para `/alunos/[id]/graduacoes` |
| Server Action | `actions/graduations.ts` , `promoteStudent` |
| Domínio | `lib/graduation/*` , ordem, sucessor, `isOrderRespected`, limites de grau |
| UI | Modal cliente **Promover**; timeline/cards no histórico; badges com `belts.color_hex` |

---

## GRD-1. Rotas e escopo

**GRD-1.1.** A página pública de histórico completo situa-se em **`/alunos/[id]/graduacoes`** (**SHELL-2**).

**GRD-1.2.** O pedido de implementação pode usar segmentos de pasta em inglês no código Next.js; a **URL canónica** permanece **pt-BR** como **GRD-1.1**.

---

## GRD-2. Segurança e multi-tenant

**GRD-2.1.** Dados carregam **no servidor** com cliente Supabase e sessão; **`account_id` não é aceite do cliente** (**STU-2.1**, **SEC-3.3**).

**GRD-2.2.** Aluno inexistente ou fora do tenant: **`notFound()`** , mesma política que **SPR-2.2**.

---

## GRD-3. Regras de validação (aplicação)

**GRD-3.1.** **Sem demotion:** não é permitido registo cuja ordem implique regresso de faixa ou de grau relativamente ao estado actual.

**GRD-3.2.** **Sem no-op:** não é permitido registo cujo **(faixa resultante, grau resultante)** seja **igual** ao par actual em `students`.

**GRD-3.3.** **Mesma faixa:** só é válido avançar **exactamente um grau** por operação (**GR-4.5**). Casos inválidos são **rejeitados** sem fluxo de justificativa de pulo de faixa.

**GRD-3.4.** **Mudança de faixa:** a sucessão segue **GR-1.1** / **GR-2.1**; **pulo de faixa** (**GR-4.1**) obriga **justificativa** persistida (**GR-4.3**, **GR-4.4**, **GR-6.2**); promoção que avança **exactamente uma posição** na lista e define grau **coerente** com **GR-1.5** (típico **0** na nova faixa colorida) não é pulo.

**GRD-3.5.** **Graus por faixa:** faixas coloridas adulto e faixas kids **0–4**; faixa preta adulto **1–6** (**GR-1.3**, **GR-1.4**, **GR-2.2**).

**GRD-3.6.** **Data da graduação (`graduatedAt`):** **passado** e **hoje** permitidos; **futuro** proibido. Avaliação de “dia civil” em **`America/Sao_Paulo`**, alinhado às convenções de **DATE-** / cobrança.

**GRD-3.7.** A Server Action **promoteStudent** deve ser **transaccional**: inserção em `student_graduations` e actualização de `students` **atomicamente** (tudo ou nada).

---

## GRD-4. Catálogo de faixas na UI

**GRD-4.1.** Por defeito, o selector de faixa mostra apenas faixas cujo **`belt.kind`** coincide com **`student_kind`** do aluno.

**GRD-4.2.** **Modo excepção:** o professor pode visualizar e seleccionar faixas do **outro** kind quando necessário (transição kids→adulto, caso excepcional), através de um controlo explícito na UI (ex.: “Mostrar todas as faixas”). O servidor valida IDs existentes e políticas de negócio (**GRD-3**).

---

## GRD-5. Modal “Promover aluno”

**GRD-5.1.** Disponível a partir do **perfil** (**SPR-9.2**) e da **página de histórico** (**GRD-1.1**).

**GRD-5.2.** Campos mínimos: faixa resultante, grau resultante, data da graduação; quando **pulo de faixa**, campo de **justificativa** obrigatório antes de submeter.

**GRD-5.3.** **Alerta de cópia** para pulo de faixa, no espírito: “Você está pulando da [X] para a [Y]. Justifique:” , usando os **rótulos** de faixa adequados ao utilizador.

**GRD-5.4.** Quando **`student_kind`** é kids e a **idade** (**DATE-4**) é **≥ 16**, mostrar **aviso** no modal alinhado a **GR-3.1** (faixa adulta inicial é decisão do professor).

**GRD-5.5.** Após sucesso: **toast** (**DS-1.8**), **revalidação** dos dados, utilizador **permanece** na página onde iniciou a acção (perfil ou histórico).

---

## GRD-6. Histórico e imutabilidade

**GRD-6.1.** Não há **edição** nem **eliminação** de linhas em `student_graduations` no MVP; apenas **novos** registos via **promoteStudent**.

**GRD-6.2.** A página **`/alunos/[id]/graduacoes`** apresenta o **histórico completo** (timeline ou cartões), mais recente primeiro, com data, faixa, grau; se **`was_skip`**, mostrar **justificativa** (**ENT-5**, **GR-4**).

---

## GRD-7. Apresentação das faixas

**GRD-7.1.** Exibir a cor da faixa com **chip/badge** usando **`belts.color_hex`**, com contraste legível em tema claro e escuro.

---

## Manutenção

Alterações em promoções, URLs ou regras de validação devem actualizar **este readme**, **`spec/product/graduation-rules.md`** quando afectarem **GR-**, **`spec/features/student-profile/readme.md`** quando afectarem **SPR-7**/**SPR-9**, **`spec/features/app-shell/readme.md`** se os paths mudarem, e os cenários em `cycles/.../11-0430-graduation-engine/scenarios.feature`.
