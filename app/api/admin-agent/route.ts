import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { summarizeWithAiProvider } from '@/lib/admin-agent/ai-provider'
import {
  assertLaravelApiUrlConfigured,
  assertLaravelAuthAvailable,
  isMockMode,
  laravelRootUrl,
} from '@/lib/admin-agent/config'
import { fetchAgentDataForIntent } from '@/lib/admin-agent/laravel'
import { createMockAiReply } from '@/lib/admin-agent/mock'
import { tryEmptyStateReply } from '@/lib/admin-agent/empty-states'
import type {
  AdminAgentApiError,
  AdminAgentApiSuccess,
  AgentIntent,
  DetectedIntent,
} from '@/lib/admin-agent/types'

export const runtime = 'nodejs'

const UNKNOWN_REPLY = `I can help with admin questions like:

• Show order 123
• Find customer noor@example.com
• Noor how many orders?
• Show customer 5 orders
• Products almost out of stock
• How many orders last month?
• Show last week sales
• Show repeated customers
• Show top spending customers
• Give me today store summary
• Find product Festive 3-Piece Lawn
• Show best selling products this month`

const INTENT_LABELS: Record<AgentIntent, string> = {
  pending_orders: 'Pending orders',
  today_orders: "Today's orders list",
  today_sales: "Today's sales summary",
  low_stock_products: 'Low stock products',
  latest_customers: 'Latest customers',
  today_summary: "Today's store summary",
  order_detail: 'Order detail',
  customer_search: 'Customer search',
  customer_orders: 'Customer order history',
  customer_order_lookup: 'Customer order lookup (search + orders)',
  orders_count_period: 'Orders count by period',
  sales_period: 'Sales by period',
  repeated_customers: 'Repeated customers',
  top_spending_customers: 'Top spending customers',
  customer_sales_count: 'Customer sales count report',
  product_search: 'Product search',
  product_detail: 'Product detail',
  product_sales_report: 'Product sales report',
}

const GROQ_NLP_ROUTER_SYSTEM_PROMPT = `You are an NLP intent router for a Laravel + Next.js Pakistani suits e-commerce admin chatbot.

Your job:
Understand the admin message and return JSON only.
Do not answer the user.
Do not call tools.
Do not invent data.
Classify the message into one supported intent and extract entities.

The admin may type:

* English
* broken English
* typo English
* Roman Urdu
* short commands

Supported intents:
order_detail
customer_search
customer_order_lookup
customer_orders
orders_count_period
sales_period
repeated_customers
top_spending_customers
customer_sales_count
today_summary
today_sales
pending_orders
today_orders
low_stock_products
latest_customers
product_search
product_detail
product_sales_report
unsupported

Routing rules:
- Product-related messages must NOT become customer_search.
- If message contains product/products/item/items/SKU/title/name with a search phrase, use product_search.
- If message says "best selling products", "products sold most", "top products", use product_sales_report.
- If message says "show product 5" or "product id 5", use product_detail.
- "Top customer" must be top_spending_customers (customer analytics).
- "Top product" or "best selling products" must be product_sales_report (not customer analytics).
- low_stock_products is for stock alerts only, not product search or sales ranking.

Entities:
{
"orderId": null,
"customerId": null,
"customerQuery": null,
"email": null,
"phone": null,
"period": null,
"productId": null,
"productQuery": null
}

Supported period values:
today
week
last_week
month
last_month

Return exactly this JSON shape:
{
"intent": "unsupported",
"confidence": 0.0,
"entities": {
"orderId": null,
"customerId": null,
"customerQuery": null,
"email": null,
"phone": null,
"period": null,
"productId": null,
"productQuery": null
}
}

Intent examples:

"show order 123" ->
{
"intent": "order_detail",
"confidence": 0.95,
"entities": {
"orderId": "123",
"customerId": null,
"customerQuery": null,
"email": null,
"phone": null,
"period": null
}
}

"noor how many orders" ->
{
"intent": "customer_order_lookup",
"confidence": 0.95,
"entities": {
"orderId": null,
"customerId": null,
"customerQuery": "noor",
"email": null,
"phone": null,
"period": null
}
}

"[noorfatima@gmail.com](mailto:noorfatima@gmail.com) how many orders" ->
{
"intent": "customer_order_lookup",
"confidence": 0.95,
"entities": {
"orderId": null,
"customerId": null,
"customerQuery": "[noorfatima@gmail.com](mailto:noorfatima@gmail.com)",
"email": "[noorfatima@gmail.com](mailto:noorfatima@gmail.com)",
"phone": null,
"period": null
}
}

"find customer noor" ->
{
"intent": "customer_search",
"confidence": 0.9,
"entities": {
"orderId": null,
"customerId": null,
"customerQuery": "noor",
"email": null,
"phone": null,
"period": null
}
}

"show customer 5 orders" ->
{
"intent": "customer_orders",
"confidence": 0.95,
"entities": {
"orderId": null,
"customerId": "5",
"customerQuery": null,
"email": null,
"phone": null,
"period": null
}
}

"how many orders last month" ->
{
"intent": "orders_count_period",
"confidence": 0.95,
"entities": {
"orderId": null,
"customerId": null,
"customerQuery": null,
"email": null,
"phone": null,
"period": "last_month"
}
}

"last month kitni sale hui" ->
{
"intent": "sales_period",
"confidence": 0.95,
"entities": {
"orderId": null,
"customerId": null,
"customerQuery": null,
"email": null,
"phone": null,
"period": "last_month"
}
}

"aaj kitne orders hain" ->
{
"intent": "orders_count_period",
"confidence": 0.9,
"entities": {
"orderId": null,
"customerId": null,
"customerQuery": null,
"email": null,
"phone": null,
"period": "today"
}
}

"top customer" ->
{
"intent": "top_spending_customers",
"confidence": 0.9,
"entities": {
"orderId": null,
"customerId": null,
"customerQuery": null,
"email": null,
"phone": null,
"period": null
}
}

"stock khatam hone wali products dikhao" ->
{
"intent": "low_stock_products",
"confidence": 0.9,
"entities": {
"orderId": null,
"customerId": null,
"customerQuery": null,
"email": null,
"phone": null,
"period": null
}
}

"show repeated customers" ->
{
"intent": "repeated_customers",
"confidence": 0.9,
"entities": {
"orderId": null,
"customerId": null,
"customerQuery": null,
"email": null,
"phone": null,
"period": null,
"productId": null,
"productQuery": null
}
}

"Product search by Festive 3-Piece Lawn" ->
{
"intent": "product_search",
"confidence": 0.95,
"entities": {
"orderId": null,
"customerId": null,
"customerQuery": null,
"email": null,
"phone": null,
"period": null,
"productId": null,
"productQuery": "Festive 3-Piece Lawn"
}
}

"Find product Festive 3-Piece Lawn" ->
{
"intent": "product_search",
"confidence": 0.95,
"entities": {
"productQuery": "Festive 3-Piece Lawn"
}
}

"Search product lawn" ->
{
"intent": "product_search",
"confidence": 0.9,
"entities": {
"productQuery": "lawn"
}
}

"Show product 5" ->
{
"intent": "product_detail",
"confidence": 0.95,
"entities": {
"productId": "5"
}
}

"Show best selling products this month" ->
{
"intent": "product_sales_report",
"confidence": 0.95,
"entities": {
"period": "month"
}
}

"Which products sold most last month?" ->
{
"intent": "product_sales_report",
"confidence": 0.95,
"entities": {
"period": "last_month"
}
}
`

type NlpRouterEntities = {
  orderId: string | null
  customerId: string | null
  customerQuery: string | null
  email: string | null
  phone: string | null
  period: string | null
  productId: string | null
  productQuery: string | null
}

type GroqNlpRouterOutput = {
  intent: AgentIntent | 'unsupported'
  confidence: number
  entities: NlpRouterEntities
}

const SUPPORTED_NLP_INTENTS: (AgentIntent | 'unsupported')[] = [
  'order_detail',
  'customer_search',
  'customer_order_lookup',
  'customer_orders',
  'orders_count_period',
  'sales_period',
  'repeated_customers',
  'top_spending_customers',
  'customer_sales_count',
  'today_summary',
  'today_sales',
  'pending_orders',
  'today_orders',
  'low_stock_products',
  'latest_customers',
  'product_search',
  'product_detail',
  'product_sales_report',
  'unsupported',
]

const PERIOD_VALUES = new Set(['today', 'week', 'last_week', 'month', 'last_month'])

function safeTrim(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  return s ? s : null
}

function normalizeMarkdownMailto(raw: string): string {
  const s = raw.trim()
  const m = s.match(/^\[([^\]]+)\]\(mailto:[^)]+\)$/i)
  if (m?.[1]) return m[1]

  const mailtoMatch = s.match(/mailto:([^)\s]+)/i)
  if (mailtoMatch?.[1]) return mailtoMatch[1]

  return s
}

function normalizeCustomerQueryValue(raw: string | null): string | null {
  if (!raw) return null
  const normalized = normalizeMarkdownMailto(raw)
  return normalized.trim() || null
}

function normalizeNlpEntities(raw: Partial<NlpRouterEntities> | undefined): NlpRouterEntities {
  return {
    orderId: safeTrim(raw?.orderId),
    customerId: safeTrim(raw?.customerId),
    customerQuery: safeTrim(raw?.customerQuery),
    email: safeTrim(raw?.email),
    phone: safeTrim(raw?.phone),
    period: safeTrim(raw?.period),
    productId: safeTrim(raw?.productId),
    productQuery: safeTrim(raw?.productQuery),
  }
}

function tryParseJsonObject(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function isGroqNlpRouterOutput(value: unknown): value is GroqNlpRouterOutput {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<GroqNlpRouterOutput>
  if (!SUPPORTED_NLP_INTENTS.includes(v.intent as AgentIntent | 'unsupported')) return false
  if (typeof v.confidence !== 'number') return false
  if (!v.entities || typeof v.entities !== 'object') return false
  return true
}

function buildEndpointDebugFromDetected(detected: DetectedIntent): string | null {
  if (detected.endpoints?.length) return detected.endpoints.join(' | ')
  if (detected.endpoint) {
    if (!detected.params?.period) return detected.endpoint
    return `${detected.endpoint}?period=${encodeURIComponent(String(detected.params.period))}`
  }
  return null
}

export function buildLaravelEndpointFromNlp(nlp: GroqNlpRouterOutput):
  | { kind: 'hint'; hint: string; endpoint: string | null }
  | { kind: 'detected'; detected: DetectedIntent; endpoint: string | null } {
  if (nlp.intent === 'unsupported') {
    return {
      kind: 'hint',
      hint: UNKNOWN_REPLY,
      endpoint: null,
    }
  }

  const entities = nlp.entities
  const emailOrPhone = entities.email || entities.phone
  const customerQuery = normalizeCustomerQueryValue(entities.customerQuery) ?? normalizeCustomerQueryValue(emailOrPhone)

  const requireEntity = (
    value: string | null,
    hint: string
  ): { value: string } | { error: string } => {
    if (!value) return { error: hint }
    return { value }
  }

  switch (nlp.intent) {
    case 'order_detail': {
      const req = requireEntity(
        safeTrim(entities.orderId),
        'Please provide an order ID. Example: Show order 123'
      )
      if ('error' in req) return { kind: 'hint', hint: req.error, endpoint: null }
      const id = req.value
      return {
        kind: 'detected',
        detected: { intent: 'order_detail', endpoint: '/agent/orders/{id}', params: { id } },
        endpoint: `/agent/orders/${encodeURIComponent(id)}`,
      }
    }
    case 'customer_search': {
      const req = requireEntity(
        customerQuery,
        'Please provide customer name, email, or phone. Example: Find customer noor@example.com'
      )
      if ('error' in req) return { kind: 'hint', hint: req.error, endpoint: null }
      const query = req.value
      return {
        kind: 'detected',
        detected: { intent: 'customer_search', endpoint: '/agent/customers/search', params: { query } },
        endpoint: `/agent/customers/search?query=${encodeURIComponent(query)}`,
      }
    }
    case 'customer_order_lookup': {
      const req = requireEntity(
        customerQuery,
        'Please provide customer name, email, or phone. Example: Noor how many orders?'
      )
      if ('error' in req) return { kind: 'hint', hint: req.error, endpoint: null }
      const query = req.value
      return {
        kind: 'detected',
        detected: { intent: 'customer_order_lookup', params: { query } },
        endpoint: `/agent/customers/search?query=${encodeURIComponent(query)} (then fetch orders)`,
      }
    }
    case 'customer_orders': {
      const req = requireEntity(
        safeTrim(entities.customerId),
        'Please provide customer ID. Example: Show customer 5 orders'
      )
      if ('error' in req) return { kind: 'hint', hint: req.error, endpoint: null }
      const id = req.value
      return {
        kind: 'detected',
        detected: { intent: 'customer_orders', endpoint: '/agent/customers/{id}/orders', params: { id } },
        endpoint: `/agent/customers/${encodeURIComponent(id)}/orders`,
      }
    }
    case 'orders_count_period': {
      const period = safeTrim(entities.period)
      if (!period || !PERIOD_VALUES.has(period)) {
        return {
          kind: 'hint',
          hint: 'Please ask a valid period. Examples: "How many orders today?" or "How many orders last month?"',
          endpoint: null,
        }
      }
      return {
        kind: 'detected',
        detected: { intent: 'orders_count_period', endpoint: '/agent/orders/count', params: { period } },
        endpoint: `/agent/orders/count?period=${encodeURIComponent(period)}`,
      }
    }
    case 'sales_period': {
      const period = safeTrim(entities.period)
      if (!period || !PERIOD_VALUES.has(period)) {
        return {
          kind: 'hint',
          hint: 'Please ask a valid period. Examples: "Last month sales" or "Last week revenue?"',
          endpoint: null,
        }
      }
      return {
        kind: 'detected',
        detected: { intent: 'sales_period', endpoint: '/agent/sales/period', params: { period } },
        endpoint: `/agent/sales/period?period=${encodeURIComponent(period)}`,
      }
    }
    case 'today_summary': {
      return {
        kind: 'detected',
        detected: {
          intent: 'today_summary',
          endpoints: [
            '/agent/sales/today',
            '/agent/orders/today',
            '/agent/orders/pending',
            '/agent/products/low-stock',
            '/agent/customers/latest',
          ],
        },
        endpoint: buildEndpointDebugFromDetected({
          intent: 'today_summary',
          endpoints: [
            '/agent/sales/today',
            '/agent/orders/today',
            '/agent/orders/pending',
            '/agent/products/low-stock',
            '/agent/customers/latest',
          ],
        }),
      }
    }
    case 'today_sales':
      return {
        kind: 'detected',
        detected: { intent: 'today_sales', endpoint: '/agent/sales/today' },
        endpoint: '/agent/sales/today',
      }
    case 'pending_orders':
      return {
        kind: 'detected',
        detected: { intent: 'pending_orders', endpoint: '/agent/orders/pending' },
        endpoint: '/agent/orders/pending',
      }
    case 'today_orders':
      return {
        kind: 'detected',
        detected: { intent: 'today_orders', endpoint: '/agent/orders/today' },
        endpoint: '/agent/orders/today',
      }
    case 'low_stock_products':
      return {
        kind: 'detected',
        detected: { intent: 'low_stock_products', endpoint: '/agent/products/low-stock' },
        endpoint: '/agent/products/low-stock',
      }
    case 'latest_customers':
      return {
        kind: 'detected',
        detected: { intent: 'latest_customers', endpoint: '/agent/customers/latest' },
        endpoint: '/agent/customers/latest',
      }
    case 'repeated_customers':
      return {
        kind: 'detected',
        detected: { intent: 'repeated_customers', endpoint: '/agent/customers/repeated' },
        endpoint: '/agent/customers/repeated',
      }
    case 'top_spending_customers':
      return {
        kind: 'detected',
        detected: { intent: 'top_spending_customers', endpoint: '/agent/customers/top-spending' },
        endpoint: '/agent/customers/top-spending',
      }
    case 'customer_sales_count':
      return {
        kind: 'detected',
        detected: { intent: 'customer_sales_count', endpoint: '/agent/customers/sales-count' },
        endpoint: '/agent/customers/sales-count',
      }
    case 'product_search': {
      const productQuery = safeTrim(entities.productQuery)
      const req = requireEntity(
        productQuery,
        'Please provide product name, SKU, or keyword. Example: Find product Festive 3-Piece Lawn'
      )
      if ('error' in req) return { kind: 'hint', hint: req.error, endpoint: null }
      const query = req.value
      return {
        kind: 'detected',
        detected: { intent: 'product_search', endpoint: '/agent/products/search', params: { query } },
        endpoint: `/agent/products/search?query=${encodeURIComponent(query)}`,
      }
    }
    case 'product_detail': {
      const req = requireEntity(
        safeTrim(entities.productId),
        'Please provide product ID. Example: Show product 5'
      )
      if ('error' in req) return { kind: 'hint', hint: req.error, endpoint: null }
      const id = req.value
      return {
        kind: 'detected',
        detected: { intent: 'product_detail', endpoint: '/agent/products/{id}', params: { id } },
        endpoint: `/agent/products/${encodeURIComponent(id)}`,
      }
    }
    case 'product_sales_report': {
      const period = safeTrim(entities.period)
      const resolvedPeriod = period && PERIOD_VALUES.has(period) ? period : 'month'
      return {
        kind: 'detected',
        detected: {
          intent: 'product_sales_report',
          endpoint: '/agent/products/sales',
          params: { period: resolvedPeriod },
        },
        endpoint: `/agent/products/sales?period=${encodeURIComponent(resolvedPeriod)}`,
      }
    }
    default:
      return { kind: 'hint', hint: UNKNOWN_REPLY, endpoint: null }
  }
}

export async function groqNlpRouter(message: string): Promise<GroqNlpRouterOutput> {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured. Add it to .env.local.')
  }

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  })

  const model = process.env.GROQ_MODEL?.trim() || 'llama-3.1-8b-instant'

  const completion = await client.chat.completions.create({
    model,
    temperature: 0,
    max_tokens: 350,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: GROQ_NLP_ROUTER_SYSTEM_PROMPT },
      { role: 'user', content: message },
    ],
  })

  const raw = completion.choices[0]?.message?.content?.trim()
  if (!raw) {
    throw new Error('Groq NLP router returned an empty response.')
  }

  const parsed = tryParseJsonObject(raw)
  if (!isGroqNlpRouterOutput(parsed)) {
    throw new Error('Groq NLP router returned invalid JSON.')
  }
  return {
    intent: parsed.intent,
    confidence: parsed.confidence,
    entities: normalizeNlpEntities(parsed.entities as Partial<NlpRouterEntities>),
  }
}

export async function summarizeWithGroq(
  message: string,
  nlp: GroqNlpRouterOutput,
  apiData: unknown
): Promise<string> {
  if (nlp.intent === 'unsupported') return UNKNOWN_REPLY
  const intent = nlp.intent as AgentIntent
  const intentLabel = INTENT_LABELS[intent]
  return summarizeWithAiProvider('groq', message, intentLabel, apiData)
}

function unauthorized(message: string) {
  return NextResponse.json({ error: message } satisfies AdminAgentApiError, {
    status: 401,
  })
}

function serverError(message: string) {
  return NextResponse.json({ error: message } satisfies AdminAgentApiError, {
    status: 500,
  })
}

function extractAdminToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7).trim()
  return token || null
}

async function verifyAdminToken(token: string): Promise<boolean> {
  const base = laravelRootUrl()
  if (!base) return true

  try {
    const res = await fetch(`${base}/api/v1/auth/me`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    return res.ok
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const adminToken = extractAdminToken(request)

  try {
    assertLaravelApiUrlConfigured()
    assertLaravelAuthAvailable(adminToken)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server configuration error.'
    return serverError(msg)
  }

  if (adminToken) {
    const allowed = await verifyAdminToken(adminToken)
    if (!allowed) {
      return unauthorized('Admin session expired or invalid. Please log in again.')
    }
  } else if (!process.env.LARAVEL_API_TOKEN?.trim()) {
    return unauthorized(
      'Missing admin token. Log in at /admin/login so admin_token is stored, then try again.'
    )
  }

  let body: { message?: string }
  try {
    body = (await request.json()) as { message?: string }
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' } satisfies AdminAgentApiError,
      { status: 400 }
    )
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) {
    return NextResponse.json(
      { error: 'Message is required.' } satisfies AdminAgentApiError,
      { status: 400 }
    )
  }

  if (message.length > 2000) {
    return NextResponse.json(
      { error: 'Message is too long (max 2000 characters).' } satisfies AdminAgentApiError,
      { status: 400 }
    )
  }

  const destructive =
    /\b(delete|remove|cancel|refund|update|edit|change|modify|ship|confirm)\b/i.test(
      message
    )
  if (
    destructive &&
    !/\b(show|list|get|view|how many|what|display|give|find|search|check)\b/i.test(
      message
    )
  ) {
    return NextResponse.json({
      reply:
        'This assistant is read-only. I can show orders, sales, stock, and customers—but I cannot change, cancel, or refund anything. Use the admin panel for updates.',
      intent: 'unknown',
    } satisfies AdminAgentApiSuccess)
  }

  try {
    const nlp = await groqNlpRouter(message)
    const built = buildLaravelEndpointFromNlp(nlp)

    if (built.kind === 'hint') {
      return NextResponse.json({
        reply: built.hint,
        intent: 'unknown',
      } satisfies AdminAgentApiSuccess)
    }

    const detectedResult = built.detected
    const endpointForDebug = built.endpoint

    const useMock = isMockMode()

    if (process.env.NODE_ENV === 'development') {
      console.log('[admin-agent] debug', {
        originalMessage: message,
        nlp,
        endpoint: endpointForDebug,
      })
    }

    if (!useMock && !process.env.GROQ_API_KEY?.trim()) {
      return serverError('GROQ_API_KEY is not configured. Add it to .env.local.')
    }

    const apiData = await fetchAgentDataForIntent(detectedResult, adminToken)

    const emptyReply = tryEmptyStateReply(detectedResult.intent, apiData)
    if (emptyReply) {
      const reply = useMock ? `_(Mock AI — Laravel data only.)_\n\n${emptyReply}` : emptyReply
      return NextResponse.json({
        ...(useMock ? { success: true } : {}),
        reply,
        intent: detectedResult.intent,
      } satisfies AdminAgentApiSuccess)
    }

    if (useMock) {
      const reply = createMockAiReply(detectedResult.intent, apiData)
      return NextResponse.json({
        success: true,
        reply,
        intent: detectedResult.intent,
      } satisfies AdminAgentApiSuccess)
    }

    const reply = await summarizeWithGroq(message, nlp, apiData)

    return NextResponse.json({
      reply,
      intent: detectedResult.intent,
    } satisfies AdminAgentApiSuccess)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Something went wrong.'
    return serverError(msg)
  }
}
