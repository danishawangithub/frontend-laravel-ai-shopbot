'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAdminAuth } from '@/lib/admin-auth-context'
import { adminFetchSiteSettings } from '@/lib/admin-services'
import type { SiteBranding } from '@/lib/admin-api-types'
import { SiteSettingsForm } from '@/components/admin/site-settings-form'
import { HeroSlidesManager } from '@/components/admin/hero-slides-manager'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const { getToken } = useAdminAuth()
  const [site, setSite] = useState<SiteBranding | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const token = getToken()
    if (!token) return
    setLoading(true)
    try {
      const settings = await adminFetchSiteSettings(token)
      setSite(settings)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load settings')
      setSite(null)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void load()
  }, [load])

  const token = getToken()

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">System settings</h1>
      <p className="text-muted-foreground mb-8">
        Site branding and homepage hero carousel.
      </p>

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-foreground mb-4">Site branding</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : token ? (
          <SiteSettingsForm token={token} initial={site} onSaved={setSite} />
        ) : null}
      </section>

      <section className="border-t border-border pt-10">
        {token ? <HeroSlidesManager token={token} /> : null}
      </section>
    </div>
  )
}
