import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

export const IndustryList: Block = {
  slug: 'industryList',
  interfaceName: 'IndustryListBlock',
  labels: { singular: 'Industry List', plural: 'Industry Lists' },
  fields: [
    ...sectionHeader(),
    {
      name: 'industry',
      label: 'Industries',
      type: 'relationship',
      relationTo: 'industry',
      hasMany: true,
      admin: {
        description: 'Industries rendered as the grid of cards.',
      },
    },
  ],
}

export default IndustryList
