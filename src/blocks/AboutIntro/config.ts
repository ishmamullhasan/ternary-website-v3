import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

export const AboutIntro: Block = {
  slug: 'aboutIntro',
  interfaceName: 'AboutIntroBlock',
  labels: { singular: 'About Intro', plural: 'About Intros' },
  fields: [
    ...sectionHeader(),
    {
      name: 'content',
      label: 'Content',
      type: 'richText',
      localized: true,
      admin: { description: 'Long-form body copy shown beside the heading.' },
    },
  ],
}

export default AboutIntro
