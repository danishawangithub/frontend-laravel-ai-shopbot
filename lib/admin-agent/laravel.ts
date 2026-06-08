import { buildQueryString } from '@/lib/admin-agent/extract-params'
import { laravelAgentApiBase } from '@/lib/admin-agent/laravel-base'
import type {
  DetectedIntent,
  LaravelAgentEnvelope,
  TodaySummaryApiData,
} from '@/lib/admin-agent/types'

/** Prefer logged-in admin Sanctum token (localStorage `admin_token`). */
export function resolveLaravelToken(adminToken: string | null): string {
  const fromSession = adminToken?.trim()
  if (fromSession) return fromSession

  const fromEnv = process.env.LARAVEL_API_TOKEN?.trim()
  if (fromEnv) return fromEnv

  throw new Error(
    'No admin token available. Log in to the admin panel again, or set LARAVEL_API_TOKEN on the server.'
  )
}

function resolveEndpointPath(
  endpoint: string,
  params?: Record<string, string | number>
): string {
  let path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  if (params && path.includes('{id}')) {
    const id = params.id ?? params.customer_id
    if (id != null) {
      path = path.replace('{id}', encodeURIComponent(String(id)))
    }
  }

  const queryParams: Record<string, string | number> = {}
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (key === 'id' && endpoint.includes('{id}')) continue
      queryParams[key] = value
    }
  }

  return `${path}${buildQueryString(queryParams)}`
}

/** GET Laravel agent endpoint with optional path/query params. */
export async function callLaravelApi(
  endpoint: string,
  adminToken: string | null,
  params?: Record<string, string | number>
): Promise<unknown> {
  const base = laravelAgentApiBase()
  if (!base || base === '/api') {
    throw new Error(
      'LARAVEL_API_URL is not configured. Set LARAVEL_API_URL in .env.local (e.g. http://localhost:8000/api).'
    )
  }

  const url = `${base}${resolveEndpointPath(endpoint, params)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${resolveLaravelToken(adminToken)}`,
    },
    cache: 'no-store',
  })

  const text = await res.text()
  let json: LaravelAgentEnvelope = { success: false }
  if (text) {
    try {
      json = JSON.parse(text) as LaravelAgentEnvelope
    } catch {
      throw new Error('Laravel agent API returned invalid JSON.')
    }
  }

  if (!res.ok || !json.success) {
    throw new Error(json.message ?? `Laravel agent request failed (${res.status}).`)
  }

  return json.data ?? json
}

export async function fetchAgentDataForIntent(
  detected: DetectedIntent,
  adminToken: string | null
): Promise<unknown> {
  if (detected.intent === 'customer_order_lookup') {
    const query = String(detected.params?.query ?? '').trim()
    if (!query) {
      throw new Error('Customer lookup query is missing.')
    }
    const { fetchCustomerOrderLookup } = await import(
      '@/lib/admin-agent/customer-order-lookup'
    )
    return fetchCustomerOrderLookup(query, adminToken)
  }

  if (detected.intent === 'today_summary' && detected.endpoints?.length) {
    const results = await Promise.all(
      detected.endpoints.map((ep) => callLaravelApi(ep, adminToken))
    )
    const summary: TodaySummaryApiData = {
      today_sales: results[0],
      today_orders: results[1],
      pending_orders: results[2],
      low_stock_products: results[3],
      latest_customers: results[4],
    }
    return summary
  }

  if (!detected.endpoint) {
    throw new Error('No Laravel endpoint configured for this intent.')
  }

  return callLaravelApi(detected.endpoint, adminToken, detected.params)
}
