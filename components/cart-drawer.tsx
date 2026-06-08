'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatProductPrice } from '@/lib/format-price'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, loading, isHydrated, getTotalPrice, removeFromCart } = useCart()
  const totalPrice = getTotalPrice()

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} role="presentation" />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-card shadow-lg z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Shopping Cart</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded transition"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!isHydrated || loading ? (
            <p className="text-muted-foreground text-center py-8">Loading cart…</p>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-center">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 pb-4 border-b border-border">
                <div className="relative w-16 h-16 flex-shrink-0 rounded bg-secondary">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain rounded p-0.5"
                    sizes="64px"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                    {item.title}
                  </h3>
                  {item.requiresSize && item.size ? (
                    <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                  ) : null}
                  <p className="text-sm font-medium text-primary mt-1">
                    {formatProductPrice(item.price, item.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeFromCart(item.id)}
                  className="ml-2"
                  aria-label="Remove from cart"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-destructive transition" />
                </button>
              </div>
            ))
          )}
        </div>

        {isHydrated && !loading && items.length > 0 ? (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Subtotal:</span>
              <span className="text-lg font-bold text-primary">
                {formatProductPrice(totalPrice)}
              </span>
            </div>
            <Link href="/cart" onClick={onClose}>
              <button
                type="button"
                className="w-full py-2 bg-secondary text-foreground rounded font-medium hover:bg-secondary/80 transition"
              >
                View Cart
              </button>
            </Link>
            <Link href="/checkout" onClick={onClose}>
              <button
                type="button"
                className="w-full py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 transition"
              >
                Checkout
              </button>
            </Link>
          </div>
        ) : null}
      </div>
    </>
  )
}
