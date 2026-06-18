import type { Block } from 'payload'

import { cardsArray } from '@/fields/arrays'
import { sectionHeader } from '@/fields/sectionHeader'

export const AboutApproach: Block = {
  slug: 'aboutApproach',
  interfaceName: 'AboutApproachBlock',
  labels: { singular: 'About Approach', plural: 'About Approaches' },
  fields: [
    ...sectionHeader(),
    cardsArray({
      name: 'items',
      label: 'Items',
      media: true,
    }),
  ],
}

export default AboutApproach
