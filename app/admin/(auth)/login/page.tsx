'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/admin-auth-context'
import { Lock, AlertCircle } from 'lucide-react'
import { API_BASE } from '@/lib/api'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login, isAuthenticated, hasHydrated } = useAdminAuth()

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace('/admin/dashboard')
    }
  }, [hasHydrated, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      if (!API_BASE) {
        setError('Set NEXT_PUBLIC_API_URL in .env.local (e.g. http://127.0.0.1:8000).')
        return
      }
      const result = await login(email, password)
      if (result.ok) {
        router.push('/admin/dashboard')
      } else {
        setError(result.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-lg mb-4"
            style={{ backgroundColor: '#BB454E' }}
          >
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Elegance Admin</h1>
          <p className="text-muted-foreground">Sign in with your Laravel API account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-lg p-8 border border-border">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 dark:bg-red-950/30 dark:border-red-900">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground bg-background"
              disabled={isLoading}
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground bg-background"
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: '#BB454E' }}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          After <code className="text-[11px]">php artisan migrate --seed</code> on Laravel:{' '}
          <strong>admin@example.com</strong> / <strong>password</strong>
        </p>
      </div>
    </div>
  )
}
