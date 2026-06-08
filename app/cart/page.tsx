'use client'

import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { useCart } from '@/lib/cart-context'
import { formatProductPrice } from '@/lib/format-price'
import type { CartLineItem } from '@/lib/types'
import { Trash2, Plus, Minus } from 'lucide-react'

export default function CartPage() {
  const { items, loading, isHydrated, getTotalPrice, removeFromCart, updateQuantity } = useCart()
  const totalPrice = getTotalPrice()

  if (!isHydrated || loading) {
    return (
      <>
        <Navbar />
        <Loading />
        <Footer />
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <EmptyCart />
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="bg-background min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-foreground mb-8">Shopping Cart</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="hidden md:grid grid-cols-4 gap-4 p-4 bg-secondary border-b border-border text-foreground font-semibold text-sm">
                  <div className="col-span-2">Product</div>
                  <div>Quantity</div>
                  <div className="text-right">Total</div>
                </div>
                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <CartRow
                      key={item.id}
                      item={item}
                      onRemove={() => void removeFromCart(item.id)}
                      onUpdateQty={(qty) => void updateQuantity(item.id, qty)}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <Link href="/shop">
                  <button
                    type="button"
                    className="px-6 py-3 border border-primary text-primary rounded font-semibold hover:bg-secondary transition"
                  >
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </div>
            <CartSummary totalPrice={totalPrice} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

function Loading() {
  return (
    <div className="bg-background min-h-[40vh] flex items-center justify-center">
      <p className="text-muted-foreground">Loading cart…</p>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-12">Shopping Cart</h1>
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg mb-6">Your cart is empty</p>
          <Link href="/shop">
            <button
              type="button"
              className="px-6 py-3 bg-primary text-primary-foreground rounded font-semibold hover:opacity-90 transition"
            >
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function CartRow({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: CartLineItem
  onRemove: () => void
  onUpdateQty: (qty: number) => void
}) {
  const lineTotal = item.lineSubtotal ?? item.price * item.quantity
  return (
    <div className="p-4 flex flex-col sm:grid sm:grid-cols-4 gap-4">
      <div className="col-span-2 flex gap-4">
        <div className="relative w-24 h-24 flex-shrink-0 rounded bg-secondary">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-contain rounded p-1"
            sizes="96px"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/product/${item.slug}`}
            className="font-semibold text-foreground line-clamp-2 mb-2 hover:text-primary"
          >
            {item.title}
          </Link>
          {item.requiresSize && item.size ? (
            <p className="text-sm text-muted-foreground">
              Size: <span className="font-semibold">{item.size}</span>
            </p>
          ) : null}
          {item.fabric ? (
            <p className="text-sm text-muted-foreground">Fabric: {item.fabric}</p>
          ) : null}
          <p className="text-lg font-bold text-primary mt-2">
            {formatProductPrice(item.price, item.currency)}
          </p>
          <button
            type="button"
            onClick={onRemove}
            className="sm:hidden mt-3 flex items-center gap-2 text-destructive hover:underline text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onUpdateQty(item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="p-1 border border-border rounded hover:bg-secondary disabled:opacity-50 transition"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        <button
          type="button"
          onClick={() => onUpdateQty(item.quantity + 1)}
          className="p-1 border border-border rounded hover:bg-secondary transition"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="text-right">
        <p className="font-bold text-foreground">
          {formatProductPrice(lineTotal, item.currency)}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="hidden sm:flex mt-3 ml-auto items-center gap-2 text-destructive hover:underline text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Remove
        </button>
      </div>
    </div>
  )
}

function CartSummary({ totalPrice }: { totalPrice: number }) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-secondary rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>
        <SummaryLines totalPrice={totalPrice} />
        <div className="bg-primary/10 border border-primary/20 rounded p-3 mb-6">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Nationwide Delivery</span> with{' '}
            <span className="font-semibold">Cash on Delivery</span> available
          </p>
        </div>
        <Link href="/checkout">
          <button
            type="button"
            className="w-full py-3 bg-primary text-primary-foreground rounded font-semibold hover:opacity-90 transition mb-3"
          >
            Proceed to Checkout
          </button>
        </Link>
        <Link href="/shop">
          <button
            type="button"
            className="w-full py-3 bg-foreground/5 text-foreground rounded font-semibold hover:bg-foreground/10 transition"
          >
            Back to Shop
          </button>
        </Link>
      </div>
    </div>
  )
}

function SummaryLines({ totalPrice }: { totalPrice: number }) {
  return (
    <>
      <div className="flex justify-between mb-4 pb-4 border-b border-border">
        <span className="text-foreground">Subtotal:</span>
        <span className="font-semibold text-foreground">{formatProductPrice(totalPrice)}</span>
      </div>
      <div className="flex justify-between mb-4 pb-4 border-b border-border">
        <span className="text-foreground">Shipping:</span>
        <span className="font-semibold text-green-600">Free</span>
      </div>
      <div className="flex justify-between mb-6">
        <span className="text-lg font-bold text-foreground">Total:</span>
        <span className="text-2xl font-bold text-primary">{formatProductPrice(totalPrice)}</span>
      </div>
    </>
  )
}
