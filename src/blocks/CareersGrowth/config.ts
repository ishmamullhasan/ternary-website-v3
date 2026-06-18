import type { Block } from 'payload'

import { cardsArray, tagsArray } from '@/fields/arrays'
import { sectionHeader } from '@/fields/sectionHeader'

/**
 * Careers "Engineering growth" grid (formerly section_4). A featured leveling card with a
 * progression-line graphic and up to four named levels, plus four supporting cards (the last
 * carries an image).
 */
export const CareersGrowth: Block = {
  slug: 'careersGrowth',
  interfaceName: 'CareersGrowthBlock',
  labels: { singular: 'Careers Growth', plural: 'Careers Growth' },
  fields: [
    ...sectionHeader(),
    {
      name: 'featured',
      label: 'Featured card',
      type: 'group',
      admin: { description: 'The large leveling card with the progression graphic.' },
      fields: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'excerpt', label: 'Excerpt', type: 'textarea', admin: { description: 'Short supporting copy.' } },
        { ...tagsArray({ name: 'levels', label: 'Levels' }), maxRows: 4 },
      ],
    },
    cardsArray({ name: 'items', label: 'Supporting cards', media: true }),
  ],
}

export default CareersGrowth
