import Motion from '@/components/animation/motion'
import InterviewProcess from '@/components/sections/interviewProcess'
import Jobs from '@/components/sections/job'
import { careersBg, careersBorder, careersText } from '@/lib/careers-colors'
import type { Job, Media } from '@/payload-types'
import config from '@/payload.config'
import { ArrowLeft, ArrowRight, DollarSign, GitCommitHorizontal, Minus, ShieldAlert, Users } from 'lucide-react'
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

function hasTeamBoxContent(teamBox: Job['teamBox']): boolean {
  if (!teamBox) return false
  return Boolean(
    teamBox.reportingToName?.trim() ||
    teamBox.reportingToRole?.trim() ||
    teamBox.podSize?.trim() ||
    teamBox.crossFunctional?.trim(),
  )
}

function hasCompensationBoxContent(compensationBox: Job['compensationBox'], salary?: string | null): boolean {
  if (compensationBox) {
    if (compensationBox.base?.trim() || compensationBox.equity?.trim() || compensationBox.note?.trim()) {
      return true
    }
  }
  return Boolean(salary?.trim())
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }): Promise<JSX.Element> {
  const { slug } = await params
  const jobData = await getJobBySlug(slug)()

  if (!jobData) notFound()

  const relatedJobs = getRelatedJobs(jobData.openRoles?.jobs)
  const showTeamBox = hasTeamBoxContent(jobData.teamBox)
  const showCompensationBox = hasCompensationBoxContent(jobData.compensationBox, jobData.salary)
  const compensationBase = jobData.compensationBox?.base?.trim() || jobData.salary

  return (
    <div className={`min-h-screen ${careersBg.page} ${careersText.cream} font-sans selection:bg-white/20`}>
      <main className=" pb-24 max-w-7xl mx-auto px-4 lg:px-6 space-y-32">
        {/* Hero */}
        <Motion tag="section" {...motionSectionProps}>
          <div className={`w-full ${careersText.body}`}>
            <Motion className="flex items-center justify-between mb-10" {...motionBlockProps}>
              <Link
                href="/careers"
                className={`flex items-center gap-2 text-base ${careersText.muted} hover:text-[#D5D5D5] transition-colors group`}
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform " />
                Careers Hub
              </Link>

              <div className="flex items-center gap-6">
                {jobData.code && (
                  <span className="text-xs text-[#757571] font-mono tracking-wider uppercase">{jobData.code}</span>
                )}
                {jobData.button?.label && jobData.button.link ? (
                  <Link
                    href={jobData.button.link}
                    className={`${careersBg.button} ${careersBg.buttonHover} ${careersText.onLight} font-medium text-base px-5 py-2.5 rounded-lg transition-colors duration-200`}
                  >
                    {jobData.button.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={`${careersBg.button} ${careersBg.buttonHover} ${careersText.onLight} font-medium text-base px-5 py-2.5 rounded-lg transition-colors duration-200`}
                  >
                    {jobData.button?.label || 'Apply Now'}
                  </button>
                )}
              </div>
            </Motion>

            <Motion
              className="space-y-4"
              {...motionBlockProps}
              transition={{ ...motionBlockProps.transition, delay: 0.06 }}
            >
              <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">{jobData.title}</h1>
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 list-none text-base text-[#757571]">
                {jobData.type && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-[#757571]">
                    Type: <span className="text-[#D5D5D5] font-medium">{jobData.type}</span>
                  </li>
                )}
                {jobData.department && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-[#757571]">
                    Department: <span className="text-[#D5D5D5] font-medium">{jobData.department}</span>
                  </li>
                )}
                {jobData.location && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-[#757571]">
                    Location: <span className="text-[#D5D5D5] font-medium">{jobData.location}</span>
                  </li>
                )}
                {jobData.level && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-[#757571]">
                    Experience Level: <span className="text-[#D5D5D5] font-medium">{jobData.level}</span>
                  </li>
                )}
                {jobData.team && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-[#757571]">
                    Team: <span className="text-[#D5D5D5] font-medium">{jobData.team}</span>
                  </li>
                )}
                {jobData.salary && (
                  <li className="flex items-center gap-1.5 before:content-['•'] before:text-[#757571]">
                    Compensation: <span className="text-[#D5D5D5] font-medium">{jobData.salary}</span>
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
              {jobData.details?.item1 && (jobData.details.item1.title || jobData.details.item1.description) && (
                <Motion className="space-y-4" {...motionBlockProps}>
                  <h2 className="text-xs font-semibold tracking-wider uppercase text-[#757571] flex flex-row items-center gap-2">
                    <Minus size={16} className="text-[#757571]" aria-hidden="true" />
                    {jobData.details.item1.title || 'The Mission'}
                  </h2>
                  <p className="text-[#D5D5D5] text-base leading-relaxed font-normal">
                    {jobData.details.item1.description}
                  </p>
                </Motion>
              )}

              {jobData.details?.item2 && jobData.details.item2.points && jobData.details.item2.points.length > 0 && (
                <Motion
                  className="space-y-4"
                  {...motionBlockProps}
                  transition={{ ...motionBlockProps.transition, delay: 0.05 }}
                >
                  <h2 className="text-xs font-semibold tracking-wider uppercase text-[#757571] flex flex-row items-center gap-2">
                    <Minus size={20} className="text-[#757571]" aria-hidden="true" />
                    {jobData.details.item2.title || "What you'll do"}
                  </h2>
                  <ul className="space-y-3.5">
                    {jobData.details.item2.points.map((p, idx) => (
                      <li
                        key={p.id || idx}
                        className="flex items-center gap-3 text-base text-[#D5D5D5] leading-relaxed"
                      >
                        <ArrowRight size={16} className="text-[#757571] shrink-0" aria-hidden="true" />
                        <span>{p.point}</span>
                      </li>
                    ))}
                  </ul>
                </Motion>
              )}

              {jobData.details?.item3 && jobData.details.item3.points && jobData.details.item3.points.length > 0 && (
                <Motion
                  className="space-y-4"
                  {...motionBlockProps}
                  transition={{ ...motionBlockProps.transition, delay: 0.08 }}
                >
                  <h2 className="text-xs font-semibold tracking-wider uppercase text-[#757571] flex flex-row items-center gap-2">
                    <Minus size={20} className="text-[#757571]" aria-hidden="true" />
                    {jobData.details.item3.title || 'Who you are (Must-Haves)'}
                  </h2>
                  <ul className="space-y-3.5">
                    {jobData.details.item3.points.map((p, idx) => (
                      <li
                        key={p.id || idx}
                        className="flex items-center gap-3 text-base text-[#D5D5D5] leading-relaxed"
                      >
                        <ShieldAlert size={16} className="text-[#757571] shrink-0" aria-hidden="true" />
                        <span>{p.point}</span>
                      </li>
                    ))}
                  </ul>
                </Motion>
              )}

              {jobData.details?.item4 && jobData.details.item4.points && jobData.details.item4.points.length > 0 && (
                <Motion
                  className="space-y-4"
                  {...motionBlockProps}
                  transition={{ ...motionBlockProps.transition, delay: 0.1 }}
                >
                  <h2 className="text-xs font-semibold tracking-wider uppercase text-[#757571] flex flex-row items-center gap-2">
                    <Minus size={20} className="text-[#757571]" aria-hidden="true" />
                    {jobData.details.item4.title || 'Nice-to-Haves:'}
                  </h2>
                  <ul className="space-y-3.5">
                    {jobData.details.item4.points.map((p, idx) => (
                      <li
                        key={p.id || idx}
                        className="flex items-center gap-3 text-base text-[#D5D5D5] leading-relaxed"
                      >
                        <GitCommitHorizontal size={16} className="text-[#757571] shrink-0" aria-hidden="true" />
                        <span>{p.point}</span>
                      </li>
                    ))}
                  </ul>
                </Motion>
              )}
            </div>

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
                      {compensationBase && (
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-[#757571] text-sm">Base</span>
                          <span className="text-[#D5D5D5] font-mono text-base font-medium text-right">
                            {compensationBase}
                          </span>
                        </div>
                      )}

                      {jobData.compensationBox?.equity && (
                        <>
                          {compensationBase && <hr className="border-[#757571]" />}
                          <div className="flex justify-between items-center gap-4 pb-4">
                            <span className="text-[#757571] text-sm">Equity</span>
                            <span className="text-[#D5D5D5] font-mono text-base font-medium text-right">
                              {jobData.compensationBox.equity}
                            </span>
                          </div>
                        </>
                      )}

                      {jobData.compensationBox?.note && (
                        <p className="text-[#757571] bg-[#0F0E0E] p-2 leading-relaxed text-sm font-normal">
                          {jobData.compensationBox.note}
                        </p>
                      )}
                    </div>
                  </Motion>
                )}
              </div>
            )}
          </div>
        </Motion>

        <InterviewProcess interviewProcess={jobData.interviewProcess} />

        {relatedJobs.length > 0 && (
          <Jobs
            jobs={relatedJobs}
            heading={jobData.openRoles?.heading || undefined}
            description={jobData.openRoles?.description || undefined}
          />
        )}

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
