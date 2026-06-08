import { z } from 'zod'

export const heroSlideFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  subtitle: z.string().max(500).optional().or(z.literal('')),
  button_text: z.string().max(100).optional().or(z.literal('')),
  button_url: z.string().max(2048).optional().or(z.literal('')),
  sort_order: z.coerce.number().int().min(0).max(65535).optional(),
  is_active: z.boolean().optional(),
})

export type HeroSlideFormValues = z.infer<typeof heroSlideFormSchema>

export type HeroSlideImageOptions = {
  file?: File | null
  removeImage?: boolean
}

export function buildHeroSlideFormData(
  values: HeroSlideFormValues,
  opts?: HeroSlideImageOptions
): FormData {
  const fd = new FormData()
  fd.append('title', values.title.trim())
  const sub = values.subtitle?.trim()
  if (sub) fd.append('subtitle', sub)
  const bt = values.button_text?.trim()
  if (bt) fd.append('button_text', bt)
  const bu = values.button_url?.trim()
  if (bu) fd.append('button_url', bu)
  if (values.sort_order != null && !Number.isNaN(values.sort_order)) {
    fd.append('sort_order', String(values.sort_order))
  }
  fd.append('is_active', values.is_active === false ? '0' : '1')
  if (opts?.removeImage) fd.append('remove_image', '1')
  else if (opts?.file) fd.append('image', opts.file)
  return fd
}
