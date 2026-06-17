import type { Block } from 'payload'

import { imageField } from '@/fields/image'
import { sectionHeader } from '@/fields/sectionHeader'

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
    ...sectionHeader(),
    imageField({ name: 'image', label: 'Hero Image' }),
  ],
}
