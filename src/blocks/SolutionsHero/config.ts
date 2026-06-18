import type { Block } from 'payload'

import { cardsArray } from '@/fields/arrays'
import { imageField } from '@/fields/image'
import { sectionHeader } from '@/fields/sectionHeader'

export const SolutionsHero: Block = {
  slug: 'solutionsHero',
  interfaceName: 'SolutionsHeroBlock',
  labels: { singular: 'Solutions Hero', plural: 'Solutions Heroes' },
  fields: [
    ...sectionHeader(),
    imageField({ name: 'backgroundImage', label: 'Background Image' }),
    cardsArray({
      name: 'cards',
      label: 'Hero cards',
    }),
  ],
}

export default SolutionsHero
