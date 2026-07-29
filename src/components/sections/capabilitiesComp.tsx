'use client'
import Motion from '@/components/animation/motion'
import { EASE, reveal, revealItem } from '@/components/animation/reveal'
import CapabilityArt from '@/components/capability/CapabilityArt'
import { usePointerReveal } from '@/components/capability/usePointerReveal'
import MobileCarousel from '@/components/layout/MobileCarousel'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import SectionCta from '@/components/sections/SectionCta'
import type { Capability, Media } from '@/payload-types'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
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

// Single discipline card — shared by the sm+ grid and the mobile carousel so both render identically.
// The figure takes the upper region and the copy is pinned to the bottom; the figure is a flex child
// rather than an absolutely-positioned layer so the copy claims the height it needs first and the art
// takes whatever is left, however long the excerpt runs.
//
// The figure is drawn latent and resolves under the pointer (see capabilityArt.css). This handler is
// what feeds it. It writes CSS custom properties DIRECTLY to the element and never calls setState —
// a card must not re-render on mousemove — and coalesces to one write per frame, because
// pointermove fires far more often than the compositor can use.
function CapabilityCard({ item, index }: { item: Capability; index: number }): JSX.Element {
  // The figure's viewBox is 240×190 (see CapabilityArt); its centre feeds the parallax normalisation.
  const { ref: cardRef, onPointerMove, onPointerLeave } = usePointerReveal<HTMLAnchorElement>(120, 95)

  return (
    <Link
      ref={cardRef}
      href={`/capabilities/${item.slug}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      /* Borderless, on the brand radius token (`rounded-md` = 5px, per globals.css) like every other
         card on the home page. The hover affordance is carried by the lume and by the figure
         resolving under the pointer — it does not need an edge as well.

         Surface is `bg-ink`, not `bg-button-dark`: every other card on the home page (solutions,
         industries, scales, engagement) sits on --color-ink #0f0e0e, and #14120b left this one
         section reading a shade warmer than the rest of the page. `bg-button-dark` stays what its
         name says — buttons, chips, and the /capabilities ledger stage. */
      className={`cap-card group relative flex h-full min-h-[379px] flex-col overflow-hidden rounded-md border border-transparent bg-ink transition-colors duration-300 hover:border-line ${focusRing}`}
    >
      <span aria-hidden className="cap-lume" />

      {/* Decorative. `min-h-0` lets this shrink below the SVG's intrinsic size instead of pushing
          the copy out of the card on short viewports. */}
      <div aria-hidden className="relative z-[1] min-h-0 flex-1">
        <span className="absolute top-4 left-4 z-[2] font-mono text-[10px] tracking-[0.18em] text-cream/20 transition-colors duration-700 group-hover:text-cream/40">
          {String(index + 1).padStart(2, '0')}
        </span>
        <CapabilityArt animation={item.animation} />
      </div>

      <div className="relative z-[2] flex flex-col gap-2 p-4">
        <h3 className="text-[16px] leading-[1.15] font-medium text-cream">{item.title}</h3>
        {/* min-h matches the clamp (3 × 1.3 leading) so every card reserves the same excerpt
            block and rows align even when CMS copy runs a line short. Copy is budgeted to the
            77–92ch band (≤2 lines at grid widths) — the clamp is a guard, never the fix. */}
        {item.excerpts && (
          <p className="line-clamp-3 min-h-[3.9em] text-[14px] leading-[1.3] text-body">{item.excerpts}</p>
        )}
        <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium whitespace-nowrap text-cream transition-[gap] duration-500 group-hover:gap-2.5">
          Explore
          <ArrowUpRight size={13} strokeWidth={1.6} aria-hidden />
        </span>
      </div>
    </Link>
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
      {/* Header — display heading ABOVE the supporting sentence, left-aligned, with the hub link
          top-right. `items-start` keeps the button level with the h2's first line however many
          lines the heading and description run to; below sm it drops under the copy. */}
      <Motion className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8" {...reveal}>
        <div className="flex max-w-[544px] flex-col">
          {heading && <h2 className="text-section font-display font-medium text-cream">{heading}</h2>}
          {description && (
            <RichTextComp
              content={description as RichText}
              className="prose-p:mb-0 prose-p:text-base prose-p:leading-[1.15] prose-p:text-body"
            />
          )}
        </div>
        <SectionCta href="/capabilities" destination="about our capabilities" />
      </Motion>

      {/* Mobile: horizontal snap carousel with pagination dots (Figma 1221:2339). */}
      <MobileCarousel slideClassName="h-[379px] w-[280px]">
        {capability.map((item, index) => (
          <CapabilityCard key={item.id ?? index} item={item} index={index} />
        ))}
      </MobileCarousel>

      {/* Disciplines grid (sm+): 4-up on desktop, so eight cards fall into two rows and each card is
          wide enough to hold its figure. Rows are implicit rather than fixed — a card is as tall as
          its copy needs, floored at 379px, and the row equalises the rest. Hidden on mobile, where
          the carousel takes over. */}
      {/* gap-5, not gap-4: a 16px gap put these cards at 302px against 299px everywhere
          else. Same gap everywhere means one card width across the whole page. */}
      <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {capability.map((item, index): JSX.Element => {
          return (
            <Motion key={item.id ?? index} tag="div" className="h-full" {...revealItem(index)}>
              <CapabilityCard item={item} index={index} />
            </Motion>
          )
        })}
      </div>

      {/* Secondary intro media — a full-width slider on all screens (single slide → static panel). */}
      {carouselMedia.length > 0 && <IntroMediaCarousel slides={carouselMedia} />}
    </section>
  )
}
