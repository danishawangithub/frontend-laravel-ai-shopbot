'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAdminAuth } from '@/lib/admin-auth-context'
import { adminFetchOrders, adminPatchOrder } from '@/lib/admin-services'
import type { AdminOrderRow } from '@/lib/admin-api-types'
import { toast } from 'sonner'
import { ApiRequestError } from '@/lib/api'

function orderNum(o: AdminOrderRow): string {
  const v = o.order_number ?? o.orderNumber ?? o.number
  return v != null ? String(v) : '—'
}

function orderId(o: AdminOrderRow): string {
  return o.id != null ? String(o.id) : orderNum(o)
}

function customerLine(o: AdminOrderRow): string {
  const nested = o.customer as { name?: string; email?: string } | undefined
  const name =
    (typeof o.customer_name === 'string' && o.customer_name) ||
    (typeof o.customerName === 'string' && o.customerName) ||
    nested?.name
  const email =
    (typeof o.customer_email === 'string' && o.customer_email) ||
    (typeof o.customerEmail === 'string' && o.customerEmail) ||
    nested?.email
  if (name && email) return `${name} (${email})`
  return String(name ?? email ?? '—')
}

function totalLine(o: AdminOrderRow): string {
  const t =
    o.total_amount ?? o.total ?? o.grand_total ?? o.amount ?? o.subtotal
  if (t == null) return '—'
  return String(t)
}

function statusOf(o: AdminOrderRow): string {
  const s = o.status ?? o.order_status ?? o.state
  return s != null ? String(s) : '—'
}

export default function AdminOrdersPage() {
  const { getToken } = useAdminAuth()
  const [rows, setRows] = useState<AdminOrderRow[]>([])
  const [meta, setMeta] = useState<{ current_page?: number; last_page?: number } | undefined>()
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState('')

  const load = useCallback(async () => {
    const token = getToken()
    if (!token) return
    setLoading(true)
    try {
      const { items, meta: m } = await adminFetchOrders(token, { page, per_page: 20 })
      setRows(items)
      setMeta(m)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load orders')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [getToken, page])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((o) => {
      const blob = `${orderId(o)} ${orderNum(o)} ${customerLine(o)} ${statusOf(o)}`.toLowerCase()
      return blob.includes(q)
    })
  }, [rows, searchTerm])

  async function saveStatus(id: number) {
    const token = getToken()
    if (!token) return
    try {
      await adminPatchOrder(token, id, { status: editStatus })
      toast.success('Order updated')
      setEditingId(null)
      void load()
    } catch (e) {
      const msg =
        e instanceof ApiRequestError
          ? e.body.message ?? e.message
          : e instanceof Error
            ? e.message
            : 'Update failed'
      toast.error(msg)
    }
  }

  const lastPage = meta?.last_page ?? 1
  const currentPage = meta?.current_page ?? page

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Orders</h1>
        <p className="text-muted-foreground text-sm">
          Data from <code className="text-xs">GET /api/v1/admin/orders</code>. Update with{' '}
          <code className="text-xs">PATCH /api/v1/admin/orders/{"{id}"}</code> (body fields match your Laravel
          resource).
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 md:p-6">
        <label className="block text-sm font-medium text-foreground mb-2">Search</label>
        <input
          type="text"
          placeholder="Order #, customer, status…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
        />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {loading ? (
          <p className="p-8 text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-sm text-muted-foreground">No orders on this page.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/30 border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold">ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Order #</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const idStr = orderId(o)
                  const idNum = typeof o.id === 'number' ? o.id : Number.parseInt(idStr, 10)
                  return (
                    <tr key={idStr} className="border-b border-border hover:bg-secondary/10">
                      <td className="px-4 py-3 font-mono text-xs">{idStr}</td>
                      <td className="px-4 py-3">{orderNum(o)}</td>
                      <td className="px-4 py-3">{customerLine(o)}</td>
                      <td className="px-4 py-3">{totalLine(o)}</td>
                      <td className="px-4 py-3">
                        {editingId === idStr ? (
                          <div className="flex flex-wrap gap-2 items-center">
                            <input
                              type="text"
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="rounded border border-border px-2 py-1 text-xs min-w-[10rem] bg-background"
                              placeholder="Status value"
                            />
                            <button
                              type="button"
                              className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50"
                              disabled={!editStatus.trim() || !Number.isFinite(idNum)}
                              onClick={() => Number.isFinite(idNum) && void saveStatus(idNum)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="text-xs px-2 py-1 rounded border border-border"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="rounded-full bg-secondary px-2 py-1 text-xs">{statusOf(o)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="text-xs font-medium text-primary hover:underline"
                          onClick={() => {
                            setEditingId(idStr)
                            setEditStatus(statusOf(o) === '—' ? '' : statusOf(o))
                          }}
                        >
                          Edit status
                        </button>
                      </td>
                    </tr>
                  )
                })}
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
