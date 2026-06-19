import AllStoriesGrid, { type StoryGridItem } from '@/components/sections/stories/AllStoriesGrid'
import type { PressRelease, StoriesArchiveBlock } from '@/payload-types'
import type { JSX } from 'react'

export const StoriesArchiveComponent = (data: StoriesArchiveBlock): JSX.Element => {
  const gridItems = data.items as StoryGridItem[] | undefined
  const pressReleases = data.pressRelease as PressRelease[] | undefined

  return (
    <AllStoriesGrid
      heading={data.heading}
      description={data.description}
      items={gridItems}
      pressReleases={pressReleases}
    />
  )
}

export default StoriesArchiveComponent
