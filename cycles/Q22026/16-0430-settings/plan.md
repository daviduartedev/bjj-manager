# Plano , Configurações e perfil do professor (16-0430-settings)

Delta face ao estado canónico **antes** deste ciclo: `/configuracoes` placeholder; `/perfil` só leitura; nomes de plano por defeito «Kids 1 / Kids 2 / Adulto»; toggling de plano e edição de nome só previstos indirectamente em BLM; cópia europeia «Acções» / «activos» no painel; barras da distribuição por faixa monocromáticas.

## Decisões consolidadas (respostas + defaults de produto)

| Tema | Decisão |
|------|---------|
| Rota / pasta | URL **`/configuracoes`** (**SHELL-2**); implementação **`app/(dashboard)/configuracoes/page.tsx`** (segmento **português**, sem `/settings`). |
| Planos , identidade técnica | Mantêm-se os valores **`plan_kind`** na BD: **`kids_1`**, **`kids_2`**, **`adult`** (sem migração de enum neste ciclo). **`kids_2`** corresponde semanticamente a **Juvenil** na nomenclatura de produto. |
| Planos , rótulos por defeito | Provisão, seed e rótulos de fallback: **Kid 1** (`kids_1`), **Juvenil** (`kids_2`), **Adulto** (`adult`). O professor pode **editar o nome** em `plans.name` (e preço/activo) na UI. |
| Onde vive o quê | **`/configuracoes`**: nome da academia (`accounts.name`); **lista dos três planos** com nome, preço (centavos), interruptor ativo/inactivo. **`/perfil`**: dados **pessoais** do professor (nome de exibição, telefone, e-mail só leitura, avatar = **iniciais** , sem upload no MVP). |
| Server Actions | **`actions/settings.ts`**: `updateAccount` (nome da academia), `updateProfile` (perfil do professor). **Planos** permanecem no domínio de cobrança: estender **`actions/billing.ts`** com actualização de **`name`**, **`active`** (e reutilizar `updatePlanPrice` ou unificar numa action `updatePlan` com Zod parcial) , **uma** fonte de verdade para mutações em `plans`, mesmas regras **BLM-3** (toasts, mensagens, RLS). |
| `togglePlan` / preço | Comportamento de falha e mensagens alinhados a **BLM-3**; desactivar plano **não** remove vínculos; **setStudentPlan** continua a recusar plano inactivo (**BR-1.3** / **BLM-4.2**). |
| Validação | `lib/validations/settings.ts` (Zod) para conta e perfil; extensão de `lib/validations/billing.ts` para campos de plano além de preço. |
| Conta (academia) | Só **nome** neste ciclo (**E1** / resposta 6a). |
| Telefone / avatar | Coluna **`phone`** (texto, opcional) em **`profiles`** se ainda não existir; **sem** campo de imagem; UI com iniciais derivadas de `display_name`. |
| UX (professores, simplicidade) | **`/configuracoes`**: **secções empilhadas** (cartões) com títulos claros, **Academia** e **Planos**, uma coluna no mobile, botões largos; evitar abas aninhadas. Link discreto «Ir para o perfil» se fizer sentido. **`/perfil`**: um cartão, formulário curto. |
| Palavra-passe | Fora do ciclo (recovery Supabase), conforme pedido original. |
| Painel , pt-BR | Trocar **Acções** → **Ações**; **activos** → **ativos**; **registada** → **registrada** onde aplicável; **activo** → **ativo** em mensagens visíveis. |
| Painel , cores das faixas | Barras horizontais da **distribuição por faixa** usam cor **alinhada ao slug da faixa** (ex.: Azul → azul, Preta → preto/cinzento muito escuro), via paleta em código (**PNL-6** até existir `belts.color_hex` na BD). |
| Testes | Unitários para validações e helpers (cores/invariantes); QA manual das páginas; e2e opcional. |
| Rollout | Sem feature flag. |

## Alterações canónicas (ficheiros)

1. **`spec/features/settings/readme.md`** (novo) , IDs **CFG-**.
2. **`spec/README.md`** , entrada na matriz e linha **CFG-** na convenção.
3. **`spec/features/plans-billing-model/readme.md`** , BLM-1.2, BLM-4 e defaults de nome (**Kid 1 / Juvenil / Adulto**); referência a **`updatePlan`** / campos editáveis.
4. **`spec/product/billing-rules.md`** e **`docs/product/billing-rules.md`** , **BR-1.1** com nomenclatura de produto alinhada (incl. Juvenil).
5. **`spec/product/entities.md`** e **`docs/product/entities.md`** , **ENT-2** (telefone opcional), **ENT-6** (nomes por defeito e edição do nome).
6. **`spec/features/app-shell/readme.md`** , remeter conteúdo a **CFG-** para `/configuracoes` e `/perfil`.
7. **`spec/features/dashboard/readme.md`** , **PNL-6** (cor das barras); **PNL-7** título **Ações rápidas**; terminologia **ativos** onde aplicável.
8. **`spec/features/student-profile/readme.md`** , **SPR-9** «Ações» (pt-BR).
9. **`spec/features/billing-ui/readme.md`** , tabela de actions: nomenclatura pt-BR.

## Fora de scope explícito

- Upload de foto (professor ou academia).
- Alteração de e-mail de login na app (continua via Auth/admin).
- Migração de enum `plan_kind` para novos identificadores em inglês.

## Referências

- Pedido: `cycles/Q22026/16-0430-settings/request.md`
- **SHELL-**, **BLM-**, **BR-**, **ENT-**, **AUTH-**, **CFG-**
