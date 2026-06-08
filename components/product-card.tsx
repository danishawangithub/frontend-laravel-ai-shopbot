import Link from 'next/link'
import ProductCardImage from '@/components/product-card-image'
import { Product } from '@/lib/types'
import { formatProductPrice } from '@/lib/format-price'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.slug}`}>
      <div className="bg-card rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col">
        <ProductCardImage src={product.images[0]} alt={product.title} />

        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            {product.category}
          </p>

          <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2">
            {product.title}
          </h3>

          {product.fabric ? (
            <p className="text-sm text-muted-foreground mb-3">{product.fabric}</p>
          ) : null}

          <div className="flex items-center justify-between mt-auto">
            <span className="text-lg font-semibold text-primary">
              {formatProductPrice(product.price, product.currency)}
            </span>
            <span className="px-3 py-2 bg-primary text-primary-foreground rounded text-sm font-medium">
              View
            </span>
          </div>

          {product.stock <= 5 ? (
            <p className="text-xs text-destructive mt-2 font-semibold">
              Only {product.stock} left!
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
