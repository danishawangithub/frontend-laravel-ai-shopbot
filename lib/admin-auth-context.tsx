'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ApiRequestError, api } from '@/lib/api'
import {
  extractLoginToken,
  extractLoginUser,
  type LoginResponsePayload,
} from '@/lib/admin-api-types'
import { authFetchMe, authLogout } from '@/lib/admin-services'

/** Matches Laravel + guide: personal access token in localStorage. */
export const ADMIN_TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

const LEGACY_TOKEN_KEYS = ['admin_api_token'] as const
const LEGACY_USER_KEYS = ['admin_api_user'] as const

interface AdminAuthContextType {
  token: string | null
  isAuthenticated: boolean
  adminName: string | null
  adminEmail: string | null
  /** True after storage read + optional `GET /auth/me` when a token exists. */
  hasHydrated: boolean
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>
  logout: () => void
  getToken: () => string | null
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

function migrateLegacyAuth(): void {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(ADMIN_TOKEN_KEY)) return

  let token: string | null = null
  for (const k of LEGACY_TOKEN_KEYS) {
    token =
      localStorage.getItem(k) ??
      sessionStorage.getItem(k) ??
      token
  }
  if (!token) return

  localStorage.setItem(ADMIN_TOKEN_KEY, token)
  for (const k of LEGACY_TOKEN_KEYS) {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  }

  for (const k of LEGACY_USER_KEYS) {
    const u = localStorage.getItem(k) ?? sessionStorage.getItem(k)
    if (u) {
      localStorage.setItem(USER_KEY, u)
    }
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  }
}

function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

function readStoredUser(): { name?: string; email?: string } | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as { name?: string; email?: string }
  } catch {
    return null
  }
}

function clearClientSession(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [adminName, setAdminName] = useState<string | null>(null)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    migrateLegacyAuth()
    const stored = readStoredToken()
    const u = readStoredUser()

    if (!stored) {
      setToken(null)
      setAdminName(null)
      setAdminEmail(null)
      setHasHydrated(true)
      return
    }

    setToken(stored)
    setAdminName(u?.name ?? (u?.email ? String(u.email).split('@')[0] : null))
    setAdminEmail(u?.email ?? null)

    let cancelled = false
    void (async () => {
      try {
        const me = await authFetchMe(stored)
        if (cancelled) return
        if (me && typeof me === 'object') {
          localStorage.setItem(USER_KEY, JSON.stringify(me))
          const name =
            typeof me.name === 'string' && me.name
              ? me.name
              : u?.name ?? (u?.email ? String(u.email).split('@')[0] : null)
          const em = typeof me.email === 'string' ? me.email : u?.email ?? null
          setAdminName(name)
          setAdminEmail(em)
        }
        setToken(stored)
      } catch {
        if (cancelled) return
        clearClientSession()
        setToken(null)
        setAdminName(null)
        setAdminEmail(null)
      } finally {
        if (!cancelled) setHasHydrated(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<{ ok: true } | { ok: false; message: string }> => {
      try {
        const res = await api<LoginResponsePayload>('/api/v1/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
            device_name: 'next',
          }),
        })

        const t = extractLoginToken(res)
        if (!t) {
          return { ok: false, message: 'Login succeeded but no token was returned.' }
        }

        const user = extractLoginUser(res)
        localStorage.setItem(ADMIN_TOKEN_KEY, t)
        if (user) {
          localStorage.setItem(USER_KEY, JSON.stringify(user))
        } else {
          localStorage.removeItem(USER_KEY)
        }

        setToken(t)
        setAdminName(user?.name ?? email.split('@')[0])
        setAdminEmail(user?.email ?? email)
        return { ok: true }
      } catch (e: unknown) {
        if (e instanceof ApiRequestError) {
          return { ok: false, message: e.body.message ?? e.message }
        }
        return { ok: false, message: e instanceof Error ? e.message : 'Login failed' }
      }
    },
    []
  )

  const logout = useCallback(() => {
    const t = token ?? readStoredToken()
    void (async () => {
      if (t) {
        await authLogout(t)
      }
      clearClientSession()
      setToken(null)
      setAdminName(null)
      setAdminEmail(null)
    })()
  }, [token])

  const getToken = useCallback(() => token ?? readStoredToken(), [token])

  const value = useMemo<AdminAuthContextType>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      adminName,
      adminEmail,
      hasHydrated,
      login,
      logout,
      getToken,
    }),
    [token, adminName, adminEmail, hasHydrated, login, logout, getToken]
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
