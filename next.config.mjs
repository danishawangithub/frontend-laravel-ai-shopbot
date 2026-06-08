import fs from 'node:fs'
import path from 'node:path'

/**
 * Load env vars from lib/.env.local so NEXT_PUBLIC_* is available to the client
 * (Next.js only auto-loads .env files from the project root).
 */
function loadLibEnvLocal() {
  const file = path.join(process.cwd(), 'lib', '.env.local')
  if (!fs.existsSync(file)) return

  const text = fs.readFileSync(file, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (key) process.env[key] = value
  }
}

loadLibEnvLocal()

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
