'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSiteSettings } from '@/lib/site-settings-context'
import { cn } from '@/lib/utils'

type SiteLogoProps = {
  variant?: 'header' | 'footer'
  linkToHome?: boolean
  className?: string
}

function brandLabel(site: { logo_text?: string | null; site_name?: string | null } | null) {
  return site?.logo_text?.trim() || site?.site_name?.trim() || 'Elegance'
}

const sizeByVariant = {
  header: {
    width: 320,
    height: 80,
    image:
      'h-11 w-auto max-h-12 sm:h-12 sm:max-h-14 md:h-14 md:max-h-16 max-w-[200px] sm:max-w-[240px] md:max-w-[280px] object-contain object-left',
    text: 'text-2xl md:text-3xl font-bold text-white drop-shadow-lg',
  },
  footer: {
    width: 300,
    height: 72,
    image:
      'h-10 w-auto max-h-11 sm:h-11 sm:max-h-12 max-w-[180px] sm:max-w-[220px] md:max-w-[260px] object-contain object-left',
    text: 'text-xl font-bold text-primary-foreground',
  },
} as const

export default function SiteLogo({
  variant = 'header',
  linkToHome = true,
  className,
}: SiteLogoProps) {
  const { site } = useSiteSettings()
  const label = brandLabel(site)
  const logoUrl = site?.logo_url
  const sizes = sizeByVariant[variant]

  const content = logoUrl ? (
    <Image
      src={logoUrl}
      alt={label}
      width={sizes.width}
      height={sizes.height}
      priority={variant === 'header'}
      unoptimized
      className={sizes.image}
    />
  ) : (
    <span className={sizes.text}>{label}</span>
  )

  if (!linkToHome) {
    return <div className={cn('inline-flex items-center', className)}>{content}</div>
  }

  return (
    <Link
      href="/"
      className={cn('inline-flex items-center shrink-0 py-1', className)}
      aria-label={label}
    >
      {content}
    </Link>
  )
}

export function useBrandName() {
  const { site } = useSiteSettings()
  return brandLabel(site)
}
