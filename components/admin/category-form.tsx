'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ApiRequestError } from '@/lib/api'
import { applyLaravelFieldErrors } from '@/lib/form-errors'
import { categoryFormSchema, type CategoryFormValues } from '@/lib/schemas/category'
import type { AdminCategory } from '@/lib/admin-api-types'
import {
  adminCreateCategory,
  adminFetchCategories,
  adminUpdateCategory,
} from '@/lib/admin-services'
import { storagePublicUrl } from '@/lib/storage-url'

type Props = {
  token: string
  mode: 'create' | 'edit'
  categoryId?: number
  initial?: AdminCategory | null
  onSuccess?: (category: AdminCategory) => void
}

export function CategoryForm({ token, mode, categoryId, initial, onSuccess }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [parents, setParents] = useState<AdminCategory[]>([])
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initial?.name ?? '',
      slug: initial?.slug ?? '',
      description: initial?.description ?? '',
      parent_id: initial?.parent_id ?? undefined,
      sort_order: initial?.sort_order ?? 0,
      is_active: initial?.is_active ?? true,
    },
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await adminFetchCategories(token)
        if (!cancelled) {
          const filtered =
            mode === 'edit' && categoryId != null
              ? list.filter((c) => c.id !== categoryId)
              : list
          setParents(filtered)
        }
      } catch {
        if (!cancelled) setParents([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, mode, categoryId])

  // Only reset when loading a category (by id), not on every `initial` object reference change.
  useEffect(() => {
    if (mode === 'edit' && !initial?.id) return

    form.reset({
      name: initial?.name ?? '',
      slug: initial?.slug ?? '',
      description: initial?.description ?? '',
      parent_id: initial?.parent_id ?? undefined,
      sort_order: initial?.sort_order ?? 0,
      is_active: initial?.is_active ?? true,
    })
    setSavedImageUrl(initial?.image_url ?? storagePublicUrl(initial?.image) ?? null)
    setPendingFile(null)
    setPreviewUrl(null)
    setRemoveImage(false)
    if (fileRef.current) fileRef.current.value = ''
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when category id changes
  }, [mode, initial?.id])

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(pendingFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingFile])

  const displayUrl = removeImage ? null : previewUrl ?? savedImageUrl

  function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller')
      return
    }
    setPendingFile(file)
    setRemoveImage(false)
  }

  function clearPendingFile() {
    setPendingFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleRemoveImage() {
    clearPendingFile()
    setRemoveImage(true)
    setSavedImageUrl(null)
  }

  function undoRemoveImage() {
    setRemoveImage(false)
    if (initial) {
      setSavedImageUrl(
        initial.image_url ?? storagePublicUrl(initial.image) ?? null
      )
    }
  }

  async function onSubmit(values: CategoryFormValues) {
    if (mode === 'edit' && (categoryId == null || !Number.isFinite(categoryId))) {
      toast.error('Invalid category id')
      return
    }

    const imageOpts = {
      file: pendingFile ?? undefined,
      removeImage: removeImage && mode === 'edit',
    }

    try {
      const saved =
        mode === 'create'
          ? await adminCreateCategory(token, values, imageOpts)
          : await adminUpdateCategory(token, categoryId!, values, imageOpts)

      toast.success(mode === 'create' ? 'Category created' : 'Category updated')

      const nextUrl = saved.image_url ?? storagePublicUrl(saved.image) ?? null
      setSavedImageUrl(nextUrl)
      setPendingFile(null)
      setRemoveImage(false)
      clearPendingFile()

      onSuccess?.(saved)
    } catch (e) {
      if (e instanceof ApiRequestError && e.body.errors) {
        applyLaravelFieldErrors(e.body.errors, form.setError)
        const imgErr = e.body.errors.image?.[0]
        if (imgErr) toast.error(imgErr)
      } else {
        toast.error(e instanceof Error ? e.message : 'Request failed')
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="Category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="auto-generated if empty" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Optional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parent_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent category</FormLabel>
              <FormControl>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                  value={field.value === undefined || field.value === null ? '' : String(field.value)}
                  onChange={(e) => {
                    const v = e.target.value
                    field.onChange(v === '' ? undefined : Number(v))
                  }}
                >
                  <option value="">None</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3 rounded-lg border border-border bg-card/50 p-4">
          <FormLabel>Category image</FormLabel>
          <p className="text-xs text-muted-foreground">
            Single image (max 5 MB). Sent with save as multipart field{' '}
            <code className="text-[11px]">image</code>.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFilePick}
          />

          {displayUrl ? (
            <div className="relative aspect-[16/9] w-full max-w-sm overflow-hidden rounded-md border border-border bg-muted">
              <Image
                src={displayUrl}
                alt="Category preview"
                fill
                className="object-cover"
                sizes="320px"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex aspect-[16/9] w-full max-w-sm items-center justify-center rounded-md border border-dashed border-border bg-muted/50 text-sm text-muted-foreground">
              No image
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              {displayUrl ? 'Replace image' : 'Upload image'}
            </Button>
            {pendingFile && (
              <Button type="button" variant="outline" size="sm" onClick={clearPendingFile}>
                Cancel selection
              </Button>
            )}
            {(savedImageUrl || initial?.image) && !removeImage && !pendingFile && (
              <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage}>
                Remove image
              </Button>
            )}
            {removeImage && mode === 'edit' && (
              <Button type="button" variant="ghost" size="sm" onClick={undoRemoveImage}>
                Undo remove
              </Button>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="sort_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort order</FormLabel>
              <FormControl>
                <Input type="number" min={0} max={65535} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={Boolean(field.value)}
                  onCheckedChange={(v) => field.onChange(v === true)}
                />
              </FormControl>
              <FormLabel className="font-normal">Active</FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[140px]">
          {form.formState.isSubmitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
}
