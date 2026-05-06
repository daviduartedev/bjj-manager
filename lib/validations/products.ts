import { z } from "zod";

export const productNameSchema = z
  .string()
  .trim()
  .min(2, "Informe o nome.")
  .max(120, "Nome muito longo.");

export const productSizeLabelSchema = z
  .string()
  .trim()
  .min(1, "Informe o tamanho.")
  .max(40, "Tamanho muito longo.");

export const productStockQuantitySchema = z.coerce
  .number()
  .int("Use um número inteiro.")
  .min(0, "O estoque não pode ser negativo.")
  .max(99999, "Quantidade muito alta.");

export const createProductSchema = z
  .object({
    name: productNameSchema,
  })
  .strict();

export const updateProductSchema = z
  .object({
    productId: z.string().uuid(),
    name: productNameSchema.optional(),
    active: z.boolean().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.name === undefined && data.active === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Nada para atualizar.",
        path: ["productId"],
      });
    }
  });

export const createProductVariantSchema = z
  .object({
    productId: z.string().uuid(),
    sizeLabel: productSizeLabelSchema,
    stockQuantity: productStockQuantitySchema.optional().default(0),
  })
  .strict();

export const updateProductVariantSchema = z
  .object({
    variantId: z.string().uuid(),
    sizeLabel: productSizeLabelSchema.optional(),
    stockQuantity: productStockQuantitySchema.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.sizeLabel === undefined && data.stockQuantity === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Nada para atualizar.",
        path: ["variantId"],
      });
    }
  });

export const deleteProductVariantSchema = z
  .object({
    variantId: z.string().uuid(),
  })
  .strict();
