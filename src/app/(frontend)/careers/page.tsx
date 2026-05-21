import Corousel from '@/components/animation/corousel'
import Motion from '@/components/animation/motion'
import GridOne from '@/components/grids/one'
import GridThree from '@/components/grids/three'
import GridTwo from '@/components/grids/two'
import { Section } from '@/components/layout/section'
import Jobs from '@/components/sections/job'
import type { Job, Media, Team } from '@/payload-types'
import { CareersPage } from '@/payload-types'
import config from '@/payload.config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import type { JSX } from 'react'

export default async function Page(): Promise<JSX.Element> {
  const getCareersPageData = unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      return payload.findGlobal({ slug: 'careersPage' })
    },
    ['careersPage'],
    { tags: ['careersPage'] },
  )
  const careersPageData: CareersPage | null = await getCareersPageData()

  if (!careersPageData) {
    return (
      <div className="max-w-6xl text-red-700 font-bold flex justify-center items-center p-12">Error loading data.</div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F4F3EC] font-sans selection:bg-white/20">
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 lg:px-6 space-y-32">
        {/* Hero Section */}
        <Motion
          tag="section"
          className="grid lg:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Motion
            className="space-y-8 pr-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <p className="text-[#D5D5D5] text-base">
              {careersPageData.hero?.description ||
                'Welcome to our company. We build tools that help you work better. Join our team to make an impact.'}
            </p>
            <h1 className="text-3xl lg:text-[40px] font-medium text-white tracking-tighter leading-[1.1]">
              {careersPageData.hero?.heading || 'Agentic Engineering. Human Orchestration.'}
            </h1>
            <button className="bg-[#F4F3EC] text-[#0F0E0E] px-6 py-3 rounded-lg font-medium hover:bg-[#E8E7DF] transition-colors">
              View Open Roles
            </button>
          </Motion>
          <Motion
            className="aspect-4/3 rounded-3xl overflow-hidden relative border border-white/10"
            initial={{ opacity: 0, scale: 0.985 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Synthetic noisy gradient background to match original image */}
            <div className="absolute inset-0 bg-linear-to-br from-[#1b4332] via-[#2d6a4f] to-[#40916c] opacity-80 mix-blend-screen"></div>
            <div
              className={`absolute inset-0 bg-[url('${(careersPageData.hero?.image as Media)?.url || 'https://grainy-gradients.vercel.app/noise.svg'}')] opacity-50 contrast-150 mix-blend-overlay`}
            ></div>
          </Motion>
        </Motion>

        {/* Section 1: More than just a workplace */}
        <GridOne careersPageData={careersPageData} />

        {/* Section 2: Work hard. Live fully. */}
        <GridTwo careersPageData={careersPageData} />

        {/* Section 3: Engineering growth */}
        <GridThree careersPageData={careersPageData} />

        {/* Section 4: Team Voices */}
        <Section
          title={careersPageData.team?.heading || 'Team voices. Production stories.'}
          desc={
            careersPageData.team?.description ||
            "Our engineers share what it's like to maintain production systems, grow through operational accountability, and build careers around technical depth rather than corporate advancement."
          }
        >
          <Corousel items={(careersPageData.team?.members as Team[]) || []} />
        </Section>

        {/* Section 5: Open Roles */}
        <Jobs jobs={(careersPageData.jobs?.list as Job[]) || []} />
      </main>
    </div>
  )
}
