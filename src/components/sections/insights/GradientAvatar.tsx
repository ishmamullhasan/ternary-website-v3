import type { Media } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

/**
 * Author avatar. Renders the CMS image when present; otherwise the design's muted radial
 * gradient-noise circle (pink #e830ab + purple #8c36e2 radials over #5a165a→#261745) with
 * the local /noise.svg grain — never the old flat violet→fuchsia 2-stop gradient. Degrades
 * gracefully when media is unavailable (the expected local state).
 */

const AVATAR_GRADIENT =
  'radial-gradient(80% 80% at 30% 25%, #e830ab 0%, rgba(140,54,226,0.85) 45%, #5a165a 78%, #261745 100%)'

export default function GradientAvatar({
  image,
  name,
  size = 40,
  className = '',
}: {
  image?: Media | null
  name?: string | null
  size?: number
  className?: string
}): JSX.Element {
  if (image?.url) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <Image src={image.url} alt={image.alt || name || 'Author'} fill className="object-cover" sizes={`${size}px`} />
      </div>
    )
  }

  return (
    <div
      aria-hidden
      className={`relative shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size, backgroundImage: AVATAR_GRADIENT }}
    >
      <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:120px] opacity-[0.22] mix-blend-overlay" />
    </div>
  )
}
