import Corousel from '@/components/animation/corousel'
import Motion from '@/components/animation/motion'
import GridOne from '@/components/grids/one'
import GridThree from '@/components/grids/three'
import GridTwo from '@/components/grids/two'
import Section from '@/components/layout/section'
import Jobs from '@/components/sections/job'
import { getJobs } from '@/lib/jobs-data'
import type { CareersPageBlock, Media, Team } from '@/payload-types'
import type { JSX } from 'react'

export const CareersPageComponent = async (data: CareersPageBlock): Promise<JSX.Element> => {
  // Open roles list from the recruiting API (✅ GET /jobs).
  const openRoles = await getJobs()

  return (
    <div className="flex flex-col lg:gap-32 gap-10">
      <main className="pt-10 pb-24 space-y-32">
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
            <h1 className="text-3xl lg:text-[40px] font-medium text-white tracking-tighter leading-[1.1]">
              {data.hero?.heading || 'Agentic Engineering. Human Orchestration.'}
            </h1>
            <p className="text-[#D5D5D5] text-base">
              {data.hero?.description ||
                'Welcome to our company. We build tools that help you work better. Join our team to make an impact.'}
            </p>
            <button className="bg-[#F4F3EC] text-[#0F0E0E] px-6 py-3 rounded-lg font-medium hover:bg-[#E8E7DF] transition-colors">
              View Open Roles
            </button>
          </Motion>
          <Motion
            className="aspect-4/3 rounded-lg overflow-hidden relative border border-white/10"
            initial={{ opacity: 0, scale: 0.985 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Synthetic noisy gradient background to match original image */}
            <div className="absolute inset-0 bg-linear-to-br from-[#1b4332] via-[#2d6a4f] to-[#40916c] opacity-80 mix-blend-screen"></div>
            <div
              className={`absolute inset-0 bg-[url('${(data.hero?.image as Media)?.url || 'https://grainy-gradients.vercel.app/noise.svg'}')] opacity-50 contrast-150 mix-blend-overlay`}
            ></div>
          </Motion>
        </Motion>

        {/* Section 1: More than just a workplace */}
        <GridOne careersPageData={data} />

        {/* Section 2: Work hard. Live fully. */}
        <GridTwo careersPageData={data} />

        {/* Section 3: Engineering growth */}
        <GridThree careersPageData={data} />

        {/* Section 4: Team Voices */}
        <Section
          title={data.team?.heading || 'Team voices. Production stories.'}
          desc={
            data.team?.description ||
            "Our engineers share what it's like to maintain production systems, grow through operational accountability, and build careers around technical depth rather than corporate advancement."
          }
        >
          <Corousel items={(data.team?.members as Team[]) || []} />
        </Section>

        {/* Section 5: Open Roles — list from API (✅ GET /jobs); heading/description from CMS */}
        <Jobs
          jobs={openRoles}
          heading={data.jobs?.heading || undefined}
          description={data.jobs?.description || undefined}
        />
      </main>
    </div>
  )
}
