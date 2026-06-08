import { api, API_BASE, unwrapData, ApiRequestError } from '@/lib/api'
import type { HomeSettings } from '@/lib/admin-api-types'
import type { PaginatedResponse, PublicCategory, PublicProduct } from '@/lib/public-types'
import { parseCartPayload } from '@/lib/map-cart'
import { asPublicCategoryList, parsePaginated } from '@/lib/map-public-product'
import type { PublicCart, PublicOrder } from '@/lib/public-types'

/** localStorage key — same pattern as `admin_token` in admin-auth-context. */
export const GUEST_TOKEN_KEY = 'guest_token'

export function getGuestToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(GUEST_TOKEN_KEY)
}

export function setGuestToken(token: string | null): void {
  if (typeof window === 'undefined') return
  if (token) localStorage.setItem(GUEST_TOKEN_KEY, token)
  else localStorage.removeItem(GUEST_TOKEN_KEY)
}

export type ProductListQuery = Partial<{
  category: string
  on_sale: string
  featured: string
  price_min: string
  price_max: string
  q: string
  sort: string
  page: string
  per_page: string
}>

function buildQuery(params?: Record<string, string>): string {
  if (!params) return ''
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '')
  if (entries.length === 0) return ''
  return `?${new URLSearchParams(entries).toString()}`
}

export async function publicFetchHomeSettings(): Promise<HomeSettings> {
  const res = await api<unknown>('/api/v1/settings/home', { method: 'GET' })
  const data = unwrapData<HomeSettings>(res) ?? (res as HomeSettings)
  return data
}

export async function publicFetchHomeFeaturedProducts(
  perPage = 8
): Promise<PaginatedResponse<PublicProduct>> {
  const res = await api<unknown>(
    `/api/v1/home/featured-products${buildQuery({ per_page: String(perPage) })}`,
    { method: 'GET' }
  )
  return parsePaginated<PublicProduct>(res)
}

export async function publicFetchHomeCategories(
  limit = 6
): Promise<PublicCategory[]> {
  const res = await api<unknown>(
    `/api/v1/home/categories${buildQuery({ limit: String(limit) })}`,
    { method: 'GET' }
  )
  const unwrapped = unwrapData(res) ?? res
  return asPublicCategoryList(unwrapped)
}

export async function publicFetchCategories(searchParams?: Record<string, string>) {
  const path = `/api/v1/categories${buildQuery(searchParams)}`
  const res = await api<unknown>(path, { method: 'GET' })
  const unwrapped = unwrapData(res) ?? res
  return asPublicCategoryList(unwrapped)
}

export async function publicFetchCategoryBySlug(slug: string) {
  const res = await api<unknown>(`/api/v1/categories/${encodeURIComponent(slug)}`, { method: 'GET' })
  return unwrapData(res) ?? res
}

export async function publicFetchProducts(
  params?: ProductListQuery
): Promise<PaginatedResponse<PublicProduct>> {
  const path = `/api/v1/products${buildQuery(params as Record<string, string> | undefined)}`
  const res = await api<unknown>(path, { method: 'GET' })
  return parsePaginated<PublicProduct>(res)
}

/** @deprecated Prefer publicFetchProducts — kept for callers expecting unwrapped list only. */
export async function publicFetchProductsList(params?: ProductListQuery): Promise<PublicProduct[]> {
  const res = await publicFetchProducts(params)
  return res.data
}

export async function publicFetchProduct(slugOrId: string | number) {
  const seg = encodeURIComponent(String(slugOrId))
  const res = await api<unknown>(`/api/v1/products/${seg}`, { method: 'GET' })
  return unwrapData(res) ?? res
}

/** Persist cart session: body `data.guest_token` first (CORS-safe), then `X-Guest-Token` header. */
function resolveGuestToken(
  res: Response,
  data: unknown,
  fallback: string | null
): string | null {
  const fromBody = parseCartPayload(data).guest_token
  const fromHeader = res.headers.get('X-Guest-Token')
  return fromBody ?? fromHeader ?? fallback ?? null
}

function persistGuestToken(
  res: Response,
  data: unknown,
  fallback: string | null
): string | null {
  const token = resolveGuestToken(res, data, fallback)
  if (token) setGuestToken(token)
  return token
}

async function cartFetch(
  url: string,
  init: RequestInit & { guestToken?: string | null }
): Promise<{ res: Response; data: unknown; guestToken: string | null }> {
  const { guestToken, headers, ...rest } = init
  const res = await fetch(url, {
    ...rest,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(guestToken ? { 'X-Guest-Token': guestToken } : {}),
      ...headers,
    },
    cache: 'no-store',
  })
  const text = await res.text()
  const data = text ? (JSON.parse(text) as unknown) : null
  if (!res.ok) {
    const d = data as Record<string, unknown> | null
    throw new ApiRequestError(res.status, {
      message: typeof d?.message === 'string' ? d.message : res.statusText,
      errors: d?.errors as Record<string, string[]> | undefined,
    })
  }
  const token = persistGuestToken(res, data, guestToken ?? null)
  return { res, data, guestToken: token }
}

export async function publicFetchCart(guestToken: string): Promise<PublicCart> {
  const { data } = await cartFetch(`${API_BASE}/api/v1/cart`, {
    method: 'GET',
    guestToken,
  })
  return parseCartPayload(data)
}

export type CartAddBody = {
  product_id: number
  product_variant_id?: number
  quantity?: number
}

export async function publicCartAddItem(
  guestToken: string | null,
  body: CartAddBody
): Promise<{ cart: PublicCart; guestToken: string | null }> {
  const { data, guestToken: next } = await cartFetch(`${API_BASE}/api/v1/cart/items`, {
    method: 'POST',
    guestToken,
    body: JSON.stringify(body),
  })
  return { cart: parseCartPayload(data), guestToken: next }
}

export async function publicCartPatchItem(
  guestToken: string,
  cartItemId: number,
  body: { quantity: number }
): Promise<{ cart: PublicCart; guestToken: string | null }> {
  const { data, guestToken: next } = await cartFetch(
    `${API_BASE}/api/v1/cart/items/${cartItemId}`,
    {
      method: 'PATCH',
      guestToken,
      body: JSON.stringify(body),
    }
  )
  return { cart: parseCartPayload(data), guestToken: next }
}

export async function publicCartDeleteItem(
  guestToken: string,
  cartItemId: number
): Promise<{ cart: PublicCart; guestToken: string | null }> {
  const { data, guestToken: next } = await cartFetch(
    `${API_BASE}/api/v1/cart/items/${cartItemId}`,
    {
      method: 'DELETE',
      guestToken,
    }
  )
  return { cart: parseCartPayload(data), guestToken: next }
}

export type CheckoutBody = {
  guest_token: string
  name: string
  email: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  postal_code?: string
  country?: string
  notes?: string
  payment_method?: 'cod'
}

export async function publicCheckout(body: CheckoutBody): Promise<PublicOrder> {
  const res = await api<unknown>('/api/v1/checkout', {
    method: 'POST',
    body: JSON.stringify({ ...body, payment_method: body.payment_method ?? 'cod' }),
  })
  return unwrapData<PublicOrder>(res) ?? (res as PublicOrder)
}

export async function publicOrderLookup(params: { order_number: string; email: string }) {
  const q = new URLSearchParams(params).toString()
  return api<unknown>(`/api/v1/orders/lookup?${q}`, { method: 'GET' })
}

export type { PublicProduct, PublicCategory, PaginatedResponse } from '@/lib/public-types'
