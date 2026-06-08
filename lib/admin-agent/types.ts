export type AgentIntent =
  | 'pending_orders'
  | 'today_orders'
  | 'today_sales'
  | 'low_stock_products'
  | 'latest_customers'
  | 'today_summary'
  | 'order_detail'
  | 'customer_search'
  | 'customer_orders'
  | 'customer_order_lookup'
  | 'orders_count_period'
  | 'sales_period'
  | 'repeated_customers'
  | 'top_spending_customers'
  | 'customer_sales_count'
  | 'product_search'
  | 'product_detail'
  | 'product_sales_report'

export type DetectedIntent = {
  intent: AgentIntent
  endpoint?: string
  endpoints?: string[]
  params?: Record<string, string | number>
}

/** User-facing hint when required params are missing (not an HTTP error). */
export type IntentHintReply = {
  hint: string
}

export type AdminAgentIntent = AgentIntent | 'unknown'

export type LaravelAgentEnvelope<T = unknown> = {
  success: boolean
  message?: string
  data?: T
}

export type TodaySummaryApiData = {
  today_sales: unknown
  today_orders: unknown
  pending_orders: unknown
  low_stock_products: unknown
  latest_customers: unknown
}

export type AdminAgentApiSuccess = {
  reply: string
  intent: AdminAgentIntent
  success?: boolean
}

export type AdminAgentApiError = {
  error: string
}

export type AiProvider = 'groq' | 'openai'
