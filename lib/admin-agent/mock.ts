import type { CustomerOrderLookupResult } from '@/lib/admin-agent/customer-order-lookup'
import { asCustomerRecords, extractLaravelData } from '@/lib/admin-agent/data-utils'
import { emptyCustomerOrderLookup } from '@/lib/admin-agent/empty-states'
import type { AgentIntent, TodaySummaryApiData } from '@/lib/admin-agent/types'

function asCustomers(data: unknown): Record<string, unknown>[] {
  return asCustomerRecords(data)
}

export { extractLaravelData }

function asArray(data: unknown): Record<string, unknown>[] {
  const inner = extractLaravelData(data)
  if (Array.isArray(inner)) {
    return inner.filter((x) => x && typeof x === 'object') as Record<string, unknown>[]
  }
  if (inner && typeof inner === 'object') {
    const o = inner as Record<string, unknown>
    for (const key of [
      'orders',
      'products',
      'customers',
      'items',
      'list',
      'results',
      'matches',
    ]) {
      if (Array.isArray(o[key])) {
        return o[key].filter((x) => x && typeof x === 'object') as Record<string, unknown>[]
      }
    }
  }
  return []
}

function asRecord(data: unknown): Record<string, unknown> {
  const inner = extractLaravelData(data)
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return inner as Record<string, unknown>
  }
  return {}
}

function pickStr(row: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = row[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
    if (typeof v === 'number') return String(v)
  }
  return null
}

function formatPkr(value: unknown): string {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseFloat(value)
        : NaN
  if (!Number.isFinite(n)) return '—'
  return `Rs ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

function formatTodaySalesBlock(data: unknown): string {
  const d = asRecord(data)
  const date =
    pickStr(d, ['date', 'summary_date', 'report_date']) ??
    new Date().toLocaleDateString('en-PK')
  const totalOrders =
    d.total_orders ?? d.order_count ?? d.orders_count ?? '—'
  const paidOrders = d.paid_orders ?? d.paid_order_count ?? '—'
  const totalSales = formatPkr(
    d.total_sales ?? d.total_revenue ?? d.revenue ?? d.sales_total ?? d.amount
  )
  return [
    'Today Sales Summary',
    `Date: ${date}`,
    `Total orders: ${totalOrders}`,
    `Paid orders: ${paidOrders}`,
    `Total sales: ${totalSales}`,
  ].join('\n')
}

function formatPeriodBlock(title: string, data: unknown): string {
  const d = asRecord(data)
  const period = pickStr(d, ['period']) ?? '—'
  const dateFrom = pickStr(d, ['date_from', 'from', 'start_date'])
  const dateTo = pickStr(d, ['date_to', 'to', 'end_date'])
  const range =
    dateFrom && dateTo ? `${dateFrom} → ${dateTo}` : dateFrom ?? dateTo ?? '—'
  const totalOrders = d.total_orders ?? d.order_count ?? '—'
  const paidOrders = d.paid_orders ?? '—'
  const pendingOrders = d.pending_orders ?? '—'
  const cancelledOrders = d.cancelled_orders ?? '—'
  const totalSales = formatPkr(
    d.total_sales ?? d.total_revenue ?? d.revenue ?? d.amount
  )

  const lines = [
    title,
    `Period: ${period}`,
    `Date range: ${range}`,
    `Total orders: ${totalOrders}`,
    `Paid orders: ${paidOrders}`,
  ]
  if (pendingOrders !== '—') lines.push(`Pending orders: ${pendingOrders}`)
  if (cancelledOrders !== '—') lines.push(`Cancelled orders: ${cancelledOrders}`)
  if (totalSales !== '—') lines.push(`Total sales: ${totalSales}`)
  return lines.join('\n')
}

function formatOrdersList(title: string, data: unknown, empty: string): string {
  const orders = asArray(data)
  if (!orders.length) return `${title}\n${empty}`
  const lines = orders.slice(0, 6).map((o) => {
    const id = pickStr(o, ['id', 'order_number', 'number']) ?? '—'
    const name = pickStr(o, ['customer_name', 'name', 'guest_name'])
    const total = formatPkr(o.total ?? o.grand_total ?? o.amount)
    return `  • #${id}${name ? ` — ${name}` : ''}${total !== '—' ? ` — ${total}` : ''}`
  })
  const more = orders.length > 6 ? `\n  …and ${orders.length - 6} more` : ''
  return `${title} (${orders.length})\n${lines.join('\n')}${more}`
}

function formatProductsList(title: string, data: unknown, empty: string): string {
  const products = asArray(data)
  if (!products.length) return `${title}\n${empty}`
  const lines = products.slice(0, 6).map((p) => {
    const name = pickStr(p, ['name', 'title']) ?? 'Product'
    const qty = pickStr(p, ['stock_qty', 'stock', 'quantity', 'qty'])
    return `  • ${name}${qty != null ? ` — ${qty} left` : ''}`
  })
  const more = products.length > 6 ? `\n  …and ${products.length - 6} more` : ''
  return `${title} (${products.length})\n${lines.join('\n')}${more}`
}

function formatCustomersList(data: unknown, title = 'Customers'): string {
  const customers = asArray(data)
  if (!customers.length) return `${title}\nNo records found.`
  const lines = customers.slice(0, 8).map((c) => {
    const id = pickStr(c, ['id']) ?? '—'
    const name = pickStr(c, ['name', 'customer_name', 'full_name']) ?? 'Customer'
    const email = pickStr(c, ['email'])
    const phone = pickStr(c, ['phone', 'mobile'])
    const contact = email ?? phone ?? ''
    return `  • #${id} ${name}${contact ? ` — ${contact}` : ''}`
  })
  const more = customers.length > 8 ? `\n  …and ${customers.length - 8} more` : ''
  return `${title} (${customers.length})\n${lines.join('\n')}${more}`
}

function formatOrderDetail(data: unknown): string {
  const d = asRecord(data)
  const id = pickStr(d, ['id', 'order_number', 'number']) ?? '—'
  const customer = pickStr(d, ['customer_name', 'name', 'guest_name', 'customer']) ?? '—'
  const total = formatPkr(d.total ?? d.grand_total ?? d.amount)
  const payment = pickStr(d, ['payment_status', 'payment']) ?? '—'
  const status = pickStr(d, ['status', 'order_status']) ?? '—'
  const created = pickStr(d, ['created_at', 'date', 'placed_at']) ?? '—'
  const items = asArray(d.items ?? d.order_items ?? d.line_items)
  const itemLines = items.slice(0, 6).map((i) => {
    const name = pickStr(i, ['name', 'product_name', 'title']) ?? 'Item'
    const qty = pickStr(i, ['quantity', 'qty']) ?? '1'
    return `  • ${name} × ${qty}`
  })

  const lines = [
    'Order Detail',
    `Order ID: #${id}`,
    `Customer: ${customer}`,
    `Total: ${total}`,
    `Payment status: ${payment}`,
    `Order status: ${status}`,
    `Created: ${created}`,
  ]
  if (itemLines.length) {
    lines.push('Items:', ...itemLines)
  }
  return lines.join('\n')
}

function formatCustomerOrders(data: unknown): string {
  const d = asRecord(data)
  const name = pickStr(d, ['customer_name', 'name']) ?? 'Customer'
  const totalOrders = d.total_orders ?? d.order_count ?? '—'
  const totalSpent = formatPkr(d.total_spent ?? d.total_amount ?? d.spent)
  const paidOrders = d.paid_orders ?? '—'
  const pendingOrders = d.pending_orders ?? '—'
  const latest = formatOrdersList('Latest orders', d.orders ?? d.latest_orders ?? d, '')

  return [
    'Customer Order History',
    `Customer: ${name}`,
    `Total orders: ${totalOrders}`,
    `Total spent: ${totalSpent}`,
    `Paid orders: ${paidOrders}`,
    `Pending orders: ${pendingOrders}`,
    '',
    latest || 'Latest orders\nNo orders found.',
  ].join('\n')
}

function formatAnalyticsCustomers(title: string, data: unknown): string {
  const rows = asArray(data)
  if (!rows.length) return `${title}\nNo records found.`
  const lines = rows.slice(0, 8).map((c) => {
    const name = pickStr(c, ['name', 'customer_name']) ?? 'Customer'
    const email = pickStr(c, ['email']) ?? ''
    const orderCount = c.order_count ?? c.total_orders ?? '—'
    const spent = formatPkr(c.total_spent ?? c.spent ?? c.total_amount)
    const latest = pickStr(c, ['latest_order_date', 'last_order_at', 'created_at']) ?? ''
    return `  • ${name}${email ? ` (${email})` : ''} — ${orderCount} orders, ${spent}${latest ? `, last: ${latest}` : ''}`
  })
  const more = rows.length > 8 ? `\n  …and ${rows.length - 8} more` : ''
  return `${title} (${rows.length})\n${lines.join('\n')}${more}`
}

function formatCustomerSalesCount(data: unknown): string {
  const rows = asArray(data)
  if (!rows.length) return 'Customer sales count\nNo records found.'
  const lines = rows.slice(0, 10).map((c) => {
    const name = pickStr(c, ['name', 'customer_name']) ?? 'Customer'
    const email = pickStr(c, ['email']) ?? ''
    const totalOrders = c.total_orders ?? c.order_count ?? '—'
    const paidOrders = c.paid_orders ?? '—'
    const pendingOrders = c.pending_orders ?? '—'
    const spent = formatPkr(c.total_spent ?? c.total_amount)
    return `  • ${name}${email ? ` (${email})` : ''} — orders: ${totalOrders}, paid: ${paidOrders}, pending: ${pendingOrders}, spent: ${spent}`
  })
  const more = rows.length > 10 ? `\n  …and ${rows.length - 10} more` : ''
  return `Customer Sales Count (${rows.length})\n${lines.join('\n')}${more}`
}

function formatCustomerOrderLookup(data: unknown): string {
  const r = data as CustomerOrderLookupResult
  if (r.step === 'not_found') {
    return emptyCustomerOrderLookup(data) ?? `No customer found for "${r.query}".`
  }
  if (r.step === 'multiple' && r.customers?.length) {
    const lines = r.customers.slice(0, 8).map((c) => {
      const id = pickStr(c, ['id']) ?? '—'
      const name = pickStr(c, ['name', 'customer_name']) ?? 'Customer'
      const email = pickStr(c, ['email']) ?? ''
      return `  • #${id} ${name}${email ? ` — ${email}` : ''}`
    })
    return [
      `Multiple customers match "${r.query}".`,
      'Please ask again with customer ID, e.g. Show customer 5 orders',
      '',
      ...lines,
    ].join('\n')
  }
  if (r.step === 'single') {
    const header = formatCustomerOrders({
      customer_name: pickStr(r.customer ?? {}, ['name', 'customer_name']),
      ...asRecord(r.orders),
      orders: asArray(r.orders),
    })
    const name = pickStr(r.customer ?? {}, ['name', 'customer_name']) ?? r.query
    return `Customer: ${name}\n\n${header}`
  }
  return 'Could not load customer orders.'
}

/** Local dev reply without calling Groq/OpenAI. */
export function createMockAiReply(intent: AgentIntent, apiData: unknown): string {
  const tag = '_(Mock AI — Laravel data only.)_\n\n'

  switch (intent) {
    case 'order_detail':
      return `${tag}${formatOrderDetail(apiData)}`

    case 'customer_order_lookup':
      return `${tag}${formatCustomerOrderLookup(apiData)}`

    case 'customer_search':
      return `${tag}${formatCustomersList(apiData, 'Matching customers')}`

    case 'customer_orders':
      return `${tag}${formatCustomerOrders(apiData)}`

    case 'orders_count_period':
      return `${tag}${formatPeriodBlock('Orders Count', apiData)}`

    case 'sales_period':
      return `${tag}${formatPeriodBlock('Sales Report', apiData)}`

    case 'repeated_customers':
      return `${tag}${formatAnalyticsCustomers('Repeated customers', apiData)}`

    case 'top_spending_customers':
      return `${tag}${formatAnalyticsCustomers('Top spending customers', apiData)}`

    case 'customer_sales_count':
      return `${tag}${formatCustomerSalesCount(apiData)}`

    case 'today_sales':
      return `${tag}${formatTodaySalesBlock(apiData)}`

    case 'pending_orders':
      return `${tag}${formatOrdersList('Pending orders', apiData, 'No pending orders.')}`

    case 'today_orders':
      return `${tag}${formatOrdersList("Today's orders", apiData, 'No orders today.')}`

    case 'low_stock_products':
      return `${tag}${formatProductsList('Low stock products', apiData, 'No low-stock products.')}`

    case 'product_search':
      return `${tag}${formatProductsList('Matching products', apiData, 'No products found.')}`

    case 'product_detail':
      return `${tag}${formatProductsList('Product detail', apiData, 'Product not found.')}`

    case 'product_sales_report':
      return `${tag}${formatProductsList('Best selling products', apiData, 'No product sales data.')}`

    case 'latest_customers':
      return `${tag}${formatCustomersList(apiData, 'Latest customers')}`

    case 'today_summary': {
      const bundle = apiData as TodaySummaryApiData
      return `${tag}**Today Store Summary**\n\n${[
        formatTodaySalesBlock(bundle.today_sales),
        '',
        formatOrdersList("Today's orders", bundle.today_orders, 'No orders today.'),
        '',
        formatOrdersList('Pending orders', bundle.pending_orders, 'No pending orders.'),
        '',
        formatProductsList('Low stock', bundle.low_stock_products, 'No alerts.'),
        '',
        formatCustomersList(bundle.latest_customers, 'Latest customers'),
      ].join('\n')}`
    }

    default:
      return `${tag}No mock formatter for this intent.`
  }
}
