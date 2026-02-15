import AboutComp from '@/components/sections/aboutComp'
import Capabilities from '@/components/sections/capabilities'
import Incubations from '@/components/sections/incubations'
import Section from '@/components/sections/section'
import Solutions from '@/components/sections/solutions'
import TeamSection from '@/components/sections/team'
import Journey from '@/components/sections/timeline'
import Journey_SM from '@/components/sections/timeline_sm'
import type { Homepage, Media, Story } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { JSX } from 'react'

export default async function Page(): Promise<JSX.Element> {
  const homePageData = (await getCachedGlobal('homepage', 1)) as Homepage | null

  if (!homePageData) {
    return (
      <div className="max-w-6xl text-red-700 font-bold flex justify-center items-center p-12">
        Error loading data.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-20 text-primary">
      <section className="w-full">
        <AboutComp
          heading={homePageData.about?.heading}
          description={homePageData.about?.description}
          stories={homePageData.about?.stories as Story[] | null}
          organizations={homePageData.about?.organizations as { heading?: string | null; organization?: { icon?: Media | null; name?: string | null; link?: string | null; }[] | null; } | null}
          bottomDescription={homePageData.about?.bottomDescription}
        />
      </section>
      <Section
        id="capabilities"
        label="Capbilities"
        title="Turning Ideas into Impact."
        description="Our capabilities span the entire product lifecycle. We handle everything—from ideation and design to development and deployment—so you can focus on your vision."
      >
        <div>
          <Capabilities />
        </div>
      </Section>

      <Section
        id="solutions"
        label="Solutions"
        title="Empowering Innovation Through Partnerships."
        description="From engineering augmentation to strategic consulting and full-cycle product development, we adapt to your needs. Our engagement models are designed to help you innovate, accelerate, and succeed."
      >
        <div>
          <Solutions />
        </div>
      </Section>
      {/* <Section 
        id="stories" 
        label="Stories" 
        title="Real Stories, Real Impact."
        description="Discover how we've partnered with clients across industries to create transformative solutions. Their successes are the true testament to our capabilities."
        >
        <div></div>
      </Section> */}
      <Section
        id="incubations"
        label="Incubations"
        title="Our products that are delivering an impact today."
        description="Empowering innovation by crafting cutting-edge software solutions that address real-world challenges. We have incubated ideas and brought them to life—transforming visionary concepts into scalable, impactful products for industries worldwide."
      >
        <Incubations />
      </Section>

      <Section
        id="company"
        label="Company"
        title="Shaping the Future with Global Expertise."
        description="Behind every great product is a team driven by curiosity and innovation. Our global team brings diverse experiences and perspectives to solve complex challenges. We approach every project with care, creativity, and a commitment to excellence. Together, we're shaping solutions that impact millions around the world."
      >
        <div className="flex flex-col mt-4 gap-8">
          <div className="flex flex-col gap-6 w-full ">
            <div className="max-w-[70%] space-y-2">
              <h3 className="text-lg font-semibold">The Team</h3>
              <p className="text-sm opacity-70">
                Bringing experience and capabilities from around the globe.
              </p>
            </div>
            <TeamSection className="col-span-4 pl-6 py-6 justify-center border border-muted rounded-xl" />
          </div>

          <div className="flex flex-col gap-6 w-full py-6">
            <div className="min-w-full lg:max-w-[70%] space-y-2">
              <h3 className="text-lg font-semibold">The Journey</h3>
              <p className="text-sm opacity-70 ">From small beginning and against all odds.</p>
            </div>
            {/* Timeline for large device */}
            <Journey className="col-span-4 pl-6 py-16 border border-muted rounded-xl hidden lg:block" />
            {/* Timeline for smaller device */}
            <Journey_SM className="lg:hidden" />
          </div>
          <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-5 w-full py-6">
            <div className="min-w-full lg:max-w-[70%] space-y-2">
              <h3 className="text-lg font-semibold">Opportunities</h3>
              <p className="text-sm opacity-70 ">Help us shape the lives of millions.</p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
