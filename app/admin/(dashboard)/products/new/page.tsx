'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAdminAuth } from '@/lib/admin-auth-context'
import { ProductForm } from '@/components/admin/product-form'
import { ProductImagesManager } from '@/components/admin/product-images-manager'
import type { AdminProduct, ProductImage } from '@/lib/admin-api-types'
import { Button } from '@/components/ui/button'

export default function NewProductPage() {
  const { getToken } = useAdminAuth()
  const token = getToken()
  const [created, setCreated] = useState<AdminProduct | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])

  if (!token) return null

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/products">Back</Link>
        </Button>
        <h1 className="text-3xl font-bold text-foreground">New product</h1>
      </div>

      {!created ? (
        <>
          <p className="text-sm text-muted-foreground max-w-xl">
            Save the product first, then add images via{' '}
            <code className="text-xs">POST /api/v1/admin/products/{"{id}"}/images</code>.
          </p>
          <ProductForm
            token={token}
            mode="create"
            onSuccess={(p) => {
              setCreated(p)
              setImages(Array.isArray(p.images) ? p.images : [])
            }}
          />
        </>
      ) : (
        <>
          <p className="text-sm text-green-700 dark:text-green-400">
            Product &quot;{created.name}&quot; created (ID {created.id}). Add images below.
          </p>
          <ProductImagesManager
            token={token}
            productId={created.id}
            images={images}
            onImagesChange={setImages}
          />
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/admin/products/${created.id}/edit`}>Edit product details</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/products">Back to list</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
