import type { Block } from 'payload'

import { imageField } from '@/fields/image'
import { rowLabelAdmin } from '@/fields/rowLabel'
import { sectionHeader } from '@/fields/sectionHeader'

export const AboutFundingStory: Block = {
  slug: 'aboutFundingStory',
  interfaceName: 'AboutFundingStoryBlock',
  labels: { singular: 'About Funding Story', plural: 'About Funding Stories' },
  fields: [
    ...sectionHeader(),
    {
      name: 'eyebrow',
      label: 'Eyebrow',
      type: 'text',
      localized: true,
      admin: {
        description: "Small label above the headline, e.g. What's Next.",
      },
    },
    {
      name: 'links',
      label: 'Links',
      type: 'array',
      maxRows: 2,
      admin: {
        ...rowLabelAdmin,
        description: 'Up to two CTA buttons.',
      },
      fields: [
        {
          name: 'label',
          label: 'Label',
          type: 'text',
          localized: true,
          admin: { width: '40%' },
        },
        {
          name: 'url',
          label: 'URL',
          type: 'text',
          admin: { width: '40%' },
        },
        {
          name: 'style',
          label: 'Style',
          type: 'select',
          options: [
            { label: 'Primary (eggshell)', value: 'primary' },
            { label: 'Secondary (obsidian)', value: 'secondary' },
          ],
          defaultValue: 'primary',
          admin: { width: '20%' },
        },
      ],
    },
    imageField({
      name: 'backgroundImage',
      label: 'Background Image',
    }),
  ],
}

export default AboutFundingStory
