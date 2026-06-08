/** Build a browser URL for Laravel `storage/` paths or absolute URLs. */
export function storagePublicUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }
  const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')
  if (!base) return pathOrUrl
  return `${base}/storage/${pathOrUrl.replace(/^\//, '').replace(/^storage\//, '')}`
}
