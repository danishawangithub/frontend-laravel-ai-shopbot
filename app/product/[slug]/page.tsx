'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import ImageGallery from '@/components/image-gallery'
import SizeSelector from '@/components/size-selector'
import QuantitySelector from '@/components/quantity-selector'
import SizeChartModal from '@/components/size-chart-modal'
import ProductCard from '@/components/product-card'
import { publicFetchProduct, publicFetchProducts } from '@/lib/public-api'
import { mapPublicProduct } from '@/lib/map-public-product'
import type { PublicProduct } from '@/lib/public-types'
import type { Product } from '@/lib/types'
import { formatProductPrice } from '@/lib/format-price'
import { useCart } from '@/lib/cart-context'
import { ApiRequestError } from '@/lib/api'
import Link from 'next/link'
import ProductWhatsAppButton from '@/components/product-whatsapp-button'
import { ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = typeof params.slug === 'string' ? params.slug : ''

  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [adding, setAdding] = useState(false)

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    if (!slug) {
      setNotFound(true)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setSelectedVariantId(null)
    setQuantity(1)

    ;(async () => {
      try {
        const raw = await publicFetchProduct(slug)
        const api = raw as PublicProduct
        if (cancelled) return

        const mapped = mapPublicProduct(api)
        setProduct(mapped)

        const categorySlug = api.category?.slug
        if (categorySlug) {
          try {
            const related = await publicFetchProducts({
              category: categorySlug,
              per_page: '5',
            })
            if (!cancelled) {
              setRelatedProducts(
                related.data.filter((p) => p.slug !== slug).slice(0, 4).map(mapPublicProduct)
              )
            }
          } catch {
            if (!cancelled) setRelatedProducts([])
          }
        } else if (!cancelled) {
          setRelatedProducts([])
        }
      } catch {
        if (!cancelled) {
          setProduct(null)
          setNotFound(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [slug])

  const maxQuantity = useMemo(() => {
    if (!product) return 1
    if (product.requiresSize && selectedVariantId != null) {
      const v = product.variants?.find((x) => x.id === selectedVariantId)
      return Math.min(99, v?.stock_qty ?? 1)
    }
    return Math.min(99, product.stockQty ?? product.stock ?? 99)
  }, [product, selectedVariantId])

  const stockLabel = useMemo(() => {
    if (!product) return ''
    if (product.requiresSize) {
      if (selectedVariantId != null) {
        const v = product.variants?.find((x) => x.id === selectedVariantId)
        if (!v || v.stock_qty <= 0) return 'Out of stock'
        return `${v.stock_qty} available (size ${v.size})`
      }
      const total = product.variants?.reduce((s, v) => s + Math.max(0, v.stock_qty), 0) ?? 0
      return total > 0 ? `${total} total across sizes` : 'Out of stock'
    }
    const qty = product.stockQty ?? product.stock
    return qty > 0 ? `${qty} available` : 'Out of stock'
  }, [product, selectedVariantId])

  const hasStock = useMemo(() => {
    if (!product) return false
    if (product.inStock === false) return false
    if (product.requiresSize) {
      const total =
        product.variants?.reduce((s, v) => s + Math.max(0, v.stock_qty), 0) ?? 0
      return total > 0
    }
    return (product.stockQty ?? product.stock ?? 0) > 0
  }, [product])

  const selectedVariant = useMemo(
    () => product?.variants?.find((v) => v.id === selectedVariantId),
    [product, selectedVariantId]
  )

  const needsSizeSelection = Boolean(product?.requiresSize && selectedVariantId == null)
  const selectedSizeOutOfStock = Boolean(
    product?.requiresSize &&
      selectedVariantId != null &&
      (selectedVariant?.stock_qty ?? 0) <= 0
  )

  const addButtonLabel = useMemo(() => {
    if (!hasStock) return 'Out of Stock'
    if (needsSizeSelection) return 'Select a size'
    if (selectedSizeOutOfStock) return 'Out of Stock'
    return 'Add to Cart'
  }, [hasStock, needsSizeSelection, selectedSizeOutOfStock])

  const addButtonDisabled = !hasStock || adding || selectedSizeOutOfStock

  async function handleAddToCart() {
    if (!product || !hasStock) return

    if (product.requiresSize && selectedVariantId == null) {
      toast.error('Please select a size')
      return
    }

    if (selectedSizeOutOfStock) {
      toast.error('This size is out of stock')
      return
    }

    setAdding(true)
    try {
      await addToCart({
        product_id: Number(product.id),
        product_variant_id: product.requiresSize ? selectedVariantId ?? undefined : undefined,
        quantity,
      })
      setAddedToCart(true)
      toast.success('Added to cart')
      setTimeout(() => setAddedToCart(false), 2000)
      setSelectedVariantId(null)
      setQuantity(1)
    } catch (e) {
      const msg =
        e instanceof ApiRequestError
          ? e.body.message ?? e.message
          : e instanceof Error
            ? e.message
            : 'Could not add to cart'
      toast.error(msg)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingState />
        <Footer />
      </>
    )
  }

  if (notFound || !product) {
    return (
      <>
        <Navbar />
        <NotFoundState />
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />

      <div className="bg-background min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ProductBreadcrumb productTitle={product.title} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <ImageGallery images={product.images} title={product.title} />
            </div>

            <div className="space-y-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {product.category}
              </p>

              <ProductHeader product={product} />

              <p className="text-foreground">
                <span className="font-semibold">Availability:</span>{' '}
                <span
                  className={
                    product.inStock !== false ? 'text-green-600' : 'text-destructive'
                  }
                >
                  {stockLabel}
                </span>
              </p>

              {product.description ? (
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </div>
              ) : null}

              {product.requiresSize && product.variants && product.variants.length > 0 ? (
                <SizeSelector
                  variants={product.variants}
                  selectedVariantId={selectedVariantId}
                  onVariantChange={(id) => {
                    setSelectedVariantId(id)
                    setQuantity(1)
                  }}
                  onOpenSizeChart={() => setShowSizeChart(true)}
                />
              ) : null}

              <QuantitySelector
                quantity={quantity}
                onQuantityChange={setQuantity}
                maxStock={Math.max(1, maxQuantity)}
              />

              <button
                type="button"
                onClick={() => void handleAddToCart()}
                disabled={addButtonDisabled}
                className={`w-full py-3 rounded font-semibold text-lg transition ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : !hasStock || selectedSizeOutOfStock
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : needsSizeSelection
                        ? 'bg-secondary text-foreground hover:bg-secondary/80'
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                {adding
                  ? 'Adding…'
                  : addedToCart
                    ? 'Added to Cart!'
                    : addButtonLabel}
              </button>

              <ProductWhatsAppButton
                slug={product.slug}
                title={product.title}
                priceLabel={formatProductPrice(product.price, product.currency)}
                size={
                  product.requiresSize && selectedVariant?.size
                    ? selectedVariant.size
                    : undefined
                }
                quantity={quantity}
              />

              <TrustSection />
            </div>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="mt-16 border-t border-border pt-12">
              <h2 className="text-2xl font-bold text-foreground mb-8">Similar Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <SizeChartModal isOpen={showSizeChart} onClose={() => setShowSizeChart(false)} />

      <Footer />
    </>
  )
}

function ProductBreadcrumb({ productTitle }: { productTitle: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-primary">
        Home
      </Link>
      <ChevronRight className="w-4 h-4" />
      <Link href="/shop" className="hover:text-primary">
        Shop
      </Link>
      <ChevronRight className="w-4 h-4" />
      <span className="text-foreground font-semibold truncate">{productTitle}</span>
    </div>
  )
}

function ProductHeader({ product }: { product: Product }) {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{product.title}</h1>
      <p className="text-2xl font-bold text-primary">
        {formatProductPrice(product.price, product.currency)}
      </p>
    </div>
  )
}

function TrustSection() {
  return (
    <>
      <div className="border-t border-b border-border py-6 space-y-3">
        <TrustRow
          icon={<RotateCcw className="w-5 h-5 text-primary shrink-0 mt-0.5" />}
          title="7-Day Exchange"
          text="Easy returns within 7 days"
        />
        <TrustRow
          icon={<CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />}
          title="Cash on Delivery"
          text="Pay when you receive"
        />
      </div>
      <DeliveryNote />
    </>
  )
}

function DeliveryNote() {
  return (
    <div className="bg-secondary/50 p-4 rounded">
      <p className="text-sm text-foreground">
        <span className="font-semibold">Delivery:</span> Nationwide delivery available.
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Loading product…</p>
    </div>
  )
}

function NotFoundState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
        <Link href="/shop" className="text-primary hover:underline font-medium">
          Back to Shop
        </Link>
      </div>
    </div>
  )
}

function TrustRow({
  icon,
  title,
  text,
}: {
  icon: ReactNode
  title: string
  text: string
}) {
  return (
    <TrustRowContent icon={icon} title={title} text={text} />
  )
}

function TrustRowContent({
  icon,
  title,
  text,
}: {
  icon: ReactNode
  title: string
  text: string
}) {
  return (
    <div className="flex items-start gap-3">
      {icon}
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}
