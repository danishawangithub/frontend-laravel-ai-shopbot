import { laravelAgentApiBase, laravelRootUrl } from '@/lib/admin-agent/laravel-base'
import { resolveAiProvider } from '@/lib/admin-agent/ai-provider'
import type { AiProvider } from '@/lib/admin-agent/types'

export function assertLaravelApiUrlConfigured(): void {
  const base = laravelAgentApiBase()
  if (!base || base === '/api') {
    throw new Error(
      'LARAVEL_API_URL is not configured. Set LARAVEL_API_URL in .env.local (e.g. http://localhost:8000/api).'
    )
  }
}

export function assertLaravelAuthAvailable(adminToken: string | null): void {
  const session = adminToken?.trim()
  const envToken = process.env.LARAVEL_API_TOKEN?.trim()
  if (!session && !envToken) {
    throw new Error(
      'Missing Laravel auth. Log in at /admin/login (admin_token) or set LARAVEL_API_TOKEN in .env.local.'
    )
  }
}

export function assertAiProviderConfigured(useMock: boolean): AiProvider | null {
  if (useMock) return null

  const provider = resolveAiProvider()
  if (provider === 'groq') {
    if (!process.env.GROQ_API_KEY?.trim()) {
      throw new Error(
        'GROQ_API_KEY is not configured. Add it to .env.local or set USE_MOCK_AI=true.'
      )
    }
    return 'groq'
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new Error(
      'OPENAI_API_KEY is not configured. Add it to .env.local or set USE_MOCK_AI=true.'
    )
  }
  return 'openai'
}

export function isMockMode(): boolean {
  return process.env.USE_MOCK_AI === 'true'
}

export { laravelRootUrl }
