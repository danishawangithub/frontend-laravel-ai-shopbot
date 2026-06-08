/** Public catalog shapes from Laravel API resources. */

export interface PublicProductImage {
  id?: number
  path_or_url?: string
  url?: string
  alt?: string | null
  sort_order?: number | null
}

export interface PublicCategoryRef {
  id?: number
  name?: string
  slug?: string
}

export interface PublicProductVariant {
  id: number
  label?: string | null
  size?: string | null
  color?: string | null
  sku?: string | null
  stock_qty: number
}

export interface PublicProduct {
  id: number
  name: string
  slug: string
  description?: string | null
  base_price?: string
  effective_price?: string | number
  currency?: string | null
  is_featured?: boolean
  requires_size?: boolean
  stock_qty?: number | null
  in_stock?: boolean
  category?: PublicCategoryRef | null
  images?: PublicProductImage[]
  variants?: PublicProductVariant[]
}

export interface PublicCategory {
  id: number
  name: string
  slug: string
  description?: string | null
  image?: string | null
  image_url?: string | null
  sort_order?: number
  is_active?: boolean
  product_count?: number
}

export interface PublicCartVariant {
  id: number
  size?: string | null
  label?: string | null
  stock_qty?: number
}

export interface PublicCartLineProduct {
  id: number
  name: string
  slug: string
  requires_size?: boolean
  effective_price?: string | number
  currency?: string | null
  images?: PublicProductImage[]
}

export interface PublicCartItem {
  id: number
  product_id: number
  product_variant_id?: number | null
  quantity: number
  line_subtotal?: string | null
  variant?: PublicCartVariant | null
  product?: PublicCartLineProduct | null
}

export interface PublicCart {
  guest_token?: string
  items: PublicCartItem[]
}

export interface PublicOrder {
  id?: number
  order_number: string
  status?: string
  payment_method?: string
  payment_label?: string
  currency?: string
  subtotal?: string
  shipping_name?: string
  shipping_phone?: string
  shipping_city?: string
  created_at?: string
}

export interface PaginationMeta {
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta?: PaginationMeta
}
