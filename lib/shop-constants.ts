/** Shop sidebar price filters — values sent as price_min / price_max to the API. */
export const SHOP_PRICE_RANGES = [
  { label: 'Rs 1,000 – Rs 3,000', min: 1000, max: 3000 },
  { label: 'Rs 3,000 – Rs 4,000', min: 3000, max: 4000 },
  { label: 'Rs 4,000 – Rs 5,000', min: 4000, max: 5000 },
  { label: 'Rs 5,000+', min: 5000, max: undefined as number | undefined },
] as const

export type ShopSort =
  | 'newest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'name'

export const SHOP_SORT_OPTIONS: { value: ShopSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name' },
]
