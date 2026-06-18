import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

export const IndustriesDetails: Block = {
  slug: 'industriesDetails',
  interfaceName: 'IndustriesDetailsBlock',
  labels: { singular: 'Industries Details', plural: 'Industries Details' },
  fields: [
    ...sectionHeader(),
    {
      name: 'content',
      label: 'Content',
      type: 'richText',
      localized: true,
      admin: {
        description: 'Rich text body rendered beside the heading/description.',
      },
    },
  ],
}

export default IndustriesDetails
