'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority,
}: ProductImageProps) {
  if (!src) {
    return (
      <div className={cn('flex items-center justify-center bg-dark-800 text-white/20', className)}>
        <Package className="h-12 w-12" />
      </div>
    );
  }

  const isCloudinary = src.includes('res.cloudinary.com');

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn('object-cover', className)}
        unoptimized={!isCloudinary}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 400}
      sizes={sizes}
      priority={priority}
      className={cn('object-cover', className)}
      unoptimized={!isCloudinary}
    />
  );
}
