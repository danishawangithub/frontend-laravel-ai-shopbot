import { z } from 'zod'

const priceField = z.union([
  z.string(),
  z.number(),
  z.literal(''),
  z.null(),
])

export const productFormSchema = z
  .object({
    category_id: z.coerce.number().int().positive('Category is required'),
    name: z.string().min(1, 'Name is required').max(255),
    slug: z
      .string()
      .max(191)
      .regex(/^[A-Za-z0-9-]*$/, 'Slug may only contain letters, numbers, and hyphens')
      .optional()
      .or(z.literal('')),
    sku: z.string().max(191).optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    base_price: z.union([z.string().min(1, 'Base price is required'), z.number()]),
    currency: z.string().length(3).optional().or(z.literal('')),
    cost: priceField.optional(),
    is_sale: z.boolean().optional(),
    sale_price: priceField.optional(),
    compare_at_price: priceField.optional(),
    sale_starts_at: z.string().optional().or(z.literal('')),
    sale_ends_at: z.string().optional().or(z.literal('')),
    status: z.enum(['draft', 'active', 'archived']).optional(),
    stock_qty: z.union([z.string(), z.number(), z.literal(''), z.null()]).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.is_sale) {
      const sp = val.sale_price
      const empty = sp === '' || sp === null || sp === undefined
      if (empty) {
        ctx.addIssue({
          code: 'custom',
          path: ['sale_price'],
          message: 'Sale price is required when the product is on sale',
        })
      }
    }
  })

export type ProductFormValues = z.infer<typeof productFormSchema>

function numOrStr(v: string | number | null | undefined): string | number | null | undefined {
  if (v === '' || v === null || v === undefined) return v === '' ? '' : v
  return v
}

export function productToJsonBody(values: ProductFormValues): Record<string, unknown> {
  const body: Record<string, unknown> = {
    category_id: values.category_id,
    name: values.name.trim(),
    base_price: typeof values.base_price === 'number' ? String(values.base_price) : values.base_price,
  }
  const slug = values.slug?.trim()
  if (slug) body.slug = slug
  const sku = values.sku?.trim()
  if (sku) body.sku = sku
  const desc = values.description?.trim()
  if (desc) body.description = desc

  const currency = values.currency?.trim()
  if (currency) body.currency = currency

  const cost = numOrStr(values.cost as string | number | null | undefined)
  if (cost !== '' && cost !== undefined && cost !== null) body.cost = cost

  if (values.is_sale !== undefined) body.is_sale = values.is_sale

  const salePrice = numOrStr(values.sale_price as string | number | null | undefined)
  if (salePrice !== '' && salePrice !== undefined && salePrice !== null) {
    body.sale_price = salePrice
  }

  const compare = numOrStr(values.compare_at_price as string | number | null | undefined)
  if (compare !== '' && compare !== undefined && compare !== null) {
    body.compare_at_price = compare
  }

  const ss = values.sale_starts_at?.trim()
  if (ss) body.sale_starts_at = ss
  const se = values.sale_ends_at?.trim()
  if (se) body.sale_ends_at = se

  if (values.status) body.status = values.status

  const stockQty = numOrStr(values.stock_qty as string | number | null | undefined)
  if (stockQty !== '' && stockQty !== undefined && stockQty !== null) {
    body.stock_qty = stockQty
  }

  return body
}
