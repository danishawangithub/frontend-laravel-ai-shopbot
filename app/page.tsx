'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import ProductCard from '@/components/product-card'
import TrustBadges from '@/components/trust-badges'
import HeroSlider from '@/components/hero-slider'
import CategoryCard from '@/components/category-card'
import { ArrowRight, Star } from 'lucide-react'
import {
  publicFetchHomeSettings,
  publicFetchHomeFeaturedProducts,
  publicFetchHomeCategories,
} from '@/lib/public-api'
import { mapPublicProduct } from '@/lib/map-public-product'
import type { PublicCategory } from '@/lib/public-types'
import type { HeroSlide } from '@/lib/admin-api-types'
import type { Product } from '@/lib/types'
import { useSiteSettings } from '@/lib/site-settings-context'

export default function HomePage() {
  const { site } = useSiteSettings()
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [homeCategories, setHomeCategories] = useState<PublicCategory[]>([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)

  const siteName = site?.site_name?.trim() || 'Elegance'

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [home, featuredRes, categoriesRes] = await Promise.all([
          publicFetchHomeSettings(),
          publicFetchHomeFeaturedProducts(8),
          publicFetchHomeCategories(6),
        ])
        if (cancelled) return
        const activeSlides = (home.hero_slides ?? []).filter((s) => s.is_active !== false)
        setHeroSlides(activeSlides)
        setFeaturedProducts(featuredRes.data.map(mapPublicProduct))
        setHomeCategories(categoriesRes)
      } catch {
        if (!cancelled) {
          setHeroSlides([])
          setFeaturedProducts([])
          setHomeCategories([])
        }
      } finally {
        if (!cancelled) {
          setLoadingFeatured(false)
          setLoadingCategories(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <Navbar />

      <main className="bg-background">
        <section className="relative w-full">
          <HeroSlider slides={heroSlides} />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Welcome to {siteName}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Premium Pakistani women&apos;s clothing with authentic designs
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/shop">
                <button className="px-8 py-3 bg-primary text-primary-foreground rounded font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <a href="#featured">
                <button className="px-8 py-3 border-2 border-primary text-primary rounded font-semibold hover:bg-primary/5 transition">
                  Browse Collection
                </button>
              </a>
            </div>
          </div>
        </section>

        <TrustBadges />

        <section id="featured" className="py-16 md:py-20 border-t border-border">
          <FeaturedSection
            loading={loadingFeatured}
            products={featuredProducts}
          />
        </section>

        <section className="py-16 md:py-20 bg-secondary/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-10">
              Why Choose {siteName}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Star className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Premium Quality</h3>
                <p className="text-muted-foreground text-sm">
                  Authentic Pakistani designs with carefully curated fabrics.
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl text-primary mx-auto mb-4">Rs</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Affordable Prices</h3>
                <p className="text-muted-foreground text-sm">
                  Premium quality at reasonable prices with COD available.
                </p>
              </div>

              <div className="text-center">
                <svg
                  className="w-8 h-8 text-primary mx-auto mb-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <h3 className="text-lg font-semibold text-foreground mb-2">Great Service</h3>
                <p className="text-muted-foreground text-sm">
                  Nationwide delivery and responsive customer support.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-10">
              Shop by Category
            </h2>

            {loadingCategories ? (
              <p className="text-center text-muted-foreground text-sm py-8">Loading categories…</p>
            ) : homeCategories.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No categories available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {homeCategories.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    title={cat.name}
                    slug={cat.slug}
                    imageUrl={cat.image_url}
                    description={cat.description}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-14 md:py-18 bg-foreground text-primary-foreground border-t border-border">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Get Exclusive Updates</h2>
            <p className="text-opacity-90 mb-6">Subscribe for new arrivals and special offers</p>

            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded text-foreground placeholder:text-muted-foreground text-sm"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-primary-foreground rounded font-semibold hover:opacity-90 transition whitespace-nowrap text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

function FeaturedSection({
  loading,
  products,
}: {
  loading: boolean
  products: Product[]
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Featured Products</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Handpicked pieces that combine tradition with modern style
        </p>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground text-sm py-12">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-12">
          No featured products yet. Mark products as featured in the admin panel.
        </p>
      ) : (
        <FeaturedProductGrid products={products} />
      )}

      <div className="text-center mt-10">
        <Link href="/shop">
          <button className="px-8 py-3 border-2 border-primary text-primary rounded font-semibold hover:bg-primary/5 transition flex items-center gap-2 mx-auto">
            View All Products
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  )
}

function FeaturedProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
