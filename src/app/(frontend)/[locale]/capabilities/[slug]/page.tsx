import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import { cn } from '@/lib/utils'
import type { Capability, Media, Team } from '@/payload-types'
import config from '@/payload.config'
import { getNodeText } from '@/utilities/headings'
import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { CSSProperties, JSX, ReactNode } from 'react'

// SSG: prebuild known slugs (generateStaticParams below) and serve them statically. Freshness is
// purely tag-driven (no time-based revalidate) — the capability afterChange/afterDelete hooks bust
// the tags below. dynamicParams lets slugs not in the prebuilt set render on demand.
export const dynamicParams = true

const getCapabilityList = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'capability',
      limit: 100,
      depth: 0,
    })
    return result.docs
  },
  ['capability'],
  { tags: ['capability'] },
)

async function fetchCapabilityBySlug(slug: string, locale: TypedLocale): Promise<Capability | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'capability',
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
    depth: 2,
  })
  return (result.docs[0] as Capability | undefined) ?? null
}

// Tag-based ISR (WEB-457): published reads are cached and busted on-demand by the
// `revalidateTag('capability')` / `revalidateTag('capability_<slug>')` calls in the capability
// afterChange hook. In draft mode (live preview) we bypass the cache so editors see fresh data.
async function getCapabilityBySlug(slug: string, locale: TypedLocale): Promise<Capability | null> {
  const { isEnabled: draft } = await draftMode()
  if (draft) return fetchCapabilityBySlug(slug, locale)
  return unstable_cache(() => fetchCapabilityBySlug(slug, locale), [`capability_${slug}_${locale}`], {
    // `team`: the practice-lead section embeds a team doc (depth 2), so editing that team member
    // must bust this page too.
    tags: [`capability_${slug}`, 'capability', 'team'],
  })()
}

export async function generateStaticParams() {
  const capabilities = await getCapabilityList()
  // Cross-product: one entry per {locale, slug}.
  return LOCALES.flatMap((locale) => capabilities.map((capability) => ({ locale, slug: capability.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) return {}
  const capability = await getCapabilityBySlug(slug, typedLocale)

  if (!capability) return {}

  // heroSection.description is Lexical richText now — flatten to plain text for the meta tag.
  // (Unmigrated DB rows may still hold a plain string; pass those through untouched.)
  const heroDescription = capability.heroSection?.description as RichText | string | null | undefined
  const heroDescriptionText =
    typeof heroDescription === 'string' ? heroDescription : heroDescription ? getNodeText(heroDescription.root) : null

  return generateMeta({
    doc: capability,
    fallbackTitle: 'Capability',
    fallbackDescription: capability.excerpts || heroDescriptionText,
    pathname: `/capabilities/${slug}`,
    locale: typedLocale,
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

// Eyebrow: "Section 0X / Label" or a plain label. Uniform Inter uppercase micro-typography.
function Eyebrow({ index, label }: { index?: number; label?: string | null }): JSX.Element | null {
  if (!label) return null
  return (
    <p className="text-[12px] text-subtle">
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
  description?: RichText | null
  className?: string
}): JSX.Element | null {
  if (!heading && !description && !label) return null

  return (
    <Motion className={cn('flex flex-col gap-4', className)} {...reveal}>
      <Eyebrow index={index} label={label} />
      {heading && (
        <h2 className="font-display text-[clamp(1.6rem,3vw,1.875rem)] font-medium leading-[1.1] tracking-[-0.05em] text-cream whitespace-pre-line">
          {heading}
        </h2>
      )}
      {description && (
        <RichTextComp
          content={description as RichText}
          className="prose-sm max-w-3xl text-[15px] leading-relaxed text-body"
        />
      )}
    </Motion>
  )
}

// Outlined hairline chip. Optionally interactive (used for nothing clickable here, but the
// hover affordance keeps the static pills consistent with the rest of the system).
function Pill({ children }: { children: ReactNode }): JSX.Element {
  return (
    <span className="inline-flex items-center rounded-full border border-subtle bg-main px-4 py-1 text-[12px] text-cream transition-colors duration-300 hover:border-cream/60">
      {children}
    </span>
  )
}

function StackTags({ tags }: { tags?: { name?: string | null; id?: string | null }[] | null }) {
  if (!tags?.length) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag, index) => (tag.name ? <Pill key={tag.id ?? `tag-${index}`}>{tag.name}</Pill> : null))}
    </div>
  )
}

// Reusable section shell: near-black bordered panel with generous editorial padding.
const SECTION_SHELL = 'rounded-md border border-white/[0.06] bg-card p-6 lg:p-12'

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<JSX.Element> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()
  const capability = await getCapabilityBySlug(slug, typedLocale)

  if (!capability) {
    notFound()
  }

  const hero = capability.heroSection
  const heroImage = hero?.heroImage as Media | undefined
  const practiceMember = capability.practiceLead?.member as Team | undefined
  const memberImage = practiceMember?.image as Media | undefined
  const relatedCapabilities = (capability.relatedCapabilities?.capabilities as Capability[] | undefined)?.filter(
    (item) => item.id !== capability.id,
  )

  const heroButton = hero?.button
  const cta = capability.cta
  const ctaButtons = [cta?.button_1, cta?.button_2].filter((b): b is { label: string; link?: string | null } =>
    Boolean(b?.label),
  )
  const ctaBackground = cta?.backgroundImage as Media | undefined

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
            {/* Single rounded-full badge pill above the headline (design node 1835:7100). */}
            {(hero?.badge || capability.title) && (
              <span className="inline-flex items-center rounded-full border border-subtle bg-card px-4 py-2 text-[15px] text-cream">
                {hero?.badge || capability.title}
              </span>
            )}

            <h1 className="font-display text-[clamp(2rem,4.5vw,2.875rem)] font-medium leading-[1.12] tracking-[-0.04em] text-cream">
              {hero?.heading || capability.title}
            </h1>

            {(hero?.description || capability.excerpts) && (
              <RichTextComp
                content={(hero?.description ?? capability.excerpts) as RichText | string}
                className="max-w-2xl opacity-90 prose-p:mb-0 prose-p:text-[16px] prose-p:font-medium prose-p:leading-relaxed prose-p:text-body"
              />
            )}

            {heroButton?.label && (
              <Link
                href={heroButton.link || '#'}
                className={cn(
                  'mt-1 inline-flex items-center justify-center rounded-md bg-cream px-5 py-2.5 text-[15px] font-medium text-ink transition-colors duration-300 hover:bg-cream-hover',
                  focusRing,
                )}
              >
                {heroButton.label}
              </Link>
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
                alt={heroImage.alt || capability.title || 'Capability hero'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            )}
          </Motion>
        </div>
      </Motion>

      {/* What this means to us */}
      {capability.whatThisMeansToUs?.heading && (
        <Motion tag="section" className={SECTION_SHELL} {...reveal}>
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
            <SectionHeader
              index={1}
              label={capability.whatThisMeansToUs.sectionLabel ?? 'What this means to us'}
              heading={capability.whatThisMeansToUs.heading}
              description={capability.whatThisMeansToUs.description}
              className="shrink-0 lg:w-[28%]"
            />

            <ol className="flex flex-1 flex-col gap-8">
              {capability.whatThisMeansToUs.items?.map((item, index) => (
                <Motion
                  tag="li"
                  key={item.id ?? `means-${index}`}
                  className="flex items-start gap-6"
                  {...revealItem(index)}
                >
                  <span className="shrink-0 pt-1 text-[12px] font-medium tabular-nums tracking-[0.06em] text-subtle">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[16px] font-medium leading-snug text-cream">{item.title}</h3>
                    <p className="max-w-2xl text-[14px] leading-relaxed text-body">{item.excerpt}</p>
                  </div>
                </Motion>
              ))}
            </ol>
          </div>
        </Motion>
      )}

      {/* How we do it */}
      {capability?.howWeDoIt?.heading && (
        <Motion tag="section" className={SECTION_SHELL} {...reveal}>
          <SectionHeader
            index={2}
            label={capability.howWeDoIt.sectionLabel ?? 'How we do it'}
            heading={capability.howWeDoIt.heading}
            description={capability.howWeDoIt.description}
            className="mb-10"
          />

          {/* Alternating wide/narrow rhythm: items 0 & 3 span two columns. */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {capability.howWeDoIt.items?.map((item, index) => {
              const isWide = index === 0 || index === 3

              return (
                <Motion
                  key={item.id ?? `practice-${index}`}
                  className={cn(
                    'group flex min-h-[280px] flex-col justify-between rounded-md border border-white/[0.07] bg-ink p-6 transition-colors duration-300 hover:border-white/[0.14]',
                    isWide ? 'lg:col-span-2' : 'lg:col-span-1',
                  )}
                  {...revealItem(index)}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-[12px] font-medium tabular-nums text-subtle">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="font-display text-[24px] font-medium leading-tight tracking-[-0.05em] text-cream">
                          {item.title}
                        </h3>
                      </div>
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cream/60 transition-colors duration-300 group-hover:bg-cream" />
                    </div>
                    <p className="max-w-xl text-[16px] leading-relaxed text-body">{item.excerpt}</p>
                  </div>

                  {item.stack && item.stack.length > 0 && (
                    <div className="mt-8 flex flex-col gap-3">
                      <span className="text-[12px] text-subtle">Stack</span>
                      <StackTags tags={item.stack} />
                    </div>
                  )}
                </Motion>
              )
            })}
          </div>
        </Motion>
      )}

      {/* Case studies */}
      {capability.caseStudies?.heading && (
        <Motion tag="section" className={SECTION_SHELL} {...reveal}>
          <SectionHeader
            index={3}
            label={capability.caseStudies.sectionLabel ?? 'Case studies'}
            heading={capability.caseStudies.heading}
            description={capability.caseStudies.description}
            className="mb-10"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {capability.caseStudies.items?.map((item, index) => (
              <Motion
                key={item.id ?? `case-${index}`}
                className="group flex min-h-[400px] flex-col justify-between rounded-md border border-white/[0.07] bg-ink p-6 transition-colors duration-300 hover:border-white/[0.14]"
                {...revealItem(index)}
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    {item.meta && <span className="text-[12px] text-subtle">{item.meta}</span>}
                    <h3 className="text-[16px] font-medium leading-snug tracking-[-0.05em] text-cream">{item.title}</h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {item.problem && (
                      <div className="flex flex-col gap-1">
                        <p className="text-[12px] text-subtle">Problem</p>
                        <RichTextComp
                          content={item.problem as RichText}
                          className="prose-sm text-[14px] leading-relaxed text-body"
                        />
                      </div>
                    )}
                    {item.approach && (
                      <div className="flex flex-col gap-1">
                        <p className="text-[12px] text-subtle">Approach</p>
                        <RichTextComp
                          content={item.approach as RichText}
                          className="prose-sm text-[14px] leading-relaxed text-body"
                        />
                      </div>
                    )}
                    {item.outcome && (
                      <div className="flex flex-col gap-1">
                        <p className="text-[12px] text-subtle">Outcome</p>
                        <RichTextComp
                          content={item.outcome as RichText}
                          className="prose-sm text-[14px] leading-relaxed text-body"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {(item.metricValue || item.metricLabel) && (
                  <div className="mt-8 flex items-baseline gap-1">
                    {item.metricValue && (
                      <span className="font-display text-[30px] font-medium leading-none tracking-[-0.05em] text-cream">
                        {item.metricValue}
                      </span>
                    )}
                    {item.metricLabel && <span className="text-[12px] text-subtle">{item.metricLabel}</span>}
                  </div>
                )}
              </Motion>
            ))}
          </div>
        </Motion>
      )}

      {/* Practice lead */}
      {practiceMember && (
        <Motion tag="section" className={SECTION_SHELL} {...reveal}>
          <Eyebrow index={4} label={capability.practiceLead?.sectionLabel ?? 'The practice lead'} />

          <div className="mt-8 flex flex-col gap-8 lg:flex-row">
            <Motion
              className="relative aspect-[320/388] w-full shrink-0 overflow-hidden rounded-md ring-1 ring-white/[0.06] lg:w-[320px]"
              {...revealItem(0)}
            >
              <NoiseGradient tone={HERO_TONE} />
              {memberImage?.url && (
                <Image
                  src={memberImage.url}
                  alt={practiceMember.name || 'Practice lead'}
                  fill
                  className="object-cover"
                  sizes="320px"
                />
              )}
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"
              />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6">
                <h3 className="text-[22px] font-medium leading-tight text-cream">{practiceMember.name}</h3>
                {practiceMember.position && (
                  <span className="inline-flex w-fit items-center rounded-full border border-line-strong/80 px-3 py-1 text-[12px] text-cream">
                    {practiceMember.position}
                  </span>
                )}
              </div>
            </Motion>

            <div className="flex flex-1 flex-col gap-5">
              {capability.practiceLead?.bio ? (
                <RichTextComp
                  content={capability.practiceLead.bio as RichText}
                  className="max-w-3xl text-[16px] font-medium leading-relaxed text-body"
                />
              ) : (
                practiceMember.description && (
                  <RichTextComp
                    content={practiceMember.description as RichText}
                    className="max-w-3xl text-[16px] font-medium leading-relaxed text-body"
                  />
                )
              )}

              <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                {capability.practiceLead?.credentials && capability.practiceLead.credentials.length > 0 && (
                  <div className="flex flex-col gap-4 rounded-md border border-white/[0.07] bg-ink p-5">
                    <span className="text-[12px] uppercase tracking-[0.14em] text-subtle">Credentials</span>
                    <ul className="flex flex-col gap-3">
                      {capability.practiceLead.credentials.map((item, index) => (
                        <li key={item.id ?? `cred-${index}`} className="flex gap-2 text-[12px]">
                          <span className="shrink-0 tabular-nums text-subtle">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="text-body">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {capability.practiceLead?.writings && capability.practiceLead.writings.length > 0 && (
                  <div className="flex flex-col gap-4 rounded-md border border-white/[0.07] bg-ink p-5">
                    <span className="text-[12px] uppercase tracking-[0.14em] text-subtle">
                      Recent writing &amp; talks
                    </span>
                    <ul className="flex flex-col gap-4">
                      {capability.practiceLead.writings.map((item, index) => (
                        <li key={item.id ?? `writing-${index}`} className="flex flex-col gap-1">
                          {item.link ? (
                            <Link
                              href={item.link}
                              className={cn(
                                'w-fit rounded-sm text-[16px] text-cream transition-colors duration-200 hover:text-cream/70',
                                focusRing,
                              )}
                            >
                              {item.title}
                            </Link>
                          ) : (
                            <span className="text-[16px] text-cream">{item.title}</span>
                          )}
                          {item.category && <span className="text-[12px] text-subtle">{item.category}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {(capability.practiceLead?.email || practiceMember.linkedin || capability.practiceLead?.github) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {capability.practiceLead?.email && (
                    <Link
                      href={`mailto:${capability.practiceLead.email}`}
                      className={cn(
                        'inline-flex items-center bg-ink gap-2 rounded-full border border-line-strong/80 px-4 py-2 text-[13px] text-body transition-colors duration-300 hover:border-subtle hover:text-cream',
                        focusRing,
                      )}
                    >
                      <Mail size={14} aria-hidden />
                      {capability.practiceLead.email}
                    </Link>
                  )}
                  {practiceMember.linkedin && (
                    <Link
                      href={practiceMember.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'inline-flex items-center bg-ink gap-2 rounded-full border border-line-strong/80 px-4 py-2 text-[13px] text-body transition-colors duration-300 hover:border-subtle hover:text-cream',
                        focusRing,
                      )}
                    >
                      <Linkedin size={14} aria-hidden />
                      LinkedIn
                    </Link>
                  )}
                  {capability.practiceLead?.github && (
                    <Link
                      href={capability.practiceLead.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'inline-flex items-center bg-ink gap-2 rounded-full border border-line-strong/80 px-4 py-2 text-[13px] text-body transition-colors duration-300 hover:border-subtle hover:text-cream',
                        focusRing,
                      )}
                    >
                      <Github size={14} aria-hidden />
                      GitHub
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </Motion>
      )}

      {/* Related capabilities */}
      {capability.relatedCapabilities?.heading && relatedCapabilities && relatedCapabilities.length > 0 && (
        <Motion tag="section" className={SECTION_SHELL} {...reveal}>
          <SectionHeader
            index={5}
            label={capability.relatedCapabilities.sectionLabel ?? 'Related capabilities'}
            heading={capability.relatedCapabilities.heading}
            className="mb-10"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedCapabilities.map((item, index) => (
              <Motion key={item.id ?? `related-${index}`} {...revealItem(index)}>
                <Link
                  href={`/${typedLocale}/capabilities/${item.slug}`}
                  className={cn(
                    'group flex h-full flex-col gap-2 rounded-md border border-white/[0.07] bg-ink p-6 transition-colors duration-300 hover:border-white/[0.16]',
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
                  {item.excerpts && <p className="text-[12px] leading-relaxed text-subtle">{item.excerpts}</p>}
                </Link>
              </Motion>
            ))}
          </div>
        </Motion>
      )}

      {/* CTA — the page's signature noise-gradient moment. Guarded so empty records degrade. */}
      {cta?.heading && (
        <Motion
          tag="section"
          className="relative overflow-hidden rounded-md border border-white/[0.06] p-8 lg:p-12"
          {...reveal}
        >
          {ctaBackground?.url ? (
            <span
              aria-hidden
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${ctaBackground.url})` } as CSSProperties}
            />
          ) : null}
          <NoiseGradient tone={CTA_TONE} className={ctaBackground?.url ? 'opacity-90 mix-blend-multiply' : ''} />

          <div className="relative z-10 flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <Motion className="flex max-w-xl flex-col items-start gap-3" {...revealItem(0)}>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.02em] text-cream">
                {cta.heading}
              </h2>
              {cta.description && (
                <RichTextComp
                  content={cta.description as RichText}
                  className="max-w-lg prose-p:mb-0 prose-p:text-[14px] prose-p:leading-relaxed prose-p:text-cream/75"
                />
              )}
            </Motion>

            {ctaButtons.length > 0 && (
              <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row lg:ml-auto">
                {ctaButtons.map((button, index) => {
                  const isPrimary = index === 0
                  return (
                    <Link
                      key={`${button.label}-${index}`}
                      href={button.link || '#'}
                      className={cn(
                        'inline-flex w-full items-center justify-center rounded-md px-5 py-2.5 text-[14px] font-medium transition-colors duration-300 sm:w-auto',
                        isPrimary
                          ? 'bg-cream text-ink hover:bg-cream-hover'
                          : 'border border-white/20 bg-white/[0.06] text-cream hover:bg-white/[0.12]',
                        focusRing,
                      )}
                    >
                      {button.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </Motion>
      )}
    </div>
  )
}
