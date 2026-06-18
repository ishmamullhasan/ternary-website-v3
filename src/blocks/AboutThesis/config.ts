import type { Block } from 'payload'

import { cardsArray } from '@/fields/arrays'
import { sectionHeader } from '@/fields/sectionHeader'

export const AboutThesis: Block = {
  slug: 'aboutThesis',
  interfaceName: 'AboutThesisBlock',
  labels: { singular: 'About Thesis', plural: 'About Theses' },
  fields: [
    ...sectionHeader(),
    cardsArray({
      name: 'items',
      label: 'Items',
      media: true,
    }),
  ],
}

export default AboutThesis
