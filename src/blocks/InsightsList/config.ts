import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

/**
 * A simple insights listing: a section heading + description, then the signature insights bento
 * grid. Reuses the same card path as the stories archive's insights band (via the shared
 * `sections/stories/cards` module), so the grid renders identically — just without the archive's
 * filter bar and other content types.
 */
export const InsightsList: Block = {
  slug: 'insightsList',
  interfaceName: 'InsightsListBlock',
  labels: { singular: 'Insights List', plural: 'Insights Lists' },
  fields: [
    ...sectionHeader(),
    {
      name: 'items',
      label: 'Insights',
      type: 'relationship',
      relationTo: 'insight',
      hasMany: true,
      admin: {
        description: 'Insights shown in the grid, in order. Every fifth card widens to a two-column accent.',
      },
    },
  ],
}

export default InsightsList
