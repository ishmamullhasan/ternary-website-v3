import type { Block } from 'payload'

import { imageField } from '@/fields/image'
import { rowLabelAdmin } from '@/fields/rowLabel'
import { sectionHeader } from '@/fields/sectionHeader'

export const Subscribe: Block = {
  slug: 'subscribe',
  interfaceName: 'SubscribeBlock',
  labels: { singular: 'Subscribe', plural: 'Subscribes' },
  fields: [
    ...sectionHeader(),
    {
      name: 'followHint',
      label: 'Follow Hint',
      type: 'text',
      localized: true,
    },
    {
      name: 'followOptions',
      label: 'Follow Options',
      type: 'array',
      admin: { ...rowLabelAdmin },
      fields: [{ name: 'label', label: 'Label', type: 'text', required: true, localized: true }],
    },
    {
      name: 'emailPlaceholder',
      label: 'Email Placeholder',
      type: 'text',
      localized: true,
    },
    {
      name: 'buttonLabel',
      label: 'Button Label',
      type: 'text',
      localized: true,
    },
    {
      name: 'disclaimer',
      label: 'Disclaimer',
      type: 'text',
      localized: true,
    },
    {
      name: 'preview',
      label: 'Preview Panel',
      type: 'group',
      fields: [
        { name: 'issueLabel', label: 'Issue Label', type: 'text', localized: true },
        { name: 'heading', label: 'Heading', type: 'text', localized: true },
        {
          name: 'items',
          label: 'Items',
          type: 'array',
          admin: { ...rowLabelAdmin },
          fields: [{ name: 'text', label: 'Text', type: 'text', required: true, localized: true }],
        },
        { name: 'subscribersLabel', label: 'Subscribers Label', type: 'text', localized: true },
        { name: 'readTimeLabel', label: 'Read Time Label', type: 'text', localized: true },
        imageField({ name: 'backgroundImage', label: 'Background Image' }),
      ],
    },
  ],
}

export default Subscribe
