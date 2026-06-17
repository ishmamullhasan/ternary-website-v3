import type { Page } from '@/payload-types'

import type { JSX } from 'react'

import { ContentBlockComponent } from './Content/Component'
import { CtaBlockComponent } from './Cta/Component'
import { FeatureGridBlockComponent } from './FeatureGrid/Component'
import { FormBlockComponent } from './Form/Component'
import { HeroBlockComponent } from './Hero/Component'
import { JobsBlockComponent } from './Jobs/Component'
import { LogosBlockComponent } from './Logos/Component'
import { RelationGridBlockComponent } from './RelationGrid/Component'
import { StepsBlockComponent } from './Steps/Component'
import { TeamBlockComponent } from './Team/Component'

/**
 * Renders a Page's `layout` blocks by switching on `blockType`. New blocks are added by
 * registering their config on the Pages collection and adding a case here. The switch
 * narrows the discriminated union, so each component gets fully-typed props (no casts).
 */
export function RenderBlocks({ blocks }: { blocks?: Page['layout'] }): JSX.Element | null {
  if (!blocks?.length) return null

  return (
    <>
      {blocks.map((block, i) => {
        const key = block.id || i
        switch (block.blockType) {
          case 'hero':
            return <HeroBlockComponent key={key} {...block} />
          case 'content':
            return <ContentBlockComponent key={key} {...block} />
          case 'relationGrid':
            return <RelationGridBlockComponent key={key} {...block} />
          case 'featureGrid':
            return <FeatureGridBlockComponent key={key} {...block} />
          case 'logos':
            return <LogosBlockComponent key={key} {...block} />
          case 'teamBlock':
            return <TeamBlockComponent key={key} {...block} />
          case 'steps':
            return <StepsBlockComponent key={key} {...block} />
          case 'jobsBlock':
            return <JobsBlockComponent key={key} {...block} />
          case 'formBlock':
            return <FormBlockComponent key={key} {...block} />
          case 'ctaBlock':
            return <CtaBlockComponent key={key} {...block} />
          default:
            return null
        }
      })}
    </>
  )
}
