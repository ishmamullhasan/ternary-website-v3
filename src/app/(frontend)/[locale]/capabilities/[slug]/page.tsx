import Motion from '@/components/animation/motion'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import { cn } from '@/lib/utils'
import type { Capability, Media, Team } from '@/payload-types'
import config from '@/payload.config'
import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

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
    tags: [`capability_${slug}`, 'capability'],
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

  return generateMeta({
    doc: capability,
    fallbackTitle: 'Capability',
    fallbackDescription: capability.excerpts || capability.heroSection?.description,
    pathname: `/capabilities/${slug}`,
    locale: typedLocale,
  })
}

const motionSectionProps = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

const motionBlockProps = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.4 as const },
  transition: { duration: 0.35, ease: 'easeOut' as const },
}

const motionGridItemProps = {
  initial: { opacity: 0, scale: 0.985 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: false, amount: 0.35 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

function SectionHeader({
  label,
  heading,
  description,
  className,
}: {
  label?: string | null
  heading?: string | null
  description?: string | null
  className?: string
}) {
  if (!heading && !description && !label) return null

  return (
    <Motion className={cn('flex flex-col gap-4', className)} {...motionBlockProps}>
      {label && <p className="text-xs text-[#D5D5D5] tracking-tight">{label}</p>}
      {heading && <h2 className="lg:text-3xl text-2xl font-medium tracking-tight leading-[1.15]">{heading}</h2>}
      {description && <p className="text-base text-[#D5D5D5] max-w-3xl leading-relaxed">{description}</p>}
    </Motion>
  )
}

function StackTags({ tags }: { tags?: { name?: string | null; id?: string | null }[] | null }) {
  if (!tags?.length) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag, index) => (
        <span
          key={tag.id ?? `tag-${index}`}
          className="text-xs border border-[#757571] px-4 py-1 rounded-full text-[#F4F3EC]"
        >
          {tag.name}
        </span>
      ))}
    </div>
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
  const capability = await getCapabilityBySlug(slug, typedLocale)

  if (!capability) {
    notFound()
  }

  const heroImage = capability.heroSection?.heroImage as Media | undefined
  const practiceMember = capability.practiceLead?.member as Team | undefined
  const memberImage = practiceMember?.image as Media | undefined
  const relatedCapabilities = (capability.relatedCapabilities?.capabilities as Capability[] | undefined)?.filter(
    (item) => item.id !== capability.id,
  )

  return (
    <div className="flex flex-col lg:gap-32 gap-10 text-primary max-w-7xl mx-auto w-full px-5 lg:pb-24 pb-10">
      {/* Hero */}
      <Motion tag="section" className="w-full lg:pt-16 lg:pb-8 pt-8 pb-4" {...motionSectionProps}>
        <div className="w-full mx-auto flex flex-col lg:flex-row lg:items-center gap-8 px-4 lg:px-0">
          <Motion className="flex flex-col items-start text-left lg:w-1/2 gap-6" {...motionBlockProps}>
            {capability.heroSection?.badge && (
              <span className="inline-block border border-[#757571] text-sm px-4 py-1 rounded-full text-[#F4F3EC]">
                {capability.heroSection.badge}
              </span>
            )}
            <h1 className="lg:text-4xl text-3xl font-medium tracking-tight leading-[1.15]">
              {capability.heroSection?.heading || capability.title}
            </h1>
            <p className="lg:text-base text-sm text-[#D5D5D5] max-w-xl">
              {capability.heroSection?.description || capability.excerpts}
            </p>
            {capability.heroSection?.button?.label && (
              <Link
                href={capability.heroSection.button.link || '#'}
                className="px-4 py-2 bg-[#F4F3EC] text-[#0F0E0E] font-medium rounded-lg text-base"
              >
                {capability.heroSection.button.label}
              </Link>
            )}
          </Motion>

          {heroImage?.url && (
            <Motion
              className="relative lg:w-1/2 w-full h-[280px] lg:h-[458px] rounded-md overflow-hidden"
              {...motionGridItemProps}
            >
              <Image
                src={heroImage.url}
                alt={heroImage.alt || capability.title || 'Capability hero'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </Motion>
          )}
        </div>
      </Motion>

      {/* What this means to us */}
      {capability.whatThisMeansToUs?.heading && (
        <Motion tag="section" className="bg-[#1B1A17] lg:p-10 p-6 rounded-lg lg:m-0 m-4" {...motionSectionProps}>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <SectionHeader
              label={capability.whatThisMeansToUs.sectionLabel ?? undefined}
              heading={capability.whatThisMeansToUs.heading}
              description={capability.whatThisMeansToUs.description}
              className="lg:w-2/5 shrink-0"
            />

            <div className="flex flex-col gap-8 lg:w-3/5">
              {capability.whatThisMeansToUs.items?.map((item, index) => (
                <Motion
                  key={item.id ?? `means-${index}`}
                  className="flex gap-6 items-start"
                  {...motionGridItemProps}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.05 }}
                >
                  <span className="text-[10px] tracking-[0.18em] uppercase text-[#F4F3EC] pt-1 shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-medium">{item.title}</h3>
                    <p className="text-base text-[#757571] leading-relaxed">{item.excerpt}</p>
                  </div>
                </Motion>
              ))}
            </div>
          </div>
        </Motion>
      )}

      {/* How we do it */}
      {capability?.howWeDoIt?.heading && (
        <Motion tag="section" className="bg-[#1B1A17] lg:p-10 p-6 rounded-lg lg:m-0 m-4" {...motionSectionProps}>
          <SectionHeader
            label={capability.howWeDoIt.sectionLabel ?? undefined}
            heading={capability.howWeDoIt.heading}
            description={capability.howWeDoIt.description}
            className="mb-8"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {capability.howWeDoIt.items?.map((item, index) => {
              const isFeatured = index === 0 || index === 3

              return (
                <Motion
                  key={item.id ?? `practice-${index}`}
                  className={cn(
                    'bg-[#0F0E0E] p-6 rounded flex flex-col justify-between min-h-[280px]',
                    isFeatured ? 'lg:col-span-2' : 'lg:col-span-1',
                  )}
                  {...motionGridItemProps}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.05 }}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-[#757571]">{String(index + 1).padStart(2, '0')}</span>
                        <h3 className="text-xl lg:text-2xl font-medium tracking-tight">{item.title}</h3>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F4F3EC] shrink-0 mt-2" />
                    </div>
                    <p className="text-base text-[#D5D5D5] leading-relaxed">{item.excerpt}</p>
                  </div>

                  {item.stack && item.stack.length > 0 && (
                    <div className="mt-6 flex flex-col gap-2">
                      <span className="text-xs text-[#757571]">Stack</span>
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
        <Motion tag="section" className="bg-[#1B1A17] lg:p-10 p-6 rounded-lg lg:m-0 m-4" {...motionSectionProps}>
          <SectionHeader
            label={capability.caseStudies.sectionLabel ?? undefined}
            heading={capability.caseStudies.heading}
            description={capability.caseStudies.description}
            className="mb-8"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capability.caseStudies.items?.map((item, index) => (
              <Motion
                key={item.id ?? `case-${index}`}
                className="bg-[#0F0E0E] p-6 rounded-lg flex flex-col justify-between min-h-[400px]"
                {...motionGridItemProps}
                transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.05 }}
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    {item.meta && <span className="text-xs text-[#757571]">{item.meta}</span>}
                    <h3 className="text-base font-medium leading-snug">{item.title}</h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {item.problem && (
                      <div>
                        <p className="text-xs text-[#757571] mb-1">Problem</p>
                        <p className="text-sm text-[#D5D5D5] leading-relaxed">{item.problem}</p>
                      </div>
                    )}
                    {item.approach && (
                      <div>
                        <p className="text-xs text-[#757571] mb-1">Approach</p>
                        <p className="text-sm text-[#D5D5D5] leading-relaxed">{item.approach}</p>
                      </div>
                    )}
                    {item.outcome && (
                      <div>
                        <p className="text-xs text-[#757571] mb-1">Outcome</p>
                        <p className="text-sm text-[#D5D5D5] leading-relaxed">{item.outcome}</p>
                      </div>
                    )}
                  </div>
                </div>

                {(item.metricValue || item.metricLabel) && (
                  <div className="flex items-end gap-2 mt-6">
                    {item.metricValue && (
                      <span className="text-3xl font-medium tracking-tight">{item.metricValue}</span>
                    )}
                    {item.metricLabel && <span className="text-xs text-[#757571] pb-1">{item.metricLabel}</span>}
                  </div>
                )}
              </Motion>
            ))}
          </div>
        </Motion>
      )}

      {/* Practice lead */}
      {practiceMember && (
        <Motion tag="section" className="bg-[#1B1A17] lg:p-10 p-6 rounded-lg lg:m-0 m-4" {...motionSectionProps}>
          {capability.practiceLead?.sectionLabel && (
            <p className="text-xs text-[#D5D5D5] mb-6">{capability.practiceLead.sectionLabel}</p>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            <Motion
              className="relative w-full lg:w-[320px] h-[320px] lg:h-[388px] rounded-lg overflow-hidden shrink-0"
              {...motionGridItemProps}
            >
              {memberImage?.url ? (
                <Image
                  src={memberImage.url}
                  alt={practiceMember.name || 'Practice lead'}
                  fill
                  className="object-cover"
                  sizes="320px"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F0E0E]" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-medium mb-2">{practiceMember.name}</h3>
                {practiceMember.position && (
                  <span className="inline-block border border-[#757571] text-xs px-4 py-1 rounded-full">
                    {practiceMember.position}
                  </span>
                )}
              </div>
            </Motion>

            <div className="flex flex-col gap-4 flex-1">
              {(capability.practiceLead?.bio || practiceMember.description) && (
                <p className="text-base font-medium leading-relaxed">
                  {capability.practiceLead?.bio || practiceMember.description}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {capability.practiceLead?.credentials && capability.practiceLead.credentials.length > 0 && (
                  <div className="bg-[#0F0E0E] p-4 rounded flex flex-col gap-4">
                    <span className="text-xs text-[#757571]">Credentials</span>
                    <ul className="flex flex-col gap-3">
                      {capability.practiceLead.credentials.map((item, index) => (
                        <li key={item.id ?? `cred-${index}`} className="flex gap-2 text-xs">
                          <span className="text-[#757571] shrink-0">{String(index + 1).padStart(2, '0')}</span>
                          <span className="text-[#D5D5D5]">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {capability.practiceLead?.writings && capability.practiceLead.writings.length > 0 && (
                  <div className="bg-[#0F0E0E] p-4 rounded flex flex-col gap-4">
                    <span className="text-xs text-[#757571]">Recent writing &amp; talks</span>
                    <ul className="flex flex-col gap-3">
                      {capability.practiceLead.writings.map((item, index) => (
                        <li key={item.id ?? `writing-${index}`} className="flex flex-col gap-1">
                          {item.link ? (
                            <Link href={item.link} className="text-sm hover:underline">
                              {item.title}
                            </Link>
                          ) : (
                            <span className="text-sm">{item.title}</span>
                          )}
                          {item.category && <span className="text-xs text-[#757571]">{item.category}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {capability.practiceLead?.email && (
                  <Link
                    href={`mailto:${capability.practiceLead.email}`}
                    className="inline-flex items-center gap-2 text-xs border border-[#757571] px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
                  >
                    <Mail size={14} />
                    {capability.practiceLead.email}
                  </Link>
                )}
                {practiceMember.linkedin && (
                  <Link
                    href={practiceMember.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs border border-[#757571] px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
                  >
                    <Linkedin size={14} />
                    LinkedIn
                  </Link>
                )}
                {capability.practiceLead?.github && (
                  <Link
                    href={capability.practiceLead.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs border border-[#757571] px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
                  >
                    <Github size={14} />
                    GitHub
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Motion>
      )}

      {/* Related capabilities */}
      {capability.relatedCapabilities?.heading && relatedCapabilities && relatedCapabilities.length > 0 && (
        <Motion tag="section" className="bg-[#1B1A17] lg:p-10 p-6 rounded-lg lg:m-0 m-4" {...motionSectionProps}>
          <SectionHeader
            label={capability.relatedCapabilities.sectionLabel ?? undefined}
            heading={capability.relatedCapabilities.heading}
            className="mb-8"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedCapabilities.map((item, index) => (
              <Motion
                key={item.id ?? `related-${index}`}
                {...motionGridItemProps}
                transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.05 }}
              >
                <Link
                  href={`/${typedLocale}/capabilities/${item.slug}`}
                  className="bg-[#0F0E0E] p-6 rounded flex flex-col gap-2 group hover:bg-[#14120B] transition-colors h-full"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-medium">{item.title}</h3>
                    <ArrowUpRight
                      size={14}
                      className="shrink-0 text-[#757571] group-hover:text-[#F4F3EC] transition-colors"
                    />
                  </div>
                  {item.excerpts && <p className="text-xs text-[#757571] leading-relaxed">{item.excerpts}</p>}
                </Link>
              </Motion>
            ))}
          </div>
        </Motion>
      )}

      {/* CTA Section */}
      <Motion
        tag="section"
        className="lg:p-10 p-6 rounded-lg overflow-hidden lg:m-0 m-4 relative border border-white/[0.04]"
        style={{
          background: (capability.cta?.backgroundImage as Media)?.url
            ? `url(${(capability.cta?.backgroundImage as Media)?.url}) center/cover no-repeat`
            : 'linear-gradient(135deg, #1e3a5f 0%, #4c1d95 60%, #2e1065 100%)', // Fallback matching image_4c91c8.jpg
        }}
        {...motionSectionProps}
      >
        {/* Grain/Texture Overlay Effect (Optional simulation matching the texture in image_4c91c8.jpg) */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=10')] bg-repeat" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 max-w-6xl mx-auto">
          {/* Left Side: Typography */}
          <Motion className="flex flex-col items-start text-left lg:max-w-xl" {...motionBlockProps}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight mb-3 text-white leading-[1.2]">
              {capability.cta?.heading}
            </h2>
            <p className="text-xs md:text-sm text-[#D5D5D5]/80 max-w-lg leading-relaxed">
              {capability.cta?.description}
            </p>
          </Motion>

          {/* Right Side: Action Buttons */}
          <div className="flex sm:flex-row flex-col gap-3 items-center shrink-0 lg:ml-auto">
            {capability.cta?.button_1?.label && (
              <Link
                href={capability.cta?.button_1?.link as string}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#14120B] font-medium rounded-2xl text-base"
              >
                {capability.cta?.button_1?.label}
              </Link>
            )}
            {capability.cta?.button_2?.label && (
              <Link
                href={capability.cta?.button_2?.link as string}
                className="px-5 sm:w-auto w-full py-2.5 bg-[#F4F3EC] text-[#0F0E0E] font-medium rounded-2xl text-base"
              >
                {capability.cta?.button_2?.label}
              </Link>
            )}
          </div>
        </div>
      </Motion>
    </div>
  )
}
