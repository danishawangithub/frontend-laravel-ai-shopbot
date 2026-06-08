import { z } from 'zod'

export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z
    .string()
    .max(191)
    .regex(/^[A-Za-z0-9-]*$/, 'Slug may only contain letters, numbers, and hyphens')
    .optional()
    .or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  parent_id: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().positive().optional()
  ),
  sort_order: z.coerce.number().int().min(0).max(65535).optional(),
  is_active: z.boolean().optional(),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

/** Payload sent to Laravel (nulls omitted where helpful). */
export function categoryToJsonBody(values: CategoryFormValues): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: values.name.trim(),
  }
  const slug = values.slug?.trim()
  if (slug) body.slug = slug
  const desc = values.description?.trim()
  if (desc) body.description = desc
  if (values.parent_id != null && !Number.isNaN(values.parent_id)) {
    body.parent_id = values.parent_id
  }
  if (values.sort_order != null && !Number.isNaN(values.sort_order)) {
    body.sort_order = values.sort_order
  }
  if (values.is_active !== undefined) {
    body.is_active = values.is_active
  }
  return body
}

export type CategoryImageOptions = {
  file?: File | null
  removeImage?: boolean
}

/** Laravel AdminCategoryController accepts multipart on POST/PUT with field `image`. */
export function buildCategoryFormData(
  values: CategoryFormValues,
  opts?: CategoryImageOptions
): FormData {
  const fd = new FormData()
  fd.append('name', values.name.trim())

  const slug = values.slug?.trim()
  if (slug) fd.append('slug', slug)

  const desc = values.description?.trim()
  if (desc) fd.append('description', desc)

  if (values.parent_id != null && !Number.isNaN(values.parent_id)) {
    fd.append('parent_id', String(values.parent_id))
  }

  if (values.sort_order != null && !Number.isNaN(values.sort_order)) {
    fd.append('sort_order', String(values.sort_order))
  }

  fd.append('is_active', values.is_active === false ? '0' : '1')

  if (opts?.removeImage) {
    fd.append('remove_image', '1')
  } else if (opts?.file) {
    fd.append('image', opts.file)
  }

  return fd
}
