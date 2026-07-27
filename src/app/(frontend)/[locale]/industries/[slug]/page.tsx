import { RenderBlocks } from '@/blocks/RenderBlocks'
import Motion from '@/components/animation/motion'
import GradientPanel, { toneFor, type Tone } from '@/components/layout/GradientPanel'
import MobileCarousel from '@/components/layout/MobileCarousel'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import { cn } from '@/lib/utils'
import type { Industry, Media, Page as PageDoc } from '@/payload-types'
import config from '@/payload.config'
import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX, ReactNode } from 'react'

// SSG + ISR: prebuild known slugs (generateStaticParams below) and serve them statically, then
// Freshness is purely tag-driven (no time-based revalidate) — the industry afterChange/afterDelete
// hooks bust the tags below. dynamicParams lets slugs not in the prebuilt set render on demand.
export const dynamicParams = true

const getIndustryList = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'industry',
      limit: 100,
      depth: 0,
    })
    return result.docs
  },
  ['industry'],
  { tags: ['industry'] },
)

async function fetchIndustryBySlug(slug: string, locale: TypedLocale): Promise<Industry | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'industry',
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
    // depth 3 + overrideAccess so the `layout` blocks' relationships (related industries,
    // panel thumbnails, nested media) populate for RenderBlocks (mirrors the home-page fetch).
    depth: 3,
    overrideAccess: true,
  })
  return (result.docs[0] as Industry | undefined) ?? null
}

// Sibling verticals shown in the "Related industries" rail. Pulled from the same collection
// (the simple content model has no explicit relationship field) with the current doc excluded.
async function fetchRelatedIndustries(currentId: string, locale: TypedLocale): Promise<Industry[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'industry',
    where: { id: { not_equals: currentId } },
    locale,
    limit: 3,
    depth: 0,
  })
  return result.docs as Industry[]
}

// Tag-based ISR (mirrors the capability detail route): published reads are cached and busted
// on-demand by the `revalidateTag('industry')` / `revalidateTag('industry_<slug>')` calls in the
// makeContentCollection afterChange hook. In draft mode (live preview) we bypass the cache so
// editors see fresh data.
async function getIndustryBySlug(slug: string, locale: TypedLocale): Promise<Industry | null> {
  const { isEnabled: draft } = await draftMode()
  if (draft) return fetchIndustryBySlug(slug, locale)
  return unstable_cache(() => fetchIndustryBySlug(slug, locale), [`industry_${slug}_${locale}_v3`], {
    tags: [`industry_${slug}`, 'industry'],
  })()
}

export async function generateStaticParams() {
  const industries = await getIndustryList()
  // Cross-product: one entry per {locale, slug}.
  return LOCALES.flatMap((locale) => industries.map((industry) => ({ locale, slug: industry.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) return {}
  const industry = await getIndustryBySlug(slug, typedLocale)

  if (!industry) return {}

  return generateMeta({
    doc: industry,
    fallbackTitle: 'Industry',
    fallbackDescription: industry.excerpts,
    pathname: `/industries/${slug}`,
    locale: typedLocale,
    ogType: 'article',
  })
}

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
// can borrow the palette at very low alpha without minting any new colors. Mirrors the capability
// detail route so both detail surfaces speak the same accent language.
const TONE_RGB: Record<Tone, string> = {
  crimson: '193, 40, 95',
  violet: '124, 58, 237',
  emerald: '31, 157, 107',
  azure: '47, 147, 218',
  magenta: '182, 36, 154',
  indigo: '79, 107, 237',
}

// Deterministic per-industry tone: hash the slug into the TONE cycle so each vertical keeps a
// stable accent across visits, without hardcoding a palette per slug.
function toneForSlug(slug: string): Tone {
  let sum = 0
  for (let i = 0; i < slug.length; i++) sum += slug.charCodeAt(i)
  return toneFor(null, sum)
}

// Palantir-style section marker: "Section 02 / Label", tabular numerals, tight functional label.
function SectionMarker({ index, label }: { index: number; label: string }): JSX.Element {
  return (
    <p className="flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-subtle">
      <span className="tabular-nums text-cream/70">{`Section ${String(index).padStart(2, '0')}`}</span>
      <span aria-hidden className="text-subtle/50">
        /
      </span>
      <span>{label}</span>
    </p>
  )
}

// A Lexical richText value is non-empty when its root has at least one child node. Empty editors
// still serialize a root with an empty children array, so a truthy check alone is not enough.
function hasRichText(value: unknown): value is RichText {
  const root = (value as RichText | null | undefined)?.root
  return Boolean(root?.children?.length)
}

function RelatedCard({
  industry,
  locale,
  index,
}: {
  industry: Industry
  locale: TypedLocale
  index: number
}): JSX.Element {
  const tone = toneFor(null, index)
  return (
    <Motion {...revealItem(index)} className="h-full">
      {/* Hover transform lives on the Link (inside the Motion wrapper) so the reveal transform,
          which Motion keeps inline on the wrapper, never fights the CSS translate. */}
      <Link
        href={`/${locale}/industries/${industry.slug}`}
        className={cn(
          'group relative flex h-full flex-col gap-2 overflow-hidden rounded-md border border-white/[0.07] bg-ink p-5 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/[0.16] motion-reduce:transition-none motion-reduce:hover:translate-y-0',
          FOCUS_RING,
        )}
      >
        {/* faint tonal wash + grain — the gradient-panel language at whisper volume */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            backgroundImage: `radial-gradient(120% 100% at 0% 0%, rgba(${TONE_RGB[tone]}, 0.11) 0%, transparent 58%)`,
          }}
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.05] mix-blend-overlay"
        />
        <div className="relative flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-medium tracking-[-0.02em] text-cream">{industry.title}</h3>
          <ArrowUpRight
            size={14}
            strokeWidth={2}
            aria-hidden
            className="shrink-0 text-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cream"
          />
        </div>
        {industry.excerpts && <p className="relative text-[13px] leading-relaxed text-subtle">{industry.excerpts}</p>}
      </Link>
    </Motion>
  )
}

function CtaButton({ href, label, primary }: { href: string; label: ReactNode; primary?: boolean }): JSX.Element {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex w-full items-center justify-center rounded-md px-6 py-3 text-[15px] font-medium transition-colors duration-300 sm:w-auto',
        primary
          ? 'bg-cream text-ink hover:bg-cream-hover'
          : 'border border-white/20 bg-white/[0.06] text-cream hover:bg-white/[0.12]',
        FOCUS_RING,
      )}
    >
      {label}
    </Link>
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
  const industry = await getIndustryBySlug(slug, typedLocale)

  if (!industry) {
    notFound()
  }

  // Redesigned, block-driven detail page (matches the industry Figma). Rows that have a populated
  // `layout` render through the shared RenderBlocks pipeline; rows without one (every legacy row)
  // fall through to the bespoke presentation below, so no existing page regresses.
  if (industry.layout?.length) {
    return (
      <div>
        <RenderBlocks blocks={industry.layout as PageDoc['layout']} />
      </div>
    )
  }

  const heroImage = industry.thumbnail as Media | undefined
  const relatedIndustries = await fetchRelatedIndustries(industry.id, typedLocale)

  // Stable per-vertical accent, drawn from the brand TONE cycle (GradientPanel).
  const heroTone = toneForSlug(industry.slug)

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-20 px-5 pb-24 md:px-8 lg:gap-28 lg:px-12 lg:pb-32">
      {/* ── HERO ─────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full pt-10 lg:pt-16">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Motion
            className="flex flex-col items-start gap-6 text-left"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {/* Small discipline row above the headline, mirroring the capability hero. */}
            <p className="text-[12px] uppercase tracking-[0.18em] text-subtle">Industry</p>

            <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.03em] text-cream">
              {industry.title}
            </h1>

            {industry.excerpts && (
              <p className="max-w-xl text-[clamp(1rem,1.5vw,1.125rem)] leading-relaxed text-body">
                {industry.excerpts}
              </p>
            )}
          </Motion>

          {/* Right header card — always present. Falls back to the signature noise-gradient
              device (per-vertical tone) when media is missing, so the hero never collapses to a
              single column. */}
          <Motion
            className="relative aspect-[724/458] w-full overflow-hidden rounded-md ring-1 ring-white/[0.06]"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
          >
            <GradientPanel tone={heroTone} />
            {heroImage?.url && (
              <Image
                src={heroImage.url}
                alt={heroImage.alt || industry.title || 'Industry hero'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            )}
          </Motion>
        </div>
      </section>

      {/* ── SECTION 01 · OVERVIEW (raised bg-ink tile, tonal wash + grain, ghost numeral) ── */}
      {hasRichText(industry.content) && (
        <Motion
          tag="section"
          className="relative overflow-hidden rounded-md border border-white/[0.06] bg-ink p-6 md:p-10 lg:p-14"
          {...reveal}
        >
          {/* whisper-volume tonal wash + grain — the gradient-panel language without the volume */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(110% 90% at 0% 0%, rgba(${TONE_RGB[heroTone]}, 0.08) 0%, transparent 55%)`,
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.05] mix-blend-overlay"
          />
          {/* oversized ghost numeral — decorative; SectionMarker carries the real order */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-5 right-4 select-none font-display text-[clamp(5.5rem,11vw,8.5rem)] font-medium leading-none tabular-nums tracking-[-0.04em] text-cream/[0.05]"
          >
            01
          </span>

          <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_2.1fr] lg:gap-16">
            <div className="flex flex-col gap-4">
              <SectionMarker index={1} label="Overview" />
              <h2 className="font-display text-[clamp(1.6rem,3vw,1.875rem)] font-medium leading-[1.1] tracking-[-0.02em] text-cream">
                Where we focus
              </h2>
            </div>

            <div className="min-w-0">
              <RichTextComp
                content={industry.content as RichText}
                className="prose-invert max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:tracking-[-0.02em] prose-headings:text-cream prose-p:text-body prose-p:leading-relaxed prose-a:text-cream prose-strong:text-cream prose-li:text-body"
              />
            </div>
          </div>
        </Motion>
      )}

      {/* ── SECTION 02 · RELATED INDUSTRIES (open editorial strip) ───────────────────────── */}
      {relatedIndustries.length > 0 && (
        <section className="w-full">
          <Motion className="mb-10 flex flex-col gap-4" {...reveal}>
            <SectionMarker index={2} label="Related industries" />
            <h2 className="font-display text-[clamp(1.6rem,3vw,1.875rem)] font-medium leading-[1.1] tracking-[-0.02em] text-cream">
              Explore more verticals
            </h2>
          </Motion>

          {/* Mobile: horizontal snap carousel with pagination dots. */}
          <MobileCarousel slideClassName="w-[280px]">
            {relatedIndustries.map((item, index) => (
              <RelatedCard key={item.id} industry={item} locale={typedLocale} index={index} />
            ))}
          </MobileCarousel>

          {/* sm+ grid — hidden on mobile, where the carousel takes over. */}
          <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {relatedIndustries.map((item, index) => (
              <RelatedCard key={item.id} industry={item} locale={typedLocale} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* ── CLOSING CTA — the page's signature noise-gradient moment ─────────────────────── */}
      <Motion
        tag="section"
        className="relative overflow-hidden rounded-md border border-white/[0.06] p-10 lg:p-16"
        {...reveal}
      >
        <GradientPanel tone="violet" />

        <div className="relative z-10 flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <Motion className="flex max-w-xl flex-col items-center gap-3 lg:items-start" {...revealItem(0)}>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.02em] text-cream">
              {industry.title ? `Building for ${industry.title}?` : "Let's build what's next"}
            </h2>
            <p className="mx-auto max-w-lg text-[15px] leading-relaxed text-cream/75 lg:mx-0">
              Tell us where you&apos;re headed and we&apos;ll map the engineering path to get there.
            </p>
          </Motion>

          <div className="flex w-full shrink-0 flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row lg:ml-auto">
            <CtaButton
              href={`/${typedLocale}/contact`}
              label={
                <span className="inline-flex items-center gap-2">
                  Start a conversation
                  <ArrowUpRight size={15} strokeWidth={2} aria-hidden />
                </span>
              }
              primary
            />
            <CtaButton href={`/${typedLocale}/industries`} label="All industries" />
          </div>
        </div>
      </Motion>
    </div>
  )
}
