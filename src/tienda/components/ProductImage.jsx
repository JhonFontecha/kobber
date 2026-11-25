import { useState } from 'react'
import { Package } from 'lucide-react'
import { imageSrc } from '../lib/format'

export default function ProductImage({
  src,
  alt,
  width = 480,
  className = '',
  priority = false,
  sizes = '(max-width: 640px) 50vw, 280px',
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center text-graphite-500 bg-graphite-50 ${className}`}
        role="img"
        aria-label={alt ? `${alt}. Sin imagen` : 'Sin imagen'}
      >
        <Package size={40} strokeWidth={1} aria-hidden="true" />
      </div>
    )
  }

  const target = width > 640 ? 800 : 480
  const small = imageSrc(src, 320)
  const large = imageSrc(src, target)

  return (
    <img
      src={large}
      srcSet={`${small} 320w, ${large} ${target}w`}
      sizes={sizes}
      alt={alt || ''}
      width={target}
      height={target}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...(priority ? { fetchpriority: 'high' } : {})}
      onError={() => setFailed(true)}
      className={`max-w-full ${className}`}
    />
  )
}
