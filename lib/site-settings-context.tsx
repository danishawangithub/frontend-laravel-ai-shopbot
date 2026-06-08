'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { SiteBranding } from '@/lib/admin-api-types'
import { publicFetchHomeSettings } from '@/lib/public-api'

type SiteSettingsContextValue = {
  site: SiteBranding | null
  loading: boolean
  refresh: () => Promise<void>
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  site: null,
  loading: true,
  refresh: async () => {},
})

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteBranding | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const home = await publicFetchHomeSettings()
      setSite(home.site)
    } catch {
      setSite(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <SiteSettingsContext.Provider value={{ site, loading, refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
