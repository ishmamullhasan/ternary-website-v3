import type {
  AboutSectionBlock,
  CapabilitiesSectionBlock,
  EngagementSectionBlock,
  GlobalDeliverySectionBlock,
  OpportunitiesSectionBlock,
  ProcessSectionBlock,
  ScalesSectionBlock,
  SolutionsSectionBlock,
  TeamSectionBlock,
} from '@/payload-types'

import type { JSX } from 'react'

import AboutComp from '@/components/sections/aboutComp'
import CapabilitiesComp from '@/components/sections/capabilitiesComp'
import EngagementComp from '@/components/sections/engagementComp'
import GlobalDeliveryComp from '@/components/sections/globalDeliveryComp'
import OpportunitiesComp from '@/components/sections/opportunitiesComp'
import ProcessComp from '@/components/sections/processComp'
import ScalesComp from '@/components/sections/scalesComp'
import SolutionsComp from '@/components/sections/solutionsComp'
import TeamComp from '@/components/sections/teamComp'

// Each wrapper forwards the block's content to the real hand-built component. The block
// fields mirror the component props; at depth-2 the relationships are populated docs, so
// the data matches the component's prop shape (cast to bridge the generated block type).
type Props<T> = Parameters<T extends (...args: infer _) => unknown ? T : never>[0]

export const AboutSectionComponent = (p: AboutSectionBlock): JSX.Element => (
  <AboutComp {...(p as unknown as Props<typeof AboutComp>)} />
)
export const SolutionsSectionComponent = (p: SolutionsSectionBlock): JSX.Element => (
  <SolutionsComp {...(p as unknown as Props<typeof SolutionsComp>)} />
)
export const CapabilitiesSectionComponent = (p: CapabilitiesSectionBlock): JSX.Element => (
  <CapabilitiesComp {...(p as unknown as Props<typeof CapabilitiesComp>)} />
)
export const ScalesSectionComponent = (p: ScalesSectionBlock): JSX.Element => (
  <ScalesComp {...(p as unknown as Props<typeof ScalesComp>)} />
)
export const EngagementSectionComponent = (p: EngagementSectionBlock): JSX.Element => (
  <EngagementComp {...(p as unknown as Props<typeof EngagementComp>)} />
)
export const GlobalDeliverySectionComponent = (p: GlobalDeliverySectionBlock): JSX.Element => (
  <GlobalDeliveryComp {...(p as unknown as Props<typeof GlobalDeliveryComp>)} />
)
export const ProcessSectionComponent = (p: ProcessSectionBlock): JSX.Element => (
  <ProcessComp {...(p as unknown as Props<typeof ProcessComp>)} />
)
export const TeamSectionComponent = (p: TeamSectionBlock): JSX.Element => (
  <TeamComp {...(p as unknown as Props<typeof TeamComp>)} />
)
export const OpportunitiesSectionComponent = (p: OpportunitiesSectionBlock): JSX.Element => (
  <OpportunitiesComp {...(p as unknown as Props<typeof OpportunitiesComp>)} />
)
