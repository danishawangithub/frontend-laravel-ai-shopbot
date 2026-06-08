import { asCustomerRecords, extractLaravelData } from '@/lib/admin-agent/data-utils'
import { callLaravelApi } from '@/lib/admin-agent/laravel'

export type CustomerOrderLookupResult = {
  step: 'not_found' | 'multiple' | 'single'
  query: string
  customers?: Record<string, unknown>[]
  customer?: Record<string, unknown>
  orders?: unknown
  /** Laravel search payload when no customer matched (for empty-state hints). */
  meta?: Record<string, unknown>
}

function asSearchMeta(searchRaw: unknown): Record<string, unknown> {
  const inner = extractLaravelData(searchRaw)
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return inner as Record<string, unknown>
  }
  return {}
}

export async function fetchCustomerOrderLookup(
  query: string,
  adminToken: string | null
): Promise<CustomerOrderLookupResult> {
  const searchRaw = await callLaravelApi('/agent/customers/search', adminToken, { query })
  const customers = asCustomerRecords(searchRaw)
  const meta = asSearchMeta(searchRaw)

  if (!customers.length) {
    return { step: 'not_found', query, meta }
  }

  if (customers.length > 1) {
    return { step: 'multiple', query, customers, meta }
  }

  const customer = customers[0]
  const id = customer.id ?? customer.customer_id
  if (id == null) {
    return { step: 'not_found', query, meta }
  }

  const orders = await callLaravelApi('/agent/customers/{id}/orders', adminToken, {
    id: String(id),
  })

  return {
    step: 'single',
    query,
    customer,
    orders,
    meta,
  }
}
