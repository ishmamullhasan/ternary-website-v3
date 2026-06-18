import Motion from '@/components/animation/motion'
import AllStoriesGrid, { type StoryGridItem } from '@/components/sections/stories/AllStoriesGrid'
import type { PressRelease, StoriesArchiveBlock } from '@/payload-types'
import type { JSX } from 'react'

export const StoriesArchiveComponent = (data: StoriesArchiveBlock): JSX.Element => {
  const motionSectionProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  const gridItems = data.items as StoryGridItem[] | undefined
  const pressReleases = data.pressRelease as PressRelease[] | undefined

  return (
    <Motion tag="section" {...motionSectionProps}>
      <AllStoriesGrid
        heading={data.heading}
        description={data.description}
        items={gridItems}
        pressReleases={pressReleases}
      />
    </Motion>
  )
}

export default StoriesArchiveComponent
