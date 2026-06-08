'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ApiRequestError } from '@/lib/api'
import { resolveImageUrl } from '@/lib/image-url'
import type { AdminCategory } from '@/lib/admin-api-types'
import { adminUpdateCategoryImage } from '@/lib/admin-services'

type Props = {
  token: string
  categoryId: number
  category: AdminCategory
  onUpdated: (category: AdminCategory) => void
}

export function CategoryImageField({ token, categoryId, category, onUpdated }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const preview =
    resolveImageUrl(category.image_url) || resolveImageUrl(category.image) || ''

  async function uploadFile(file: File) {
    setBusy(true)
    try {
      const updated = await adminUpdateCategoryImage(token, categoryId, { file })
      onUpdated(updated)
      if (fileRef.current) fileRef.current.value = ''
      toast.success('Category image updated')
    } catch (err) {
      if (err instanceof ApiRequestError && err.body.errors) {
        toast.error(Object.values(err.body.errors)[0]?.[0] ?? err.message)
      } else {
        toast.error(err instanceof Error ? err.message : 'Upload failed')
      }
    } finally {
      setBusy(false)
    }
  }

  async function removeImage() {
    if (!preview) return
    if (!confirm('Remove category image?')) return
    setBusy(true)
    try {
      const updated = await adminUpdateCategoryImage(token, categoryId, { removeImage: true })
      onUpdated(updated)
      toast.success('Image removed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove image')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Category image</h2>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void uploadFile(file)
        }}
      />

      {preview ? (
        <motion className="relative aspect-[4/3] max-w-xs overflow-hidden rounded-md border border-border bg-muted">
          <Image src={preview} alt={category.name} fill className="object-cover" sizes="320px" unoptimized />
        </motion>
      ) : (
        <p className="text-sm text-muted-foreground">No image yet.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={busy} onClick={() => fileRef.current?.click()}>
          {busy ? 'Saving…' : preview ? 'Change image' : 'Add image'}
        </Button>
        {preview ? (
          <Button type="button" variant="destructive" disabled={busy} onClick={() => void removeImage()}>
            Delete image
          </Button>
        ) : null}
      </div>
    </div>
  )
}
