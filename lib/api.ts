/** Base URL for Laravel API; set in `lib/.env.local` or root `.env.local` as NEXT_PUBLIC_API_URL. */
export const API_BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')
    : (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')

export type ApiError = {
  message?: string
  errors?: Record<string, string[]>
}

export class ApiRequestError extends Error {
  status: number
  body: ApiError

  constructor(status: number, body: ApiError) {
    super(body.message ?? `Request failed (${status})`)
    this.name = 'ApiRequestError'
    this.status = status
    this.body = body
  }
}

function buildApiUrl(path: string): string {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

async function handleApiResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  let data: unknown = {}
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      throw new ApiRequestError(res.status, {
        message: 'Invalid JSON response from server',
      })
    }
  }

  if (!res.ok) {
    const d = data as Record<string, unknown>
    const errors = d?.errors as Record<string, string[]> | undefined
    const message =
      typeof d?.message === 'string'
        ? d.message
        : typeof (d as { error?: string })?.error === 'string'
          ? (d as { error: string }).error
          : res.statusText

    const body: ApiError = errors ? { message, errors } : { message }
    throw new ApiRequestError(res.status, body)
  }

  return data as T
}

export async function api<T>(
  path: string,
  opts: RequestInit & {
    token?: string | null
    /** Guest cart / checkout — send after first `POST /api/v1/cart/items` response header. */
    guestToken?: string | null
  } = {}
): Promise<T> {
  const { token, guestToken, headers, ...rest } = opts

  const res = await fetch(buildApiUrl(path), {
    ...rest,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(guestToken ? { 'X-Guest-Token': guestToken } : {}),
      ...headers,
    },
    cache: 'no-store',
  })

  return handleApiResponse<T>(res)
}

/**
 * Multipart upload. Do not set Content-Type manually (browser sets boundary).
 * For Laravel updates with files, use POST + FormData `_method=PUT` — PHP ignores files on PUT.
 */
export async function apiMultipart<T>(
  path: string,
  formData: FormData,
  opts: { method?: string; token?: string | null } = {}
): Promise<T> {
  const { method = 'POST', token } = opts

  const res = await fetch(buildApiUrl(path), {
    method,
    body: formData,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  })

  return handleApiResponse<T>(res)
}

export function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}
