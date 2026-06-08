'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  title: string
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')

  useEffect(() => {
    setIsZoomed(false)
    setOrigin('50% 50%')
  }, [selectedIndex])

  const updateOrigin = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
  }, [])

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const getThumbnailIndices = () => {
    const thumbnailCount = Math.min(6, images.length)
    const indices: number[] = []

    if (images.length <= thumbnailCount) {
      return Array.from({ length: images.length }, (_, i) => i)
    }

    const halfVisible = Math.floor(thumbnailCount / 2)
    let start = Math.max(0, selectedIndex - halfVisible)
    let end = Math.min(images.length, start + thumbnailCount)

    if (end - start < thumbnailCount) {
      start = Math.max(0, end - thumbnailCount)
    }

    for (let i = start; i < end; i++) {
      indices.push(i)
    }

    return indices
  }

  const thumbnailIndices = getThumbnailIndices()

  return (
    <div className="flex flex-col gap-4">
      <div
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => {
          setIsZoomed(false)
          setOrigin('50% 50%')
        }}
        onMouseMove={updateOrigin}
        className="relative w-full min-h-[420px] md:min-h-[520px] lg:min-h-[600px] aspect-[3/4] bg-secondary rounded-lg overflow-hidden flex items-center justify-center cursor-zoom-in"
      >
        <Image
          src={images[selectedIndex]}
          alt={`${title} - Image ${selectedIndex + 1}`}
          fill
          className={`object-contain p-3 md:p-4 transition-transform duration-300 ease-out will-change-transform ${
            isZoomed ? 'scale-[1.75]' : 'scale-100'
          }`}
          style={{ transformOrigin: origin }}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          unoptimized
        />

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={handlePrevious}
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 right-4 z-10 bg-black/60 text-white px-3 py-1 rounded text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {thumbnailIndices.map((index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative w-20 h-20 shrink-0 rounded border-2 overflow-hidden transition bg-muted ${
                selectedIndex === index
                  ? 'border-primary'
                  : 'border-border hover:border-primary'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={images[index]}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-contain p-0.5"
                sizes="80px"
                unoptimized
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
