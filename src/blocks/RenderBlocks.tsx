import type { Page } from '@/payload-types'

import type { JSX } from 'react'

import { CtaBlockComponent } from './Cta/Component'
import { HeroBlockComponent } from './Hero/Component'

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
          case 'ctaBlock':
            return <CtaBlockComponent key={key} {...block} />
          default:
            return null
        }
      })}
    </>
  )
}
