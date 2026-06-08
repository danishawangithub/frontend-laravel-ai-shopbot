'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useAdminAuth } from '@/lib/admin-auth-context'
import { adminFetchCategory } from '@/lib/admin-services'
import type { AdminCategory } from '@/lib/admin-api-types'
import { CategoryForm } from '@/components/admin/category-form'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function EditCategoryPage() {
  const params = useParams()
  const id = Number(params.id)
  const { getToken } = useAdminAuth()
  const token = getToken()
  const [row, setRow] = useState<AdminCategory | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!token || !Number.isFinite(id)) return
    setLoading(true)
    try {
      const c = await adminFetchCategory(token, id)
      setRow(c)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load category')
      setRow(null)
    } finally {
      setLoading(false)
    }
  }, [token, id])

  useEffect(() => {
    void load()
  }, [load])

  if (!token) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/categories">Back</Link>
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Edit category</h1>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !row ? (
        <p className="text-sm text-destructive">Category not found.</p>
      ) : (
        <CategoryForm
          key={row.id}
          token={token}
          mode="edit"
          categoryId={id}
          initial={row}
        />
      )}
    </div>
  )
}
