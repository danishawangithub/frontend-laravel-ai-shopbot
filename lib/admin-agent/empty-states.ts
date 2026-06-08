import type { CustomerOrderLookupResult } from '@/lib/admin-agent/customer-order-lookup'
import { extractLaravelData } from '@/lib/admin-agent/data-utils'
import type { AgentIntent } from '@/lib/admin-agent/types'

function asRecord(data: unknown): Record<string, unknown> {
  const inner = extractLaravelData(data)
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return inner as Record<string, unknown>
  }
  return {}
}

function asArray(data: unknown): Record<string, unknown>[] {
  const inner = extractLaravelData(data)
  if (Array.isArray(inner)) {
    return inner.filter((x) => x && typeof x === 'object') as Record<string, unknown>[]
  }
  if (inner && typeof inner === 'object') {
    const o = inner as Record<string, unknown>
    for (const key of ['orders', 'customers', 'items', 'list', 'results']) {
      if (Array.isArray(o[key])) {
        return o[key].filter((x) => x && typeof x === 'object') as Record<string, unknown>[]
      }
    }
  }
  return []
}

function pickStr(row: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = row[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
    if (typeof v === 'number') return String(v)
  }
  return null
}

function isZeroCount(value: unknown): boolean {
  if (value === 0 || value === '0') return true
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value))
  return Number.isFinite(n) && n === 0
}

function periodLabel(period: string | null): string {
  switch (period) {
    case 'week':
      return 'this week'
    case 'last_week':
      return 'last week'
    case 'month':
      return 'this month'
    case 'last_month':
      return 'last month'
    case 'today':
    default:
      return 'today'
  }
}

function periodTip(period: string | null): string {
  switch (period) {
    case 'last_month':
      return "Try 'How many orders this month?' or check if orders exist in the database."
    case 'last_week':
      return "Try 'How many orders today?' or check if orders exist in the database."
    case 'month':
      return "Try 'How many orders last month?' or check if orders exist in the database."
    case 'week':
      return "Try 'How many orders today?' or check if orders exist in the database."
    default:
      return "Try 'How many orders last month?' or check if orders exist in the database."
  }
}

/** Format backend available_statuses for admin debugging. */
export function formatAvailableStatuses(meta: Record<string, unknown>): string | null {
  const raw = meta.available_statuses ?? meta.available_order_statuses ?? meta.statuses
  if (Array.isArray(raw) && raw.length) {
    return raw.map(String).join(', ')
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim()
  }
  return null
}

function appendStatusDebug(lines: string[], meta: Record<string, unknown>): void {
  const statuses = formatAvailableStatuses(meta)
  if (statuses) {
    lines.push(`Available order statuses: ${statuses}`)
  }
}

export function emptyOrdersCountPeriod(data: unknown): string | null {
  const d = asRecord(data)
  const orders = asArray(data)
  if (orders.length > 0) return null

  const total = d.total_orders ?? d.order_count ?? d.orders_count ?? d.count
  if (total != null && !isZeroCount(total)) return null

  const period = pickStr(d, ['period']) ?? 'today'
  const from =
    pickStr(d, ['date_from', 'from', 'start_date', 'range_start']) ?? '—'
  const to = pickStr(d, ['date_to', 'to', 'end_date', 'range_end']) ?? '—'

  const lines = [
    `No orders found for ${periodLabel(period)}.`,
    `Date range checked: ${from} to ${to}.`,
    `Tip: ${periodTip(period)}`,
  ]
  appendStatusDebug(lines, d)
  return lines.join('\n')
}

export function emptyPendingOrders(data: unknown): string | null {
  const d = asRecord(data)
  const orders = asArray(data)
  if (orders.length > 0) return null

  const total = d.total_orders ?? d.order_count ?? d.count
  if (total != null && !isZeroCount(total)) return null

  const lines = [
    'No pending orders right now.',
    'This usually means every order is already confirmed, shipped, or completed.',
    "Tip: Try 'Show today orders' or 'How many orders today?'",
  ]
  appendStatusDebug(lines, d)
  return lines.join('\n')
}

export function emptyCustomerOrderLookup(data: unknown): string | null {
  const r = data as CustomerOrderLookupResult
  if (r?.step !== 'not_found') return null

  const query = r.query?.trim() || 'your search'
  const meta = r.meta ?? {}

  const lines = [
    `No customer found for '${query}'.`,
    'Try searching by full name, email, or phone.',
    'Examples:',
    '• Find customer noorfatima@gmail.com',
    '• Find customer 03001234567',
    '• Noor how many orders',
  ]

  const backendMsg = pickStr(meta, ['message', 'hint', 'suggestion'])
  if (backendMsg) {
    lines.push(`Note: ${backendMsg}`)
  }

  return lines.join('\n')
}

export function emptyRepeatedCustomers(data: unknown): string | null {
  const d = asRecord(data)
  const rows = asArray(data)
  if (rows.length > 0) return null

  const total = d.total ?? d.count ?? d.total_customers ?? d.customer_count
  if (total != null && !isZeroCount(total)) return null

  const lines = [
    'No repeated customers found.',
    'This means no customer has more than one order yet, or order customer_id is missing in the database.',
    "Tip: Try 'Show latest customers' or 'Show top spending customers' once more orders are linked to customers.",
  ]
  appendStatusDebug(lines, d)
  return lines.join('\n')
}

const EMPTY_HANDLERS: Partial<Record<AgentIntent, (data: unknown) => string | null>> = {
  orders_count_period: emptyOrdersCountPeriod,
  pending_orders: emptyPendingOrders,
  customer_order_lookup: emptyCustomerOrderLookup,
  repeated_customers: emptyRepeatedCustomers,
}

/** Returns a helpful empty-state reply, or null if data should be formatted normally. */
export function tryEmptyStateReply(intent: AgentIntent, apiData: unknown): string | null {
  const handler = EMPTY_HANDLERS[intent]
  if (!handler) return null
  return handler(apiData)
}
