import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

/**
 * Design-faithful block: renders the existing hand-built IndustryComp. The config captures
 * the same content the component needs; the rendering is the real designed component.
 */
export const IndustriesSection: Block = {
  slug: 'industriesSection',
  interfaceName: 'IndustriesSectionBlock',
  labels: { singular: 'Industries Section', plural: 'Industries Sections' },
  fields: [
    ...sectionHeader(),
    {
      name: 'industries',
      label: 'Industries',
      type: 'relationship',
      relationTo: 'industry',
      hasMany: true,
      admin: {
        description:
          'Industry records to feature, in display order. Each card shows the industry thumbnail, title and excerpt, and links to its page.',
      },
    },
    {
      name: 'fullWidth',
      label: 'Full-width grid (4 columns, no left gutter)',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Off (default): portrait cards in columns 2–5 with an empty left gutter (home treatment). On: a flush 4-column benefit grid (icon + title + excerpt, industry-detail treatment).',
      },
    },
  ],
}
