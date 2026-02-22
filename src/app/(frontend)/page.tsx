import AboutComp from '@/components/sections/aboutComp'
import CapabilitiesComp from '@/components/sections/capabilitiesComp'
import Incubations from '@/components/sections/incubations'
import Section from '@/components/sections/section'
import SolutionsComp from '@/components/sections/solutionsComp'
import IndustriesComp from '@/components/sections/industriesComp'
import ScalesComp from '@/components/sections/scalesComp'
import TeamSection from '@/components/sections/team'
import Journey from '@/components/sections/timeline'
import Journey_SM from '@/components/sections/timeline_sm'
import type { Capability, Homepage, Industry, Media, Model, Scale, Solution, Story } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { JSX } from 'react'
import EngagementComp from '@/components/sections/engagementComp'
import GlobalDeliveryComp from '@/components/sections/globalDeliveryComp'

export default async function Page(): Promise<JSX.Element> {
  const homePageData = (await getCachedGlobal('homepage', 2)()) as Homepage | null

  if (!homePageData) {
    return (
      <div className="max-w-6xl text-red-700 font-bold flex justify-center items-center p-12">
        Error loading data.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-20 text-primary max-w-[1480px] mx-auto">
      <section className="w-full">
        <AboutComp
          heading={homePageData.about?.heading}
          description={homePageData.about?.description}
          stories={homePageData.about?.stories as Story[]}
          organizations={
            homePageData.about?.organizations as {
              heading?: string | null
              organization?:
                | { icon?: Media | null; name?: string | null; link?: string | null }[]
                | null
            } | null
          }
          bottomDescription={homePageData.about?.bottomDescription}
        />
      </section>

      <section id="solutions" className="w-full">
        <SolutionsComp
          heading={homePageData.solutions?.heading ?? 'Empowering Innovation Through Partnerships.'}
          description={
            homePageData.solutions?.description ??
            'From engineering augmentation to strategic consulting and full-cycle product development, we adapt to your needs. Our engagement models are designed to help you innovate, accelerate, and succeed.'
          }
          image={homePageData.solutions?.image as Media | null}
          items={homePageData.solutions?.items as Solution[] | null}
        />
      </section>
      <section className="w-full">
        <CapabilitiesComp
          heading={homePageData.capabilities?.heading ?? 'Turning Ideas into Impact.'}
          description={
            homePageData.capabilities?.description ??
            'Our capabilities span the entire product lifecycle. We handle everything—from ideation and design to development and deployment—so you can focus on your vision.'
          }
          capability={homePageData.capabilities?.capability as Capability[] | null}
          heading_2={homePageData.capabilities?.heading_2 ?? 'Leadership'}
          description_2={
            homePageData.capabilities?.description_2 ??
            'Our leadership team is dedicated to delivering the best possible solutions to our clients.'
          }
          image={homePageData.capabilities?.image as Media | null}
        />
      </section>
      <section className="w-full">
        <IndustriesComp
          heading={homePageData.industries?.heading}
          description={homePageData.industries?.description}
          industry={homePageData.industries?.industry as Industry[]}
        />
      </section>
      <section className="w-full">
        <ScalesComp
          heading={homePageData.scales?.heading}
          description={homePageData.scales?.description}
          scales={homePageData.scales?.scale as Scale[]}
        />
      </section>
      <section className="w-full">
        <EngagementComp
          heading={homePageData.engagement?.heading}
          description={homePageData.engagement?.description}
          model={homePageData.engagement?.model as Model[]}
        />
      </section>
       <section id="solutions" className="w-full">
        <GlobalDeliveryComp
          heading={homePageData.globalDelivery?.heading }
          description={
            homePageData.globalDelivery?.description   }
            title={homePageData.globalDelivery?.title  }
            excerpt={homePageData.globalDelivery?.excerpt}
          image={homePageData.globalDelivery?.image as Media | null}
        />
      </section>

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
