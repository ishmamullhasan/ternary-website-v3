import type { Block } from 'payload'

import { rowLabelAdmin } from '@/fields/rowLabel'
import { sectionHeader } from '@/fields/sectionHeader'

export const SolutionsEngage: Block = {
  slug: 'solutionsEngage',
  interfaceName: 'SolutionsEngageBlock',
  labels: { singular: 'How We Engage', plural: 'How We Engage' },
  fields: [
    ...sectionHeader(),
    {
      name: 'cards',
      label: 'Engagement cards',
      type: 'array',
      maxRows: 3,
      admin: {
        ...rowLabelAdmin,
        description: 'Three engagement models. Card gradient/bar colors are fixed in code by position.',
      },
      fields: [
        { name: 'title', label: 'Title', type: 'text', required: true, admin: { width: '50%' } },
        {
          name: 'subtitle',
          label: 'Subtitle',
          type: 'text',
          admin: { width: '50%', description: 'Rendered word-per-line in a mono font.' },
        },
        { name: 'description', label: 'Description', type: 'textarea' },
      ],
    },
  ],
}

export default SolutionsEngage
