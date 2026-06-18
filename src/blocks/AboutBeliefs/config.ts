import type { Block } from 'payload'

import { cardsArray } from '@/fields/arrays'
import { sectionHeader } from '@/fields/sectionHeader'

export const AboutBeliefs: Block = {
  slug: 'aboutBeliefs',
  interfaceName: 'AboutBeliefsBlock',
  labels: { singular: 'About Beliefs', plural: 'About Beliefs' },
  fields: [
    ...sectionHeader(),
    cardsArray({
      name: 'items',
      label: 'Items',
      media: true,
    }),
  ],
}

export default AboutBeliefs
