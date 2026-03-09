import AboutComp from '@/components/sections/aboutComp'
import CapabilitiesComp from '@/components/sections/capabilitiesComp'
import IndustriesComp from '@/components/sections/industriesComp'
import ScalesComp from '@/components/sections/scalesComp'
import SolutionsComp from '@/components/sections/solutionsComp'
import TeamComp from '@/components/sections/teamComp'

import { RichText } from '@/components/RichText'
import EngagementComp from '@/components/sections/engagementComp'
import GlobalDeliveryComp from '@/components/sections/globalDeliveryComp'
import OpportunitiesComp from '@/components/sections/opportunitiesComp'
import ProcessComp from '@/components/sections/processComp'
import type {
  Capability,
  Homepage,
  Industry,
  Job,
  Media,
  Model,
  Scale,
  Solution,
} from '@/payload-types'
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
      <div className="max-w-6xl text-red-700 font-bold flex justify-center items-center p-12">
        Error loading data.
      </div>
    )
  }

  return (
    <div className="flex flex-col text-primary max-w-7xl mx-auto">
      <section className="w-full mb-16">
        <AboutComp
          heading={homePageData.about?.heading}
          description={homePageData.about?.description}
          items={homePageData.about?.items as MultiRelation[] | null}
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

      <section id="solutions" className="w-full mb-16">
        <SolutionsComp
          heading={homePageData.solutions?.heading}
          description={homePageData.solutions?.description}
          image={homePageData.solutions?.image as Media}
          items={homePageData.solutions?.items as Solution[]}
        />
      </section>
      <section className="w-full mb-16">
        <CapabilitiesComp
          heading={homePageData.capabilities?.heading}
          description={homePageData.capabilities?.description}
          capability={homePageData.capabilities?.capability as Capability[]}
          heading_2={homePageData.capabilities?.heading_2}
          description_2={homePageData.capabilities?.description_2}
          image={homePageData.capabilities?.image as Media}
        />
      </section>
      <section className="w-full mb-16">
        <IndustriesComp
          heading={homePageData.industries?.heading}
          description={homePageData.industries?.description}
          industry={homePageData.industries?.industry as Industry[]}
        />
      </section>
      <section className="w-full mb-20">
        <ScalesComp
          heading={homePageData.scales?.heading}
          description={homePageData.scales?.description}
          scales={homePageData.scales?.scale as Scale[]}
        />
      </section>
      <section className="w-full mb-16">
        <EngagementComp
          heading={homePageData.engagement?.heading}
          description={homePageData.engagement?.description}
          model={homePageData.engagement?.model as Model[]}
        />
      </section>
      <section className="w-full">
        <GlobalDeliveryComp
          heading={homePageData.globalDelivery?.heading}
          description={homePageData.globalDelivery?.description}
          title={homePageData.globalDelivery?.title}
          excerpt={homePageData.globalDelivery?.excerpt}
          image={homePageData.globalDelivery?.image as Media}
        />
      </section>
      <section className="w-full">
        <ProcessComp
          heading={homePageData.processes?.heading}
          description={homePageData.processes?.description}
          image={homePageData.processes?.image as Media}
          process={
            homePageData.processes?.process as
              | { title?: string | null; description?: RichText | null }[]
              | null
          }
        />
      </section>

      <section className="w-full mb-16 ">
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
      </section>
      <section className="w-full ">
        <OpportunitiesComp
          heading={homePageData.opportunities?.heading}
          description={homePageData.opportunities?.description}
          opportunity={homePageData.opportunities?.opportunity as Job[] | null}
        />
      </section>
    </div>
  )
}
