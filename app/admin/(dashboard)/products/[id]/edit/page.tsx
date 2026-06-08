'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useAdminAuth } from '@/lib/admin-auth-context'
import { adminFetchProduct, adminFetchCategories } from '@/lib/admin-services'
import type { AdminProduct, ProductImage } from '@/lib/admin-api-types'
import { ProductForm } from '@/components/admin/product-form'
import { ProductImagesManager } from '@/components/admin/product-images-manager'
import { ProductVariantsPanel } from '@/components/admin/product-variants-panel'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function EditProductPage() {
  const params = useParams()
  const id = Number(params.id)
  const { getToken } = useAdminAuth()
  const token = getToken()
  const [product, setProduct] = useState<AdminProduct | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [categorySlug, setCategorySlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!token || !Number.isFinite(id)) return
    setLoading(true)
    try {
      const p = await adminFetchProduct(token, id)
      setProduct(p)
      setCategorySlug(null)
      setImages(Array.isArray(p.images) ? p.images : [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load product')
      setProduct(null)
      setCategorySlug(null)
      setImages([])
    } finally {
      setLoading(false)
    }
  }, [token, id])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!token || !product) return
    const slugFromProduct = product.category?.slug
    if (slugFromProduct) {
      setCategorySlug(slugFromProduct)
      return
    }
    let cancelled = false
    void adminFetchCategories(token).then((list) => {
      if (cancelled) return
      const c = list.find((x) => x.id === product.category_id)
      setCategorySlug(c?.slug ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [token, product])

  const requiresSize = Boolean(product?.requires_size)

  if (!token) return null

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/products">Back</Link>
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Edit product</h1>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !product ? (
        <p className="text-sm text-destructive">Product not found.</p>
      ) : (
        <>
          <ProductForm
            token={token}
            mode="edit"
            productId={id}
            initial={product}
            onSuccess={(p) => {
              setProduct(p)
              setImages(Array.isArray(p.images) ? p.images : [])
            }}
          />
          <ProductImagesManager
            token={token}
            productId={id}
            images={images}
            onImagesChange={(next) => setImages(next)}
          />
          <ProductVariantsPanel
            token={token}
            productId={id}
            enabled={requiresSize}
            initialVariants={product.variants}
          />
        </>
      )}
    </div>
  )
}
