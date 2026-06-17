import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

/**
 * A heading + a grid of cards drawn from related content docs. Replaces the near-identical
 * industriesComp / scalesComp / engagementComp section components (which differed only in
 * collection, columns, and link target).
 */
export const RelationGrid: Block = {
  slug: 'relationGrid',
  interfaceName: 'RelationGridBlock',
  labels: { singular: 'Relation Grid', plural: 'Relation Grids' },
  fields: [
    ...sectionHeader(),
    {
      name: 'items',
      label: 'Items',
      type: 'relationship',
      relationTo: ['solution', 'industry', 'scale', 'model', 'capability'],
      hasMany: true,
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
    {
      name: 'hrefBase',
      label: 'Link base path',
      type: 'text',
      admin: { description: 'Optional. Cards link to {hrefBase}/{slug} — e.g. /industries.' },
    },
  ],
}
