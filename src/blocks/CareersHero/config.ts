import type { Block } from 'payload'

import { buttonsField } from '@/fields/buttons'
import { imageField } from '@/fields/image'
import { sectionHeader } from '@/fields/sectionHeader'

/** Careers page hero: heading + description, a side image panel, and a CTA button. */
export const CareersHero: Block = {
  slug: 'careersHero',
  interfaceName: 'CareersHeroBlock',
  labels: { singular: 'Careers Hero', plural: 'Careers Heroes' },
  fields: [
    ...sectionHeader(),
    imageField({ name: 'image', label: 'Hero image' }),
    buttonsField({ name: 'buttons', label: 'Buttons', max: 1 }),
  ],
}

export default CareersHero
