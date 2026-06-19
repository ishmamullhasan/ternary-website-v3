import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import { cn } from '@/lib/utils'
import type { Industry, Media } from '@/payload-types'
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
    depth: 2,
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
  return unstable_cache(() => fetchIndustryBySlug(slug, locale), [`industry_${slug}_${locale}`], {
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

// The site's signature noise-gradient device. A radial tone field + a local grain overlay
// (no external image dependency) + a bottom legibility scrim. Used for the hero header card
// when no media is present, and as the CTA artwork.
const HERO_TONE = 'radial-gradient(120% 120% at 78% 18%, #1f9d6b 0%, #134a78 46%, #08233c 100%)'
const CTA_TONE = 'radial-gradient(135% 135% at 22% 18%, #6d3bd6 0%, #3a1c8c 46%, #1a1448 100%)'

function NoiseGradient({ tone, className }: { tone: string; className?: string }): JSX.Element {
  return (
    <span aria-hidden className={cn('absolute inset-0', className)}>
      <span className="absolute inset-0" style={{ backgroundImage: tone }} />
      <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay" />
      <span className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/45" />
    </span>
  )
}

// Eyebrow: plain uppercase micro-typography label, optionally numbered ("Section 0X / Label").
function Eyebrow({ index, label }: { index?: number; label?: string | null }): JSX.Element | null {
  if (!label) return null
  return (
    <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-subtle">
      {typeof index === 'number' && (
        <span className="text-cream/70">{`Section ${String(index).padStart(2, '0')} / `}</span>
      )}
      {label}
    </p>
  )
}

function SectionHeader({
  index,
  label,
  heading,
  description,
  className,
}: {
  index?: number
  label?: string | null
  heading?: string | null
  description?: string | null
  className?: string
}): JSX.Element | null {
  if (!heading && !description && !label) return null

  return (
    <Motion className={cn('flex flex-col gap-4', className)} {...reveal}>
      <Eyebrow index={index} label={label} />
      {heading && (
        <h2 className="font-display text-[clamp(1.6rem,3vw,1.875rem)] font-medium leading-[1.1] tracking-[-0.02em] text-cream whitespace-pre-line">
          {heading}
        </h2>
      )}
      {description && <p className="max-w-3xl text-[15px] leading-relaxed text-body">{description}</p>}
    </Motion>
  )
}

// Reusable section shell: near-black bordered panel with generous editorial padding.
const SECTION_SHELL = 'rounded-md border border-white/[0.06] bg-ink p-6 lg:p-12'

// Focus-visible affordance shared across every interactive element.
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

function RelatedCard({
  industry,
  locale,
  index,
}: {
  industry: Industry
  locale: TypedLocale
  index: number
}): JSX.Element {
  return (
    <Motion {...revealItem(index)}>
      <Link
        href={`/${locale}/industries/${industry.slug}`}
        className={cn(
          'group flex h-full flex-col gap-2 rounded-md border border-white/[0.07] bg-white/[0.015] p-6 transition-colors duration-300 hover:border-white/[0.16] hover:bg-white/[0.03]',
          FOCUS_RING,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[16px] font-medium text-cream">{industry.title}</h3>
          <ArrowUpRight
            size={15}
            strokeWidth={2}
            aria-hidden
            className="shrink-0 text-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cream"
          />
        </div>
        {industry.excerpts && <p className="text-[13px] leading-relaxed text-subtle">{industry.excerpts}</p>}
      </Link>
    </Motion>
  )
}

function CtaButton({ href, label, primary }: { href: string; label: ReactNode; primary?: boolean }): JSX.Element {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex w-full items-center justify-center rounded-md px-5 py-2.5 text-[14px] font-medium transition-colors duration-300 sm:w-auto',
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

  const heroImage = industry.thumbnail as Media | undefined
  const relatedIndustries = await fetchRelatedIndustries(industry.id, typedLocale)

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-16 px-5 pb-16 lg:gap-20 lg:pb-24">
      {/* Hero */}
      <Motion tag="section" className="w-full pt-8 lg:pt-14" {...reveal}>
        <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <Motion
            className="flex flex-col items-start gap-6 text-left"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {/* Small discipline row above the headline, mirroring the capability hero. */}
            <p className="text-[12px] uppercase tracking-[0.14em] text-subtle">
              {industry.title ? `Industry — ${industry.title}` : 'Industry'}
            </p>

            <h1 className="font-display text-[clamp(2rem,4.5vw,2.875rem)] font-medium leading-[1.08] tracking-[-0.03em] text-cream">
              {industry.title}
            </h1>

            {industry.excerpts && (
              <p className="max-w-xl text-[15px] leading-relaxed text-body lg:text-[16px]">{industry.excerpts}</p>
            )}
          </Motion>

          {/* Right header card — always present. Falls back to the noise-gradient device when
              media is missing so the hero never collapses to a single column. */}
          <Motion
            className="relative aspect-[724/458] w-full overflow-hidden rounded-md ring-1 ring-white/[0.06]"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
          >
            <NoiseGradient tone={HERO_TONE} />
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
      </Motion>

      {/* Body — the industry's rich-text content, rendered through the shared Lexical converter. */}
      {industry.content && (
        <Motion tag="section" className={SECTION_SHELL} {...reveal}>
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
            <SectionHeader index={1} label="Overview" heading="Where we focus" className="shrink-0 lg:w-[28%]" />

            <div className="min-w-0 flex-1">
              <RichTextComp
                content={industry.content as RichText}
                className="prose-invert max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:tracking-[-0.02em] prose-headings:text-cream prose-p:text-body prose-p:leading-relaxed prose-a:text-cream prose-strong:text-cream prose-li:text-body"
              />
            </div>
          </div>
        </Motion>
      )}

      {/* Related industries */}
      {relatedIndustries.length > 0 && (
        <Motion tag="section" className={SECTION_SHELL} {...reveal}>
          <SectionHeader index={2} label="Related industries" heading="Explore more verticals" className="mb-10" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedIndustries.map((item, index) => (
              <RelatedCard key={item.id} industry={item} locale={typedLocale} index={index} />
            ))}
          </div>
        </Motion>
      )}

      {/* CTA — the page's signature noise-gradient moment. */}
      <Motion
        tag="section"
        className="relative overflow-hidden rounded-md border border-white/[0.06] p-8 lg:p-12"
        {...reveal}
      >
        <NoiseGradient tone={CTA_TONE} />

        <div className="relative z-10 flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <Motion className="flex max-w-xl flex-col items-start gap-3" {...revealItem(0)}>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.02em] text-cream">
              {industry.title ? `Building for ${industry.title}?` : "Let's build what's next"}
            </h2>
            <p className="max-w-lg text-[14px] leading-relaxed text-cream/75">
              Tell us where you&apos;re headed and we&apos;ll map the engineering path to get there.
            </p>
          </Motion>

          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row lg:ml-auto">
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
