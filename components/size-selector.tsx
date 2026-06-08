'use client'

import type { ProductVariantOption } from '@/lib/types'

interface SizeSelectorProps {
  variants: ProductVariantOption[]
  selectedVariantId: number | null
  onVariantChange: (variantId: number, size: string) => void
  onOpenSizeChart: () => void
}

export default function SizeSelector({
  variants,
  selectedVariantId,
  onVariantChange,
  onOpenSizeChart,
}: SizeSelectorProps) {
  if (variants.length === 0) {
    return (
      <p className="text-sm text-destructive">No sizes available for this product.</p>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="font-semibold text-foreground">Size</label>
        <button
          type="button"
          onClick={onOpenSizeChart}
          className="text-sm text-primary hover:underline"
        >
          View Size Chart
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {variants.map((v) => {
          const label = v.size || v.label || '?'
          const outOfStock = v.stock_qty <= 0
          const selected = selectedVariantId === v.id
          return (
            <button
              key={v.id}
              type="button"
              disabled={outOfStock}
              onClick={() => onVariantChange(v.id, label)}
              className={`px-4 py-2 border-2 rounded font-medium transition ${
                outOfStock
                  ? 'border-border text-muted-foreground opacity-50 cursor-not-allowed line-through'
                  : selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-foreground hover:border-primary'
              }`}
            >
              {label}
              {!outOfStock && v.stock_qty <= 5 ? (
                <span className="block text-[10px] font-normal opacity-80">
                  {v.stock_qty} left
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
