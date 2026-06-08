/** Build a browser-ready URL for Laravel `/storage/...` paths or legacy full URLs. */
export function resolveImageUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return ''

  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')

  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    try {
      const u = new URL(pathOrUrl)
      if (u.pathname.startsWith('/storage/') && apiBase) {
        return `${apiBase}${u.pathname}`
      }
    } catch {
      return pathOrUrl
    }
    return pathOrUrl
  }

  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return apiBase ? `${apiBase}${path}` : path
}
