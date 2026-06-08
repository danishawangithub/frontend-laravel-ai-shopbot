export interface ProductVariantOption {
  id: number
  size: string
  stock_qty: number
  label?: string
}

export interface Product {
  id: string
  slug: string
  title: string
  price: number
  currency?: string
  fabric: string
  category: string
  categorySlug?: string
  images: string[]
  stock: number
  description?: string
  requiresSize?: boolean
  inStock?: boolean
  stockQty?: number
  variants?: ProductVariantOption[]
}

/** Cart line from Laravel guest cart API */
export interface CartLineItem {
  id: number
  productId: number
  productVariantId?: number
  slug: string
  title: string
  price: number
  currency?: string
  image: string
  size: string
  quantity: number
  lineSubtotal?: number
  requiresSize: boolean
  fabric: string
}

/** @deprecated Legacy local cart shape */
export interface CartItem {
  productId: string
  slug: string
  title: string
  price: number
  image: string
  size: string
  quantity: number
  fabric: string
}

export interface CheckoutData {
  name: string
  email: string
  phone: string
  city: string
  address: string
  agreeToTerms: boolean
}
