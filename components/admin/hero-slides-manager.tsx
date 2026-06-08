'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  heroSlideFormSchema,
  type HeroSlideFormValues,
} from '@/lib/schemas/hero-slide'
import type { HeroSlide } from '@/lib/admin-api-types'
import {
  adminCreateHeroSlide,
  adminDeleteHeroSlide,
  adminFetchHeroSlides,
  adminUpdateHeroSlide,
} from '@/lib/admin-services'

type Props = {
  token: string
}

export function HeroSlidesManager({ token }: Props) {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | 'new' | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await adminFetchHeroSlides(token)
      setSlides(list)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load hero slides')
      setSlides([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(row: HeroSlide) {
    if (!confirm(`Delete slide "${row.title}"?`)) return
    try {
      await adminDeleteHeroSlide(token, row.id)
      toast.success('Slide deleted')
      if (editingId === row.id) setEditingId(null)
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <HeroSlidesHeader editingId={editingId} setEditingId={setEditingId} />

      {editingId === 'new' && (
        <HeroSlideFormPanel
          token={token}
          mode="create"
          onCancel={() => setEditingId(null)}
          onSaved={async () => {
            setEditingId(null)
            await load()
          }}
        />
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading slides…</p>
      ) : slides.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hero slides yet.</p>
      ) : (
        <div className="space-y-4">
          {slides.map((slide) => (
            <div key={slide.id} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-lg bg-card">
                {slide.image_url ? (
                  <div className="relative h-24 w-40 shrink-0 rounded overflow-hidden bg-secondary/20">
                    <Image
                      src={slide.image_url}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="h-24 w-40 shrink-0 rounded bg-secondary/30 flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{slide.title}</p>
                  {slide.subtitle ? (
                    <p className="text-sm text-muted-foreground line-clamp-2">{slide.subtitle}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground mt-1">
                    Order {slide.sort_order ?? 0} · {slide.is_active ? 'Active' : 'Hidden'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(editingId === slide.id ? null : slide.id)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleDelete(slide)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {editingId === slide.id ? (
                <HeroSlideFormPanel
                  key={slide.id}
                  token={token}
                  mode="edit"
                  slide={slide}
                  onCancel={() => setEditingId(null)}
                  onSaved={async () => {
                    setEditingId(null)
                    await load()
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function HeroSlidesHeader({
  editingId,
  setEditingId,
}: {
  editingId: number | 'new' | null
  setEditingId: (id: number | 'new' | null) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Hero slides</h2>
        <p className="text-sm text-muted-foreground">
          Homepage carousel images and call-to-action buttons.
        </p>
      </div>
      <Button
        type="button"
        onClick={() => setEditingId(editingId === 'new' ? null : 'new')}
        variant={editingId === 'new' ? 'secondary' : 'default'}
      >
        <Plus className="w-4 h-4 mr-2" />
        {editingId === 'new' ? 'Cancel' : 'Add slide'}
      </Button>
    </div>
  )
}

function HeroSlideFormPanel({
  token,
  mode,
  slide,
  onCancel,
  onSaved,
}: {
  token: string
  mode: 'create' | 'edit'
  slide?: HeroSlide
  onCancel: () => void
  onSaved: () => void | Promise<void>
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(slide?.image_url ?? null)

  const form = useForm<HeroSlideFormValues>({
    resolver: zodResolver(heroSlideFormSchema),
    defaultValues: {
      title: slide?.title ?? '',
      subtitle: slide?.subtitle ?? '',
      button_text: slide?.button_text ?? '',
      button_url: slide?.button_url ?? '',
      sort_order: slide?.sort_order ?? 0,
      is_active: slide?.is_active ?? true,
    },
  })

  useEffect(() => {
    if (mode !== 'edit' || !slide?.id) return
    form.reset({
      title: slide.title ?? '',
      subtitle: slide.subtitle ?? '',
      button_text: slide.button_text ?? '',
      button_url: slide.button_url ?? '',
      sort_order: slide.sort_order ?? 0,
      is_active: slide.is_active ?? true,
    })
    setSavedImageUrl(slide.image_url ?? null)
    setPendingFile(null)
    setPreviewUrl(null)
    setRemoveImage(false)
    if (fileRef.current) fileRef.current.value = ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, slide?.id])

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
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image must be 8 MB or smaller')
      return
    }
    setPendingFile(file)
    setRemoveImage(false)
  }

  async function onSubmit(values: HeroSlideFormValues) {
    try {
      const imageOpts = { file: pendingFile, removeImage }
      if (mode === 'create') {
        await adminCreateHeroSlide(token, values, imageOpts)
        toast.success('Slide created')
      } else if (slide) {
        await adminUpdateHeroSlide(token, slide.id, values, imageOpts)
        toast.success('Slide updated')
      }
      await onSaved()
    } catch (e) {
      if (e instanceof ApiRequestError) {
        if (e.body.errors) applyLaravelFieldErrors(e.body.errors, form.setError)
        toast.error(e.message)
      } else {
        toast.error(e instanceof Error ? e.message : 'Save failed')
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="p-4 border border-border rounded-lg bg-secondary/10 space-y-4 max-w-2xl"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtitle</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="button_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button text</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Shop now" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="button_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button URL</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="/shop" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sort_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort order</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0">Active on homepage</FormLabel>
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium">Slide image</p>
          {displayUrl ? (
            <SlideImagePreview url={displayUrl} />
          ) : (
            <p className="text-sm text-muted-foreground">No image</p>
          )}
          <Input ref={fileRef} type="file" accept="image/*" onChange={onFilePick} />
          {(displayUrl || savedImageUrl) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setRemoveImage(true)
                setPendingFile(null)
                if (fileRef.current) fileRef.current.value = ''
              }}
            >
              Remove image
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Saving…'
              : mode === 'create'
                ? 'Create slide'
                : 'Save changes'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

function SlideImagePreview({ url }: { url: string }) {
  return (
    <div className="relative h-32 w-full max-w-md rounded border border-border overflow-hidden">
      <Image src={url} alt="Slide preview" fill className="object-cover" unoptimized />
    </div>
  )
}
