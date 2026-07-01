import { CUSTOMER_ASSISTANT_API_PATH } from '@/lib/customer-assistant/constants'
import type {
  CustomerAssistantApiError,
  CustomerAssistantApiSuccess,
} from '@/lib/customer-assistant/types'

function isCustomerAssistantSuccess(
  data: unknown
): data is CustomerAssistantApiSuccess {
  if (!data || typeof data !== 'object') return false
  const record = data as Record<string, unknown>
  if (record.success !== true) return false
  if (record.assistant !== 'customer') return false
  if (typeof record.reply !== 'string' || !record.reply.trim()) return false
  if (!Array.isArray(record.sources)) return false
  if ('intent' in record) return false
  return record.sources.every(
    (s) =>
      s &&
      typeof s === 'object' &&
      typeof (s as { title?: unknown }).title === 'string' &&
      typeof (s as { route?: unknown }).route === 'string'
  )
}

function isCustomerAssistantError(data: unknown): data is CustomerAssistantApiError {
  return Boolean(
    data &&
      typeof data === 'object' &&
      'error' in data &&
      typeof (data as CustomerAssistantApiError).error === 'string'
  )
}

export async function parseCustomerAssistantResponse(
  res: Response
): Promise<CustomerAssistantApiSuccess> {
  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new Error('Invalid response from customer assistant.')
  }

  if (isCustomerAssistantSuccess(data)) {
    return data
  }

  if (isCustomerAssistantError(data)) {
    throw new Error(data.error)
  }

  if (data && typeof data === 'object' && 'intent' in data) {
    throw new Error(
      'Received an admin agent response. Customer help must use /api/customer-assistant only.'
    )
  }

  throw new Error(!res.ok ? 'Request failed.' : 'Unexpected response from customer assistant.')
}

export async function postCustomerAssistantMessage(
  message: string
): Promise<CustomerAssistantApiSuccess> {
  if (process.env.NODE_ENV === 'development') {
    console.log('[customer-assistant] posting to /api/customer-assistant')
  }

  const res = await fetch(CUSTOMER_ASSISTANT_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
    credentials: 'same-origin',
  })

  return parseCustomerAssistantResponse(res)
}
