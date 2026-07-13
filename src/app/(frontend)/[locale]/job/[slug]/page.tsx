import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import InterviewProcess from '@/components/sections/interviewProcess'
import Jobs from '@/components/sections/job'
import JsonLd from '@/components/seo/JsonLd'
import { careersBg, careersBorder, careersText } from '@/lib/careers-colors'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { formatComp, getJob, getJobs, getRelatedJobs } from '@/lib/jobs-data'
import { generateMeta } from '@/lib/seo/generateMeta'
import { breadcrumbList, jobPosting } from '@/lib/seo/jsonLd'
import { getServerSideURL } from '@/utilities/getURL'
import { ArrowLeft, ArrowRight, DollarSign, GitCommitHorizontal, ShieldAlert, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { JSX, ReactNode } from 'react'

// SSG + ISR: prebuild known slugs (generateStaticParams below) and serve them statically. Jobs come
// from the external recruiting API and change less often, so revalidate hourly. dynamicParams lets
// slugs not in the prebuilt set render on demand.
export const revalidate = 3600
export const dynamicParams = true

/**
 * Section eyebrow — the small uppercase label preceded by a short rule (design's "— The Mission"
 * device). Inter caption (12px), 0.14em tracking, muted; the rule is a faint hairline so it reads
 * as a quiet structural marker rather than a divider.
 */
function SectionEyebrow({ children }: { children: ReactNode }): JSX.Element {
  return (
    <h2 className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.14em] text-subtle">
      <span aria-hidden className="h-px w-6 bg-line-strong" />
      {children}
    </h2>
  )
}

// Data comes from `@/lib/jobs-data`: the live public recruiting API, with Payload CMS marketing
// copy merged in by getJob() (keyed by role `code` — see mergeJobCms). The locale drives the URL
// prefix (links, canonical, hreflang) and is threaded to getJob for forward-compat with CMS
// localization (job copy is identical across locales today). ✅ = API · 🟡 = CMS · 🔒 = internal.

export async function generateStaticParams() {
  const jobs = await getJobs()
  // Cross-product: one entry per {locale, slug}.
  return LOCALES.flatMap((locale) => jobs.map((job) => ({ locale, slug: job.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) return {}
  const jobData = await getJob(slug, typedLocale)

  if (!jobData) return {}

  // Jobs come from the recruiting API (not a Payload collection), so there's no `meta` group —
  // pass a title-only synthetic doc; generateMeta applies site defaults for everything else.
  // Title reads "<job title> | Job" and the layout template appends " | Ternary".
  return generateMeta({
    doc: { title: jobData.title ? `${jobData.title} | Job` : null },
    fallbackTitle: 'Job',
    // ✅ excerpt (API) → fall back to body_markdown
    fallbackDescription: jobData.excerpt || jobData.body_markdown,
    pathname: `/job/${slug}`,
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

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<JSX.Element> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()
  const jobData = await getJob(slug, typedLocale)

  if (!jobData) notFound() // maps to API 404 {"detail": "role not open or no active JD"}

  // Related roles are non-essential: a transient list-fetch failure should not break the JD page.
  let relatedJobs: Awaited<ReturnType<typeof getRelatedJobs>> = []
  try {
    relatedJobs = await getRelatedJobs(slug)
  } catch {
    relatedJobs = []
  }

  const baseUrl = getServerSideURL()
  const jobUrl = `${baseUrl}/${typedLocale}/job/${slug}`
  const jobLd = jobPosting({
    title: jobData.title ?? 'Job',
    description: jobData.excerpt || jobData.body_markdown,
    datePosted: jobData.published_at,
    employmentType: jobData.employment_type,
    locationName: jobData.location,
    url: jobUrl,
  })

  const breadcrumbsLd = breadcrumbList([
    { name: 'Home', url: `${baseUrl}/${typedLocale}` },
    { name: 'Careers', url: `${baseUrl}/${typedLocale}/careers` },
    { name: jobData.title ?? 'Job', url: jobUrl },
  ])

  // ✅ Compensation from the API band; facets are nullable (render only when present).
  const compDisplay = formatComp(jobData.comp_band_min, jobData.comp_band_max, jobData.comp_currency)
  const employmentType = jobData.employment_type
  const seniority = jobData.seniority_level
  const equity = jobData.comp_equity
  const compNote = jobData.comp_note

  // Dot-separated hero info row — render only the facets the API returns, so a sparse role
  // degrades to a clean shorter row instead of dangling separators.
  const infoFacts = [
    { label: 'Type', value: employmentType },
    { label: 'Department', value: jobData.department },
    { label: 'Location', value: jobData.location },
    { label: 'Experience Level', value: seniority },
    { label: 'Team', value: jobData.team },
    { label: 'Compensation', value: compDisplay },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value))

  // JD body + lists are ✅ API-backed; section titles are 🟡 CMS.
  const missionTitle = jobData.details?.item1?.title || 'The Mission'
  const missionBody = jobData.body_markdown || jobData.details?.item1?.description
  const responsibilities = jobData.responsibilities ?? []
  const requirements = jobData.requirements ?? []
  const niceToHaves = jobData.nice_to_haves ?? []

  // 🟡 CMS sidebar blocks.
  const showTeamBox = Boolean(
    jobData.teamBox?.reportingToName?.trim() ||
    jobData.teamBox?.reportingToRole?.trim() ||
    jobData.teamBox?.podSize?.trim() ||
    jobData.teamBox?.crossFunctional?.trim(),
  )
  const compensationBase = compDisplay
  const showCompensationBox = Boolean(compensationBase || equity || compNote)

  return (
    <div className={`min-h-screen ${careersBg.page} ${careersText.cream} font-sans selection:bg-white/20`}>
      <JsonLd data={jobLd} />
      <JsonLd data={breadcrumbsLd} />
      <div className="pb-24 max-w-7xl mx-auto px-5 space-y-24 lg:space-y-28">
        {/* Hero */}
        <Motion tag="section" {...motionSectionProps}>
          <div className={`w-full ${careersText.body}`}>
            <Motion className="flex items-center justify-between mb-10" {...motionBlockProps}>
              <Link
                href={`/${typedLocale}/careers`}
                className={`group inline-flex items-center gap-2 text-sm ${careersText.muted} hover:text-cream transition-colors rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream`}
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                Careers Hub
              </Link>

              <div className="flex items-center gap-5">
                {/* 🔒 code — internal-only; shown per design, falls back to slug */}
                {(jobData.code || jobData.slug) && (
                  <span className="text-[12px] text-subtle font-mono tracking-[0.14em] uppercase">
                    {jobData.code || jobData.slug}
                  </span>
                )}
                {/* Apply button → in-app form (POST /applications/{slug}). applyButton.* is 🟡 CMS override. */}
                <Link
                  href={jobData.applyButton?.link || `/${typedLocale}/job/${jobData.slug}/apply`}
                  className={`group/apply inline-flex items-center gap-2 ${careersBg.button} ${careersBg.buttonHover} ${careersText.onLight} font-medium text-sm px-5 py-2.5 rounded-md transition-[background-color,box-shadow] duration-200 hover:shadow-[0_8px_24px_-12px_rgba(244,243,236,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream`}
                >
                  {jobData.applyButton?.label || 'Apply Now'}
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover/apply:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </Motion>

            <Motion
              className="space-y-4"
              {...motionBlockProps}
              transition={{ ...motionBlockProps.transition, delay: 0.06 }}
            >
              <h1 className="font-display text-[clamp(2rem,4.5vw,2.5rem)] font-medium leading-[1.15] text-cream">
                {jobData.title}
              </h1>
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 list-none text-base text-subtle">
                {infoFacts.map(({ label, value }) => (
                  <li
                    key={label}
                    className="flex items-center gap-x-5 [&:not(:first-child)]:before:size-[6px] [&:not(:first-child)]:before:shrink-0 [&:not(:first-child)]:before:rounded-full [&:not(:first-child)]:before:bg-subtle/60 [&:not(:first-child)]:before:content-['']"
                  >
                    <span>
                      {label}: <span className="text-body font-medium">{value}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Motion>
          </div>
        </Motion>

        {/* Details + Sidebar */}
        <Motion tag="section" className={`w-full ${careersText.body}`} {...motionSectionProps}>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_388px] gap-12 lg:gap-16 items-start">
            <div className="space-y-14">
              {/* The Mission — ✅ body_markdown (plain paragraphs; full Markdown rendering = TODO) */}
              {missionBody && (
                <Motion className="space-y-4" {...motionBlockProps}>
                  <SectionEyebrow>{missionTitle}</SectionEyebrow>
                  <div className="space-y-3">
                    {missionBody
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line, idx) => (
                        <p key={idx} className="text-body text-base leading-relaxed">
                          {line.replace(/^#+\s*/, '')}
                        </p>
                      ))}
                  </div>
                </Motion>
              )}

              {/* What you'll do — ✅ responsibilities[] */}
              {responsibilities.length > 0 && (
                <Motion
                  className="space-y-4"
                  {...motionBlockProps}
                  transition={{ ...motionBlockProps.transition, delay: 0.05 }}
                >
                  <SectionEyebrow>{jobData.details?.item2?.title || "What you'll do"}</SectionEyebrow>
                  <ul className="space-y-3.5">
                    {responsibilities.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-base text-body leading-relaxed">
                        <ArrowRight size={16} className="text-subtle shrink-0 mt-1" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Motion>
              )}

              {/* Who you are — ✅ requirements[] */}
              {requirements.length > 0 && (
                <Motion
                  className="space-y-4"
                  {...motionBlockProps}
                  transition={{ ...motionBlockProps.transition, delay: 0.08 }}
                >
                  <SectionEyebrow>{jobData.details?.item3?.title || 'Who you are (Must-Haves)'}</SectionEyebrow>
                  <ul className="space-y-3.5">
                    {requirements.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-base text-body leading-relaxed">
                        <ShieldAlert size={16} className="text-subtle shrink-0 mt-1" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Motion>
              )}

              {/* Nice-to-Haves — ✅ nice_to_haves[] */}
              {niceToHaves.length > 0 && (
                <Motion
                  className="space-y-4"
                  {...motionBlockProps}
                  transition={{ ...motionBlockProps.transition, delay: 0.1 }}
                >
                  <SectionEyebrow>{jobData.details?.item4?.title || 'Nice-to-Haves'}</SectionEyebrow>
                  <ul className="space-y-3.5">
                    {niceToHaves.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-base text-body leading-relaxed">
                        <GitCommitHorizontal size={16} className="text-subtle shrink-0 mt-1" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Motion>
              )}
            </div>

            {/* Sidebar — Team box is 🟡 CMS; Compensation box mixes ✅ API band + ✅ equity/note.
                order-first pulls it above the description on mobile (single column); lg:order-none
                restores source order so it sits in the right column on desktop. */}
            {(showTeamBox || showCompensationBox) && (
              <div className="order-first space-y-5 lg:order-none lg:sticky lg:top-28">
                {showTeamBox && (
                  <Motion
                    className={`${careersBg.card} border ${careersBorder.subtle} rounded-md p-6 space-y-6`}
                    {...motionBlockProps}
                    transition={{ ...motionBlockProps.transition, delay: 0.06 }}
                  >
                    <div className="flex items-center gap-2.5 text-body">
                      <Users size={18} className="text-subtle" aria-hidden="true" />
                      <h3 className="text-base font-medium text-cream">The Team</h3>
                    </div>

                    <div className="space-y-4">
                      {(jobData.teamBox?.reportingToName || jobData.teamBox?.reportingToRole) && (
                        <div>
                          <span className="text-subtle block mb-1 text-sm">Reporting to</span>
                          {jobData.teamBox?.reportingToName && (
                            <span className="text-body block text-base font-medium">
                              {jobData.teamBox.reportingToName}
                            </span>
                          )}
                          {jobData.teamBox?.reportingToRole && (
                            <span className="text-subtle text-base block">{jobData.teamBox.reportingToRole}</span>
                          )}
                        </div>
                      )}

                      {jobData.teamBox?.podSize && (
                        <>
                          {(jobData.teamBox?.reportingToName || jobData.teamBox?.reportingToRole) && (
                            <hr className="border-line" />
                          )}
                          <div>
                            <span className="text-subtle block mb-1 text-sm">Pod Size</span>
                            <span className="text-body block text-base font-medium">{jobData.teamBox.podSize}</span>
                          </div>
                        </>
                      )}

                      {jobData.teamBox?.crossFunctional && (
                        <>
                          <hr className="border-line" />
                          <div>
                            <span className="text-subtle block mb-1 text-sm">Cross-Functional</span>
                            <span className="text-body block text-base font-medium">
                              {jobData.teamBox.crossFunctional}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </Motion>
                )}

                {showCompensationBox && (
                  <Motion
                    className={`${careersBg.card} border ${careersBorder.subtle} rounded-md p-6 space-y-6`}
                    {...motionBlockProps}
                    transition={{ ...motionBlockProps.transition, delay: 0.1 }}
                  >
                    <div className="flex items-center gap-2.5 text-body">
                      <DollarSign size={18} className="text-subtle" aria-hidden="true" />
                      <h3 className="text-base font-medium text-cream">Compensation</h3>
                    </div>

                    <div className="space-y-3.5">
                      {/* Base — ✅ derived from API comp band */}
                      {compensationBase && (
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-subtle text-sm">Base</span>
                          <span className="text-body text-base font-medium text-right tabular-nums">
                            {compensationBase}
                          </span>
                        </div>
                      )}

                      {/* Equity — ✅ comp_equity */}
                      {equity && (
                        <>
                          {compensationBase && <hr className="border-line" />}
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-subtle text-sm">Equity</span>
                            <span className="text-body text-base font-medium text-right tabular-nums">{equity}</span>
                          </div>
                        </>
                      )}

                      {/* Note — ✅ comp_note */}
                      {compNote && (
                        <p className="text-subtle bg-ink border border-line rounded-sm p-3 leading-relaxed text-sm">
                          {compNote}
                        </p>
                      )}
                    </div>
                  </Motion>
                )}
              </div>
            )}
          </div>
        </Motion>

        {/* Interview Process — 🟡 CMS (API never exposes internal workflow) */}
        <InterviewProcess interviewProcess={jobData.interviewProcess} />

        {/* Other Open Roles — derived from list (✅ GET /jobs); heading/description are 🟡 CMS.
            Fallback heading matches the design's "Other Open Roles" copy (vs the component's
            generic "Open Roles" default). */}
        {relatedJobs.length > 0 && (
          <Jobs
            jobs={relatedJobs}
            heading={jobData.openRoles?.heading || 'Other Open Roles'}
            description={jobData.openRoles?.description || undefined}
            localePrefix={`/${typedLocale}`}
            mobileCarousel
          />
        )}

        {/* CTA — 🟡 CMS (no API source). Signature noise-gradient band (violet tone, matching the
            design's purple CTA). Gradient + local grain are pure CSS, so it renders identically
            whether or not the optional CMS background image (S3) is available. */}
        {jobData.cta?.heading && (
          <Motion
            tag="section"
            className="relative overflow-hidden rounded-md border border-white/5 px-6 py-14 lg:px-10 lg:py-20"
            {...motionSectionProps}
          >
            {/* Gradient field */}
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(135% 135% at 22% 14%, #7c3aed 0%, #3a1c8c 44%, #140f2c 100%)',
              }}
            />
            {/* Optional CMS hero image layered over the gradient (degrades to gradient when absent) */}
            {jobData.cta.backgroundImage && (
              <span
                aria-hidden
                className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay"
                style={{ backgroundImage: `url(${jobData.cta.backgroundImage})` }}
              />
            )}
            {/* Brand grain — local asset, no external dependency */}
            <span
              aria-hidden
              className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
            />
            {/* Legibility scrim */}
            <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50" />

            <div className="relative text-center">
              <Motion {...motionBlockProps}>
                {jobData.cta.subheading && (
                  <p className="mb-4 text-[12px] font-medium uppercase tracking-[0.14em] text-cream/75">
                    {jobData.cta.subheading}
                  </p>
                )}
                <h2 className="font-display text-2xl font-medium leading-[1.15] text-cream lg:text-4xl">
                  {jobData.cta.heading}
                </h2>
                {jobData.cta.description && (
                  <p className="mx-auto mt-5 mb-10 max-w-2xl text-base text-cream/85 md:text-lg">
                    {jobData.cta.description}
                  </p>
                )}
              </Motion>

              {jobData.cta.button?.label && jobData.cta.button.link && (
                <div className="flex justify-center">
                  <Link
                    href={jobData.cta.button.link}
                    className="group/cta inline-flex items-center gap-2 rounded-md bg-cream px-7 py-3 text-sm font-medium text-ink transition-[background-color,box-shadow] duration-200 hover:bg-cream-hover hover:shadow-[0_10px_30px_-12px_rgba(244,243,236,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                  >
                    {jobData.cta.button.label}
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover/cta:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              )}
            </div>
          </Motion>
        )}
      </div>
    </div>
  )
}
