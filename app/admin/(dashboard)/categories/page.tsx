'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAdminAuth } from '@/lib/admin-auth-context'
import { adminDeleteCategory, adminFetchCategories } from '@/lib/admin-services'
import type { AdminCategory } from '@/lib/admin-api-types'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ApiRequestError } from '@/lib/api'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'

export default function AdminCategoriesPage() {
  const { getToken } = useAdminAuth()
  const [rows, setRows] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const token = getToken()
    if (!token) return
    setLoading(true)
    try {
      const list = await adminFetchCategories(token)
      setRows(list)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load categories')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(row: AdminCategory) {
    if (!confirm(`Delete category “${row.name}”?`)) return
    const token = getToken()
    if (!token) return
    try {
      await adminDeleteCategory(token, row.id)
      toast.success('Category deleted')
      setRows((prev) => prev.filter((r) => r.id !== row.id))
    } catch (e) {
      const msg =
        e instanceof ApiRequestError
          ? e.body.message ?? e.message
          : e instanceof Error
            ? e.message
            : 'Delete failed'
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage catalog categories from Laravel.</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new" className="inline-flex items-center gap-2">
            <Plus className="size-4" />
            New category
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <p className="p-8 text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-8 text-sm text-muted-foreground">No categories found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Image</th>
                  <th className="px-4 py-3 text-left font-semibold">Slug</th>
                  <th className="px-4 py-3 text-left font-semibold">Parent</th>
                  <th className="px-4 py-3 text-left font-semibold">Sort</th>
                  <th className="px-4 py-3 text-left font-semibold">Active</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-secondary/10">
                    <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground"><Image src={r.image_url} alt={r.name} width={100} height={100} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{r.slug ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.parent_id ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.sort_order ?? '—'}</td>
                    <td className="px-4 py-3">{r.is_active ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button variant="outline" size="icon-sm" asChild title="Edit">
                        <Link href={`/admin/categories/${r.id}/edit`}>
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
    </div>
  )
}
