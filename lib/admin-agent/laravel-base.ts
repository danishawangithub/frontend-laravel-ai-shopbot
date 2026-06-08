/** Site root, e.g. http://127.0.0.1:8000 (strips trailing /api from LARAVEL_API_URL). */
export function laravelRootUrl(): string {
  const raw =
    process.env.LARAVEL_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    ''
  const base = raw.replace(/\/$/, '')
  if (base.endsWith('/api')) return base.slice(0, -4)
  return base
}

/** Agent API prefix, e.g. http://127.0.0.1:8000/api */
export function laravelAgentApiBase(): string {
  const raw =
    process.env.LARAVEL_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    ''
  const base = raw.replace(/\/$/, '')
  if (base.endsWith('/api')) return base
  return `${base}/api`
}
