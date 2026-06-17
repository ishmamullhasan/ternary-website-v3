import type { Block } from 'payload'

import { imageField } from '@/fields/image'

/** A heading + a row of organisation/partner logos (the home "organizations" section). */
export const Logos: Block = {
  slug: 'logos',
  interfaceName: 'LogosBlock',
  labels: { singular: 'Logos', plural: 'Logos' },
  fields: [
    { name: 'heading', label: 'Heading', type: 'text' },
    {
      name: 'logos',
      label: 'Logos',
      type: 'array',
      fields: [
        imageField({ name: 'icon', label: 'Icon' }),
        { name: 'name', label: 'Name', type: 'text' },
        { name: 'link', label: 'Link', type: 'text' },
      ],
    },
  ],
}
