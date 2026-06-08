'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAdminAuth } from '@/lib/admin-auth-context'
import {
  adminDeleteProduct,
  adminFetchProducts,
  adminPatchProductFeatured,
  adminUpdateProduct,
} from '@/lib/admin-services'
import type { AdminProduct } from '@/lib/admin-api-types'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ApiRequestError } from '@/lib/api'
import { Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatListStock(row: AdminProduct): string {
  const variants = row.variants
  if (variants?.length) {
    const total = variants.reduce(
      (sum, v) => sum + Math.max(0, Number(v.stock_qty) || 0),
      0
    )
    return String(total)
  }
  if (row.stock_qty == null) return '—'
  return String(row.stock_qty)
}

export default function AdminProductsPage() {
  const { getToken } = useAdminAuth()
  const [rows, setRows] = useState<AdminProduct[]>([])
  const [meta, setMeta] = useState<{ current_page?: number; last_page?: number } | undefined>()
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    const token = getToken()
    if (!token) return
    setLoading(true)
    try {
      const { items, meta: m } = await adminFetchProducts(token, { page, per_page: 20 })
      setRows(items)
      setMeta(m)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load products')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [getToken, page])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(row: AdminProduct) {
    if (!confirm(`Archive / delete product “${row.name}”?`)) return
    const token = getToken()
    if (!token) return
    try {
      await adminDeleteProduct(token, row.id)
      toast.success('Product removed')
      setRows((prev) => prev.filter((r) => r.id !== row.id))
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 422) {
        const archive = confirm(
          `${e.body.message ?? 'This product has orders and cannot be deleted.'}\n\nArchive it instead?`
        )
        if (archive) {
          try {
            await adminUpdateProduct(token, row.id, { status: 'archived' })
            setRows((prev) =>
              prev.map((r) => (r.id === row.id ? { ...r, status: 'archived' } : r))
            )
            toast.success('Product archived')
            return
          } catch (archiveErr) {
            toast.error(
              archiveErr instanceof Error ? archiveErr.message : 'Could not archive product'
            )
            return
          }
        }
        return
      }
      const msg =
        e instanceof ApiRequestError
          ? e.body.message ?? e.message
          : e instanceof Error
            ? e.message
            : 'Delete failed'
      toast.error(msg)
    }
  }

  async function handleToggleFeatured(row: AdminProduct) {
    const token = getToken()
    if (!token) return
    const next = !row.is_featured
    setTogglingId(row.id)
    try {
      const updated = await adminPatchProductFeatured(token, row.id, next)
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, is_featured: Boolean(updated.is_featured) } : r
        )
      )
      toast.success(next ? 'Added to featured' : 'Removed from featured')
    } catch (e) {
      const msg =
        e instanceof ApiRequestError
          ? e.body.message ?? e.message
          : e instanceof Error
            ? e.message
            : 'Failed to update featured'
      toast.error(msg)
    } finally {
      setTogglingId(null)
    }
  }

  const lastPage = meta?.last_page ?? 1
  const currentPage = meta?.current_page ?? page

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage products from Laravel.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new" className="inline-flex items-center gap-2">
            <Plus className="size-4" />
            New product
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <p className="p-8 text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-8 text-sm text-muted-foreground">No products on this page.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-right font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Featured</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-secondary/10">
                    <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.sku ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {String(r.base_price)} {r.currency ? ` ${r.currency}` : ''}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {formatListStock(r)}
                    </td>
                    <td className="px-4 py-3 capitalize">{r.status}</td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        type="button"
                        variant={r.is_featured ? 'default' : 'outline'}
                        size="icon-sm"
                        title={r.is_featured ? 'Remove from featured' : 'Mark as featured'}
                        disabled={togglingId === r.id}
                        onClick={() => void handleToggleFeatured(r)}
                        className={cn(
                          r.is_featured && 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                        )}
                      >
                        <Star
                          className={cn('size-4', r.is_featured && 'fill-current')}
                        />
                      </Button>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button variant="outline" size="icon-sm" asChild title="Edit">
                        <Link href={`/admin/products/${r.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        type="button"
                        title="Delete"
                        onClick={() => handleDelete(r)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {lastPage > 1 && (
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">
            Page {currentPage} of {lastPage}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || currentPage >= lastPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
