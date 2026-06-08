'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/admin-auth-context'
import { CategoryForm } from '@/components/admin/category-form'
import { Button } from '@/components/ui/button'

export default function NewCategoryPage() {
  const { getToken } = useAdminAuth()
  const router = useRouter()
  const token = getToken()

  if (!token) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/categories">Back</Link>
        </Button>
        <h1 className="text-3xl font-bold text-foreground">New category</h1>
      </div>
      <CategoryForm
        token={token}
        mode="create"
        onSuccess={() => router.push('/admin/categories')}
      />
    </div>
  )
}
