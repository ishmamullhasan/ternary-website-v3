import Motion from '@/components/animation/motion'
import InterviewProcess from '@/components/sections/interviewProcess'
import Jobs from '@/components/sections/job'
import JsonLd from '@/components/seo/JsonLd'
import { careersBg, careersBorder, careersText } from '@/lib/careers-colors'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { formatComp, getJob, getJobs, getRelatedJobs } from '@/lib/jobs-data'
import { generateMeta } from '@/lib/seo/generateMeta'
import { jobPosting } from '@/lib/seo/structuredData'
import { getServerSideURL } from '@/utilities/getURL'
import { ArrowLeft, ArrowRight, DollarSign, GitCommitHorizontal, Minus, ShieldAlert, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { JSX } from 'react'

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
  return generateMeta({
    doc: { title: jobData.title },
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

  const jobLd = jobPosting({
    title: jobData.title ?? 'Job',
    description: jobData.excerpt || jobData.body_markdown,
    datePosted: jobData.published_at,
    location: jobData.location,
    url: `${getServerSideURL()}/${typedLocale}/job/${slug}`,
  })

  // ✅ Compensation from the API band; facets are nullable (render only when present).
  const compDisplay = formatComp(jobData.comp_band_min, jobData.comp_band_max, jobData.comp_currency)
  const employmentType = jobData.employment_type
  const seniority = jobData.seniority_level
  const equity = jobData.comp_equity
  const compNote = jobData.comp_note

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
      <main className=" pb-24 max-w-7xl mx-auto px-5 space-y-32">
        {/* Hero */}
        <Motion tag="section" {...motionSectionProps}>
          <div className={`w-full ${careersText.body}`}>
            <Motion className="flex items-center justify-between mb-10" {...motionBlockProps}>
              <Link
                href={`/${typedLocale}/careers`}
                className={`flex items-center gap-2 text-base ${careersText.muted} hover:text-[#D5D5D5] transition-colors group`}
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform " />
                Careers Hub
              </Link>

              <div className="flex items-center gap-6">
                {/* 🔒 code — internal-only; shown per design, falls back to slug */}
                {(jobData.code || jobData.slug) && (
                  <span className="text-xs text-[#757571] font-mono tracking-wider uppercase">
                    {jobData.code || jobData.slug}
                  </span>
                )}
                {/* Apply button → in-app form (POST /applications/{slug}). applyButton.* is 🟡 CMS override. */}
                <Link
                  href={jobData.applyButton?.link || `/${typedLocale}/job/${jobData.slug}/apply`}
                  className={`${careersBg.button} ${careersBg.buttonHover} ${careersText.onLight} font-medium text-base px-5 py-2.5 rounded-lg transition-colors duration-200`}
                >
                  {jobData.applyButton?.label || 'Apply Now'}
                </Link>
              </div>
            </Motion>

            <Motion
              className="space-y-4"
              {...motionBlockProps}
              transition={{ ...motionBlockProps.transition, delay: 0.06 }}
            >
              <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">{jobData.title}</h1>
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 list-none text-base text-[#757571]">
                {/* Type — ✅ employment_type */}
                {employmentType && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-[#757571]">
                    Type: <span className="text-[#D5D5D5] font-medium">{employmentType}</span>
                  </li>
                )}
                {/* Department — ✅ API */}
                {jobData.department && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-[#757571]">
                    Department: <span className="text-[#D5D5D5] font-medium">{jobData.department}</span>
                  </li>
                )}
                {/* Location — ✅ API */}
                {jobData.location && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-[#757571]">
                    Location: <span className="text-[#D5D5D5] font-medium">{jobData.location}</span>
                  </li>
                )}
                {/* Experience Level — ✅ seniority_level */}
                {seniority && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-[#757571]">
                    Experience Level: <span className="text-[#D5D5D5] font-medium">{seniority}</span>
                  </li>
                )}
                {/* Team — ✅ API */}
                {jobData.team && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-[#757571]">
                    Team: <span className="text-[#D5D5D5] font-medium">{jobData.team}</span>
                  </li>
                )}
                {/* Compensation — ✅ API band (formatted) */}
                {compDisplay && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-[#757571]">
                    Compensation: <span className="text-[#D5D5D5] font-medium">{compDisplay}</span>
                  </li>
                )}
              </ul>
            </Motion>
          </div>
        </Motion>

        {/* Details + Sidebar */}
        <Motion tag="section" className={`w-full ${careersText.body}`} {...motionSectionProps}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-2 space-y-16">
              {/* The Mission — ✅ body_markdown (plain paragraphs; full Markdown rendering = TODO) */}
              {missionBody && (
                <Motion className="space-y-4" {...motionBlockProps}>
                  <h2 className="text-xs font-semibold tracking-wider uppercase text-[#757571] flex flex-row items-center gap-2">
                    <Minus size={16} className="text-[#757571]" aria-hidden="true" />
                    {missionTitle}
                  </h2>
                  <div className="space-y-3">
                    {missionBody
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line, idx) => (
                        <p key={idx} className="text-[#D5D5D5] text-base leading-relaxed font-normal">
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
                  <h2 className="text-xs font-semibold tracking-wider uppercase text-[#757571] flex flex-row items-center gap-2">
                    <Minus size={20} className="text-[#757571]" aria-hidden="true" />
                    {jobData.details?.item2?.title || "What you'll do"}
                  </h2>
                  <ul className="space-y-3.5">
                    {responsibilities.map((point, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-base text-[#D5D5D5] leading-relaxed">
                        <ArrowRight size={16} className="text-[#757571] shrink-0" aria-hidden="true" />
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
                  <h2 className="text-xs font-semibold tracking-wider uppercase text-[#757571] flex flex-row items-center gap-2">
                    <Minus size={20} className="text-[#757571]" aria-hidden="true" />
                    {jobData.details?.item3?.title || 'Who you are (Must-Haves)'}
                  </h2>
                  <ul className="space-y-3.5">
                    {requirements.map((point, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-base text-[#D5D5D5] leading-relaxed">
                        <ShieldAlert size={16} className="text-[#757571] shrink-0" aria-hidden="true" />
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
                  <h2 className="text-xs font-semibold tracking-wider uppercase text-[#757571] flex flex-row items-center gap-2">
                    <Minus size={20} className="text-[#757571]" aria-hidden="true" />
                    {jobData.details?.item4?.title || 'Nice-to-Haves:'}
                  </h2>
                  <ul className="space-y-3.5">
                    {niceToHaves.map((point, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-base text-[#D5D5D5] leading-relaxed">
                        <GitCommitHorizontal size={16} className="text-[#757571] shrink-0" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Motion>
              )}
            </div>

            {/* Sidebar — Team box is 🟡 CMS; Compensation box mixes ✅ API band + ✅ equity/note */}
            {(showTeamBox || showCompensationBox) && (
              <div className="space-y-6 lg:sticky lg:top-32">
                {showTeamBox && (
                  <Motion
                    className={`${careersBg.card} border ${careersBorder.subtle} rounded-xl p-6 space-y-6`}
                    {...motionBlockProps}
                    transition={{ ...motionBlockProps.transition, delay: 0.06 }}
                  >
                    <div className="flex items-center gap-2.5 pb-2 text-[#D5D5D5]">
                      <Users size={18} className="" />
                      <h3 className="text-base font-medium">The Team</h3>
                    </div>

                    <div className="space-y-4">
                      {(jobData.teamBox?.reportingToName || jobData.teamBox?.reportingToRole) && (
                        <div>
                          <span className="text-[#757571] block mb-1 text-sm">Reporting to</span>
                          {jobData.teamBox?.reportingToName && (
                            <span className="text-[#D5D5D5] block text-base font-medium">
                              {jobData.teamBox.reportingToName}
                            </span>
                          )}
                          {jobData.teamBox?.reportingToRole && (
                            <span className="text-[#757571]  text-base block">{jobData.teamBox.reportingToRole}</span>
                          )}
                        </div>
                      )}

                      {jobData.teamBox?.podSize && (
                        <>
                          {(jobData.teamBox?.reportingToName || jobData.teamBox?.reportingToRole) && (
                            <hr className="border-[#757571]" />
                          )}
                          <div>
                            <span className="text-[#757571] block mb-1 text-sm">Pod Size</span>
                            <span className="text-[#D5D5D5] block text-base font-medium">
                              {jobData.teamBox.podSize}
                            </span>
                          </div>
                        </>
                      )}

                      {jobData.teamBox?.crossFunctional && (
                        <>
                          <hr className="border-[#757571]" />
                          <div>
                            <span className="text-[#757571] block mb-1 text-sm">Cross-Functional</span>
                            <span className="text-[#D5D5D5] block text-base font-medium">
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
                    className={`${careersBg.card} border ${careersBorder.subtle} rounded-xl p-6 space-y-6`}
                    {...motionBlockProps}
                    transition={{ ...motionBlockProps.transition, delay: 0.1 }}
                  >
                    <div className="flex items-center gap-2.5 pb-2 text-[#D5D5D5]">
                      <DollarSign size={18} />
                      <h3 className="text-base font-medium">Compensation</h3>
                    </div>

                    <div className="space-y-3.5 ">
                      {/* Base — ✅ derived from API comp band */}
                      {compensationBase && (
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-[#757571] text-sm">Base</span>
                          <span className="text-[#D5D5D5] font-mono text-base font-medium text-right">
                            {compensationBase}
                          </span>
                        </div>
                      )}

                      {/* Equity — ✅ comp_equity */}
                      {equity && (
                        <>
                          {compensationBase && <hr className="border-[#757571]" />}
                          <div className="flex justify-between items-center gap-4 pb-4">
                            <span className="text-[#757571] text-sm">Equity</span>
                            <span className="text-[#D5D5D5] font-mono text-base font-medium text-right">{equity}</span>
                          </div>
                        </>
                      )}

                      {/* Note — ✅ comp_note */}
                      {compNote && (
                        <p className="text-[#757571] bg-[#0F0E0E] p-2 leading-relaxed text-sm font-normal">
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

        {/* Other Open Roles — derived from list (✅ GET /jobs); heading/description are 🟡 CMS */}
        {relatedJobs.length > 0 && (
          <Jobs
            jobs={relatedJobs}
            heading={jobData.openRoles?.heading || undefined}
            description={jobData.openRoles?.description || undefined}
            localePrefix={`/${typedLocale}`}
          />
        )}

        {/* CTA — 🟡 CMS (no API source) */}
        {jobData.cta?.heading && (
          <Motion
            tag="section"
            className="lg:p-10 p-4 bg-cover bg-center rounded-lg overflow-hidden"
            style={{
              backgroundImage: `url(${
                jobData.cta.backgroundImage || 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))'
              })`,
            }}
            {...motionSectionProps}
          >
            <div className="text-center">
              <Motion {...motionBlockProps}>
                {jobData.cta.subheading && (
                  <p className={`text-xs mb-4 ${careersText.muted}`}>{jobData.cta.subheading}</p>
                )}
                <h2 className={`lg:text-4xl text-2xl font-semibold mb-6 ${careersText.white}`}>
                  {jobData.cta.heading}
                </h2>
                {jobData.cta.description && (
                  <p className={`text-base md:text-xl max-w-2xl mx-auto mb-10 ${careersText.body}`}>
                    {jobData.cta.description}
                  </p>
                )}
              </Motion>

              {jobData.cta.button?.label && jobData.cta.button.link && (
                <div className="flex justify-center">
                  <Link
                    href={jobData.cta.button.link}
                    className={`px-8 py-3 ${careersBg.buttonDark} ${careersText.cream} font-medium rounded-2xl text-base`}
                  >
                    {jobData.cta.button.label}
                  </Link>
                </div>
              )}
            </div>
          </Motion>
        )}
      </main>
    </div>
  )
}
