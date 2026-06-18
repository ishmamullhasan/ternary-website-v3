import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

export const StoriesArchive: Block = {
  slug: 'storiesArchive',
  interfaceName: 'StoriesArchiveBlock',
  labels: { singular: 'Stories Archive', plural: 'Stories Archives' },
  fields: [
    ...sectionHeader(),
    {
      name: 'items',
      label: 'Items',
      type: 'relationship',
      relationTo: ['story', 'insight'],
      hasMany: true,
      admin: {
        description: 'Stories and insights shown in the filterable grid.',
      },
    },
    {
      name: 'pressRelease',
      label: 'Press Release',
      type: 'relationship',
      relationTo: 'pressRelease',
      hasMany: true,
      admin: {
        description: 'Press releases shown at the bottom of the stories grid.',
      },
    },
  ],
}

export default StoriesArchive
