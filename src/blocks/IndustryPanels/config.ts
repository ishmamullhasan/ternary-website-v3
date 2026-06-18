import type { Block } from 'payload'

import { imageField } from '@/fields/image'
import { rowLabelAdmin } from '@/fields/rowLabel'
import { sectionHeader } from '@/fields/sectionHeader'
import { tagsArray } from '@/fields/arrays'

export const IndustryPanels: Block = {
  slug: 'industryPanels',
  interfaceName: 'IndustryPanelsBlock',
  labels: { singular: 'Industry Panels', plural: 'Industry Panels' },
  fields: [
    ...sectionHeader(),
    {
      name: 'items',
      label: 'Panels',
      type: 'array',
      admin: { ...rowLabelAdmin },
      fields: [
        {
          name: 'industry',
          label: 'Industry',
          type: 'relationship',
          relationTo: 'industry',
          admin: {
            description: 'Linked industry; its title/excerpt/thumbnail fill any fields left blank below.',
          },
        },
        { name: 'title', label: 'Title', type: 'text', admin: { width: '50%' } },
        { name: 'description', label: 'Description', type: 'textarea' },
        imageField({ name: 'image', label: 'Image' }),
        tagsArray(),
      ],
    },
  ],
}

export default IndustryPanels
