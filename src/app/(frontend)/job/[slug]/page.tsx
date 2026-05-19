import Motion from '@/components/animation/motion'
import Jobs from '@/components/sections/job'
import type { Job, Media } from '@/payload-types'
import config from '@/payload.config'
import { ArrowLeft, ArrowRight, Clock, DollarSign, GitCommitHorizontal, Minus, ShieldAlert, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { JSX } from 'react'
const getJobList = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'job',
      limit: 100,
      depth: 0,
    })
    return result.docs
  },
  ['job'],
  { tags: ['job'] },
)

function getJobBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'job',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
      })
      return result.docs[0] ?? null
    },
    [`job_${slug}`],
    { tags: [`job_${slug}`, 'job'] },
  )
}

export async function generateStaticParams() {
  const jobs = await getJobList()
  return jobs.map((job) => ({
    slug: job.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const jobData = await getJobBySlug(slug)()

  if (!jobData) return {}

  return {
    title: jobData.title ? `${jobData.title} | Ternary Solutions` : 'Job | Ternary Solutions',
    description: jobData.excerpts || undefined,
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

function getRelatedJobs(jobs: (string | Job)[] | null | undefined): Job[] {
  if (!jobs?.length) return []
  return jobs.filter((job): job is Job => typeof job === 'object' && job !== null)
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }): Promise<JSX.Element> {
  const { slug } = await params
  const jobData = await getJobBySlug(slug)()

  if (!jobData) notFound()

  const relatedJobs = getRelatedJobs(jobData.openRoles?.jobs)
  const heroImage = jobData.image as Media | undefined

  const metaItems = [jobData.department, jobData.location, jobData.level, jobData.team, jobData.type].filter(
    (item): item is string => Boolean(item),
  )

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-white/20">
      <main className="max-w-7xl mx-auto px-4 lg:px-6 space-y-24">
        <section>
          <div className="w-full text-zinc-300 py-6">
            {/* Top Actions Row */}
            <div className="flex items-center justify-between mb-12">
              {/* Back Button */}
              <Link
                href="/jobs"
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                Careers Hub
              </Link>

              {/* Right Side: Code & CTA */}
              <div className="flex items-center gap-6">
                {jobData.code && (
                  <span className="text-xs text-zinc-600 font-mono tracking-wider uppercase">{jobData.code}</span>
                )}
                <button
                  type="button"
                  className="bg-[#f4f4f0] hover:bg-[#eaeae3] text-zinc-900 font-medium text-sm px-5 py-2.5 rounded-lg transition-colors duration-200"
                >
                  Apply Now
                </button>
              </div>
            </div>

            {/* Title & Metadata Block */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">{jobData.title}</h1>
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 list-none text-xs md:text-sm text-zinc-500">
                {jobData.type && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-zinc-500">
                    Type: <span className="text-zinc-300 font-medium">{jobData.type}</span>
                  </li>
                )}
                {jobData.department && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-zinc-500">
                    Department: <span className="text-zinc-300 font-medium">{jobData.department}</span>
                  </li>
                )}
                {jobData.location && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-zinc-500">
                    Location: <span className="text-zinc-300 font-medium">{jobData.location}</span>
                  </li>
                )}
                {jobData.level && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-zinc-500">
                    Experience Level: <span className="text-zinc-300 font-medium">{jobData.level}</span>
                  </li>
                )}
                {jobData.team && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-zinc-500">
                    Team: <span className="text-zinc-300 font-medium">{jobData.team}</span>
                  </li>
                )}
                {jobData.salary && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-zinc-500">
                    Compensation: <span className="text-zinc-300 font-medium">{jobData.salary}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>

        <section className="w-full text-zinc-300 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* LEFT COLUMN: Main Job Specifications (Takes 2 fractions of space) */}
            <div className="lg:col-span-2 space-y-12">
              {/* Item 1: The Mission */}
              {jobData.details?.item1 && (jobData.details.item1.title || jobData.details.item1.description) && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-500 flex flex-row items-center gap-2">
                    <Minus size={16} className="text-zinc-500" aria-hidden="true" />{' '}
                    {jobData.details.item1.title || 'The Mission'}
                  </h2>
                  <p className="text-zinc-300 text-base leading-relaxed font-normal">
                    {jobData.details.item1.description}
                  </p>
                </div>
              )}

              {/* Item 2: What You'll Do */}
              {jobData.details?.item2 && jobData.details.item2.points && jobData.details.item2.points.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-500 flex flex-row items-center gap-2">
                    <Minus size={20} className="text-zinc-500" aria-hidden="true" />{' '}
                    {jobData.details.item2.title || "What you'll do"}
                  </h2>
                  <ul className="space-y-3.5">
                    {jobData.details.item2.points.map((p, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-zinc-300 leading-relaxed">
                        <ArrowRight size={16} className="text-zinc-500 " aria-hidden="true" />
                        <span>{p.point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Item 3: Who You Are (Must-Haves) */}
              {jobData.details?.item3 && jobData.details.item3.points && jobData.details.item3.points.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-500 flex flex-row items-center gap-2">
                    <Minus size={20} className="text-zinc-500" aria-hidden="true" />{' '}
                    {jobData.details.item3.title || 'Who you are (Must-Haves)'}
                  </h2>
                  <ul className="space-y-3.5">
                    {jobData.details.item3.points.map((p, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-zinc-300 leading-relaxed">
                        <ShieldAlert size={16} className="text-zinc-500" aria-hidden="true" />
                        <span>{p.point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Item 4: Nice to Haves */}
              {jobData.details?.item4 && jobData.details.item4.points && jobData.details.item4.points.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-500 flex flex-row items-center gap-2">
                    <Minus size={20} className="text-zinc-500" aria-hidden="true" />{' '}
                    {jobData.details.item4.title || 'Nice-to-Haves:'}
                  </h2>
                  <ul className="space-y-3.5">
                    {jobData.details.item4.points.map((p, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-zinc-300 leading-relaxed">
                        <GitCommitHorizontal size={16} className="text-zinc-500" aria-hidden="true" />
                        <span>{p.point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Info Side Cards (Sticky Sidebar layout) */}
            <div className="space-y-6 lg:sticky lg:top-8">
              {/* Card A: The Team Box */}

              <div className="bg-[#1B1A17] border border-zinc-900 rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-900 text-zinc-200">
                  <Users size={18} className="text-zinc-400" />

                  <h3 className="text-sm font-medium">The Team</h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[#757571] block mb-1">Reporting to</span>

                    <span className="text-[#D5D5D5] block text-sm font-medium">Marcus Vance</span>

                    <span className="text-[#757571] block">VP of Engineering</span>
                  </div>
                  <hr className="border-[#757571]" />

                  <div>
                    <span className="text-[#757571] block mb-1">Pod Size</span>

                    <span className="text-[#D5D5D5] block text-sm font-medium">6 Engineers</span>
                  </div>
                  <hr className="border-[#757571]" />

                  <div>
                    <span className="text-[#757571] block mb-1">Cross-Functional</span>

                    <span className="text-[#D5D5D5] block text-sm font-medium">
                      AI Research Pod & Platform Security
                    </span>
                  </div>
                </div>
              </div>

              {/* Card B: Compensation Box */}

              <div className="bg-[#1B1A17] border border-zinc-900 rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-900 text-zinc-200">
                  <DollarSign size={18} className="text-zinc-400" />

                  <h3 className="text-sm font-medium">Compensation</h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#757571]">Base</span>

                    <span className="text-[#D5D5D5] font-mono text-sm font-medium">$210,000 – $260,000</span>
                  </div>
                  <hr className="border-[#757571]" />

                  <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                    <span className="text-[#757571]">Equity</span>

                    <span className="text-[#D5D5D5] font-mono text-sm font-medium">0.25%'</span>
                  </div>
                  <hr className="border-[#757571]" />

                  <p className="text-[#757571] bg-[#0F0E0E]  p-2 leading-relaxed text-[11px] font-normal pt-1">
                    We pay top-of-market base for top-percentile engineering talent. Equity is meaningful and designed
                    to generate life-changing outcomes if we hit our institutional targets. No cliff games,
                    straightforward preferred stock conversion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {relatedJobs.length > 0 && <Jobs jobs={relatedJobs} />}

        <section>
          <div className="w-full bg-[#121212] border border-zinc-900 rounded-xl p-8 md:p-10">
            {/* Header Section */}
            <div className="flex items-center gap-3 mb-10 text-zinc-200">
              <Clock size={20} className="text-zinc-400" />
              <h2 className="text-lg font-medium tracking-tight">
                {jobData.interviewProcess?.heading || 'Interview Process'}
              </h2>
            </div>

            {/* Process Roadmap Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {jobData.interviewProcess?.steps?.map((step, index) => {
                const isLast = index === (jobData.interviewProcess?.steps?.length || 0) - 1

                return (
                  <Motion
                    key={step.id || index}
                    className="flex flex-col relative"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
                  >
                    {/* Node & Connecting Line Row */}
                    <div className="flex items-center w-full mb-4 relative">
                      {/* Step Number Circle */}
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-transparent border border-zinc-700 text-zinc-400 text-xs font-medium z-10 shrink-0">
                        {index + 1}
                      </div>

                      {/* Horizontal connecting line (hidden on final child) */}
                      {!isLast && (
                        <div className="hidden md:block absolute left-7 right-0 h-[1px] bg-gradient-to-r from-zinc-700 to-zinc-800" />
                      )}
                    </div>

                    {/* Step Metadata Content */}
                    <div className="space-y-1.5 pr-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-sm font-semibold text-zinc-200 tracking-tight">
                          {step.title || 'Initial Screen'}
                        </h3>
                        {/* Hardcoded duration metric variant matching your SS mockup */}
                        <span className="text-xs text-zinc-500 font-mono font-medium whitespace-nowrap">30m</span>
                      </div>

                      {step.excerpt && (
                        <p className="text-sm text-zinc-500 leading-relaxed max-w-[220px]">{step.excerpt}</p>
                      )}
                    </div>
                  </Motion>
                )
              })}
            </div>
          </div>
        </section>

        {jobData.cta?.heading && (
          <Motion
            tag="section"
            className="lg:p-10 p-4 bg-cover bg-center rounded-lg overflow-hidden"
            style={{
              backgroundImage: `url(${
                (jobData.cta.backgroundImage as Media)?.url ||
                'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))'
              })`,
            }}
            {...motionSectionProps}
          >
            <div className="text-center">
              <Motion {...motionBlockProps}>
                {jobData.cta.subheading && <p className="text-xs mb-4">{jobData.cta.subheading}</p>}
                <h2 className="lg:text-4xl text-2xl font-semibold mb-6 text-white">{jobData.cta.heading}</h2>
                {jobData.cta.description && (
                  <p className="text-base md:text-xl max-w-2xl mx-auto mb-10">{jobData.cta.description}</p>
                )}
              </Motion>

              {jobData.cta.button?.label && jobData.cta.button.link && (
                <div className="flex justify-center">
                  <Link
                    href={jobData.cta.button.link}
                    className="px-8 py-3 bg-[#14120B] font-medium rounded-2xl text-base"
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
