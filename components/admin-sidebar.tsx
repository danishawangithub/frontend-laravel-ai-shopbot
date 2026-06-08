'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
  FolderTree,
  Package,
  ScrollText,
  Settings,
  Bot,
} from 'lucide-react'
import { useAdminAuth } from '@/lib/admin-auth-context'
import { useState } from 'react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, adminName } = useAdminAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/ai-agent', label: 'AI Agent', icon: Bot },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/logs', label: 'Logs', icon: ScrollText },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Elegance</h2>
        <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
      </div>

      <div className="p-4 border-b border-border bg-secondary/20">
        <p className="text-sm font-medium text-foreground">Logged in as</p>
        <p className="text-sm text-muted-foreground">{adminName ?? 'Admin'}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary/30'
                }`}
                style={isActive ? { backgroundColor: '#BB454E' } : {}}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary/30 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-primary-foreground"
        style={{ backgroundColor: '#BB454E' }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div
        className={`fixed md:static left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {sidebarContent}
      </div>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}
    </>
  )
}
