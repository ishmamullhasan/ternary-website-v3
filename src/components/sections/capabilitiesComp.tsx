'use client'
import Motion from '@/components/animation/motion'
import { EASE, reveal, revealItem } from '@/components/animation/reveal'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { Capability, Media } from '@/payload-types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState, type JSX } from 'react'

interface CapabilitiesCompProps {
  heading?: string | null
  // richText since the description→Lexical migration; string kept for legacy DB rows.
  description?: RichText | string | null
  capability?: Capability[] | null
  /** Carousel slides for the secondary intro block. */
  slides?: { image?: Media | null; id?: string | null }[] | null
}

// Focus-visible affordance shared across every interactive element on this surface.
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

// Cream media panel (the fill is the fallback; the image layers on top). Fixed aspect so slides
// share a uniform height in the carousel.
function MediaPanel({ media }: { media: Media }): JSX.Element {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[5px] bg-cream lg:aspect-[16/9]">
      {media.url && (
        <Image
          src={media.url}
          alt={media.alt || 'capability'}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 66vw, 88vw"
        />
      )}
    </div>
  )
}

// Secondary intro media as a slider on ALL screens (mirrors the About carousel: horizontal snap,
// a peek of the next slide, centered prev/next pill buttons). A single slide skips the controls.
function IntroMediaCarousel({ slides }: { slides: Media[] }): JSX.Element {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const update = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 8)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

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

  const scrollBySlide = (dir: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const slide = el.querySelector<HTMLElement>('[data-slide]')
    const amount = slide ? slide.offsetWidth + 16 : el.clientWidth * 0.88
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  // Single slide: no need for a scroller or controls.
  if (slides.length <= 1) {
    return (
      <Motion
        className="relative w-full"
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
      >
        <MediaPanel media={slides[0]} />
      </Motion>
    )
  }

  return (
    <div className="w-full">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((media, index) => (
          <div key={index} data-slide className="w-[88%] shrink-0 snap-start lg:w-[82%]">
            <MediaPanel media={media} />
          </div>
        ))}
      </div>

      {/* prev / next controls: 32px pills, disabled state fades to 50% */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => scrollBySlide(-1)}
          disabled={!canPrev}
          aria-label="Previous slide"
          className={`flex size-8 items-center justify-center rounded-full border border-white/[0.06] bg-button-dark text-cream transition-opacity disabled:opacity-50 ${focusRing}`}
        >
          <ChevronLeft size={16} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => scrollBySlide(1)}
          disabled={!canNext}
          aria-label="Next slide"
          className={`flex size-8 items-center justify-center rounded-full border border-white/[0.06] bg-button-dark text-cream transition-opacity disabled:opacity-50 ${focusRing}`}
        >
          <ChevronRight size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  )
}

export default function CapabilitiesComp({ heading, description, capability, slides }: CapabilitiesCompProps) {
  // Empty-state guard: the capabilities grid is the primary content of this section.
  if (!capability || capability.length === 0) return null

  // Carousel media: populated slides only (depth-0 string relations are dropped).
  const carouselMedia: Media[] = (slides ?? [])
    .map((s) => s.image)
    .filter((m): m is Media => !!m && typeof m === 'object')

  return (
    <section className="section-card flex w-full flex-col gap-8">
      {/* Header — display heading ABOVE the supporting sentence, left-aligned. */}
      <Motion className="flex max-w-[544px] flex-col" {...reveal}>
        {heading && <h2 className="text-section font-display font-medium text-cream">{heading}</h2>}
        {description && (
          <RichTextComp
            content={description as RichText}
            className="prose-p:mb-0 prose-p:text-base prose-p:leading-[1.15] prose-p:text-body"
          />
        )}
      </Motion>

      {/* Disciplines grid: on lg a 5-column grid whose first column is left empty (the design's
          indent), so the 8 cards occupy columns 2–5 across two 192px rows. Below lg it collapses
          to a 1/2-column stack with no gutter. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:auto-rows-[192px]">
        {/* Empty left gutter (desktop only), spanning both rows. */}
        <div aria-hidden className="hidden lg:block lg:row-span-2" />
        {capability.map((item, index): JSX.Element => {
          return (
            <Motion key={item.id ?? index} tag="div" className="h-full" {...revealItem(index)}>
              <Link
                href={`/capabilities/${item.slug}`}
                className={`group flex h-full min-h-[160px] flex-col justify-between rounded-[5px] bg-button-dark p-4 transition-colors duration-300 hover:bg-[#1a1810] ${focusRing}`}
              >
                <div>
                  <h3 className="text-[16px] font-medium leading-[1.15] text-cream">{item.title}</h3>
                  {item.excerpts && <p className="mt-2 text-[14px] leading-[1.3] text-cream/80">{item.excerpts}</p>}
                </div>
                <span className="mt-6 text-[14px] font-medium whitespace-nowrap text-cream">Explore</span>
              </Link>
            </Motion>
          )
        })}
      </div>

      {/* Secondary intro media — a full-width slider on all screens (single slide → static panel). */}
      {carouselMedia.length > 0 && <IntroMediaCarousel slides={carouselMedia} />}
    </section>
  )
}
