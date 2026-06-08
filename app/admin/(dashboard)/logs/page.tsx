'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAdminAuth } from '@/lib/admin-auth-context'
import { adminFetchLogs } from '@/lib/admin-services'
import type { AdminOrderRow } from '@/lib/admin-api-types'
import { toast } from 'sonner'

export default function AdminLogsPage() {
  const { getToken } = useAdminAuth()
  const [rows, setRows] = useState<AdminOrderRow[]>([])
  const [meta, setMeta] = useState<{ current_page?: number; last_page?: number } | undefined>()
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const token = getToken()
    if (!token) return
    setLoading(true)
    try {
      const { items, meta: m } = await adminFetchLogs(token, { page, per_page: 30 })
      setRows(items)
      setMeta(m)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load logs')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [getToken, page])

  useEffect(() => {
    void load()
  }, [load])

  const lastPage = meta?.last_page ?? 1
  const currentPage = meta?.current_page ?? page

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Logs</h1>
        <p className="text-muted-foreground text-sm">
          <code className="text-xs">GET /api/v1/admin/logs</code> — shape depends on your Laravel resource.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <p className="p-8 text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-8 text-sm text-muted-foreground">No log entries.</p>
        ) : (
          <ul className="divide-y divide-border max-h-[70vh] overflow-auto">
            {rows.map((row, i) => (
              <li key={String(row.id ?? row.uuid ?? i)} className="p-4 text-xs font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(row, null, 2)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {lastPage > 1 && (
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">
            Page {currentPage} of {lastPage}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded border border-border px-3 py-1 disabled:opacity-50"
              disabled={loading || currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded border border-border px-3 py-1 disabled:opacity-50"
              disabled={loading || currentPage >= lastPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
