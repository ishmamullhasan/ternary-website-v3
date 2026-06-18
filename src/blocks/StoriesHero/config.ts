import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

export const StoriesHero: Block = {
  slug: 'storiesHero',
  interfaceName: 'StoriesHeroBlock',
  labels: { singular: 'Stories Hero', plural: 'Stories Heroes' },
  fields: [...sectionHeader()],
}

export default StoriesHero
