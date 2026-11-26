'use client';

import type { ImageLoaderProps } from 'next/image';

const CLOUDINARY_ORIGIN = 'https://res.cloudinary.com/';
const UPLOAD_SEGMENT = '/upload/';

export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  if (src.startsWith(CLOUDINARY_ORIGIN) && src.includes(UPLOAD_SEGMENT)) {
    const transformation = `f_auto,c_limit,w_${width},q_${quality ?? 'auto'}`;
    return src.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}${transformation}/`);
  }

  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}w=${width}`;
}
