'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import ProductCard from '@/components/product-card'
import { publicFetchCategories, publicFetchProducts } from '@/lib/public-api'
import { mapPublicProduct } from '@/lib/map-public-product'
import type { PublicCategory } from '@/lib/public-types'
import type { Product } from '@/lib/types'
import type { ShopSort } from '@/lib/shop-constants'
import { SHOP_PRICE_RANGES, SHOP_SORT_OPTIONS } from '@/lib/shop-constants'
import { Filter, Search, X } from 'lucide-react'

const PER_PAGE = 20

function parseCategorySlugs(raw: string | null): string[] {
  if (!raw) return []
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

function buildPriceParams(selectedIndexes: number[]): { price_min?: string; price_max?: string } {
  if (selectedIndexes.length === 0) return {}
  const ranges = selectedIndexes.map((i) => SHOP_PRICE_RANGES[i]).filter(Boolean)
  if (ranges.length === 0) return {}

  const min = Math.min(...ranges.map((r) => r.min))
  const finiteMaxes = ranges
    .map((r) => r.max)
    .filter((m): m is number => m != null && Number.isFinite(m))
  const hasOpenEnded = ranges.some((r) => r.max == null)

  const params: { price_min?: string; price_max?: string } = { price_min: String(min) }
  if (!hasOpenEnded && finiteMaxes.length > 0) {
    params.price_max = String(Math.max(...finiteMaxes))
  }
  return params
}

function ShopPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const qParam = searchParams.get('q') ?? ''
  const categoryParam = searchParams.get('category')
  const sortParam = (searchParams.get('sort') as ShopSort) || 'newest'
  const pageParam = Math.max(1, Number(searchParams.get('page') || '1') || 1)

  const [searchInput, setSearchInput] = useState(qParam)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    parseCategorySlugs(categoryParam)
  )
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([])
  const [sortBy, setSortBy] = useState<ShopSort>(
    SHOP_SORT_OPTIONS.some((o) => o.value === sortParam) ? sortParam : 'newest'
  )

  const [sidebarCategories, setSidebarCategories] = useState<PublicCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setSearchInput(qParam)
  }, [qParam])

  useEffect(() => {
    setSelectedCategories(parseCategorySlugs(categoryParam))
  }, [categoryParam])

  useEffect(() => {
    if (SHOP_SORT_OPTIONS.some((o) => o.value === sortParam)) {
      setSortBy(sortParam)
    }
  }, [sortParam])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await publicFetchCategories()
        if (!cancelled) setSidebarCategories(list)
      } catch {
        if (!cancelled) setSidebarCategories([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const updateUrl = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(patch)) {
        if (value == null || value === '') params.delete(key)
        else params.set(key, value)
      }
      router.push(`/shop?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim()
      if (trimmed !== qParam) {
        updateUrl({ q: trimmed || null, page: '1' })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, qParam, updateUrl])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const apiCategory =
      selectedCategories.length === 1 ? selectedCategories[0] : undefined
    const priceParams = buildPriceParams(selectedPriceRanges)

    ;(async () => {
      try {
        const res = await publicFetchProducts({
          q: qParam || undefined,
          category: apiCategory,
          sort: sortBy,
          page: String(pageParam),
          per_page: String(PER_PAGE),
          ...priceParams,
        })

        if (cancelled) return

        let mapped = res.data.map(mapPublicProduct)

        if (selectedCategories.length > 1) {
          mapped = mapped.filter(
            (p) => p.categorySlug && selectedCategories.includes(p.categorySlug)
          )
        }

        setProducts(mapped)
        setTotalItems(
          selectedCategories.length > 1
            ? mapped.length
            : res.meta?.total ?? mapped.length
        )
      } catch {
        if (!cancelled) {
          setProducts([])
          setTotalItems(0)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [qParam, selectedCategories, selectedPriceRanges, sortBy, pageParam])

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedPriceRanges.length > 0 || Boolean(qParam)

  const toggleCategory = (slug: string) => {
    const next = selectedCategories.includes(slug)
      ? selectedCategories.filter((s) => s !== slug)
      : [...selectedCategories, slug]
    setSelectedCategories(next)
    updateUrl({
      category: next.length ? next.join(',') : null,
      page: '1',
    })
  }

  const togglePriceRange = (index: number) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
    updateUrl({ page: '1' })
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedPriceRanges([])
    setSearchInput('')
    updateUrl({ q: null, category: null, page: '1' })
  }

  const onSortChange = (value: ShopSort) => {
    setSortBy(value)
    updateUrl({ sort: value === 'newest' ? null : value, page: '1' })
  }

  const filterPanel = useMemo(
    () => (
      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-lg font-bold text-foreground mb-4">Filters</h2>

        <ShopSearchFilter searchInput={searchInput} setSearchInput={setSearchInput} />

        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">Category</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sidebarCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories</p>
            ) : (
              sidebarCategories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => toggleCategory(cat.slug)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-foreground text-sm">{cat.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">Price Range</h3>
          <div className="space-y-2">
            {SHOP_PRICE_RANGES.map((range, index) => (
              <label key={index} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPriceRanges.includes(index)}
                  onChange={() => togglePriceRange(index)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-foreground text-sm">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="w-full py-2 text-primary hover:bg-secondary rounded transition font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>
    ),
    [
      searchInput,
      sidebarCategories,
      selectedCategories,
      selectedPriceRanges,
      hasActiveFilters,
      toggleCategory,
      togglePriceRange,
      clearFilters,
    ]
  )

  return (
    <>
      <Navbar />

      <div className="bg-background min-h-screen">
        <div className="bg-secondary border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold text-foreground">Shop Collection</h1>
            <p className="text-muted-foreground mt-2">
              Browse our curated selection of premium Pakistani women&apos;s clothing
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6">
            <aside className="hidden md:block w-64 shrink-0">{filterPanel}</aside>

            <main className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  className="md:hidden flex items-center gap-2 px-4 py-2 border border-border rounded text-foreground"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value as ShopSort)}
                  className="px-4 py-2 border border-border rounded text-foreground bg-card"
                >
                  {SHOP_SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <p className="text-sm text-muted-foreground ml-auto">
                  {loading ? 'Loading…' : `${totalItems} items`}
                </p>
              </div>

              {hasActiveFilters && (
                <div className="mb-6 p-4 bg-secondary rounded flex items-center gap-2 justify-between flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {qParam && (
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                        Search: {qParam}
                      </span>
                    )}
                    {selectedCategories.map((slug) => {
                      const cat = sidebarCategories.find((c) => c.slug === slug)
                      return (
                        <span
                          key={slug}
                          className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {cat?.name ?? slug}
                          <button type="button" onClick={() => toggleCategory(slug)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )
                    })}
                    {selectedPriceRanges.map((index) => (
                      <span
                        key={index}
                        className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {SHOP_PRICE_RANGES[index].label}
                        <button type="button" onClick={() => togglePriceRange(index)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-primary hover:underline text-sm whitespace-nowrap"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {loading ? (
                <p className="text-center text-muted-foreground py-16">Loading products…</p>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">No products found matching your filters.</p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 text-primary hover:underline font-medium"
                  >
                    Clear filters and try again
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40 flex items-end">
          <div className="w-full bg-card rounded-t-lg p-6 max-h-[85vh] overflow-y-auto">
            <MobileFiltersHeader onClose={() => setShowFilters(false)} />
            {filterPanel}
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="w-full mt-4 py-3 bg-primary text-primary-foreground rounded font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

function ShopSearchFilter({
  searchInput,
  setSearchInput,
}: {
  searchInput: string
  setSearchInput: (v: string) => void
}) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-foreground mb-3">Search</h3>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products…"
          className="w-full pl-9 pr-3 py-2 border border-border rounded bg-background text-foreground text-sm"
        />
      </div>
    </div>
  )
}

function MobileFiltersHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-foreground">Filters</h2>
      <button type="button" onClick={onClose} aria-label="Close filters">
        <X className="w-6 h-6" />
      </button>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted-foreground">Loading shop…</p>}>
      <ShopPageContent />
    </Suspense>
  )
}
