import type { Block } from 'payload'

import { cardsArray } from '@/fields/arrays'
import { benefitIcons } from '@/fields/iconSets'
import { sectionHeader } from '@/fields/sectionHeader'

/**
 * Careers "More than just a workplace" bento grid (formerly section_2).
 * Six cards: the first (large) card carries an image; the last spans two columns
 * with a decorative graphic. Cards render in array order.
 */
export const CareersGridOne: Block = {
  slug: 'careersGridOne',
  interfaceName: 'CareersGridOneBlock',
  labels: { singular: 'Careers Grid One', plural: 'Careers Grid One' },
  fields: [...sectionHeader(), cardsArray({ name: 'items', label: 'Cards', media: true, icons: [...benefitIcons] })],
}

export default CareersGridOne
