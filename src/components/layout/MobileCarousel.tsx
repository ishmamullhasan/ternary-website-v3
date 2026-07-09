'use client'
import { cn } from '@/utilities/ui'
import { useCallback, useEffect, useRef, useState, type JSX, type ReactNode } from 'react'

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

/**
 * Mobile-only horizontal card carousel (Figma 1221:2339). Fixed-width slides snap horizontally with
 * a peek of the next card, and pagination dots below track / drive the active slide. Hidden at sm+,
 * where the caller's bento grid takes over. Each child is one card; `slideClassName` sizes the slide
 * wrapper (e.g. `h-[212px] w-[260px]`).
 */
export default function MobileCarousel({
  children,
  slideClassName,
  className,
}: {
  children: ReactNode[]
  slideClassName: string
  className?: string
}): JSX.Element {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  // One step = slide width + the 16px flex gap; the active index is the nearest step to the offset.
  const step = useCallback(() => {
    const el = scrollerRef.current
    const slide = el?.querySelector<HTMLElement>('[data-slide]')
    return slide ? slide.offsetWidth + 16 : (el?.clientWidth ?? 1)
  }, [])

  const update = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setActive(Math.round(el.scrollLeft / step()))
  }, [step])

  useEffect(() => {
    update()
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [update])

  const scrollTo = (i: number) => {
    scrollerRef.current?.scrollTo({ left: i * step(), behavior: 'smooth' })
  }

  return (
    <div className={cn('sm:hidden', className)}>
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, i) => (
          <div key={i} data-slide className={cn('shrink-0 snap-start', slideClassName)}>
            {child}
          </div>
        ))}
      </div>

      {children.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {children.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to card ${i + 1}`}
              aria-current={i === active}
              onClick={() => scrollTo(i)}
              className={cn(
                'size-[10px] rounded-full transition-colors',
                i === active ? 'bg-cream' : 'bg-cream/30',
                focusRing,
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
