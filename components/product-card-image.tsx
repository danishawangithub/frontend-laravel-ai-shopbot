'use client'

import Image from 'next/image'
import { useCallback, useState } from 'react'

type ProductCardImageProps = {
  src: string
  alt: string
}

export default function ProductCardImage({ src, alt }: ProductCardImageProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')

  const updateOrigin = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
  }, [])

  const handleEnter = useCallback(() => {
    setIsZoomed(true)
  }, [])

  const handleLeave = useCallback(() => {
    setIsZoomed(false)
    setOrigin('50% 50%')
  }, [])

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={updateOrigin}
      className="relative w-full aspect-[4/5] min-h-[280px] bg-muted overflow-hidden flex items-center justify-center cursor-zoom-in"
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-contain p-2 transition-transform duration-300 ease-out will-change-transform ${
          isZoomed ? 'scale-[1.65]' : 'scale-100'
        }`}
        style={{ transformOrigin: origin }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        unoptimized
      />
    </div>
  )
}
