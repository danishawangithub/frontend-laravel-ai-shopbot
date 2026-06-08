/** Read payload from Laravel envelope or plain data object. */
export function extractLaravelData(apiData: unknown): unknown {
  if (apiData && typeof apiData === 'object' && 'data' in apiData) {
    const d = (apiData as { data?: unknown }).data
    if (d !== undefined) return d
  }
  return apiData
}

export function asCustomerRecords(data: unknown): Record<string, unknown>[] {
  const inner = extractLaravelData(data)
  if (Array.isArray(inner)) {
    return inner.filter((x) => x && typeof x === 'object') as Record<string, unknown>[]
  }
  if (inner && typeof inner === 'object') {
    const o = inner as Record<string, unknown>
    for (const key of ['customers', 'results', 'matches', 'list', 'data']) {
      if (Array.isArray(o[key])) {
        return o[key].filter((x) => x && typeof x === 'object') as Record<string, unknown>[]
      }
    }
  }
  return []
}
