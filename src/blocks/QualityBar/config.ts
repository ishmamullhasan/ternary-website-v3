import type { Block } from 'payload'

import { cardsArray } from '@/fields/arrays'
import { sectionHeader } from '@/fields/sectionHeader'

export const QualityBar: Block = {
  slug: 'qualityBar',
  interfaceName: 'QualityBarBlock',
  labels: { singular: 'Quality Bar', plural: 'Quality Bars' },
  fields: [
    ...sectionHeader(),
    cardsArray({
      name: 'items',
      label: 'Cards',
      icons: ['activity', 'shield-check', 'workflow', 'book-check'],
    }),
  ],
}

export default QualityBar
