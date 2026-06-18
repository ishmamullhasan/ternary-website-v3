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
      type: 'relationship',
      relationTo: 'team',
      hasMany: true,
      admin: {
        description: 'The leadership team members to feature, in order. Managed in the Team collection.',
      },
    },
  ],
}

export default AboutLeadership
