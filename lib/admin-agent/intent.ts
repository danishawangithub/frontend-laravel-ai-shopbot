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

export const BUSINESS_REPORTS_SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    label: 'City-wise Orders',
    question: 'Which city has most orders this month?',
    intent: 'orders_by_city_report',
  },
  {
    label: 'Status Summary',
    question: 'Show order status summary this month',
    intent: 'order_status_summary',
  },
  {
    label: 'Payment Methods',
    question: 'Show payment method summary this month',
    intent: 'payment_method_summary',
  },
  {
    label: 'Average Order Value',
    question: 'What is average order value this month?',
    intent: 'average_order_value',
  },
  {
    label: 'Sales Comparison',
    question: 'Compare this week and last week sales',
    intent: 'sales_comparison',
  },
  {
    label: 'Products Not Selling',
    question: 'Which products are not selling this month?',
    intent: 'products_not_selling',
  },
  {
    label: 'Restock Priority',
    question: 'Which products need restock urgently?',
    intent: 'low_stock_high_sales',
  },
]

/** @deprecated Use QUICK_SUGGESTED_QUESTIONS */
export const SUGGESTED_QUESTIONS = QUICK_SUGGESTED_QUESTIONS

/** @deprecated Use REPORTS_SUGGESTED_QUESTIONS */
export const ADVANCED_SUGGESTED_QUESTIONS = REPORTS_SUGGESTED_QUESTIONS
