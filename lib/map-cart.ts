import { unwrapData } from '@/lib/api'
import type { PublicCart, PublicCartItem } from '@/lib/public-types'
import type { CartLineItem } from '@/lib/types'
import { resolveImageUrl } from '@/lib/image-url'

function normalizeCartItems(items: unknown): PublicCartItem[] {
  if (Array.isArray(items)) return items as PublicCartItem[]
  if (items && typeof items === 'object' && 'data' in items) {
    const nested = (items as { data: unknown }).data
    if (Array.isArray(nested)) return nested as PublicCartItem[]
  }
  return []
}

/** Reads Laravel cart JSON — prefers `data.guest_token` (works cross-origin; header may be blocked by CORS). */
export function parseCartPayload(payload: unknown): PublicCart {
  const raw = unwrapData<PublicCart>(payload) ?? (payload as PublicCart)
  const top =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null
  const guestToken =
    (typeof raw?.guest_token === 'string' && raw.guest_token) ||
    (typeof top?.guest_token === 'string' ? top.guest_token : undefined)

  return {
    guest_token: guestToken,
    items: normalizeCartItems(raw?.items),
  }
}

export function mapCartItem(item: PublicCartItem): CartLineItem {
  const product = item.product
  const variant = item.variant
  const images = product?.images ?? []
  const first = images[0]
  const imageUrl = resolveImageUrl(first?.url ?? first?.path_or_url)

  const price = Number(product?.effective_price ?? 0)
  const sizeLabel = variant?.size ?? variant?.label ?? ''

  return {
    id: item.id,
    productId: item.product_id,
    productVariantId: item.product_variant_id ?? undefined,
    slug: product?.slug ?? '',
    title: product?.name ?? 'Product',
    price: Number.isFinite(price) ? price : 0,
    currency: product?.currency ?? 'PKR',
    image: imageUrl || resolveImageUrl('/placeholder.svg') || '/placeholder.svg',
    size: sizeLabel,
    quantity: item.quantity,
    lineSubtotal: item.line_subtotal ? Number(item.line_subtotal) : undefined,
    requiresSize: Boolean(product?.requires_size),
    fabric: '',
  }
}

export function mapCartItems(items: PublicCartItem[]): CartLineItem[] {
  return items.map(mapCartItem)
}
