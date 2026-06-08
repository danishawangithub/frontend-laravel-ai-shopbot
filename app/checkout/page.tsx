'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import CheckoutForm from '@/components/checkout-form'
import { useCart } from '@/lib/cart-context'
import { CheckoutData, CartLineItem } from '@/lib/types'
import { getGuestToken, publicCheckout } from '@/lib/public-api'
import { formatProductPrice } from '@/lib/format-price'
import { ApiRequestError } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

const LAST_ORDER_KEY = 'lastOrder'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, loading, isHydrated, getTotalPrice, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const totalPrice = getTotalPrice()

  if (!isHydrated || loading) {
    return (
      <>
        <Navbar />
        <div className="bg-background min-h-[40vh] flex items-center justify-center">
          <p className="text-muted-foreground">Loading cart…</p>
        </div>
        <Footer />
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="bg-background min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <EmptyCheckout />
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const handleCheckoutSubmit = async (data: CheckoutData) => {
    const guestToken = getGuestToken()
    if (!guestToken) {
      toast.error('Your cart session expired. Please add items again.')
      router.push('/cart')
      return
    }

    setIsLoading(true)
    try {
      const order = await publicCheckout({
        guest_token: guestToken,
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        address_line1: data.address.trim(),
        city: data.city.trim(),
        payment_method: 'cod',
      })

      const orderDetails = {
        orderNumber: order.order_number,
        paymentLabel: order.payment_label ?? 'Cash on Delivery',
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        city: data.city,
        address: data.address,
        items: items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          currency: item.currency,
          size: item.requiresSize ? item.size : undefined,
        })),
        totalAmount: totalPrice,
        orderDate: order.created_at
          ? new Date(order.created_at).toLocaleDateString('en-PK')
          : new Date().toLocaleDateString('en-PK'),
      }

      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(orderDetails))
      clearCart()
      router.push(`/thank-you?order_number=${encodeURIComponent(order.order_number)}`)
    } catch (e) {
      const msg =
        e instanceof ApiRequestError
          ? e.body.message ?? e.message
          : e instanceof Error
            ? e.message
            : 'Could not place order'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="bg-background min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-foreground mb-8">Checkout</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg p-6 border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Delivery Information</h2>
                <CheckoutForm onSubmit={handleCheckoutSubmit} isLoading={isLoading} />
              </div>
            </div>
            <CheckoutSummary items={items} totalPrice={totalPrice} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

function EmptyCheckout() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
      <p className="text-muted-foreground mb-6">
        Add items to your cart before proceeding to checkout.
      </p>
      <Link href="/shop">
        <button
          type="button"
          className="px-6 py-3 bg-primary text-primary-foreground rounded font-semibold hover:opacity-90 transition"
        >
          Continue Shopping
        </button>
      </Link>
    </div>
  )
}

function CheckoutSummary({
  items,
  totalPrice,
}: {
  items: ReturnType<typeof useCart>['items']
  totalPrice: number
}) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-secondary rounded-lg border border-border overflow-hidden sticky top-24">
        <div className="bg-foreground/5 p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Order Summary</h2>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto border-b border-border">
          {items.map((item) => (
            <SummaryItem key={item.id} item={item} />
          ))}
        </div>
        <div className="p-4 space-y-3">
          <Totals totalPrice={totalPrice} itemCount={items.length} />
        </div>
      </div>
      <div className="mt-4">
        <Link href="/cart">
          <button
            type="button"
            className="w-full py-2 border border-border rounded font-medium text-foreground hover:bg-secondary transition"
          >
            Edit Cart
          </button>
        </Link>
      </div>
    </div>
  )
}

function SummaryItem({ item }: { item: CartLineItem }) {
  return (
    <div className="flex gap-3 mb-4 pb-4 border-b border-border last:border-b-0 last:mb-0 last:pb-0">
      <div className="relative w-16 h-16 flex-shrink-0 rounded bg-background">
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
        <h3 className="font-semibold text-foreground text-sm line-clamp-2">{item.title}</h3>
        {item.requiresSize && item.size ? (
          <p className="text-xs text-muted-foreground">Size: {item.size}</p>
        ) : null}
        <p className="text-sm font-semibold text-primary mt-1">
          {formatProductPrice(item.price, item.currency)} x {item.quantity}
        </p>
      </div>
    </div>
  )
}

function Totals({ totalPrice, itemCount }: { totalPrice: number; itemCount: number }) {
  return (
    <>
      <div className="flex justify-between text-foreground">
        <span>Subtotal ({itemCount} items):</span>
        <span className="font-semibold">{formatProductPrice(totalPrice)}</span>
      </div>
      <div className="flex justify-between text-foreground pb-3 border-b border-border">
        <span>Shipping:</span>
        <span className="font-semibold text-green-600">Free</span>
      </div>
      <div className="flex justify-between items-center pt-3">
        <span className="font-bold text-foreground">Total:</span>
        <span className="text-2xl font-bold text-primary">{formatProductPrice(totalPrice)}</span>
      </div>
      <div className="bg-primary/10 border border-primary/20 rounded p-3 text-sm text-foreground space-y-2">
        <p>
          <span className="font-semibold">Payment Method:</span> Cash on Delivery
        </p>
        <p>
          <span className="font-semibold">Delivery:</span> Nationwide available
        </p>
        <p className="text-xs opacity-80">
          You&apos;ll receive a confirmation call after placing your order.
        </p>
      </div>
    </>
  )
}
