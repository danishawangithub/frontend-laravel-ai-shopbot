import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import { SiteSettingsProvider } from '@/lib/site-settings-context'
import { AdminAuthProvider } from '@/lib/admin-auth-context'
import { AdminProvider } from '@/lib/admin-context'
import { AppToaster } from '@/components/app-toaster'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Elegance Boutique - Pakistani Women\'s Fashion',
  description: 'Premium Pakistani women\'s clothing with cash on delivery. Kurtis, dresses, sarees, and more.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <AdminAuthProvider>
          <AdminProvider>
            <SiteSettingsProvider>
              <CartProvider>
                {children}
                <AppToaster />
              </CartProvider>
            </SiteSettingsProvider>
          </AdminProvider>
        </AdminAuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
