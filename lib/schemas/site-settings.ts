import { z } from 'zod'

export const siteSettingsFormSchema = z.object({
  site_name: z.string().min(1, 'Site name is required').max(255),
  logo_text: z.string().max(255).optional().or(z.literal('')),
})

export type SiteSettingsFormValues = z.infer<typeof siteSettingsFormSchema>

export type SiteSettingsImageOptions = {
  logoFile?: File | null
  removeLogo?: boolean
}

export function buildSiteSettingsFormData(
  values: SiteSettingsFormValues,
  opts?: SiteSettingsImageOptions
): FormData {
  const fd = new FormData()
  fd.append('site_name', values.site_name.trim())
  const lt = values.logo_text?.trim()
  if (lt) fd.append('logo_text', lt)
  if (opts?.removeLogo) fd.append('remove_logo', '1')
  else if (opts?.logoFile) fd.append('logo', opts.logoFile)
  return fd
}
