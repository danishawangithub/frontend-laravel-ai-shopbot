/** Shapes aligned with typical Laravel API resources — adjust fields if your resources differ. */

export type ProductStatus = 'draft' | 'active' | 'archived'

export interface AdminUser {
  id?: number
  name?: string
  email?: string
}

export interface LoginResponsePayload {
  token?: string
  access_token?: string
  user?: AdminUser
  data?: {
    token?: string
    access_token?: string
    user?: AdminUser
  }
}

export interface ProductImage {
  id: number
  product_id?: number
  path_or_url: string
  alt?: string | null
  sort_order?: number | null
}

export interface AdminCategory {
  id: number
  name: string
  slug?: string | null
  requires_size?: boolean
  description?: string | null
  parent_id?: number | null
  sort_order?: number | null
  is_active?: boolean
  /** Storage path, e.g. categories/1/abc.jpg */
  image?: string | null
  /** Full URL from Laravel CategoryResource */
  image_url?: string | null
  product_count?: number
}

export interface ProductVariantRow {
  id?: number
  size: string
  stock_qty: number
  label?: string | null
  color?: string | null
  sku?: string | null
}

export interface AdminProduct {
  id: number
  category_id: number
  name: string
  slug?: string | null
  sku?: string | null
  description?: string | null
  base_price: string | number
  currency?: string | null
  cost?: string | number | null
  is_sale?: boolean
  sale_price?: string | number | null
  compare_at_price?: string | number | null
  sale_starts_at?: string | null
  sale_ends_at?: string | null
  status: ProductStatus
  is_featured?: boolean
  stock_qty?: number | null
  requires_size?: boolean
  images?: ProductImage[]
  variants?: ProductVariantRow[]
  category?: { id?: number; slug?: string | null; name?: string | null }
}

/** Admin order row — Laravel resource shape may vary; use accessors in UI. */
export type AdminOrderRow = Record<string, unknown> & { id?: number }

export interface ProductVariantInput {
  size: string
  stock_qty: number
  label?: string
  color?: string
  sku?: string
}

export interface LaravelPaginator<T> {
  data: T[]
  links?: {
    first?: string | null
    last?: string | null
    prev?: string | null
    next?: string | null
  }
  meta?: {
    current_page?: number
    last_page?: number
    per_page?: number
    total?: number
    from?: number | null
    to?: number | null
  }
}

export function extractLoginToken(payload: LoginResponsePayload): string | null {
  if (payload.token) return payload.token
  if (payload.access_token) return payload.access_token
  if (payload.data?.token) return payload.data.token
  if (payload.data?.access_token) return payload.data.access_token
  return null
}

export interface SiteBranding {
  site_name: string
  logo?: string | null
  logo_url?: string | null
  logo_text?: string | null
}

export interface HeroSlide {
  id: number
  title: string
  subtitle?: string | null
  image?: string | null
  image_url?: string | null
  button_text?: string | null
  button_url?: string | null
  sort_order?: number
  is_active?: boolean
}

export interface HomeSettings {
  site: SiteBranding
  hero_slides: HeroSlide[]
}

export type { PublicProduct as PublicProductApi } from '@/lib/public-types'

export function extractLoginUser(payload: LoginResponsePayload): AdminUser | null {
  if (payload.user) return payload.user
  if (payload.data?.user) return payload.data.user
  return null
}
