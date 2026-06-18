import type { Block } from 'payload'

import { imageField } from '@/fields/image'
import { sectionHeader } from '@/fields/sectionHeader'

export const AboutFundingStory: Block = {
  slug: 'aboutFundingStory',
  interfaceName: 'AboutFundingStoryBlock',
  labels: { singular: 'About Funding Story', plural: 'About Funding Stories' },
  fields: [
    ...sectionHeader(),
    imageField({
      name: 'backgroundImage',
      label: 'Background Image',
    }),
  ],
}

export default AboutFundingStory
