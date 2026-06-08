import type { Metadata } from 'next'
import { SITE_BRAND } from '@/lib/site-contact'

export function policyMetadata(title: string, description: string): Metadata {
  return {
    title: `${title} | ${SITE_BRAND}`,
    description,
  }
}
