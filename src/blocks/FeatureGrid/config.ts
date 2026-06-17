import type { Block } from 'payload'

import { imageField } from '@/fields/image'
import { sectionHeader } from '@/fields/sectionHeader'

/** A heading + a responsive grid of feature cards (the careers item_N / bento sections). */
export const FeatureGrid: Block = {
  slug: 'featureGrid',
  interfaceName: 'FeatureGridBlock',
  labels: { singular: 'Feature Grid', plural: 'Feature Grids' },
  fields: [
    ...sectionHeader(),
    {
      name: 'items',
      label: 'Items',
      type: 'array',
      fields: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        imageField({ name: 'image', label: 'Image' }),
      ],
    },
    {
      name: 'columns',
      label: 'Columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
    },
  ],
}
