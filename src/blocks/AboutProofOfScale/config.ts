import type { Block } from 'payload'

import { statsArray, tagsArray } from '@/fields/arrays'
import { rowLabelAdmin } from '@/fields/rowLabel'
import { sectionHeader } from '@/fields/sectionHeader'

export const AboutProofOfScale: Block = {
  slug: 'aboutProofOfScale',
  interfaceName: 'AboutProofOfScaleBlock',
  labels: { singular: 'About Proof of Scale', plural: 'About Proof of Scale' },
  fields: [
    ...sectionHeader(),
    statsArray({ name: 'stats', label: 'Metrics' }),
    {
      name: 'company',
      label: 'Companies We Work With',
      type: 'group',
      fields: [
        ...sectionHeader(),
        {
          name: 'items',
          label: 'Companies',
          type: 'array',
          admin: { ...rowLabelAdmin },
          fields: [
            { name: 'name', label: 'Name', type: 'text', admin: { width: '50%' } },
            { name: 'excerpt', label: 'Excerpt', type: 'text', admin: { description: 'Short supporting copy.' } },
            tagsArray({ name: 'stack', label: 'Stack' }),
          ],
        },
      ],
    },
  ],
}

export default AboutProofOfScale
