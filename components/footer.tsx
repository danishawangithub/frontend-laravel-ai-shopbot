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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <SiteLogo variant="footer" className="mb-4" />
            <p className="text-sm opacity-80">
              Premium Pakistani women&apos;s fashion with the finest quality and designs.
            </p>
            <p className="text-sm opacity-80 mt-4">Payment: Cash on Delivery Available</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about-us" className="hover:opacity-100 opacity-80 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:opacity-100 opacity-80 transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:opacity-100 opacity-80 transition">
                  Shop
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shipping-policy" className="hover:opacity-100 opacity-80 transition">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:opacity-100 opacity-80 transition">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/exchange-policy" className="hover:opacity-100 opacity-80 transition">
                  Exchange Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:opacity-100 opacity-80 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:opacity-100 opacity-80 transition">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Help</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/size-guide" className="hover:opacity-100 opacity-80 transition">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/fabric-care" className="hover:opacity-100 opacity-80 transition">
                  Fabric Care
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:opacity-100 opacity-80 transition">
                  FAQs
                </Link>
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
              <Link
                href="/contact-us"
                className="hover:opacity-100 opacity-80 transition"
                aria-label="Contact email"
              >
                <Mail className="w-5 h-5" />
              </Link>
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
