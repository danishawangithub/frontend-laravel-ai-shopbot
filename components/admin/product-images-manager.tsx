'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ApiRequestError } from '@/lib/api'
import type { ProductImage } from '@/lib/admin-api-types'
import { adminAddProductImage, adminDeleteProductImage } from '@/lib/admin-services'

function imagePath(img: ProductImage): string {
  return img.path_or_url || (img as { url?: string }).url || ''
}

function imageSrc(pathOrUrl: string): string {
  if (!pathOrUrl) return ''
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }
  const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl.replace(/^\//, '')}`
  return base ? `${base}${path}` : pathOrUrl
}

type Props = {
  token: string
  productId: number
  images: ProductImage[]
  onImagesChange: (next: ProductImage[]) => void
}

export function ProductImagesManager({ token, productId, images, onImagesChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function uploadFile(file: File) {
    setBusy(true)
    try {
      const created = await adminAddProductImage(token, productId, { file })
      onImagesChange([...images, created])
      if (fileRef.current) fileRef.current.value = ''
      toast.success('Image added')
    } catch (err) {
      if (err instanceof ApiRequestError && err.body.errors) {
        const first = Object.values(err.body.errors)[0]?.[0]
        toast.error(first ?? err.message)
      } else {
        toast.error(err instanceof Error ? err.message : 'Upload failed')
      }
    } finally {
      setBusy(false)
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void uploadFile(file)
  }

  async function handleDelete(image: ProductImage) {
    if (!confirm('Delete this image?')) return
    setBusy(true)
    try {
      await adminDeleteProductImage(token, productId, image.id)
      onImagesChange(images.filter((i) => i.id !== image.id))
      toast.success('Image deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Product images</h2>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={busy}
        onChange={onFileChange}
      />
      <Button
        type="button"
        variant="secondary"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
      >
        {busy ? 'Uploading…' : 'Add image'}
      </Button>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">No images yet. Click Add image to upload.</p>
      ) : (
        <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => {
            const src = imageSrc(imagePath(img))
            return (
              <li
                key={img.id}
                className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
              >
                {src ? (
                  <Image
                    src={src}
                    alt={img.alt ?? 'Product'}
                    fill
                    className="object-cover"
                    sizes="200px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full min-h-[120px] items-center justify-center text-xs text-muted-foreground">
                    No preview
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute right-2 top-2"
                  disabled={busy}
                  onClick={() => handleDelete(img)}
                >
                  Delete
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
