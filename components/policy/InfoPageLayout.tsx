'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

type InfoPageLayoutProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function InfoPageLayout({ title, subtitle, children }: InfoPageLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-[60vh]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0" aria-hidden />
            <span className="text-foreground font-medium truncate">{title}</span>
          </nav>

          <header className="mb-8 md:mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{title}</h1>
            {subtitle ? (
              <p className="text-lg text-muted-foreground leading-relaxed">{subtitle}</p>
            ) : null}
          </header>

          <div className="space-y-8 text-foreground">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  )
}
