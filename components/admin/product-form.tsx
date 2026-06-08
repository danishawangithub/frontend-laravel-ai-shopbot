'use client'

import { useEffect, useState } from 'react'
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
import {
  productFormSchema,
  productToJsonBody,
  type ProductFormValues,
} from '@/lib/schemas/product'
import type { AdminCategory, AdminProduct } from '@/lib/admin-api-types'
import {
  adminCreateProduct,
  adminFetchCategories,
  adminUpdateProduct,
} from '@/lib/admin-services'

type Props = {
  token: string
  mode: 'create' | 'edit'
  productId?: number
  initial?: AdminProduct | null
  onSuccess?: (product: AdminProduct) => void
}

function toFormValues(p: AdminProduct | null | undefined): ProductFormValues {
  if (!p) {
    return {
      category_id: 0,
      name: '',
      slug: '',
      sku: '',
      description: '',
      base_price: '',
      currency: 'PKR',
      cost: '',
      is_sale: false,
      sale_price: '',
      compare_at_price: '',
      sale_starts_at: '',
      sale_ends_at: '',
      status: 'draft',
      stock_qty: '',
    }
  }
  return {
    category_id: p.category_id,
    name: p.name,
    slug: p.slug ?? '',
    sku: p.sku ?? '',
    description: p.description ?? '',
    base_price: String(p.base_price ?? ''),
    currency: (p.currency as string) || 'PKR',
    cost: p.cost != null && p.cost !== '' ? String(p.cost) : '',
    is_sale: Boolean(p.is_sale),
    sale_price: p.sale_price != null && p.sale_price !== '' ? String(p.sale_price) : '',
    compare_at_price:
      p.compare_at_price != null && p.compare_at_price !== '' ? String(p.compare_at_price) : '',
    sale_starts_at: p.sale_starts_at ?? '',
    sale_ends_at: p.sale_ends_at ?? '',
    status: p.status ?? 'draft',
    stock_qty: p.stock_qty != null ? String(p.stock_qty) : '',
  }
}

export function ProductForm({ token, mode, productId, initial, onSuccess }: Props) {
  const [categories, setCategories] = useState<AdminCategory[]>([])

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: toFormValues(initial ?? null),
  })

  const isSale = form.watch('is_sale')
  const categoryId = form.watch('category_id')
  const selectedCategory = categories.find((c) => c.id === categoryId)
  const requiresSize =
    Boolean(initial?.requires_size) || Boolean(selectedCategory?.requires_size)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await adminFetchCategories(token)
        if (!cancelled) setCategories(list)
      } catch {
        if (!cancelled) setCategories([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (initial) {
      form.reset(toFormValues(initial))
    }
  }, [initial, form])

  async function onSubmit(values: ProductFormValues) {
    const body = productToJsonBody(values)
    try {
      const saved =
        mode === 'create'
          ? await adminCreateProduct(token, body)
          : await adminUpdateProduct(token, productId!, body)
      toast.success(mode === 'create' ? 'Product created' : 'Product updated')
      onSuccess?.(saved)
    } catch (e) {
      if (e instanceof ApiRequestError && e.body.errors) {
        applyLaravelFieldErrors(e.body.errors, form.setError)
      }
      toast.error(e instanceof Error ? e.message : 'Request failed')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <FormControl>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                  value={field.value ? String(field.value) : ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="base_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base price *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value === 0 ? '0' : String(field.value ?? '')}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input maxLength={3} placeholder="PKR" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {!requiresSize ? (
          <FormField
            control={form.control}
            name="stock_qty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    value={field.value === null || field.value === undefined ? '' : String(field.value)}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value === null || field.value === undefined ? '' : String(field.value)}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_sale"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={Boolean(field.value)}
                  onCheckedChange={(v) => field.onChange(v === true)}
                />
              </FormControl>
              <FormLabel className="font-normal">On sale</FormLabel>
            </FormItem>
          )}
        />

        {isSale && (
          <FormField
            control={form.control}
            name="sale_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale price *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value === null || field.value === undefined ? '' : String(field.value)}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="compare_at_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compare at price</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value === null || field.value === undefined ? '' : String(field.value)}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="sale_starts_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale starts at</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sale_ends_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale ends at</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                  value={field.value ?? 'draft'}
                  onChange={field.onChange}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save product'}
        </Button>
      </form>
    </Form>
  )
}
