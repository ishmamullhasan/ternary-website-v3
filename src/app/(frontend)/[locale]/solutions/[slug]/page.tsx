import Motion from '@/components/animation/motion'
import { GradientPanel, toneFor, type Tone } from '@/components/layout/GradientPanel'
import MobileCarousel from '@/components/layout/MobileCarousel'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import { cn } from '@/lib/utils'
import type { Media, Solution } from '@/payload-types'
import config from '@/payload.config'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

// SSG + ISR: prebuild known slugs (generateStaticParams below) and serve them statically, then
// Freshness is purely tag-driven (no time-based revalidate) — the solution afterChange/afterDelete
// hooks bust the tags below. dynamicParams lets slugs not in the prebuilt set render on demand.
export const dynamicParams = true

const getSolutionList = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'solution',
      limit: 100,
      depth: 0,
    })
    return result.docs
  },
  ['solution'],
  { tags: ['solution'] },
)

// Populated list used to power the "related solutions" rail. Depth 1 is enough to read the
// sibling docs' own fields (title/slug/excerpts/thumbnail) without pulling nested relationships.
const getRelatedSolutions = unstable_cache(
  async (locale: TypedLocale) => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'solution',
      locale,
      limit: 7,
      depth: 1,
    })
    return result.docs as Solution[]
  },
  // _v2: the related rail renders sibling excerpts, so the align-copy seed bumps this too.
  ['solution_related_v2'],
  { tags: ['solution'] },
)

async function fetchSolutionBySlug(slug: string, locale: TypedLocale): Promise<Solution | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'solution',
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
    depth: 2,
  })
  return (result.docs[0] as Solution | undefined) ?? null
}

// Tag-based ISR (WEB-457): published reads are cached and busted on-demand by the
// `revalidateTag('solution')` / `revalidateTag('solution_<slug>')` calls in the solution
// afterChange hook (makeContentCollection). In draft mode (live preview) we bypass the cache
// so editors see fresh data.
async function getSolutionBySlug(slug: string, locale: TypedLocale): Promise<Solution | null> {
  const { isEnabled: draft } = await draftMode()
  if (draft) return fetchSolutionBySlug(slug, locale)
  return unstable_cache(() => fetchSolutionBySlug(slug, locale), [`solution_${slug}_${locale}_v3`], {
    tags: [`solution_${slug}`, 'solution'],
  })()
}

export async function generateStaticParams() {
  const solutions = await getSolutionList()
  // Cross-product: one entry per {locale, slug}.
  return LOCALES.flatMap((locale) => solutions.map((solution) => ({ locale, slug: solution.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) return {}
  const solution = await getSolutionBySlug(slug, typedLocale)

  if (!solution) return {}

  return generateMeta({
    doc: solution,
    fallbackTitle: 'Solution',
    fallbackDescription: solution.excerpts,
    pathname: `/solutions/${slug}`,
    locale: typedLocale,
    ogType: 'article',
  })
}

// ---------------------------------------------------------------------------------------------
// Presentation — brought up to the capability-detail / solutions-hub design language: Geist Mono
// eyebrow + SectionMarker labels, tone-cycled gradient washes with /noise.svg grain, raised
// bg-ink tiles with hairline borders and hover lifts, and one signature gradient CTA. The doc
// carries title / excerpts / thumbnail / content only, so every section is guarded on its data
// and sparse docs degrade to hero + CTA without empty shells.
// ---------------------------------------------------------------------------------------------

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Shared reveal — quiet upward fade, fires once. Motion already honors prefers-reduced-motion.
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' } as const,
  transition: { duration: 0.6, ease: EASE },
}

const revealItem = (index: number) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' } as const,
  transition: { duration: 0.55, ease: EASE, delay: Math.min(index * 0.06, 0.42) },
})

// Focus-visible affordance shared across every interactive element (matches the detail routes).
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

// Key colors of the brand TONE gradients (GradientPanel) as raw RGB triplets, so decorative washes
// can borrow the palette at very low alpha without minting any new colors. Cycle order mirrors
// `toneFor`'s positional fallback, keeping accents consistent across sections.
const TONE_RGB: Record<Tone, string> = {
  crimson: '193, 40, 95',
  violet: '124, 58, 237',
  emerald: '31, 157, 107',
  azure: '47, 147, 218',
  magenta: '182, 36, 154',
  indigo: '79, 107, 237',
}

// Canonical order of the four solutions (see project instructions) — drives the hero's
// "Solution 0N of 04" numbering and a stable per-page gradient tone. Unknown slugs simply
// render without a number and fall back to the first tone.
const SLUG_ORDER: Record<string, number> = {
  'product-development': 0,
  'enterprise-transformation': 1,
  'engineering-augmentation': 2,
  'managed-systems': 3,
}

// Palantir-style section marker: "Section 02 / Label" in Geist Mono, tabular numerals.
function SectionMarker({ index, label }: { index: number; label: string }): JSX.Element {
  return (
    <p className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] text-subtle">
      <span className="tabular-nums text-cream/70">{`Section ${String(index).padStart(2, '0')}`}</span>
      <span aria-hidden className="text-subtle/50">
        /
      </span>
      <span>{label}</span>
    </p>
  )
}

// Single related-solution card — shared by the sm+ grid and the mobile carousel. `h-full` on the
// Motion root lets the flex/grid parent stretch every card to equal height. The hover transform
// lives on the inner Link so Motion's reveal transform (inline on the wrapper) never fights it.
function RelatedSolutionCard({
  solution,
  locale,
  index,
}: {
  solution: Solution
  locale: TypedLocale
  index: number
}): JSX.Element {
  const tone = toneFor(null, index)
  return (
    <Motion {...revealItem(index)} className="h-full">
      <Link
        href={`/${locale}/solutions/${solution.slug}`}
        className={cn(
          'group relative flex h-full flex-col gap-2.5 overflow-hidden rounded-md border border-white/[0.07] bg-ink p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-line-strong motion-reduce:transition-none motion-reduce:hover:translate-y-0',
          FOCUS_RING,
        )}
      >
        {/* faint per-card tonal wash + grain — the signature gradient language at whisper volume */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            backgroundImage: `radial-gradient(120% 100% at 0% 0%, rgba(${TONE_RGB[tone]}, 0.1) 0%, transparent 58%)`,
          }}
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.06] mix-blend-overlay"
        />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[12px] tabular-nums text-cream/70">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="text-[16px] font-medium tracking-[-0.02em] text-cream">{solution.title}</h3>
          </div>
          <ArrowUpRight
            size={15}
            strokeWidth={2}
            aria-hidden
            className="shrink-0 text-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cream"
          />
        </div>
        {solution.excerpts && (
          <p className="relative pl-[29px] text-[13px] leading-relaxed text-subtle">{solution.excerpts}</p>
        )}
      </Link>
    </Motion>
  )
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<JSX.Element> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()
  const solution = await getSolutionBySlug(slug, typedLocale)

  if (!solution) {
    notFound()
  }

  const heroImage = solution.thumbnail as Media | undefined
  const hasContent = Boolean(solution.content?.root?.children?.length)

  // Sibling solutions for the related rail — exclude self, cap at three.
  const allSolutions = await getRelatedSolutions(typedLocale)
  const relatedSolutions = allSolutions.filter((item) => item.id !== solution.id).slice(0, 3)

  // Canonical position → hero numbering + a stable per-page gradient tone.
  const order = SLUG_ORDER[slug]
  const orderNumber = order !== undefined ? String(order + 1).padStart(2, '0') : null
  const heroTone = toneFor(null, order ?? 0)

  // Section numbering skips sections a sparse doc doesn't render, so markers never show gaps.
  const overviewIndex = hasContent ? 1 : 0
  const relatedIndex = (hasContent ? 1 : 0) + 1

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-24 px-5 pb-24 md:px-8 lg:gap-32 lg:px-12 lg:pb-32">
      {/* ── HERO ─────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full pt-10 lg:pt-16">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Motion
            className="flex flex-col items-start gap-7 text-left"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {/* Mono eyebrow with hairline rule — mirrors the solutions hub and hero numbering. */}
            <p className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.16em] text-subtle">
              <span aria-hidden className="h-px w-6 bg-cream/60" />
              {orderNumber ? (
                <>
                  Solution <span className="tabular-nums text-cream/70">{orderNumber}</span> of{' '}
                  <span className="tabular-nums">04</span>
                </>
              ) : (
                'Solution'
              )}
            </p>

            <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-medium leading-[1.02] tracking-[-0.04em] text-cream">
              {solution.title}
            </h1>

            {solution.excerpts && (
              <p className="max-w-2xl text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-body">{solution.excerpts}</p>
            )}

            <Link
              href={`/${typedLocale}/solutions`}
              className={cn(
                'mt-1 inline-flex items-center gap-2 rounded-md border border-line-strong bg-transparent px-5 py-2.5 text-[14px] font-medium text-cream transition-colors duration-300 hover:border-subtle hover:bg-white/[0.04]',
                FOCUS_RING,
              )}
            >
              All solutions
              <ArrowUpRight size={15} strokeWidth={2} aria-hidden />
            </Link>
          </Motion>

          {/* Right header card — always present. Falls back to the brand gradient panel (with a
              ghost numeral) when media is missing so the hero never collapses to a single column. */}
          <Motion
            className="relative aspect-[724/458] w-full overflow-hidden rounded-md ring-1 ring-white/[0.06]"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
          >
            <GradientPanel tone={heroTone} />
            {heroImage?.url ? (
              <Image
                src={heroImage.url}
                alt={heroImage.alt || solution.title || 'Solution hero'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              orderNumber && (
                <span
                  aria-hidden
                  className="absolute bottom-4 left-6 font-mono text-[clamp(4rem,8vw,6rem)] font-medium leading-none tabular-nums tracking-[-0.04em] text-cream/[0.18]"
                >
                  {orderNumber}
                </span>
              )
            )}
          </Motion>
        </div>
      </section>

      {/* ── SECTION 01 · OVERVIEW (rich-text body via the shared Lexical converter) ──────── */}
      {hasContent && (
        <section className="relative w-full">
          {/* faint vertical rule field — the hub hero's quiet engineering texture, used exactly
              once on this page to break the longest run of black. Decorative, non-interactive. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-y-10 inset-x-0 opacity-50"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, rgba(244,243,236,0.02) 0 1px, transparent 1px 120px)',
            }}
          />
          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_2.2fr] lg:gap-16">
            <Motion className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start" {...reveal}>
              <SectionMarker index={overviewIndex} label="Overview" />
              <h2 className="max-w-xs font-display text-[clamp(1.6rem,3vw,1.875rem)] font-medium leading-[1.1] tracking-[-0.02em] text-cream">
                {solution.title ? `Inside ${solution.title}` : 'Overview'}
              </h2>
            </Motion>

            <Motion className="min-w-0" {...reveal}>
              <RichTextComp
                content={solution.content as RichText}
                className="prose-invert max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:tracking-[-0.01em] prose-headings:text-cream prose-p:text-body prose-li:text-body prose-a:text-cream"
              />
            </Motion>
          </div>
        </section>
      )}

      {/* ── SECTION 02 · RELATED SOLUTIONS ───────────────────────────────────────────────── */}
      {relatedSolutions.length > 0 && (
        <section className="w-full">
          <Motion className="mb-10 flex flex-col gap-5 lg:mb-12" {...reveal}>
            <SectionMarker index={relatedIndex} label="Related solutions" />
            <h2 className="font-display text-[clamp(1.6rem,3vw,1.875rem)] font-medium leading-[1.1] tracking-[-0.02em] text-cream">
              Explore more
            </h2>
          </Motion>

          {/* Mobile: horizontal snap carousel with pagination dots. */}
          <MobileCarousel slideClassName="w-[280px]">
            {relatedSolutions.map((item, index) => (
              <RelatedSolutionCard
                key={item.id ?? `related-${index}`}
                solution={item}
                locale={typedLocale}
                index={index}
              />
            ))}
          </MobileCarousel>

          {/* sm+ grid — hidden on mobile, where the carousel takes over. */}
          <div className="hidden gap-4 sm:grid md:grid-cols-2 lg:grid-cols-3">
            {relatedSolutions.map((item, index) => (
              <RelatedSolutionCard
                key={item.id ?? `related-${index}`}
                solution={item}
                locale={typedLocale}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── CLOSING CTA (the page's signature noise-gradient moment) ─────────────────────── */}
      <Motion
        tag="section"
        className="relative overflow-hidden rounded-md border border-white/[0.06] p-10 lg:p-16"
        {...reveal}
      >
        <span aria-hidden className="absolute inset-0">
          <span
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(135% 135% at 22% 18%, #6d3bd6 0%, #3a1c8c 46%, #1a1448 100%)',
            }}
          />
          <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay" />
          <span className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/45" />
        </span>

        <div className="relative z-10 flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <div className="flex max-w-2xl flex-col items-center gap-4 lg:items-start">
            <p className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.16em] text-cream/70">
              <span aria-hidden className="h-px w-6 bg-cream/60" />
              Let&apos;s talk
            </p>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.02em] text-cream">
              {solution.title ? `Ready to put ${solution.title} to work?` : 'Ready to get started?'}
            </h2>
            <p className="mx-auto max-w-lg text-[15px] leading-relaxed text-cream/75 lg:mx-0">
              Tell us where you are today and we&apos;ll map the fastest path to outcomes that matter.
            </p>
          </div>

          <div className="flex w-full shrink-0 flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row lg:ml-auto">
            <Link
              href={`/${typedLocale}/contact`}
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-md bg-cream px-6 py-3 text-[15px] font-medium text-ink transition-colors duration-300 hover:bg-cream-hover sm:w-auto',
                FOCUS_RING,
              )}
            >
              Start a conversation
              <ArrowRight size={16} strokeWidth={2} aria-hidden />
            </Link>
            <Link
              href={`/${typedLocale}/solutions`}
              className={cn(
                'inline-flex w-full items-center justify-center rounded-md border border-white/20 bg-white/[0.06] px-6 py-3 text-[15px] font-medium text-cream transition-colors duration-300 hover:bg-white/[0.12] sm:w-auto',
                FOCUS_RING,
              )}
            >
              Browse solutions
            </Link>
          </div>
        </div>
      </Motion>
    </div>
  )
}
