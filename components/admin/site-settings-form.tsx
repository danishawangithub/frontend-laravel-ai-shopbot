'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  siteSettingsFormSchema,
  type SiteSettingsFormValues,
} from '@/lib/schemas/site-settings'
import type { SiteBranding } from '@/lib/admin-api-types'
import { adminUpdateSiteSettings } from '@/lib/admin-services'
import { storagePublicUrl } from '@/lib/storage-url'

type Props = {
  token: string
  initial: SiteBranding | null
  onSaved?: (settings: SiteBranding) => void
}

export function SiteSettingsForm({ token, initial, onSaved }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [savedLogoUrl, setSavedLogoUrl] = useState<string | null>(null)

  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsFormSchema),
    defaultValues: {
      site_name: initial?.site_name ?? '',
      logo_text: initial?.logo_text ?? '',
    },
  })

  useEffect(() => {
    if (!initial) return
    form.reset({
      site_name: initial.site_name ?? '',
      logo_text: initial.logo_text ?? '',
    })
    setSavedLogoUrl(initial.logo_url ?? storagePublicUrl(initial.logo) ?? null)
    setPendingFile(null)
    setPreviewUrl(null)
    setRemoveLogo(false)
    if (fileRef.current) fileRef.current.value = ''
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when settings load
  }, [initial?.site_name, initial?.logo, initial?.logo_url, initial?.logo_text])

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(pendingFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingFile])

  const displayUrl = removeLogo ? null : previewUrl ?? savedLogoUrl

  function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo must be 5 MB or smaller')
      return
    }
    setPendingFile(file)
    setRemoveLogo(false)
  }

  async function onSubmit(values: SiteSettingsFormValues) {
    try {
      const updated = await adminUpdateSiteSettings(token, values, {
        logoFile: pendingFile,
        removeLogo,
      })
      toast.success('Site settings saved')
      setSavedLogoUrl(updated.logo_url ?? storagePublicUrl(updated.logo) ?? null)
      setPendingFile(null)
      setPreviewUrl(null)
      setRemoveLogo(false)
      if (fileRef.current) fileRef.current.value = ''
      onSaved?.(updated)
    } catch (e) {
      if (e instanceof ApiRequestError) {
        if (e.body.errors) applyLaravelFieldErrors(e.body.errors, form.setError)
        toast.error(e.message)
      } else {
        toast.error(e instanceof Error ? e.message : 'Failed to save settings')
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        <FormField
          control={form.control}
          name="site_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Elegance Boutique" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logo_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo text (when no image)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Elegance" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium">Logo image</p>
          {displayUrl ? (
            <div className="relative h-16 w-40 rounded border border-border bg-secondary/20 overflow-hidden">
              <Image
                src={displayUrl}
                alt="Logo preview"
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No logo uploaded</p>
          )}
          <Input ref={fileRef} type="file" accept="image/*" onChange={onFilePick} />
          {(displayUrl || savedLogoUrl) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setRemoveLogo(true)
                setPendingFile(null)
                if (fileRef.current) fileRef.current.value = ''
              }}
            >
              Remove logo
            </Button>
          )}
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving…' : 'Save site settings'}
        </Button>
      </form>
    </Form>
  )
}
