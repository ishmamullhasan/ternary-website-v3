import type { Block } from 'payload'

import { cardsArray } from '@/fields/arrays'
import { sectionHeader } from '@/fields/sectionHeader'

/**
 * Careers "Work hard. Live fully." grid (formerly section_3). Four cards rendered as a
 * 5-column desktop bento (cards 1 & 2 carry images) and a swipeable carousel on mobile.
 */
export const CareersGridTwo: Block = {
  slug: 'careersGridTwo',
  interfaceName: 'CareersGridTwoBlock',
  labels: { singular: 'Careers Grid Two', plural: 'Careers Grid Two' },
  fields: [
    ...sectionHeader(),
    cardsArray({ name: 'items', label: 'Cards', media: true }),
  ],
}

export default CareersGridTwo
