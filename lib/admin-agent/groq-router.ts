import OpenAI from 'openai'
import type { AgentIntent, DetectedIntent } from '@/lib/admin-agent/types'
import { isMockMode } from '@/lib/admin-agent/config'
import { resolveAiProvider } from '@/lib/admin-agent/ai-provider'

const ROUTER_SYSTEM = `You are an intent router for an e-commerce admin agent.
Return JSON only. Do not answer the user.
Choose only from supported intents.
Extract email, phone, name as query, orderId, customerId, and period if present.
If unsupported, return intent "unsupported".

Supported intents:
customer_search, customer_order_lookup, order_detail, sales_period, orders_count_period,
low_stock_products, repeated_customers, top_spending_customers, customer_sales_count,
today_summary, today_sales, pending_orders, today_orders, latest_customers, unsupported

Supported backend tools:
/agent/orders/{id}
/agent/customers/search?query=
/agent/customers/{id}/orders
/agent/orders/count?period=
/agent/sales/period?period=
/agent/products/low-stock
/agent/customers/repeated
/agent/customers/top-spending
/agent/customers/sales-count
/agent/sales/today
/agent/orders/today
/agent/orders/pending
/agent/customers/latest

JSON shape:
{"intent":"...","query":"","orderId":"","customerId":"","period":""}`

type RouterJson = {
  intent?: string
  query?: string
  orderId?: string
  customerId?: string
  period?: string
}

const ROUTABLE: AgentIntent[] = [
  'customer_search',
  'customer_order_lookup',
  'customer_orders',
  'order_detail',
  'sales_period',
  'orders_count_period',
  'low_stock_products',
  'repeated_customers',
  'top_spending_customers',
  'customer_sales_count',
  'today_summary',
  'today_sales',
  'pending_orders',
  'today_orders',
  'latest_customers',
]

function mapRouterToDetected(json: RouterJson): DetectedIntent | null {
  const intent = json.intent?.trim() as AgentIntent | 'unsupported'
  if (!intent || intent === 'unsupported' || !ROUTABLE.includes(intent)) {
    return null
  }

  switch (intent) {
    case 'order_detail':
      if (!json.orderId) return null
      return {
        intent,
        endpoint: '/agent/orders/{id}',
        params: { id: json.orderId },
      }
    case 'customer_search':
      if (!json.query) return null
      return {
        intent,
        endpoint: '/agent/customers/search',
        params: { query: json.query },
      }
    case 'customer_order_lookup':
      if (!json.query) return null
      return {
        intent,
        params: { query: json.query },
      }
    case 'customer_orders':
      if (!json.customerId) return null
      return {
        intent: 'customer_orders',
        endpoint: '/agent/customers/{id}/orders',
        params: { id: json.customerId },
      }
    case 'orders_count_period':
      return {
        intent,
        endpoint: '/agent/orders/count',
        params: { period: json.period || 'today' },
      }
    case 'sales_period':
      return {
        intent,
        endpoint: '/agent/sales/period',
        params: { period: json.period || 'today' },
      }
    case 'today_summary':
      return {
        intent,
        endpoints: [
          '/agent/sales/today',
          '/agent/orders/today',
          '/agent/orders/pending',
          '/agent/products/low-stock',
          '/agent/customers/latest',
        ],
      }
    case 'today_sales':
      return { intent, endpoint: '/agent/sales/today' }
    case 'pending_orders':
      return { intent, endpoint: '/agent/orders/pending' }
    case 'today_orders':
      return { intent, endpoint: '/agent/orders/today' }
    case 'low_stock_products':
      return { intent, endpoint: '/agent/products/low-stock' }
    case 'latest_customers':
      return { intent, endpoint: '/agent/customers/latest' }
    case 'repeated_customers':
      return { intent, endpoint: '/agent/customers/repeated' }
    case 'top_spending_customers':
      return { intent, endpoint: '/agent/customers/top-spending' }
    case 'customer_sales_count':
      return { intent, endpoint: '/agent/customers/sales-count' }
    default:
      return null
  }
}

export function canUseGroqRouter(): boolean {
  if (isMockMode()) return false
  if (resolveAiProvider() !== 'groq') return false
  return Boolean(process.env.GROQ_API_KEY?.trim())
}

export async function detectIntentWithGroqRouter(
  message: string
): Promise<DetectedIntent | null> {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) return null

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  })

  const model = process.env.GROQ_MODEL?.trim() || 'llama-3.1-8b-instant'

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0,
      max_tokens: 200,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: ROUTER_SYSTEM },
        { role: 'user', content: message },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) return null

    const json = JSON.parse(raw) as RouterJson
    return mapRouterToDetected(json)
  } catch {
    return null
  }
}
