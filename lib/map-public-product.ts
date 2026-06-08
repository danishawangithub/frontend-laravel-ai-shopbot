import type {
  PaginatedResponse,
  PaginationMeta,
  PublicCategory,
  PublicProduct,
  PublicProductVariant,
} from '@/lib/public-types'
import type { Product, ProductVariantOption } from '@/lib/types'
import { resolveImageUrl } from '@/lib/image-url'

function mapVariants(variants?: PublicProductVariant[]): ProductVariantOption[] {
  return (variants ?? []).map((v) => ({
    id: v.id,
    size: v.size ?? v.label ?? '',
    stock_qty: Number(v.stock_qty) || 0,
    label: v.label ?? undefined,
  }))
}

export function mapPublicProduct(api: PublicProduct): Product {
  const images = (api.images ?? [])
    .map((img) => resolveImageUrl(img.url ?? img.path_or_url))
    .filter((u) => u.length > 0)

  const price = Number(api.effective_price ?? api.base_price ?? 0)
  const variants = mapVariants(api.variants)
  const variantStockTotal = variants.reduce((sum, v) => sum + Math.max(0, v.stock_qty), 0)
  const inStock = api.requires_size
    ? variantStockTotal > 0 || api.in_stock === true
    : api.in_stock !== false && (api.stock_qty == null || Number(api.stock_qty) > 0)

  return {
    id: String(api.id),
    slug: api.slug,
    title: api.name,
    price: Number.isFinite(price) ? price : 0,
    currency: api.currency ?? 'PKR',
    fabric: '',
    category:
      api.category && typeof api.category === 'object' && api.category.name
        ? api.category.name
        : 'Product',
    categorySlug:
      api.category && typeof api.category === 'object' && api.category.slug
        ? api.category.slug
        : undefined,
    images:
      images.length > 0 ? images : [resolveImageUrl('/placeholder.svg') || '/placeholder.svg'],
    stock: api.requires_size
      ? variants.reduce((max, v) => Math.max(max, v.stock_qty), 0)
      : Number(api.stock_qty ?? 0),
    description: api.description ?? undefined,
    requiresSize: Boolean(api.requires_size),
    inStock,
    stockQty: api.stock_qty != null ? Number(api.stock_qty) : undefined,
    variants,
  }
}

export function asPublicProductList(payload: unknown): PublicProduct[] {
  if (Array.isArray(payload)) return payload as PublicProduct[]
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const inner = (payload as { data: unknown }).data
    if (Array.isArray(inner)) return inner as PublicProduct[]
  }
  return []
}

export function asPublicCategoryList(payload: unknown): PublicCategory[] {
  if (Array.isArray(payload)) return payload as PublicCategory[]
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const inner = (payload as { data: unknown }).data
    if (Array.isArray(inner)) return inner as PublicCategory[]
  }
  return []
}

export function parsePaginated<T>(payload: unknown): PaginatedResponse<T> {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    const p = payload as { data: T[]; meta?: PaginationMeta }
    return { data: p.data, meta: p.meta }
  }
  if (Array.isArray(payload)) return { data: payload as T[] }
  return { data: [] }
}
