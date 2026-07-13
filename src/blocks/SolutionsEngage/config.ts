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
        description:
          'Three engagement models. Link each card to a Model record to show its thumbnail in the card panel; ' +
          'without one (or without a thumbnail on it) the card falls back to the signature gradient.',
      },
      fields: [
        { name: 'title', label: 'Title', type: 'text', required: true, localized: true, admin: { width: '50%' } },
        {
          name: 'model',
          label: 'Model',
          type: 'relationship',
          relationTo: 'model',
          admin: {
            width: '50%',
            description: "The panel image is this model's Thumbnail (edit it under Content → Models).",
          },
        },
        {
          name: 'subtitle',
          label: 'Subtitle',
          type: 'text',
          localized: true,
          admin: { width: '50%', description: 'Rendered word-per-line in a mono font.' },
        },
        { name: 'description', label: 'Description', type: 'richText', localized: true },
        {
          name: 'idealFor',
          label: 'Ideal for',
          type: 'textarea',
          localized: true,
          admin: {
            description: 'The right-side "Ideal for" paragraph — distinct from the description intro line.',
          },
        },
      ],
    },
  ],
}

export default SolutionsEngage
