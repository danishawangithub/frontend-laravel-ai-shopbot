import { normalizeText } from '@/lib/admin-agent/normalize-text'
import type { AgentIntent } from '@/lib/admin-agent/types'
import type { DetectedIntent } from '@/lib/admin-agent/types'

export type AgentPeriod = 'today' | 'week' | 'last_week' | 'month' | 'last_month'

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/

const PERIOD_WORDS = new Set([
  'today',
  'yesterday',
  'week',
  'month',
  'last',
  'previous',
  'current',
  'this',
])

const PERIOD_ONLY_PHRASES = new Set([
  'today',
  'yesterday',
  'week',
  'month',
  'last',
  'previous',
  'current',
  'this',
  'last week',
  'last month',
  'this week',
  'this month',
  'previous week',
  'previous month',
])

export function extractEmail(text: string): string | null {
  const m = text.match(EMAIL_RE)
  return m?.[0] ?? null
}

export function extractPhone(text: string): string | null {
  const patterns = [
    /(\+92[\s-]?3\d{2}[\s-]?\d{7})/,
    /(923\d{2}[\s-]?\d{7})/,
    /(03\d{2}[\s-]?\d{7})/,
    /\b(3\d{9})\b/,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m?.[1]) return m[1].replace(/[\s-]/g, '')
  }
  return null
}

export function extractOrderId(text: string): string | null {
  if (/\bcustomer\s+(?:id\s+)?\d+/i.test(text)) return null
  if (/\bbuyer\s+\d+/i.test(text)) return null
  if (/\bclient\s+\d+/i.test(text)) return null

  const patterns = [
    /\b(?:show|find|get|check|where\s+is|status\s+of)\s+order\s+#?(\d+)\b/i,
    /\border\s+id\s+(\d+)\b/i,
    /\border\s+#(\d+)\b/i,
    /\border\s+(\d+)\b/i,
    /\border\s+detail\s+(\d+)\b/i,
    /^order\s+#?(\d+)\b/i,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m?.[1]) return m[1]
  }
  return null
}

export function extractCustomerId(text: string): string | null {
  const patterns = [
    /\bcustomer\s+(?:id\s+)?(\d+)\s+orders?\b/i,
    /\borders?\s+of\s+customer\s+(?:id\s+)?(\d+)\b/i,
    /\bcustomer\s+(?:id\s+)?(\d+)\s+order\s+history\b/i,
    /\b(?:buyer|client)\s+(\d+)\s+orders?\b/i,
    /\bcustomer\s+(?:id\s+)?(\d+)\b/i,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m?.[1]) return m[1]
  }
  return null
}

/** Normalized text without trailing punctuation (?, ., !). */
export function stripPunctuationForPeriod(text: string): string {
  return normalizeText(text)
}

export function detectPeriod(text: string): AgentPeriod {
  const n = stripPunctuationForPeriod(text)
  if (/\b(last month|previous month)\b/.test(n)) return 'last_month'
  if (/\b(last week|previous week)\b/.test(n)) return 'last_week'
  if (/\b(this month|current month|monthly)\b/.test(n)) return 'month'
  if (/\b(this week|current week|weekly)\b/.test(n)) return 'week'
  if (/\b(current day|today|yesterday)\b/.test(n)) return 'today'
  return 'today'
}

export function isGenericPeriodReport(text: string): boolean {
  const n = normalizeText(text)
  if (extractEmail(text) || extractPhone(text)) return false

  return (
    /\b(today|yesterday|this week|last week|previous week|this month|last month|previous month)\b/.test(
      n
    ) ||
    (/\bmonth\b/.test(n) && !/\bcustomer\b/.test(n)) ||
    (/\bweek\b/.test(n) && !/\bcustomer\b/.test(n))
  )
}

export function isPeriodOnlyPhrase(text: string): boolean {
  const n = normalizeText(text).trim()
  if (!n) return true
  if (PERIOD_ONLY_PHRASES.has(n)) return true
  const words = n.split(/\s+/).filter(Boolean)
  if (!words.length) return true
  return words.every((w) => PERIOD_WORDS.has(w))
}

export function isPeriodOrderCountQuestion(text: string): boolean {
  const n = normalizeText(text)
  if (/\bpending\b/.test(n)) return false
  if (!/\borders?\b/.test(n)) return false

  if (extractEmail(text) || extractPhone(text)) return false
  if (/^\w+\s+how many orders?/i.test(text.trim())) return false
  if (/\bhow many orders does\s+\w+/.test(n)) return false

  const countSignal =
    /\bhow many orders?\b/.test(n) ||
    /\bhow many order\b/.test(n) ||
    /\border count\b/.test(n) ||
    /\borders count\b/.test(n) ||
    /\borders today count\b/.test(n) ||
    /\btotal orders?\b/.test(n) ||
    /\btotal order\b/.test(n) ||
    /\bcount orders?\b/.test(n)

  if (!countSignal) return false

  if (!isGenericPeriodReport(text)) return false

  if (
    /\b(show|list|give|display)\b/.test(n) &&
    /\btoday orders?\b/.test(n) &&
    !/\bhow many\b/.test(n)
  ) {
    return false
  }

  return true
}

export function isSalesPeriodQuestion(text: string): boolean {
  const n = normalizeText(text)
  const hasSalesWord = /\b(sales?|revenue|income|collection|earning)\b/.test(n)
  if (!hasSalesWord) return false

  if (
    /\b(last week|last month|this week|this month|weekly|monthly|previous week|previous month)\b/.test(
      n
    )
  ) {
    return true
  }

  if (/\bhow much sale\b/.test(n) && /\b(week|month|last)\b/.test(n)) {
    return true
  }

  if (/\b(total collection|collection)\b/.test(n) && /\b(last|month|week)\b/.test(n)) {
    return true
  }

  if (/\b(sales today|today sales|today revenue|today sale|today earning|today collection)\b/.test(n)) {
    return true
  }

  if (/\bwhat is\b/.test(n) && /\b(revenue|sales?)\b/.test(n) && /\b(week|month|last)\b/.test(n)) {
    return true
  }

  return false
}

export function buildPeriodIntent(
  intent: Extract<AgentIntent, 'orders_count_period' | 'sales_period'>,
  text: string
): DetectedIntent {
  const period = detectPeriod(text)
  const endpoint =
    intent === 'orders_count_period' ? '/agent/orders/count' : '/agent/sales/period'
  return { intent, endpoint, params: { period } }
}

export function buildQueryString(params: Record<string, string | number>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== '' && v != null)
  if (!entries.length) return ''
  const qs = new URLSearchParams()
  for (const [k, v] of entries) {
    qs.set(k, String(v))
  }
  const s = qs.toString()
  return s ? `?${s}` : ''
}

const CUSTOMER_SEARCH_STOP =
  /\b(find|search|show|get|by|email|phone|name|customer|customers|buyer|buyers|client|clients|the|a|an|me|please|for|with)\b/gi

const CUSTOMER_ORDER_STOP =
  /\b(how|many|much|order|orders|has|have|does|do|this|that|customer|customers|buyer|buyers|client|clients|show|find|search|of|history|total|count|sale|sales|meny|a|an|the|please)\b/gi

const PERIOD_ORDER_STOP =
  /\b(today|yesterday|week|month|last|previous|current|this)\b/gi

export function cleanCustomerSearchQuery(text: string): string {
  const email = extractEmail(text)
  if (email) return email
  const phone = extractPhone(text)
  if (phone) return phone

  let q = text.replace(EMAIL_RE, ' ')
  q = q.replace(/\+?92?3\d{9}/g, ' ')
  q = q.replace(CUSTOMER_SEARCH_STOP, ' ')
  q = q.replace(/\s+/g, ' ').trim()
  return q
}

export function cleanCustomerOrderQuery(text: string): string {
  const email = extractEmail(text)
  if (email) return email
  const phone = extractPhone(text)
  if (phone) return phone

  let q = text.replace(EMAIL_RE, ' ')
  q = q.replace(/\+?92?3\d{9}/g, ' ')
  q = q.replace(CUSTOMER_ORDER_STOP, ' ')
  q = q.replace(PERIOD_ORDER_STOP, ' ')
  q = q.replace(/[^\w\s@.+]/g, ' ')
  q = q.replace(/\s+/g, ' ').trim()
  return q
}

export function cleanProductSearchQuery(text: string): string {
  let q = text.replace(PRODUCT_SEARCH_STOP, ' ')
  return q.replace(/\s+/g, ' ').trim()
}

const PRODUCT_SEARCH_STOP =
  /\b(find|search|show|get|all|product|products|item|items|stock|sku|name|by|have|which|need|near|to|the|a|an)\b/gi

export function extractSearchQuery(message: string): string | null {
  const q = cleanCustomerSearchQuery(message)
  return q.length >= 2 ? q : null
}

export function extractCustomerOrderLookupQuery(message: string): string | null {
  const q = cleanCustomerOrderQuery(message)
  if (!q || q.length < 2) return null
  if (isPeriodOnlyPhrase(q)) return null
  return q
}

export function isCountQuestion(text: string): boolean {
  const n = normalizeText(text)
  return /\b(how many|how much|count|number of|total orders)\b/.test(n)
}

export function isOrderHistoryQuestion(text: string): boolean {
  const n = normalizeText(text)
  return (
    /\borders?\b/.test(n) ||
    /\border history\b/.test(n) ||
    (isCountQuestion(n) && /\borders?\b/.test(n))
  )
}

/** True when message looks like "Name how many orders" (not a period report). */
export function hasNamedCustomerOrderPattern(text: string, original: string): boolean {
  if (extractEmail(original) || extractPhone(original)) return true
  if (/\bhow many orders does\s+\w+/i.test(original)) return true
  if (/\borders of\s+\w+/i.test(original)) return true
  if (/^\w+\s+how many orders?/i.test(original.trim())) return true
  if (/^\w+\s+orders?/i.test(original.trim())) return true

  const q = extractCustomerOrderLookupQuery(original)
  if (!q || q.length < 2) return false
  return /\borders?\b/.test(normalizeText(original))
}
