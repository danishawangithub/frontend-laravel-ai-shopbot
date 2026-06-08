'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import SiteLogo from '@/components/site-logo'
import { useCart } from '@/lib/cart-context'
import { useState } from 'react'

export default function Navbar() {
  const { getTotalItems } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const totalItems = getTotalItems()

  return (
    <nav className="sticky top-0 left-0 right-0 z-50" style={{ backgroundColor: '#BB454E' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          <SiteLogo variant="header" className="group-hover:opacity-95 transition" />

          <div className="hidden md:flex items-center gap-10">
            <Link
              href="/"
              className="text-white drop-shadow hover:text-secondary transition font-medium"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="text-white drop-shadow hover:text-secondary transition font-medium"
            >
              Shop
            </Link>
            <a
              href="#contact"
              className="text-white drop-shadow hover:text-secondary transition font-medium"
            >
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative group">
              <ShoppingCart className="w-6 h-6 text-white drop-shadow group-hover:text-secondary transition" />
              {totalItems > 0 ? (
                <span className="absolute -top-2 -right-2 bg-secondary text-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white drop-shadow hover:text-secondary transition"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen ? (
          <div className="md:hidden pb-4 space-y-2 bg-primary/95 rounded-b-lg">
            <Link
              href="/"
              className="block px-4 py-3 text-white hover:bg-primary/50 rounded font-medium transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="block px-4 py-3 text-white hover:bg-primary/50 rounded font-medium transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>
            <a
              href="#contact"
              className="block px-4 py-3 text-white hover:bg-primary/50 rounded font-medium transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
          </div>
        ) : null}
      </div>
    </nav>
  )
}
