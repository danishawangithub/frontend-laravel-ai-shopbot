'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { formatProductPrice } from '@/lib/format-price'
import { CheckCircle2, Phone, MapPin } from 'lucide-react'

const LAST_ORDER_KEY = 'lastOrder'

interface StoredOrderItem {
  title: string
  quantity: number
  price: number
  currency?: string
  size?: string
}

interface OrderDetails {
  orderNumber: string
  paymentLabel?: string
  customerName: string
  customerEmail?: string
  customerPhone: string
  city: string
  address: string
  items: StoredOrderItem[]
  totalAmount: number
  orderDate: string
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <div className="bg-background min-h-screen flex items-center justify-center">
            <p className="text-muted-foreground">Loading…</p>
          </div>
          <Footer />
        </>
      }
    >
      <ThankYouPageInner />
    </Suspense>
  )
}

function ThankYouPageInner() {
  const searchParams = useSearchParams()
  const queryOrderNumber = searchParams.get('order_number')
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const lastOrder = sessionStorage.getItem(LAST_ORDER_KEY)
    if (lastOrder) {
      try {
        const parsed = JSON.parse(lastOrder) as OrderDetails
        setOrderDetails(parsed)
        sessionStorage.removeItem(LAST_ORDER_KEY)
      } catch (error) {
        console.error('Failed to parse order details:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const displayOrderNumber = orderDetails?.orderNumber ?? queryOrderNumber

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="bg-background min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="bg-background min-h-screen">
        <ThankYouContent
          displayOrderNumber={displayOrderNumber}
          orderDetails={orderDetails}
        />
      </div>
      <Footer />
    </>
  )
}

function ThankYouContent({
  displayOrderNumber,
  orderDetails,
}: {
  displayOrderNumber: string | null
  orderDetails: OrderDetails | null
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="bg-green-600 rounded-full p-4">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">Order Confirmed!</h1>
        <p className="text-lg text-muted-foreground mb-2">Thank you for your purchase</p>
        {displayOrderNumber ? (
          <p className="text-xl font-semibold text-primary">Order #{displayOrderNumber}</p>
        ) : (
          <p className="text-foreground">Your order has been successfully placed.</p>
        )}
        {orderDetails?.paymentLabel ? (
          <p className="text-sm text-muted-foreground mt-2">{orderDetails.paymentLabel}</p>
        ) : null}
      </div>

      {orderDetails ? (
        <div className="bg-card rounded-lg border border-border overflow-hidden mb-8">
          <div className="bg-secondary border-b border-border p-6">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="text-lg font-bold text-foreground">{orderDetails.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                <p className="text-lg font-bold text-foreground">{orderDetails.orderDate}</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Delivery Details</h2>
            <div className="space-y-3">
              <DeliveryBlock orderDetails={orderDetails} />
            </div>
          </div>

          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Order Items</h2>
            <div className="space-y-3">
              {orderDetails.items.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="flex justify-between items-center pb-3 border-b border-border last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-foreground line-clamp-1">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                      {item.size ? ` · Size ${item.size}` : ''}
                    </p>
                  </div>
                  <p className="font-semibold text-foreground">
                    {formatProductPrice(item.price * item.quantity, item.currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-secondary">
            <OrderTotal totalAmount={orderDetails.totalAmount} />
          </div>
        </div>
      ) : null}

      <NextSteps />

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/shop">
          <button
            type="button"
            className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded font-semibold hover:opacity-90 transition"
          >
            Continue Shopping
          </button>
        </Link>
        <Link href="/">
          <button
            type="button"
            className="w-full sm:w-auto px-8 py-3 border border-primary text-primary rounded font-semibold hover:bg-secondary transition"
          >
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  )
}

function DeliveryBlock({ orderDetails }: { orderDetails: OrderDetails }) {
  return (
    <>
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground">{orderDetails.customerName}</p>
          <p className="text-sm text-muted-foreground">{orderDetails.address}</p>
          <p className="text-sm text-muted-foreground">{orderDetails.city}</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-muted-foreground">Contact Number</p>
          <p className="font-semibold text-foreground">{orderDetails.customerPhone}</p>
          {orderDetails.customerEmail ? (
            <p className="text-sm text-muted-foreground mt-1">{orderDetails.customerEmail}</p>
          ) : null}
        </div>
      </div>
    </>
  )
}

function OrderTotal({ totalAmount }: { totalAmount: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-semibold text-foreground">Total Amount:</span>
      <span className="text-2xl font-bold text-primary">{formatProductPrice(totalAmount)}</span>
    </div>
  )
}

function NextSteps() {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">What Happens Next?</h2>
      <ol className="space-y-3 text-foreground text-sm">
        <li>Our team will call within 2–4 hours to confirm your order.</li>
        <li>Your order ships within 24 hours of confirmation.</li>
        <li>Pay with cash on delivery when your package arrives.</li>
        <li>7-day exchange policy applies from the delivery date.</li>
      </ol>
    </div>
  )
}
