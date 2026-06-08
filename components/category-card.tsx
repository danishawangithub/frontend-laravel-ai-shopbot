'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
}

export default function CategoryCard({ title, slug, imageUrl, description }: CategoryCardProps) {
  return (
    <Link href={`/shop?category=${encodeURIComponent(slug)}`}>
      <div className="group cursor-pointer h-full">
        <div className="relative h-80 md:h-96 overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500 bg-secondary"
            style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-secondary transition">
              {title}
            </h3>
            {description ? (
              <p className="text-white/90 text-sm md:text-base mb-4">{description}</p>
            ) : null}
            <div className="flex items-center text-secondary font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
