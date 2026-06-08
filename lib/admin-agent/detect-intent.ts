import {
  buildPeriodIntent,
  cleanCustomerSearchQuery,
  extractCustomerId,
  extractCustomerOrderLookupQuery,
  extractEmail,
  extractOrderId,
  extractPhone,
  extractSearchQuery,
  hasNamedCustomerOrderPattern,
  isCountQuestion,
  isGenericPeriodReport,
  isPeriodOrderCountQuestion,
  isSalesPeriodQuestion,
} from '@/lib/admin-agent/extract-params'
import { normalizeText } from '@/lib/admin-agent/normalize-text'
import type { DetectedIntent, IntentHintReply } from '@/lib/admin-agent/types'

function hasAny(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => text.includes(phrase))
}

/** Rank / spend phrases for top-spending intent (checked before customer search/lookup). */
export function isTopSpendingCustomerQuestion(text: string): boolean {
  if (
    hasAny(text, [
      'top spending customer',
      'top spending customers',
      'highest spending customer',
      'highest spending customers',
      'most spending customer',
      'most spending customers',
      'highest spender',
      'highest spenders',
      'most spender',
      'most spenders',
      'customer spent most',
      'customers spent most',
      'customer spend most',
      'customers spend most',
      'who spent most',
      'who spent most money',
      'who is spending most',
      'most valuable customer',
      'most valuable customers',
      'high value customer',
      'high value customers',
      'biggest buyer',
      'biggest buyers',
      'biggest customer',
      'biggest customers',
      'best customer',
      'best customers',
      'vip customer',
      'vip customers',
      'loyal customer by spending',
      'loyal customers by spending',
      'customer with highest total spend',
      'customers with highest total spend',
      'customer with most purchase amount',
      'customers with most purchase amount',
      'customer highest amount',
      'customers highest amount',
      'customer most money',
      'customers most money',
      'top customer',
      'top customers',
      'top spending',
      'highest spending',
      'highest total spend',
      'most purchase amount',
      'spent the most',
      'spent most',
      'spending the most',
      'spending most',
      'customers spent the most',
      'customer spent the most',
      'which customers spent the most',
      'which customer spent the most',
      'who spent the most',
      'show highest spending',
      'show biggest buyer',
      'show biggest buyers',
      'show best customers',
      'show vip customers',
      'show loyal customers by spending',
      'show most valuable customers',
      'show high value customers',
      'show customers with highest total spend',
      'show customer with highest total spend',
      'show customers with most purchase amount',
      'show customer with most purchase amount',
      'expensive customer',
      'expensive customers',
    ])
  ) {
    return true
  }

  const rankSpendPatterns = [
    /\b(which|who)\s+(customer|customers|buyer|buyers)\s+(spent|spend|spending)\b/,
    /\b(customer|customers|buyer|buyers)\s+(spent|spend|spending)\s+(the\s+)?most\b/,
    /\b(who|which)\s+spent\s+(the\s+)?most\b/,
    /\b(who|which)\s+is\s+spending\s+most\b/,
    /\b(spent|spend|spending)\s+(the\s+)?most\s+(money|amount)?\b/,
    /\b(top|best|biggest|highest|high value|most valuable|vip)\s+(customer|customers|buyer|buyers|spender|spenders)\b/,
    /\b(customer|customers|buyer|buyers)\s+with\s+(highest|most)\s+(total\s+)?(spend|spending|purchase|amount|money)\b/,
    /\b(customer|customers)\s+with\s+most\s+purchase\b/,
    /\b(customer|customers)\s+(highest|most)\s+(total\s+)?(spend|spending|amount|money)\b/,
    /\b(customer|customers)\s+most\s+(money|purchase|amount)\b/,
    /\b(highest|most)\s+spending\s+(customer|customers)\b/,
    /\b(top|highest|most)\s+spending\b/,
    /\b(loyal\s+)?customers?\s+by\s+spending\b/,
    /\bexpensive\s+(customer|customers)\b/,
  ]

  return rankSpendPatterns.some((pattern) => pattern.test(text))
}

function matchesOrderDetail(text: string, original: string): boolean {
  if (extractOrderId(original)) return true
  return (
    /\b(show|find|get|check|where is|status of)\s+order\b/.test(text) ||
    /\border detail\b/.test(text) ||
    /^order\s+\d+/.test(text)
  )
}

function matchesCustomerOrderLookup(text: string, original: string): boolean {
  if (extractCustomerId(original)) return false
  if (isPeriodOrderCountQuestion(text)) return false
  if (isSalesPeriodQuestion(text)) return false

  if (
    isGenericPeriodReport(text) &&
    isCountQuestion(text) &&
    !extractEmail(original) &&
    !extractPhone(original)
  ) {
    return false
  }

  if (!/\borders?\b/.test(text) && !extractEmail(original) && !extractPhone(original)) {
    return false
  }

  if (!hasNamedCustomerOrderPattern(text, original)) return false

  const query =
    extractEmail(original) ||
    extractPhone(original) ||
    extractCustomerOrderLookupQuery(original)

  return Boolean(query && query.length >= 2)
}

function matchesCustomerOrders(text: string, original: string): boolean {
  const id = extractCustomerId(original)
  if (!id) return false
  return (
    /\borders?\b/.test(text) ||
    /\border history\b/.test(text) ||
    isCountQuestion(text)
  )
}

function matchesCustomerSearch(text: string, original: string): boolean {
  if (matchesCustomerOrderLookup(text, original)) return false
  if (matchesCustomerOrders(text, original)) return false
  if (isPeriodOrderCountQuestion(text)) return false
  if (isSalesPeriodQuestion(text)) return false

  const email = extractEmail(original)
  const phone = extractPhone(original)
  if (email || phone) {
    return (
      /\b(find|search|show|get|customer|buyer|client)\b/.test(text) ||
      /\bcustomer\b/.test(text)
    )
  }

  if (
    /\b(find|search)\s+(customer|buyer|client)\b/.test(text) ||
    /\b(customer|buyer|client)\s+(email|phone|name)\b/.test(text) ||
    /\bcustomer\s+by\b/.test(text)
  ) {
    return true
  }

  if (/^(find|search)\s+\S+/.test(text) && !/\borders?\b/.test(text)) {
    return true
  }

  if (/\b(find|search)\s+\w+/.test(text) && !/\borders?\b/.test(text)) {
    const q = cleanCustomerSearchQuery(original)
    return q.length >= 2
  }

  return false
}

function matchesLowStock(text: string): boolean {
  return hasAny(text, [
    'low stock',
    'stock low',
    'stock near to end',
    'stock near end',
    'near to end stock',
    'near end stock',
    'stock almost finished',
    'stock finishing',
    'stock ending',
    'almost out of stock',
    'products almost out of stock',
    'items almost out of stock',
    'products need restock',
    'need restock',
    'restock products',
    'restock',
    'inventory alert',
    'low inventory',
    'product have stock near to end',
    'get all product have stock near to end',
    'stock ending products',
    'which products need restock',
    'running low',
    'less quantity',
  ])
}

export function detectIntent(message: string): DetectedIntent | IntentHintReply | null {
  const original = message.trim()
  const text = normalizeText(original)

  // 1. order_detail
  if (matchesOrderDetail(text, original)) {
    const id = extractOrderId(original)
    if (!id) {
      return { hint: 'Please provide an order ID. Example: Show order 123' }
    }
    return {
      intent: 'order_detail',
      endpoint: '/agent/orders/{id}',
      params: { id },
    }
  }

  // 2. sales_period
  if (isSalesPeriodQuestion(text)) {
    return buildPeriodIntent('sales_period', text)
  }

  // 3. orders_count_period
  if (isPeriodOrderCountQuestion(text)) {
    return buildPeriodIntent('orders_count_period', text)
  }

  // 4. top_spending_customers (before customer lookup/search — avoids "top customer" name search)
  if (isTopSpendingCustomerQuestion(text)) {
    return { intent: 'top_spending_customers', endpoint: '/agent/customers/top-spending' }
  }

  // 5. customer_order_lookup
  if (matchesCustomerOrderLookup(text, original)) {
    const query =
      extractEmail(original) ||
      extractPhone(original) ||
      extractCustomerOrderLookupQuery(original)
    if (!query) {
      return {
        hint: 'Please provide a customer name, email, or phone. Example: Noor how many orders?',
      }
    }
    return {
      intent: 'customer_order_lookup',
      params: { query },
    }
  }

  // 6. customer_orders (numeric ID)
  if (matchesCustomerOrders(text, original)) {
    const id = extractCustomerId(original)
    if (!id) {
      return { hint: 'Please provide customer ID. Example: Show customer 5 orders' }
    }
    return {
      intent: 'customer_orders',
      endpoint: '/agent/customers/{id}/orders',
      params: { id },
    }
  }

  // 7. customer_search
  if (matchesCustomerSearch(text, original)) {
    const query = extractSearchQuery(original) || cleanCustomerSearchQuery(original)
    if (!query || query.length < 2) {
      return {
        hint: 'Please provide customer email, phone, name, or ID.',
      }
    }
    return {
      intent: 'customer_search',
      endpoint: '/agent/customers/search',
      params: { query },
    }
  }

  // 8. repeated_customers
  if (
    hasAny(text, [
      'repeated customer',
      'repeat customer',
      'returning customer',
      'ordered more than once',
      'customers ordered more than once',
      'multiple orders',
      'customers with multiple',
    ])
  ) {
    return { intent: 'repeated_customers', endpoint: '/agent/customers/repeated' }
  }

  // 9. customer_sales_count
  if (
    hasAny(text, [
      'sale count of each customer',
      'order count of each customer',
      'customer wise sales',
      'customer wise orders',
      'customer wise order',
      'how many orders each customer',
      'customer sales report',
      'customer order report',
      'sales count of each',
    ])
  ) {
    return { intent: 'customer_sales_count', endpoint: '/agent/customers/sales-count' }
  }

  // 10. today_summary
  if (
    hasAny(text, [
      'today summary',
      'store summary',
      'today store summary',
      'dashboard summary',
      'business report today',
      'business summary',
      'today report',
      'daily report',
      'today activity',
      'how is my store today',
      'quick summary',
    ])
  ) {
    return {
      intent: 'today_summary',
      endpoints: [
        '/agent/sales/today',
        '/agent/orders/today',
        '/agent/orders/pending',
        '/agent/products/low-stock',
        '/agent/customers/latest',
      ],
    }
  }

  // 11. today_sales (legacy dedicated endpoint — only if not caught by sales_period)
  if (
    hasAny(text, [
      'today sales',
      'today sale',
      'sales today',
      'today revenue',
      'today earning',
      'today income',
      'today collection',
      'how much sale today',
      'show me today sales',
      'show today sales',
    ]) &&
    !/\b(week|month|last week|last month)\b/.test(text)
  ) {
    return { intent: 'today_sales', endpoint: '/agent/sales/today' }
  }

  // 12. pending_orders
  if (
    hasAny(text, [
      'pending order',
      'pending orders',
      'orders pending',
      'show pending',
      'waiting orders',
      'any pending orders',
      'how many orders are pending',
      'how many pending',
    ])
  ) {
    return { intent: 'pending_orders', endpoint: '/agent/orders/pending' }
  }

  // 13. today_orders (list)
  if (
    hasAny(text, [
      'today order',
      'today orders',
      'orders today',
      'orders placed today',
      'new orders today',
      'show today orders',
      'list today orders',
    ]) &&
    !isCountQuestion(text)
  ) {
    return { intent: 'today_orders', endpoint: '/agent/orders/today' }
  }

  // 14. low_stock_products
  if (matchesLowStock(text)) {
    return { intent: 'low_stock_products', endpoint: '/agent/products/low-stock' }
  }

  // 15. latest_customers
  if (
    hasAny(text, [
      'latest customer',
      'latest customers',
      'new customer',
      'new customers',
      'recent customer',
      'recent customers',
      'who registered recently',
      'show latest customers',
    ])
  ) {
    return { intent: 'latest_customers', endpoint: '/agent/customers/latest' }
  }

  return null
}

export function isIntentHint(value: unknown): value is IntentHintReply {
  return Boolean(value && typeof value === 'object' && 'hint' in value)
}
