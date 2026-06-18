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
    },
    {
      name: 'followOptions',
      label: 'Follow Options',
      type: 'array',
      admin: { ...rowLabelAdmin },
      fields: [{ name: 'label', label: 'Label', type: 'text', required: true }],
    },
    {
      name: 'emailPlaceholder',
      label: 'Email Placeholder',
      type: 'text',
    },
    {
      name: 'buttonLabel',
      label: 'Button Label',
      type: 'text',
    },
    {
      name: 'disclaimer',
      label: 'Disclaimer',
      type: 'text',
    },
    {
      name: 'preview',
      label: 'Preview Panel',
      type: 'group',
      fields: [
        { name: 'issueLabel', label: 'Issue Label', type: 'text' },
        { name: 'heading', label: 'Heading', type: 'text' },
        {
          name: 'items',
          label: 'Items',
          type: 'array',
          admin: { ...rowLabelAdmin },
          fields: [{ name: 'text', label: 'Text', type: 'text', required: true }],
        },
        { name: 'subscribersLabel', label: 'Subscribers Label', type: 'text' },
        { name: 'readTimeLabel', label: 'Read Time Label', type: 'text' },
        imageField({ name: 'backgroundImage', label: 'Background Image' }),
      ],
    },
  ],
}

export default Subscribe
