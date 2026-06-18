import Motion from '@/components/animation/motion'
import ApplyForm from '@/components/sections/applyForm'
import InterviewProcess from '@/components/sections/interviewProcess'
import Jobs from '@/components/sections/job'
import { careersBg, careersBorder, careersText } from '@/lib/careers-colors'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { formatComp, getJob, getJobs, getRelatedJobs } from '@/lib/jobs-data'
import { ArrowLeft, Banknote, Briefcase, Layers, MapPin, TrendingUp, User, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { JSX } from 'react'

// Data comes from `@/lib/jobs-data`: the live public recruiting API + merged Payload CMS copy
// (getJob, keyed by role `code`). Locale drives the URL prefix on links and is threaded to getJob
// for forward-compat with CMS localization. ✅ = API · 🟡 = CMS · 🔒 = internal-only.

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

  return {
    title: jobData.title ? `Apply · ${jobData.title} | Ternary Solutions` : 'Apply | Ternary Solutions',
    description: jobData.excerpt || jobData.body_markdown || undefined,
  }
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

  // Related roles are non-essential: a transient list-fetch failure should not break the apply page.
  let relatedJobs: Awaited<ReturnType<typeof getRelatedJobs>> = []
  try {
    relatedJobs = await getRelatedJobs(slug)
  } catch {
    relatedJobs = []
  }
  const payRange = formatComp(jobData.comp_band_min, jobData.comp_band_max, jobData.comp_currency)

  // Hero pills: location & team are ✅ API; band is 🔒 internal (CMS).
  const pills = [
    jobData.location,
    jobData.team || jobData.department,
    (jobData.band || jobData.seniority_level) && `Band: ${jobData.band || jobData.seniority_level}`,
  ].filter((v): v is string => Boolean(v))

  // Sidebar facts. ✅ = API · 🟡 = CMS · 🔒 = internal-only (shown per design).
  const sidebarItems = [
    { icon: MapPin, label: 'Locations', value: jobData.location }, // ✅ API
    { icon: User, label: 'Role Type', value: jobData.roleType }, // 🟡 CMS
    { icon: Users, label: 'Functional Team', value: jobData.team || jobData.department }, // ✅ API
    { icon: TrendingUp, label: 'Experience', value: jobData.seniority_level }, // ✅ API
    { icon: Layers, label: 'Internal Level', value: jobData.internalLevel || jobData.code }, // 🔒 internal
    { icon: Briefcase, label: 'Type', value: jobData.employment_type }, // ✅ API
    { icon: Banknote, label: 'Annualized Pay Range', value: payRange }, // ✅ API band
  ].filter((item): item is { icon: typeof MapPin; label: string; value: string } => Boolean(item.value))

  return (
    <div className={`min-h-screen ${careersBg.page} ${careersText.cream} font-sans selection:bg-white/20`}>
      <main className="pb-24 max-w-7xl mx-auto px-5 space-y-24">
        {/* Hero */}
        <Motion tag="section" className="space-y-6" {...motionSectionProps}>
          <Link
            href={`/${typedLocale}/job/${jobData.slug}`}
            className={`inline-flex items-center gap-2 text-base ${careersText.muted} hover:text-[#D5D5D5] transition-colors group`}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Job Details
          </Link>

          <Motion className="space-y-4" {...motionBlockProps}>
            <h1 className={`text-3xl md:text-4xl font-semibold ${careersText.white} tracking-tight`}>
              {jobData.title || 'Apply'}
            </h1>
            {pills.length > 0 && (
              <ul className="flex flex-wrap items-center gap-3 list-none">
                {pills.map((pill) => (
                  <li
                    key={pill}
                    className={`${careersBg.card} border ${careersBorder.subtle} ${careersText.body} text-sm px-4 py-2 rounded-full`}
                  >
                    {pill}
                  </li>
                ))}
              </ul>
            )}
          </Motion>
        </Motion>

        {/* Form + Sidebar */}
        <Motion tag="section" {...motionSectionProps}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-2">
              {/* Form submits to POST /recruit/v1/public/applications/{slug} (canonical doc). */}
              <ApplyForm slug={jobData.slug} />
            </div>

            {sidebarItems.length > 0 && (
              <aside className="lg:sticky lg:top-32">
                <Motion
                  className={`${careersBg.card} border ${careersBorder.subtle} rounded-lg p-6 space-y-6`}
                  {...motionBlockProps}
                >
                  {sidebarItems.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon size={18} className={`${careersText.muted} mt-0.5 shrink-0`} aria-hidden />
                      <div>
                        <span className={`block text-sm font-medium ${careersText.white}`}>{label}</span>
                        <span className={`block text-sm ${careersText.muted}`}>{value}</span>
                      </div>
                    </div>
                  ))}
                </Motion>
              </aside>
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
      </main>
    </div>
  )
}
