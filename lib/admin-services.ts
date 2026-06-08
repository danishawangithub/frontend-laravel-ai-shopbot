import { api, apiMultipart, unwrapData } from '@/lib/api'
import {
  buildCategoryFormData,
  type CategoryFormValues,
  type CategoryImageOptions,
} from '@/lib/schemas/category'
import {
  buildHeroSlideFormData,
  type HeroSlideFormValues,
  type HeroSlideImageOptions,
} from '@/lib/schemas/hero-slide'
import {
  buildSiteSettingsFormData,
  type SiteSettingsFormValues,
  type SiteSettingsImageOptions,
} from '@/lib/schemas/site-settings'
import type {
  AdminCategory,
  AdminOrderRow,
  AdminProduct,
  AdminUser,
  HeroSlide,
  LaravelPaginator,
  ProductImage,
  ProductVariantInput,
  SiteBranding,
} from '@/lib/admin-api-types'

function asArray<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object' && 'data' in res) {
    const inner = (res as { data: unknown }).data
    if (Array.isArray(inner)) return inner as T[]
  }
  return []
}

function asPaginated<T>(res: unknown): { items: T[]; meta?: LaravelPaginator<T>['meta'] } {
  if (
    res &&
    typeof res === 'object' &&
    'data' in res &&
    Array.isArray((res as LaravelPaginator<T>).data)
  ) {
    const p = res as LaravelPaginator<T>
    return { items: p.data, meta: p.meta }
  }
  return { items: asArray<T>(res) }
}

export async function adminFetchCategories(token: string): Promise<AdminCategory[]> {
  const res = await api<unknown>('/api/v1/admin/categories', { method: 'GET', token })
  const first = unwrapData(res) ?? res
  if (first && typeof first === 'object' && 'data' in first && Array.isArray((first as { data: unknown }).data)) {
    return (first as { data: AdminCategory[] }).data
  }
  return asArray<AdminCategory>(first)
}

export async function adminFetchCategory(token: string, id: number): Promise<AdminCategory> {
  const res = await api<unknown>(`/api/v1/admin/categories/${id}`, { method: 'GET', token })
  return unwrapData<AdminCategory>(res) ?? (res as AdminCategory)
}

export async function adminCreateCategory(
  token: string,
  values: CategoryFormValues,
  imageOpts?: CategoryImageOptions
): Promise<AdminCategory> {
  const form = buildCategoryFormData(values, imageOpts)
  const res = await apiMultipart<unknown>('/api/v1/admin/categories', form, { token })
  return unwrapData<AdminCategory>(res) ?? (res as AdminCategory)
}

export async function adminUpdateCategory(
  token: string,
  id: number,
  values: CategoryFormValues,
  imageOpts?: CategoryImageOptions
): Promise<AdminCategory> {
  const form = buildCategoryFormData(values, imageOpts)
  // PHP does not populate $_FILES on PUT — use POST + _method spoofing so `image` uploads work.
  form.append('_method', 'PUT')
  const res = await apiMultipart<unknown>(`/api/v1/admin/categories/${id}`, form, {
    token,
    method: 'POST',
  })
  return unwrapData<AdminCategory>(res) ?? (res as AdminCategory)
}

export async function adminDeleteCategory(token: string, id: number): Promise<void> {
  await api<void>(`/api/v1/admin/categories/${id}`, { method: 'DELETE', token })
}

export type ProductListParams = {
  page?: number
  per_page?: number
  status?: string
  category_id?: number
}

export async function adminFetchProducts(
  token: string,
  params?: ProductListParams
): Promise<{ items: AdminProduct[]; meta?: LaravelPaginator<AdminProduct>['meta'] }> {
  const search = new URLSearchParams()
  if (params?.page) search.set('page', String(params.page))
  if (params?.per_page) search.set('per_page', String(params.per_page))
  if (params?.status) search.set('status', params.status)
  if (params?.category_id) search.set('category_id', String(params.category_id))
  const q = search.toString()
  const path = q ? `/api/v1/admin/products?${q}` : '/api/v1/admin/products'
  const res = await api<unknown>(path, { method: 'GET', token })
  const first = unwrapData(res) ?? res
  if (first && typeof first === 'object' && 'data' in first && Array.isArray((first as { data: unknown }).data)) {
    const p = first as LaravelPaginator<AdminProduct>
    return { items: p.data, meta: p.meta }
  }
  return asPaginated<AdminProduct>(first)
}

export async function adminFetchProduct(token: string, id: number): Promise<AdminProduct> {
  const res = await api<unknown>(`/api/v1/admin/products/${id}`, { method: 'GET', token })
  return unwrapData<AdminProduct>(res) ?? (res as AdminProduct)
}

export async function adminCreateProduct(
  token: string,
  body: Record<string, unknown>
): Promise<AdminProduct> {
  const res = await api<unknown>('/api/v1/admin/products', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
  return unwrapData<AdminProduct>(res) ?? (res as AdminProduct)
}

export async function adminUpdateProduct(
  token: string,
  id: number,
  body: Record<string, unknown>
): Promise<AdminProduct> {
  const res = await api<unknown>(`/api/v1/admin/products/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(body),
  })
  return unwrapData<AdminProduct>(res) ?? (res as AdminProduct)
}

export async function adminDeleteProduct(token: string, id: number): Promise<void> {
  await api<void>(`/api/v1/admin/products/${id}`, { method: 'DELETE', token })
}

export async function adminPatchProductFeatured(
  token: string,
  productId: number,
  is_featured: boolean
): Promise<AdminProduct> {
  const res = await api<unknown>(`/api/v1/admin/products/${productId}/featured`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ is_featured }),
  })
  return unwrapData<AdminProduct>(res) ?? (res as AdminProduct)
}

export type AdminProductImagePayload =
  | { path_or_url: string; alt?: string; sort_order?: number }
  | { file: File; alt?: string; sort_order?: number }

/**
 * POST /api/v1/admin/products/{product}/images
 * JSON: { path_or_url, alt?, sort_order? } or multipart with `image` file field.
 */
function normalizeProductImage(raw: ProductImage & { url?: string }): ProductImage {
  return {
    ...raw,
    path_or_url: raw.path_or_url || raw.url || '',
  }
}

export async function adminAddProductImage(
  token: string,
  productId: number,
  payload: AdminProductImagePayload
): Promise<ProductImage> {
  const path = `/api/v1/admin/products/${productId}/images`

  if ('file' in payload) {
    const form = new FormData()
    form.append('image', payload.file)
    const res = await apiMultipart<unknown>(path, form, { token })
    const img = unwrapData<ProductImage & { url?: string }>(res) ?? (res as ProductImage)
    return normalizeProductImage(img)
  }

  const res = await api<unknown>(path, {
    method: 'POST',
    token,
    body: JSON.stringify({
      path_or_url: payload.path_or_url,
      ...(payload.alt ? { alt: payload.alt } : {}),
      ...(payload.sort_order != null ? { sort_order: payload.sort_order } : {}),
    }),
  })
  const img = unwrapData<ProductImage & { url?: string }>(res) ?? (res as ProductImage)
  return normalizeProductImage(img)
}

export async function adminDeleteProductImage(
  token: string,
  productId: number,
  imageId: number
): Promise<void> {
  await api<void>(`/api/v1/admin/products/${productId}/images/${imageId}`, {
    method: 'DELETE',
    token,
  })
}

export async function authFetchMe(token: string): Promise<AdminUser> {
  const res = await api<unknown>('/api/v1/auth/me', { method: 'GET', token })
  return unwrapData<AdminUser>(res) ?? (res as AdminUser)
}

export async function authLogout(token: string): Promise<void> {
  try {
    await api<unknown>('/api/v1/auth/logout', { method: 'POST', token })
  } catch {
    /* still clear client session */
  }
}

export type AdminOrderListParams = { page?: number; per_page?: number }

export async function adminFetchOrders(
  token: string,
  params?: AdminOrderListParams
): Promise<{ items: AdminOrderRow[]; meta?: LaravelPaginator<AdminOrderRow>['meta'] }> {
  const search = new URLSearchParams()
  if (params?.page) search.set('page', String(params.page))
  if (params?.per_page) search.set('per_page', String(params.per_page))
  const q = search.toString()
  const path = q ? `/api/v1/admin/orders?${q}` : '/api/v1/admin/orders'
  const res = await api<unknown>(path, { method: 'GET', token })
  const first = unwrapData(res) ?? res
  if (first && typeof first === 'object' && 'data' in first && Array.isArray((first as { data: unknown }).data)) {
    const p = first as LaravelPaginator<AdminOrderRow>
    return { items: p.data, meta: p.meta }
  }
  return asPaginated<AdminOrderRow>(first)
}

export async function adminPatchOrder(
  token: string,
  id: number,
  body: Record<string, unknown>
): Promise<unknown> {
  const res = await api<unknown>(`/api/v1/admin/orders/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  })
  return unwrapData(res) ?? res
}

export async function adminFetchLogs(
  token: string,
  params?: { page?: number; per_page?: number }
): Promise<{ items: AdminOrderRow[]; meta?: LaravelPaginator<AdminOrderRow>['meta'] }> {
  const search = new URLSearchParams()
  if (params?.page) search.set('page', String(params.page))
  if (params?.per_page) search.set('per_page', String(params.per_page))
  const q = search.toString()
  const path = q ? `/api/v1/admin/logs?${q}` : '/api/v1/admin/logs'
  const res = await api<unknown>(path, { method: 'GET', token })
  const first = unwrapData(res) ?? res
  if (first && typeof first === 'object' && 'data' in first && Array.isArray((first as { data: unknown }).data)) {
    const p = first as LaravelPaginator<AdminOrderRow>
    return { items: p.data, meta: p.meta }
  }
  return asPaginated<AdminOrderRow>(first)
}

/** Replaces all variant rows for the product (`variants: []` clears). */
export async function adminPutProductVariants(
  token: string,
  productId: number,
  variants: ProductVariantInput[]
): Promise<void> {
  await api<unknown>(`/api/v1/admin/products/${productId}/variants`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ variants }),
  })
}

export async function adminFetchSiteSettings(token: string): Promise<SiteBranding> {
  const res = await api<unknown>('/api/v1/admin/settings', { method: 'GET', token })
  return unwrapData<SiteBranding>(res) ?? (res as SiteBranding)
}

export async function adminUpdateSiteSettings(
  token: string,
  values: SiteSettingsFormValues,
  opts?: SiteSettingsImageOptions
): Promise<SiteBranding> {
  const hasFile = Boolean(opts?.logoFile || opts?.removeLogo)
  if (hasFile) {
    const form = buildSiteSettingsFormData(values, opts)
    form.append('_method', 'PATCH')
    const res = await apiMultipart<unknown>('/api/v1/admin/settings', form, {
      token,
      method: 'POST',
    })
    return unwrapData<SiteBranding>(res) ?? (res as SiteBranding)
  }
  const res = await api<unknown>('/api/v1/admin/settings', {
    method: 'PATCH',
    token,
    body: JSON.stringify({
      site_name: values.site_name.trim(),
      logo_text: values.logo_text?.trim() || null,
    }),
  })
  return unwrapData<SiteBranding>(res) ?? (res as SiteBranding)
}

export async function adminFetchHeroSlides(token: string): Promise<HeroSlide[]> {
  const res = await api<unknown>('/api/v1/admin/hero-slides', { method: 'GET', token })
  const first = unwrapData(res) ?? res
  return asArray<HeroSlide>(first)
}

export async function adminCreateHeroSlide(
  token: string,
  values: HeroSlideFormValues,
  opts?: HeroSlideImageOptions
): Promise<HeroSlide> {
  const form = buildHeroSlideFormData(values, opts)
  const res = await apiMultipart<unknown>('/api/v1/admin/hero-slides', form, { token })
  return unwrapData<HeroSlide>(res) ?? (res as HeroSlide)
}

export async function adminUpdateHeroSlide(
  token: string,
  id: number,
  values: HeroSlideFormValues,
  opts?: HeroSlideImageOptions
): Promise<HeroSlide> {
  const hasFile = Boolean(opts?.file || opts?.removeImage)
  if (hasFile) {
    const form = buildHeroSlideFormData(values, opts)
    form.append('_method', 'PATCH')
    const res = await apiMultipart<unknown>(`/api/v1/admin/hero-slides/${id}`, form, {
      token,
      method: 'POST',
    })
    return unwrapData<HeroSlide>(res) ?? (res as HeroSlide)
  }
  const res = await api<unknown>(`/api/v1/admin/hero-slides/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({
      title: values.title.trim(),
      subtitle: values.subtitle?.trim() || null,
      button_text: values.button_text?.trim() || null,
      button_url: values.button_url?.trim() || null,
      sort_order: values.sort_order ?? 0,
      is_active: values.is_active !== false,
    }),
  })
  return unwrapData<HeroSlide>(res) ?? (res as HeroSlide)
}

export async function adminDeleteHeroSlide(token: string, id: number): Promise<void> {
  await api<void>(`/api/v1/admin/hero-slides/${id}`, { method: 'DELETE', token })
}
