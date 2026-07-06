import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

export const AboutLeadership: Block = {
  slug: 'aboutLeadership',
  interfaceName: 'AboutLeadershipBlock',
  labels: { singular: 'About Leadership', plural: 'About Leadership' },
  fields: [
    ...sectionHeader(),
    {
      name: 'members',
      label: 'Members',
      type: 'array',
      admin: {
        description:
          'The leadership team members to feature, in order. "Wide" cards take the larger column; uncheck it for the narrow (three-quarters) column.',
      },
      fields: [
        {
          name: 'member',
          label: 'Member',
          type: 'relationship',
          relationTo: 'team',
          required: true,
          admin: { width: '70%' },
        },
        {
          name: 'wide',
          label: 'Wide',
          type: 'checkbox',
          defaultValue: false,
          admin: { width: '30%', description: 'On = wide column · Off = narrow column' },
        },
      ],
    },
  ],
}

export default AboutLeadership
