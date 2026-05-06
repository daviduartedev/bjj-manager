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

export const productAudienceSchema = z.enum(["unisex", "masculine", "feminine"]);

export const variantLineSchema = z.enum(["unisex", "feminine"]);

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
    audience: productAudienceSchema.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.name === undefined &&
      data.active === undefined &&
      data.audience === undefined
    ) {
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
    line: variantLineSchema.optional(),
  })
  .strict();

export const updateProductVariantSchema = z
  .object({
    variantId: z.string().uuid(),
    sizeLabel: productSizeLabelSchema.optional(),
    stockQuantity: productStockQuantitySchema.optional(),
    line: variantLineSchema.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.sizeLabel === undefined &&
      data.stockQuantity === undefined &&
      data.line === undefined
    ) {
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
