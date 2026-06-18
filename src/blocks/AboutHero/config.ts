import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

export const AboutHero: Block = {
  slug: 'aboutHero',
  interfaceName: 'AboutHeroBlock',
  labels: { singular: 'About Hero', plural: 'About Heroes' },
  fields: [...sectionHeader()],
}

export default AboutHero
