import type { Page } from '@/payload-types'

import type { JSX } from 'react'

import Motion from '@/components/animation/motion'
import { ContentBlockComponent } from './Content/Component'
import { CtaBlockComponent } from './Cta/Component'
import { FeatureGridBlockComponent } from './FeatureGrid/Component'
import { FormBlockComponent } from './Form/Component'
import { HeroBlockComponent } from './Hero/Component'
import {
  AboutSectionComponent,
  CapabilitiesSectionComponent,
  EngagementSectionComponent,
  GlobalDeliverySectionComponent,
  OpportunitiesSectionComponent,
  ProcessSectionComponent,
  ScalesSectionComponent,
  SolutionsSectionComponent,
  TeamSectionComponent,
} from './homeSections/Component'
import { IndustriesSectionComponent } from './IndustriesSection/Component'
import { JobsBlockComponent } from './Jobs/Component'
import { LogosBlockComponent } from './Logos/Component'
import { RelationGridBlockComponent } from './RelationGrid/Component'
import { StepsBlockComponent } from './Steps/Component'
import { TeamBlockComponent } from './Team/Component'

type BlockType = NonNullable<Page['layout']>[number]

// Mirror the bespoke page's per-section fade-up so blocks-driven pages animate identically.
const motionSectionProps = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

/**
 * Renders a single block by switching on `blockType`. The switch narrows the discriminated
 * union, so each component gets fully-typed props (no casts). New blocks: register the config
 * on the Pages collection and add a case here.
 */
function renderBlock(block: BlockType): JSX.Element | null {
  switch (block.blockType) {
    case 'hero':
      return <HeroBlockComponent {...block} />
    case 'content':
      return <ContentBlockComponent {...block} />
    case 'relationGrid':
      return <RelationGridBlockComponent {...block} />
    case 'featureGrid':
      return <FeatureGridBlockComponent {...block} />
    case 'logos':
      return <LogosBlockComponent {...block} />
    case 'teamBlock':
      return <TeamBlockComponent {...block} />
    case 'steps':
      return <StepsBlockComponent {...block} />
    case 'industriesSection':
      return <IndustriesSectionComponent {...block} />
    case 'aboutSection':
      return <AboutSectionComponent {...block} />
    case 'solutionsSection':
      return <SolutionsSectionComponent {...block} />
    case 'capabilitiesSection':
      return <CapabilitiesSectionComponent {...block} />
    case 'scalesSection':
      return <ScalesSectionComponent {...block} />
    case 'engagementSection':
      return <EngagementSectionComponent {...block} />
    case 'globalDeliverySection':
      return <GlobalDeliverySectionComponent {...block} />
    case 'processSection':
      return <ProcessSectionComponent {...block} />
    case 'teamSection':
      return <TeamSectionComponent {...block} />
    case 'opportunitiesSection':
      return <OpportunitiesSectionComponent {...block} />
    case 'jobsBlock':
      return <JobsBlockComponent {...block} />
    case 'formBlock':
      return <FormBlockComponent {...block} />
    case 'ctaBlock':
      return <CtaBlockComponent {...block} />
    default:
      return null
  }
}

/**
 * Renders a Page's `layout` blocks inside the shared page container — the section components
 * are full-bleed by design and rely on this wrapper for max-width, centering, the 20px gutter
 * and the vertical rhythm between sections (matching the bespoke homepage layout).
 */
export function RenderBlocks({ blocks }: { blocks?: Page['layout'] }): JSX.Element | null {
  if (!blocks?.length) return null

  return (
    <div className="flex flex-col lg:gap-32 gap-10 text-primary max-w-7xl mx-auto w-full px-5 lg:pb-24 pb-10">
      {blocks.map((block, i) => {
        const el = renderBlock(block)
        if (!el) return null
        return (
          <Motion tag="section" className="w-full" key={block.id || i} {...motionSectionProps}>
            {el}
          </Motion>
        )
      })}
    </div>
  )
}
