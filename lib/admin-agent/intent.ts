import type { AgentIntent } from '@/lib/admin-agent/types'

export type SuggestedQuestion = {
  label: string
  question: string
  intent: AgentIntent
}

export const QUICK_SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { label: 'Today Summary', question: 'Give me today store summary', intent: 'today_summary' },
  {
    label: 'Low Stock Products',
    question: 'Show me low stock products',
    intent: 'low_stock_products',
  },
  { label: 'Repeated Customers', question: 'Show repeated customers', intent: 'repeated_customers' },
]

export const SEARCH_SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { label: 'Show order 123', question: 'Show order 123', intent: 'order_detail' },
  {
    label: 'Find customer email',
    question: 'Find customer noor@example.com',
    intent: 'customer_search',
  },
  {
    label: 'Noor How Many Orders',
    question: 'Noor how many orders',
    intent: 'customer_order_lookup',
  },
]

export const PRODUCT_SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    label: 'Find Product',
    question: 'Find product Festive 3-Piece Lawn',
    intent: 'product_search',
  },
  {
    label: 'Best Selling Products',
    question: 'Show best selling products this month',
    intent: 'product_sales_report',
  },
  {
    label: 'Search Lawn Products',
    question: 'Search product lawn',
    intent: 'product_search',
  },
]

export const REPORTS_SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    label: 'Last Month Sales',
    question: 'Show last month sales',
    intent: 'sales_period',
  },
  {
    label: 'Top Customer',
    question: 'Top customer',
    intent: 'top_spending_customers',
  },
]

/** @deprecated Use QUICK_SUGGESTED_QUESTIONS */
export const SUGGESTED_QUESTIONS = QUICK_SUGGESTED_QUESTIONS

/** @deprecated Use REPORTS_SUGGESTED_QUESTIONS */
export const ADVANCED_SUGGESTED_QUESTIONS = REPORTS_SUGGESTED_QUESTIONS
