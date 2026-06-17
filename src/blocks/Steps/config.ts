import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

/** A heading + an ordered list of steps (process / interview-process sections). */
export const Steps: Block = {
  slug: 'steps',
  interfaceName: 'StepsBlock',
  labels: { singular: 'Steps', plural: 'Steps' },
  fields: [
    ...sectionHeader(),
    {
      name: 'steps',
      label: 'Steps',
      type: 'array',
      fields: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'duration', label: 'Duration', type: 'text', admin: { description: 'Optional, e.g. 30m, 1h' } },
      ],
    },
  ],
}
