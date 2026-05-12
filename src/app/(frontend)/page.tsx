import Motion from '@/components/animation/motion'
import AboutComp from '@/components/sections/aboutComp'
import CapabilitiesComp from '@/components/sections/capabilitiesComp'
import IndustriesComp from '@/components/sections/industriesComp'
import ScalesComp from '@/components/sections/scalesComp'
import SolutionsComp from '@/components/sections/solutionsComp'
import TeamComp from '@/components/sections/teamComp'

import { RichText } from '@/components/richtext'
import EngagementComp from '@/components/sections/engagementComp'
import GlobalDeliveryComp from '@/components/sections/globalDeliveryComp'
import OpportunitiesComp from '@/components/sections/opportunitiesComp'
import ProcessComp from '@/components/sections/processComp'
import type { Capability, Homepage, Industry, Job, Media, Model, Scale, Solution } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { JSX } from 'react'
type MultiRelation =
  | { relationTo: 'capability'; value: Capability }
  | { relationTo: 'solution'; value: Solution }
  | { relationTo: 'industry'; value: Industry }
  | { relationTo: 'scale'; value: Scale }
  | { relationTo: 'model'; value: Model }

export const dynamic = 'force-dynamic'

export default async function Page(): Promise<JSX.Element> {
  let homePageData: Homepage | null = null
  try {
    homePageData = (await getCachedGlobal('homepage', 2)()) as Homepage | null
  } catch {
    // Database may be unavailable during build
  }

  if (!homePageData) {
    return (
      <div className="max-w-6xl text-red-700 font-bold flex justify-center items-center p-12">Error loading data.</div>
    )
  }

  const motionSectionProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  return (
    <div className="flex flex-col lg:gap-32 gap-10 text-primary max-w-7xl mx-auto w-full lg:pb-24 pb-10">
      <Motion tag="section" className="w-full" {...motionSectionProps}>
        <AboutComp
          heading={homePageData.about?.heading}
          description={homePageData.about?.description}
          items={homePageData.about?.items as MultiRelation[] | null}
          organizations={
            homePageData.about?.organizations as {
              heading?: string | null
              organization?: { icon?: Media | null; name?: string | null; link?: string | null }[] | null
            } | null
          }
          bottomDescription={homePageData.about?.bottomDescription}
        />
      </Motion>

      <Motion tag="section" className="w-full" {...motionSectionProps}>
        <div id="solutions">
          <SolutionsComp
            heading={homePageData.solutions?.heading}
            description={homePageData.solutions?.description}
            image={homePageData.solutions?.image as Media}
            items={homePageData.solutions?.items as Solution[]}
          />
        </div>
      </Motion>

      <Motion tag="section" className="w-full" {...motionSectionProps}>
        <CapabilitiesComp
          heading={homePageData.capabilities?.heading}
          description={homePageData.capabilities?.description}
          capability={homePageData.capabilities?.capability as Capability[]}
          heading_2={homePageData.capabilities?.heading_2}
          description_2={homePageData.capabilities?.description_2}
          image={homePageData.capabilities?.image as Media}
        />
      </Motion>

      <Motion tag="section" className="w-full" {...motionSectionProps}>
        <IndustriesComp
          heading={homePageData.industries?.heading}
          description={homePageData.industries?.description}
          industry={homePageData.industries?.industry as Industry[]}
        />
      </Motion>

      <Motion tag="section" className="w-full" {...motionSectionProps}>
        <ScalesComp
          heading={homePageData.scales?.heading}
          description={homePageData.scales?.description}
          scales={homePageData.scales?.scale as Scale[]}
        />
      </Motion>

      <Motion tag="section" className="w-full" {...motionSectionProps}>
        <EngagementComp
          heading={homePageData.engagement?.heading}
          description={homePageData.engagement?.description}
          model={homePageData.engagement?.model as Model[]}
        />
      </Motion>
      <Motion tag="section" className="w-full" {...motionSectionProps}>
        <GlobalDeliveryComp
          heading={homePageData.globalDelivery?.heading}
          description={homePageData.globalDelivery?.description}
          title={homePageData.globalDelivery?.title}
          excerpt={homePageData.globalDelivery?.excerpt}
          image={homePageData.globalDelivery?.image as Media}
        />
      </Motion>

      <Motion tag="section" className="w-full" {...motionSectionProps}>
        <ProcessComp
          heading={homePageData.processes?.heading}
          description={homePageData.processes?.description}
          process={homePageData.processes?.process as { title?: string | null; description?: RichText | null }[] | null}
        />
      </Motion>

      <Motion tag="section" className="w-full" {...motionSectionProps}>
        <TeamComp
          heading={homePageData.team?.heading}
          description={homePageData.team?.description}
          members={
            homePageData.team?.members as
              | {
                  name?: string | null
                  position?: string | null
                  image?: Media | null
                  linkedin?: string | null
                }[]
              | null
          }
        />
      </Motion>
      <Motion tag="section" className="w-full" {...motionSectionProps}>
        <OpportunitiesComp
          heading={homePageData.opportunities?.heading}
          description={homePageData.opportunities?.description}
          opportunity={homePageData.opportunities?.opportunity as Job[] | null}
        />
      </Motion>
    </div>
  )
}
