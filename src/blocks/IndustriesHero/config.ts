import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

export const IndustriesHero: Block = {
  slug: 'industriesHero',
  interfaceName: 'IndustriesHeroBlock',
  labels: { singular: 'Industries Hero', plural: 'Industries Heroes' },
  fields: [...sectionHeader()],
}

export default IndustriesHero
