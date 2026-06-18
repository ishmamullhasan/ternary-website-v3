import type { Block } from 'payload'

import { statsArray } from '@/fields/arrays'

export const ContactStats: Block = {
  slug: 'contactStats',
  interfaceName: 'ContactStatsBlock',
  labels: { singular: 'Contact Stats', plural: 'Contact Stats' },
  fields: [
    {
      ...statsArray({ name: 'stats', label: 'Response-time Stats' }),
      admin: {
        ...statsArray({ name: 'stats', label: 'Response-time Stats' }).admin,
        description: 'Response-time cards shown below the hero.',
      },
    },
  ],
}

export default ContactStats
