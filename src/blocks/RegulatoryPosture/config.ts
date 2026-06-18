import type { Block } from 'payload'

import { cardsArray } from '@/fields/arrays'
import { sectionHeader } from '@/fields/sectionHeader'

export const RegulatoryPosture: Block = {
  slug: 'regulatoryPosture',
  interfaceName: 'RegulatoryPostureBlock',
  labels: { singular: 'Regulatory Posture', plural: 'Regulatory Postures' },
  fields: [
    ...sectionHeader(),
    cardsArray({
      name: 'items',
      label: 'Items',
      icons: ['lock', 'activity', 'check'],
    }),
  ],
}

export default RegulatoryPosture
