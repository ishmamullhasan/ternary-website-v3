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
    { name: 'industries', label: 'Industries', type: 'relationship', relationTo: 'industry', hasMany: true },
  ],
}
