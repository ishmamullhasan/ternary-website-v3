import Motion from '@/components/animation/motion'
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
import type { JSX, ReactNode } from 'react'

// SSG + ISR: prebuild known slugs (generateStaticParams below) and serve them statically, then
// revalidate every 5 minutes. dynamicParams lets slugs not in the prebuilt set render on demand.
export const revalidate = 300
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
  ['solution_related'],
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
  return unstable_cache(() => fetchSolutionBySlug(slug, locale), [`solution_${slug}_${locale}`], {
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

// Eyebrow: uniform Inter uppercase micro-typography for section labels.
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

// Outlined hairline chip, consistent with the rest of the system's static pills.
function Pill({ children }: { children: ReactNode }): JSX.Element {
  return (
    <span className="inline-flex items-center rounded-md border border-line-strong/80 px-3 py-1 text-[12px] text-body">
      {children}
    </span>
  )
}

// Reusable section shell: near-black bordered panel with generous editorial padding.
const SECTION_SHELL = 'rounded-md border border-white/[0.06] bg-ink p-6 lg:p-12'

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

  // Focus-visible affordance shared across every interactive element.
  const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

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
            {/* Small ID / discipline row above the headline, mirrors the capability hero. */}
            <p className="text-[12px] uppercase tracking-[0.14em] text-subtle">
              {solution.title ? `Solution — ${solution.title}` : 'Solution'}
            </p>

            <h1 className="font-display text-[clamp(2rem,4.5vw,2.875rem)] font-medium leading-[1.08] tracking-[-0.03em] text-cream">
              {solution.title}
            </h1>

            {solution.excerpts && (
              <p className="max-w-xl text-[15px] leading-relaxed text-body lg:text-[16px]">{solution.excerpts}</p>
            )}

            <Link
              href={`/${typedLocale}/solutions`}
              className={cn(
                'mt-1 inline-flex items-center gap-2 rounded-md border border-line-strong bg-transparent px-5 py-2.5 text-[14px] font-medium text-cream transition-colors duration-300 hover:border-subtle hover:bg-white/[0.04]',
                focusRing,
              )}
            >
              All solutions
              <ArrowUpRight size={15} strokeWidth={2} aria-hidden />
            </Link>
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
                alt={heroImage.alt || solution.title || 'Solution hero'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            )}
          </Motion>
        </div>
      </Motion>

      {/* Overview — the solution's rich-text body, rendered via the shared Lexical converter. */}
      {hasContent && (
        <Motion tag="section" className={SECTION_SHELL} {...reveal}>
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
            <SectionHeader
              index={1}
              label="Overview"
              heading={solution.title ? `Inside ${solution.title}` : 'Overview'}
              className="shrink-0 lg:w-[28%]"
            />

            <div className="min-w-0 flex-1">
              <RichTextComp
                content={solution.content as RichText}
                className="prose-invert max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:tracking-[-0.01em] prose-headings:text-cream prose-p:text-body prose-li:text-body prose-a:text-cream"
              />
            </div>
          </div>
        </Motion>
      )}

      {/* Related solutions */}
      {relatedSolutions.length > 0 && (
        <Motion tag="section" className={SECTION_SHELL} {...reveal}>
          <SectionHeader index={2} label="Related solutions" heading="Explore more" className="mb-10" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedSolutions.map((item, index) => (
              <Motion key={item.id ?? `related-${index}`} {...revealItem(index)}>
                <Link
                  href={`/${typedLocale}/solutions/${item.slug}`}
                  className={cn(
                    'group flex h-full flex-col gap-2 rounded-md border border-white/[0.07] bg-white/[0.015] p-6 transition-colors duration-300 hover:border-white/[0.16] hover:bg-white/[0.03]',
                    focusRing,
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-[16px] font-medium text-cream">{item.title}</h3>
                    <ArrowUpRight
                      size={15}
                      strokeWidth={2}
                      aria-hidden
                      className="shrink-0 text-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cream"
                    />
                  </div>
                  {item.excerpts && <p className="text-[13px] leading-relaxed text-subtle">{item.excerpts}</p>}
                </Link>
              </Motion>
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
            <Pill>Let&apos;s talk</Pill>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.02em] text-cream">
              {solution.title ? `Ready to put ${solution.title} to work?` : 'Ready to get started?'}
            </h2>
            <p className="max-w-lg text-[14px] leading-relaxed text-cream/75">
              Tell us where you are today and we&apos;ll map the fastest path to outcomes that matter.
            </p>
          </Motion>

          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row lg:ml-auto">
            <Link
              href={`/${typedLocale}/contact`}
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-md bg-cream px-5 py-2.5 text-[14px] font-medium text-ink transition-colors duration-300 hover:bg-cream-hover sm:w-auto',
                focusRing,
              )}
            >
              Start a conversation
              <ArrowRight size={15} strokeWidth={2} aria-hidden />
            </Link>
            <Link
              href={`/${typedLocale}/solutions`}
              className={cn(
                'inline-flex w-full items-center justify-center rounded-md border border-white/20 bg-white/[0.06] px-5 py-2.5 text-[14px] font-medium text-cream transition-colors duration-300 hover:bg-white/[0.12] sm:w-auto',
                focusRing,
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
