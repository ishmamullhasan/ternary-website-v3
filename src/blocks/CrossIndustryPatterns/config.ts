import type { Block } from 'payload'

import { cardsArray } from '@/fields/arrays'
import { sectionHeader } from '@/fields/sectionHeader'

export const CrossIndustryPatterns: Block = {
  slug: 'crossIndustryPatterns',
  interfaceName: 'CrossIndustryPatternsBlock',
  labels: { singular: 'Cross-industry Patterns', plural: 'Cross-industry Patterns' },
  fields: [
    ...sectionHeader(),
    cardsArray({
      name: 'items',
      label: 'Items',
      media: true,
    }),
  ],
}

export default CrossIndustryPatterns
