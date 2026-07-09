'use client'
import Motion from '@/components/animation/motion'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { Capability, Industry, Insight, Media, Model, PressRelease, Scale, Solution, Story } from '@/payload-types'
import { ArrowUpRight, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState, type JSX } from 'react'

type MultiRelation =
  | { relationTo: 'capability'; value: Capability }
  | { relationTo: 'solution'; value: Solution }
  | { relationTo: 'industry'; value: Industry }
  | { relationTo: 'scale'; value: Scale }
  | { relationTo: 'model'; value: Model }
  | { relationTo: 'story'; value: Story }
  | { relationTo: 'insight'; value: Insight }
  | { relationTo: 'pressRelease'; value: PressRelease }

// Human-readable label for the card badge, keyed by the relationship's content type.
const CONTENT_TYPE_LABEL: Record<MultiRelation['relationTo'], string> = {
  capability: 'Capability',
  solution: 'Solution',
  industry: 'Industry',
  scale: 'Scale',
  model: 'Model',
  story: 'Case Study',
  insight: 'Insight',
  pressRelease: 'Press Release',
}

// Meta shown in the hover overlay's bottom panel (Figma 2392:2778): code + date row, then
// read-time · category beside the CTA. Only the editorial collections carry these fields;
// stories map their caseMeta equivalents, everything else just gets the CTA.
type CardMeta = {
  code?: string | null
  date?: string | null
  readTime?: string | null
  category?: string | null
  cta: string
}

const formatDate = (iso?: string | null): string | null => {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getItemMeta(item: MultiRelation): CardMeta {
  if (typeof item.value === 'string') return { cta: 'Explore' }
  switch (item.relationTo) {
    case 'insight':
      return {
        code: item.value.code,
        date: formatDate(item.value.publishedDate),
        readTime: item.value.readTime,
        category: item.value.categoryLabel,
        cta: 'Read',
      }
    case 'pressRelease':
      return {
        code: item.value.code,
        date: formatDate(item.value.releaseDate),
        readTime: item.value.readTime,
        category: item.value.categoryLabel,
        cta: 'Read',
      }
    case 'story':
      return {
        date: item.value.caseMeta?.year,
        readTime: item.value.caseMeta?.duration,
        category: item.value.caseMeta?.industry,
        cta: 'Read',
      }
    default:
      return { cta: 'Explore' }
  }
}

type CardSize = 'standard' | 'wide' | 'tall' | 'large'

interface BentoRow {
  item?: MultiRelation | null
  size?: CardSize | null
  id?: string | null
}

// Grid footprint per card size — spans only apply at xl+, where the bento grid takes over from
// the mobile carousel (which renders every card at a uniform size, ignoring these footprints).
const SIZE_SPAN: Record<CardSize, string> = {
  standard: '',
  wide: 'xl:col-span-2',
  tall: 'xl:row-span-2',
  large: 'xl:row-span-2 xl:col-span-2',
}

// next/image `sizes` per footprint in the xl bento grid (2-col cards render twice as wide).
const SIZE_IMG_SIZES: Record<CardSize, string> = {
  standard: '(min-width: 1280px) 25vw, 90vw',
  wide: '(min-width: 1280px) 50vw, 90vw',
  tall: '(min-width: 1280px) 25vw, 90vw',
  large: '(min-width: 1280px) 50vw, 90vw',
}

interface AboutProps {
  /** Section intro: heading node(s) + paragraph(s) in ONE richText (headings get the display
      style, paragraphs the body style). `heading`/`description` are the pre-merge legacy pair. */
  content?: RichText | null
  heading?: RichText | string | null
  description?: RichText | string | null
  /** Bento rows ({ item, size }); bare relations (the pre-bento shape) are still accepted. */
  items?: (BentoRow | MultiRelation)[] | null
  organizations?: {
    heading?: string | null
    organization?:
      | {
          icon?: Media | null
          name?: string | null
          link?: string | null
        }[]
      | null
  } | null
  bottomDescription?: RichText | string | null
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

// Card reveal: a gentle upward drift + fade, staggered per index.
const motionGridItemProps = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 as const },
}

// The carousel can't use motionGridItemProps: a slide parked off-screen *horizontally* never
// intersects the viewport, so a per-slide whileInView leaves every card but the first invisible
// until the user scrolls it in. Instead the strip itself owns the trigger and staggers its slides
// through variants, so all cards reveal together when the section scrolls into view.
const carouselStripVariants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.05 } },
}

const carouselSlideVariants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

// Section intro reveal: the copy glides in from the right as it scrolls into view.
const motionIntroProps = {
  initial: { opacity: 0, x: 64 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, amount: 0.5 as const },
}

function getItemHref(item: MultiRelation): string {
  if (typeof item.value === 'string' || !item.value.slug) return '#'

  switch (item.relationTo) {
    case 'capability':
      return `/capabilities/${item.value.slug}`
    case 'solution':
      return `/solutions/${item.value.slug}`
    case 'industry':
      return `/industries/${item.value.slug}`
    case 'scale':
      return '/scales'
    case 'model':
      return '/solutions'
    case 'story':
      return `/case-studies/${item.value.slug}`
    case 'insight':
      return `/insights/${item.value.slug}`
    case 'pressRelease':
      return `/press-release/${item.value.slug}`
    default:
      return '#'
  }
}

// Single bento/carousel card. Layout is absolute-positioned, so it fills whatever box its
// wrapper defines (a grid cell in the xl bento, a fixed-height slide in the mobile carousel).
// `isTwoRow` widens the hover excerpt clamp for the taller footprints.
function BentoCard({
  item,
  index,
  isTwoRow,
  imgSizes,
}: {
  item: MultiRelation
  index: number
  isTwoRow: boolean
  imgSizes: string
}): JSX.Element {
  const thumbnail = item.value.thumbnail as Media | null | undefined
  const imageUrl = thumbnail?.url
  const meta = getItemMeta(item)

  return (
    <Link
      href={getItemHref(item)}
      className={`group relative block h-full overflow-hidden rounded-md border border-white/[0.06] bg-ink transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.01] hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] motion-reduce:transition-none motion-reduce:hover:scale-100 ${focusRing}`}
    >
      {/* gradient field IS the fallback; optional CMS image layers on top */}
      <GradientPanel tone={toneFor(undefined, index)} interactive />
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={item.value.title || 'story'}
          fill
          sizes={imgSizes}
          className="relative object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.3] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      )}
      {/* top scrim so the header text stays legible over any image (Figma: black/60 → 50%) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent to-50%" />

      {/* hover overlay — frosted layer revealing excerpt + meta pinned to the bottom
          (Figma 2392:2778). Painted below the header block so title/type stay crisp. */}
      <div className="absolute inset-0 flex flex-col justify-end gap-3 overflow-hidden bg-black/[0.32] px-6 pt-24 pb-8 opacity-0 backdrop-blur-[75px] transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
        {item.value.excerpts && (
          <p
            className={`${isTwoRow ? 'line-clamp-4' : 'line-clamp-2'} translate-x-[120%] text-base leading-[1.15] tracking-[-0.05em] text-body transition-transform duration-[700ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-x-0 group-focus-visible:translate-x-0 motion-reduce:translate-x-0 motion-reduce:transition-none`}
          >
            {item.value.excerpts}
          </p>
        )}
        <div className="flex translate-x-[120%] flex-col gap-1 transition-transform delay-100 duration-[700ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-x-0 group-focus-visible:translate-x-0 motion-reduce:translate-x-0 motion-reduce:transition-none">
          {(meta.code || meta.date) && (
            <div className="flex items-center justify-between text-xs leading-[1.15] tracking-[-0.05em] text-body">
              <span>{meta.code}</span>
              <span>{meta.date}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-subtle pt-2">
            <span className="flex min-w-0 items-center gap-2 text-xs leading-[1.15] tracking-[-0.05em] text-body">
              {meta.readTime && (
                <span className="flex shrink-0 items-center gap-1">
                  <Clock size={12} strokeWidth={2} aria-hidden />
                  {meta.readTime}
                </span>
              )}
              {meta.category && (
                <span className="truncate">{meta.readTime ? `· ${meta.category}` : meta.category}</span>
              )}
            </span>
            <span className="flex shrink-0 items-center gap-1 text-base leading-[1.15] tracking-[-0.05em] text-cream">
              {meta.cta}
              <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
            </span>
          </div>
        </div>
      </div>

      {/* header — title + content type, always visible (Figma 2392:2742) */}
      <div className="absolute inset-x-6 top-8 flex flex-col gap-2">
        {item.value.title && (
          <h3 className="line-clamp-2 text-base leading-[1.15] font-semibold tracking-[-0.05em] text-cream">
            {item.value.title}
          </h3>
        )}
        <p className="text-sm leading-[1.15] tracking-[-0.05em] text-cream">{CONTENT_TYPE_LABEL[item.relationTo]}</p>
      </div>
    </Link>
  )
}

// Mobile/tablet carousel (below xl): uniform full-height slides that snap horizontally with a peek
// of the next card, driven by centered prev/next pill buttons (Figma 893:18958).
function AboutCarousel({ cards }: { cards: { rel: MultiRelation; size: CardSize }[] }): JSX.Element {
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

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const slide = el.querySelector<HTMLElement>('[data-slide]')
    const amount = slide ? slide.offsetWidth + 16 : el.clientWidth * 0.86
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  return (
    <Motion
      tag="div"
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.2 }}
      variants={carouselStripVariants}
      className="mt-10 w-full xl:hidden"
    >
      {/* overflow-y-hidden pins the strip to one axis (`overflow-x: auto` alone computes
          `overflow-y: auto`, letting the slides drag/scroll vertically). The pb-6/-mb-5 pair gives
          the slides' 24px reveal drift room to run without being clipped by that hidden axis,
          while keeping the strip's outer spacing at the original 4px. */}
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden -mb-5 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map(({ rel }, index) => (
          <Motion
            tag="div"
            key={index}
            data-slide
            variants={carouselSlideVariants}
            className="h-[468px] w-[86%] shrink-0 snap-start"
          >
            <BentoCard item={rel} index={index} isTwoRow imgSizes="86vw" />
          </Motion>
        ))}
      </div>

      {/* prev / next controls (Figma 893:18958): 32px pills, disabled state fades to 50% */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          disabled={!canPrev}
          aria-label="Previous"
          className={`flex size-8 items-center justify-center rounded-full border border-white/[0.06] bg-ink text-cream transition-opacity disabled:opacity-50 ${focusRing}`}
        >
          <ChevronLeft size={16} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          disabled={!canNext}
          aria-label="Next"
          className={`flex size-8 items-center justify-center rounded-full border border-white/[0.06] bg-ink text-cream transition-opacity disabled:opacity-50 ${focusRing}`}
        >
          <ChevronRight size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </Motion>
  )
}

export default function AboutComp({
  content,
  heading,
  description,
  items,
  organizations,
  bottomDescription,
}: AboutProps) {
  // Normalize both shapes to { rel, size } and drop unpopulated relations (depth-0 string values).
  const list = (items ?? [])
    .map((row) =>
      'relationTo' in row
        ? { rel: row, size: 'standard' as CardSize }
        : { rel: row.item ?? null, size: row.size ?? ('standard' as CardSize) },
    )
    .filter((c): c is { rel: MultiRelation; size: CardSize } => typeof c.rel?.value === 'object')
  if (list.length === 0) return null

  return (
    <section className="w-full">
      <div className="flex flex-col items-center">
        {/* section intro — ONE richText: heading nodes take the display style, paragraphs the body
            style. Arbitrary clamp values mirror .text-section (globals.css) — the plain class has
            no generated prose-headings: variants, so it can't be used here. */}
        {/* section intro — glides in from the right as it enters the viewport (motionIntroProps) */}
        {(content || heading || description) && (
          <Motion
            tag="div"
            {...motionIntroProps}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex max-w-2xl flex-col items-center text-center"
          >
            {content ? (
              <RichTextComp
                content={content}
                className="prose-headings:mb-0 prose-headings:text-[clamp(1.5rem,3vw,1.875rem)] prose-headings:leading-[1.15] prose-headings:tracking-[-0.02em] prose-headings:font-display prose-headings:font-medium prose-headings:text-cream prose-p:mt-0 prose-p:mb-0 prose-p:text-body"
              />
            ) : (
              <>
                {heading && (
                  <RichTextComp
                    content={heading as RichText}
                    className="prose-p:mb-0 prose-p:text-[clamp(1.5rem,3vw,1.875rem)] prose-p:leading-[1.15] prose-p:tracking-[-0.02em] prose-p:font-display prose-p:font-medium prose-p:text-cream prose-headings:mb-0 prose-headings:text-[clamp(1.5rem,3vw,1.875rem)] prose-headings:leading-[1.15] prose-headings:tracking-[-0.02em] prose-headings:font-display prose-headings:font-medium prose-headings:text-cream"
                  />
                )}
                {description && (
                  <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-body" />
                )}
              </>
            )}
          </Motion>
        )}

        {/* mobile / tablet: uniform same-height carousel (below xl) */}
        <AboutCarousel cards={list} />

        {/* xl+ bento grid — fixed row height, dense packing so standard cards backfill the gaps
            that Wide/Tall/Large cards leave. Spans per card come from the CMS `size` field. */}
        <div className="mt-10 hidden w-full auto-rows-[15rem] grid-cols-4 gap-4 [grid-auto-flow:dense] xl:grid">
          {list.map(({ rel: item, size }, index: number): JSX.Element => {
            const isTwoRow = size === 'tall' || size === 'large'

            return (
              <Motion
                tag="div"
                key={index}
                {...motionGridItemProps}
                transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
                className={SIZE_SPAN[size]}
              >
                <BentoCard item={item} index={index} isTwoRow={isTwoRow} imgSizes={SIZE_IMG_SIZES[size]} />
              </Motion>
            )
          })}
        </div>

        {/* organizations */}
        {organizations?.heading && (
          <p className="mt-12 mb-9 text-center text-base font-medium text-cream">{organizations.heading}</p>
        )}

        {/* Logo wall — icons only, spread edge-to-edge (flex space-between). Item basis caps the row
            at 8 on lg / 4 on sm / 2 on mobile; the config limits the array to 16, so ≤2 rows. */}
        <div className="flex w-full flex-wrap items-center justify-between gap-y-6">
          {organizations?.organization?.slice(0, 16).map((item, index) => {
            const orgIcon = item.icon as Media | null | undefined
            const orgIconUrl = orgIcon?.url
            if (!orgIconUrl) return null

            return (
              <Motion
                tag="div"
                key={index}
                {...motionGridItemProps}
                transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
                className="flex basis-[46%] justify-center sm:basis-[22%] lg:basis-[12%]"
              >
                <Link
                  href={item.link || '#'}
                  aria-label={item.name || 'organization'}
                  className={`group flex items-center justify-center rounded-md p-4 transition-colors hover:bg-white/[0.04] ${focusRing}`}
                >
                  <span className="h-[50px]">
                    <Image
                      src={orgIconUrl}
                      alt={orgIcon?.alt || item.name || 'organization logo'}
                      width={orgIcon?.width || 150}
                      height={orgIcon?.height || 50}
                      className="h-full w-full object-contain grayscale transition group-hover:grayscale-0"
                    />
                  </span>
                </Link>
              </Motion>
            )
          })}
        </div>

        {/* bottom text */}
        {bottomDescription && (
          <RichTextComp
            content={bottomDescription as RichText}
            className="mt-12 max-w-[1120px] text-center prose-p:mb-0 prose-p:text-base prose-p:text-body"
          />
        )}
      </div>
    </section>
  )
}
