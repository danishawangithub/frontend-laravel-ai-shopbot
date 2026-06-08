'use client'

import Link from 'next/link'
import { Facebook, Instagram, Mail } from 'lucide-react'
import SiteLogo, { useBrandName } from '@/components/site-logo'
import { useSiteSettings } from '@/lib/site-settings-context'

export default function Footer() {
  const brandName = useBrandName()
  const { site } = useSiteSettings()
  const year = new Date().getFullYear()

  return (
    <footer id="contact" className="bg-foreground text-primary-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <SiteLogo variant="footer" className="mb-4" />
            <p className="text-sm opacity-80">
              Premium Pakistani women&apos;s fashion with the finest quality and designs.
            </p>
            <p className="text-sm opacity-80 mt-4">Payment: Cash on Delivery Available</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:opacity-100 opacity-80 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:opacity-100 opacity-80 transition">
                  Shop
                </Link>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 opacity-80 transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 opacity-80 transition">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:opacity-100 opacity-80 transition">
                  Return Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 opacity-80 transition">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 opacity-80 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 opacity-80 transition">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="hover:opacity-100 opacity-80 transition"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="hover:opacity-100 opacity-80 transition"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="hover:opacity-100 opacity-80 transition"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 mt-8">
          <p className="text-center text-sm opacity-80">
            © {year} {site?.site_name?.trim() || brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
