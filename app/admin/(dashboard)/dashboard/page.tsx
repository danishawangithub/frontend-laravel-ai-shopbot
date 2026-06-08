'use client'

import { useAdmin } from '@/lib/admin-context'
import { ShoppingCart, Users, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { getAdminStats, orders } = useAdmin()
  const stats = getAdminStats()

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: '#BB454E',
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: '#BB454E',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: '#BB454E',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: '#BB454E',
    },
  ]

  const recentOrders = orders.slice(-5).reverse()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin panel</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Catalog:{' '}
          <Link href="/admin/categories" className="text-primary underline">
            Categories
          </Link>
          ,{' '}
          <Link href="/admin/products" className="text-primary underline">
            Products
          </Link>
          . Orders:{' '}
          <Link href="/admin/orders" className="text-primary underline">
            Laravel API
          </Link>
          . Customers below remain local demo until you wire{' '}
          <code className="text-xs">/api/v1/admin/customers</code> if you add it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="bg-card rounded-lg shadow p-6 border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{card.value}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: card.color + '20' }}>
                  <Icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-foreground">Recent Orders (demo / local)</h2>
            <Link href="/admin/orders">
              <button className="text-sm font-medium px-4 py-2 rounded" style={{ color: '#BB454E' }}>
                View All
              </button>
            </Link>
          </div>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-secondary/10">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{order.customerName}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">Rs. {order.total}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{
                          backgroundColor:
                            order.status === 'Delivered'
                              ? '#10b981'
                              : order.status === 'Shipped'
                                ? '#3b82f6'
                                : '#f59e0b',
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
