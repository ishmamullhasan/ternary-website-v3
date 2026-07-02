import type { Block } from 'payload'

import { imageField } from '@/fields/image'
import { rowLabelAdmin } from '@/fields/rowLabel'
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
      name: 'images',
      label: 'Image tiles',
      type: 'array',
      maxRows: 8,
      admin: {
        ...rowLabelAdmin,
        description:
          'Home image grid (default mode): pick a media image per tile with an optional link. Up to 8 (4 per row × 2 rows). Falls back to the picked Industries below when empty.',
      },
      fields: [
        imageField({ name: 'image', label: 'Image', required: true }),
        {
          name: 'link',
          label: 'Link',
          type: 'text',
          admin: { description: 'Optional URL the tile links to (e.g. /industries/healthcare).' },
        },
      ],
    },
    {
      name: 'industries',
      label: 'Industries',
      type: 'relationship',
      relationTo: 'industry',
      hasMany: true,
      admin: {
        description:
          'Used for the full-width benefit grid (icon + title + excerpt). In the default image grid these are a fallback when no Image tiles are set — each tile shows the industry thumbnail and links to its page.',
      },
    },
    {
      name: 'fullWidth',
      label: 'Full-width grid (4 columns, no left gutter)',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Off (default): image grid — cards sit in columns 2–5 with an empty left gutter (home treatment). On: a flush 4-column benefit grid from the Industries above (industry-detail treatment).',
      },
    },
  ],
}
