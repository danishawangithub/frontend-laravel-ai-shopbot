'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeroSlide } from '@/lib/admin-api-types'

type Props = {
  slides?: HeroSlide[]
}

export default function HeroSlider({ slides = [] }: Props) {
  const activeSlides = slides.filter(
    (s) => s.is_active !== false && (s.image_url || s.image)
  )

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoplay, setIsAutoplay] = useState(true)

  useEffect(() => {
    setCurrentSlide(0)
  }, [activeSlides.length])

  useEffect(() => {
    if (!isAutoplay || activeSlides.length < 2) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoplay, activeSlides.length])

  if (activeSlides.length === 0) {
    return (
      <HeroEmptyState />
    )
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length)
    setIsAutoplay(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)
    setIsAutoplay(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoplay(false)
  }

  return (
    <div className="relative w-full h-[70vh] min-h-[480px] max-h-[820px] md:min-h-[560px] overflow-hidden bg-secondary/10">
      {activeSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image_url ?? ''}
            alt={slide.title}
            className="w-full h-full  "
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10" />

          <div className="absolute inset-0 flex items-center justify-center">
            <HeroSlideContent slide={slide} />
          </div>
        </div>
      ))}

      {activeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {activeSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white/50 w-2 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="absolute top-6 right-6 z-10">
            <button
              type="button"
              onClick={() => setIsAutoplay(!isAutoplay)}
              className="bg-white/30 hover:bg-white/50 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
            >
              {isAutoplay ? 'Playing' : 'Paused'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function HeroEmptyState() {
  return (
    <div className="w-full h-[320px] md:h-[400px] bg-secondary/20 flex items-center justify-center">
      <p className="text-muted-foreground text-sm">No hero slides configured</p>
    </div>
  )
}

function HeroSlideContent({ slide }: { slide: HeroSlide }) {
  return (
    <div className="text-center text-white px-4 max-w-3xl">
      <h2 className="text-3xl md:text-5xl font-bold mb-3 text-balance">{slide.title}</h2>
      {slide.subtitle ? (
        <p className="text-lg md:text-xl opacity-90 mb-6">{slide.subtitle}</p>
      ) : null}
      {slide.button_text && slide.button_url ? (
        <Link
          href={slide.button_url}
          className="inline-block px-8 py-3 bg-white text-foreground rounded font-semibold hover:bg-white/90 transition"
        >
          {slide.button_text}
        </Link>
      ) : null}
    </div>
  )
}
