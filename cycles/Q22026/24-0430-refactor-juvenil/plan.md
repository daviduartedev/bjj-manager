# Refatoração Juvenil Faixa Laranja e Produtos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a regra de aluno kids da familia laranja no plano Adulto e criar a area autenticada de Produtos para controle interno de estoque.

**Architecture:** A regra de elegibilidade de plano deve ficar em helper de dominio compartilhado e ser consumida por validacoes, server actions e UI. Produtos deve seguir o padrao atual de dados por conta no Supabase: schema/migration/seed/policies, camada `lib/data`, server actions validadas com Zod e componentes da area autenticada.

**Tech Stack:** Next.js App Router, React, TypeScript, Supabase/Postgres, RLS SQL, Zod, React Hook Form, Vitest, Playwright quando necessario, componentes UI locais.

---

## Estrutura de Arquivos

### Arquivos de regra aluno/plano

- Modificar: `lib/students/plan-kind.ts`
  - Responsabilidade: regra pura de compatibilidade entre tipo de aluno, plano e faixa.
- Modificar: `lib/students/plan-kind.test.ts`
  - Responsabilidade: testes unitarios da regra de compatibilidade.
- Modificar: `lib/validations/students.ts`
  - Responsabilidade: validacao Zod dos formularios completos e rapidos.
- Modificar: `lib/validations/students.test.ts`
  - Responsabilidade: testes de validacao de payloads validos/invalidos.
- Modificar: `components/students/student-form.tsx`
  - Responsabilidade: filtrar planos no cadastro/edicao completa conforme tipo e faixa.
- Modificar: `components/students/quick-edit-dialog.tsx`
  - Responsabilidade: filtrar planos na edicao rapida conforme faixa atual/editada.
- Modificar: `actions/students.ts`
  - Responsabilidade: garantir a regra no servidor antes de salvar.

### Arquivos de banco e dados de Produtos

- Modificar: `db/schema.sql`
  - Responsabilidade: estado final do schema para novas bases.
- Modificar: `db/seed.sql`
  - Responsabilidade: seed dev dos produtos iniciais.
- Criar: `db/migrations/002_products_inventory.sql`
  - Responsabilidade: migracao idempotente para ambientes existentes.
- Modificar: `db/policies.sql`
  - Responsabilidade: habilitar RLS e policies das novas tabelas.
- Criar: `lib/products/initial-products.ts`
  - Responsabilidade: definicao unica dos produtos iniciais/codigos/tamanhos para TS.
- Criar: `lib/validations/products.ts`
  - Responsabilidade: schemas Zod para produto, variacao e estoque.
- Criar: `lib/validations/products.test.ts`
  - Responsabilidade: testes unitarios de validacao de produtos.
- Criar: `lib/data/products-page.ts`
  - Responsabilidade: query server-side da tela Produtos.
- Criar: `actions/products.ts`
  - Responsabilidade: server actions de criar/editar produto e variacoes.

### Arquivos de UI Produtos e navegacao

- Modificar: `lib/routes.ts`
  - Responsabilidade: rota canonica `/produtos` e prefixo autenticado.
- Modificar: `components/layout/dashboard-nav-config.tsx`
  - Responsabilidade: item Produtos na navegacao principal.
- Modificar: `components/onboarding/guided-tour.tsx`
  - Responsabilidade: texto/ordem do tour quando necessario.
- Criar: `app/(dashboard)/produtos/page.tsx`
  - Responsabilidade: pagina server-side de Produtos.
- Criar: `components/products/products-client.tsx`
  - Responsabilidade: UI client da lista e formularios de Produtos.
- Criar: `components/products/product-editor-card.tsx`
  - Responsabilidade: card de produto, edicao de nome/status e variacoes.
- Criar: `components/products/product-dialog.tsx`
  - Responsabilidade: dialog de criacao de produto.

## Ciclo 1: Regra de Compatibilidade Kids Laranja/Adulto

### Objetivo do ciclo

Consolidar a regra de negocio em helper puro e provar o comportamento com testes antes de alterar UI.

### Arquivos provaveis

- `lib/students/plan-kind.ts`
- `lib/students/plan-kind.test.ts`

### Passos de implementacao

- [ ] **Step 1: Escrever testes da regra nova**

Adicionar casos em `lib/students/plan-kind.test.ts` cobrindo Adulto, Kids 1, Kids 2 e Adulto condicionado a faixa laranja.

```ts
import { describe, expect, it } from "vitest";

import {
  isOrangeFamilyKidsBeltSlug,
  planKindMatchesStudentContext,
} from "./plan-kind";

describe("isOrangeFamilyKidsBeltSlug", () => {
  it.each(["orange_white", "orange", "orange_black"])(
    "aceita %s como familia laranja",
    (slug) => {
      expect(isOrangeFamilyKidsBeltSlug(slug)).toBe(true);
    },
  );

  it.each(["white", "yellow", "green", "blue"])(
    "rejeita %s como familia laranja",
    (slug) => {
      expect(isOrangeFamilyKidsBeltSlug(slug)).toBe(false);
    },
  );
});

describe("planKindMatchesStudentContext", () => {
  it("permite adulto no plano Adulto", () => {
    expect(
      planKindMatchesStudentContext({
        planKind: "adult",
        studentKind: "adult",
        beltSlug: "blue",
      }),
    ).toBe(true);
  });

  it("bloqueia adulto em Kids 1 e Kids 2", () => {
    expect(
      planKindMatchesStudentContext({
        planKind: "kids_1",
        studentKind: "adult",
        beltSlug: "blue",
      }),
    ).toBe(false);
    expect(
      planKindMatchesStudentContext({
        planKind: "kids_2",
        studentKind: "adult",
        beltSlug: "blue",
      }),
    ).toBe(false);
  });

  it("permite kids em Kids 1 e Kids 2", () => {
    expect(
      planKindMatchesStudentContext({
        planKind: "kids_1",
        studentKind: "kids",
        beltSlug: "yellow",
      }),
    ).toBe(true);
    expect(
      planKindMatchesStudentContext({
        planKind: "kids_2",
        studentKind: "kids",
        beltSlug: "yellow",
      }),
    ).toBe(true);
  });

  it.each(["orange_white", "orange", "orange_black"])(
    "permite kids %s no Adulto",
    (beltSlug) => {
      expect(
        planKindMatchesStudentContext({
          planKind: "adult",
          studentKind: "kids",
          beltSlug,
        }),
      ).toBe(true);
    },
  );

  it.each(["white", "gray", "yellow", "green"])(
    "bloqueia kids %s no Adulto",
    (beltSlug) => {
      expect(
        planKindMatchesStudentContext({
          planKind: "adult",
          studentKind: "kids",
          beltSlug,
        }),
      ).toBe(false);
    },
  );
});
```

- [ ] **Step 2: Rodar teste e confirmar falha esperada**

Run: `pnpm test lib/students/plan-kind.test.ts`

Expected: falha por `isOrangeFamilyKidsBeltSlug` ou `planKindMatchesStudentContext` ainda nao existir.

- [ ] **Step 3: Implementar helper minimo**

Em `lib/students/plan-kind.ts`, manter a funcao antiga para compatibilidade temporaria e adicionar a regra contextual.

```ts
import type { StudentKind } from "@/lib/students/degree";

export type PlanKind = "kids_1" | "kids_2" | "adult";

const ORANGE_FAMILY_KIDS_BELTS = new Set([
  "orange_white",
  "orange",
  "orange_black",
]);

export function isOrangeFamilyKidsBeltSlug(slug: string | null | undefined): boolean {
  return typeof slug === "string" && ORANGE_FAMILY_KIDS_BELTS.has(slug);
}

export function planKindMatchesStudentContext(args: {
  planKind: PlanKind;
  studentKind: StudentKind;
  beltSlug: string | null | undefined;
}): boolean {
  const { planKind, studentKind, beltSlug } = args;
  if (studentKind === "adult") return planKind === "adult";
  if (planKind === "kids_1" || planKind === "kids_2") return true;
  return isOrangeFamilyKidsBeltSlug(beltSlug);
}

export function planKindMatchesStudentKind(
  planKind: PlanKind,
  studentKind: StudentKind,
): boolean {
  if (studentKind === "adult") return planKind === "adult";
  return planKind === "kids_1" || planKind === "kids_2" || planKind === "adult";
}
```

- [ ] **Step 4: Rodar teste e confirmar sucesso**

Run: `pnpm test lib/students/plan-kind.test.ts`

Expected: PASS.

### Cuidados

- Nao remover de imediato `planKindMatchesStudentKind`, porque outros pontos ainda podem depender da assinatura antiga durante o ciclo.
- A regra final deve migrar os pontos sensiveis para `planKindMatchesStudentContext`.

### Validacao

- `pnpm test lib/students/plan-kind.test.ts`

### Criterios de conclusao

- Helper contextual existe.
- Testes cobrem familia laranja e bloqueios.
- Funcoes antigas continuam compilando.

## Ciclo 2: Validacao e Server Actions de Alunos

### Objetivo do ciclo

Impedir que payloads invalidos vinculem kids nao-laranja ao Adulto, mesmo com UI burlada.

### Arquivos provaveis

- `lib/validations/students.ts`
- `lib/validations/students.test.ts`
- `actions/students.ts`

### Passos de implementacao

- [ ] **Step 1: Atualizar schemas para usar contexto de faixa**

Em `buildStudentFullFormSchema`, encontrar o belt selecionado e trocar a validacao de plano para `planKindMatchesStudentContext`.

```ts
const plan = planById.get(data.plan_id);
if (
  !plan ||
  !planKindMatchesStudentContext({
    planKind: plan.kind,
    studentKind: data.kind as StudentKind,
    beltSlug: belt.slug,
  })
) {
  ctx.addIssue({
    code: "custom",
    message: "Plano incompatível com o tipo e a faixa do aluno.",
    path: ["plan_id"],
  });
}
```

Em `buildQuickEditFormSchema`, usar o `belt` selecionado na mesma regra.

```ts
const plan = plans.find((p) => p.id === data.plan_id);
if (
  !plan ||
  !planKindMatchesStudentContext({
    planKind: plan.kind,
    studentKind,
    beltSlug: belt.slug,
  })
) {
  ctx.addIssue({
    code: "custom",
    message: "Plano incompatível com a faixa do aluno.",
    path: ["plan_id"],
  });
}
```

- [ ] **Step 2: Atualizar server actions para validacao final**

Em `createStudent` e `updateStudent`, trocar `planKindMatchesStudentKind` pela regra contextual usando `belt.slug`.

```ts
if (
  !plan ||
  !planKindMatchesStudentContext({
    planKind: plan.kind,
    studentKind: v.kind as StudentKind,
    beltSlug: belt.slug,
  })
) {
  return { ok: false, error: "Dados de plano inválidos para a faixa do aluno." };
}
```

Em `quickUpdateStudent`, resolver tambem o plano antes de salvar e validar com o `belt.slug` selecionado.

```ts
const plan = await resolvePlan(supabase, v.plan_id);
if (
  !plan ||
  !planKindMatchesStudentContext({
    planKind: plan.kind,
    studentKind,
    beltSlug: belt.slug,
  })
) {
  return { ok: false, error: "Dados de plano inválidos para a faixa do aluno." };
}
```

- [ ] **Step 3: Atualizar testes de validacao**

Adicionar em `lib/validations/students.test.ts` um catalogo minimo de belts/plans e casos:

```ts
const belts = [
  { id: "00000000-0000-4000-8000-000000000001", kind: "kids", slug: "yellow" },
  { id: "00000000-0000-4000-8000-000000000002", kind: "kids", slug: "orange" },
  { id: "00000000-0000-4000-8000-000000000003", kind: "adult", slug: "blue" },
] as const;

const plans = [
  { id: "00000000-0000-4000-8000-000000000011", kind: "kids_1" },
  { id: "00000000-0000-4000-8000-000000000012", kind: "kids_2" },
  { id: "00000000-0000-4000-8000-000000000013", kind: "adult" },
] as const;
```

Testar que kids `yellow` + Adulto falha e kids `orange` + Adulto passa.

- [ ] **Step 4: Rodar testes**

Run: `pnpm test lib/validations/students.test.ts lib/students/plan-kind.test.ts`

Expected: PASS.

### Cuidados

- `quickUpdateStudent` recebe `studentKind` do chamador. A validacao deve usar esse tipo e a faixa selecionada no form.
- Mensagens de erro devem ser amigaveis e nao mencionar slug interno.

### Validacao

- Testes unitarios de validacao.
- Revisao manual dos imports para remover uso indevido da regra antiga em paths sensiveis.

### Criterios de conclusao

- Server actions rejeitam kids nao-laranja no Adulto.
- Schemas aceitam kids laranja no Adulto.
- Testes de validacao passam.

## Ciclo 3: UI de Alunos e Edição Rapida

### Objetivo do ciclo

Fazer a UI exibir apenas planos compativeis com tipo e faixa, sem aplicar Adulto automaticamente.

### Arquivos provaveis

- `components/students/student-form.tsx`
- `components/students/quick-edit-dialog.tsx`

### Passos de implementacao

- [ ] **Step 1: Filtrar planos por contexto no formulario completo**

Em `StudentForm`, trocar `plansForKind` para depender de `kind`, `selectedBelt` e `planKindMatchesStudentContext`.

```ts
const plansForKind = useMemo(
  () =>
    plans.filter((p) =>
      planKindMatchesStudentContext({
        planKind: p.kind,
        studentKind: kind,
        beltSlug: selectedBelt?.slug,
      }),
    ),
  [plans, kind, selectedBelt?.slug],
);
```

- [ ] **Step 2: Sincronizar plano invalido ao trocar faixa**

Adicionar efeito no `StudentForm` para corrigir selecao invalida sem escolher Adulto automaticamente.

```ts
useEffect(() => {
  const currentPlanId = form.getValues("plan_id");
  if (plansForKind.some((p) => p.id === currentPlanId)) return;
  const fallback = pickDefaultPlanForStudentContext({
    plans,
    studentKind: kind,
    beltSlug: selectedBelt?.slug,
  });
  if (fallback) {
    form.setValue("plan_id", fallback.id, { shouldDirty: true, shouldValidate: true });
  }
}, [form, kind, plans, plansForKind, selectedBelt?.slug]);
```

Criar `pickDefaultPlanForStudentContext` em `lib/students/plan-kind.ts`, preferindo `Kids 1`, depois `Kids 2`, depois `Adulto` somente quando compativel.

- [ ] **Step 3: Filtrar planos na edicao rapida**

Em `QuickEditDialog`, calcular `selectedBelt` pelo valor atual do form e filtrar com `planKindMatchesStudentContext`.

```ts
const plansForKind = plans.filter((p) =>
  planKindMatchesStudentContext({
    planKind: p.kind,
    studentKind: kind as StudentKind,
    beltSlug: selectedBelt?.slug,
  }),
);
```

- [ ] **Step 4: Sincronizar plano invalido na edicao rapida**

Adicionar efeito equivalente ao do formulario completo, usando fallback kids quando a faixa deixa de permitir Adulto.

```ts
useEffect(() => {
  if (!open || !defaults) return;
  const currentPlanId = form.getValues("plan_id");
  if (plansForKind.some((p) => p.id === currentPlanId)) return;
  const fallback = pickDefaultPlanForStudentContext({
    plans,
    studentKind: kind as StudentKind,
    beltSlug: selectedBelt?.slug,
  });
  if (fallback) {
    form.setValue("plan_id", fallback.id, { shouldDirty: true, shouldValidate: true });
  }
}, [defaults, form, kind, open, plans, plansForKind, selectedBelt?.slug]);
```

- [ ] **Step 5: Rodar type-check e testes de alunos**

Run: `pnpm type-check`

Expected: sem erros TypeScript.

Run: `pnpm test lib/students/plan-kind.test.ts lib/validations/students.test.ts`

Expected: PASS.

### Cuidados

- Adulto nao deve ser selecionado automaticamente quando o aluno fica elegivel; deve apenas aparecer como opcao.
- Se o Adulto ja estava selecionado e a faixa muda para nao-laranja, a UI deve corrigir para plano kids ou exigir escolha valida.

### Validacao

- Criar/editar kids `orange` e confirmar que Adulto aparece.
- Criar/editar kids `yellow` e confirmar que Adulto nao aparece.
- Trocar faixa de `orange` para `yellow` com Adulto selecionado e confirmar que a selecao fica valida antes de salvar.

### Criterios de conclusao

- UI e servidor concordam na regra.
- Fluxos existentes de Adulto, Kids 1 e Kids 2 continuam funcionando.

## Ciclo 4: Banco de Dados de Produtos

### Objetivo do ciclo

Criar persistencia multi-tenant para produtos e variacoes com RLS e dados iniciais.

### Arquivos provaveis

- `db/schema.sql`
- `db/seed.sql`
- `db/migrations/002_products_inventory.sql`
- `db/policies.sql`

### Passos de implementacao

- [ ] **Step 1: Adicionar tabelas ao schema**

Adicionar em `db/schema.sql`, apos tabelas principais:

```sql
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_account_code_unique UNIQUE (account_id, code),
  CONSTRAINT products_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT products_code_not_blank CHECK (length(trim(code)) > 0)
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  size_label text NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_variants_product_size_unique UNIQUE (product_id, size_label),
  CONSTRAINT product_variants_size_not_blank CHECK (length(trim(size_label)) > 0),
  CONSTRAINT product_variants_stock_non_negative CHECK (stock_quantity >= 0)
);
```

Adicionar indices:

```sql
CREATE INDEX IF NOT EXISTS idx_products_account_id ON public.products (account_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants (product_id);
```

- [ ] **Step 2: Criar migracao idempotente**

Criar `db/migrations/002_products_inventory.sql` com os mesmos `CREATE TABLE IF NOT EXISTS`, indices e inserts iniciais por conta existente.

```sql
WITH inserted_products AS (
  INSERT INTO public.products (account_id, code, name, active, sort_order)
  SELECT a.id, seed.code, seed.name, true, seed.sort_order
  FROM public.accounts a
  CROSS JOIN (
    VALUES
      ('academy-shirts', 'Camisetas da academia', 10),
      ('rash-guards-femininas', 'Rash Guards femininas', 20),
      ('rash-guards-masculinas', 'Rash Guards masculinas', 30),
      ('quimonos-kmno', 'Quimonos KMNO', 40),
      ('quimonos-zenshins', 'Quimonos Zenshins', 50)
  ) AS seed(code, name, sort_order)
  ON CONFLICT ON CONSTRAINT products_account_code_unique DO UPDATE
    SET sort_order = EXCLUDED.sort_order
  RETURNING id, account_id, code
)
INSERT INTO public.product_variants (product_id, size_label, stock_quantity, sort_order)
SELECT p.id, size_seed.size_label, 0, size_seed.sort_order
FROM public.products p
JOIN (
  VALUES
    ('academy-shirts', 'P', 10),
    ('academy-shirts', 'M', 20),
    ('academy-shirts', 'G', 30),
    ('academy-shirts', 'GG', 40)
) AS size_seed(product_code, size_label, sort_order)
  ON size_seed.product_code = p.code
ON CONFLICT ON CONSTRAINT product_variants_product_size_unique DO NOTHING;
```

- [ ] **Step 3: Atualizar seed dev**

Em `db/seed.sql`, adicionar inserts equivalentes para a conta dev fixa. Usar `ON CONFLICT` para evitar duplicacao.

- [ ] **Step 4: Atualizar RLS**

Em `db/policies.sql`, habilitar RLS:

```sql
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
```

Criar policies:

```sql
DROP POLICY IF EXISTS products_tenant_all ON public.products;

CREATE POLICY products_tenant_all ON public.products FOR ALL TO authenticated USING (account_id = public.current_account_id ())
WITH
  CHECK (account_id = public.current_account_id ());

DROP POLICY IF EXISTS product_variants_by_product_tenant ON public.product_variants;

CREATE POLICY product_variants_by_product_tenant ON public.product_variants FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = product_variants.product_id
      AND p.account_id = public.current_account_id ()
  )
)
WITH
  CHECK (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_variants.product_id
        AND p.account_id = public.current_account_id ()
    )
  );
```

- [ ] **Step 5: Validar SQL localmente**

Run: `pnpm db:apply`

Expected: `OK , schema + seed + migrations + policies (RLS) aplicados.`

Se nao houver `DATABASE_URL`, registrar que a validacao de banco precisa ser feita em ambiente configurado e seguir com testes TypeScript.

### Cuidados

- `db:apply` roda `schema.sql`, depois `seed.sql`, depois migracoes, depois `policies.sql`; por isso as tabelas precisam existir no schema antes do seed.
- Inserts iniciais nao devem sobrescrever nomes editados pelo professor; atualizar apenas campos tecnicos como `sort_order`.

### Validacao

- `pnpm db:apply` quando houver banco configurado.
- Revisar que products e product_variants tem RLS.

### Criterios de conclusao

- Tabelas criadas de forma idempotente.
- Produtos iniciais nao duplicam.
- RLS isola por conta.

## Ciclo 5: Camada de Dados, Validacoes e Actions de Produtos

### Objetivo do ciclo

Criar API interna segura para a tela Produtos.

### Arquivos provaveis

- `lib/products/initial-products.ts`
- `lib/validations/products.ts`
- `lib/validations/products.test.ts`
- `lib/data/products-page.ts`
- `actions/products.ts`

### Passos de implementacao

- [ ] **Step 1: Criar validacoes de produtos**

Em `lib/validations/products.ts`:

```ts
import { z } from "zod";

export const productNameSchema = z.string().trim().min(2, "Informe o nome.").max(120, "Nome muito longo.");

export const productSizeLabelSchema = z.string().trim().min(1, "Informe o tamanho.").max(40, "Tamanho muito longo.");

export const productStockQuantitySchema = z.coerce
  .number()
  .int("Use um número inteiro.")
  .min(0, "O estoque não pode ser negativo.")
  .max(99999, "Quantidade muito alta.");

export const createProductSchema = z.object({
  name: productNameSchema,
}).strict();

export const updateProductSchema = z.object({
  productId: z.string().uuid(),
  name: productNameSchema.optional(),
  active: z.boolean().optional(),
}).strict();

export const createProductVariantSchema = z.object({
  productId: z.string().uuid(),
  sizeLabel: productSizeLabelSchema,
  stockQuantity: productStockQuantitySchema.default(0),
}).strict();

export const updateProductVariantSchema = z.object({
  variantId: z.string().uuid(),
  sizeLabel: productSizeLabelSchema.optional(),
  stockQuantity: productStockQuantitySchema.optional(),
}).strict();

export const deleteProductVariantSchema = z.object({
  variantId: z.string().uuid(),
}).strict();
```

- [ ] **Step 2: Testar validacoes**

Em `lib/validations/products.test.ts`, testar nome curto, tamanho vazio, quantidade negativa, decimal e quantidade valida.

Run: `pnpm test lib/validations/products.test.ts`

Expected: PASS apos implementacao.

- [ ] **Step 3: Criar query da tela Produtos**

Em `lib/data/products-page.ts`:

```ts
import { createClient } from "@/lib/supabase/server";

export type ProductVariantRow = {
  id: string;
  size_label: string;
  stock_quantity: number;
  sort_order: number;
};

export type ProductRow = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  sort_order: number;
  variants: ProductVariantRow[];
};

export async function loadProductsPageData(): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      code,
      name,
      active,
      sort_order,
      product_variants (
        id,
        size_label,
        stock_quantity,
        sort_order
      )
    `,
    )
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    active: row.active,
    sort_order: row.sort_order,
    variants: [...(row.product_variants ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order || a.size_label.localeCompare(b.size_label),
    ),
  }));
}
```

- [ ] **Step 4: Criar server actions**

Em `actions/products.ts`, criar actions:

- `createProduct(values)`
- `updateProduct(values)`
- `createProductVariant(values)`
- `updateProductVariant(values)`
- `deleteProductVariant(values)`

Padrao de retorno:

```ts
export type ProductActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
```

Usar `getCurrentAccount()` em `createProduct` para preencher `account_id`; nas demais actions, confiar em RLS e checar erro Supabase para mensagem amigavel. Revalidar `ROUTES.produtos`.

- [ ] **Step 5: Rodar testes e type-check**

Run: `pnpm test lib/validations/products.test.ts`

Expected: PASS.

Run: `pnpm type-check`

Expected: sem erros.

### Cuidados

- Gerar `code` interno de produto novo no servidor com `custom-${crypto.randomUUID()}`.
- Nao expor erros de constraint diretamente; mapear duplicidade de tamanho para mensagem como `Este tamanho já existe neste produto.`
- Nunca aceitar estoque negativo.

### Validacao

- Testes de schema.
- Type-check completo.

### Criterios de conclusao

- Actions existem e revalidam Produtos.
- Validacoes impedem dados invalidos.
- Query retorna produtos com variacoes ordenadas.

## Ciclo 6: UI e Navegacao de Produtos

### Objetivo do ciclo

Adicionar a rota Produtos e uma interface consistente para controle interno.

### Arquivos provaveis

- `lib/routes.ts`
- `components/layout/dashboard-nav-config.tsx`
- `components/onboarding/guided-tour.tsx`
- `app/(dashboard)/produtos/page.tsx`
- `components/products/products-client.tsx`
- `components/products/product-editor-card.tsx`
- `components/products/product-dialog.tsx`

### Passos de implementacao

- [ ] **Step 1: Adicionar rota**

Em `lib/routes.ts`:

```ts
export const ROUTES = {
  login: "/login",
  painel: "/painel",
  alunos: "/alunos",
  alunosNovo: "/alunos/novo",
  mensalidades: "/mensalidades",
  produtos: "/produtos",
  configuracoes: "/configuracoes",
  perfil: "/perfil",
} as const;
```

Adicionar `ROUTES.produtos` em `AUTHENTICATED_PATH_PREFIXES`.

- [ ] **Step 2: Adicionar navegacao**

Em `components/layout/dashboard-nav-config.tsx`, importar `Package` de `lucide-react` e inserir item Produtos entre Mensalidades e Configuracoes.

```ts
{ href: ROUTES.produtos, label: "Produtos", icon: Package, dataTour: "tour-produtos" },
```

- [ ] **Step 3: Criar pagina server-side**

Em `app/(dashboard)/produtos/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Package } from "lucide-react";

import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { ProductsClient } from "@/components/products/products-client";
import { loadProductsPageData } from "@/lib/data/products-page";

export const metadata: Metadata = {
  title: "Produtos",
};

export default async function ProdutosPage() {
  const products = await loadProductsPageData();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DashboardPageHero
        badge="Controle interno"
        title="Produtos"
        description="Cadastro de produtos, tamanhos e estoque manual da academia."
      />
      <ProductsClient products={products} />
    </div>
  );
}
```

- [ ] **Step 4: Criar client de produtos**

`ProductsClient` deve renderizar:

- botao `Novo produto`;
- estado vazio;
- lista de `ProductEditorCard`;
- `ProductDialog` para criar produto.

- [ ] **Step 5: Criar editor de produto**

`ProductEditorCard` deve permitir:

- editar nome;
- alternar ativo/inativo;
- listar variacoes;
- editar tamanho e estoque;
- adicionar variacao;
- remover variacao com `confirm()` quando `stock_quantity > 0`.

Usar `toast` para sucesso/erro e `router.refresh()` apos actions bem-sucedidas.

- [ ] **Step 6: Atualizar tour guiado**

Adicionar texto curto para Produtos se o tour listar itens da navegacao. Exemplo:

```ts
"Controle produtos da academia: tamanhos, quantidades e estoque manual, sem venda ou checkout nesta etapa."
```

- [ ] **Step 7: Rodar type-check**

Run: `pnpm type-check`

Expected: sem erros.

### Cuidados

- A barra inferior mobile pode ficar mais cheia com cinco itens. Validar visualmente; se quebrar, ajustar classes do label para truncar sem remover item.
- Nao criar linguagem de venda: evitar `comprar`, `checkout`, `pedido`, `cliente`, `pagamento`.
- Usar `Rash Guard`, nunca `hash guard`.

### Validacao

- Abrir `/produtos`.
- Criar produto.
- Editar nome/status.
- Adicionar tamanho.
- Editar quantidade.
- Remover tamanho com e sem estoque.
- Confirmar responsividade mobile.

### Criterios de conclusao

- Produtos acessivel pela navegacao.
- UI consistente com paginas existentes.
- Operacoes persistem e atualizam a tela.

## Ciclo 7: Integracao de Mensalidades, Regressao e Aceite

### Objetivo do ciclo

Confirmar que kids laranja no Adulto paga como Adulto e que Produtos nao quebrou fluxos existentes.

### Arquivos provaveis

- `lib/billing/get-effective-price.test.ts`
- `lib/billing/student-plan.ts`
- `e2e/idor.spec.ts` ou novo e2e focado se ja houver ambiente preparado
- `cycles/Q22026/24-0430-refactor-juvenil/scenarios.feature`

### Passos de implementacao

- [ ] **Step 1: Adicionar cenarios BDD do ciclo**

Criar `cycles/Q22026/24-0430-refactor-juvenil/scenarios.feature` com os cenarios de aceite da SPEC, incluindo:

```gherkin
# language: pt
@casca @cycle-24-0430-refactor-juvenil
Funcionalidade: Juvenis laranja no Adulto e Produtos
  Como professor
  Quero alocar juvenis da familia laranja no Adulto e controlar produtos internos
  Para refletir treino, cobranca e estoque da academia

  Cenário: Kids laranja pode usar Adulto
    Dado um aluno kids com faixa laranja
    Quando o professor altera o plano para Adulto
    Então o vínculo atual deve refletir Adulto
    E as mensalidades futuras devem usar o valor de Adulto

  Cenário: Kids não-laranja não pode usar Adulto
    Dado um aluno kids fora da família laranja
    Quando tenta salvar o plano Adulto
    Então o sistema deve bloquear a alteração

  Cenário: Professor edita estoque manualmente
    Dado um produto com tamanho cadastrado
    Quando o professor altera a quantidade em estoque
    Então a quantidade deve ser persistida
    E nenhum fluxo de venda deve ser criado
```

- [ ] **Step 2: Rodar suite unitária**

Run: `pnpm test`

Expected: PASS.

- [ ] **Step 3: Rodar type-check**

Run: `pnpm type-check`

Expected: sem erros.

- [ ] **Step 4: Rodar lint**

Run: `pnpm lint`

Expected: sem erros. Se o projeto ainda nao tiver config compativel com Next 15/ESLint 9, registrar o erro exato e validar com `type-check` e `test`.

- [ ] **Step 5: Rodar build**

Run: `pnpm build`

Expected: build completo sem erro.

- [ ] **Step 6: Validacao manual final**

Checklist:

- aluno kids `orange_white`, `orange` ou `orange_black` consegue selecionar Adulto;
- aluno kids `white`, `gray`, `yellow` ou `green` nao ve Adulto;
- payload burlado de kids nao-laranja + Adulto e rejeitado pelo servidor;
- mensalidade futura de kids laranja no Adulto usa valor Adulto;
- pagamentos antigos nao sao alterados;
- `/produtos` aparece na navegacao;
- produtos iniciais aparecem;
- novo produto pode ser criado;
- tamanho pode ser adicionado, editado e removido;
- estoque nao aceita negativo;
- UI mobile nao quebra.

### Cuidados

- Se testes E2E dependerem de credenciais ou banco local nao configurado, registrar a limitacao e nao mascarar falha.
- Nao commitar automaticamente durante a execucao; criar commits somente se o usuario autorizar.

### Validacao

- `pnpm test`
- `pnpm type-check`
- `pnpm lint`
- `pnpm build`
- Checklist manual.

### Criterios de conclusao

- Todos os criterios de aceite da SPEC foram verificados por teste automatizado, validacao manual ou nota explicita de limitacao ambiental.
- Nenhum fluxo de venda/checkout/pagamento foi introduzido em Produtos.
- Historico financeiro anterior permanece intacto.

## Ordem Recomendada de Execucao

1. Ciclo 1: regra pura e testes.
2. Ciclo 2: validacao/server actions.
3. Ciclo 3: UI de alunos.
4. Ciclo 4: banco Produtos.
5. Ciclo 5: dados/actions Produtos.
6. Ciclo 6: UI Produtos.
7. Ciclo 7: regressao e aceite.

## Auto-Revisao do Plano

- Cobertura da SPEC: todos os requisitos funcionais de alunos e Produtos possuem ciclo correspondente.
- Escopo: venda, checkout, pagamento, baixa automatica e categoria Juvenil permanecem fora.
- Dados: schema, seed, migracao e RLS estao contemplados.
- UI: navegacao, pagina e componentes de Produtos estao contemplados.
- Validacao: testes unitarios, type-check, lint, build e checklist manual estao contemplados.
- Placeholders: o plano nao depende de itens sem decisao para iniciar a implementacao.
