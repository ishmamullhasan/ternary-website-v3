import type { Block } from 'payload'

import { cardsArray } from '@/fields/arrays'
import { sectionHeader } from '@/fields/sectionHeader'

export const ScalesHero: Block = {
  slug: 'scalesHero',
  interfaceName: 'ScalesHeroBlock',
  labels: { singular: 'Scales Hero', plural: 'Scales Heroes' },
  fields: [
    {
      name: 'eyebrow',
      label: 'Eyebrow',
      type: 'text',
      admin: {
        description: 'Optional small label rendered above the heading.',
      },
    },
    ...sectionHeader(),
    cardsArray({ name: 'items', label: 'Hero cards', media: true }),
  ],
}

export default ScalesHero
