import type { Block } from 'payload'

import { rowLabelAdmin } from '@/fields/rowLabel'
import { sectionHeader } from '@/fields/sectionHeader'

export const AboutProofOfScale: Block = {
  slug: 'aboutProofOfScale',
  interfaceName: 'AboutProofOfScaleBlock',
  labels: { singular: 'About Proof of Scale', plural: 'About Proof of Scale' },
  fields: [
    // The "Proof at Scale" stats panel was removed (WEB): this block now renders only the
    // "Companies We Work With" grid. Any legacy top-level heading/description/stats still stored
    // on existing docs is ignored by Payload on read and stripped on the next save.
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
            { name: 'name', label: 'Name', type: 'text', localized: true, admin: { width: '50%' } },
            {
              name: 'excerpt',
              label: 'Excerpt',
              type: 'text',
              localized: true,
              admin: { description: 'Short supporting copy.' },
            },
            { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}

export default AboutProofOfScale
